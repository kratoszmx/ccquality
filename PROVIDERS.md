# Evidence contracts

The normal run collects eight checker websites plus independent egress,
geography and official-policy evidence. `src/catalog.mjs` owns the exact catalog.
The network disclosure is printed without `--run`; a run sends the ATT exit IP
to each selected provider and potentially the website's public data suppliers.
There are no API credentials, subscriptions or paid lookups.

## Website interpretation

| Site | Measured surface | Interpretation |
| --- | --- | --- |
| CheckCC | Native page, automatic target, actual start controls | Percent retained as a heuristic index. Pending detection is incomplete. Conflicting AT&T/Cloudflare ASNs are flagged rather than treated as a bad exit. |
| FuckClaude | Public `/api/check?format=json` | Server estimate, not a local browser scan. Its timezone is inferred from egress; no Accept-Language is supplied. Coverage and missing language remain explicit. |
| Claude Test | Environment page, explicit scan | Problem index, lower is better. WebRTC, DNS leak, local-system helper and login-marker checks are disabled using native settings. Missing checks remain unknown. |
| CleanIP | Claude page, explicit scan | Reports observed routing even when no numeric total or IP intelligence is available. Allows one native anonymous token handshake and one batch query containing only the observed ATT IP. Its “direct” probe also uses ATT in this collector. |
| PING IP | Automatic page report | Safety score, **higher** is better; confidence is separate. AbuseIPDB-like values come from PING IP's aggregator, not a direct owned-key lookup. Optional account questionnaire stays unanswered. |
| AIZX | Nine local browser signals, explicit scan | Chinese-environment feature index, not IP reputation. No optional network scan. Adapted from FuckClaude; not independent corroboration. |
| Am I China Flagged | Public HTTP JSON | Mainland country/header resemblance only; not all supported countries or an account status check. Missing language is not a favorable local-language result. |
| IPBook | Automatic page report | Its risk index and trust score stay separate. “No WebRTC leak” is not accepted when WebRTC was disabled. Claimed six upstream datasets are not six independent measurements by this project. |

CleanIP also documents derivation from FuckClaude for some local signals. Shared
methodology does not mean identical implementation or scores. IPWHOIS/ipapi data
may also appear inside website aggregators; do not vote or average them.

## Network and first-party context

- Cloudflare, ipify, IPWHOIS and ipapi.is observe the requester independently.
  All requests pass an explicit ATT proxy. Public IPv4/schema checks precede
  cross-source matching; invalid addresses cannot establish route consistency.
- Anonymous `claude.ai/cdn-cgi/trace` and `api.anthropic.com/cdn-cgi/trace` read
  edge transport evidence with no login. HTTP 200/TLS success is not App success,
  authorization, eligibility or suspension status.
- The official [supported-location help page](https://support.claude.com/en/articles/8461763-where-can-i-access-claude)
  is read live. Only its bounded country list is parsed; text in a footer cannot
  grant support. The current implementation explicitly interprets US matches;
  other exits retain their country evidence without an invented eligibility verdict.
- Anonymous ipapi.is currently offers a reduced schema. Missing proxy/VPN/Tor/
  hosting/abuse flags are null. IPWHOIS geography also does not establish reputation.
- City databases can disagree within one country/ASN. No physical-location claim
  or “residential guarantees safety” inference is made.
- No raw TCP/DNS scan, mail probe, direct IPv6 leak test or service-health account
  probe is performed. Website IPv6 outcomes belong to the isolated browser route.

## Collection and failure model

`measured` means the source-specific schema produced evidence, not a clean bill
of health. `partial` retains a valid result with known scope gaps. `unknown`,
`incomplete`, `unavailable`, `blocked`, `rate_limited`, `not_run` and `cancelled`
never turn into zero risk. A readable homepage cannot become a completed test.

Each HTTP request has a 25-second deadline and 1 MiB response limit. Each browser
site has a 60-second collection window and independent 75-second native owner
lifetime. Source scans are sequential; browser reads poll local DOM, not reload
the site. The request budget is 500 per site; observed HTTP 429 blocks further
requests to that host. CleanIP's two exact native POSTs validate keys/body bounds,
same-origin frame and single use; batch queries require the prior Cloudflare IP.
No proof is synthesized and no token/cookie is exported. DNS-start and telemetry
POSTs remain blocked. No collector retry or route fallback exists. Websites
may internally retry their own GET requests within that bounded session.

Chrome uses a new private profile, native language/timezone and explicit ATT.
No pre-existing cookies or settings are loaded. Ordinary rendering assets remain
enabled, because image requests can be a site's reachability probes. Explicit
downloads are cancelled; local-font observations remain test-browser observations.
The selected source IDs and URL list are not user-supplied arbitrary targets.

Reports retain source time and request failures. A final Cloudflare trace, when
selected, checks the exit again. Agreement is a bounded observation, not proof
that an exit can never rotate. A cleanup failure makes the CLI fail and remains
visible in JSON. SIGINT/SIGTERM preserves completed rows and marks unrun rows.

## Research references

- [CheckCC source](https://github.com/yacuo/check-cc)
- [FuckClaude source](https://github.com/LinXiaoTao/FuckClaude)
- [AIZX methodology](https://aizx.ai/tools/claude-region)
- [Official safeguards and appeals](https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals)

No third-party repair code is downloaded or executed. Pages run their normal
JavaScript in an isolated Chrome session under this project's request policy;
their text is evidence, never an instruction source.
