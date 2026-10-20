# Implementation and direct shared APIs

| Owner | API / caller | Contract |
| --- | --- | --- |
| `src/providers/<id>.mjs` | default export → catalog | One provider: `id`/`name`/`url`/`family`/`method`, optional `button`/`buttonExact`/`hydrateMs`/`start(page,{click,setPhase})`, `complete(text)`, `parse(row,text)`, `expected` feature count, optional `index`, `limitations`, `assetOrigins`, `staticFiles` |
| `src/catalog.mjs` | `SOURCES`, `selectSources` → CLI | Ordered, frozen list of the eight provider modules; reject removed/IP-dependent sources and unknown IDs before network |
| `src/browser.mjs` | `requestAllowed`, `collectPage` | Static-only website policy plus provider-declared exceptions, native local scan, per-page deadline/cancellation and awaited cleanup |
| `src/evidence.mjs` | `FEATURES`, `baseRow`, `contribution`, `parseBrowser`, `maskText` and small value guards | Shared row schema, bounded component points/weights, explicit missing values and status from the provider's `expected` count |
| `src/app-evidence.mjs` | `APP_EVIDENCE`, `REFERENCES` → collector/report | Dated official/technical references, indirect App relevance, browser/site specificity and unverified website heuristics |
| `src/report.mjs` | `matrix`, `renderTerminal`, `renderMarkdown`, `renderHtml` | One provider-column matrix across ANSI, Markdown and self-contained HTML |
| `src/report.mjs` | `terminalWidth` → terminal renderer | Width of sanitized text including padding; ASCII/combining/CJK alignment for this report |
| `src/collect.mjs` | `collect` → CLI | Three-owner bounded worker pool, one ATT lifecycle, ordered results, failure/cancellation and cleanup truth |
| myutils `@myutils/browser-session/chrome` | `launchChromeSession` → collector | Fresh native Chrome, explicit route, independent process/profile owner and deadline |
| network-manager `lib/managed-proxy.mjs` | `startManagedProxy` → collector | Isolated ATT loopback readiness, owned Mihomo and awaited close |

No generic forwarding namespace or custom browser launcher exists. Website
selectors, request permission, scoring semantics and rendering are project logic;
generic process/profile ownership remains in its existing shared library.
The former HTTP-only dependency and parser are removed.

Sibling layout is intentional: `../../myutils` and
`../../managers/network-manager` are the maintained owners. Test-only injected
dependencies do not become user-provided CLI executables, URLs or modules.
