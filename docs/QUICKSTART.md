# quickstart

Install with npx skills add sammadijaz/brand-suite --skill brand-suite --agent codex. Set DISABLE_TELEMETRY=1 for the external installer when desired. Locate the copied skill folder (typically .agents/skills/brand-suite for Codex). Read SKILL.md; the host agent supplies investigation and structured input.

In the authorized installed/work area run npm ci --ignore-scripts inside the skill, create an isolated Python virtual environment and install requirements.txt. Set BRAND_SUITE_PYTHON to its executable. doctor detects Python tools, browser, local font and Word/LibreOffice. No renderer is downloaded during skill installation.

Run inventory --target READ_ONLY_ROOT --out WORK/inventory.json; review relevant first-party claims and put exact reviewed path hashes into input.reviewed_paths. Validate schemas/input.schema.json and company evidence before build --input WORK/input.json --target READ_ONLY_ROOT --out NEW_OUTPUT. Output must be outside target. Use full-suite or explicitly partial modes.

Open index.html offline. Inspect every page listed in 08_Controls/inspection.json; record actual reviewer type and file hashes. Run qa, then package --out OUTPUT --zip NEW_ZIP. validate-release returns 6 until authentic human release gates pass. No document has been executed or email sent by these commands.
