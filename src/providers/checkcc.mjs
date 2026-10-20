import {bounded,contribution} from '../evidence.mjs';

const ROWS=[
  ['timezone','系统时区'],['language','浏览器语言'],['script','语言文字特征'],
  ['fonts','字体地区特征'],['vendorFonts','厂商字体异常'],['webview','浏览器地区特征'],
  ['device','设备地区特征'],['locale','Intl 区域设置'],['offset','时区偏移'],['emoji','Emoji 渲染风格'],
];

export default {
  id:'checkcc',name:'CheckCC',url:'https://checkcc.org/',family:'checkcc',
  button:'立即检测 Claude 环境',method:'開源規則',methodUrl:'https://github.com/yacuo/check-cc',
  hydrateMs:1500,expected:11,
  // The entry button opens a target dialog whose own button starts the scan.
  async start(page,{click,setPhase}){
    await click();
    setPhase('confirm_scan_target');
    await page.getByRole('button',{name:'开始检测',exact:true}).click({timeout:3000});
    setPhase('local_scan');
  },
  // Local rows populate long before the blocked network workflow; stop there.
  complete:text=>/命中的检测信号/.test(text)&&/\nEmoji 渲染风格\n[^\n]+\n\+\d+/.test(text)&&/\n操作系统\n[^\n]+\n\+\d+/.test(text),
  parse(row,text){
    // Native total keeps changing while disabled network work is pending.
    // Only locally populated component rows are evidence; never use that total.
    const area=text.split('命中的检测信号')[1]?.split('DETECTION LOGIC')[0]??'';
    for(const [id,label] of ROWS){
      const block=area.split('\n'+label+'\n')[1]?.match(/^([^\n]+)\n\+(\d+)(?:\n|$)/);
      if(block)contribution(row,id,Number(block[2]),block[1]);
    }
    const platform=area.match(/\n操作系统\n([^\n]+)\n\+\d+/)?.[1];
    if(platform&&!/等待|未知/.test(platform))row.features.platform={state:'info',label:bounded(platform),value:bounded(platform)};
  },
};
