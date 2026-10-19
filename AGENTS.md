# CCQuality

Claude-related **local environment** checks for this Mac. IP, ASN, reputation,
DNS, exit comparisons and country eligibility belong to IPQuality, not here.

```sh
cd /Users/zmx/Projects/projects/ccquality
node src/cli.mjs                 # offline disclosure plan
node src/cli.mjs --run           # three local checks through ATT
npm run check                   # offline validation
```

Default providers: Claude Test, AIZX and FuckClaude's native browser scan.
`--sources id,id` selects a subset from [src/catalog.mjs](src/catalog.mjs).
The report follows IPQuality's layout: providers are columns, checks are rows.
Green means the source passed that item, red means it flagged/added points,
grey means unmeasured/unavailable. No aggregate ban probability is produced.

## Execution boundaries

- **Never launch, activate, automate or read private state from Claude App.**
  No Claude CLI, login, account credentials, helper, payment or app endpoint.
- One isolated managed ATT proxy, three independent native headless Chrome
  sessions in parallel. Never attach to personal Chrome, change system settings,
  mutate resident Clash, rotate routes, or fall back to direct.
- Requests are limited to the selected page, its same-origin static assets and
  Claude Test's two exact static rule files. Reject IP APIs, trace/DNS probes,
  other sites, telemetry, account routes, arbitrary fetch and all POSTs.
- Disable every Claude Test network/helper checkbox before starting. Do not
  click AIZX's optional network scan. Disable WebRTC and service workers before
  page scripts; deny WebSockets, popups and downloads. Missing is never PASS.
- Preserve native language/timezone; do not disguise the testing browser.
  Its observations and automation flags do not establish Claude App's fingerprint.
- Start each source once, cap its page collection at 15 seconds, preserve
  partial/failure results, await every task and owner cleanup. Separate sessions
  avoid the background-tab throttling seen with one browser and three tabs.
- AIZX derives from FuckClaude: two displayed providers, not two independent
  confirmations. Font/language/Emoji scoring is a website heuristic, not an
  Anthropic rule or a recommendation to remove fonts/change locale.
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
