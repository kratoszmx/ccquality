import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {selectSources} from './catalog.mjs';
import {renderMarkdown,renderTerminal,renderHtml} from './report.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const args=process.argv.slice(2);
let live=false,selected;
try{
  for(let i=0;i<args.length;i++){
    if(args[i]==='--run')live=true;
    else if(args[i]==='--sources'&&args[i+1])selected=args[++i];
    else if(args[i]==='--help'){
      console.log('CCQuality: node src/cli.mjs [--run] [--sources id,id]\n不帶 --run 僅列出計畫，無網路、無瀏覽器、無 Claude App。\n--run 使用獨立 ATT，三頁並行、每站最多 15 秒，只測本機環境。\n輸出彩色終端表格與 HTML / ANSI / Markdown / JSON；不測 IP。');process.exit(0);
    }else throw Error('invalid_argument');
  }
  const sources=selectSources(selected);
  if(!live){
    console.log('計畫：本機環境檢測；三頁並行、每站最多 15 秒；只用獨立 ATT。');
    console.log('不測 IP／ASN／聲譽／DNS／出口；僅允許來源頁面、本站靜態資源與靜態規則。');
    console.log('Claude App 不會啟動；不讀帳號、Cookie、API key；WebRTC 未測。');
    console.log('網站接收一般頁面請求，可見 ATT 連線；分數不換算成封號機率。');
    for(const s of sources)console.log(`${s.id}\t${s.name}\t${s.url}`);
    console.log('執行：node src/cli.mjs --run');
  }else{
    process.umask(0o077);
    for(const name of ['reports','.state']){
      const dir=path.join(root,name);
      await fs.mkdir(dir,{mode:0o700,recursive:true});
      const stat=await fs.lstat(dir);
      if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o077)!==0||stat.uid!==process.getuid())throw Error('unsafe_private_directory');
    }
    const out=await fs.mkdtemp(path.join(root,'reports',new Date().toISOString().replace(/[:.]/g,'-')+'-'));
    const controller=new AbortController();
    const stop=()=>controller.abort();process.once('SIGINT',stop);process.once('SIGTERM',stop);
    try{
      const [{collect},{chromium}]=await Promise.all([import('./collect.mjs'),import('playwright-core')]);
      const report=await collect({sources,stateDir:path.join(root,'.state/browser'),signal:controller.signal,chromium,
        onProgress:event=>console.error(event.stage==='start'?`檢測 ${event.id}…`:`${event.id}: ${event.status} (${(event.durationMs/1000).toFixed(1)}s)`)});
      await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600,flag:'wx'});
      await fs.writeFile(path.join(out,'report.md'),renderMarkdown(report),{mode:0o600,flag:'wx'});
      await fs.writeFile(path.join(out,'report.html'),renderHtml(report),{mode:0o600,flag:'wx'});
      await fs.writeFile(path.join(out,'report.ansi'),renderTerminal(report),{mode:0o600,flag:'wx'});
      console.log(renderTerminal(report,{color:Boolean(process.stdout.isTTY)&&!Object.hasOwn(process.env,'NO_COLOR')}));
      console.log(`HTML: ${out}/report.html\nANSI: ${out}/report.ansi\nJSON: ${out}/report.json\nMarkdown: ${out}/report.md`);
      if(report.error||controller.signal.aborted)process.exitCode=1;
    }finally{process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);}
  }
}catch(error){console.error(`CCQuality stopped: ${['invalid_argument','unknown_source','unsafe_private_directory'].includes(error?.message)?error.message:'operation_failed'}`);process.exitCode=1;}
