import {bounded,contribution,numeric} from '../evidence.mjs';

const COMPONENTS=[
  ['timezone','系统时区',30],['language','浏览器语言',22],['fonts','中文字体',14],
  ['vendorFonts','国产厂商字体',12],['webview','国产浏览器',10],['device','国产设备品牌',6],['locale','Intl 区域设置',6],
];

export default {
  id:'cleanip',name:'CleanIP',url:'https://cleanip.io/claude',family:'cleanip',button:'开始检测',
  // Application bundles live on a dedicated static CDN. Only these published
  // asset directories open, never its API or telemetry hosts.
  assetOrigins:{'https://static.cleanipcdn.com':/^\/(?:_nuxt\/v2|fonts\/google-sans|libs\/fontawesome)\//},
  hydrateMs:1500,expected:9,index:{label:'中國大陸環境特徵（本機）',scope:'local'},
  complete:text=>/(?:^|\n)检测完成\n/.test(text)&&/07 · 本地系统/.test(text)&&/\nIntl 区域设置\n\d+\/6/.test(text),
  parse(row,text){
    // Section 07 alone: the mixed overall safety score depends on network checks.
    const area=text.split('07 · 本地系统')[1]?.split('Claude Code 请在运行它的机器上自查')[0]??'';
    const components=area.split('中国大陆环境特征')[1]??'';
    row.score=numeric(components.match(/^\s*(\d{1,3})\/100/)?.[1]);
    for(const [id,label,weight] of COMPONENTS){
      const match=components.split('\n'+label+'\n')[1]?.match(/^(\d+)\/(\d+)(?:\n|$)/);
      if(match&&Number(match[2])===weight)contribution(row,id,Number(match[1]),`原站本機項 ${match[1]}/${match[2]}`,weight);
    }
    const auto=area.match(/\n自动化\n([^\n]+)\n(异常|正常)(?:\n|$)/);
    if(auto)row.features.automation={state:auto[2]==='异常'?'issue':'pass',label:auto[2]==='异常'?'命中':'通過',value:bounded(auto[1])};
    const platform=area.match(/\n平台 \/ 浏览器\n([^\n]+)/)?.[1];
    if(platform)row.features.platform={state:'info',label:bounded(platform.split(' / ')[0]),value:bounded(platform)};
  },
};
