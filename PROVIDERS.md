# Provider and App evidence contracts

The provider candidates come from network-manager's `mcp維護` chat
`01a070db-71c4-7772-9d2a-0a0617ff66f7`. That research compared features and
method transparency; it did not validate ban predictions or establish a
reputation ranking. Coverage is not endorsement. Keep the eight providers
that can produce local results without querying an IP. IPBook was removed
because it requires `/api/whoami` before rendering results; its old ID is
rejected before any network or browser startup. claude-tester was added on
2026-10-20 as the only reviewed rule family not already shown (see below).

| Provider | Native action and local evidence | Method / limitation |
| --- | --- | --- |
| [CheckCC](https://checkcc.org/) | Click `立即检测 Claude 环境`, then `开始检测` in its native target dialog; read ten local contributions and OS, then stop | [Open source](https://github.com/yacuo/check-cc). Its total keeps changing during blocked network work and is discarded. Language, writing system and locale are separate native contributions. |
| [Claude Test](https://claudetest.app/tools/environment/) | Disable all nine network/helper options, then `#scan` | Combined Chinese/region signal and this page's storage. Do not split the combined signal into separate passes. Its displayed index is partial. |
| [CleanIP](https://cleanip.io/claude) | Click `开始检测`; parse section `07 · 本地系统` | Seven local region components, automation and OS. Use its local region index, never the network-dependent overall safety score. |
| [PING IP](https://pingip.co/claude) | Automatic scan; read `FULL INSPECTION` | Timezone/offset as one native finding and browser language. Reject its network-dependent “100 safe” total and unanswered account questionnaire. |
| [AIZX](https://aizx.ai/tools/claude-region) | Click `开始检测`; do not start the optional network scan | Nine local dimensions, derived from FuckClaude; agreement is not independent validation. |
| [FuckClaude](https://fuck-claude.vercel.app/) | Click `#retest`; no `/api/check` request | [Open source](https://github.com/LinXiaoTao/FuckClaude). Nine local dimensions. Exclude its disabled-WebRTC “no leak” result; the displayed original index is partial. |
| [AmIChinaFlagged](https://amichinaflagged.com/zh) | Enter `/zh` directly (the root returns 307), then click `开始检查`; only the native local page | Nine local dimensions with exactly AIZX's weights (26/20/16/10/8/6/6/4/4), not FuckClaude's weights. Equal weights establish overlap, not code ancestry or independent validation; retain its own lineage. Do not parse the 72/100 and 12/100 demonstration scores or use its network/header API. Its Claude Code claims do not verify Desktop behavior. |
| [claude-tester](https://claude-tester-six.vercel.app/) | Click `#scan-btn`; read the `检测信号` list (about 4 seconds of native animation) | [Open source](https://github.com/gokuscraper/claude-tester), MIT. Six signals weighted 30/24/20/10/8/8: timezone, language, Chinese fonts, Intl locale, UTC+8 offset and a UA-inferred Emoji vendor. Every Mac gets Emoji +2 and macOS PingFang SC counts as a Chinese font. The summary chips omit zero results and are not parsed; audio and Google Fonts stay blocked. |

The original seven pages and their native DOM were checked through ATT on
2026-10-19; claude-tester was added on 2026-10-20. A
website's statement about what Anthropic uses is its claim, not an official
finding. FuckClaude's own repository describes reported **Claude Code**
behavior and calls its other signals general environment fingerprints. Neither
that description nor AmIChinaFlagged's Code claim proves Claude Desktop uses
the same signals.

## Reviewed candidates not added (2026-10-20)

Searched through the local text browser on 2026-10-20. Pages were read only;
none was scanned except claude-tester. Matching weight sets add little distinct
evidence; matching weights alone do not prove copied code or its direction.

| Candidate | Finding | Decision |
| --- | --- | --- |
| [okTest](https://oktest.ai/zh/claude-env-check) | Nine signals weighted exactly like AIZX/AmIChinaFlagged; cites its MIT reference project | Existing AIZX weight set |
| [ClaudeFlag](https://claudeflag.com/) | Six signals weighted exactly like claude-tester; also promotes `curl \| sh` installers | Existing claude-tester weight set |
| [JinDaGe](https://jindage.com/en/claude-cn-check) | Six signals weighted exactly like claude-tester, on a relay-marketing site | Existing claude-tester weight set |
| [IPPure](https://ippure.com/claude) | Mixes exit IP, WebRTC and DNS leak checks with credited FuckClaude signals | IP-dependent |
| [Claude Guard](https://dku.wang/) | Server-side network identity plus FuckClaude weights and a rule API | IP/server-dependent |
| [Claude Ban Check](https://hype-yolo.github.io/claude-ban-check/) | Queries `ipwho.is`; its apostrophe marker needs a manually entered Claude Code base URL | IP-dependent; Claude Code only |
| `fuck-claude.app`, `fuck-claude.com` | Same title and description as FuckClaude | Mirrors; the existing open-source deployment stays |
| `m.cdhub.cn` (“检查Claude 封号风险”) | TLS negotiation failed once through the default proxy | Unverified; not retried |

## What can actually inform an App assessment?

| Metric group | App relevance used in the table | Verified basis and boundary |
| --- | --- | --- |
| Timezone, UTC offset, OS | Indirect reference | [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy), effective 2026-09-10, lists timezone, device and OS data. Same-Mac browser observations can inform environment review. Collection does not establish a ban threshold or the exact value sent by the App. |
| Browser language / Intl locale | Chrome only | [Navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages) is browser preference data. [Electron language/locale APIs](https://www.electronjs.org/docs/latest/api/app#appgetpreferredsystemlanguages) distinguish application locale, system locale and preferred system languages. No App value is measured here. |
| Browser/WebView and automation | Testing Chrome only | Native UA/automation findings describe the collector, not Claude Desktop. The App's embedded browser session is not this fresh Chrome session. |
| Page storage / cookies | Site-specific, not App evidence | [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) belongs to an origin; [Electron sessions](https://www.electronjs.org/docs/latest/api/session) own cookies/storage. A checker page cannot verify Claude App login storage. |
| Chinese/script/vendor fonts, brand, Emoji, regional total | Website conjecture | No reviewed official source validates these contribution weights for Desktop bans. The [official safeguards page](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals) lists policy/terms violations and unsupported-location account creation, not these font or Emoji thresholds. |

The technical sources above were read through ATT on 2026-10-19; the privacy
and safeguards pages were refreshed through ATT on 2026-10-20. Static read-only
inspection of this Mac's installed Claude 2.42304.0 bundle found
`Electron Framework.framework`; no executable, account, user profile or App
endpoint was opened. Framework presence alone proves neither shared Chrome
preferences nor what the App transmits.

Repeated local results do not establish an urgent need to remove fonts or
change language/Emoji settings. CleanIP returns zero for its local region
components while other sites flag the same Mac's fonts; language/Intl
contributions also differ. The automation flag belongs to the collector.
The isolated checker verifies its own ATT route, not the App's actual route.
App routing and any official account warning would require separate evidence;
neither may be inferred from these scores or by starting the App here.

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
PING IP's failed-network safety score as a local result. No combined score or
ban probability exists.

## Request policy and timing

Every website request uses an owned ATT proxy. Allow only the selected HTTPS
document, same-origin static assets, Claude Test's two exact static rule files,
and CleanIP's static CDN asset directories (`/_nuxt/v2/`,
`/fonts/google-sans/`, `/libs/fontawesome/`). The CDN exception does not allow
fetch/XHR, query parameters, API routes or analytics. Each exception is data in
its provider module (`assetOrigins`, `staticFiles`), not a branch in the shared
policy. Same-origin `/api`, `/cdn-cgi`, `/login`, `/oauth` and `/_vercel`
(hosting analytics) paths are denied for every provider.

Chrome's CDP response interceptor rejects 3xx responses except 304 before any
redirect destination is contacted. This is required because Playwright routes
only the first URL in a server redirect chain. The interceptor does not fetch
on Node's HTTP client or change ATT transport; failure to install it stops
navigation, and a runtime protocol failure closes the owned page.

All IP, ASN, reputation, geo/trace/DNS, Claude endpoint, helper, arbitrary
fetch/POST, WebSocket, service-worker and WebRTC activity is denied before
page scripts run. No fallback, proxy rotation or second automatic attempt.
Ignore any site's “connected/no leak” claim produced after its requests were
denied.

At most three independently owned native headless Chrome sessions run at a
time. Each page has a 15-second collection deadline; a free slot starts the
next candidate immediately. Hydration waits (`hydrateMs`) apply only to the
four sites with server-rendered controls. No personal browser or system setting is changed.
Normal output is just the table and timestamp; detailed provenance and
failures remain in the private JSON.
