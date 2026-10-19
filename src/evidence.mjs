import {isIP} from 'node:net';

export function publicIPv4(value) {
  if(typeof value!=='string'||isIP(value)!==4)return false;
  const [a,b,c]=value.split('.').map(Number);
  return !(a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||
    (a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||
    (a===192&&b===0&&[0,2].includes(c))||(a===192&&b===88&&c===99)||
    (a===198&&[18,19].includes(b))||(a===198&&b===51&&c===100)||(a===203&&b===0&&c===113));
}

const clean = (s,n=180) => typeof s==='string'?s.replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n):null;
const finite = (x,max=100) => typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=max?x:null;
export function baseRow(source) {
  return {id:source.id,name:source.name,url:source.url,scope:source.scope,
    observedAt:new Date().toISOString(),status:'unknown',score:null,scale:null,
    scoreDirection:null,summary:'未取得有效測量',facts:{},limitations:[],
    lineage:source.family??(source.id==='fuckclaude'?'fuckclaude':'independent-endpoint')};
}

export function parseHttp(source,response) {
  const row=baseRow(source);
  row.httpStatus=Number.isInteger(response?.status)?response.status:null;
  if(response?.status===429){row.status='rate_limited';row.summary='來源限制頻率；未重試';return row;}
  if(response?.challenge){row.status='blocked';row.summary='網站驗證／存取限制';return row;}
  if(!response?.ok || response.status<200 || response.status>=300){
    row.status=response?.status===403?'blocked':'unavailable';
    row.summary=row.httpStatus?`HTTP ${row.httpStatus}；不代表帳號封禁`:'連線未完成';return row;
  }
  const text=response.readableText??'';
  if(source.kind==='trace'){
    const fields=Object.fromEntries(text.split(/\r?\n/).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
    if(!publicIPv4(fields.ip)||!/^[A-Z]{2}$/.test(fields.loc??''))return row;
    row.status='measured';row.facts={ip:fields.ip,country:fields.loc,tls:clean(fields.tls),colo:clean(fields.colo)};
    row.summary=`${fields.loc}；TLS ${fields.tls??'未知'}`;return row;
  }
  if(source.id==='supported'){
    const list=text.split('You can access Claude in the following locations:')[1]?.split('Did this answer your question?')[0];
    if(!list || !list.includes('United States') || !list.includes('United Kingdom'))return row;
    const countries=list.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    row.status='measured';row.facts={countries,policyDate:clean(text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d{2}/)?.[0])};
    row.summary='已取得官方可用地區清單';
    row.limitations=['出口 IP 地區不能證明實際居住地、身份或付款資格'];return row;
  }
  let data;try{data=JSON.parse(text);}catch{return row;}
  if(!data||typeof data!=='object'||Array.isArray(data))return row;
  if(source.id==='ipify'){
    if(!publicIPv4(data.ip))return row;
    row.status='measured';row.facts={ip:data.ip};row.summary='已取得 IPv4 出口';
  }else if(source.id==='ipwhois'){
    if(data.success!==true||!publicIPv4(data.ip)||!/^[A-Z]{2}$/.test(data.country_code??''))return row;
    row.status='measured';row.facts={ip:data.ip,country:data.country_code,city:clean(data.city),asn:finite(data.connection?.asn,4294967295),org:clean(data.connection?.org),timezone:clean(data.timezone?.id)};
    row.summary=`${data.country_code}；AS${row.facts.asn??'?'}；${row.facts.org??'組織未知'}`;
    row.limitations=['免費接口未提供風險旗標時，不作無代理／無濫用判斷'];
  }else if(source.id==='ipapi'){
    if(!publicIPv4(data.ip))return row;
    const full=typeof data.asn==='object'&&data.asn;
    row.status='measured';row.facts={ip:data.ip,country:clean(data.location?.country_code??data.country),city:clean(data.location?.city??data.city),asn:full?finite(data.asn.asn,4294967295):clean(data.asn),company:clean(typeof data.company==='object'?data.company.name:data.company),timezone:clean(data.location?.timezone??data.timezone)};
    for(const key of ['is_vpn','is_proxy','is_tor','is_datacenter','is_abuser'])row.facts[key]=typeof data[key]==='boolean'?data[key]:null;
    row.summary=`${row.facts.country??'地區未知'}；${row.facts.company??'組織未知'}`;
    if(!full)row.limitations.push('匿名精簡回應；代理／VPN／濫用欄位未提供');
  }else if(source.id==='fuckclaude'){
    if(data.app!=='Fuck Claude'||data.estimate!==true||finite(data.score)===null||!['low','medium','high'].includes(data.band))return row;
    row.status='partial';row.score=data.score;row.scale='0–100';row.scoreDirection='lower';
    row.facts={country:clean(data.geo?.country),edgeTimezone:clean(data.geo?.timezone),band:data.band,measuredWeight:finite(data.coverage?.measuredWeight),totalWeight:finite(data.coverage?.totalWeight)};
    row.summary=`${data.score}/100；${data.band}；HTTP 推估`;
    row.limitations=['時區由出口推估，並非讀取本機；未測字體、Intl、WebRTC','未送出 Accept-Language；語言未知，不等於沒有中文特徵'];
  }else if(source.id==='amichina'){
    if(!['low','medium','high'].includes(data.risk)||!/^[A-Z]{2}$/.test(data.country??'')||typeof data.countryMainland!=='boolean')return row;
    row.status='partial';row.facts={country:data.country,risk:data.risk,countryMainland:data.countryMainland,primaryLanguage:clean(data.primaryLanguage)};
    row.summary=`${data.risk}；出口 ${data.country}`;
    row.limitations=['只衡量中國大陸地區／語言線索；非完整支援地區或封號判定','HTTP 未送語言；本機中文環境未被這次 HTTP 請求測到'];
  }
  return row;
}

