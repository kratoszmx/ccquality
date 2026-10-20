// Report row order. Providers fill only the rows their native page measures.
export const FEATURES=Object.freeze([
  ['regional','中文／區域綜合'],['timezone','系統時區'],['language','瀏覽器語言'],
  ['script','語言文字特徵'],['fonts','中文字體'],['vendorFonts','廠商／軟體字體'],['webview','瀏覽器／WebView'],
  ['device','裝置品牌'],['locale','Intl 區域'],['offset','時區偏移'],['emoji','Emoji 渲染'],
  ['platform','作業系統'],['automation','自動化標記'],['storage','本頁儲存能力'],
]);
export const bounded=(s,n=240)=>String(s??'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').trim().slice(0,n);
export const score=(value,max=100)=>Number.isInteger(value)&&value>=0&&value<=max?value:null;
export const numeric=s=>s===undefined?null:score(Number(s));
export const challenged=text=>/^(Just a moment|Access denied|Forbidden)/i.test(String(text).trim());

export function baseRow(source){
  return {id:source.id,name:source.name,url:source.url,lineage:source.family,observedAt:new Date().toISOString(),
    method:source.method??'頁面規則',methodUrl:source.methodUrl??source.url,
    status:'unknown',completed:false,completionScope:'local',score:null,scoreScope:null,
    scoreDirection:'lower',features:{},limitations:[]};
}

// One native component: zero is a pass, positive points are a hit. A value
// that is unknown/pending, or points outside the declared weight, stay absent.
export function contribution(row,id,points,value,weight=null){
  points=score(points,weight??100);
  if(points===null||!bounded(value)||/(?:未知|未取得|未完成|等待|检测中|unknown|unavailable|pending)/i.test(value))return;
  row.features[id]={state:points===0?'pass':'issue',label:weight===null?(points===0?'通過':`命中 +${points}`):
    (points===0?`通過 0/${weight}`:`命中 ${points}/${weight}`),points,weight,value:bounded(value)};
}

export function parseBrowser(source,text,{completed=false,httpStatus=200,environment={}}={}){
  const row=baseRow(source);row.httpStatus=httpStatus;row.environment=environment;row.completed=completed;
  row.evidenceText=String(text).slice(0,24000);
  if(httpStatus===429){row.status='rate_limited';return row;}
  if(httpStatus===403||challenged(text)){row.status='blocked';return row;}
  if(!Number.isInteger(httpStatus)||httpStatus<200||httpStatus>=300){row.status='unavailable';return row;}
  // A homepage's zero, transient score, missing result or timeout is never PASS.
  if(!completed){row.status='incomplete';return row;}
  if(source.index)Object.assign(row,{scoreLabel:source.index.label,scoreScope:source.index.scope});
  source.parse(row,String(text));
  row.limitations.push(...source.limitations??[]);
  const count=Object.keys(row.features).length;
  if(!count)row.score=null;
  row.status=count===source.expected?'measured':count?'partial':'unknown';
  return row;
}

export function maskText(value){
  return bounded(value,2000).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP omitted]')
    .replace(/((?:Canvas|WebGL)\s*(?:指纹|指紋)?\s*[:：]?\s*)[0-9a-f]{8,64}\b/gi,'$1[masked]');
}
