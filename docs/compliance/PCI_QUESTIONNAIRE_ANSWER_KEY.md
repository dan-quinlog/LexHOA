# PCI Questionnaire Answer Key

**Assessment date:** 2026-07-21 | **Planning standard:** PCI DSS v4.0.1

## Attestation rule and assumptions

**Current** is a conservative Yes/No/N/A as of 2026-07-21. A planned control stays **No** until implemented, operating, and evidenced. A control that might exist in AWS but is not proved by repository evidence is **No**, not Yes or N/A. **Target** is Yes, or N/A only under the documented assumptions, after roadmap completion and explicit acceptance/evidence. These are planning answers—not a legal opinion, QSA certification, SAQ, AOC, or claim of compliance.

`PCI Questionnaire.pdf` is a custom PCI DSS v4.0-derived checklist, not an official or complete SAQ. PCI DSS v4.0.1 is current. LexHOA must obtain written confirmation of the applicable SAQ and scope from its acquirer, with QSA assistance as appropriate. Custom Accept.js likely suggests A-EP, but final eligibility is never asserted here.

Assumptions supporting N/A are narrow: LexHOA does not intentionally store PAN or SAD after authorization; has no stored-PAN encryption/key-at-rest program, remote PAN access, CHD in preproduction/messaging, paper/electronic CHD media, physical POI terminals, SSL/early-TLS POI, or manual cleartext key operations. No merchant-managed wireless connects to the CDE. This does **not** automatically make unauthorized-AP detection N/A if full SAQ D applies, and Requirement 9 is not blanket N/A because administrator endpoints/facilities may remain in scope. Revalidate assumptions annually and after significant change.

The PDF prints some canonical controls as artificial `.a`/`.b`/`.c` etc. rows. They share the canonical grouping/evidence but every printed Source ID is answered separately below. `6.4.3` and `11.6.1` are applicable.

## Exact summary

| State | Yes | No | N/A | Total |
|---|---:|---:|---:|---:|
| Current | 0 | 211 | 43 | 254 |
| Target | 211 | 0 | 43 | 254 |

**Legend:** `D` = approved/live configuration or diagram evidence; `P` = policy, role, review, training or operating record; `T` = implementation plus negative/security tests and deployment evidence; `V` = live AWS/tool/vendor evidence; `NA-*` = signed N/A rationale revalidated under the assumptions above. Target Y always means the referenced evidence exists, is current, reviewed, and meets the full PDF control—not merely that work was attempted.

## Requirement 1 — network security controls

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|1.1.1|Req. 1 policies/procedures|N|Y|P: approved/current/in use|
|1.1.2|Req. 1 roles|N|Y|P: assigned/understood|
|1.2.1|NSC standards|N|Y|V: WAF/API/managed-boundary baseline|
|1.2.2|NSC change control|N|Y|P,V: approved diffs/deploys|
|1.2.3|Network diagram|N|Y|D: approve `network-diagram.svg` against live AWS and retain annual/change review|
|1.2.4|Account-data flow|N|Y|D: approve `payment-data-flow-diagram.svg` against live flows and retain change review|
|1.2.5|Allowed services/ports|N|Y|V: inventory/business approval|
|1.2.6|Insecure-service safeguards|N|Y|V: TLS/config proof|
|1.2.7|Six-month NSC review|N|Y|P,V: signed review|
|1.2.8|Protected/consistent NSC config|N|Y|V: IAM, IaC/live comparison|
|1.3.1|Restrict inbound CDE traffic|N|Y|V: endpoint/WAF default deny|
|1.3.2|Restrict outbound CDE traffic|N|Y|V: Lambda destinations/policy|
|1.3.3|NSCs between wireless and CDE|N/A|N/A|NA-WIFI: no merchant-managed wireless connected to the CDE; revalidate scope|
|1.4.1|NSCs between trusted/untrusted|N|Y|V: managed edge/WAF proof|
|1.4.2|Limit inbound untrusted traffic|N|Y|V: routes/methods/rules tests|
|1.4.3|Anti-spoofing|N|Y|V: AWS/TPSP responsibility evidence|
|1.4.4|Stored-CHD systems not directly exposed|N/A|N/A|NA-ST: no system stores CHD; confirm with recurring discovery|
|1.4.5|Limit internal address/routing disclosure|N|Y|V: architecture and response tests|
|1.5.1|Personal-device security impact|N|Y|P,V: admin endpoint controls|

