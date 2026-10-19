# Process ownership

No daemon, MCP server, scheduler or Supervisor job is installed.

One CLI run owns a temporary loopback Mihomo through network-manager's
`startManagedProxy({route:'att', serveSeconds:1200})`. It never reloads resident
Clash. Startup failure or an absent ATT source stops collection; there is no
direct fallback. The provider owner validates and renders its private ATT input.

Browser sources run sequentially with a fresh native headless Chrome and
private profile per site. The myutils owner enforces an independent deadline
and removes its own process/profile on close or parent loss. The collector
awaits close before proceeding. No personal browsing process is terminated.

SIGINT/SIGTERM aborts the current run, closes its Chrome/ATT owners and writes
completed and cancelled rows. Hard host termination cannot promise a final
report; owner timeouts still bound temporary process lifetimes.

Private runtime directories: `.state/` and `reports/`, both ignored and `0700`;
report files are `0600`. Finished reports are retained for the user's review;
no automatic retention task is installed. An existing unsafe/symlink report
directory is rejected rather than silently changed.
