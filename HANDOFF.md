# Handoff — 2026-10-20

Version 0.4.0 runs eight providers: CheckCC, Claude Test, CleanIP, PING IP,
AIZX, FuckClaude, AmIChinaFlagged and claude-tester. Platforms that require an
IP query before producing local results stay excluded; IPBook's retired ID is
rejected before live work.

Structure: each provider is one module in `src/providers/` that owns its URL,
start flow, completion signal, parser, weights and static request exceptions.
The shared collector, request policy and row schema no longer branch on
provider IDs. `detectionComplete` is replaced by each module's `complete`.
Collection workers no longer use an unreachable `worker_failed` path, the
cleanup-failure pattern is one constant, and the report timestamp uses the
system timezone instead of a fixed America/Los_Angeles label.

Provider review on 2026-10-20 (details in PROVIDERS.md): claude-tester was
added as the only rule family not already shown (six signals, 30/24/20/10/8/8,
open source). okTest repeats AIZX's nine weights; ClaudeFlag and JinDaGe
repeat claude-tester's six; IPPure, Claude Guard and Claude Ban Check need IP
or server queries. AmIChinaFlagged's weights equal AIZX's, so it is now labelled
`同 FuckClaude 權重` with lineage `fuckclaude-weights`. Same-origin `/_vercel/`
analytics paths are denied.

Terminal entrypoint:

```sh
cd /Users/zmx/Projects/projects/ccquality
node src/cli.mjs --run
```

The table labels its App relevance column `Claude App參考性`, with dated official
and technical references. Timezone/OS are indirect references to categories
Anthropic says it collects. Browser language, Intl, WebView, automation and
site storage do not establish the App's corresponding state. Fonts, writing
system, device-brand and Emoji contributions remain website conjecture.
Claude Code claims are not evidence of Claude Desktop behavior.

All 18 offline tests pass. Full live acceptance ran at **00:01 America/Los_Angeles
on 2026-10-20** after the refactor: **23.5 seconds** for eight sources,
including owned ATT/Chrome startup and cleanup. Every source reached
`measured`; cleanup was confirmed and no collector Chrome remained.

| Source | Local outcome | Page time |
| --- | --- | --- |
| CheckCC | Language +20, writing system +12, fonts +16, locale +3, Emoji +1; network-dependent total excluded | 3.5s |
| Claude Test | Combined regional item +5; page storage passes; partial index 5/100 | 3.1s |
| CleanIP | Local region index 0/100; marks the collector's automation, not the App | 7.3s |
| PING IP | Timezone/offset and language pass; failed-network total excluded | 1.7s |
| AIZX | Local index 16/100, Chinese fonts 16/16 | 10.8s |
| FuckClaude | Fonts 14/14, Emoji 1/3; partial index 15/100 | 8.5s |
| AmIChinaFlagged | Local index 16/100, Chinese fonts 16/16 | 7.5s |
| claude-tester | Local index 39/100: language 12/24, fonts 20/20 (PingFang SC), Intl 5/10, Emoji 2/8 | 6.2s |

Page times overlap. At most three independent native headless Chrome owners
run concurrently, with a 15-second page deadline. Private evidence:
`reports/2026-10-20T07-01-20-266Z-7jayt6/`. That run predates the shortened
AmIChinaFlagged method label, a rendering-only change. Earlier reports remain
historical evidence and are not merged into this run.

Website reads and live scans used ATT or the configured local proxy for public
page text. Claude App was never launched or activated, and no user
profile/account state was read. No shared myutils/network-manager source or
resident Clash setting changed.

Delivery targets remain `github-kratoszmx` and `github-kratosbackup` on `main`.
Each delivery must push the reviewed local commit and read back both exact
remote refs. Reports, profiles, temporary scripts and credentials stay ignored.