## Requirement 2 — secure configurations

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|2.1.1|Req. 2 policies/procedures|N|Y|P|
|2.1.2|Req. 2 roles|N|Y|P|
|2.2.1|Configuration standards|N|Y|V: AWS/Amplify baseline|
|2.2.2|Vendor defaults/accounts|N|Y|V: rotations and scans|
|2.2.3|Primary-function isolation|N|Y|V: service/Lambda inventory|
|2.2.4|Unnecessary functionality|N|Y|V: remove/justify inventory|
|2.2.5|Insecure services/protocols|N|Y|V: TLS and exceptions|
|2.2.6|System security parameters|N|Y|V: hardened live export|
|2.2.7|Encrypt non-console admin|N|Y|V: provider TLS/admin proof|
|2.3.1|Change wireless vendor defaults|N/A|N/A|NA-WIFI: no merchant-managed wireless connected to the CDE|
|2.3.2|Change wireless keys after compromise/departure|N/A|N/A|NA-WIFI: no CDE wireless keys; revalidate after change|

## Requirement 3 — protect stored account data

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|3.1.1|Req. 3 policies/procedures|N|Y|P|
|3.1.2|Req. 3 roles|N|Y|P|
|3.2.1|Stored-data minimization/retention|N|Y|P,V: searches and approved retention|
|3.3.1|No SAD after authorization|N|Y|T,V: redacted logs/storage scans|
|3.3.1.1|No full track data stored|N|Y|D,T: design plus completed recurring storage/log searches|
|3.3.1.2|No card verification code stored|N|Y|D,T: Accept.js flow plus completed storage/log searches|
|3.3.1.3|No PIN/PIN block stored|N|Y|D,T: no PIN capture plus completed storage/log searches|
|3.3.2|SAD encryption before authorization|N/A|N/A|NA-ST: no SAD storage; transient direct tokenization only|
|3.4.1|Mask PAN display|N/A|N/A|NA-ST: LexHOA never receives/displays PAN|
|3.4.2|Remote-access PAN copy blocked|N/A|N/A|NA-RA: no remote PAN access/display|
|3.5.1|Render stored PAN unreadable|N/A|N/A|NA-ST: no stored PAN|
|3.5.1.1|Hashing of stored PAN|N/A|N/A|NA-ST: no stored PAN/hash repository|
|3.5.1.2|Disk encryption for PAN|N/A|N/A|NA-ST: no stored PAN|
|3.5.1.3|Cryptographic keys for PAN|N/A|N/A|NA-ST: no PAN-encryption keys|
|3.6.1|Protect PAN cryptographic keys|N/A|N/A|NA-ST: no PAN-encryption keys|
|3.6.1.2|Secure key storage|N/A|N/A|NA-ST|
|3.6.1.3|Minimum key locations|N/A|N/A|NA-ST|
|3.6.1.4|Key access restriction|N/A|N/A|NA-ST|
|3.7.1|Key-generation strength|N/A|N/A|NA-KEY: no PAN key lifecycle|
|3.7.2|Secure key distribution|N/A|N/A|NA-KEY|
|3.7.3|Secure key storage|N/A|N/A|NA-KEY|
|3.7.4|Key cryptoperiod changes|N/A|N/A|NA-KEY|
|3.7.5|Key retirement/replacement|N/A|N/A|NA-KEY|
|3.7.6|Manual cleartext key split knowledge|N/A|N/A|NA-KEY: no manual cleartext operations|
|3.7.7|Prevent unauthorized key substitution|N/A|N/A|NA-KEY|
|3.7.8|Key-custodian acknowledgment|N/A|N/A|NA-KEY|

