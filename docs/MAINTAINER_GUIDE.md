# maintainer guide

Use Node 22+, a local renderer/browser and Python with pinned requirements. npm ci --ignore-scripts at root and runtime; npm run fixtures generates controlled synthetic source; npm run check checks ESM syntax/frontmatter/schema/resources; npm test checks core invariants; npm run integration copies two agent installations and builds/reopens both fixtures. node scripts/adversarial.mjs PACKAGE_ROOT tests the portable checker on hostile synthetic mutations.

Never commit node_modules, .work, private input, actual company output or approval records. Use a sanitized original source allowlist and inspect git diff --cached and metadata. Required catalogue is templates/catalogue.json; original drafting content is clauses.mjs. Changes affecting pages require real rendering plus page-by-page review of both Word and HTML PDF previews. Keep results factual.

Semantic versioning: 0.1.x preview, fixes patch, backward-incompatible input/model changes minor while pre-1.0. Upgrade dependencies only after primary documentation/licence/security checks and resolved locks; do not run target lifecycle scripts. CI is least-privilege and render jobs serialize full fixtures. Network installation smoke is distinct from offline deterministic tests.
