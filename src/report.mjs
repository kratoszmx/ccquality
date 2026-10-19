import {FEATURES,maskText} from './evidence.mjs';

const statuses={measured:'本機項完成',partial:'部分結果',unknown:'未知',incomplete:'未完成',timeout:'逾時',unavailable:'不可用',blocked:'被擋',rate_limited:'限流',cancelled:'已取消',not_run:'未執行'};
const note='綠＝該站通過；紅＝該站標記／加分；灰＝未提供或未測。紅色不代表 Claude 會封號。';
const scope='僅測本機環境，不測 IP；全程 ATT，Claude App 未啟動。Chrome 觀察不等於 App 實際指紋。';
const unknown={state:'unknown',label:'—'};
const cell=(label,state='info',value='')=>({label:maskText(label),state,value:maskText(value)});
export function matrix(report){
  return [
    {label:'採集狀態',cells:report.rows.map(r=>cell(statuses[r.status]??'未知',r.status==='measured'?'info':'unknown'))},
    {label:'原站指數 ↓',cells:report.rows.map(r=>r.score===null?unknown:cell(`${r.score}/100`, 'info',r.scoreLabel))},
    ...FEATURES.map(([id,label])=>({label,cells:report.rows.map(r=>r.features[id]??unknown)})),
    {label:'採集耗時',cells:report.rows.map(r=>Number.isFinite(r.durationMs)?cell(`${(r.durationMs/1000).toFixed(1)} 秒`):unknown)},
  ];
}
function time(report){return new Date(report.observedAt).toLocaleString('zh-TW',{timeZone:'America/Los_Angeles',hour12:false})+' America/Los_Angeles';}
function metadata(report){return `${time(report)} · ATT · ${report.rows.length} 個來源 · 共 ${(report.durationMs/1000).toFixed(1)} 秒`;}
function notes(report){
  return [scope,note,'原站指數量尺不同，不平均、不換算封號機率；WebRTC、帳號、付款與 App 連線均未測。',
    ...report.rows.flatMap(r=>r.limitations.map(s=>`${r.name}：${s}`)),
    `清理：${report.cleanupConfirmed?'已確認自有瀏覽器與 ATT 通道結束':'未確認；本次有錯誤，請查看 JSON'}。`];
}
const md=s=>maskText(s).replace(/[|]/g,'\\|').replace(/[<>]/g,'');
export function renderMarkdown(report){
  const icon={pass:'🟢 ',issue:'🔴 ',unknown:'',info:''};
  return ['# CCQuality 本機環境檢測','',metadata(report),'',scope,'',
    '| 檢測項 | '+report.rows.map(r=>`[${md(r.name)}](${r.url})`).join(' | ')+' |',
    '| --- | '+report.rows.map(()=>'---').join(' | ')+' |',
    ...matrix(report).map(r=>'| '+md(r.label)+' | '+r.cells.map(c=>(icon[c.state]??'')+md(c.label)).join(' | ')+' |'),
    '',...notes(report).slice(1).map(s=>'- '+md(s)),''
  ].join('\n');
}

// Report-specific terminal layout; no IPQuality source implementation copied.
export function terminalWidth(value){
  return [...String(value)].reduce((n,c)=>n+(/\p{Mark}/u.test(c)?0:/[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe6f\uff01-\uff60\uffe0-\uffe6]/u.test(c)?2:1),0);
}
export function renderTerminal(report,{color=true}={}){
  const rows=[{label:'檢測項',cells:report.rows.map(r=>cell(r.name))},...matrix(report)];
  const grid=rows.map(r=>[cell(r.label),...r.cells].map(c=>c.label==='—'?{...c,label:'-'}:c));
  const widths=grid[0].map((_,i)=>Math.max(...grid.map(r=>terminalWidth(r[i].label))));
  const paint={pass:32,issue:31,unknown:90,info:36};
  const lines=grid.map(row=>row.map((c,i)=>{
    const plain=maskText(c.label),padding=' '.repeat(Math.max(0,widths[i]-terminalWidth(plain)));
    return (color?`\x1b[${paint[c.state]??90}m${plain}\x1b[0m`:plain)+padding;
  }).join(' | '));
  lines.splice(1,0,widths.map(w=>'-'.repeat(w)).join('-+-'));
  return ['CCQuality · 本機環境檢測',metadata(report),'',...lines,'',...notes(report),''].join('\n');
}