## Requirement 4 — protect transmission

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|4.1.1|Req. 4 policies/procedures|N|Y|P|
|4.1.2|Req. 4 roles|N|Y|P|
|4.2.1.a|Accept only trusted keys/certificates|N|Y|V: live TLS chain/configuration|
|4.2.1.b|Certificates valid and not expired/revoked|N|Y|V: certificate monitoring and test|
|4.2.1.c|Protocols support secure versions/configurations|N|Y|V: TLS configuration scan|
|4.2.1.d|Encryption strength appropriate|N|Y|V: protocols/ciphers evidence|
|4.2.1.1|Trusted key/certificate inventory|N|Y|V: complete inventory and expiry ownership|
|4.2.1.2|Strong wireless PAN protection|N/A|N/A|NA-WIFI: no wireless network transmits PAN or connects to the CDE|
|4.2.2|Protect PAN in end-user messaging|N/A|N/A|NA-MSG: PAN messaging is prohibited and has no business use case|

## Requirement 5 — malware protection

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|5.1.1|Req. 5 policies/procedures|N|Y|P|
|5.1.2|Req. 5 roles|N|Y|P|
|5.2.1|Anti-malware on susceptible systems|N|Y|V: admin endpoint/runtime inventory|
|5.2.2|Detect, remove, block, or contain known malware|N|Y|V: endpoint/tool capability evidence|
|5.2.3|Periodically evaluate systems deemed not at risk|N|Y|P,V: documented component evaluation|
|5.2.3.1|Risk-based evaluation frequency|N|Y|P,V: targeted risk analysis|
|5.3.1|Automatic malware updates|N|Y|V|
|5.3.2|Periodic scans or continuous analysis|N|Y|V|
|5.3.2.1|Risk-based periodic scan frequency|N|Y|P,V: targeted risk analysis when periodic scans are used|
|5.3.3|Scan or continuously analyze removable media|N|Y|V: inventory scoped endpoints and prove inserted-media scanning/analysis; N/A only if all applicable endpoints technically prohibit it|
|5.3.4|Enable and retain anti-malware logs|N|Y|V: protected/retained logs|
|5.3.5|Prevent unauthorized anti-malware disablement|N|Y|V|
|5.4.1|Protect against phishing|N|Y|P,V: training/technical controls|

## Requirement 6 — secure development

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|6.1.1|Req. 6 policies/procedures|N|Y|P|
|6.1.2|Req. 6 roles|N|Y|P|
|6.2.1|Bespoke software securely developed|N|Y|T: SDLC/threat model/tests|
|6.2.2|Security training for developers|N|Y|P: role training|
|6.2.3|Code review before release|N|Y|T: independent review record|
|6.2.3.1|Manual/automated review methods|N|Y|T: SAST/review evidence|
|6.2.4.a|Prevent injection|N|Y|T: security tests|
|6.2.4.b|Prevent data-structure attacks|N|Y|T|
|6.2.4.c|Prevent cryptography misuse|N|Y|T|
|6.2.4.d|Prevent business-logic attacks|N|Y|T: server-owned payment authorization|
|6.2.4.e|Prevent access-control attacks|N|Y|T: ownership and privilege tests|
|6.2.4.f|Prevent high-risk vulnerabilities|N|Y|T|
|6.3.1|Identify security vulnerabilities|N|Y|V: SBOM/advisories/scans|
|6.3.2|Software inventory|N|Y|V: SBOM/components|
|6.3.3|Install security patches|N|Y|V: serverless runtime/dependency redeploys|
|6.4.1|Public-app attack protection|N|Y|V,T: WAF/equivalent and tests|
|6.4.2|Automated public-app protection|N|Y|V: WAF monitoring/config|
|6.4.3.a|Authorize payment-page scripts|N|Y|T: script register/approval|
|6.4.3.b|Assure script integrity|N|Y|T: CSP/integrity rationale/tests|
|6.4.3.c|Maintain script inventory/justification|N|Y|P,T: reviewed inventory|
|6.5.1|Change control|N|Y|P,T: ticket/approval/test/rollback|
|6.5.2|Significant-change PCI validation|N|Y|P,T|
|6.5.3|Separate preproduction/production|N|Y|V: environment/access proof|
|6.5.4|Separate duties/environments|N|Y|V,P|
|6.5.5|No live PAN in preproduction|N|Y|T,V: prove every non-production environment uses only synthetic/vendor test data|
|6.5.6|Remove test data/accounts|N|Y|T,V|

