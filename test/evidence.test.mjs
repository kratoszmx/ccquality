import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {SOURCES,selectSources} from '../src/catalog.mjs';
import {parseHttp,parseBrowser,evaluate,publicIPv4,renderMarkdown} from '../src/evidence.mjs';
import {requestAllowed,detectionComplete,nativeLookupPostAllowed,collectBrowser} from '../src/browser.mjs';
import {collect} from '../src/collect.mjs';
const source=id=>SOURCES.find(s=>s.id===id);
const json=data=>({ok:true,status:200,readableText:JSON.stringify(data)});

test('plans reject malformed source lists before any live dependency',()=>{
  for(const value of ['cloudflare,','direct','CLAUDE','cloudflare,,ipify'])assert.throws(()=>selectSources(value));
  assert.equal(selectSources('ipify,ipify').length,1);
  const plan=execFileSync(process.execPath,['src/cli.mjs'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});
  assert.match(plan,/執行：node src\/cli.mjs --run/);
  assert.equal(execFileSync(process.execPath,['src/cli.mjs','--help'],{encoding:'utf8'}).includes('無 Claude App'),true);
});

test('private/reserved/malformed addresses never bind an egress',()=>{
  for(const ip of ['127.0.0.1','10.0.0.1','169.254.1.1','172.16.0.1','192.168.1.1','100.64.1.2','198.18.0.1','192.0.2.1','203.0.113.2','8.8.8.8.bad','::1','999.1.1.1'])assert.equal(publicIPv4(ip),false,ip);
  assert.equal(publicIPv4('8.8.8.8'),true);
});

test('status, rate limits, challenge, malformed and missing fields never become clean',()=>{
  for(const input of [{ok:false,status:403},{ok:false,status:429},{ok:true,status:200,challenge:true},{ok:true,status:200,readableText:'<html>not JSON</html>'},json({}),json({score:null}),json({score:0})]){
    const row=parseHttp(source('fuckclaude'),input);
    assert.equal(row.score,null);assert.notEqual(row.status,'measured');
  }
  assert.equal(parseHttp(source('ipwhois'),json({success:false,ip:'8.8.8.8',country_code:'US'})).status,'unknown');
});

test('HTTP heuristic coverage and missing language stay explicit',()=>{
  const row=parseHttp(source('fuckclaude'),json({app:'Fuck Claude',estimate:true,score:2,band:'low',geo:{country:'US',timezone:'America/Los_Angeles'},coverage:{measuredWeight:62,totalWeight:100}}));
  assert.equal(row.score,2);assert.equal(row.status,'partial');assert.equal(row.facts.measuredWeight,62);
  assert.match(row.limitations.join(' '),/語言未知/);
  assert.equal(parseHttp(source('amichina'),json({risk:'low',country:'US',countryMainland:false,primaryLanguage:null})).facts.primaryLanguage,null);
});

test('anonymous ipapi schema does not invent absent risk booleans',()=>{
  const row=parseHttp(source('ipapi'),json({ip:'8.8.8.8',asn:'AS15169 Google',country:'United States',company:'Google'}));
  assert.equal(row.status,'measured');assert.equal(row.facts.is_proxy,null);assert.equal(row.facts.is_abuser,null);
});

test('official list must contain the actual list boundaries',()=>{
  assert.equal(parseHttp(source('supported'),{ok:true,status:200,readableText:'Footer: United States United Kingdom'}).status,'unknown');
  const row=parseHttp(source('supported'),{ok:true,status:200,readableText:'March 16, 2026\nYou can access Claude in the following locations:\nUnited States\nUnited Kingdom\nDid this answer your question?\nHong Kong'});
  assert.deepEqual(row.facts.countries,['United States','United Kingdom']);
});

test('CheckCC transient score and conflicting ASNs cannot become a completed ban probability',()=>{
  const text='53%\n封号风险\n检测中\n边缘 ASN\n7018\nASN\nAS132892';
  const row=parseBrowser(source('checkcc'),text);
  assert.equal(row.score,53);assert.equal(row.completed,false);assert.equal(row.facts.sourceConflict,true);
  assert.equal(detectionComplete('checkcc',text),false);
  assert.equal(evaluate([row]).banProbability,null);
  assert.ok(evaluate([row]).signals.some(s=>s.status==='conflict'));
});

