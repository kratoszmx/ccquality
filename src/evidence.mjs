export const FEATURES=Object.freeze([
  ['regional','中文／區域綜合'],['timezone','系統時區'],['language','瀏覽器語言'],
  ['script','語言文字特徵'],['fonts','中文字體'],['vendorFonts','廠商／軟體字體'],['webview','瀏覽器／WebView'],
  ['device','裝置品牌'],['locale','Intl 區域'],['offset','時區偏移'],['emoji','Emoji 渲染'],
  ['platform','作業系統'],['automation','自動化標記'],['storage','本頁儲存能力'],
]);
const bounded=(s,n=240)=>String(s??'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').trim().slice(0,n);
const score=(value,max=100)=>Number.isInteger(value)&&value>=0&&value<=max?value:null;
const numeric=s=>s===undefined?null:score(Number(s));

export function baseRow(source){
  return {id:source.id,name:source.name,url:source.url,lineage:source.family,observedAt:new Date().toISOString(),
    method:source.method??'頁面規則',methodUrl:source.methodUrl??source.url,
    status:'unknown',completed:false,completionScope:'local',score:null,scoreScope:null,
    scoreDirection:'lower',features:{},limitations:[]};
}

function contribution(row,id,points,value,weight=null){
  points=score(points,weight??100);
  if(points===null||!bounded(value)||/(?:未知|未取得|未完成|等待|检测中|unknown|unavailable|pending)/i.test(value))return;
  row.features[id]={state:points===0?'pass':'issue',label:weight===null?(points===0?'通過':`命中 +${points}`):
    (points===0?`通過 0/${weight}`:`命中 ${points}/${weight}`),points,weight,value:bounded(value)};
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
    row.scoreScope='partial';
    const details=text.split('AUTOMATIC CHECK')[1]?.split('待完成的检测')[0]??'';
    const local=details.match(/中文与区域环境线索\s*\n(?:\+(\d+)\s*\n)?(异常|正常)\s*\n([^\n]+)/);
    if(local)row.features.regional={state:local[2]==='异常'?'issue':'pass',label:local[2]==='异常'?`命中 +${local[1]??'?'}`:'通過',value:bounded(local[3])};
    const storage=details.match(/本页登录环境基础能力\s*\n(正常|异常)\s*\n([^\n]+)/);
    if(storage)row.features.storage={state:storage[1]==='正常'?'pass':'issue',label:storage[1]==='正常'?'通過':'異常',value:bounded(storage[2])};
    row.limitations.push('只採用本機檢查；站內 IP、DNS、分流、WebRTC 與助手選項全部關閉。語言、時區、字體合併計分，不拆成獨立通過項。');
  }else if(source.id==='checkcc'){
    // Native total keeps changing while disabled network work is pending.
    // Only locally populated component rows are evidence; never use that total.
    const area=text.split('命中的检测信号')[1]?.split('DETECTION LOGIC')[0]??'';
    for(const [id,label] of [
      ['timezone','系统时区'],['language','浏览器语言'],['script','语言文字特征'],
      ['fonts','字体地区特征'],['vendorFonts','厂商字体异常'],['webview','浏览器地区特征'],
      ['device','设备地区特征'],['locale','Intl 区域设置'],['offset','时区偏移'],['emoji','Emoji 渲染风格'],
    ]){
      const block=area.split('\n'+label+'\n')[1]?.match(/^([^\n]+)\n\+(\d+)(?:\n|$)/);
      if(block)contribution(row,id,Number(block[2]),block[1]);
    }
    const platform=area.match(/\n操作系统\n([^\n]+)\n\+\d+/)?.[1];
    if(platform&&!/等待|未知/.test(platform))row.features.platform={state:'info',label:bounded(platform),value:bounded(platform)};
  }else if(source.id==='cleanip'){
    const area=text.split('07 · 本地系统')[1]?.split('Claude Code 请在运行它的机器上自查')[0]??'';
    const components=area.split('中国大陆环境特征')[1]??'';
    row.score=numeric(components.match(/^\s*(\d{1,3})\/100/)?.[1]);
    row.scoreLabel='中國大陸環境特徵（本機）';row.scoreScope='local';
    for(const [id,label,weight] of [
      ['timezone','系统时区',30],['language','浏览器语言',22],['fonts','中文字体',14],
      ['vendorFonts','国产厂商字体',12],['webview','国产浏览器',10],['device','国产设备品牌',6],['locale','Intl 区域设置',6],
    ]){
      const match=components.split('\n'+label+'\n')[1]?.match(/^(\d+)\/(\d+)(?:\n|$)/);
      if(match&&Number(match[2])===weight)contribution(row,id,Number(match[1]),`原站本機項 ${match[1]}/${match[2]}`,weight);
    }
    const auto=area.match(/\n自动化\n([^\n]+)\n(异常|正常)(?:\n|$)/);
    if(auto)row.features.automation={state:auto[2]==='异常'?'issue':'pass',label:auto[2]==='异常'?'命中':'通過',value:bounded(auto[1])};
    const platform=area.match(/\n平台 \/ 浏览器\n([^\n]+)/)?.[1];
    if(platform)row.features.platform={state:'info',label:bounded(platform.split(' / ')[0]),value:bounded(platform)};
  }else if(source.id==='pingip'){
    const area=text.split('FULL INSPECTION')[1]?.split('LOCAL COMPARISON')[0]??'';
    for(const [id,label] of [['timezone','浏览器时区与 UTC offset'],['language','浏览器语言']]){
      const match=area.match(new RegExp(`(?:^|\\n)(正常|建议优化|严重风险)\\n${label}\\n([^\\n]+)\\n([^\\n]+)\\nPING IP 技术判断`));
      if(match&&!/未知|未完成|获取失败/.test(match[3]))row.features[id]={state:match[1]==='正常'?'pass':'issue',label:match[1]==='正常'?'通過':'命中',value:bounded(match[3])};
    }
  }else if(source.id==='amichina'){
    row.score=numeric(text.match(/即时审计\s*\n本地\s*\n(\d{1,3})\s*\n\/100/)?.[1]);
    row.scoreLabel='環境信號分數';row.scoreScope='local';
    const area=text.split('九项公开信号')[1]?.split('本地保存')[0]??'';
    for(const [id,label,weight] of [
      ['timezone','系统时区',26],['language','浏览器语言',20],['fonts','常见中文字体',16],
      ['vendorFonts','厂商中文字体',10],['webview','浏览器或 WebView',8],['device','设备品牌',6],
      ['locale','Intl 区域设置',6],['offset','UTC+8 偏移',4],['emoji','系统与表情代理',4],
    ]){
      const block=area.split('\n'+label+'\n')[1]?.split(/\n\d{2}\n/)[0]??'';
      const match=block.match(/检测依据\n([^\n]+)\n+(未发现|匹配)\n(\d+) \/ (\d+)\n得分/);
      if(match&&Number(match[4])===weight&&((match[2]==='匹配')===(Number(match[3])>0)))
        contribution(row,id,Number(match[3]),match[1],weight);
    }
  }else if(['aizx','fuckclaude'].includes(source.id)){
    row.score=numeric(text.match(/(?:^|\n)(\d{1,3})\s*(?:\n)?\/\s*100/)?.[1]);
    row.scoreLabel='區域特徵指數';
    row.scoreScope=source.id==='aizx'?'local':'partial';
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
      if(points!==null)contribution(row,id,points,value,weight);
    }
    row.limitations.push(source.id==='aizx'?'改編自 FuckClaude，兩者不是獨立證據；未執行額外聯網檢測。':'原站把停用 WebRTC 誤列為未洩漏；本工具不採用該項。總分保留原站值，不是完整測量或封號機率。');
  }
  const expected={claudetest:2,checkcc:11,cleanip:9,pingip:2,aizx:9,fuckclaude:9,amichina:9}[source.id];
  if(!Object.keys(row.features).length)row.score=null;
  row.status=Object.keys(row.features).length===expected?'measured':Object.keys(row.features).length?'partial':'unknown';
  return row;
}

export function maskText(value){
  return bounded(value,2000).replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP omitted]')
    .replace(/((?:Canvas|WebGL)\s*(?:指纹|指紋)?\s*[:：]?\s*)[0-9a-f]{8,64}\b/gi,'$1[masked]');
}
