# Provider contracts

Exactly three Claude-related pages are collected. No independent IP lookup or
direct Claude/Anthropic request is part of this project. All allowed website
requests use the isolated ATT proxy; ordinary page requests expose that connection
to the selected website. No API credentials, subscription or paid query is used.

| Provider | Native action | Reported local items |
| --- | --- | --- |
| [Claude Test](https://claudetest.app/tools/environment/) | Disable all nine network/helper options, click `#scan` | Combined Chinese/region signal and this page's storage support. Its combined language/timezone/font finding is not split into individual verdicts. |
| [AIZX](https://aizx.ai/tools/claude-region) | Click `开始检测`; no optional network check | Timezone, language, Chinese fonts, vendor fonts, browser/WebView, device brand, Intl locale, offset, Emoji. |
| [FuckClaude](https://fuck-claude.vercel.app/) | Click `#retest` on the native page, not `/api/check` | Nine local items matching AIZX's dimensions, with different weights. Its WebRTC item is deliberately excluded. |

AIZX documents derivation from FuckClaude. Agreement between them is not
independent corroboration. We execute native page scans and parse their visible
results; no source implementation is copied. Website advice and news are not
instructions and are not treated as verified Anthropic rules.

## Values and color

- Preserve each source's numeric contribution and denominator. Zero is green
  only when the completed source explicitly provides a valid zero for that item.
  Positive points or an explicit abnormal verdict are red. Absent fields,
  malformed scores, unknown weight versions and incomplete scans stay grey.
- Display the original total as neutral context. Different weights and missing
  checks make totals incomparable; do not average them or infer a ban probability.
- Claude Test's overall coverage includes intentionally disabled network checks;
  it is not a coverage estimate for this project's local-only matrix.
- FuckClaude currently reports disabled WebRTC as `no leak detected`. This
  collector rejects that conclusion. Its original total is retained with this
  limitation, without inventing a revised score.
- Readiness requires the native result marker. A readable homepage or transient
  zero is not completion. A failed source stays visible alongside successful peers.

## Request policy and speed

`src/browser.mjs` allows same-origin GET documents/assets, plus exact static
`/rules/context-v3.json` and `/rules/network-v5.json` on Claude Test. The rules
contain scoring context, not a request for the user's IP. Other fetch/XHR,
POST, trace/DNS probes, external origins, WebSockets and service workers are
blocked. Assets needed for local font/rendering checks are preserved.

Each source gets a fresh native headless Chrome and a 15-second page deadline.
All three sources run in parallel on the same owned ATT proxy. No page reload,
collector retry or alternate route is used. AIZX has a short hydration wait
before clicking its server-rendered control. Claude Test's dynamic controls must
exist before settings are changed. Original Mac language/timezone are preserved.

## Removed scope

Cloudflare/ipify/IPWHOIS/ipapi, official region-list fetches, anonymous Claude/API
trace, HTTP-only FuckClaude/Am I China Flagged, CleanIP and IPBook are removed.
PING IP primarily duplicates IP intelligence, so is removed too. CheckCC's broad
network workflow and unfinished 60-second result are outside this fast local
scope. Old IDs are rejected rather than quietly triggering obsolete probes.

The App, its actual routing/fingerprint, account status, payment, identity and
usage history remain unmeasured. Inspecting a fresh Chrome is not inspecting the
App; no website score changes that boundary.
