export const SOURCES = Object.freeze([
  {id:'cloudflare',name:'Cloudflare trace',kind:'trace',url:'https://www.cloudflare.com/cdn-cgi/trace',scope:'出口與 TLS'},
  {id:'ipify',name:'ipify IPv4',kind:'ip',url:'https://api.ipify.org/?format=json',scope:'第二個出口觀察'},
  {id:'ipwhois',name:'IPWHOIS',kind:'geo',url:'https://ipwho.is/',scope:'地區與 ASN'},
  {id:'ipapi',name:'ipapi.is',kind:'geo',url:'https://api.ipapi.is/',scope:'地區與網路情報'},
  {id:'fuckclaude',name:'FuckClaude HTTP',kind:'heuristic',url:'https://fuck-claude.vercel.app/api/check?format=json',scope:'HTTP 推估；非本機瀏覽器'},
  {id:'amichina',name:'Am I China Flagged HTTP',kind:'heuristic',url:'https://amichinaflagged.com/api/check?format=json',scope:'HTTP 地區／語言線索'},
  {id:'supported',name:'Claude 官方支援地區',kind:'policy',url:'https://support.claude.com/en/articles/8461763-where-can-i-access-claude',scope:'出口地區對照；非居住資格'},
  {id:'claude_trace',name:'Claude 匿名 trace',kind:'trace',url:'https://claude.ai/cdn-cgi/trace',scope:'HTTP 探針；非 App 流量'},
  {id:'api_trace',name:'Anthropic API 匿名 trace',kind:'trace',url:'https://api.anthropic.com/cdn-cgi/trace',scope:'HTTP 探針；非帳號測試'},
  {id:'checkcc',name:'CheckCC',kind:'browser',url:'https://checkcc.org/',scope:'本機全新 Chrome；非 App',clicks:['立即检测 Claude 环境','开始检测'],family:'checkcc'},
  {id:'claudetest',name:'Claude Test',kind:'browser',url:'https://claudetest.app/tools/environment/',scope:'本機全新 Chrome；非 App',clicks:['一键检查环境'],family:'claudetest'},
  {id:'cleanip',name:'CleanIP',kind:'browser',url:'https://cleanip.io/claude',scope:'本機全新 Chrome；非 App',clicks:['开始检测'],family:'fuckclaude-derived'},
  {id:'pingip',name:'PING IP',kind:'browser',url:'https://pingip.co/claude',scope:'本機全新 Chrome；非 App',clicks:[],family:'pingip'},
  {id:'aizx',name:'AIZX',kind:'browser',url:'https://aizx.ai/tools/claude-region',scope:'本機區域特徵；非網路信譽',clicks:['开始检测'],family:'fuckclaude-derived'},
  {id:'ipbook',name:'IPBook',kind:'browser',url:'https://ipbook.net/check/',scope:'本機全新 Chrome；非 App',clicks:[],family:'ipbook'},
]);

export function selectSources(ids) {
  if (!ids || ids==='all') return [...SOURCES];
  const names=ids.split(',');
  if(names.some(id=>!SOURCES.some(s=>s.id===id))) throw Error('unknown_source');
  return [...new Set(names)].map(id=>SOURCES.find(s=>s.id===id));
}