## Requirement 7 — restrict access

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|7.1.1|Req. 7 policies/procedures|N|Y|P|
|7.1.2|Req. 7 roles|N|Y|P|
|7.2.1|Access-control model|N|Y|V,P: least privilege model|
|7.2.2|Need-to-know access|N|Y|V: IAM/Cognito/Git/vendor export|
|7.2.3|Required privileges only|N|Y|V|
|7.2.4|User access reviews|N|Y|P,V: quarterly sign-off|
|7.2.5|Application/system account access|N|Y|V|
|7.2.5.1|Periodic account-access review|N|Y|P,V|
|7.2.6|Restrict direct queries of stored CHD|N/A|N/A|NA-ST: no stored CHD repository or direct PAN query path|
|7.3.1|Access-control system in place|N|Y|T,V|
|7.3.2|Enforce assigned permissions|N|Y|T,V|
|7.3.3|Deny access by default|N|Y|V,T|

## Requirement 8 — identity and authentication

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|8.1.1|Req. 8 policies/procedures|N|Y|P|
|8.1.2|Req. 8 roles|N|Y|P|
|8.2.1|Unique user IDs|N|Y|V: identity exports|
|8.2.2|Shared IDs managed|N|Y|V,P|
|8.2.4|Add/change/delete identity lifecycle|N|Y|P,V|
|8.2.5|Terminate access immediately|N|Y|P,V|
|8.2.6|Inactive accounts disabled|N|Y|V|
|8.2.7|Third-party remote accounts|N|Y|V,P|
|8.2.8|Idle session timeout|N|Y|V,T|
|8.3.1|Strong authentication factors|N|Y|V|
|8.3.2|Strong cryptography for credentials|N|Y|V|
|8.3.3|Verify identity before reset|N|Y|P,T|
|8.3.4|Limit invalid attempts|N|Y|V,T|
|8.3.5|Unique initial/reset passwords|N|Y|V,T|
|8.3.6|Password/passphrase parameters|N|Y|V|
|8.3.7|Prevent password reuse|N|Y|V|
|8.3.8|Password/authentication-factor user guidance|N|Y|P,V|
|8.3.9|Periodic password change where single-factor|N|Y|V,P|
|8.3.11|Individually assign physical/logical authentication factors|N|Y|P,V|
|8.4.1|MFA for CDE admin access|N|Y|V: all privileged systems|
|8.4.2|MFA for all CDE access|N|Y|V|
|8.4.3|MFA for remote network access|N|Y|V: admin access remains applicable|
|8.5.1|MFA implementation resists misuse|N|Y|V,T|
|8.6.1|Control exceptional interactive use of system accounts|N|Y|P,V|
|8.6.2|Prevent hard-coded system-account passwords|N|Y|V,T|
|8.6.3|Protect and periodically change system-account passwords|N|Y|V: Secrets Manager/SSM, rotation|

