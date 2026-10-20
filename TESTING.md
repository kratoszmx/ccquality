# Validation

Use existing Node >=22.13, installed Google Chrome, and network-manager's ATT
environment. No browser download, Python environment or resident service is needed.

Restore dependencies from the populated local cache with
`npm ci --offline --ignore-scripts --no-audit --no-fund`. The browser-session file
dependency points to the maintained sibling myutils checkout; playwright-core
controls the already-installed Chrome.

```sh
npm run check
node src/cli.mjs
node src/cli.mjs --help
git diff --check
```

The 18 offline tests use small sanitized DOM fixtures and injected owners. They
perform no HTTP/DNS/browser/account operation. They cover standalone IP-source refusal,
component points and lineage, combined-vs-separate verdicts, unknown/malformed/
unfinished results, main-document failures, static-only request permissions,
bounded three-owner execution/order/ATT propagation, individual failure isolation,
cancellation, stalled-page deadlines, cleanup uncertainty, colors/alignment and
HTML/Markdown/terminal escaping. They also cover CheckCC's native two-step start,
rejection of network-dependent totals, AmIChinaFlagged's demonstration scores,
refusal of the removed IPBook ID before live work, App evidence categories and removal of normal-output
notes/paths. Every provider module must declare its flow contract and parse its
fixture to `measured`; claude-tester's zero-omitting summary chips and
overweight values are rejected, and same-origin `/_vercel/` analytics is denied.
A new provider needs its module, catalog entry and fixture before this passes.
They do not prove live provider access.

Live acceptance, authorized separately from the offline suite:

```sh
node src/cli.mjs --run
```

The CLI prints only the provider-column table and timestamp (green/red on a terminal, plain when
piped or `NO_COLOR` is present) and writes `report.html`, `report.ansi`,
`report.md` and `report.json` to a new private report directory. It never opens a
GUI. HTML is self-contained with no scripts or external resources; open it only
if desired. The ANSI file always retains color. JSON includes bounded native
text, component values, blocked requests and timings; do not publish it.

The default run covers eight providers with local results; three share one FuckClaude weight family.
Platforms requiring an IP query before producing results are excluded.
CheckCC's completed local rows do not mean its blocked full scan completed.
Per-page durations overlap; do not sum them or promise fixed network latency.
The latest accepted timing and private evidence directory are in HANDOFF.md.

Before source-policy changes ship, verify actual native results and cleanup.
Rendering-only changes can regenerate an existing report without contacting
providers. For visual inspection, run the original IPQuality renderer with
offline fixture values, then screenshot only the local report using owned
headless Chrome with all requests denied. No IP run is needed to compare layouts.

Exit 1 denotes a run-level/cancellation/cleanup failure. Individual provider
unknown/unavailable outcomes remain table columns; inspect their states rather
than treating exit 0 as every check passing. The App remains untested.
