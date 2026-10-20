import {contribution,numeric} from '../evidence.mjs';

// Original open-source six-signal rule set; ClaudeFlag and JinDaGe reuse its weights.
const SIGNALS=[
  ['timezone','系统时区',30],['language','浏览器语言',24],['fonts','中文字体',20],
  ['locale','Intl 区域',10],['offset','时区偏移',8],['emoji','Emoji 风格',8],
];

export default {
  id:'claudetester',name:'claude-tester',url:'https://claude-tester-six.vercel.app/',family:'claude-tester',
  button:'#scan-btn',method:'開源規則',methodUrl:'https://github.com/gokuscraper/claude-tester',
  expected:6,index:{label:'中國用戶指數',scope:'local'},
  complete:text=>/重新检测/.test(text)&&/\n(?:低|中|高)风险\n/.test(text),
  parse(row,text){
    row.score=numeric(text.match(/(?:^|\n)(\d{1,3})\n\/ 100\n/)?.[1]);
    // The signal list, not the earlier summary chips, which omit zero results.
    const area='\n'+(text.split('\n检测信号\n')[1]?.split('检测原理')[0]??'');
    for(const [id,label,weight] of SIGNALS){
      // "Name description", raw value, then this signal's rounded contribution.
      const match=area.split('\n'+label+' ')[1]?.match(/^[^\n]*\n([^\n]+)\n\+(\d+)(?:\n|$)/);
      if(match)contribution(row,id,Number(match[2]),match[1],weight);
    }
  },
};