## Requirement 9 — physical access

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|9.1.1|Req. 9 policies/procedures|N|Y|P: administrator/facility scope|
|9.1.2|Req. 9 roles|N|Y|P|
|9.2.1|Facility entry controls|N|Y|P,V: scoped admin facilities/endpoints|
|9.2.1.1|Monitor sensitive-area entry/exit|N|Y|P,V|
|9.2.2|Restrict public network jacks|N|Y|P,V|
|9.2.3|Restrict physical network/wireless hardware access|N|Y|P,V|
|9.2.4|Lock sensitive-area consoles|N|Y|P,V|
|9.3.1|Personnel physical access authorization|N|Y|P|
|9.3.1.1|Revoke terminated personnel physical access|N|Y|P,V|
|9.3.2|Visitor access/escort|N|Y|P|
|9.3.3|Return/deactivate visitor identification|N|Y|P|
|9.3.4|Visitor log retention|N|Y|P,V|
|9.4.1|Protect CHD media|N/A|N/A|NA-MEDIA: no CHD media|
|9.4.1.1|Offline media backup security|N/A|N/A|NA-MEDIA|
|9.4.1.2|Annual media-location review|N/A|N/A|NA-MEDIA|
|9.4.2|Classify sensitive media|N/A|N/A|NA-MEDIA|
|9.4.3|Secure and track media transport|N/A|N/A|NA-MEDIA|
|9.4.4|Management approval before moving media|N/A|N/A|NA-MEDIA|
|9.4.5|Media inventory|N/A|N/A|NA-MEDIA|
|9.4.5.1|Annual media inventory|N/A|N/A|NA-MEDIA|
|9.4.6|Destroy hard-copy CHD|N/A|N/A|NA-MEDIA|
|9.4.7|Destroy electronic CHD media|N/A|N/A|NA-MEDIA|
|9.5.1|Protect POI devices|N/A|N/A|NA-POI: no physical POI|
|9.5.1.1|POI device inventory|N/A|N/A|NA-POI|
|9.5.1.2|Inspect POI devices|N/A|N/A|NA-POI|
|9.5.1.2.1|Risk-based POI inspection frequency|N/A|N/A|NA-POI: no physical POI devices|
|9.5.1.3|POI tamper-awareness training|N/A|N/A|NA-POI|

## Requirement 10 — logging and monitoring

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|10.1.1|Req. 10 policies/procedures|N|Y|P|
|10.1.2|Req. 10 roles|N|Y|P|
|10.2.1|Audit logs enabled|N|Y|V: live CloudTrail/CloudWatch/tool proof|
|10.2.1.1|Log individual account-data access|N|Y|V: scoped event evidence|
|10.2.1.2|Log administrative actions|N|Y|V|
|10.2.1.3|Log audit-log access|N|Y|V|
|10.2.1.4|Log invalid access attempts|N|Y|V|
|10.2.1.5|Log identity changes|N|Y|V|
|10.2.1.6|Log audit mechanism changes|N|Y|V|
|10.2.1.7|Log system-object creation/deletion|N|Y|V|
|10.2.2|Required audit-log content|N|Y|V: sample fields/UTC identity|
|10.3.1|Restrict audit-log access|N|Y|V|
|10.3.2|Protect logs from modification|N|Y|V|
|10.3.3|Back up logs securely|N|Y|V|
|10.3.4|File-integrity/change detection for logs|N|Y|V,T|
|10.4.1|Daily security-event/log review|N|Y|P,V: daily tickets|
|10.4.1.1|Automated log review|N|Y|V|
|10.4.2|Periodic other-log review|N|Y|P,V|
|10.4.2.1|Risk-based review frequency|N|Y|P|
|10.4.3|Resolve review exceptions|N|Y|P: tracked tickets|
|10.5.1|Audit-log retention|N|Y|P,V|
|10.6.1|Clock synchronization|N|Y|V|
|10.6.2|Time configuration|N|Y|V|
|10.6.3|Protect time settings|N|Y|V|
|10.7.2|Detect critical control failure|N|Y|V,T: alarm tests|
|10.7.3|Respond to control failure|N|Y|P,T|

## Requirement 11 — test security

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|11.1.1|Req. 11 policies/procedures|N|Y|P|
|11.1.2|Req. 11 roles|N|Y|P|
|11.2.1|Unauthorized wireless detection|N|Y|V: quarterly method/report if full SAQ D|
|11.2.2|Wireless inventory|N|Y|V: no-managed-wireless proof plus detections|
|11.3.1|Internal vulnerability scans|N|Y|V: scan and remediation|
|11.3.1.1|Address internal scan findings|N|Y|V|
|11.3.1.2.a|Authenticated internal scans|N|Y|V|
|11.3.1.2.b|Privileged scan access|N|Y|V|
|11.3.1.2.c|Scanning credentials protected|N|Y|V|
|11.3.1.3|Scans after significant change|N|Y|V|
|11.3.2|Quarterly external ASV scans|N|Y|V: passing ASV or confirmed-scope evidence|
|11.3.2.1|External scans after change|N|Y|V|
|11.4.1|Penetration-test methodology|N|Y|V: qualified annual test|
|11.4.2|Internal penetration testing|N|Y|V|
|11.4.3|External penetration testing|N|Y|V|
|11.4.4|Remediate/retest findings|N|Y|V|
|11.4.5|Segmentation penetration tests|N/A|N/A|NA-SEG: LexHOA does not rely on network segmentation for scope reduction; revalidate with scope|
|11.5.1|IDS/IPS for network intrusions|N|Y|V,T|
|11.5.2|Critical-file change detection|N|Y|V,T|
|11.6.1.a|Detect payment-page header/content changes|N|Y|T,V: independent weekly tamper test|
|11.6.1.b|Evaluate received headers/page|N|Y|T,V: approved baseline/alert|
|11.6.1.c|Alert on unauthorized changes|N|Y|T,V: alert ticket/escalation|

