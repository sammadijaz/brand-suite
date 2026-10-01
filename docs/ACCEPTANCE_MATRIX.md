# Acceptance matrix

Local implementation gates are verified for the declared English/A4/Letter fixture scope. Evidence: [production](results/production.json), [222-page AI visual review](results/visual-review.json), [adversarial](results/adversarial.json), [modes](results/modes.json), and [hostile Office containers](results/security-office.json). Publication/remote gates are recorded separately after execution; unrun host, email-client, physical and legal reviews remain explicit in [validation](VALIDATION.md).

| Gate / master sections | Implementation and evidence | Acceptance |
|---|---|---|
| Research (3) | RESEARCH.md, THIRD_PARTY_NOTICES.md; official specification, CLI help, pinned upstream trees | primary sources read, decisions attributed |
| Installable package (4, 23) | skills/brand-suite; local and remote isolated installs | two agent installations; runtime works without source clone |
| Modes and resume (5) | CLI, checkpoints, source hashes, protected outputs | all five modes; edits preserved; changed sources invalidate review |
| Discovery (6, 7) | safe inventory, host review map, bounded website collector | exclusions explicit, no extraction-as-understanding claim |
| Identity and evidence (8) | JSON schemas, typed fields, conflicts | nulls visible, no status promotion or cross-entity mixing |
| Brand and catalogue (9, 11) | original/derivative provenance, diagrams, tokens | variants and real illustrated catalogue; no bundled fonts |
| 36 slots (10, 16) | catalogue, 36 semantic templates, schedules | 108 baseline files, distinct substantive clauses and applicability |
| Shared model (12) | semantic block schema, HTML and native DOCX renderers | ordered text/values/tables agree; decimal-safe amounts |
| Production (13, 21) | Word/LibreOffice PDF, Chrome print, PDF inspector | all pages rendered and visual review recorded at readable scale |
| Email (14) | SEND/CID/plain text, responsive test | widths 320/375/768/desktop; no live send or invented client results |
| Stamp and assets (15) | outlined SVG, mm PDF, transparent PNG, editable source | dimensions/provenance checked; supplier proof gate retained |
| Controls (17, 18) | manifest, checker, index, ZIP, doctor | hashes/counts/links reconciled; incomplete production fails |
| Security/privacy (19) | traversal, injection, SSRF, secret/privacy checks | denied assets and paths; renderer egress denied; no private publication |
| Fixtures/evals (20) | complete and messy synthetic fixtures, adversarial cases | actual outcomes; agent evals separate from unit tests |
| Documentation/CI (22, 23) | docs, contribution/security/license, CI | useful setup; real render job; no fake badges |
| Publication (24) | authenticated owner sammadijaz; new repository absence verified | first push authorized after local gates; CI, remote smoke and release remain pending until executed |

## Verified local checkpoint

Both installed builds generated 36 slots and 108 baseline artifacts. The complete fixture has 50 Word-derived and 59 Chromium-print pages; the messy fixture has 52 and 61, with 13 explicit applicability notes. All 222 pages were inspected by AI at readable scale. Corrected signature/table and finance-note pagination and project stamp captions were rendered and checked again. Sanitized release ZIPs were extracted and passed the checker. Repository checks, official skill validation, 18 unit tests, 12 adversarial mutations, nine mode tests and six hostile Office-container tests passed. The [privacy review](results/privacy.json) inspected the staged boundary and both ZIPs, including Office members and PDF metadata, with no findings. Independent host-agent benchmark, physical/client and legal approvals are explicitly NOT_RUN; these do not become fabricated software-release approvals.

## Implementation sequence and boundaries

1. Research and record the current upstream contracts; implement a self-contained Node runtime with Python inspection where it improves PDF/Word QA.
2. Build schemas, distinct semantic templates and synthetic fixtures; add safe inventory and explicit agent review inputs.
3. Generate editable Word, semantic HTML, Word-derived PDF, email, stamps and evidence controls; protect existing outputs.
4. Test complete and messy installed builds, inspect all pages, adversarially exercise release gates, and document limits.
5. Review the public allowlist, publish only sanitized original work, verify CI/remote installation, then release.

Target codebases are read-only. Output directories must be separate. Raw secrets, private business materials and this private build prompt are excluded from publication. No live email, contract execution, production app changes or business-material uploads are authorized. Synthetic fixture evidence is explicitly fictional, never a genuine legal approval.
