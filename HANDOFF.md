# Handoff — 2026-10-19

Version 0.3.1 keeps seven providers: CheckCC, Claude Test, CleanIP, PING IP,
AIZX, FuckClaude and AmIChinaFlagged. At the user's request, platforms that
require an IP query before producing local results are excluded. IPBook's
catalog entry, parser, completion condition, skipped-state renderer and fixture
are removed; explicitly selecting its retired ID fails before live work.
The original `mcp維護` research compared features/transparency, not verified
ban-prediction accuracy.

Terminal entrypoint:

```sh
cd /Users/zmx/Projects/projects/ccquality
node src/cli.mjs --run
```

The absolute CLI path also works from another directory. Omit `--run` for an
offline plan. Help derives the provider count directly from the catalog.

The table now states **App relevance for each metric**, with dated official
and technical references. Timezone/OS are indirect references to categories
Anthropic says it collects. Browser language, Intl, WebView, automation and
site storage do not establish the App's corresponding state. Fonts, writing
system, device-brand and Emoji contributions remain website conjecture.
Claude Code claims are not evidence of Claude Desktop behavior.

Normal output is just the provider-column table and brief timestamp. Removed
the requested scope paragraphs, legend, score warnings, source commentary,
successful-cleanup message and four artifact paths. Full evidence stays in
private JSON/docs and HTML cell tooltips. Green/red are native item verdicts;
the App relevance column does not assign ban probabilities.

All 16 offline tests pass, including rejection of `--run --sources ipbook`
and absence of IPBook in all three table formats. No new website scan was
needed for this removal.

The latest provider measurements are from version 0.3's full live acceptance
at **22:24 America/Los_Angeles on 2026-10-19**. That historical eight-source run
took **18.6 seconds**, including the now-removed IPBook attempt and owned ATT/
Chrome startup and cleanup. The seven retained providers yielded:

| Source | Local outcome | Page time |
| --- | --- | --- |
| CheckCC | Local rows complete; language +20, writing system +12, fonts +16, locale +3, Emoji +1; network-dependent total excluded | 3.6s |
| Claude Test | Combined regional item +5; page storage passes; partial index 5/100 | 3.3s |
| CleanIP | Local region index 0/100; marks the collector's automation, not the App | 7.3s |
| PING IP | Local timezone/offset and language pass; failed-network “100 safe” total excluded | 1.9s |
| AIZX | Local index 16/100, Chinese fonts; derived from FuckClaude | 11.9s |
| FuckClaude | Fonts +14, Emoji +1; partial index 15/100; WebRTC verdict excluded | 8.6s |
| AmIChinaFlagged | Local index 16/100, Chinese fonts; demonstration scores excluded | 5.7s |

Page times overlap. At most three independent native headless Chrome owners
run concurrently, with a 15-second page deadline. CheckCC requires both its
entry button and the native `开始检测` target-dialog button. Local completion
does not require its blocked network workflow to finish. This was fixed after
the first integration run exposed the missed second action.

Previous live evidence, preserved unchanged:
`reports/2026-10-20T05-24-37-411Z-QRNF1a/`.
That run's local HTML screenshot was visually inspected against the existing offline
IPQuality rendering reference: 10 columns, 19 rows, no clipped table or
boilerplate footer. No website screenshot or live IPQuality test was used.
Earlier reports remain historical evidence and are not merged into this run.

Website/policy reads and live scans used ATT. Claude App was never launched or
activated, and no user profile/account state was read. The only App inspection
was static bundle metadata/framework presence, documented in PROVIDERS.md.
No shared myutils/network-manager source or resident Clash setting changed.
The separate research proxy and every collection/preview owner closed.

Delivery targets remain `github-kratoszmx` and `github-kratosbackup` on `main`.
Each delivery must push the reviewed local commit and read back both exact
remote refs. Reports, profiles, temporary scripts and credentials stay ignored.