const html=s=>maskText(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHtml(report){
  const table=matrix(report).map(r=>`<tr><th scope="row">${html(r.label)}</th>${r.cells.map(c=>`<td><span class="${['pass','issue','info','unknown'].includes(c.state)?c.state:'unknown'}" title="${html(c.value??'')}">${html(c.label)}</span></td>`).join('')}</tr>`).join('\n');
  return `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>CCQuality 本機環境檢測</title>
<style>
:root{color-scheme:light;font-family:-apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif;color:#172938;background:#eef2f5}*{box-sizing:border-box}body{margin:0;padding:36px 28px}main{max-width:1160px;margin:auto;background:#fff;border:1px solid #dbe3e8;border-radius:14px;padding:28px 32px}header{display:flex;justify-content:space-between;align-items:center;gap:16px}h1{font-size:26px;letter-spacing:.2px;margin:0 0 8px}.meta{color:#556777;font-size:13px;margin:0}.badge{background:#e6eff9;color:#245785;padding:8px 13px;border-radius:7px;white-space:nowrap;font-size:13px}.scope{margin:22px 0 14px;font-size:14px;color:#415669}.table{overflow:auto}table{border-collapse:collapse;width:100%;font-size:14px;table-layout:fixed}thead{background:#152f43;color:#fff}th,td{padding:10px 14px;border-bottom:1px solid #e5ebf0;text-align:center}thead th:first-child,tbody th{text-align:left;width:24%}tbody th{font-weight:500;color:#43566a}tbody tr:nth-child(even){background:#f7f9fb}span.pass,span.issue,span.info,span.unknown{display:inline-block;min-width:106px;padding:4px 8px;border-radius:5px;font-variant-numeric:tabular-nums}.pass{background:#e6f4ec;color:#116038;font-weight:600}.issue{background:#fdebec;color:#af2634;font-weight:600}.info{color:#315673}.unknown{color:#76828b}.legend{display:flex;gap:18px;flex-wrap:wrap;margin:18px 0 10px;font-size:13px}.legend b{font-weight:500}.legend .good{color:#116038}.legend .bad{color:#af2634}.notes{font-size:12px;line-height:1.75;color:#60717d;margin:0;padding-left:19px}a{color:inherit;text-decoration:none}footer{font-size:12px;color:#60717d;margin-top:18px;padding-top:14px;border-top:1px solid #e5ebf0}@media(max-width:700px){body{padding:12px}main{padding:18px}table{min-width:680px}header{display:block}.badge{display:inline-block;margin-top:12px}}
</style><main><header><div><h1>CCQuality 本機環境檢測</h1><p class="meta">${html(metadata(report))}</p></div><span class="badge">Claude App 未啟動</span></header><p class="scope">只檢查本機語言、時區、字體與瀏覽器特徵；IP 檢測交由 IPQuality。</p><div class="table"><table><thead><tr><th>檢測項</th>${report.rows.map(r=>`<th><a href="${html(r.url)}">${html(r.name)}</a></th>`).join('')}</tr></thead><tbody>${table}</tbody></table></div><div class="legend"><b class="good">● 綠色：該站通過</b><b class="bad">● 紅色：該站標記／加分</b><b>— 未提供／未測</b></div><ul class="notes">${notes(report).filter((_,i)=>i!==1).map(s=>`<li>${html(s)}</li>`).join('')}</ul><footer>各站紅色項目是排查線索，不是 Anthropic 官方判定；不需要為了分數移除中文字體或更改系統語言。滑鼠停在格子上可查看原始值。</footer></main></html>`;
}
