# CCQuality

Claude-related **local environment** checks for this Mac. IP, ASN, reputation,
DNS, exit comparisons and country eligibility belong to IPQuality, not here.

```sh
cd /Users/zmx/Projects/projects/ccquality
node src/cli.mjs                 # offline disclosure plan
node src/cli.mjs --run           # eight local-check sites through ATT
npm run check                   # offline validation
```

Default providers: CheckCC, Claude Test, CleanIP, PING IP, AIZX, FuckClaude,
AmIChinaFlagged and claude-tester. Exclude platforms whose local results require
an IP query; do not retain skipped-only columns or restore IP tests.
`--sources id,id` selects a subset from [src/catalog.mjs](src/catalog.mjs).
Each provider is one module in [src/providers/](src/providers/) owning its URL,
start flow, completion signal, parser, weights and declared static exceptions,
plus one sanitized fixture. Add a site only when it brings a rule family not
already shown; clones of an existing weight set stay in PROVIDERS.md's reviewed list.
The report follows IPQuality's layout: providers are columns, checks are rows.
Green means the source passed that item, red means it flagged/added points,
grey means unmeasured/unavailable. Each metric includes its App relevance.
Normal output contains the table and its brief timestamp only: no explanatory
paragraphs, legend, cleanup success message or artifact-path dump.

## Execution boundaries

- **Never launch, activate, automate or read private state from Claude App.**
  No Claude CLI, login, account credentials, helper, payment or app endpoint.
- One isolated managed ATT proxy, at most three independent native headless
  Chrome sessions in parallel, taking the next source as a slot becomes free.
  Never attach to personal Chrome, change system settings,
  mutate resident Clash, rotate routes, or fall back to direct.
- Requests are limited to the selected page, its same-origin static assets,
  CleanIP's explicit static CDN asset directories and Claude Test's two exact
  static rule files. Reject IP APIs, trace/DNS probes, other sites, telemetry
  (including same-origin `/_vercel/`), account routes, arbitrary fetch and all POSTs.
- Disable every Claude Test network/helper checkbox before starting. Do not
  click AIZX's optional network scan. Disable WebRTC and service workers before
  page scripts; deny WebSockets, popups and downloads. Missing is never PASS.
- Preserve native language/timezone; do not disguise the testing browser.
  Its observations and automation flags do not establish Claude App's fingerprint.
- Start each source once, cap its page collection at 15 seconds, preserve
  partial/failure results, await every task and owner cleanup. Separate sessions
  avoid the background-tab throttling seen with one browser and three tabs.
  Stop CheckCC after its local rows populate; never wait for its blocked network
  workflow or report its changing total. Do not retry failed IP prerequisites.
- AIZX derives from FuckClaude and AmIChinaFlagged uses AIZX's same nine
  weights: three displayed providers, not three independent confirmations.
  claude-tester is a separate six-signal family. Font/language/Emoji scoring is a website heuristic, not an
  Anthropic rule or a recommendation to remove fonts/change locale.
- The App relevance column distinguishes official collection categories from
  site conjecture and Chrome/origin-specific data. Official collection is not
  proof of a ban threshold. Claude Code claims are not Desktop verification.
  Keep reviewed references in `src/app-evidence.mjs`; normal runs do not refetch
  policies or contact Claude/Anthropic. Details remain in docs/JSON and tooltips.
- Keep reports and runtime state in ignored owner-private directories. Do not
  commit raw website evidence, profiles, full IPs or credentials.
- Import maintained myutils and network-manager APIs directly; no forwarding
  wrappers, resident MCP/server layer or copied IPQuality implementation.

## Ownership and documents

| File | Purpose |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | Current validation and delivery state |
| [PROVIDERS.md](PROVIDERS.md) | Source semantics, omitted work and limitations |
| [COMMON_FUNCTIONS.md](COMMON_FUNCTIONS.md) | Implementation and shared API map |
| [TESTING.md](TESTING.md) | Setup and offline/live verification |
| [SERVICES.md](SERVICES.md) | Temporary process and report ownership |

Maintain only `main`. Enabled remotes: `github-kratoszmx` (existing public
`kratoszmx/ccquality`) and `github-kratosbackup` (private
`kratosbackup/ccquality`). Push reviewed validated work to both and read back the
exact local commit. Preserve unrelated work in the shared repositories.

The initial research was in network-manager's `mcp維護` chat
`01a070db-71c4-7772-9d2a-0a0617ff66f7`. The user's 2026-10-19 correction supersedes
its broader IP/network scope. Historical private reports remain dated evidence;
their results must not be substituted for a new local-only run.