export function parseBrowser(source,text,{completed=false,httpStatus=200,blocked=[],environment={}}={}) {
  const row=baseRow(source);row.httpStatus=httpStatus;
  row.facts={browser:environment};
  row.limitations=['全新無視窗 Chrome 的觀察不等於 Claude App','WebRTC 已禁用以保證 ATT-only；缺失不算通過'];
  if(environment.webdriver===true)row.limitations.push('自動化標記屬於測試 Chrome，不能歸因於 Claude App');
  row.blockedRequests=blocked;
  if(httpStatus===429){row.status='rate_limited';row.summary='HTTP 429；未重試';return row;}
  if(httpStatus===403 || /^(Just a moment|Access denied|Forbidden)/i.test(text.trim())){row.status='blocked';row.summary='網站拒絕或要求驗證';return row;}
  if(!Number.isInteger(httpStatus)||httpStatus<200||httpStatus>=300){row.status='unavailable';row.summary='主文件未取得有效 HTTP 回應';return row;}
  let score=null,label=null;
  if(source.id==='checkcc'){
    score=finite(Number(text.match(/(?:^|\n)(\d{1,3})%\s*\n封号风险/)?.[1]??NaN));
    label='網站風險指數';
    const edge=finite(Number(text.match(/边缘 ASN\s*\n(\d+)/)?.[1]??NaN),4294967295);
    const aggregate=finite(Number(text.match(/(?:^|\n)ASN\s*\nAS(\d+)/)?.[1]??NaN),4294967295);
    const clouds=edge!==null&&aggregate!==null&&edge!==aggregate;
    if(clouds)row.limitations.push(`來源衝突：邊緣 ASN ${edge} 與聚合 ASN ${aggregate} 不一致，不能據此認定 ATT 是機房`);
    row.facts.edgeAsn=edge;row.facts.aggregateAsn=aggregate;
    row.facts.sourceConflict=clouds;
  }else if(source.id==='claudetest'){
    score=finite(Number(text.match(/环境问题指数\s*\n0[–-]100\s*\n(\d{1,3})\s*\n\/\s*100/)?.[1]??NaN));
    label='環境問題指數';
    row.facts.coverage=finite(Number(text.match(/评分项覆盖\s*(\d+)%/)?.[1]??NaN));
    row.limitations.push('DNS 洩漏、本機助手與登入痕跡檢查未啟用');
  }else if(source.id==='pingip'){
    score=finite(Number(text.match(/(?:^|\n)(\d{1,3})\s*\n\/ 100\s*\nCLAUDE 环境安全度/i)?.[1]??NaN));
    label='環境安全度';row.scoreDirection='higher';
    row.facts.reportConfidence=finite(Number(text.match(/(\d+)%\s*\n报告可信度/)?.[1]??NaN));
    row.facts.abuseConfidence=finite(Number(text.match(/Abuse confidence (\d+)%/)?.[1]??NaN));
    row.limitations.push('網站的公開濫用值來自其聚合接口，不是本工具直接查 AbuseIPDB');
  }else if(source.id==='ipbook'){
    score=finite(Number(text.match(/(?:^|\n)(\d{1,3})\s*\n风险\/100/)?.[1]??NaN));label='風險參考值';
    row.facts.trustScore=finite(Number(text.match(/IP 信任评分\s*\n(\d{1,3})/)?.[1]??NaN));
    row.facts.browserReachability=/CLAUDE 可达性\s*\nclaude.ai\s*\n不可达/.test(text)?'reported_unreachable':'unknown';
    row.limitations.push('其「未檢測到 WebRTC 洩漏」不被採信；本輪 WebRTC 未測','六個情報源是該站自述，不能當六個獨立實測');
  }else if(source.id==='aizx'){
    score=finite(Number(text.match(/(?:^|\n)(\d{1,3})\s*(?:\n)?\/\s*100/)?.[1]??NaN));label='中文環境特徵';
    row.limitations.push('改編自 FuckClaude；不算獨立風險證據；未執行額外聯網檢測');
  }else if(source.id==='cleanip'){
    score=finite(Number(text.match(/(?:风险指数|风险评分|風險指數|风险分)\s*\n(\d{1,3})(?:\s|\/)/)?.[1]??NaN));label='網站風險指數';
    row.limitations.push('部分本機特徵方法來自 FuckClaude；不算完全獨立');
    row.limitations.push('僅允許本站原生一次匿名驗證和一次同出口情報查詢；未完成欄位保持未知','站內所稱「直連」探針在本輪同樣走 ATT，不能當實際直連出口');
    const section=text.split('03 · IP 环境')[1]?.split('04 · 泄露检测')[0]??'';
    row.facts.networkType=clean(section.match(/线路类型\s*\n([^\n]+)/)?.[1]);
    row.facts.asn=finite(Number(section.match(/ASN \/ 运营商\s*\nAS(\d+)/)?.[1]??NaN),4294967295);
    row.facts.vpn=/商业 VPN\s*\n未检测到 VPN/.test(section)?false:null;
    row.facts.proxy=/代理服务\s*\n未检测到代理/.test(section)?false:null;
    row.facts.abuse=clean(section.match(/IP 信誉\s*\n([^\n]+)/)?.[1]);
  }
  const ip=text.match(/(?:出口 IPv4|IPv4|PUBLIC IP ADDRESS)\s*\n(\d+\.\d+\.\d+\.\d+)/)?.[1];
  if(publicIPv4(ip))row.facts.ip=ip;
  row.score=score;row.scale=score===null?null:'0–100';
  if(score!==null){row.scoreDirection??='lower';row.status='partial';row.summary=`${score}/100；${label}${completed?'':'；尚未完成'}`;}
  else if(source.id==='cleanip'&&completed&&/美国 \(US\)/.test(text)&&/claude.ai 与 Anthropic API 走同一出口/.test(text)){
    row.status='partial';row.facts.country='US';row.summary=row.facts.networkType&&row.facts.asn?`US；${row.facts.networkType}；AS${row.facts.asn}；${row.facts.abuse??'信譽未知'}`:'US；Claude／API 探針同出口；無可驗證總分';
  }else {row.status=completed?'unknown':'incomplete';row.summary='頁面已讀取，未取得可驗證的完成分數';}
  row.completed=completed;
  if(!completed)row.limitations.push('期限內未確認檢測結束；顯示值可能仍在更新');
  row.evidenceText=text.slice(0,18000);
  return row;
}

