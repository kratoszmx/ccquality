// Native Chrome integration, using only a loopback fixture proxy. No upstream
// connections, DNS, IP check, website, personal browser or Claude App.
import {createServer} from 'node:http';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {launchChromeSession} from '@myutils/browser-session/chrome';
import {blockRedirects} from '../src/browser.mjs';

let forbidden=0;
const proxy=createServer((req,res)=>{
  const url=new URL(req.url,'http://fixture.invalid');
  if(url.hostname!=='fixture.invalid'){res.writeHead(503);return res.end();}
  if(url.pathname.startsWith('/redirect/')){
    res.writeHead(Number(url.pathname.split('/').at(-1)),{Location:'http://fixture.invalid/forbidden'});
    return res.end();
  }
  if(url.pathname==='/forbidden')forbidden++;
  res.end('local fixture');
});
proxy.on('connect',(_req,socket)=>socket.destroy());
proxy.listen(0,'127.0.0.1');await once(proxy,'listening');
let owner;
try{
  owner=await launchChromeSession(chromium,{
    stateDir:fileURLToPath(new URL('../.state/redirect-fixture/',import.meta.url)),
    mode:'headless',route:{mode:'proxy',server:`http://127.0.0.1:${proxy.address().port}`},
    startupTimeoutMs:15000,lifetimeMs:30000,
  });
  const {page,context}=owner,blocked=[];let guardFailure=false;
  await context.route('**/*',route=>route.abort());
  await page.route('**/*',route=>{
    const u=new URL(route.request().url());
    return u.hostname==='fixture.invalid'&&(u.pathname==='/'||u.pathname.startsWith('/redirect/'))?
      route.continue():route.abort();
  });
  await blockRedirects(page,e=>blocked.push(e.responseStatusCode),()=>{
    guardFailure=true;void page.close().catch(()=>{});
  });
  assert.equal((await page.goto('http://fixture.invalid/',{timeout:3000})).status(),200);
  assert.equal(await page.locator('body').innerText(),'local fixture');
  for(const status of [301,302,303,307,308])
    await assert.rejects(page.goto(`http://fixture.invalid/redirect/${status}`,{timeout:3000}),/ERR_BLOCKED_BY_CLIENT/);
  assert.deepEqual(blocked,[301,302,303,307,308]);
  assert.equal(forbidden,0);assert.equal(guardFailure,false);
  console.log('PASS: native Chrome blocked five redirect types before the forbidden destination; normal HTTP passed.');
}finally{
  try{await owner?.close();}
  finally{proxy.closeAllConnections();proxy.close();await once(proxy,'close');}
}