## Requirement 12 — governance

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|12.1.1|Security policy established|N|Y|P|
|12.1.2|Annual policy review|N|Y|P|
|12.1.3|Security-policy roles|N|Y|P|
|12.1.4|Executive responsibility|N|Y|P|
|12.2.1|Acceptable-use policy for end-user technologies|N|Y|P|
|12.3.1|Risk-based control frequencies|N|Y|P|
|12.3.3|Cryptographic protocol/cipher review|N|Y|P,V|
|12.3.4|Technology inventory/review|N|Y|P,V|
|12.5.1|Inventory in-scope system components|N|Y|P,V|
|12.5.2|Annual PCI scope confirmation|N|Y|P,V: Step 0 signed scope|
|12.5.2.a|Identify payment flows|N|Y|D,P|
|12.5.2.b|Identify all account-data locations|N|Y|D,V: discovery and inventory|
|12.5.2.c|Identify all account-data transmission/storage/processing|N|Y|D,V|
|12.5.2.d|Identify connected and security-impacting systems|N|Y|V: live inventory|
|12.5.2.e|Identify third-party connectivity|N|Y|P,V: TPSP register and diagrams|
|12.5.2.f|Validate segmentation controls|N|Y|P,V: document non-reliance or test controls|
|12.5.2.g|Identify in-scope third-party services|N|Y|P,V: service responsibility matrix|
|12.6.1|Security-awareness program|N|Y|P|
|12.6.2|Annual awareness review|N|Y|P|
|12.6.3|Personnel security training|N|Y|P|
|12.6.3.1|Training on phishing/social-engineering threats|N|Y|P|
|12.6.3.2|Training on acceptable use|N|Y|P|
|12.7.1|Personnel screening|N|Y|P: lawful role-based records|
|12.8.1|TPSP inventory|N|Y|P|
|12.8.2|TPSP agreements|N|Y|P|
|12.8.3|TPSP due diligence|N|Y|P|
|12.8.4|Monitor TPSP PCI status|N|Y|P,V: current AOCs|
|12.8.5|TPSP responsibility matrix|N|Y|P|
|12.10.1|Incident-response plan|N|Y|P|
|12.10.2|Annual plan review/test|N|Y|P: tabletop report|
|12.10.3|24/7 incident responders|N|Y|P: contact/escalation proof|
|12.10.4|Responder training|N|Y|P|
|12.10.4.1|Training frequency|N|Y|P|
|12.10.5|Monitor security alerts|N|Y|P,V|
|12.10.6|Evolve response from lessons|N|Y|P|
|12.10.7|PAN discovery response|N|Y|P,T|

## Appendix A2 — SSL/early TLS for card-present POI

|Source ID|Concise control|Current|Target|Roadmap / evidence note|
|---|---|:---:|:---:|---|
|A2.1.1|SSL/early-TLS POI exception|N/A|N/A|NA-POI-TLS: no physical POI and no SSL/early-TLS POI connection|

## Evidence and reassessment gate

Before changing any Current answer, the Control Owner links period-appropriate evidence using the [operations manual](./PCI_OPERATIONS_MANUAL.md), an independent reviewer verifies the *whole* printed row, and the Compliance Owner records approval/date. Before changing an N/A, repeat the documented N/A procedure. Before submission, regenerate the row/count validation and reconcile this planning key to the acquirer-confirmed official SAQ; artificial rows remain traceable to their canonical controls.