export function evaluate(rows) {
  const signals=[];
  const ips=rows.filter(r=>['cloudflare','cloudflare_after','ipify','ipwhois','ipapi','claude_trace','api_trace'].includes(r.id)&&publicIPv4(r.facts?.ip)).map(r=>r.facts.ip);
  const unique=[...new Set(ips)];
  if(unique.length>1)signals.push({status:'conflict',text:'不同探針觀察到不同出口；各站分數不可視為同一 IP 的結果'});
  else if(ips.length>=2)signals.push({status:'observed',text:`${ips.length} 個 HTTP 觀察取得相同 IPv4 出口`});
  else signals.push({status:'unknown',text:'不足兩個有效出口觀察，無法交叉確認出口一致'});
  const countryRows=rows.filter(r=>['cloudflare','ipwhois','ipapi','fuckclaude','amichina'].includes(r.id)&&r.facts?.country);
  const countries=[...new Set(countryRows.map(r=>r.facts.country==='United States'?'US':r.facts.country))];
  if(countries.length>1)signals.push({status:'conflict',text:'地區來源不一致；逐來源保留，不表決消除差異'});
  else if(countries[0]==='US'){
    const official=rows.find(r=>r.id==='supported');
    signals.push({status:official?.facts?.countries?.includes('United States')?'observed':'unknown',text:official?.facts?.countries?.includes('United States')?'出口被識別為美國；美國在本次讀取的官方支援清單內':'出口被識別為美國；官方地區清單未驗證'});
  }
  for(const row of rows)if(row.facts?.sourceConflict)signals.push({status:'conflict',text:`${row.name} 的 ASN 情報互相衝突，該風險加分需複核`});
  if(rows.some(r=>r.facts?.browserReachability==='reported_unreachable')&&rows.some(r=>r.id==='claude_trace'&&r.status==='measured'))signals.push({status:'context',text:'IPBook 的網頁可達性探針與匿名 trace 結果不同；兩種方法均不代表 Claude App 的實際連線'});
  signals.push({status:'unknown',text:'Claude App 實際流量、帳號狀態、實際所在地、身份與付款資格均未測'});
  return {banProbability:null,accountStatus:'not_tested',appRoute:'not_tested',egressConsistent:ips.length>=2&&unique.length===1?true:unique.length>1?false:null,signals};
}

