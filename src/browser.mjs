import {isIP} from 'node:net';
import {launchChromeSession} from '@myutils/browser-session/chrome';
import {baseRow,parseBrowser,publicIPv4} from './evidence.mjs';

// Consumer policy: keep every website request on the owned proxy, and exclude
// local helpers, account operations, telemetry and non-HTTP transports.
export function requestAllowed({url,method}) {
  let u;try{u=new URL(url);}catch{return false;}
  if(!['http:','https:'].includes(u.protocol)||!['GET','HEAD'].includes(method)||u.username||u.password)return false;
  const host=u.hostname.replace(/^\[|\]$/g,'').toLowerCase();
  if(host==='localhost'||!host.includes('.')||/\.(localhost|local|internal|lan|onion)$/.test(host))return false;
  if(isIP(host) && !publicIPv4(host))return false;
  if(u.port&&!['80','443'].includes(u.port))return false;
  if(/(^|\.)(googletagmanager\.com|google-analytics\.com|clarity\.ms|51\.la|hm\.baidu\.com|cloudflareinsights\.com)$/.test(host))return false;
  if(/^(stats|analytics)\./.test(host))return false;
  if(/\/(?:login|logout|sign-in|oauth|organizations|conversations)(?:\/|$)/i.test(u.pathname))return false;
  return true;
}

// Native CleanIP anonymous bootstrap and read-only IP query. The page computes
// its own proof; no challenge/token/cookie value is exported or synthesized.
export function nativeLookupPostAllowed({sourceId,url,frameUrl,method,body,expectedIp,used}) {
  if(sourceId!=='cleanip'||method!=='POST'||!['https://cleanip.io/claude','https://cleanip.io/claude/'].includes(frameUrl)||typeof body!=='string'||body.length>8192||used.has(url))return false;
  let data;try{data=JSON.parse(body);}catch{return false;}
  if(!data||typeof data!=='object'||Array.isArray(data))return false;
  const keys=Object.keys(data).sort().join(',');
  if(url==='https://cleanip.io/api/v2/token'){
    return keys==='nonce,seed'&&typeof data.seed==='string'&&data.seed.length>0&&data.seed.length<=4096&&
      /^[a-zA-Z0-9._:+/=-]+$/.test(data.seed)&&['string','number'].includes(typeof data.nonce)&&/^[0-9]{1,30}$/.test(String(data.nonce));
  }
  if(url==='https://cleanip.io/api/v2/batch'){
    return keys==='ips,mode'&&publicIPv4(expectedIp)&&Array.isArray(data.ips)&&data.ips.length===1&&data.ips[0]===expectedIp&&
      typeof data.mode==='string'&&/^[a-z_-]{1,32}$/.test(data.mode);
  }
  return false;
}

export function detectionComplete(id,text) {
  if(id==='checkcc')return /\d+%\s*\n封号风险/.test(text)&&!/正在执行多维度检测|\n检测中\n/.test(text);
  if(id==='claudetest')return /已完成 5\s*\/\s*5/.test(text)||/检测完成|检查完成/.test(text);
  if(id==='cleanip')return /检测完成\s*\n/.test(text)&&/共 7 项检测/.test(text);
  if(id==='pingip')return /自动检测完成/.test(text);
  if(id==='aizx')return /已测\s*9\s*项/.test(text)&&/导出报告/.test(text);
  if(id==='ipbook')return /\d+\s*\n风险\/100/.test(text)&&!/检测中…|正在扫描/.test(text);
  return false;
}

