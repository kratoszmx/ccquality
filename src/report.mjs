import {FEATURES,maskText} from './evidence.mjs';
import {APP_EVIDENCE,REFERENCES} from './app-evidence.mjs';

const statuses={measured:'本機項完成',partial:'部分結果',unknown:'未知',incomplete:'未完成',timeout:'逾時',unavailable:'不可用',blocked:'被擋',rate_limited:'限流',cancelled:'已取消',not_run:'未執行'};
const unknown={state:'unknown',label:'—'};
const cell=(label,state='info',value='',link)=>({label:maskText(label),state,value:maskText(value),link});
export function matrix(report){
  const app=report.appEvidence??APP_EVIDENCE;
  const rows=[
    {label:'採集狀態',cells:report.rows.map(r=>cell(statuses[r.status]??'未知',r.status==='measured'?'info':'unknown'))},
    {label:'評分依據',app:{label:'第三方規則'},cells:report.rows.map(r=>cell(r.method??'頁面規則','info',r.lineage,r.methodUrl))},
    {label:'網站指數 ↓',app:app.score,cells:report.rows.map(r=>r.score===null?unknown:cell(`${r.scoreScope==='local'?'本機':'局部'} ${r.score}/100`,'info',r.scoreLabel))},
    ...FEATURES.map(([id,label])=>({label,app:app[id],cells:report.rows.map(r=>r.features[id]??unknown)})),
    {label:'採集耗時',cells:report.rows.map(r=>Number.isFinite(r.durationMs)?cell(`${(r.durationMs/1000).toFixed(1)} 秒`):unknown)},
  ];
  if(report.error||report.cleanupConfirmed===false)
    rows.push({label:'執行錯誤',app:{label:report.error??'cleanup_failed'},cells:report.rows.map(()=>cell('需檢查','issue'))});
  return rows;
}
function metadata(report){
  const time=new Date(report.observedAt).toLocaleString('zh-TW',{timeZone:'America/Los_Angeles',hour12:false});
  return `${time} America/Los_Angeles · ATT · ${report.rows.length} 個來源 · ${(report.durationMs/1000).toFixed(1)} 秒`;
}
const md=s=>maskText(s).replace(/[|]/g,'\\|').replace(/[<>]/g,'');
const safeLink=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:undefined;}catch{return undefined;}};
export function renderMarkdown(report){
  const icon={pass:'🟢 ',issue:'🔴 ',unknown:'',info:''};
  const refs=report.references??REFERENCES;
  return ['# CCQuality','',metadata(report),'',
    '| 檢測項 | 對 Claude App 的參考性 | '+report.rows.map(r=>`[${md(r.name)}](${safeLink(r.url)??''})`).join(' | ')+' |',
    '| --- | --- | '+report.rows.map(()=>'---').join(' | ')+' |',
    ...matrix(report).map(r=>{
      const reference=safeLink(refs[r.app?.refs?.[0]]?.url);
      const relevance=r.app?.label?(reference?`[${md(r.app.label)}](${reference})`:md(r.app.label)):'—';
      return '| '+md(r.label)+' | '+relevance+' | '+r.cells.map(c=>(icon[c.state]??'')+md(c.label)).join(' | ')+' |';
    }),''
  ].join('\n');
}

// Report-specific layout, following IPQuality's provider-column orientation.
export function terminalWidth(value){
  return [...String(value)].reduce((n,c)=>n+(/\p{Mark}/u.test(c)?0:/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe6f\uff01-\uff60\uffe0-\uffe6]/u.test(c)?2:1),0);
}
export function renderTerminal(report,{color=true}={}){
  const rows=[{label:'檢測項',app:{label:'對 Claude App 的參考性'},cells:report.rows.map(r=>cell(r.name))},...matrix(report)];
  const grid=rows.map(r=>[cell(r.label),r.app?cell(r.app.label):unknown,...r.cells]
    .map(c=>({...c,label:c.label==='—'?'-':maskText(c.label)})));
  const widths=grid[0].map((_,i)=>Math.max(...grid.map(r=>terminalWidth(r[i].label))));
  const paint={pass:32,issue:31,unknown:90,info:36};
  const lines=grid.map(row=>row.map((c,i)=>{
    const padding=' '.repeat(Math.max(0,widths[i]-terminalWidth(c.label)));
    return (color?`\x1b[${paint[c.state]??90}m${c.label}\x1b[0m`:c.label)+padding;
  }).join(' | '));
  lines.splice(1,0,widths.map(w=>'-'.repeat(w)).join('-+-'));
  return ['CCQuality',metadata(report),'',...lines,''].join('\n');
}

const html=s=>maskText(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHtml(report){
  const refs=report.references??REFERENCES;
  const table=matrix(report).map(r=>{
    const evidence=r.app,reference=safeLink(refs[evidence?.refs?.[0]]?.url);
    const relevance=reference?`<a href="${html(reference)}" title="${html(evidence.detail??'')}">${html(evidence.label)}</a>`:
      `<span>${html(evidence?.label??'—')}</span>`;
    return `<tr><th scope="row">${html(r.label)}</th><td class="app-evidence">${relevance}</td>${r.cells.map(c=>{
      const link=safeLink(c.link),content=link?`<a href="${html(link)}">${html(c.label)}</a>`:html(c.label);
      return `<td><span class="${['pass','issue','info','unknown'].includes(c.state)?c.state:'unknown'}" title="${html(c.value??'')}">${content}</span></td>`;
    }).join('')}</tr>`;
  }).join('\n');
  return `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>CCQuality</title>
<style>
:root{color-scheme:light;font-family:-apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif;color:#172938;background:#eef2f5}
*{box-sizing:border-box}body{margin:0;padding:28px 20px}main{max-width:1880px;margin:auto;background:#fff;border:1px solid #dbe3e8;border-radius:12px;padding:26px}
h1{font-size:26px;margin:0 0 8px}.meta{color:#556777;font-size:13px;margin:0 0 22px}
.table{overflow:auto}table{border-collapse:collapse;width:100%;min-width:1490px;font-size:13px;table-layout:fixed}
thead{background:#152f43;color:#fff}th,td{padding:9px 6px;border-bottom:1px solid #e5ebf0;text-align:center}
thead th:first-child,tbody th{text-align:left;width:148px;padding-left:12px}thead th:nth-child(2){width:170px}
tbody th{font-weight:500;color:#43566a}tbody tr:nth-child(even){background:#f7f9fb}
.app-evidence{font-size:12px;color:#506779;text-align:left;padding-left:12px}
.app-evidence a{text-decoration:underline;text-decoration-color:#bdcad3;text-underline-offset:3px}
span.pass,span.issue,span.info,span.unknown{display:inline-block;max-width:100%;padding:4px 6px;border-radius:5px;font-variant-numeric:tabular-nums}
.pass{background:#e6f4ec;color:#116038;font-weight:600}.issue{background:#fdebec;color:#af2634;font-weight:600}.info{color:#315673}.unknown{color:#76828b}
a{color:inherit;text-decoration:none}a:focus-visible{outline:2px solid #2c77a8;outline-offset:3px}
@media(max-width:700px){body{padding:10px}main{padding:16px}}
</style><main><h1>CCQuality</h1><p class="meta">${html(metadata(report))}</p><div class="table"><table><thead><tr><th>檢測項</th><th>對 Claude App 的參考性</th>${report.rows.map(r=>`<th><a href="${html(safeLink(r.url)??'')}">${html(r.name)}</a></th>`).join('')}</tr></thead><tbody>${table}</tbody></table></div></main></html>`;
}
