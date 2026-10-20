// Only local browser/environment checks. IP reputation belongs to IPQuality.
export const SOURCES = Object.freeze([
  {id:'checkcc',name:'CheckCC',url:'https://checkcc.org/',family:'checkcc',button:'立即检测 Claude 环境',method:'開源規則',methodUrl:'https://github.com/yacuo/check-cc'},
  {id:'claudetest',name:'Claude Test',url:'https://claudetest.app/tools/environment/',family:'claudetest',button:'#scan'},
  {id:'cleanip',name:'CleanIP',url:'https://cleanip.io/claude',family:'cleanip',button:'开始检测'},
  {id:'pingip',name:'PING IP',url:'https://pingip.co/claude',family:'pingip'},
  {id:'aizx',name:'AIZX',url:'https://aizx.ai/tools/claude-region',family:'fuckclaude-derived',button:'开始检测',method:'改編 FuckClaude'},
  {id:'fuckclaude',name:'FuckClaude',url:'https://fuck-claude.vercel.app/',family:'fuckclaude',button:'#retest',method:'開源規則',methodUrl:'https://github.com/LinXiaoTao/FuckClaude'},
  {id:'amichina',name:'AmIChinaFlagged',url:'https://amichinaflagged.com/',family:'amichina',button:'开始检查',method:'自訂規則'},
  {id:'ipbook',name:'IPBook',url:'https://ipbook.net/check/',family:'ipbook',method:'自訂規則'},
].map(Object.freeze));

export function selectSources(ids) {
  if (!ids || ids==='all') return [...SOURCES];
  const names=ids.split(',');
  if(names.some(id=>!SOURCES.some(s=>s.id===id))) throw Error('unknown_source');
  return [...new Set(names)].map(id=>SOURCES.find(s=>s.id===id));
}