export async function collectBrowser(source,{proxyServer,stateDir,signal,chromium,expectedIp,timeoutMs=60000,launch=launchChromeSession}) {
  let session,row,mainStatus=null,phase='startup';
  const blocked=[],failures=[];
  let responses=0;
  try {
    session=await launch(chromium,{stateDir,mode:'headless',chromePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',route:{mode:'proxy',server:proxyServer},lifetimeMs:timeoutMs+15000,signal});
    const stop=()=>{session.close().catch(()=>{});};
    signal?.addEventListener('abort',stop,{once:true});
    try {
      await session.context.addInitScript(()=>{
        for(const key of ['RTCPeerConnection','webkitRTCPeerConnection'])Object.defineProperty(globalThis,key,{value:undefined,writable:false,configurable:false});
        if(globalThis.ServiceWorkerContainer)Object.defineProperty(ServiceWorkerContainer.prototype,'register',{value:()=>Promise.reject(new Error('ccquality_read_only')),writable:false,configurable:false});
      });
      await session.context.routeWebSocket('**/*',socket=>socket.close());
      session.context.on('page',page=>{if(page!==session.page)page.close().catch(()=>{});});
      session.page.on('download',download=>download.cancel().catch(()=>{}));
      let requestCount=0;
      const throttled=new Set(),nativePosts=new Set();
      session.context.on('response',response=>{
        responses++;
        if(response.status()===429)throttled.add(new URL(response.url()).hostname);
        if(response.status()>=400 && failures.length<40)failures.push({host:new URL(response.url()).hostname,status:response.status()});
      });
      await session.context.route('**/*',async route=>{
        const req=route.request();let u;try{u=new URL(req.url());}catch{return route.abort();}
        let nativePost=false;
        if(req.method()==='POST'){
          let frameUrl='';try{frameUrl=req.frame().url();}catch{}
          nativePost=nativeLookupPostAllowed({sourceId:source.id,url:req.url(),frameUrl,method:req.method(),body:req.postData(),expectedIp,used:nativePosts});
        }
        const allowed=++requestCount<=500&&!signal?.aborted&&!throttled.has(u.hostname)&&(nativePost||requestAllowed({url:req.url(),method:req.method()}));
        if(!allowed){
          if(blocked.length<100)blocked.push({host:u.hostname,path:u.pathname.slice(0,200),method:req.method()});
          return route.abort();
        }
        if(nativePost)nativePosts.add(req.url());
        return route.continue();
      });
      const deadline=Date.now()+timeoutMs;
      phase='navigation';
      const response=await session.page.goto(source.url,{waitUntil:'domcontentloaded',timeout:25000});
      mainStatus=response?.status()??null;
      let text=await session.page.locator('body').evaluate(element=>element.innerText.slice(0,60000),undefined,{timeout:5000});
      const environment=await session.page.evaluate(()=>({language:navigator.language,languages:navigator.languages,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:Intl.DateTimeFormat().resolvedOptions().locale,webdriver:navigator.webdriver}));
      if(mainStatus>=400 || /^(Just a moment|Access denied|Forbidden)/i.test(text.trim())){
        row=parseBrowser(source,text,{httpStatus:mainStatus,blocked,environment});
      }else{
        phase='page_readiness';
        await session.page.waitForLoadState('load',{timeout:12000});
        await session.page.waitForTimeout(2500);
        if(source.id==='claudetest'){
          phase='detection_settings';
          const panel=session.page.locator('details').filter({has:session.page.locator('#rtc-consent')});
          if(await panel.count()===1 && !(await panel.getAttribute('open')))await panel.locator('summary').click({timeout:5000});
          for(const id of ['rtc-consent','dns-consent','system-consent','trace-consent'])await session.page.locator('#'+id).uncheck({timeout:5000});
        }
        for(const [index,name] of source.clicks.entries()){
          phase=`start_control_${index+1}`;
          await session.page.getByRole('button',{name,exact:true}).click({timeout:8000});
        }
        phase='result_readiness';
        let completed=false;
        do {
          if(signal?.aborted)throw Error('cancelled');
          text=await session.page.locator('body').evaluate(element=>element.innerText.slice(0,60000),undefined,{timeout:3000});
          completed=detectionComplete(source.id,text);
          if(completed||Date.now()>=deadline)break;
          await session.page.waitForTimeout(1000);
        }while(Date.now()<deadline);
        row=parseBrowser(source,text,{completed,httpStatus:mainStatus,blocked,environment});
      }
      row.responseCount=responses;row.failedResponses=failures;row.nativeLookupPosts=[...nativePosts].map(url=>new URL(url).pathname);
    }finally{signal?.removeEventListener('abort',stop);}
  }catch(error){
    if(/without confirmed cleanup|could not start or clean/.test(error?.message??''))throw Error('browser_cleanup_failed');
    row=baseRow(source);row.httpStatus=mainStatus;row.status=signal?.aborted?'cancelled':'unavailable';
    row.summary=signal?.aborted?'使用者中止；保留已完成來源':'瀏覽器流程未完成';
    row.errorCode=error?.name==='TimeoutError'?'browser_timeout':'browser_flow_failed';
    row.phase=phase;
    row.blockedRequests=blocked;row.failedResponses=failures;
  }finally{
    // Failure to close is a run-level failure, never a successful source.
    if(session){try{await session.close();}catch{throw Error('browser_cleanup_failed');}}
  }
  row.cleanupConfirmed=true;
  return row;
}
