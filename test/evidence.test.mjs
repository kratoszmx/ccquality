import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {SOURCES,selectSources} from '../src/catalog.mjs';
import {parseBrowser,baseRow} from '../src/evidence.mjs';
import {requestAllowed,detectionComplete,collectPage} from '../src/browser.mjs';
import {collect} from '../src/collect.mjs';
import {matrix,renderHtml,renderMarkdown,renderTerminal,terminalWidth} from '../src/report.mjs';

const source=id=>SOURCES.find(s=>s.id===id);
const fixture=id=>readFileSync(new URL(`fixtures/${id}.txt`,import.meta.url),'utf8');
const parsed=id=>parseBrowser(source(id),fixture(id),{completed:true});
const report=()=>({observedAt:'2026-10-19T17:00:00Z',durationMs:12000,cleanupConfirmed:true,rows:SOURCES.map(s=>parsed(s.id))});

test('only three local checks; old IP endpoints rejected before live work',()=>{
  assert.deepEqual(selectSources().map(s=>s.id),['claudetest','aizx','fuckclaude']);
  for(const id of ['ipify','cloudflare','pingip','ipbook','supported','cleanip','aizx,','aizx,,fuckclaude'])assert.throws(()=>selectSources(id),/unknown_source/);
  assert.equal(selectSources('aizx,aizx').length,1);
  const plan=execFileSync(process.execPath,['src/cli.mjs'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
  assert.match(plan,/不測 IP/);assert.doesNotMatch(plan,/api.ipify|cdn-cgi|ipwho.is/);
  assert.match(execFileSync(process.execPath,['src/cli.mjs','--help'],{encoding:'utf8'}),/無 Claude App/);
});

test('native completed results keep exact component points and lineage',()=>{
  const a=parsed('aizx'),f=parsed('fuckclaude'),c=parsed('claudetest');
  assert.deepEqual([a.score,f.score,c.score],[16,15,5]);
  assert.equal(a.features.fonts.state,'issue');assert.equal(a.features.fonts.points,16);
  assert.equal(f.features.emoji.state,'issue');assert.equal(f.features.emoji.points,1);
  assert.equal(a.features.emoji.state,'pass');assert.equal(a.features.language.state,'pass');
  assert.equal(c.features.regional.state,'issue');assert.equal(c.features.storage.state,'pass');
  assert.equal(c.features.language,undefined); // A combined check is not three separate verdicts.
  assert.equal(a.lineage,'fuckclaude-derived');
  assert.equal(Object.keys(f.features).length,9);assert.equal(f.features.webrtc,undefined);
  for(const r of [a,f,c])assert.equal(r.status,'measured');
});

test('homepages, incomplete scans, missing values and invalid weights cannot turn green',()=>{
  for(const s of SOURCES){
    const pending=parseBrowser(s,fixture(s.id));
    assert.equal(pending.score,null);assert.deepEqual(pending.features,{});
    assert.equal(parseBrowser(s,'0/100 Welcome',{completed:true}).status,'unknown');
  }
  const missing=fixture('fuckclaude').replace('America/Los_Angeles\n+0','America/Los_Angeles');
  assert.equal(parseBrowser(source('fuckclaude'),missing,{completed:true}).features.timezone,undefined);
  const invalid=fixture('aizx').replace('16 / 16','17 / 16').replace('0 / 26','0 / 99');
  const row=parseBrowser(source('aizx'),invalid,{completed:true});
  assert.equal(row.status,'partial');assert.equal(row.features.fonts,undefined);assert.equal(row.features.timezone,undefined);
  for(const value of ['未知','pending','']){
    const missingValue=fixture('aizx').replace('America/Los_Angeles',value);
    assert.equal(parseBrowser(source('aizx'),missingValue,{completed:true}).features.timezone,undefined);
  }
});

test('403, challenge, 429 and invalid main documents are not usable scores',()=>{
  for(const code of [403,429,503,null,0]){
    const row=parseBrowser(source('aizx'),fixture('aizx'),{completed:true,httpStatus:code});
    assert.equal(row.score,null);assert.deepEqual(row.features,{});
  }
  assert.equal(parseBrowser(source('aizx'),'Just a moment',{httpStatus:200}).status,'blocked');
  for(const s of SOURCES)assert.equal(detectionComplete(s.id,fixture(s.id)),true);
  assert.equal(detectionComplete('aizx','正在检测 5/9'),false);
});

test('network policy permits static assets and exact rules, denies all IP and account probes',()=>{
  const a=source('aizx'),c=source('claudetest'),f=source('fuckclaude');
  const get={method:'GET',resourceType:'fetch'};
  for(const url of ['https://api.ipify.org/','https://ipwho.is/','https://claude.ai/cdn-cgi/trace','https://aizx.ai/api/tools/claude-probe','http://127.0.0.1/','https://localhost/','file:///etc/passwd','claude://open','https://user:password@aizx.ai/_next/static/a.js'])assert.equal(requestAllowed(a,{...get,url}),false,url);
  assert.equal(requestAllowed(f,{...get,url:'https://fuck-claude.vercel.app/api/check?format=json'}),false);
  assert.equal(requestAllowed(c,{...get,url:'https://claudetest.app/rules/context-v3.json'}),true);
  assert.equal(requestAllowed(c,{...get,url:'https://claudetest.app/rules/context-v3.json?ip=1.2.3.4'}),false);
  assert.equal(requestAllowed(a,{url:a.url,method:'GET',resourceType:'document',isNavigation:true}),true);
  assert.equal(requestAllowed(a,{url:a.url,method:'GET',resourceType:'document',isNavigation:false}),false);
  const asset={url:'https://aizx.ai/_next/static/chunks/app.js',method:'GET',resourceType:'script'};
  assert.equal(requestAllowed(a,asset),true);
  assert.equal(requestAllowed(a,{...asset,method:'POST'}),false);
  assert.equal(requestAllowed(a,{...asset,url:'https://aizx.ai/api/app.js'}),false);
  assert.equal(requestAllowed(a,{...asset,url:'https://aizx.ai/login/app.js'}),false);
});

function owners(){
  const counts={proxy:0,browser:0,closed:0,proxyClosed:0};
  return {counts,
    startProxy:async opts=>{counts.proxy++;assert.equal(opts.route,'att');return {proxyServer:'http://127.0.0.1:23456',close:async()=>counts.proxyClosed++};},
    launch:async(_chromium,opts)=>{
      counts.browser++;assert.equal(opts.mode,'headless');assert.equal(opts.chromePath,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
      assert.deepEqual(opts.route,{mode:'proxy',server:'http://127.0.0.1:23456'});
      return {context:{addInitScript:async()=>{},routeWebSocket:async()=>{},route:async()=>{}},page:{},close:async()=>counts.closed++};
    },
  };
}

test('all three sites run concurrently, await every owner, preserve source order and ATT',async()=>{
  const o=owners();let entered=0,release;
  const barrier=new Promise(resolve=>{release=resolve;});
  const r=await collect({sources:SOURCES,...o,scan:async(s,opts)=>{
    assert.equal(opts.timeoutMs,15000);if(++entered===3)release();await barrier;
    return {...parsed(s.id),durationMs:8};
  }});
  assert.deepEqual(o.counts,{proxy:1,browser:3,closed:3,proxyClosed:1});
  assert.deepEqual(r.rows.map(x=>x.id),SOURCES.map(x=>x.id));assert.equal(r.cleanupConfirmed,true);
  assert.equal(r.ipTests,false);assert.equal(r.banProbability,null);assert.equal(r.appLaunched,false);
});

test('a site error does not discard peers or leak exception text',async()=>{
  const o=owners();const r=await collect({sources:SOURCES,...o,scan:async s=>{if(s.id==='aizx')throw Error('secret-sentinel');return parsed(s.id);}});
  assert.deepEqual(r.rows.map(x=>x.status),['measured','unavailable','measured']);
  assert.equal(o.counts.closed,3);assert.equal(r.cleanupConfirmed,true);assert.equal(JSON.stringify(r).includes('secret-sentinel'),false);
});

test('bad proxy and proxy startup errors never fall back; browser cleanup uncertainty is fatal',async()=>{
  let launches=0,closed=0;
  const bad=await collect({sources:SOURCES,startProxy:async()=>({proxyServer:'http://example.com:7897',close:async()=>closed++}),launch:async()=>launches++});
  assert.equal(launches,0);assert.equal(closed,1);assert.equal(bad.error,'collection_failed');
  assert.ok(bad.rows.every(r=>r.status==='not_run'));
  const start=await collect({sources:SOURCES,startProxy:async()=>{throw Error('att_startup_failed');},launch:async()=>launches++});
  assert.equal(start.error,'collection_failed');assert.equal(launches,0);
  const o=owners();const cleanup=await collect({sources:[source('aizx')],...o,launch:async()=>{throw Error('Chrome owner exited without confirmed cleanup');}});
  assert.equal(cleanup.cleanupConfirmed,false);assert.equal(cleanup.error,'cleanup_failed');
  const end=await collect({sources:[],...o,startProxy:async()=>({proxyServer:'http://127.0.0.1:23456',close:async()=>{throw Error('att_cleanup_failed');}})});
  assert.equal(end.cleanupConfirmed,false);
});

test('cancelled run launches nothing; cancellation while scanning still closes all owners',async()=>{
  const o=owners(),c=new AbortController();c.abort();
  const first=await collect({sources:SOURCES,...o,signal:c.signal});
  assert.equal(o.counts.proxy,0);assert.ok(first.rows.every(r=>r.status==='cancelled'));
  const running=new AbortController();
  const r=await collect({sources:SOURCES,...o,signal:running.signal,scan:async s=>{
    if(s.id==='claudetest'){running.abort();return parsed(s.id);}return {...baseRow(s),status:'cancelled'};
  }});
  assert.equal(r.error,'cancelled');assert.equal(r.cleanupConfirmed,true);assert.equal(o.counts.closed,3);
});

function stalledPage(){
  let rejectGoto;
  const page={on(){},route:async()=>{},goto:()=>new Promise((_,reject)=>{rejectGoto=reject;}),close:async()=>{rejectGoto?.(Error('closed'));}};
  return page;
}
test('page deadline closes a stalled request and records timeout; cancellation records cancelled',async()=>{
  const page=stalledPage();
  const timed=await collectPage(source('aizx'),{page,timeoutMs:15});
  assert.equal(timed.status,'timeout');assert.deepEqual(timed.features,{});
  const c=new AbortController(),pending=collectPage(source('aizx'),{page:stalledPage(),signal:c.signal,timeoutMs:1000});
  setTimeout(()=>c.abort(),10);assert.equal((await pending).status,'cancelled');
});

test('parallel result renders provider columns with green passes, red issues and grey unknowns',()=>{
  const r=report(),ansi=renderTerminal(r),plain=renderTerminal(r,{color:false}),md=renderMarkdown(r),html=renderHtml(r);
  assert.match(ansi,/\x1b\[32m通過/);assert.match(ansi,/\x1b\[31m命中/);assert.match(ansi,/\x1b\[90m-/);
  assert.doesNotMatch(plain,/\x1b/);assert.match(md,/\| 檢測項 \| \[Claude Test\]/);
  assert.match(html,/class="pass"/);assert.match(html,/class="issue"/);assert.match(html,/default-src 'none'/);
  assert.ok(!matrix(r).some(x=>/ASN|IP 聲譽|WebRTC/.test(x.label)));
  const lines=plain.split('\n').filter(x=>x.includes(' | '));
  const positions=lines.map(x=>x.split(' | ').map(terminalWidth));
  assert.ok(positions.every(p=>JSON.stringify(p)===JSON.stringify(positions[0])));
});

test('provider text cannot inject HTML, terminal control or Markdown columns',()=>{
  const r=report();r.rows[1].features.fonts={state:'issue',label:'<script>bad</script> | injected\n\x1b[31m',value:'8.8.8.8'};
  const html=renderHtml(r),md=renderMarkdown(r),ansi=renderTerminal(r,{color:false});
  assert.ok(!html.includes('<script>bad'));assert.ok(html.includes('&lt;script&gt;bad'));
  assert.ok(!html.includes('8.8.8.8'));assert.ok(md.includes('\\| injected'));assert.ok(!ansi.includes('\x1b'));
});
