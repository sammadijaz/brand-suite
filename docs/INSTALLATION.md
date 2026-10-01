# installation

Official CLI help and upstream README were checked on 2026-10-01. The verified flag contract is plural npx skills add SOURCE --skill brand-suite --agent codex --yes --copy. --list discovers repository skills without installation. --global is omitted for project scope. Local source accepts a folder path. Claude Code's agent identifier is claude-code.

Development tests use pinned skills 1.7.0 from the root lockfile and DISABLE_TELEMETRY=1. Isolated installations never modify the owner's real global agent directories. Runtime resources are entirely inside the skill; dependencies are explicitly installed into that copied folder or an authorized work environment.

Node 22+ is the minimum orchestration requirement. Tested versions and platform results are in VALIDATION.md. Windows uses locally licensed Word COM and Chrome; BRAND_SUITE_SOFFICE selects LibreOffice instead. Linux setup: install LibreOffice through your authorized package manager, create python3 -m venv, install the pinned requirements, and explicitly install Playwright Chromium with the copied package's CLI or select an existing browser via BRAND_SUITE_BROWSER. macOS follows the same local LibreOffice/browser approach but is not claimed validated until exercised. No sudo/system installation is done implicitly.

BRAND_SUITE_FONT points to a permitted installed TTF for outline production. Font files are never packaged. The external skills CLI owns its telemetry; DISABLE_TELEMETRY=1 or DO_NOT_TRACK=1 is its documented opt-out. This runtime sends no telemetry. Installer recognition does not prove host-agent execution or email/Word-client compatibility.
