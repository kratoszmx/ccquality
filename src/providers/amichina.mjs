import {contribution,numeric} from '../evidence.mjs';

// Same nine weights as AIZX. Matching weights do not prove code ancestry.
const DIMENSIONS=[
  ['timezone','系统时区',26],['language','浏览器语言',20],['fonts','常见中文字体',16],
  ['vendorFonts','厂商中文字体',10],['webview','浏览器或 WebView',8],['device','设备品牌',6],
  ['locale','Intl 区域设置',6],['offset','UTC+8 偏移',4],['emoji','系统与表情代理',4],
];

export default {
  // The root redirects to /zh; enter the reviewed page without following redirects.
  id:'amichina',name:'AmIChinaFlagged',url:'https://amichinaflagged.com/zh',family:'amichina',
  button:'开始检查',buttonExact:false,method:'同 AIZX 權重',
  hydrateMs:1500,expected:9,index:{label:'環境信號分數',scope:'local'},
  limitations:['九項權重與 AIZX 相同，不能視為獨立驗證；未證實程式碼來源相同。'],
  complete:text=>/再次检查/.test(text)&&/系统与表情代理[^]*?\n得分/.test(text),
  parse(row,text){
    // The page's 72/100 and 12/100 demonstrations precede this audit block.
    row.score=numeric(text.match(/即时审计\s*\n本地\s*\n(\d{1,3})\s*\n\/100/)?.[1]);
    const area=text.split('九项公开信号')[1]?.split('本地保存')[0]??'';
    for(const [id,label,weight] of DIMENSIONS){
      const block=area.split('\n'+label+'\n')[1]?.split(/\n\d{2}\n/)[0]??'';
      const match=block.match(/检测依据\n([^\n]+)\n+(未发现|匹配)\n(\d+) \/ (\d+)\n得分/);
      if(match&&Number(match[4])===weight&&((match[2]==='匹配')===(Number(match[3])>0)))
        contribution(row,id,Number(match[3]),match[1],weight);
    }
  },
};
