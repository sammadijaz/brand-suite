// Original drafting language. These are proposed terms, not universal legal advice.
// Rows correspond to the stable catalogue's coverage sections; slots with no
// reference sections use the explicit headings below.
export const clauses = {
G00: [
'Edit the canonical model or native Word master. Preserve negotiated changes by importing them for review; rendering does not authorize replacement of an approved or signed document.',
'HTML and DOCX share the same semantic blocks. The primary PDF is exported from Word or LibreOffice; browser print is checked separately. Revalidate after any change.',
'Registered office: {{company.registered_office}}. Mailing address: {{company.mailing_address}}. Their evidence labels are recorded independently; a public address is not registration proof.',
'This package covers entity {{company.entity_id}} only. Product name {{company.trading_name}} is distinct from legal name {{company.legal_name}}. Never transfer identifiers or signatories between entities.',
'Draft agreements do not establish local legal compliance. Confirm mandatory law, factual schedules, intentional business terms and genuine authority before execution. No signatures or certifications are supplied.',
'Ordinary stamps identify the issuer; they do not confer authority or act as a common seal. Print positive impressions at 100 percent and obtain supplier proofs before ordering.',
'Archive the manifest, source hashes, reviewed versions and authentic reviewer evidence. Check every unresolved field, then factual, legal, visual and authority gates separately. Use digital letterhead on blank paper; use body-only correspondence on preprinted paper.'
],
G01: [
'Positioning: {{brand.positioning}}. Audience: {{brand.audience}}. Attributes: {{brand.attributes}}. Proposed statements remain proposals until the owner adopts them.',
'Use {{company.trading_name}} for product identification. Use {{company.legal_name}} where the issuing legal party matters. Do not abbreviate legal names in execution or invoice fields.',
'Prefer specific evidence: "Your request is recorded; here is the next step." Avoid unproved absolutes such as "fully compliant" or "guaranteed secure". Owner-selected tone: {{brand.voice}}.',
'Derive clear space from the actual mark: {{brand.clear_space}}. Keep unrelated text outside this zone. The diagram illustrates the chosen rule rather than a universal logo formula.',
'Minimum sizes require review of the supplied artwork at intended use sizes. Compare 16, 24, 32 and 64 px and the 12, 20 and 30 mm ladder; record the smallest legible use after inspection.',
'HEX values are screen specifications. Proposed process-print conversions need a printer proof; no exact Pantone match or certified CMYK conversion is claimed. Text contrast is calculated separately from logo aesthetics.',
'Use the available document font with Arial, Helvetica or Liberation Sans fallbacks. Email uses conservative system sans fonts. No font files are bundled; substitutions are recorded in build information.',
'Body text is 11 pt with measured spacing; footer text is 9 pt. Headings stay with the following paragraph. Avoid ornamental watermarks and crowded signature areas.',
'Use consistent dates, references and sentence case. Keep currency and entity names explicit. Use descriptive links, alt text and neutral language for disputes.',
'Page anatomy uses 22 mm margins, a reserved header and footer and restrained logo size. Long addresses wrap. Tables repeat header rows; continuation branding remains quiet.',
'Prefer native editable Word on blank A4 or Letter stock. Paper choice is independent of jurisdiction. Physical output and printer scaling require a separate proof.',
'Email is a separate medium: a fluid presentation table, inline styles and live text branding. The print reference is not the sending template.',
'The image-free version remains readable. CID artwork requires an actual matching MIME attachment. No invented hosted asset URLs, tracking pixels or base64/SVG reliance in sending HTML.',
'A signature identifies the selected sender, role and approved contacts. It is not a handwritten signature or evidence of signing authority.',
'Use source-provenance artwork with informative captions. Product icons do not imply a marketing logo master. Do not borrow third-party trademark specimens.',
'No motion or sub-brand system is invented for stationery. Where a real sub-brand exists, document its hierarchy and keep independent entities distinct.',
'Stamp dimensions are configurable starting points. Outlined lettering and positive orientation are supplied. Supplier minimum lines/gaps, material and ink suitability remain proof gates.',
'Assign a custodian, record purpose and version, and restrict stamp access. Common-seal requirements require constitution and local-law review.',
'Originals are hashed and retained separately from derivatives. Each recolour, crop or rasterization is labelled; reconstructed artwork never becomes an approved original by rendering.',
'Check small size, one-colour, reversed, grayscale and intended print use. Review every Word-derived page and browser print; structural checks alone are insufficient.',
'Input asset rights stay with their owners. This package grants no trademark clearance, press approval or legal certification. Keep approval evidence separate from technical QA.'
],
G02: [
'The coverage records distinguish inventoried paths, host-reviewed implementation, fetched public HTML and uninspected authenticated states. Page budgets and access failures remain visible.',
'Approved masters and owner choices take precedence for identity. UI colours and incidental illustrations are supporting evidence only. Archive branding is not silently promoted.',
'Marketing claims, demo adapters and README plans do not prove production behavior. Contradictory fees, payout promises, security assurances and legal names stay unresolved until traced to proper sources.',
'Official sources are needed for material legal assertions. Published official text does not alone complete applicability analysis. This report contains recommendations; it does not edit application code or certify company records.'
],
S04: [
'Recipient: {{recipient.name}}. Address: {{recipient.address}}. Date: {{document.date}}. Reference: {{document.reference}}.',
'Subject: {{letter.subject}}. {{letter.body}}',
'Attachments supplied: {{letter.attachments}}. Check each referenced attachment is present and matches the stated version.',
'For {{company.legal_name}}, {{signatory.full_name}}, {{signatory.capacity}}. Authority reference: {{signatory.authority_reference}}. Signature and date are intentionally unexecuted.'
],
S05: ['Use the separate SEND HTML and plain-text file for correspondence. Subject: {{email.subject}}. Message: {{email.body}}. Sender: {{signatory.full_name}}. Contact: {{company.email}}.', 'For CID delivery attach logo-cid.png with Content-ID brand-suite-logo, inline disposition and image/png MIME type. Bare HTML cannot supply that attachment. Browser QA does not establish email-client compatibility.'],
S06: ['{{signatory.full_name}} | {{signatory.capacity}} | {{company.trading_name}}. Email: {{company.email}}. Website: {{company.website}}.', 'Copy the separate signature fragment into the approved client. Use the plain-text signature when rich HTML is unavailable. Test forwarding and image blocking in the real client before adoption.'],
S07: ['Ordinary company and authorized-signatory stamps are identifiers only. No seal, official emblem, signature image or certification is created.', 'Print exact-size PDF at 100 percent, without fit-to-page. Confirm positive orientation, readable long names, proposed 0.3 mm line/gap floor and supplier requirements. Keep custody and use records; no order has been placed.'],
P01: [
'The offer is conditional on {{offer.conditions}}. No unsupplied policy or verification is presumed complete. Expiry or withdrawal terms must be expressly chosen and reviewed under applicable law.',
'Role: {{employment.role}}; start: {{employment.start_date}}; work location: {{employment.location}}; hours: {{employment.hours}}; remuneration: {{employment.remuneration}}. Benefits and deductions require the applicable work-location assessment.',
'The final employment agreement and supplied policy versions govern the relationship subject to mandatory law. Explain any difference between this offer and that agreement before acceptance; do not silently reduce a promised term.',
'Changes require written communication and lawful agreement where required. Any withdrawal before commencement remains subject to applicable law and the stated conditions: {{offer.withdrawal}}.',
'The candidate records acceptance of the identified version, not acceptance of undisclosed policies. Candidate: {{employee.full_name}}. Date and signature remain unexecuted. Retain a copy for both parties.',
'Documents actually supplied: {{employment.policy_versions}}. Record receipt separately from compliance or legal consent.'
],
P02: [
'{{company.legal_name}} engages {{employee.full_name}} as {{employment.role}} beginning {{employment.start_date}}. Duties: {{employment.duties}}. Changes to the role require a lawful documented process.',
'Usual place: {{employment.location}}. Hours and working arrangements: {{employment.hours}}. Required breaks, overtime and flexible-working rights remain subject to mandatory law.',
'Remuneration: {{employment.remuneration}}. Pay frequency: {{employment.pay_frequency}}. Only lawful, authorized deductions apply; no tax rate or deduction authority is invented.',
'Leave and statutory benefits: {{employment.leave}}. Mandatory entitlements prevail over inconsistent drafting. Confirm work location and current applicable official sources before release.',
'Probation, if intentionally selected: {{employment.probation}}. Performance expectations and support must be communicated; probation does not waive mandatory protection.',
'Follow the identified supplied policies: {{employment.policy_versions}}. Disclose relevant conflicts through the designated process. An acknowledgment cannot incorporate a nonexistent policy.',
'Report safety, harassment or unlawful conduct through {{employment.reporting}}. Nothing restricts protected disclosures, access to competent authorities or mandatory rights.',
'Assets and credentials are recorded in the onboarding schedule. Use them responsibly and return company property through the offboarding process; do not withhold personal records unlawfully.',
'Use confidential information only for authorized duties; apply reasonable safeguards. Exclusions include public information, independently developed material and lawful protected disclosures.',
'Work-product allocation: {{employment.ip_terms}}. Identify background and third-party rights separately. Assignment formalities, moral rights and employee-invention rules require local review.',
'Systems use and personal information: {{employment.data_terms}}. Monitoring must be lawful, transparent and limited; this clause does not imply unimplemented security controls.',
'Public representation requires authority for the specific statement or commitment. This does not prevent lawful personal expression or protected reporting.',
'Notice and termination process: {{employment.notice}}. Mandatory notice, fair process and non-waivable rights prevail; no blanket dismissal discretion is supplied.',
'On departure reconcile earned pay, lawful benefits, property and access. Settlement references: {{employment.settlement}}. A handover acknowledgment is not a waiver of unpaid lawful entitlements.',
'Governing law and forum: {{legal.law_forum}}. Notices: {{legal.notices}}. Changes must be documented. Severability does not validate unlawful terms. Signatures identify both parties and their capacities.'
],
P03: [
'{{employee.full_name}} acknowledges receipt of {{employment.policy_versions}} and the assets listed below. Record version, date and explanation; receipt is distinct from consent where consent is legally required.',
'Use access for authorized duties, protect credentials, report incidents through {{employment.reporting}} and keep personal/customer information within the approved systems.',
'The responsible manager verifies supplied policy versions, training and access. Open items, owners and due dates stay on the record; do not mark an incomplete induction complete.',
'On departure return listed assets and revoke access with evidence. Retain only records permitted by the retention policy and mandatory law.'
],
P04: [
'Services and deliverables: {{services.scope}}. Acceptance criteria and review process: {{services.acceptance}}. Work outside scope requires a recorded change order.',
'The contractor controls lawful working methods subject to deliverables and security obligations. Classification depends on actual circumstances and applicable law; the label alone does not settle employment status.',
'Fees: {{services.fees}}. Tax treatment and permitted expenses: {{services.tax_expenses}}. Invoice and payment timing: {{services.payment}}. No unverified tax rate is inserted.',
'Record changes, price and timing effects before affected work begins. Dependencies supplied by the customer: {{services.dependencies}}. Notify delays and agree a revised plan.',
'Ownership and licence choice: {{services.ip}}. Separate background tools and third-party components in the IP schedule; do not promise rights the contractor cannot grant.',
'Protect defined confidential material, limit use to the engagement, and permit lawful required and protected disclosures. Return/deletion is subject to legitimate legal retention.',
'Actual security and data instructions: {{services.security}}. If personal data is processed, complete a role assessment and appropriate processing schedule rather than claiming certifications.',
'Subcontracting conditions: {{services.subcontracting}}. Retain responsibility for agreed deliverables and bind authorized recipients to applicable confidentiality obligations.',
'Liability allocation: {{services.liability}}. Select an intentional cap/exclusions with local review. Mandatory liabilities and non-waivable remedies are preserved.',
'Termination events, notice and payment for accepted work: {{services.termination}}. Suspension or termination must follow the agreed process and applicable law.',
'Provide the agreed work inventory, credentials through secure channels and reasonable transition assistance: {{services.handover}}. Continuing duties are limited to those expressly identified.',
'Law/forum: {{legal.law_forum}}. Notices: {{legal.notices}}. No agency or authority to bind the company is created without a specific authorization.'
],
P05: [
'Assign only the identified rights in {{ip.work_product}} on the intentionally selected terms {{ip.assignment}}. Confirm execution formalities and ownership before signing.',
'Excluded background and third-party material: {{ip.background}}. Record owner, version, permitted licence and restrictions. Open-source conditions remain applicable.',
'Each contributor confirms only rights actually controlled and supplies reasonable evidence and assistance: {{ip.assistance}}. No guarantee of unknown third-party rights is invented.',
'This schedule supplements {{agreement.reference}} version {{agreement.version}}. Resolve conflicting ownership language expressly; do not expand an existing grant by silence.',
'Permitted background-use licence: {{ip.background_licence}}. Identify duration, scope, sublicensing and termination effects as chosen terms.',
'Delivery inventory: {{ip.delivery}}. Record files, versions, dates and acceptance evidence. The delivery record does not itself prove legal title.'
],
P06: ['At the authorized request for {{verification.purpose}}, the issuer reports the recorded employment facts for {{employee.full_name}}: role {{employment.role}}, dates {{verification.dates}}, status {{verification.status}}.', 'Compensation is disclosed only if authorized and necessary: {{verification.compensation}}. The statement is limited to confirmed records and makes no guarantee of future employment or creditworthiness.', 'Issuer: {{company.legal_name}}. Authorized signatory: {{signatory.full_name}}, {{signatory.capacity}}; authority {{signatory.authority_reference}}. Date: {{document.date}}. No employment history is invented.'],
P07: ['Departing person: {{employee.full_name}}. Last working date: {{offboarding.date}}. Assign owners for access revocation, assets, repositories, contacts and unfinished work.', 'Reconcile each system and item against evidence. Record knowledge-transfer location, outstanding issues and settlement reference {{employment.settlement}}. Credentials belong in a secure vault, not this document.', 'Acknowledgment records handover status; it does not waive rights or certify every access path was removed. Open items: {{offboarding.open_items}}.'],
A01: [
'Each party may disclose information for {{nda.purpose}}. Confidential material includes nonpublic information identified as confidential or reasonably understood as such in context; identify the parties as {{company.legal_name}} and {{counterparty.legal_name}}.',
'Exclude information demonstrably public without breach, already lawfully known, independently developed or received lawfully without restriction. The party relying on an exclusion retains appropriate evidence.',
'Use received information only for the stated purpose. No licence beyond that purpose or authority to exploit the other party’s work is implied.',
'Apply reasonable safeguards proportionate to sensitivity. Share only with representatives who need access and are bound by appropriate duties; remain responsible as agreed for their handling.',
'Required disclosures must be limited to what is lawfully required. Notify where lawful and practicable; do not restrict protected reporting, worker rights or communications with competent authorities.',
'Notify suspected unauthorized use without undue delay through {{nda.incident_contact}}. Cooperate on containment without asserting an unchosen statutory deadline.',
'Return or delete on the agreed trigger {{nda.return_trigger}}, subject to lawful retention and backup constraints. Retained copies remain protected and are not used for a new purpose.',
'Personal data and sensitive security details need lawful scope and actual safeguards. Use a separate processing assessment where required; this NDA does not authorize collection or transfer.',
'Information remains with its rights holder. Disclosure does not oblige either party to proceed, grant exclusivity or create partnership, agency or a broader transaction.',
'Disclosure period and continuing confidentiality duration: {{nda.duration}}. Choose expressly and review trade-secret treatment and mandatory law.',
'Remedies remain those lawfully available. Any agreed remedy must be reviewed for enforceability; no automatic injunction or penalty is promised.',
'Law and forum: {{legal.law_forum}}. Verify party locations and any mandatory restrictions before release.',
'Notices: {{legal.notices}}. Changes require agreement. Identify exact version {{agreement.version}}, authorized capacities and execution dates; no detached reusable signature page.'
],
A02: [
'{{company.legal_name}} is discloser; {{counterparty.legal_name}} is recipient for {{nda.purpose}}. Only the recipient undertakes the information-use duties below; reversing roles requires an explicit change.',
'Exclude lawfully public, previously known, independently developed and legitimately third-party information with supporting evidence.',
'The recipient may use covered information only for the identified purpose and obtains no broader licence or transaction right.',
'The recipient limits access to authorized representatives who need it and applies reasonable safeguards. Representatives must have appropriate confidentiality obligations.',
'Legal-process disclosures are limited to lawful requirements; notify the discloser where permitted. Protected activity and non-waivable rights remain unrestricted.',
'The recipient notifies suspected compromise through {{nda.incident_contact}} and cooperates on reasonable containment without admitting unsupported fault.',
'Return/deletion trigger: {{nda.return_trigger}}. Lawfully retained copies and inaccessible backups remain subject to confidentiality and no new use.',
'Do not disclose personal or sensitive information beyond lawful scope. Any processing role and safeguards require separate assessment; the recipient does not promise unimplemented controls.',
'No obligation to transact, exclusivity, agency or transfer of ownership follows from disclosure. The discloser grants only the limited purpose permission.',
'Disclosure and duty duration: {{nda.duration}}. No arbitrary default is imposed; unresolved duration blocks execution.',
'Remedies are subject to applicable law. Law/forum: {{legal.law_forum}}. No contractual language eliminates mandatory remedies or legal defenses.',
'Notice endpoints: {{legal.notices}}. This version {{agreement.version}} states the selected confidentiality arrangement; changes require both parties’ agreement and authorized execution.'
],
A03: [
'This agreement between {{company.legal_name}} and {{counterparty.legal_name}} governs approved SOWs. Precedence: {{services.precedence}}. No scope begins from an unsigned sales proposal alone.',
'Scope and cooperation: {{services.scope}}. Each party supplies its stated dependencies {{services.dependencies}} and promptly communicates material impediments.',
'Changes identify scope, fees, timing and approvals before affected work. Unaffected terms continue unless a change expressly says otherwise.',
'Acceptance criteria and review: {{services.acceptance}}. Rejection must identify the unmet criterion and reasonable correction process; silence is not deemed acceptance unless intentionally chosen and reviewed.',
'Fees: {{services.fees}}. Payment: {{services.payment}}. Tax/expenses: {{services.tax_expenses}}. Reconcile invoices against the SOW and agreed milestones.',
'Work-product allocation: {{services.ip}}. Background and third-party rights remain identified in schedules. No unowned rights are promised.',
'Correction/warranty scope: {{services.correction}}. Define time, remedy and exclusions deliberately; preserve mandatory rights and avoid unlimited unsupported assurances.',
'Confidential information is limited to agreed purposes with reasonable safeguards and lawful disclosure carveouts. The selected confidentiality arrangement must be consistent with any separate NDA.',
'Security commitments: {{services.security}}. Complete a DPA where processing requires it. Certifications, subprocessors and retention promises require evidence and approval.',
'Liability allocation: {{services.liability}}. Choose caps, exclusions and any indemnities expressly; preserve mandatory non-waivable liabilities.',
'Suspension grounds/process: {{services.suspension}}. Give required notice and a lawful opportunity to cure where appropriate. Record operational and data-access consequences.',
'Events beyond reasonable control: {{services.force_majeure}}. Require notification, reasonable mitigation and an agreed prolonged-event exit; avoid excusing avoidable security failures by default.',
'Termination process: {{services.termination}}. Specify trigger, notice, cure and payment consequences; mandatory rights prevail.',
'Transition and return: {{services.handover}}. Reconcile accepted work, unpaid lawful charges, customer data and retained legal records; continuing duties are expressly limited.',
'Law/forum: {{legal.law_forum}}. Notices: {{legal.notices}}. No partnership or agency is created. Changes and execution identify the exact version and capacities.'
],
A04: ['Deliverables: {{services.scope}}. Exclusions: {{sow.exclusions}}. Milestones: {{sow.milestones}}. Acceptance criteria: {{services.acceptance}}. Record test evidence and unmet criteria, with a correction route.', 'Fees: {{services.fees}}; payment: {{services.payment}}; dependencies: {{services.dependencies}}; responsible contacts: {{sow.contacts}}. This SOW is subject to {{agreement.reference}} version {{agreement.version}} with chosen precedence {{services.precedence}}.', 'SOW approval identifies the scope/version before work begins. Approval fields remain unexecuted until authorized agreement. Authority: {{signatory.authority_reference}}.', 'Post-delivery acceptance is a separate dated record: deliverable version, reviewer, test evidence, accepted items, defects and reserved issues {{sow.acceptance_record}}. Do not pre-sign acceptance before delivery.'],
A05: ['Original agreement: {{agreement.reference}}, version {{agreement.version}}. Change reference: {{change.reference}}. Effective date: {{change.effective_date}}.', 'Exact changes: {{change.text}}. Fee impact: {{change.fees}}. Timing/dependency impact: {{change.timing}}. Identify replaced text precisely.', 'Precedence applies only to the identified amendments; all unaffected provisions remain. Each party approves through its real authorized capacity. This document does not silently novate or replace the entire agreement.'],
A06: ['Execution relates only to {{agreement.reference}} version {{agreement.version}}, attachment inventory {{agreement.attachments}}. It must remain attached to that exact instrument.', 'Parties: {{company.legal_name}} and {{counterparty.legal_name}}. Signatory {{signatory.full_name}} acts as {{signatory.capacity}} under {{signatory.authority_reference}}. Counterparty capacity: {{counterparty.capacity}}.', 'Dates and signatures remain unexecuted. Witnessing or special formalities: {{execution.formalities}}. Confirm applicable law and recipient mandates; no signature image, fabricated witness or assumed electronic-signature validity.'],
A07: [
'Processing occurs only on documented lawful instructions {{processing.instructions}} for scope {{processing.scope}}. Roles {{processing.roles}} require actual assessment; the label does not establish controller/processor status.',
'The instructing party is responsible for lawful scope and necessary notices/authority as applicable. It supplies accurate instructions and does not require unlawful processing.',
'Personnel confidentiality and actual safeguards: {{processing.security}}. No unsupported certification or universal-security promise is made. Review adequacy against risk and mandatory law.',
'Authorized subprocessors and approval/change process: {{processing.subprocessors}}. Record location, function and contractual safeguards; do not import a dependency list as a processor list.',
'Assistance with rights requests and compliance: {{processing.assistance}}. Define scope, contacts and lawful cost treatment. The processor must not answer beyond authorized instructions unless law requires it.',
'Incident communication process: {{processing.incidents}}. Choose applicable deadlines from current official requirements and operational capability; do not invent a universal time limit.',
'Evidence and audit: {{processing.audit}}. Provide appropriate evidence with protections for other customers, secrets and system security; mandatory regulator access is preserved.',
'Retention/deletion: {{processing.retention}}. Transfers: {{processing.transfers}}. Record destinations and required lawful mechanism rather than assuming an instrument cures every transfer.',
'Priority and liability: {{processing.priority}}. Resolve conflict with the MSA explicitly. Schedules identify data subjects {{processing.subjects}}, categories {{processing.categories}}, purposes {{processing.purposes}} and duration {{processing.duration}}.'
],
A08: [
'The commercial intentions {{mou.intent}} are nonbinding unless a section is expressly identified below as binding. Neither party is obliged to conclude a final transaction.',
'Evaluation work, contacts and intended milestones: {{mou.evaluation}}. Each party confirms only its selected responsibilities; future commitments require a definitive agreement.',
'No partnership, agency or regulated authority is conferred. The MOU cannot authorize representations to regulators or bind a separate entity.',
'Binding provisions, if intentionally selected: {{mou.binding}}. Specify confidentiality, costs, information handling and any other binding obligations precisely; do not describe the whole MOU as both binding and nonbinding.',
'Existing rights and agreements remain except as expressly identified. No transfer of IP, exclusivity or waiver is implied.',
'Duration: {{mou.duration}}; costs: {{mou.costs}}; law/notices for binding provisions: {{legal.law_forum}}, {{legal.notices}}. Execution confirms the identified version and capacities.'
],
C01: [
'Governance basis: {{governance.structure}} under {{governance.authority}}. Confirm actual entity constitution, quorum and procedure; this is an unadopted decision draft.',
'Approve only {{authority.purpose}} within {{authority.limit}}. Unlisted transactions and powers are excluded. Attach the exact documents and version approved.',
'Representative: {{signatory.full_name}}, capacity {{signatory.capacity}}. Authority applies only to the stated purpose and is not a general power to bind related entities.',
'Conditions and expiry: {{authority.conditions}}, {{authority.expiry}}. Revocation process: {{authority.revocation}}. Verify before each use.',
'Custodian records adoption evidence, decision date, document hashes and delivery records. No backdated adoption or inferred quorum is permitted.',
'An ordinary stamp is not a common seal. Excluded powers: {{authority.excluded}}. Any common-seal procedure requires applicable law and constitution review.',
'A certified extract can be completed only after genuine valid adoption and by an authorized person who compared the actual record. This draft carries no certification.'
],
C02: ['Delegate: {{authority.delegate}}. Recipient: {{recipient.name}}. Purpose: {{authority.purpose}}. Permitted acts: {{authority.acts}}.', 'Excluded powers: {{authority.excluded}}. No contract execution, bank mandate, broad representation or subdelegation follows unless specifically included and lawfully approved.', 'Validity: {{authority.expiry}}; revocation: {{authority.revocation}}. Issuer authority: {{signatory.authority_reference}}. Retain submitted document/version and receipt evidence.'],
C03: ['Legal name {{company.legal_name}}; trading name {{company.trading_name}}; entity type {{company.entity_type}}; jurisdiction {{company.jurisdiction}}; registered office {{company.registered_office}}; registration {{company.registration_identifier}}; tax identifier {{company.tax_identifier}}. Each field retains its own evidence status.', 'Business description: {{company.description}}. Submission purpose: {{kyb.purpose}}. Do not assert regulatory permission, completed KYC or incorporation from a domain.', 'Evidence attached: {{kyb.attachments}}. Redact personal/irrelevant data and use the recipient’s secure channel. This cover does not replace a prescribed recipient form.'],
C04: ['To {{recipient.name}}, process reference {{submission.reference}}: {{company.legal_name}} requests {{submission.action}}.', 'Factual representations: {{submission.facts}}. Attachments: {{submission.attachments}}. Preserve separately prescribed forms and identify discrepancies rather than altering official forms.', 'Authorized sender {{signatory.full_name}}, {{signatory.capacity}} under {{signatory.authority_reference}}. No submission has occurred; retain actual receipt/service evidence when later authorized.'],
C05: ['Document compared: {{certification.document}}; version/date {{certification.version}}; comparison basis {{certification.basis}}.', 'UNEXECUTED CERTIFICATION DRAFT. A genuine authorized certifier must inspect the original or permissible comparison basis, record scope and actual date, and complete the certification personally.', 'Proposed certifier and authority: {{certification.certifier}}, {{certification.authority}}. This record supplies no notary status, seal, certificate or fabricated statement that comparison occurred.'],
C06: ['Notice under {{agreement.reference}}, version {{agreement.version}}, clause {{notice.clause}}. Notice type {{notice.type}}; facts {{notice.facts}}.', 'Action requested: {{notice.action}}. Dates/deadlines {{notice.dates}} must be independently checked against the contract and applicable service rules; no automatic deadline calculation is assumed.', 'Delivery method and address {{notice.delivery}}. Keep dispatch, receipt and service evidence separately. This draft is not evidence of service or acceptance.'],
C07: ['Actual ownership/governance procedure {{governance.structure}}, authority {{governance.authority}}. Matter considered: {{decision.matter}}. Do not assume a sole member from the reference slot.', 'Proposed decision: {{decision.text}}. Required approvals, quorum and constitution process {{decision.process}} remain subject to verification and genuine adoption.', 'Implementation owner and recordkeeper {{decision.custodian}} preserve the adopted version, date and authority evidence. No adoption or vote is fabricated.'],
C08: ['Release requires separately recorded factual verification, technical QA, local legal review where relevant and authentic authority. Stamp use is separately recorded and cannot substitute for approval.', 'Keep document ID/version/hash, purpose, recipient, actual approval evidence, custodian, use date and retention choice {{records.retention}}. Restrict access and avoid retaining unnecessary personal information.'],
F01: ['Seller {{company.legal_name}}; buyer {{counterparty.legal_name}}. Invoice {{invoice.reference}}, date {{document.date}}; supply description and amounts are listed below.', 'Currency {{finance.currency}}. Tax treatment {{invoice.tax_treatment}} requires verification. This is a commercial invoice draft; it is not represented as an approved statutory tax invoice.', 'Due/payment instructions {{services.payment}}, {{invoice.payment_instructions}}. Reconcile the invoice to agreement {{agreement.reference}} and evidence before issue. Never use a founder’s personal tax ID as the company’s.'],
F02: ['Payer {{counterparty.legal_name}}; payee {{company.legal_name}}. Receipt reference {{receipt.reference}}, observation date {{receipt.date}}, payment evidence {{receipt.evidence}}.', 'Allocate the observed amount to invoice {{invoice.reference}}. A reported payment is distinct from bank settlement, a refund promise or a tax invoice. Unverified funds cannot be acknowledged as received.', 'Record partial payment and remaining balance in the finance schedule. Authorized issuer {{signatory.full_name}} checks the ledger/processor against the stated observation.'],
F03: ['Dispute {{dispute.reference}} concerns {{dispute.issue}}. Neutral chronology {{dispute.chronology}}. Proposed resolution {{dispute.resolution}} is subject to confirmation and does not invent fault or settlement.', 'Evidence index {{dispute.evidence}} identifies each source/version and necessary redactions. Do not attach credentials, full customer exports or irrelevant personal data.', 'Reconcile invoice, payment observations, fees, refunds and settlement separately: {{dispute.reconciliation}}. Record uncertainty and next action, rather than treating a processor screen as proof of final settlement.']
};
export const headings = {
S04:['Recipient and reference','Subject and correspondence','Attachments','Authorized issuer'], S05:['Sending reference','CID implementation'],S06:['Signature content','Installation and proof'],S07:['Ordinary stamps','Production and custody'],
P06:['Verified facts','Disclosure scope','Issuer'],P07:['Departure and responsibilities','Reconciliation','Acknowledgment'],
A05:['Identified agreement','Precise amendment','Precedence and approval'],A06:['Attached instrument','Parties and capacities','Unexecuted formalities'],
C02:['Limited mandate','Excluded powers','Validity and records'],C03:['Particulars','Business description','Evidence attached'],C04:['Requested action','Facts and attachments','Authority'],C05:['Document identity','Certification gate','Certifier'],C06:['Contract and facts','Action and dates','Service evidence'],
F01:['Invoice identity','Tax boundary','Payment and reconciliation'],F02:['Payment observation','Allocation and status','Reconciliation'],F03:['Dispute and chronology','Evidence handling','Internal reconciliation']
};
export const schedules = {
P02:['Employment terms','employment.role','employment.location','employment.hours','employment.remuneration','employment.leave','employment.notice'],
P03:['Supplied policy and asset record','employment.policy_versions','onboarding.assets','onboarding.access','onboarding.training'],
P04:['Services schedule','services.scope','services.acceptance','services.fees','services.dependencies'],
P05:['Background IP schedule','ip.background','ip.background_licence','ip.delivery'],
P07:['Handover checklist','offboarding.access','offboarding.assets','offboarding.transfer','offboarding.open_items'],
A01:['Confidentiality schedule','nda.purpose','nda.duration','nda.return_trigger','nda.incident_contact'],
A02:['Disclosure schedule','nda.purpose','nda.duration','nda.return_trigger','nda.incident_contact'],
A03:['Commercial schedule','services.scope','services.acceptance','services.fees','services.payment','services.liability'],
A04:['Acceptance schedule','sow.milestones','sow.exclusions','sow.acceptance_record'],
A07:['Processing schedule','processing.roles','processing.subjects','processing.categories','processing.purposes','processing.duration','processing.subprocessors','processing.security','processing.transfers'],
C08:['Release and stamp register','records.document','records.version','records.approval','records.recipient','records.custodian','records.stamp_use','records.retention']
};
