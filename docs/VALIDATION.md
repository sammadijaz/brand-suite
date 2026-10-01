# Executed validation

Local results were collected on 2026-10-01, using synthetic evidence only. Exact outcomes are in [production](results/production.json), [adversarial](results/adversarial.json), [command modes](results/modes.json) and the page review ledger. A result describes the tested environment and artifact hashes; it is not legal or business approval.

## Local environment and checks

Windows: Node 24.15.0, Python 3.14.4, Microsoft Word 16.0 through read-only COM export, Chrome 154.0.8037.59 through Playwright 1.63.0. Python dependencies and Node runtime dependencies are pinned. The official `skills-ref` validator accepted the packaged skill. `npm test` passed 18 meaningful tests with no skips. Repository validation passed syntax, 36 catalogue entries, frontmatter and packaged references. Runtime npm audit and pinned Python dependency audit reported no known vulnerabilities at the recorded check time.

`scripts/integration.mjs` performed project-scoped copy installations with skills 1.7.0 for Codex and Claude Code, checked packaged-resource hashes, installed dependencies inside the copied Codex skill and ran doctor plus both full synthetic builds. The original skill folder was unavailable during execution. The fixture target hashes remained unchanged. Each suite produced all 108 baseline HTML/PDF/editable-DOCX files and passed technical checks after its ZIP was extracted and reopened. Claude Code installation recognition was exercised; independent Claude Code host-agent generation was not.

The complete Aster Works fixture uses A4, a supplied original SVG and 36 applicable slots. The materially different Orbit Workshop fixture uses Letter, provisional typography, missing identity fields, a missing SVG, an unavailable requested font, contradictions, a very long clause and a 35-row table. Thirteen slots become explicit applicability notes. Both remain unexecuted drafts. Small provisional wordmarks fail the intended small-use legibility test; no minimum logo size is approved by this demonstration.

The local page review opens every Word-derived and Chromium-print page at readable scale. It checks clipping, margins, branding, table continuation, signature placement, blank masters and content flow. Layout defects found during review were repaired and affected documents re-rendered before their final review. Printed HTML uses quiet text headers; native Word includes the mark where appropriate. Different page counts are permitted while ordered semantic content remains consistent. A contact sheet is an overview, not evidence of readable page inspection.

Nine command-mode tests exercised audit, deferred stationery/resume, existing-package validation, changed-brand updates, preservation of manually edited masters, output protection, missing dependencies and explicit raster conversion blockers. Twelve adversarial package mutations exercised split-run/header tokens, missing schedules, contradictory alternatives, stale PDF, wrong entity, broken links, hidden private text, arithmetic inconsistency, changed source hashes, harmless brackets and fabricated approvals. Tokens may pass structural checks as draft content but remain release blockers. Fabricated approval never authorizes execution.

Six additional hostile Office-container tests reject parent/Windows/drive paths, external entities, macros and external relationships. The review fixed an unreachable relationship-check branch and exercised the corrected code against actual ZIP/XML files without extraction or Office execution. See [results](results/security-office.json).

## Reproduce

Follow INSTALLATION.md and QUICKSTART.md, then run:

```sh
npm run fixtures
npm run check
npm test
npm run integration
node scripts/adversarial.mjs PATH_TO_FULL_SUITE
node scripts/mode-smoke.mjs
```

The integration report provides the generated suite paths. Rendering needs permitted local fonts, Python, Word or LibreOffice, and Chrome or explicitly installed Playwright Chromium. Do not run multiple Word exports concurrently. Keep temporary files on a volume with adequate free space. CI repeats real rendering and structural checks; AI visual records are specific to the locally reviewed PDFs.

## Scope and unrun checks

The helper provides bounded inventory and host-review inputs; it cannot infer actual production behavior from route names. Public HTTPS collection is bounded and DNS-validated; offline, private-address and authenticated states remain limited coverage. Input PNGs are retained and assessed, then production stops with a conversion/quality blocker until a reviewed passive SVG is supplied. The tool does not invent vectors or transparency. Automatic negotiated DOCX import, RTL and non-Latin production are explicitly unsupported in this version.

macOS production, independent host-agent benchmark execution, actual Gmail/Outlook/Apple Mail delivery, physical printer/stamp proofs and legal/factual/authority approval are NOT_RUN. Email browser checks cover 320, 375, 768 and 1200 pixels with normal, long-content, approximate dark and image-blocked states; they do not establish actual email-client compatibility. Human release approval requires authentic externally trusted reviewer evidence and exact current hashes. Publication/CI/remote installation evidence is recorded separately after each actual operation.
