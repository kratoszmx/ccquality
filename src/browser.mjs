import {baseRow,challenged,parseBrowser} from './evidence.mjs';

const STATIC_TYPES=new Set(['script','stylesheet','font','image']);
const STATIC_FILE=/\.(?:[cm]?js|css|woff2?|ttf|otf|png|jpe?g|webp|gif|svg|ico)$/i;
// API, edge diagnostics, account and hosting-analytics paths stay closed on the page origin.
const DENIED_PATH=/^\/(?:api|cdn-cgi|login|oauth|_vercel)(?:\/|$)/i;
const staticAsset=(u,resourceType)=>STATIC_TYPES.has(resourceType)&&STATIC_FILE.test(u.pathname);

// A page may load itself, same-origin static assets and the exact static
// exceptions its provider declares (asset directories on a dedicated CDN, rule
// files). No IP API, trace, DNS, helper, account, analytics, POST or fallback.
export function requestAllowed(source,{url,method,resourceType,isNavigation=false}) {
  let u;try{u=new URL(url);}catch{return false;}
  if(method!=='GET'||u.protocol!=='https:'||u.username||u.password)return false;
  const target=new URL(source.url);
  if(u.origin!==target.origin){
    const directories=Object.hasOwn(source.assetOrigins??{},u.origin)?source.assetOrigins[u.origin]:null;
    return Boolean(directories?.test(u.pathname))&&!u.search&&staticAsset(u,resourceType);
  }
  if(resourceType==='document')return isNavigation&&u.pathname===target.pathname&&!u.search;
  if(DENIED_PATH.test(u.pathname))return false;
  if(!u.search&&source.staticFiles?.includes(u.pathname))return true;
  return staticAsset(u,resourceType);
}

const readBody=page=>page.locator('body').evaluate(el=>el.innerText.slice(0,24000),undefined,{timeout:2000});

// Playwright routes only the first URL of a server redirect. Inspect the
// response before Chrome follows it; keep transport in the native ATT browser.
// The owned page closes this CDP session along with its pending commands.
export async function blockRedirects(page,onBlocked,onFailure){
  const cdp=await page.context().newCDPSession(page);
  cdp.on('Fetch.requestPaused',event=>{
    const redirect=event.responseStatusCode>=300&&event.responseStatusCode<400&&event.responseStatusCode!==304;
    void (async()=>{
      if(redirect)onBlocked(event);
      await cdp.send(redirect?'Fetch.failRequest':'Fetch.continueRequest',redirect?
        {requestId:event.requestId,errorReason:'BlockedByClient'}:{requestId:event.requestId});
    })().catch(()=>{if(!page.isClosed())onFailure();});
  });
  await cdp.send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Response'}]});
}

export async function collectPage(source,{page,signal,timeoutMs=15000}) {
  const started=performance.now();
  const blocked=[],failures=[];
  let text='',mainStatus=null,environment={},phase='navigation',timedOut=false,responses=0,completed=false,guardFailed=false;
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
    phase='response_guard';
    await blockRedirects(page,event=>{
      const u=new URL(event.request.url);
      if(blocked.length<60)blocked.push({host:u.hostname,path:u.pathname.slice(0,120),method:event.request.method,
        status:event.responseStatusCode,reason:'redirect_denied'});
    },()=>{guardFailed=true;stop();});
    phase='navigation';
    const response=await page.goto(source.url,{waitUntil:'domcontentloaded',timeout:Math.min(timeoutMs,12000)});
    mainStatus=response?.status()??null;
    text=await readBody(page);
    if(mainStatus<200||mainStatus>=300||challenged(text)){
      row=parseBrowser(source,text,{httpStatus:mainStatus});
    }else{
      phase='page_readiness';
      environment=await page.evaluate(()=>({language:navigator.language,languages:navigator.languages,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,locale:Intl.DateTimeFormat().resolvedOptions().locale,webdriver:navigator.webdriver}));
      await page.waitForLoadState('load',{timeout:5000});
      // Some sites render controls before the corresponding client hydrates.
      if(source.hydrateMs)await page.waitForTimeout(source.hydrateMs);
      phase='local_scan';
      const click=()=>source.button&&(source.button.startsWith('#')?page.locator(source.button):
        page.getByRole('button',{name:source.button,exact:source.buttonExact??true})).click({timeout:3000});
      await (source.start?source.start(page,{click,setPhase:value=>{phase=value;}}):click());
      do{
        if(signal?.aborted)throw Error('cancelled');
        text=await readBody(page);
        completed=source.complete(text);
        if(!completed)await page.waitForTimeout(150);
      }while(!completed);
      row=parseBrowser(source,text,{completed,httpStatus:mainStatus,environment});
    }
  }catch{
    row=text?parseBrowser(source,text,{completed:false,httpStatus:mainStatus,environment}):baseRow(source);
    row.status=signal?.aborted?'cancelled':timedOut?'timeout':'unavailable';
    row.errorCode=signal?.aborted?'cancelled':timedOut?'deadline':guardFailed?'response_guard_failed':'browser_flow_failed';
    row.phase=phase;
  }finally{
    clearTimeout(timer);signal?.removeEventListener('abort',stop);
    try{await close();}catch{throw Error('browser_cleanup_failed');}
  }
  return {...row,durationMs:Math.round(performance.now()-started),responseCount:responses,blockedRequests:blocked,failedResponses:failures};
}