test('safety and risk scales are opposite; copied methods remain attributed',()=>{
  const ping=parseBrowser(source('pingip'),'自动检测完成\n100\n/ 100\nCLAUDE 环境安全度\n75%\n报告可信度\nAbuse confidence 0%',{completed:true});
  assert.equal(ping.scoreDirection,'higher');assert.equal(ping.score,100);assert.equal(ping.facts.reportConfidence,75);
  const aizx=parseBrowser(source('aizx'),'16/ 100\n中文环境特征分\n已测 9 项\n导出报告',{completed:true});
  assert.equal(aizx.scoreDirection,'lower');assert.equal(aizx.score,16);assert.equal(aizx.lineage,'fuckclaude-derived');
  const ipbook=parseBrowser(source('ipbook'),'2\n风险/100\nIP 信任评分\n100\n未检测到泄漏\nCLAUDE 可达性\nclaude.ai\n不可达',{completed:true});
  assert.equal(ipbook.facts.trustScore,100);assert.match(ipbook.limitations.join(),/不被採信/);
  assert.equal(ipbook.facts.browserReachability,'reported_unreachable');
});

test('a readable homepage is not a completed test or zero score',()=>{
  for(const id of ['checkcc','claudetest','cleanip','pingip','aizx','ipbook']){
    const row=parseBrowser(source(id),'欢迎！0–100 等待检测。');
    assert.equal(row.score,null,id);assert.equal(row.status,'incomplete',id);
  }
  const clean=parseBrowser(source('cleanip'),'检测完成\n用时 5 秒，共 7 项检测\n美国 (US)\nclaude.ai 与 Anthropic API 走同一出口',{completed:true});
  assert.equal(clean.score,null);assert.equal(clean.status,'partial');
  const intel=parseBrowser(source('cleanip'),'检测完成\n美国 (US)\nclaude.ai 与 Anthropic API 走同一出口\n03 · IP 环境\n线路类型\n家宽 / 移动网络\nASN / 运营商\nAS7018 · AT&T\nIP 信誉\n无滥用、无黑名单\n商业 VPN\n未检测到 VPN\n代理服务\n未检测到代理\n04 · 泄露检测',{completed:true});
  assert.equal(intel.facts.vpn,false);assert.equal(intel.facts.proxy,false);assert.equal(intel.facts.asn,7018);
  assert.equal(parseBrowser(source('aizx'),'16/ 100',{completed:true,httpStatus:503}).status,'unavailable');
});

test('egress disagreements remain conflicts regardless of favorable scores',()=>{
  const a=parseHttp(source('ipify'),json({ip:'8.8.8.8'}));
  const b=parseHttp(source('ipapi'),json({ip:'1.1.1.1',country:'United States'}));
  assert.equal(evaluate([a,b]).egressConsistent,false);
  assert.equal(evaluate([a]).egressConsistent,null);
  assert.equal(evaluate([a,{...b,facts:{...b.facts,ip:'8.8.8.8'}}]).egressConsistent,true);
});

test('browser policy blocks local endpoints, credentials, mutations, downloads and telemetry',()=>{
  for(const url of ['http://127.0.0.1/','https://localhost/','http://10.0.0.1/','https://a.local/','https://[::1]/','https://user:pass@example.com/','claude://open','file:///etc/passwd','https://www.google-analytics.com/a','https://example.com:8080/'])assert.equal(requestAllowed({url,method:'GET'}),false,url);
  assert.equal(requestAllowed({url:'https://example.com/',method:'POST'}),false);
  assert.equal(requestAllowed({url:'https://claude.ai/api/organizations',method:'GET'}),false);
  assert.equal(requestAllowed({url:'https://claude.ai/cdn-cgi/trace',method:'GET'}),true);
});

test('all collectors receive only the owned ATT proxy; failures never fall back',async()=>{
  const seen=[];let closed=0;
  const report=await collect({sources:[source('cloudflare'),source('ipify'),source('aizx')],stateDir:'/unused',
    startProxy:async opts=>{assert.equal(opts.route,'att');return {proxyServer:'http://127.0.0.1:23456',close:async()=>closed++};},
    fetch:async opts=>{seen.push(opts);throw Error('secret-sentinel');},
    browser:async(s,opts)=>{seen.push(opts);return parseBrowser(s,'16/ 100',{completed:true});}});
  assert.equal(seen.length,4);assert.ok(seen.every(x=>x.proxyServer==='http://127.0.0.1:23456'));
  assert.equal(closed,1);assert.equal(report.cleanupConfirmed,true);assert.equal(JSON.stringify(report).includes('secret-sentinel'),false);
});

