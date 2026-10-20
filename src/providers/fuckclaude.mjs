import {contribution,numeric} from '../evidence.mjs';

const DIMENSIONS=[
  ['timezone','System timezone',24],['language','Browser language',18],['fonts','Installed Chinese fonts',14],['vendorFonts','Chinese vendor fonts',10],
  ['webview','Chinese browser / WebView',8],['device','Chinese-brand device',6],['locale','Intl locale',4],['offset','Timezone offset',3],['emoji','Emoji rendering style',3],
];
// The page also lists WebRTC; it bounds the previous block but is never read.
const NEXT=new RegExp(`\\n(?:${[...DIMENSIONS.map(([,label])=>label),'WebRTC IP leak'].map(label=>label.replace(/[/]/g,'\\/')).join('|')})\\n`);

export default {
  id:'fuckclaude',name:'FuckClaude',url:'https://fuck-claude.vercel.app/',family:'fuckclaude',
  button:'#retest',method:'開源規則',methodUrl:'https://github.com/LinXiaoTao/FuckClaude',
  expected:9,index:{label:'區域特徵指數',scope:'partial'},
  limitations:['原站把停用 WebRTC 誤列為未洩漏；本工具不採用該項。總分保留原站值，不是完整測量或封號機率。'],
  complete:text=>/(?:Scan again|重新检测)/.test(text)&&/\n(?:Low risk|Medium risk|High risk|低风险|中风险|高风险)\n/.test(text),
  parse(row,text){
    row.score=numeric(text.match(/(?:^|\n)(\d{1,3})\s*(?:\n)?\/\s*100/)?.[1]);
    const area='\n'+(text.split('What gets scanned')[1]?.split('How the check works')[0]??'');
    for(const [id,label,weight] of DIMENSIONS){
      const marker='\n'+label+'\n',position=area.indexOf(marker);
      if(position<0)continue;
      // Stop at the next feature; a missing value must not borrow its score.
      const block=area.slice(position+marker.length).split(NEXT)[0];
      const match=block.match(/^Weight (\d+)\n[^]*?\n([^\n]+)\n\+(\d+)(?:\n|$)/);
      if(match&&Number(match[1])===weight)contribution(row,id,Number(match[3]),match[2],weight);
    }
  },
};
