# Provider and App evidence contracts

The eight candidates come from network-manager's `mcp維護` chat
`01a070db-71c4-7772-9d2a-0a0617ff66f7`. That research compared features and
method transparency; it did not validate ban predictions or establish a
reputation ranking. Coverage is not endorsement. All eight remain visible,
including a site that cannot produce local results without querying an IP.

| Provider | Native action and local evidence | Method / limitation |
| --- | --- | --- |
| [CheckCC](https://checkcc.org/) | Click `立即检测 Claude 环境`, then `开始检测` in its native target dialog; read ten local contributions and OS, then stop | [Open source](https://github.com/yacuo/check-cc). Its total keeps changing during blocked network work and is discarded. Language, writing system and locale are separate native contributions. |
| [Claude Test](https://claudetest.app/tools/environment/) | Disable all nine network/helper options, then `#scan` | Combined Chinese/region signal and this page's storage. Do not split the combined signal into separate passes. Its displayed index is partial. |
| [CleanIP](https://cleanip.io/claude) | Click `开始检测`; parse section `07 · 本地系统` | Seven local region components, automation and OS. Use its local region index, never the network-dependent overall safety score. |
| [PING IP](https://pingip.co/claude) | Automatic scan; read `FULL INSPECTION` | Timezone/offset as one native finding and browser language. Reject its network-dependent “100 safe” total and unanswered account questionnaire. |
| [AIZX](https://aizx.ai/tools/claude-region) | Click `开始检测`; do not start the optional network scan | Nine local dimensions, derived from FuckClaude; agreement is not independent validation. |
| [FuckClaude](https://fuck-claude.vercel.app/) | Click `#retest`; no `/api/check` request | [Open source](https://github.com/LinXiaoTao/FuckClaude). Nine local dimensions. Exclude its disabled-WebRTC “no leak” result; the displayed original index is partial. |
| [AmIChinaFlagged](https://amichinaflagged.com/) | Click `开始检查`; only the native local page | Nine local dimensions. Do not parse the 72/100 and 12/100 demonstration scores or use its network/header API. Its Claude Code claims do not verify Desktop behavior. |
| [IPBook](https://ipbook.net/check/) | Automatic page; observe its failed IP prerequisite | Currently requires `/api/whoami` before rendering results. That request is denied; show `需 IP，略過`, never historical/synthetic results. |

The pages and their native DOM were checked through ATT on 2026-10-19. A
website's statement about what Anthropic uses is its claim, not an official
finding. FuckClaude's own repository describes reported **Claude Code**
behavior and calls its other signals general environment fingerprints. Neither
that description nor AmIChinaFlagged's Code claim proves Claude Desktop uses
the same signals.

## What can actually inform an App assessment?

| Metric group | App relevance used in the table | Verified basis and boundary |
| --- | --- | --- |
| Timezone, UTC offset, OS | Indirect reference | [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy), effective 2026-09-10, lists timezone, device and OS data. Same-Mac browser observations can inform environment review. Collection does not establish a ban threshold or the exact value sent by the App. |
| Browser language / Intl locale | Chrome only | [Navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages) is browser preference data. [Electron language/locale APIs](https://www.electronjs.org/docs/latest/api/app#appgetpreferredsystemlanguages) distinguish application locale, system locale and preferred system languages. No App value is measured here. |
| Browser/WebView and automation | Testing Chrome only | Native UA/automation findings describe the collector, not Claude Desktop. The App's embedded browser session is not this fresh Chrome session. |
| Page storage / cookies | Site-specific, not App evidence | [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) belongs to an origin; [Electron sessions](https://www.electronjs.org/docs/latest/api/session) own cookies/storage. A checker page cannot verify Claude App login storage. |
| Chinese/script/vendor fonts, brand, Emoji, regional total | Website conjecture | No reviewed official source validates these contribution weights for Desktop bans. The [official safeguards page](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals) lists policy/terms violations and unsupported-location account creation, not these font or Emoji thresholds. |

The sources above were read through ATT on 2026-10-19. Static read-only
inspection of this Mac's installed Claude 2.42304.0 bundle found
`Electron Framework.framework`; no executable, account, user profile or App
endpoint was opened. Framework presence alone proves neither shared Chrome
preferences nor what the App transmits.

Relevance and dated references live in `src/app-evidence.mjs` and are included
in each JSON report. The matrix includes the classification directly; HTML
cells link to the relevant source and give fuller explanations on hover.
Normal runs make no policy/research requests.

## Reading native values

Green requires an explicit native pass or a valid zero contribution for a
completed local item. Positive points/abnormal labels are red. Missing,
pending, unknown, malformed or changed-weight results stay grey. A successful
HTTP response or an initial zero is not a completed measurement.

CleanIP supplies explicit local component points without individual raw font
lists. Preserve that fact instead of inventing font values. It currently treats
macOS system fonts differently from CheckCC/AIZX/FuckClaude/AmIChinaFlagged.
PING IP does not deduct for the same language that CheckCC flags. These
disagreements are visible in the matrix, not averaged away.

The index row distinguishes native local indices from partial original
indices. Never use a changing CheckCC total, CleanIP's mixed overall score,
PING IP's failed-network safety score or an IPBook marketing warning as a local
result. No combined score or ban probability exists.

## Request policy and timing

Every website request uses an owned ATT proxy. Allow only the selected HTTPS
document, same-origin static assets, Claude Test's two exact static rule files,
and CleanIP's static CDN asset directories (`/_nuxt/v2/`,
`/fonts/google-sans/`, `/libs/fontawesome/`). The CDN exception does not allow
fetch/XHR, query parameters, API routes or analytics.

All IP, ASN, reputation, geo/trace/DNS, Claude endpoint, helper, arbitrary
fetch/POST, WebSocket, service-worker and WebRTC activity is denied before
page scripts run. No fallback, proxy rotation or second automatic attempt.
Ignore any site's “connected/no leak” claim produced after its requests were
denied.

At most three independently owned native headless Chrome sessions run at a
time. Each page has a 15-second collection deadline; a free slot starts the
next candidate immediately. Hydration waits apply only to the four sites with
server-rendered controls. No personal browser or system setting is changed.
Normal output is just the table and timestamp; detailed provenance and
failures remain in the private JSON.