export function maskText(text) {
  return String(text).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,ip=>{const p=ip.split('.');return `${p[0]}.${p[1]}.*.*`;})
    .replace(/((?:Canvas|WebGL)\s*(?:指纹|指紋)?\s*[:：]?\s*)[0-9a-f]{8,64}\b/gi,'$1[masked]');
}

export function renderMarkdown(report) {
  const escape=s=>maskText(s??'—').replace(/[|]/g,'\\|').replace(/[\r\n]+/g,' ');
  const statuses={measured:'已測',partial:'部分',unknown:'未知',unavailable:'不可用',blocked:'被擋',rate_limited:'限流',incomplete:'未完成',cancelled:'已取消',not_run:'未執行'};
  const lines=[`# CCQuality ATT 檢測`, '', `時間：${report.observedAt}（UTC）；裝置：本機 macOS；路由：獨立 ATT；Claude App：未啟動。`, '',
    '本報告衡量網路與第三方環境線索，不提供封號機率。Chrome 樣本不代表 Claude App；WebRTC 未測。', '',
    '| 來源 | 狀態 | 實測結果 | 適用範圍與限制 |','| --- | --- | --- | --- |'];
  for(const row of report.rows)lines.push(`| [${escape(row.name)}](${row.url}) | ${statuses[row.status]??escape(row.status)} | ${escape(row.summary)}${row.score!==null?`；${row.scoreDirection==='higher'?'越高越好':'越低越好'}`:''} | ${escape([row.scope,...row.limitations].join('；'))} |`);
  lines.push('','## 綜合觀察','');
  for(const s of report.assessment.signals)lines.push(`- ${escape(s.text)}`);
  lines.push('',`清理：${report.cleanupConfirmed?'已確認自有瀏覽器與 ATT 通道結束':'尚未確認，請查看 JSON 狀態'}。`, '');
  return lines.join('\n');
}
