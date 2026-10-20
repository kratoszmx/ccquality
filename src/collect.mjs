import {startManagedProxy} from '../../../managers/network-manager/lib/managed-proxy.mjs';
import {launchChromeSession} from '@myutils/browser-session/chrome';
import {baseRow} from './evidence.mjs';
import {collectPage} from './browser.mjs';
import {APP_EVIDENCE,REFERENCES} from './app-evidence.mjs';

export async function collect({sources,stateDir,signal,onProgress=()=>{},startProxy=startManagedProxy,
  launch=launchChromeSession,scan=collectPage,chromium}={}) {
  const started=performance.now();
  const report={schemaVersion:3,observedAt:new Date().toISOString(),route:'isolated-managed-ATT',
    application:'Claude desktop on this Mac',appLaunched:false,accountAccessed:false,ipTests:false,
    browserMode:'fresh-native-headless-Chrome',rows:[],cleanupConfirmed:false,
    limits:{providerTimeoutMs:15000,parallelPages:3},banProbability:null,
    appEvidence:APP_EVIDENCE,references:REFERENCES};
  let proxy,cleanupProblem=false;
  try{
    if(signal?.aborted)throw Error('cancelled');
    proxy=await startProxy({route:'att',serveSeconds:180,signal});
    if(!/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(proxy.proxyServer)||+new URL(proxy.proxyServer).port>65535)throw Error('invalid_owned_proxy');
    // Separate native windows in headless mode avoid Chrome background-tab
    // timer throttling. Their owners and sites run concurrently on one ATT proxy.
    const runSource=async source=>{
      if(signal?.aborted)throw Error('cancelled');
      let session;
      try{
        session=await launch(chromium,{stateDir,mode:'headless',chromePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',route:{mode:'proxy',server:proxy.proxyServer},startupTimeoutMs:15000,lifetimeMs:45000,signal});
        await session.context.addInitScript(()=>{
          for(const key of ['RTCPeerConnection','webkitRTCPeerConnection'])Object.defineProperty(globalThis,key,{value:undefined,writable:false,configurable:false});
          if(globalThis.ServiceWorkerContainer)Object.defineProperty(ServiceWorkerContainer.prototype,'register',{value:()=>Promise.reject(new Error('ccquality_local_only')),writable:false,configurable:false});
        });
        await session.context.routeWebSocket('**/*',socket=>socket.close());
        await session.context.route('**/*',route=>route.abort());
        onProgress({id:source.id,stage:'start'});
        const row=await scan(source,{page:session.page,signal,timeoutMs:report.limits.providerTimeoutMs});
        onProgress({id:source.id,stage:'complete',status:row.status,durationMs:row.durationMs});
        return row;
      }finally{
        if(session){try{await session.close();}catch{throw Error('browser_cleanup_failed');}}
      }
    };
    // Start the next provider as soon as an owner closes, with at most three
    // live Chrome owners. A slow source cannot hold up a whole fixed batch.
    const results=new Array(sources.length);let next=0;
    const workers=await Promise.allSettled(Array.from({length:Math.min(report.limits.parallelPages,sources.length)},async()=>{
      while(next<sources.length){
        const index=next++;
        try{results[index]={status:'fulfilled',value:await runSource(sources[index])};}
        catch(reason){results[index]={status:'rejected',reason};}
      }
    }));
    if(workers.some(r=>r.status==='rejected'))throw Error('worker_failed');
    for(const [index,result] of results.entries()){
      if(result.status==='fulfilled')report.rows.push(result.value);
      else{
        const row=baseRow(sources[index]);row.status=signal?.aborted?'cancelled':'unavailable';
        report.rows.push(row);
        if(/without confirmed cleanup|could not start or clean|cleanup_failed/.test(result.reason?.message??''))cleanupProblem=true;
      }
    }
  }catch(error){
    cleanupProblem=/without confirmed cleanup|could not start or clean|cleanup_failed/.test(error?.message??'');
    report.error=signal?.aborted?'cancelled':'collection_failed';
  }finally{
    for(const source of sources)if(!report.rows.some(r=>r.id===source.id))report.rows.push({...baseRow(source),status:signal?.aborted?'cancelled':'not_run'});
    try{if(proxy)await proxy.close();}catch{cleanupProblem=true;}
    report.cleanupConfirmed=!cleanupProblem;
    if(cleanupProblem)report.error='cleanup_failed';
    if(signal?.aborted)report.error='cancelled';
  }
  report.finishedAt=new Date().toISOString();report.durationMs=Math.round(performance.now()-started);
  return report;
}
