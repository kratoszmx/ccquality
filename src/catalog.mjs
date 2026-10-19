// Only local browser/environment checks. IP reputation belongs to IPQuality.
export const SOURCES = Object.freeze([
  {id:'claudetest',name:'Claude Test',url:'https://claudetest.app/tools/environment/',family:'claudetest',button:'#scan'},
  {id:'aizx',name:'AIZX',url:'https://aizx.ai/tools/claude-region',family:'fuckclaude-derived',button:'开始检测'},
  {id:'fuckclaude',name:'FuckClaude',url:'https://fuck-claude.vercel.app/',family:'fuckclaude',button:'#retest'},
].map(Object.freeze));

export function selectSources(ids) {
  if (!ids || ids==='all') return [...SOURCES];
  const names=ids.split(',');
  if(names.some(id=>!SOURCES.some(s=>s.id===id))) throw Error('unknown_source');
  return [...new Set(names)].map(id=>SOURCES.find(s=>s.id===id));
}
