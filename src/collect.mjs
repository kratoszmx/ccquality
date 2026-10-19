import {fetchTextUrl} from '@myutils/web-text/http-text';
import {startManagedProxy} from '../../../managers/network-manager/lib/managed-proxy.mjs';
import {baseRow,parseHttp,evaluate} from './evidence.mjs';
import {collectBrowser} from './browser.mjs';

export async function collect({sources,stateDir,signal,onProgress=()=>{},
  startProxy=startManagedProxy,fetch=fetchTextUrl,browser=collectBrowser,chromium}={}) {
  const report={schemaVersion:1,observedAt:new Date().toISOString(),route:'isolated-managed-ATT',
    application:'Claude desktop on this Mac',appLaunched:false,accountAccessed:false,
    browserMode:'fresh-native-headless-Chrome',webrtc:'disabled_not_measured',rows:[],cleanupConfirmed:false};
  let proxy,cleanupProblem=false;
  try {
    proxy=await startProxy({route:'att',serveSeconds:1200,signal});
    if(!/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(proxy.proxyServer)||+new URL(proxy.proxyServer).port>65535)throw Error('invalid_owned_proxy');
    for(const source of sources){
      if(signal?.aborted)break;
      onProgress({id:source.id,stage:'start'});
      let row;
      if(source.kind==='browser'){
        const expectedIp=report.rows.find(r=>r.id==='cloudflare'&&r.status==='measured')?.facts?.ip;
        row=await browser(source,{proxyServer:proxy.proxyServer,stateDir,signal,chromium,expectedIp});
      }else{
        try{
          const response=await fetch({url:source.url,proxyServer:proxy.proxyServer,publicDocumentRecovery:false,
            timeoutMs:25000,maxChars:60000,maxResponseBytes:1048576});
          row=parseHttp(source,response);
        }catch(error){
          row=baseRow(source);row.status='unavailable';row.summary='HTTP 連線或資料處理失敗；未換出口、未重試';
          row.errorCode=error?.name==='AbortError'?'cancelled':'http_failed';
        }
      }
      report.rows.push(row);
      onProgress({id:source.id,stage:'complete',status:row.status,summary:row.summary});
    }
    const anchor=sources.find(source=>source.id==='cloudflare');
    if(anchor&&!signal?.aborted){
      const endSource={...anchor,id:'cloudflare_after',name:'Cloudflare 結束出口'};
      try{
        const response=await fetch({url:anchor.url,proxyServer:proxy.proxyServer,publicDocumentRecovery:false,timeoutMs:25000,maxChars:60000,maxResponseBytes:1048576});
        report.rows.push(parseHttp(endSource,response));
      }catch{const row=baseRow(endSource);row.status='unavailable';row.summary='結束出口未取得；期間穩定性未知';report.rows.push(row);}
    }
  }catch(error){
    cleanupProblem=['browser_cleanup_failed','att_cleanup_failed'].includes(error?.message);
    report.error=signal?.aborted?'cancelled':'collection_failed';
  }finally{
    for(const source of sources)if(!report.rows.some(r=>r.id===source.id)){
      const row=baseRow(source);row.status=signal?.aborted?'cancelled':'not_run';
      row.summary=signal?.aborted?'中止後未執行':'前序流程失敗，未執行';report.rows.push(row);
    }
    try{if(proxy)await proxy.close();report.cleanupConfirmed=!cleanupProblem;}
    catch{report.cleanupConfirmed=false;report.error='cleanup_failed';}
  }
  report.finishedAt=new Date().toISOString();report.assessment=evaluate(report.rows);
  return report;
}
