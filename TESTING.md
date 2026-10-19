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

The 12 offline tests use small sanitized DOM fixtures and injected owners. They
perform no HTTP/DNS/browser/account operation. They cover retired-source refusal,
component points and lineage, combined-vs-separate verdicts, unknown/malformed/
unfinished results, main-document failures, static-only request permissions,
parallel completion/order/ATT propagation, individual failure isolation,
cancellation, stalled-page deadlines, cleanup uncertainty, colors/alignment and
HTML/Markdown/terminal escaping. They do not prove live provider access.

Live acceptance, authorized separately from the offline suite:

```sh
node src/cli.mjs --run
```

The CLI prints the provider-column table (green/red on a terminal, plain when
piped or `NO_COLOR` is present) and writes `report.html`, `report.ansi`,
`report.md` and `report.json` to a new private report directory. It never opens a
GUI. HTML is self-contained with no scripts or external resources; open it only
if desired. The ANSI file always retains color. JSON includes bounded native
text, component values, blocked requests and timings; do not publish it.

Latest full acceptance: all three providers completed on 2026-10-19 at
09:56 America/Los_Angeles, total **12.8 seconds** including ATT/Chrome ownership
and cleanup. Per-page times: Claude Test 4.0s, AIZX 10.9s, FuckClaude 8.5s.
These overlap; do not sum them or promise the same latency on future networks.

Before source-policy changes ship, verify actual native results and cleanup.
Rendering-only changes can regenerate an existing report without contacting
providers. For visual inspection, run the original IPQuality renderer with
offline fixture values, then screenshot only the local report using owned
headless Chrome with all requests denied. No IP run is needed to compare layouts.

Exit 1 denotes a run-level/cancellation/cleanup failure. Individual provider
unknown/unavailable outcomes remain table columns; inspect their states rather
than treating exit 0 as every check passing. The App remains untested.
