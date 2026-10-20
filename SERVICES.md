# Temporary ownership

No daemon, MCP, scheduler or Supervisor job is installed.

Each CLI run owns one `startManagedProxy({route:'att',serveSeconds:180})` session.
It does not reload resident Clash or inspect an IP to prove routing. The existing
network-manager owner validates ATT input and the loopback listener; browser
launches bind explicitly to that listener with no fallback.

Up to three independent native headless Chrome owners run concurrently, each
with a fresh private profile, 15-second startup bound and independent 45-second
lifetime. Each page collector has a 15-second deadline and closes its own page.
The collector awaits every result and Chrome cleanup before closing ATT. Parent
loss is handled by the shared native owner; a cleanup rejection is fatal.
Seven default providers share the three slots; queued sources do not launch
after cancellation. Each slot is released only after the previous owner closes.

SIGINT/SIGTERM cancels pending work, preserves completed rows and awaits owned
cleanup. Hard host termination cannot guarantee a final report. Never kill a
personal browser or unrelated proxy to clean this run.

`.state/` and `reports/` are ignored, owned real directories at mode `0700`;
report files are `0600`. Unsafe existing directories/symlinks are rejected.
Reports remain for review; there is no automatic retention job.
Normal output is the comparison table only. Cleanup failures remain a visible
error row and a nonzero exit; successful cleanup is recorded only in JSON.
