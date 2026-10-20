import {contribution,numeric} from '../evidence.mjs';

const DIMENSIONS=[
  ['timezone','系统时区',26],['language','浏览器语言',20],['fonts','中文字体',16],['vendorFonts','厂商与软件字体',10],
  ['webview','国产浏览器 / WebView',8],['device','设备品牌线索',6],['locale','Intl 区域设置',6],['offset','时区偏移',4],['emoji','Emoji 渲染',4],
];
const NEXT=new RegExp(`\\n(?:${DIMENSIONS.map(([,label])=>label.replace(/[/]/g,'\\/')).join('|')})\\n`);

export default {
  id:'aizx',name:'AIZX',url:'https://aizx.ai/tools/claude-region',family:'fuckclaude-derived',
  button:'开始检测',method:'改編 FuckClaude',hydrateMs:1500,expected:9,index:{label:'區域特徵指數',scope:'local'},
  limitations:['改編自 FuckClaude，兩者不是獨立證據；未執行額外聯網檢測。'],
  // The optional network scan is never started.
  complete:text=>/已测\s*9\s*项/.test(text)&&/导出报告/.test(text),
  parse(row,text){
    row.score=numeric(text.match(/(?:^|\n)(\d{1,3})\s*(?:\n)?\/\s*100/)?.[1]);
    const area='\n'+(text.split('导出报告')[1]?.split('WebRTC 与网络出口检查')[0]??'');
    for(const [id,label,weight] of DIMENSIONS){
      const marker='\n'+label+'\n',position=area.indexOf(marker);
      if(position<0)continue;
      const after=area.slice(position+marker.length),end=after.search(NEXT);
      const match=(end<0?after:after.slice(0,end)).match(/^(\d+)\s*\/\s*(\d+)\n([^]*)$/);
      if(match&&Number(match[2])===weight)contribution(row,id,Number(match[1]),match[3].trim().split(/\n+/).at(-1),weight);
    }
  },
};
