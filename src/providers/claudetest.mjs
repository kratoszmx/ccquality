import {bounded,numeric} from '../evidence.mjs';

// Every network/helper option on the page, unchecked before the scan starts.
const NETWORK_OPTIONS=['ip','dual','split','rtc','intel','online-reputation','dns','system','trace'];

export default {
  id:'claudetest',name:'Claude Test',url:'https://claudetest.app/tools/environment/',family:'claudetest',
  button:'#scan',staticFiles:['/rules/context-v3.json','/rules/network-v5.json'],
  expected:2,index:{label:'環境問題指數',scope:'partial'},
  limitations:['只採用本機檢查；站內 IP、DNS、分流、WebRTC 與助手選項全部關閉。語言、時區、字體合併計分，不拆成獨立通過項。'],
  async start(page,{click,setPhase}){
    setPhase('local_only_settings');
    await page.locator('#rtc-consent').waitFor({state:'attached',timeout:4000});
    const panel=page.locator('details').filter({has:page.locator('#rtc-consent')});
    if(await panel.getAttribute('open')===null)await panel.locator('summary').click({timeout:2000});
    for(const id of NETWORK_OPTIONS){
      setPhase(`local_only_setting_${id}`);
      await page.locator(`#${id}-consent`).uncheck({timeout:2000});
    }
    setPhase('local_scan');
    await click();
  },
  complete:text=>/本模块检测完成/.test(text),
  parse(row,text){
    row.score=numeric(text.match(/环境问题指数\s*\n0[–-]100\s*\n(\d{1,3})\s*\n\/\s*100/)?.[1]);
    const details=text.split('AUTOMATIC CHECK')[1]?.split('待完成的检测')[0]??'';
    // One combined language/timezone/font verdict, never three separate passes.
    const local=details.match(/中文与区域环境线索\s*\n(?:\+(\d+)\s*\n)?(异常|正常)\s*\n([^\n]+)/);
    if(local)row.features.regional={state:local[2]==='异常'?'issue':'pass',label:local[2]==='异常'?`命中 +${local[1]??'?'}`:'通過',value:bounded(local[3])};
    const storage=details.match(/本页登录环境基础能力\s*\n(正常|异常)\s*\n([^\n]+)/);
    if(storage)row.features.storage={state:storage[1]==='正常'?'pass':'issue',label:storage[1]==='正常'?'通過':'異常',value:bounded(storage[2])};
  },
};
