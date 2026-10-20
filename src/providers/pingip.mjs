import {bounded} from '../evidence.mjs';

export default {
  id:'pingip',name:'PING IP',url:'https://pingip.co/claude',family:'pingip',expected:2,
  // The scan starts by itself; its network-dependent "safe" total is ignored.
  complete:text=>/自动检测完成/.test(text)&&/FULL INSPECTION/.test(text),
  parse(row,text){
    const area=text.split('FULL INSPECTION')[1]?.split('LOCAL COMPARISON')[0]??'';
    for(const [id,label] of [['timezone','浏览器时区与 UTC offset'],['language','浏览器语言']]){
      const match=area.match(new RegExp(`(?:^|\\n)(正常|建议优化|严重风险)\\n${label}\\n([^\\n]+)\\n([^\\n]+)\\nPING IP 技术判断`));
      if(match&&!/未知|未完成|获取失败/.test(match[3]))row.features[id]={state:match[1]==='正常'?'pass':'issue',label:match[1]==='正常'?'通過':'命中',value:bounded(match[3])};
    }
  },
};
