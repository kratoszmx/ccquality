import {baseRow,parseBrowser} from './evidence.mjs';

// A page may load itself, same-origin static assets, and Claude Test's static
// rule files. No IP API, trace, DNS, helper, account, analytics, POST or fallback.
export function requestAllowed(source,{url,method,resourceType,isNavigation=false}) {
  let u;try{u=new URL(url);}catch{return false;}
  const target=new URL(source.url);
  if(method!=='GET'||u.protocol!=='https:'||u.origin!==target.origin||u.username||u.password)return false;
  if(resourceType==='document')return isNavigation&&u.pathname===target.pathname&&!u.search;
  if(/^\/(?:api|cdn-cgi|login|oauth)(?:\/|$)/i.test(u.pathname))return false;
  if(source.id==='claudetest'&&['/rules/context-v3.json','/rules/network-v5.json'].includes(u.pathname)&&!u.search)return true;
  return ['script','stylesheet','font','image'].includes(resourceType)&&
    /\.(?:[cm]?js|css|woff2?|ttf|otf|png|jpe?g|webp|gif|svg|ico)$/i.test(u.pathname);
}

export function detectionComplete(id,text) {
  if(id==='claudetest')return /本模块检测完成/.test(text);
  if(id==='aizx')return /已测\s*9\s*项/.test(text)&&/导出报告/.test(text);
  if(id==='fuckclaude')return /(?:Scan again|重新检测)/.test(text)&&/\n(?:Low risk|Medium risk|High risk|低风险|中风险|高风险)\n/.test(text);
  return false;
}

export async function collectPage(source,{page,signal,timeoutMs=15000}) {
  const started=performance.now();
  const blocked=[],failures=[];
  let text='',mainStatus=null,environment={},phase='navigation',timedOut=false,responses=0,completed=false;
  let closePromise;
  const close=()=>closePromise??=(async()=>{await page.close();})();
  const stop=()=>{close().catch(()=>{});};
  const timer=setTimeout(()=>{timedOut=true;stop();},timeoutMs);
  signal?.addEventListener('abort',stop,{once:true});
  let row;
  try {
    if(signal?.aborted)throw Error('cancelled');
    const throttled=new Set();let requestCount=0;
    page.on('popup',p=>p.close().catch(()=>{}));
    page.on('download',d=>d.cancel().catch(()=>{}));
    page.on('response',r=>{
      responses++;
      if(r.status()===429)throttled.add(new URL(r.url()).hostname);
      if(r.status()>=400&&failures.length<20)failures.push({status:r.status(),host:new URL(r.url()).hostname});
    });
    await page.route('**/*',route=>{
      const r=route.request(),u=new URL(r.url());
      const allowed=++requestCount<=180&&!signal?.aborted&&!throttled.has(u.hostname)&&requestAllowed(source,{
        url:r.url(),method:r.method(),resourceType:r.resourceType(),isNavigation:r.isNavigationRequest()&&r.frame()===page.mainFrame(),
      });
      if(!allowed&&blocked.length<60)blocked.push({host:u.hostname,path:u.pathname.slice(0,120),method:r.method()});
      return allowed?route.continue():route.abort();
    });
    const response=await page.goto(source.url,{waitUntil:'domcontentloaded',timeout:Math.min(timeoutMs,12000)});
    mainStatus=response?.status()??null;
    text=await page.locator('body').evaluate(el=>el.innerText.slice(0,24000),undefined,{timeout:2000});
    if(mainStatus<200||mainStatus>=300||/^(Just a moment|Access denied|Forbidden)/i.test(text.trim())){
      row=parseBrowser(source,text,{httpStatus:mainStatus});
    }else{
      phase='page_readiness';
      environment=await page.evaluate(()=>({language:navigator.language,languages:navigator.languages,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:Intl.DateTimeFormat().resolvedOptions().locale,webdriver:navigator.webdriver}));
      await page.waitForLoadState('load',{timeout:5000});
      // AIZX renders its button before React hydrates; don't click an inert SSR control.
      if(source.id==='aizx')await page.waitForTimeout(1500);
      if(source.id==='claudetest'){
        phase='local_only_settings';
        await page.locator('#rtc-consent').waitFor({state:'attached',timeout:4000});
        const panel=page.locator('details').filter({has:page.locator('#rtc-consent')});
        if(await panel.getAttribute('open')===null)await panel.locator('summary').click({timeout:2000});
        for(const id of ['ip','dual','split','rtc','intel','online-reputation','dns','system','trace']){
          phase=`local_only_setting_${id}`;
          await page.locator(`#${id}-consent`).uncheck({timeout:2000});
        }
      }
      phase='local_scan';
      const button=source.button.startsWith('#')?page.locator(source.button):page.getByRole('button',{name:source.button,exact:true});
      await button.click({timeout:3000});
      do{
        if(signal?.aborted)throw Error('cancelled');
        text=await page.locator('body').evaluate(el=>el.innerText.slice(0,24000),undefined,{timeout:2000});
        completed=detectionComplete(source.id,text);
        if(!completed)await page.waitForTimeout(150);
      }while(!completed);
      row=parseBrowser(source,text,{completed,httpStatus:mainStatus,environment});
    }
  }catch{
    row=text?parseBrowser(source,text,{completed:false,httpStatus:mainStatus,environment}):baseRow(source);
    row.status=signal?.aborted?'cancelled':timedOut?'timeout':'unavailable';
    row.errorCode=signal?.aborted?'cancelled':timedOut?'deadline':'browser_flow_failed';
    row.phase=phase;
  }finally{
    clearTimeout(timer);signal?.removeEventListener('abort',stop);
    try{await close();}catch{throw Error('browser_cleanup_failed');}
  }
  return {...row,durationMs:Math.round(performance.now()-started),responseCount:responses,blockedRequests:blocked,failedResponses:failures};
}
