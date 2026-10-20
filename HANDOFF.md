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

Review of commit `425a091`: the seven existing parsers produce identical
results before and after the module extraction on all seven fixtures. The
bounded worker pool, ATT ownership and cleanup behavior remain intact.
The added claude-tester provides six signals weighted 30/24/20/10/8/8.

Two findings were fixed:

- The new AmIChinaFlagged label incorrectly claimed FuckClaude's weights.
  It now says `同 AIZX 權重` and retains its own lineage: equal weights prove
  overlap, not shared code ancestry or independent validation.
- An older request-policy gap allowed server redirects to bypass the URL
  checks: Playwright routes only the first URL. A native Chrome loopback
  fixture reproduced a forbidden destination receiving a request. The new
  CDP response interceptor rejects redirects before Chrome follows them,
  preserving native ATT transport. Guard startup/protocol failure stops the
  page. AmIChinaFlagged's root returns 307 to `/zh`; its provider now enters
  the reviewed `/zh` page directly.

Reviewed alternatives and their exact scope remain in PROVIDERS.md.
Same-origin `/_vercel/` analytics paths remain denied.

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

All **19 offline tests** and `npm run check:browser` pass. The native test
serves only local fixture responses: HTTP 200 succeeds, five redirect types
are blocked, and the forbidden destination receives zero requests.

Live validation used ATT on **2026-10-20**:

- **00:31 America/Los_Angeles**, default eight-source run, **19.3 seconds**:
  seven sources reached `measured`; the new interceptor blocked
  AmIChinaFlagged's 307 from `/`.
- **00:34**, only AmIChinaFlagged after its `/zh` correction, **8.9 seconds**:
  all nine local components reached `measured`, index 16/100, no redirect.
  Only the affected provider was rerun; the reports were not merged.

Both runs confirmed cleanup. The earlier **00:16** report contains an AIZX
timeout while its final Emoji item was pending. This remains an unknown
measurement, not a passing result or evidence of App risk. The 00:31 run
completed AIZX in 12.1 seconds within the unchanged 15-second deadline.

| Source | Local outcome | Page time |
| --- | --- | --- |
| CheckCC | Language +20, writing system +12, fonts +16, locale +3, Emoji +1; network-dependent total excluded | 3.6s |
| Claude Test | Combined regional item +5; page storage passes; partial index 5/100 | 3.1s |
| CleanIP | Local region index 0/100; marks the collector's automation, not the App | 7.2s |
| PING IP | Timezone/offset and language pass; failed-network total excluded | 1.6s |
| AIZX | Local index 16/100, Chinese fonts 16/16 | 12.1s |
| FuckClaude | Fonts 14/14, Emoji 1/3; partial index 15/100 | 8.5s |
| AmIChinaFlagged | Separate 00:34 `/zh` run: local index 16/100, Chinese fonts 16/16 | 6.4s |
| claude-tester | Local index 39/100: language 12/24, fonts 20/20 (PingFang SC), Intl 5/10, Emoji 2/8 | 6.0s |

Page times overlap. At most three independent native headless Chrome owners
run concurrently, with a 15-second page deadline. Private evidence:
`reports/2026-10-20T07-31-12-457Z-t1d4ky/` and the separate correction check
`reports/2026-10-20T07-34-14-717Z-c7BuUn/`. Historical reports are unchanged.

This review's website reads and scans used ATT. The official privacy and
safeguards references were refreshed on 2026-10-20. Repeated local font,
language and Emoji flags do not establish an urgent App setting change; the
automation flag describes the collector. A read-only check of the running
Clash controller found its Claude policy selecting ATT through its nested
selector, with macOS system proxy enabled. This confirms configuration, not
an App connection or the account's eligibility.

Claude App was never launched or activated, and no App profile/account state
was read. No shared myutils/network-manager source or resident Clash setting
changed.

Delivery targets remain `github-kratoszmx` and `github-kratosbackup` on `main`.
Each delivery must push the reviewed local commit and read back both exact
remote refs. Reports, profiles, temporary scripts and credentials stay ignored.
