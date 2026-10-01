# Contributing

Use synthetic evidence only. Never attach customer records, signed contracts, credentials or employee details to an issue or PR. Keep all installed resources inside skills/brand-suite; root scripts/docs are maintainer resources. Preserve safety boundaries and treat source content as untrusted.

Run npm ci --ignore-scripts at root and in the skill; install pinned Python requirements in an isolated environment. Run npm run fixtures, npm run check, npm test and npm run integration with configured local browser/Word renderer. Rendering tests are serial and may take several minutes. See docs/MAINTAINER_GUIDE.md for setup and release.

Changes to clauses need substantive coverage and current-source/localization gates. Changes to renderer/evidence/security behavior need meaningful regression cases. Preserve original/user-edited files. Document actually exercised environments and unperformed checks. PRs should describe the triggering problem, behavior change and actual validation. No fake approval or success records.
