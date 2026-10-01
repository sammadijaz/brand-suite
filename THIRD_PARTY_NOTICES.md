# Third-party notices

Original instructions and code are MIT, copyright 2026 sammadijaz. Input artwork, company records and user output rights are not transferred to this repository. Third-party trademarks and fonts are not relicensed.

## Research, not vendoring

Accessed 2026-10-01:

- [Agent Skills specification](https://agentskills.io/specification): valid frontmatter, progressive disclosure and self-contained resources. [Reference validator](https://github.com/agentskills/agentskills/tree/main/skills-ref) commit `69ef37e9424c0a7ea9dd2293b559e43ec8176379` used as an external validation tool.
- [Vercel Skills](https://github.com/vercel-labs/skills), MIT, commit `3694740352eeef5cdd689af694c485f1ff62eec3`: discovery/install flags and temporary project testing; CLI pinned in maintainer lockfile.
- [Skills documentation](https://skills.sh/docs) and [CLI documentation](https://skills.sh/docs/cli): plural `npx skills add` and installer telemetry distinction.
- [Logo Design Skill](https://github.com/kaankiziltug/logo-design-skill), MIT, copyright 2026 kaankiziltug, commit `0ecf52e9a4b3ac92b714f7cc6e3148ab8c774134`: principles, discovery, identity systems, colour, typography, SVG craft, testing, delivery and stewardship informed independently written guidance. No upstream prose, scripts, examples or logo library is copied. Its TRADEMARKS.md excludes library marks from the software licence; no endorsement or affiliation is claimed.

## Installed dependencies

Dependency code is resolved through pinned package/requirements files rather than vendored here. Their own notices apply when installed:

| Dependency | Licence | Purpose |
|---|---|---|
| Ajv | MIT | JSON Schema validation |
| Playwright / Chromium | Apache-2.0 / Chromium component notices | Isolated browser print and layout checks |
| python-docx | MIT | Native editable OOXML |
| pypdf | BSD-3-Clause | Searchable PDF text/structure |
| pypdfium2 / PDFium | Apache-2.0 or BSD-3-Clause / BSD-style component notices | Page raster inspection |
| Pillow | HPND-style licence | Preview/contact sheet images |
| fontTools | MIT | Local font lettering to vector outlines |
| defusedxml | PSF-compatible | Hardened XML inspection |
| lxml | BSD-3-Clause and component licences | python-docx dependency |
| typing_extensions | PSF-2.0 | Python typing dependency |

Microsoft Word and locally installed fonts remain separately licensed tools. No Word binary or font file is distributed. Review a font's allowed logo/outline and document embedding use for your inputs. Generated SVG glyph outlines do not purport to relicense the underlying font. No Pantone library is distributed.
