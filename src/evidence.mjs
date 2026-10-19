export const FEATURES=Object.freeze([
  ['regional','中文／區域綜合'],['timezone','系統時區'],['language','瀏覽器語言'],
  ['fonts','中文字體'],['vendorFonts','廠商／軟體字體'],['webview','瀏覽器／WebView'],
  ['device','裝置品牌'],['locale','Intl 區域'],['offset','時區偏移'],['emoji','Emoji 渲染'],
  ['storage','本頁儲存能力'],
]);
const bounded=(s,n=240)=>String(s??'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').trim().slice(0,n);
const score=(value,max=100)=>Number.isInteger(value)&&value>=0&&value<=max?value:null;
const numeric=s=>s===undefined?null:score(Number(s));

export function baseRow(source){
  return {id:source.id,name:source.name,url:source.url,lineage:source.family,observedAt:new Date().toISOString(),
    status:'unknown',completed:false,score:null,scoreDirection:'lower',features:{},limitations:[]};
}

export function parseBrowser(source,text,{completed=false,httpStatus=200,environment={}}={}){
  const row=baseRow(source);row.httpStatus=httpStatus;row.environment=environment;row.completed=completed;
  row.evidenceText=String(text).slice(0,24000);
  if(httpStatus===429){row.status='rate_limited';return row;}
  if(httpStatus===403||/^(Just a moment|Access denied|Forbidden)/i.test(text.trim())){row.status='blocked';return row;}
  if(!Number.isInteger(httpStatus)||httpStatus<200||httpStatus>=300){row.status='unavailable';return row;}
  // A homepage's zero, transient score, missing result or timeout is never PASS.
  if(!completed){row.status='incomplete';return row;}
  if(source.id==='claudetest'){
    row.score=numeric(text.match(/环境问题指数\s*\n0[–-]100\s*\n(\d{1,3})\s*\n\/\s*100/)?.[1]);
    row.scoreLabel='環境問題指數';
    const details=text.split('AUTOMATIC CHECK')[1]?.split('待完成的检测')[0]??'';
    const local=details.match(/中文与区域环境线索\s*\n(?:\+(\d+)\s*\n)?(异常|正常)\s*\n([^\n]+)/);
    if(local)row.features.regional={state:local[2]==='异常'?'issue':'pass',label:local[2]==='异常'?`命中 +${local[1]??'?'}`:'通過',value:bounded(local[3])};
    const storage=details.match(/本页登录环境基础能力\s*\n(正常|异常)\s*\n([^\n]+)/);
    if(storage)row.features.storage={state:storage[1]==='正常'?'pass':'issue',label:storage[1]==='正常'?'通過':'異常',value:bounded(storage[2])};
    row.limitations.push('只採用本機檢查；站內 IP、DNS、分流、WebRTC 與助手選項全部關閉。語言、時區、字體合併計分，不拆成獨立通過項。');
  }else{
    row.score=numeric(text.match(/(?:^|\n)(\d{1,3})\s*(?:\n)?\/\s*100/)?.[1]);
    row.scoreLabel='區域特徵指數';
    const labels=source.id==='aizx'?[
      ['timezone','系统时区',26],['language','浏览器语言',20],['fonts','中文字体',16],['vendorFonts','厂商与软件字体',10],
      ['webview','国产浏览器 / WebView',8],['device','设备品牌线索',6],['locale','Intl 区域设置',6],['offset','时区偏移',4],['emoji','Emoji 渲染',4],
    ]:[
      ['timezone','System timezone',24],['language','Browser language',18],['fonts','Installed Chinese fonts',14],['vendorFonts','Chinese vendor fonts',10],
      ['webview','Chinese browser / WebView',8],['device','Chinese-brand device',6],['locale','Intl locale',4],['offset','Timezone offset',3],['emoji','Emoji rendering style',3],
    ];
    const area=source.id==='aizx'?(text.split('导出报告')[1]?.split('WebRTC 与网络出口检查')[0]??''):
      (text.split('What gets scanned')[1]?.split('How the check works')[0]??'');
    for(const [id,label,weight] of labels){
      const marker='\n'+label+'\n',position=('\n'+area).indexOf(marker);
      if(position<0)continue;
      const after=('\n'+area).slice(position+marker.length);
      let points=null,value='';
      if(source.id==='aizx'){
        const match=after.match(/^(\d+)\s*\/\s*(\d+)\n([^]*?)(?=\n(?:系统时区|浏览器语言|中文字体|厂商与软件字体|国产浏览器 \/ WebView|设备品牌线索|Intl 区域设置|时区偏移|Emoji 渲染)\n|$)/);
        if(match&&Number(match[2])===weight){points=score(Number(match[1]),weight);value=match[3].trim().split(/\n+/).at(-1);}
      }else{
        // Stop at the next feature; a missing value must not borrow its score.
        const block=after.split(/\n(?:System timezone|Browser language|Installed Chinese fonts|Chinese vendor fonts|WebRTC IP leak|Chinese browser \/ WebView|Chinese-brand device|Intl locale|Timezone offset|Emoji rendering style)\n/)[0];
        const match=block.match(/^Weight (\d+)\n[^]*?\n([^\n]+)\n\+(\d+)(?:\n|$)/);
        if(match&&Number(match[1])===weight){points=score(Number(match[3]),weight);value=match[2];}
      }
      if(points!==null&&bounded(value)&&!/(?:未知|未取得|未完成|等待|检测中|unknown|unavailable|pending)/i.test(value))
        row.features[id]={state:points===0?'pass':'issue',label:points===0?`通過 0/${weight}`:`命中 ${points}/${weight}`,points,weight,value:bounded(value)};
    }
    row.limitations.push(source.id==='aizx'?'改編自 FuckClaude，兩者不是獨立證據；未執行額外聯網檢測。':'原站把停用 WebRTC 誤列為未洩漏；本工具不採用該項。總分保留原站值，不是完整測量或封號機率。');
  }
  const expected=source.id==='claudetest'?2:9;
  row.status=Object.keys(row.features).length===expected?'measured':Object.keys(row.features).length?'partial':'unknown';
  return row;
}

export function maskText(value){
  return bounded(value,2000).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP omitted]')
    .replace(/((?:Canvas|WebGL)\s*(?:指纹|指紋)?\s*[:：]?\s*)[0-9a-f]{8,64}\b/gi,'$1[masked]');
}
