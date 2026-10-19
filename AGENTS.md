# CCQuality

Local evidence collector for Claude **desktop App on this Mac**, using the
managed ATT node. Start with this file; implementation lives directly in `src/`.

## Entry points

```sh
cd /Users/zmx/Projects/projects/ccquality
node src/cli.mjs                 # offline disclosure plan
node src/cli.mjs --run           # all sources through isolated ATT
npm run check                   # offline tests, no browser/network
```

`--sources id,id` selects a focused diagnostic run. Source IDs, URLs and scopes
are authoritative in [src/catalog.mjs](src/catalog.mjs). If Cloudflare is selected,
its trace is measured again at the end to detect an exit change.

## Boundaries

- **Never launch, activate, automate or read the private state of Claude App.**
  No Claude CLI, login, Cookie, API key, account endpoint or payment operation.
  Public support pages and anonymous HTTP trace endpoints are separate probes.
- Every provider request uses a caller-owned, temporary ATT HTTP proxy. No
  direct/alternate-node fallback; never change resident Clash state or selectors.
  The node comes from network-manager's managed ATT source, not a claim that
  Claude App's live requests or its current Clash rule match that route.
- Fresh native headless Chrome only. Never attach to personal Chrome, load a
  persistent profile, export sessions, solve verification or disguise automation.
  Use text/DOM only. Keep the system language/timezone unchanged.
- WebRTC is disabled before page scripts run: HTTP proxying cannot guarantee
  an ATT route for UDP. Missing WebRTC is **unknown**, even if a website says clean.
  Service workers, WebSockets, popups, downloads, local helpers and arbitrary POST
  are blocked. CleanIP alone may complete one native anonymous token handshake
  and one exact-observed-IP lookup; bodies remain in the browser. Native GET requests may reach its public data
  providers through the same ATT proxy. Do not execute a site's repair scripts.
- Preserve each source's scale, direction, coverage, timestamp and uncertainty.
  A site's percent is an uncalibrated index, never a ban probability. Score 0,
  unavailable, missing, incomplete and account-not-tested are different states.
- IP country is not the user's physical location, residency or account eligibility.
  Browser fingerprints do not describe the desktop App. Automation marks from
  this test cannot be attributed to Claude App. Derived scoring methods and
  aggregated datasets are not independent corroboration.
- Keep live evidence, full IPs and browser state in ignored private directories.
  JSON may contain full IPs; Markdown masks IPv4 and observed fingerprint hashes.
  GitHub source is public on the primary remote; review the staged content.
- No forwarding wrappers or unnecessary MCP/server layer. Import shared functions
  directly from myutils and managed-proxy's actual owner. Preserve unrelated work.

## Documents

| File | Purpose |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | Latest verification and unresolved evidence |
| [PROVIDERS.md](PROVIDERS.md) | Measurement semantics, website limitations, provenance |
| [COMMON_FUNCTIONS.md](COMMON_FUNCTIONS.md) | Direct shared APIs and implementation map |
| [TESTING.md](TESTING.md) | Setup, offline and live validation |
| [SERVICES.md](SERVICES.md) | Temporary process ownership; no resident service |

Only `main` is maintained. Enabled remotes are `github-kratoszmx` and
`github-kratosbackup`, both repository name `ccquality`. Push reviewed changes to
both and read back the exact commit. The backup is private; the primary is public.

The reference research came from the network-manager `mcp維護` chat
`01a070db-71c4-7772-9d2a-0a0617ff66f7`, reviewed on 2026-10-19. Its early idea of
embedding diagnostics in network-manager was superseded by the user's explicit
request for this separate project. IPQuality supplied the per-source reporting
approach; no AGPL implementation was copied.
