# Validation

## Setup

Use the existing Homebrew Node (>=22.13), installed Google Chrome, curl and
network-manager's maintained ATT/Mihomo environment. No Python, venv, browser
download, Claude executable or new resident service is required.

Restore the lockfile with `npm ci --offline --ignore-scripts --no-audit --no-fund`
when the npm cache is populated. `@myutils/*` are local file dependencies;
myutils must already have its dependencies installed and web-text built using
its own instructions. `playwright-core` controls the installed Chrome.

## Offline checks

```sh
npm run check
node src/cli.mjs
node src/cli.mjs --help
git diff --check
```

The Node test suite uses injected transports. It makes no HTTP, DNS, proxy,
browser or account call; the CLI plan/help is exercised as a child process.
Covered boundaries include missing/malformed/challenged/rate-limited results,
reduced anonymous API schemas, official list boundaries, transient scores,
opposite score scales, source lineage, ASN/egress conflicts, public-address
validation, browser request restrictions, explicit ATT propagation, cancellation,
proxy/browser cleanup failure, fixed headless Chrome ownership, exact one-use
anonymous CleanIP POSTs, partial evidence and Markdown redaction. Current suite:
16 tests, all passing on 2026-10-19.

## Authorized live acceptance

```sh
node src/cli.mjs --run
```

The full report is created under a new private `reports/<timestamp>-<random>/`
directory. JSON retains full IP/DOM evidence; Markdown masks IPv4 and fingerprint
hashes. Neither is committed. `--sources cloudflare,ipify,checkcc,aizx` is a
focused browser acceptance run; missing sources are intentionally not queried.

Exit 1 means a run-level, cancellation or cleanup failure. Per-source unknown or
unavailable outcomes remain in the report and do not alone crash the collector.
Read the source statuses, not just the process exit code. Live partial success
does not prove account access, App routing, residency or future source stability.

Before a source change ships, confirm its real DOM result and final cleanup.
Do not rerun all providers merely to increase a test count. Offline fixture
success is independent of live provider acceptance.
