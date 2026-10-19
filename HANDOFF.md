# Handoff

## Current implementation — 2026-10-19

First version implements eight checker sources, independent network/geography
observations and current official supported-region context. The user confirmed
the target is this Mac's Claude App. The App must never be launched by this
project. All live website tests use an isolated managed ATT node.

Source selection and reports are in `src/`; shared HTTP and browser APIs are
direct myutils dependencies. No forwarding MCP, copied IPQuality implementation,
background service or live Clash change was introduced.

Offline validation: `npm run check` passes all 16 tests. Full ATT acceptance
completed at 2026-10-19 09:27–09:30 America/Los_Angeles; the final bounded native
Chrome extraction was separately exercised with AIZX. No GUI or Claude App was
opened. The full raw report is retained under ignored `reports/`; the final
table re-parses that same captured text with the current parser, retaining source
timestamps, input SHA-256 and parser SHA-256 without new network requests.

Observed: seven HTTP exit observations (including the ending repeat) agreed;
geography and ASN sources reported US / AT&T / AS7018. Official support-page
context includes the US. Website results: FuckClaude HTTP 2/100 (62/100 declared
coverage), Am I China Flagged low, Claude Test 5/100 (67% scoring coverage),
PING IP safety 100/100 (75% declared confidence), AIZX features 16/100, IPBook
risk 7/100 with trust 100. CleanIP reported residential/mobile carrier context,
AS7018 and no abuse/blacklist record in its own data. These are provider claims,
not an independently validated ban model.

CheckCC remained at a transient 53/100 after 60 seconds, with unfinished fields
and conflicting edge/aggregate ASNs. It is explicitly partial. IPBook's website
reachability outcome differed from the successful anonymous trace; probe methods
are not interchangeable. App/account/physical-location/payment evidence remains
unmeasured. Known semantics:
HTTP-only scores do not measure local language/fonts; native Chrome uses this
Mac's language/timezone. WebRTC is deliberately unmeasured. CleanIP permits
only its native anonymous handshake and a target-bound IP lookup; other POSTs
remain blocked, and incomplete intelligence stays unknown.

Repositories: existing public `kratoszmx/ccquality`, newly created private
`kratosbackup/ccquality`. Both are enabled. Private reports and `.state/` are
excluded from source commits; final delivery requires both remote main refs to
match the reviewed local commit.
