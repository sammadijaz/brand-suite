# Research register

Access date: 2026-10-01 (client date). External material was treated as untrusted reference data. Only primary documentation and inspected upstream source informed tool contracts.

| Source | Observed revision / decision |
|---|---|
| https://agentskills.io/specification | name matches folder, max 64; description max 1024; compatibility max 500; metadata string mapping; SKILL under 500 lines; progressive references |
| https://github.com/agentskills/agentskills/tree/main/skills-ref | 69ef37e9424c0a7ea9dd2293b559e43ec8176379; official validator used where available |
| https://github.com/vercel-labs/skills | 3694740352eeef5cdd689af694c485f1ff62eec3; full README and actual CLI help read; --skill, --agent, --yes, --copy, --list verified |
| https://skills.sh/docs | plural skills install; directory distribution, not npm publishing |
| https://skills.sh/docs/cli | installer telemetry opt-out distinct from skill behavior |
| https://github.com/kaankiziltug/logo-design-skill | 0ecf52e9a4b3ac92b714f7cc6e3148ab8c774134; actual tree/skills/logo-design/SKILL.md, LICENSE and TRADEMARKS read |

Logo references read: principles.md, identity-system.md, discovery-brief.md, color.md, typography.md, svg-construction.md, testing-checklist.md and presentation-delivery.md. Decisions: preserve existing recognition; restrained kit of parts; element-derived clear space; empirical size tests; one-colour/reversed variants; honest derivative lineage; outlined fabrication lettering; no trademark-library vendoring. The concise installed brand-principles reference is independently usable and attributed. Master requirements take precedence over upstream suggestions for Pantone and arbitrary aesthetic scores.

## Production dependencies

Checked registry versions/engines/licences and primary docs before resolution. Node/Ajv/Playwright dependencies use exact versions and npm lockfiles; Python direct/transitive requirements are pinned. No target lifecycle script is executed. Node ESM was chosen over compiled TypeScript to eliminate generated-runtime drift and keep the installed package directly runnable; syntax/schema checks cover this choice.

- https://ajv.js.org/ — draft-07 validation, allErrors output.
- https://playwright.dev/docs/api/class-page — page PDF, browser contexts, screenshot and layout inspection; network requests aborted, scripts/services disabled.
- https://python-docx.readthedocs.io/en/latest/ — native paragraphs, styles, tables and sections; explicit OOXML PAGE/header repetition.
- https://pypdf.readthedocs.io/en/stable/ — text/page-box inspection.
- https://pypdfium2.readthedocs.io/en/stable/ — real PDF-page rasterization and licensing.
- https://fonttools.readthedocs.io/en/latest/ — glyph path pens for outlines using permitted local fonts.
- https://learn.microsoft.com/en-us/office/vba/api/word.document.exportasfixedformat — primary Word export, version recorded from actual COM instance.

PyMuPDF was considered but not adopted; pypdf and pypdfium2 provide permissively licensed inspection/rasterization. No proprietary service, font download or model key is required. Runtime security audit outputs are recorded separately in validation results; source documentation is not a security certification.