test('native anonymous POST is exact-site, one-use and target-bound',()=>{
  const token={sourceId:'cleanip',url:'https://cleanip.io/api/v2/token',frameUrl:'https://cleanip.io/claude',method:'POST',body:JSON.stringify({seed:'synthetic-seed',nonce:123}),used:new Set()};
  assert.equal(nativeLookupPostAllowed(token),true);
  for(const change of [{sourceId:'checkcc'},{url:'https://evil.test/api/v2/token'},{frameUrl:'https://cleanip.io/login'},{method:'GET'},{used:new Set([token.url])},{body:'{}'},{body:JSON.stringify({seed:'x',nonce:1,password:'secret'})}])assert.equal(nativeLookupPostAllowed({...token,...change}),false);
  const batch={...token,url:'https://cleanip.io/api/v2/batch',expectedIp:'8.8.8.8',body:JSON.stringify({ips:['8.8.8.8'],mode:'full'})};
  assert.equal(nativeLookupPostAllowed(batch),true);
  for(const change of [{expectedIp:'1.1.1.1'},{body:JSON.stringify({ips:['127.0.0.1'],mode:'full'})},{body:JSON.stringify({ips:['8.8.8.8','1.1.1.1'],mode:'full'})},{body:JSON.stringify({ips:['8.8.8.8'],mode:'full',key:'secret'})}])assert.equal(nativeLookupPostAllowed({...batch,...change}),false);
});

test('startup, cancellation, and cleanup failures preserve unrun rows and cleanup truth',async()=>{
  const sources=[source('ipify'),source('aizx')];let calls=0;
  const report=await collect({sources,startProxy:async()=>{throw Error('att_startup_failed');},fetch:async()=>calls++});
  assert.equal(calls,0);assert.ok(report.rows.every(r=>r.status==='not_run'));
  const c=new AbortController();c.abort();
  const cancelled=await collect({sources,signal:c.signal,startProxy:async()=>{throw Error('cancelled');}});
  assert.ok(cancelled.rows.every(r=>r.status==='cancelled'));
  const bad=await collect({sources:[source('aizx')],startProxy:async()=>({proxyServer:'http://127.0.0.1:23456',close:async()=>{}}),browser:async()=>{throw Error('browser_cleanup_failed');}});
  assert.equal(bad.cleanupConfirmed,false);assert.equal(bad.error,'collection_failed');
  const proxyBad=await collect({sources:[],startProxy:async()=>({proxyServer:'http://127.0.0.1:23456',close:async()=>{throw Error('secret');}})});
  assert.equal(proxyBad.error,'cleanup_failed');assert.equal(proxyBad.cleanupConfirmed,false);
});

test('browser startup pins GUI-free Chrome and propagates unconfirmed cleanup',async()=>{
  let options;
  const row=await collectBrowser(source('aizx'),{proxyServer:'http://127.0.0.1:23456',stateDir:'/unused',launch:async(_controller,opts)=>{options=opts;throw Error('Chrome session startup or ownership verification failed; owned browser and temporary profile were closed.');}});
  assert.equal(options.mode,'headless');assert.equal(options.chromePath,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  assert.deepEqual(options.route,{mode:'proxy',server:'http://127.0.0.1:23456'});assert.equal(row.cleanupConfirmed,true);
  await assert.rejects(collectBrowser(source('aizx'),{proxyServer:'http://127.0.0.1:23456',stateDir:'/unused',launch:async()=>{throw Error('Chrome owner exited without confirmed cleanup; inspect this operation under stateDir.');}}),/browser_cleanup_failed/);
});

test('Markdown masks addresses and escapes source text',()=>{
  const row=parseHttp(source('ipify'),json({ip:'8.8.8.8'}));row.summary='8.8.8.8 | injected\nrow';
  const md=renderMarkdown({observedAt:'2026-10-19',rows:[row],assessment:evaluate([row]),cleanupConfirmed:true});
  assert.ok(!md.includes('8.8.8.8'));assert.match(md,/8\.8\.\*\.\* \\\| injected row/);
  assert.match(md,/未啟動/);
});
