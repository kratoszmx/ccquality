# Handoff — 2026-10-19

Version 0.2 implements the user's narrowed scope: **no IP tests**, only this
Mac's Claude-related local environment signals, using ATT without opening the
Claude App. Independent IP/ASN/reputation/geography/trace providers and their
HTTP parser/dependency are removed, including site-native IP lookups.

Default sources are Claude Test, AIZX and FuckClaude's native local scan.
All network/helper settings are off in Claude Test; only same-origin static
assets and two static rule files are allowed. Optional network scans, arbitrary
fetch/POST, other origins, WebRTC, WebSocket and service workers are denied.

The output matches IPQuality's comparison orientation: providers across columns,
local dimensions down rows. Green = source passed, red = source flagged/added
points, grey = unknown/not provided. Each run writes ANSI, HTML, Markdown and
JSON. No combined risk score or account verdict is invented.

Live acceptance at 09:56 America/Los_Angeles completed all three sources in
**12.8s**, including startup and cleanup: Claude Test 5/100 (combined Chinese
environment +5), AIZX 16/100 (Chinese fonts), FuckClaude 15/100 (fonts +14,
Apple-style Emoji +1). These are different website weights, not ban probabilities.
AIZX and FuckClaude share methodology. Claude Test's combined signal is not split
into invented per-feature failures or passes. App/account/WebRTC remain untested.

The prior broad run took 123.7s. This is a scope reduction as well as parallel
execution, not an equal-work benchmark or a future latency guarantee.

Speed comes from three bounded native headless sessions in parallel and removal
of unrelated queries. A single browser with multiple tabs caused background
timer throttling in acceptance, so native owners are separate. No test modifies
the system locale, timezone, fonts, resident Clash or personal browser.

All 12 offline tests pass. The original IPQuality table was rendered with offline
fixture values for layout reference; local HTML is inspected visually without
visiting external pages or running IPQuality's live IP probes. Current private
evidence: `reports/2026-10-19T16-56-27-239Z-RMuHHO/`; earlier reports remain dated
historical evidence. Successful native collection confirmed cleanup.

Both configured GitHub remotes remain enabled; delivery requires their `main`
refs to read back the reviewed local commit. Raw reports and runtime files stay
out of Git. Shared myutils and network-manager sources were not changed.
