# Direct APIs and ownership

| Owner | API / caller | Contract |
| --- | --- | --- |
| `src/catalog.mjs` | `SOURCES`, `selectSources` → CLI | Exact source selection, unknown IDs rejected before network |
| `src/evidence.mjs` | `parseHttp`, `parseBrowser` → collectors | Source-specific schema/score validation; explicit unknowns and lineage |
| `src/evidence.mjs` | `evaluate`, `renderMarkdown` → collector/CLI | Cross-source conflicts and masked comparison; no composite ban score |
| `src/browser.mjs` | `requestAllowed`, `detectionComplete`, `collectBrowser` | Website workflow, native controls, bounded text, route/request policy and cleanup |
| `src/collect.mjs` | `collect` → CLI | ATT lifetime, sequential observations, cancellation, final exit check, cleanup truth |
| myutils `@myutils/web-text/http-text` | `fetchTextUrl` → HTTP collector | Explicit proxy, bounded GET, text extraction, no alternate route |
| myutils `@myutils/browser-session/chrome` | `launchChromeSession` → browser collector | Fresh native Chrome, independent owner deadline, profile/process cleanup |
| network-manager `lib/managed-proxy.mjs` | `startManagedProxy` → collector | ATT-only loopback readiness, owned Mihomo, bounded lifetime and awaited close |

There is no wrapper namespace or forwarded CLI. Business schemas, website
selectors and reporting stay here. Generic HTTP/browser ownership remains in
myutils; ATT configuration and lifecycle remain in network-manager.

The collector accepts injected transport/lifecycle dependencies for offline tests.
They are internal test seams, not CLI-provided modules, executables or proxy URLs.

Sibling layout is intentional: from this worktree's parent hierarchy,
`../../myutils` and `../../managers/network-manager` are the maintained owners.
Do not copy them into this repository. Their current documented installation
and test contracts apply when those owners change.
