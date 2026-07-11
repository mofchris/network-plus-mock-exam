/* Network+ Study Course — Unit 4: Operations & Security */
(function () {
  const C = window.NETCOURSE = window.NETCOURSE || { units: [] };

  C.units.push({
    id: "u4",
    title: "Unit 4 — Operations and Security",
    blurb: "Keeping the network alive and defended: monitoring, availability, documentation, and the attacks you must recognize and stop.",
    modules: [

/* ================= MODULE 13 ================= */
{
  id: "m4_1", title: "Monitoring, Baselines, and Documentation", minutes: 13, level: "core",
  content: `
<p>You cannot manage what you cannot see. Operations is the discipline of knowing what "normal" looks
like — so that "abnormal" announces itself instead of hiding until users start calling.</p>

<h2>The three data sources</h2>
<table>
  <tr><th>Tool</th><th>Answers</th><th>Port</th></tr>
  <tr><td><strong>SNMP</strong></td><td>"How is this device doing?" — CPU, memory, interface counters</td><td>UDP 161 (polls), 162 (traps)</td></tr>
  <tr><td><strong>Syslog</strong></td><td>"What happened, and when?" — events and errors</td><td>UDP 514</td></tr>
  <tr><td><strong>NetFlow / sFlow / IPFIX</strong></td><td>"Who is talking to whom, and how much?" — top talkers</td><td>Varies</td></tr>
</table>
<p><strong>SNMP</strong> uses a manager/agent model. The manager <em>polls</em> agents (Get) for values
identified by OIDs in a MIB; agents send unsolicited <strong>traps</strong> when something breaks.</p>
<div class="exambox"><strong>SNMPv3 is the only acceptable answer for secure monitoring.</strong> v1 and
v2c use clear-text community strings — effectively a password sent in the open. v3 adds authentication
and encryption.</div>
<p><strong>Syslog severity</strong> runs 0 (Emergency) to 7 (Debug). <em>Lower number = more severe.</em>
Setting a device to level 7 in production will drown you.</p>

<h2>Baselines: the concept that makes alerts meaningful</h2>
<p>A <strong>baseline</strong> is a record of normal performance over a representative period — CPU,
memory, interface utilization, latency. Without it, "CPU is at 60%" means nothing. With it, you know
60% is either routine or a five-fold spike.</p>
<p>Thresholds should come from the baseline. Alert on <em>deviation</em>, not on arbitrary round numbers,
or you'll tune out the alerts entirely — the real-world failure mode of every monitoring project.</p>

<h2>Documentation that actually gets used</h2>
<ul>
  <li><strong>Physical diagram</strong> — racks, ports, cable runs. Where things <em>are</em>.</li>
  <li><strong>Logical diagram</strong> — VLANs, subnets, routing, traffic flow. How things <em>work</em>.</li>
  <li><strong>IPAM</strong> (IP Address Management) — every subnet, its VLAN, and which device holds which address. Prevents duplicate-IP outages.</li>
  <li><strong>Asset inventory</strong> — model, serial, warranty, and end-of-life/end-of-support dates. Drives replacement budgeting.</li>
  <li><strong>Runbook</strong> — step-by-step procedures for routine and emergency operations, so the outcome doesn't depend on who is on call at 3 a.m.</li>
  <li><strong>Configuration backups</strong> — because a dead switch with no saved config is a very long night.</li>
</ul>
<div class="warnbox"><strong>Never store default or plaintext passwords in documentation.</strong> It's a
tempting shortcut and it's a security failure. Exam questions include it as a distractor.</div>

<h2>Change management</h2>
<p>The process exists because unreviewed changes cause more outages than hardware failures do.</p>
<ol>
  <li><strong>Request</strong> — what, why, and who is affected.</li>
  <li><strong>Assess impact and risk</strong>, then get <strong>approval</strong>.</li>
  <li><strong>Schedule</strong> a maintenance window and notify stakeholders.</li>
  <li><strong>Prepare a rollback (backout) plan</strong> — the step people skip and later regret.</li>
  <li><strong>Implement</strong>, then <strong>verify</strong>.</li>
  <li><strong>Document</strong> what actually happened.</li>
</ol>

<h2>Agreements you'll be asked about</h2>
<table>
  <tr><th>Acronym</th><th>Meaning</th></tr>
  <tr><td><strong>SLA</strong></td><td>Service Level Agreement — measurable commitments (uptime %, response times) and remedies</td></tr>
  <tr><td><strong>MOU</strong></td><td>Memorandum of Understanding — a non-binding statement of intent</td></tr>
  <tr><td><strong>SOW</strong></td><td>Statement of Work — the specific deliverables of a project</td></tr>
  <tr><td><strong>NDA</strong></td><td>Non-Disclosure Agreement — confidentiality</td></tr>
  <tr><td><strong>AUP</strong></td><td>Acceptable Use Policy — the rules users must follow on company systems</td></tr>
</table>

<h2>Other operational features</h2>
<ul>
  <li><strong>Port mirroring (SPAN)</strong> — copies traffic to a monitoring port for a protocol analyzer. A physical <strong>TAP</strong> does the same passively, without loading the switch.</li>
  <li><strong>Out-of-band management</strong> — a separate path (console server, dedicated port, cellular) to reach devices <em>when the production network is down</em>. Which is precisely when you need it.</li>
  <li><strong>Jump box</strong> — a hardened, monitored host that admins connect through to reach sensitive segments.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>SNMP = device health (v3 for security). Syslog = events (UDP 514, severity 0 is worst). Flow data = top talkers.</li>
  <li>Baseline first, then alert on deviation.</li>
  <li>Change management: assess, approve, schedule, <strong>rollback plan</strong>, implement, verify, document.</li>
  <li>Out-of-band management is your lifeline during an outage.</li>
</ul>`,
  quiz: [
    { text: "Which tool would you use to identify which hosts are consuming the most bandwidth?",
      choices: ["Syslog", "NetFlow", "NTP", "LDAP"], answer: 1,
      expl: "Flow technologies such as NetFlow, sFlow, and IPFIX export records of conversations with byte counts — exactly what 'top talkers' analysis requires." },
    { text: "Which version of SNMP provides authentication and encryption?",
      choices: ["SNMPv1", "SNMPv2c", "SNMPv3", "All versions"], answer: 2,
      expl: "SNMPv3 adds user-based authentication and encryption. v1 and v2c rely on clear-text community strings." },
    { text: "What is the purpose of establishing a performance baseline?",
      choices: [
        "To define what normal looks like so deviations are recognizable",
        "To prevent hardware from failing",
        "To assign IP addresses",
        "To replace the need for documentation"],
      answer: 0,
      expl: "Without a baseline, a metric like '60% CPU' carries no meaning. Baselines let you set thresholds that alert on genuine deviations rather than arbitrary numbers." },
    { text: "Which step of change management is most often skipped and most regretted?",
      choices: [
        "Preparing a rollback (backout) plan",
        "Sending a company-wide email",
        "Rebooting the device first",
        "Buying new hardware"],
      answer: 0,
      expl: "A rollback plan is what turns a failed change from an outage into an inconvenience. Skipping it is the classic cause of extended downtime." },
    { text: "Which document defines guaranteed uptime percentages and response times between a provider and a customer?",
      choices: ["AUP", "SLA", "MOU", "NDA"], answer: 1,
      expl: "An SLA specifies measurable service commitments and the remedies when they are missed. An MOU is non-binding, and an AUP governs user behavior." },
    { text: "Which two are true about out-of-band management? (Select TWO.)",
      choices: [
        "It provides access to devices even when the production network is down",
        "It increases user bandwidth",
        "It commonly uses console servers or dedicated management ports",
        "It encrypts all user traffic",
        "It replaces the need for backups"],
      answer: [0, 2],
      expl: "Out-of-band management uses a separate path — console servers, dedicated ports, or cellular — so administrators can reach devices during an outage." },
    { text: "Which syslog severity level is the most severe?",
      choices: ["0 (Emergency)", "3 (Error)", "6 (Informational)", "7 (Debug)"], answer: 0,
      expl: "Syslog severity runs from 0 (Emergency, most severe) to 7 (Debug, least severe). Lower is worse." },
    { text: "What should you do after replacing a failed switch, before closing the ticket?",
      choices: [
        "Update the asset inventory and network diagrams, and verify full functionality",
        "Immediately begin the next ticket",
        "Reboot every client",
        "Disable monitoring on the new device"],
      answer: 0,
      expl: "Verification and documentation are explicit steps. Inventory and diagrams must reflect reality, or the next technician will be troubleshooting a fiction." }
  ]
},

/* ================= MODULE 14 ================= */
{
  id: "m4_2", title: "Availability, Backups, and Disaster Recovery", minutes: 12, level: "core",
  content: `
<p>Availability is designed, not hoped for. The discipline is simple to state and hard to execute:
find every single point of failure and eliminate it, then prove you can recover when something fails anyway.</p>

<h2>The metrics</h2>
<table>
  <tr><th>Metric</th><th>Question it answers</th></tr>
  <tr><td><strong>RPO</strong> — Recovery Point Objective</td><td>How much <em>data</em> can we afford to lose? (Sets backup frequency.)</td></tr>
  <tr><td><strong>RTO</strong> — Recovery Time Objective</td><td>How fast must we be back up? (Sets recovery design.)</td></tr>
  <tr><td><strong>MTTR</strong> — Mean Time To Repair</td><td>How long does a fix typically take?</td></tr>
  <tr><td><strong>MTBF</strong> — Mean Time Between Failures</td><td>How reliable is this component?</td></tr>
</table>
<div class="keybox"><strong>RPO = data. RTO = time.</strong> An RPO of 1 hour means hourly backups. An RTO of
4 hours means your recovery process must complete within 4 hours. They are independent — and both are
business decisions, not technical ones.</div>

<h2>The nines</h2>
<table>
  <tr><th>Availability</th><th>Downtime per year</th><th>Per month</th></tr>
  <tr><td>99% (two nines)</td><td>~3.65 days</td><td>~7.2 hours</td></tr>
  <tr><td><strong>99.9%</strong> (three nines)</td><td><strong>~8.76 hours</strong></td><td>~43 minutes</td></tr>
  <tr><td>99.99% (four nines)</td><td>~52.6 minutes</td><td>~4.3 minutes</td></tr>
  <tr><td>99.999% (five nines)</td><td>~5.26 minutes</td><td>~26 seconds</td></tr>
</table>
<p>Anchor on <strong>three nines ≈ 8.8 hours/year</strong>; each additional nine divides downtime by ten.</p>

<h2>Recovery sites</h2>
<table>
  <tr><th>Site</th><th>What's there</th><th>Time to operate</th><th>Cost</th></tr>
  <tr><td><strong>Cold</strong></td><td>Space, power, connectivity. That's it.</td><td>Days to weeks</td><td>Low</td></tr>
  <tr><td><strong>Warm</strong></td><td>Hardware installed; data must be restored</td><td>Hours to days</td><td>Medium</td></tr>
  <tr><td><strong>Hot</strong></td><td>Fully equipped, data replicated, ready now</td><td>Minutes</td><td>High</td></tr>
</table>

<h2>Backups</h2>
<table>
  <tr><th>Type</th><th>Copies</th><th>Backup speed</th><th>Restore speed</th></tr>
  <tr><td><strong>Full</strong></td><td>Everything</td><td>Slowest</td><td>Fastest (one set)</td></tr>
  <tr><td><strong>Incremental</strong></td><td>Changes since the last backup <em>of any type</em></td><td>Fastest</td><td>Slowest (full + <em>every</em> increment)</td></tr>
  <tr><td><strong>Differential</strong></td><td>Changes since the last <em>full</em></td><td>Medium (grows daily)</td><td>Fast (full + <em>one</em> differential)</td></tr>
</table>
<p>The <strong>3-2-1 rule</strong>: three copies, on two different media types, with one copy offsite.</p>
<div class="warnbox"><strong>An untested backup is a hypothesis, not a backup.</strong> Restore tests are the
only proof. Backups stored on the same SAN as production fail together with production — which is not a
backup strategy, it's a coincidence.</div>

<h2>Power and environment</h2>
<ul>
  <li><strong>UPS</strong> — battery power that bridges short outages and conditions dirty power. Buys you minutes.</li>
  <li><strong>Generator</strong> — sustains long outages, but takes time to start. The UPS covers that gap.</li>
  <li><strong>PDU</strong> — distributes power within the rack; managed PDUs allow remote power cycling.</li>
  <li><strong>Hot aisle / cold aisle</strong> — arrange racks so intake air and exhaust air never mix.</li>
  <li>Monitor <strong>temperature and humidity</strong>: too dry invites static discharge; too humid invites condensation and corrosion.</li>
</ul>

<h2>Redundancy design</h2>
<p>Ask of every element: "if this dies, what happens?" Then remove the single points of failure:</p>
<ul>
  <li>Redundant <strong>devices</strong> (two core switches, an FHRP for the gateway).</li>
  <li>Redundant, <strong>physically diverse paths</strong> — two fibers in the same conduit die to the same backhoe.</li>
  <li>Redundant <strong>power</strong> (dual supplies on separate circuits) and <strong>ISPs</strong>.</li>
  <li><strong>Load balancing</strong> and clustering for services.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>RPO = acceptable data loss (backup frequency). RTO = acceptable downtime (recovery speed).</li>
  <li>Cold < warm < hot in both readiness and cost.</li>
  <li>Incremental = fast backup, slow restore. Differential = slower backup, fast restore. 3-2-1 rule.</li>
  <li>Test your restores. Untested backups fail exactly when you need them.</li>
</ul>`,
  quiz: [
    { text: "Which metric defines the maximum acceptable amount of data loss, measured in time?",
      choices: ["RTO", "RPO", "MTTR", "MTBF"], answer: 1,
      expl: "RPO (Recovery Point Objective) sets how far back data may be lost and therefore dictates backup frequency. RTO governs how fast service must be restored." },
    { text: "A company must resume operations within minutes of a disaster, with data already replicated and hardware ready. Which site type is required?",
      choices: ["Cold site", "Warm site", "Hot site", "No site is needed"], answer: 2,
      expl: "A hot site is fully equipped with current data and can take over almost immediately. Warm sites need data restoration; cold sites are empty space." },
    { text: "Which backup type copies only the changes since the last FULL backup?",
      choices: ["Incremental", "Differential", "Snapshot", "Synthetic"], answer: 1,
      expl: "Differential backups grow daily but restore quickly: full plus the latest differential. Incrementals copy changes since the last backup of any type." },
    { text: "Approximately how much annual downtime does 99.9% availability permit?",
      choices: ["About 5 minutes", "About 52 minutes", "About 8.8 hours", "About 3.6 days"], answer: 2,
      expl: "Three nines allows roughly 8.76 hours of downtime per year. Each additional nine divides that by ten." },
    { text: "Which two practices best support disaster recovery readiness? (Select TWO.)",
      choices: [
        "Regularly testing restores from backups",
        "Storing all backups on the production SAN",
        "Keeping an offsite or geographically separate copy",
        "Reducing backup frequency to save space",
        "Encrypting backups but never verifying them"],
      answer: [0, 2],
      expl: "Restore testing proves the backup works, and geographic separation protects against site-wide loss. Backups colocated with production are destroyed alongside it." },
    { text: "What is the role of a UPS relative to a generator?",
      choices: [
        "The UPS bridges the gap until the generator starts and stabilizes",
        "The UPS replaces the generator entirely",
        "The generator provides instantaneous power and the UPS is for long outages",
        "They perform identical functions"],
      answer: 0,
      expl: "A UPS provides immediate battery power for short outages and covers the delay while a generator starts up for sustained outages." },
    { text: "Two fiber runs between buildings follow the same conduit. What risk does this introduce?",
      choices: [
        "They are not truly diverse — a single physical incident can sever both",
        "They will interfere with each other electrically",
        "They cannot be aggregated",
        "They will overheat"],
      answer: 0,
      expl: "Redundancy requires physically diverse paths. Two cables in the same conduit share a single point of failure, so one backhoe takes out both." },
    { text: "What does the 3-2-1 backup rule specify?",
      choices: [
        "Three copies, on two different media, with one copy offsite",
        "Three backups per day, two full, one incremental",
        "Three servers, two switches, one router",
        "Back up three times, restore twice, test once"],
      answer: 0,
      expl: "The 3-2-1 rule guards against media failure and site-wide disaster: three copies, two media types, one stored offsite." }
  ]
},

/* ================= MODULE 15 ================= */
{
  id: "m4_3", title: "Security Fundamentals", minutes: 13, level: "core",
  content: `
<p>Network security is not a product you buy. It's a set of principles applied in layers, so that any
single failure doesn't become a breach.</p>

<h2>The CIA triad</h2>
<ul>
  <li><strong>Confidentiality</strong> — only authorized parties can read the data. (Encryption.)</li>
  <li><strong>Integrity</strong> — the data hasn't been altered. (Hashing, digital signatures.)</li>
  <li><strong>Availability</strong> — authorized users can actually get to it. (Redundancy, DDoS protection.)</li>
</ul>
<div class="keybox"><strong>Match the control to the goal:</strong> encryption → confidentiality.
Hashing → integrity. Redundancy → availability. Exam questions often describe a goal and ask for the control.</div>

<h2>AAA</h2>
<ul>
  <li><strong>Authentication</strong> — who are you? (Password, token, biometric.)</li>
  <li><strong>Authorization</strong> — what may you do? (Permissions, role-based access.)</li>
  <li><strong>Accounting</strong> — what did you do? (Logs, audit trails.)</li>
</ul>
<p><strong>RADIUS</strong> is typically used for network access (802.1X, VPN); <strong>TACACS+</strong> for
device administration, with finer-grained command authorization.</p>

<h3>Authentication factors</h3>
<table>
  <tr><th>Category</th><th>Examples</th></tr>
  <tr><td>Something you <strong>know</strong></td><td>Password, PIN</td></tr>
  <tr><td>Something you <strong>have</strong></td><td>Token, smart card, phone app</td></tr>
  <tr><td>Something you <strong>are</strong></td><td>Fingerprint, face, retina</td></tr>
  <tr><td>Somewhere you <strong>are</strong></td><td>Geolocation</td></tr>
</table>
<div class="warnbox"><strong>Multifactor requires different categories.</strong> A password plus a PIN is
still single-factor — both are "something you know." This is a favorite trap.</div>

<h2>The principles</h2>
<ul>
  <li><strong>Least privilege</strong> — grant only the access the role requires. Limits the blast radius of any compromised account.</li>
  <li><strong>Defense in depth</strong> — layer controls so one failure isn't fatal. Firewall <em>and</em> segmentation <em>and</em> endpoint protection <em>and</em> monitoring.</li>
  <li><strong>Separation of duties</strong> — no single person controls an entire sensitive process.</li>
  <li><strong>Zero trust</strong> — no implicit trust based on location. Verify every request explicitly, assume breach, enforce least privilege everywhere.</li>
</ul>

<h2>Segmentation — the highest-leverage control</h2>
<p>A flat network means one infected laptop can reach the database server directly. Segmentation
(VLANs, subnets, firewall zones, microsegmentation) constrains <strong>lateral movement</strong> — the
attacker gets in, but can't go anywhere.</p>
<ul>
  <li><strong>Screened subnet (DMZ)</strong> — internet-facing services isolated from the internal LAN.</li>
  <li><strong>Guest network</strong> — internet-only, segmented, with client isolation.</li>
  <li><strong>Microsegmentation</strong> — policy applied per workload, not per subnet.</li>
</ul>
<div class="exambox"><strong>Exam angle:</strong> "Limit lateral movement" and "contain the breach" both
have the same answer: <strong>segmentation</strong>.</div>

<h2>Hardening a device</h2>
<ol>
  <li>Change default credentials. (The number one real-world compromise.)</li>
  <li>Disable unused ports and services; shut unused switch ports and park them in an unused VLAN.</li>
  <li>Replace insecure protocols: Telnet → SSH, HTTP → HTTPS, SNMPv1/2c → SNMPv3, FTP → SFTP.</li>
  <li>Patch firmware and software on a schedule.</li>
  <li>Enable logging to a central syslog server.</li>
  <li>Apply port security and 802.1X where feasible.</li>
</ol>

<h2>NAC — Network Access Control</h2>
<p>NAC checks a device's <strong>posture</strong> before letting it on: is it patched, is antivirus running,
is it a corporate asset? Non-compliant devices are quarantined into a remediation VLAN. It pairs naturally
with 802.1X.</p>

<h2>Cryptography, briefly</h2>
<ul>
  <li><strong>Encryption</strong> → confidentiality. Symmetric (AES — fast, one shared key) vs asymmetric (RSA — public/private key pair, used to exchange the symmetric key).</li>
  <li><strong>Hashing</strong> (SHA-256) → integrity. One-way; matching digests prove nothing was altered.</li>
  <li><strong>Digital signature</strong> → integrity + authenticity + non-repudiation. Hash it, then encrypt the hash with your private key.</li>
  <li><strong>PKI / certificates</strong> → a trusted Certificate Authority vouches for a public key. This is what makes HTTPS trustworthy — and why clicking through certificate warnings is dangerous.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>CIA: encryption/hashing/redundancy. AAA: authentication, authorization, accounting.</li>
  <li>MFA needs factors from <em>different</em> categories.</li>
  <li>Least privilege, defense in depth, zero trust. <strong>Segmentation limits lateral movement.</strong></li>
  <li>Hardening starts with default credentials and disabling insecure protocols.</li>
</ul>`,
  quiz: [
    { text: "Which security control primarily provides integrity?",
      choices: ["Encryption", "Hashing", "Redundancy", "Load balancing"], answer: 1,
      expl: "Hashing produces a digest that changes if the data changes, proving integrity. Encryption provides confidentiality; redundancy supports availability." },
    { text: "A user logs in with a password and a PIN. Is this multifactor authentication?",
      choices: [
        "Yes — two credentials were used",
        "No — both are 'something you know', so it is single-factor",
        "Yes — a PIN is 'something you have'",
        "Only if the PIN is longer than the password"],
      answer: 1,
      expl: "Multifactor requires factors from different categories. A password and a PIN are both knowledge factors, so this remains single-factor authentication." },
    { text: "Which principle grants users only the permissions their role requires?",
      choices: ["Least privilege", "Defense in depth", "Separation of duties", "Zero trust"], answer: 0,
      expl: "Least privilege limits the damage a compromised or misused account can do by restricting access to only what the role needs." },
    { text: "An infected workstation is unable to reach the database server because of firewall zones and VLAN separation. Which control is at work?",
      choices: ["Network segmentation", "NAT", "Port mirroring", "PoE"], answer: 0,
      expl: "Segmentation constrains lateral movement, so a compromise in one zone cannot freely reach others. It is the standard answer for 'contain the breach.'" },
    { text: "Which authentication server is typically used for device administration with granular command authorization?",
      choices: ["RADIUS", "TACACS+", "DHCP", "NTP"], answer: 1,
      expl: "TACACS+ separates authentication, authorization, and accounting and supports per-command authorization, making it well suited for device administration. RADIUS is more commonly used for network access." },
    { text: "Which two are essential first steps when hardening a new network device? (Select TWO.)",
      choices: [
        "Change the default credentials",
        "Enable Telnet for easier access",
        "Disable unused ports and services",
        "Store the admin password in the network diagram",
        "Set SNMP to version 1"],
      answer: [0, 2],
      expl: "Default credentials are the most exploited weakness, and unused ports and services expand the attack surface. Telnet and SNMPv1 send data in clear text and should be disabled." },
    { text: "What does NAC evaluate before permitting a device onto the network?",
      choices: [
        "The device's posture — patch level, antivirus status, and compliance",
        "The device's MAC address only",
        "The user's typing speed",
        "The switch's PoE budget"],
      answer: 0,
      expl: "Network Access Control performs a posture assessment and can quarantine non-compliant devices in a remediation VLAN until they meet policy." },
    { text: "Which cryptographic mechanism provides integrity, authenticity, and non-repudiation together?",
      choices: ["Symmetric encryption", "Hashing alone", "A digital signature", "A shared password"], answer: 2,
      expl: "A digital signature hashes the data and encrypts the hash with the sender's private key, proving the content is unaltered and that only the key holder could have sent it." }
  ]
},

/* ================= MODULE 16 ================= */
{
  id: "m4_4", title: "Attacks and Their Mitigations", minutes: 14, level: "advanced",
  content: `
<p>The exam doesn't just want attack names — it wants the <em>fix</em>. Learn these as pairs.</p>

<h2>Layer 2 attacks (and their exact countermeasures)</h2>
<table>
  <tr><th>Attack</th><th>How it works</th><th>Mitigation</th></tr>
  <tr><td><strong>ARP spoofing / poisoning</strong></td><td>Forged ARP replies map the gateway's IP to the attacker's MAC, putting them on-path (MITM)</td><td><strong>Dynamic ARP Inspection (DAI)</strong>, backed by DHCP snooping</td></tr>
  <tr><td><strong>MAC flooding</strong></td><td>Floods the CAM table with fake MACs until the switch fails open and floods frames everywhere ("switch acts like a hub")</td><td><strong>Port security</strong> — limit MACs per port</td></tr>
  <tr><td><strong>Rogue DHCP server</strong></td><td>Hands out a bogus gateway/DNS, capturing traffic</td><td><strong>DHCP snooping</strong> — only trusted ports may send DHCP offers</td></tr>
  <tr><td><strong>VLAN hopping (double-tagging)</strong></td><td>Two 802.1Q tags; the first switch strips the outer one and forwards into another VLAN</td><td>Change the <strong>native VLAN</strong> to an unused one; disable auto-trunking (DTP)</td></tr>
  <tr><td><strong>STP manipulation</strong></td><td>A rogue switch claims to be root and reroutes traffic through itself</td><td><strong>BPDU Guard</strong> and <strong>Root Guard</strong></td></tr>
</table>
<div class="exambox"><strong>DHCP snooping is the prerequisite for DAI</strong> — snooping builds the
IP-to-MAC binding table that DAI checks ARP replies against. They're tested together constantly.</div>

<h2>Denial of service</h2>
<ul>
  <li><strong>DoS</strong> — one source overwhelms a target. <strong>DDoS</strong> — a botnet of many compromised hosts does it.</li>
  <li><strong>Amplification / reflection</strong> — the attacker sends small spoofed requests to open DNS or NTP servers, which send huge replies to the victim. A small attacker generates enormous traffic.</li>
  <li>Mitigation: upstream scrubbing services, rate limiting, anycast distribution, and — importantly — <em>not running open resolvers</em>.</li>
</ul>

<h2>Wireless attacks</h2>
<ul>
  <li><strong>Evil twin</strong> — a rogue AP broadcasting your SSID to harvest credentials. Mitigation: 802.1X with mutual authentication (the client validates the server's certificate), WIPS, user training.</li>
  <li><strong>Deauthentication attack</strong> — forcibly disconnects clients, often to push them onto the evil twin. Mitigation: 802.11w management frame protection.</li>
  <li><strong>Rogue AP</strong> — an unauthorized AP plugged into your network (sometimes by a well-meaning employee). Mitigation: wireless scanning, NAC, port security.</li>
  <li><strong>War driving</strong> — driving around mapping wireless networks.</li>
</ul>

<h2>Social engineering — the attacks that skip your firewall</h2>
<table>
  <tr><th>Attack</th><th>Vector</th></tr>
  <tr><td><strong>Phishing</strong></td><td>Mass email</td></tr>
  <tr><td><strong>Spear phishing</strong></td><td>Targeted at a specific person, using researched details</td></tr>
  <tr><td><strong>Whaling</strong></td><td>Targets or impersonates executives ("the CEO needs a wire transfer, urgently")</td></tr>
  <tr><td><strong>Vishing / smishing</strong></td><td>Voice call / SMS</td></tr>
  <tr><td><strong>Tailgating / piggybacking</strong></td><td>Following someone through a secure door</td></tr>
  <tr><td><strong>Shoulder surfing</strong></td><td>Watching someone type credentials</td></tr>
  <tr><td><strong>Dumpster diving</strong></td><td>Finding sensitive documents in the trash</td></tr>
</table>
<p>Mitigation is mostly non-technical: <strong>user training</strong>, verification procedures for financial
requests, access control vestibules (mantraps) against tailgating, and shredding policies.</p>

<h2>Other attacks to recognize</h2>
<ul>
  <li><strong>On-path (man-in-the-middle)</strong> — the attacker relays and possibly alters traffic. Mitigation: TLS with <em>proper certificate validation</em>, DAI.</li>
  <li><strong>DNS poisoning</strong> — forged records send users to attacker-controlled sites. The URL is right; the destination is wrong. Mitigation: DNSSEC, trusted resolvers.</li>
  <li><strong>Zero-day</strong> — exploited before a patch exists. You cannot patch your way out; use compensating controls (IPS signatures, segmentation, disabling the affected feature).</li>
  <li><strong>Ransomware</strong> — encrypts data and demands payment. Your real defense is <em>tested, offline backups</em> plus segmentation.</li>
  <li><strong>Insider threat</strong> — a legitimate user abusing access. Mitigation: least privilege, separation of duties, and accounting/audit logs.</li>
</ul>

<h2>Physical controls</h2>
<ul>
  <li><strong>Access control vestibule (mantrap)</strong> — one authenticated person at a time. The specific answer for tailgating.</li>
  <li>Badge readers, cameras with logging, locked racks and wiring closets, asset tags.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>ARP spoofing → <strong>DAI</strong>. MAC flooding → <strong>port security</strong>. Rogue DHCP → <strong>DHCP snooping</strong>. VLAN hopping → <strong>native VLAN change</strong>. Rogue root bridge → <strong>BPDU/Root Guard</strong>.</li>
  <li>"Switch acting like a hub" = MAC flooding. "Correct URL, wrong site" = DNS poisoning.</li>
  <li>Zero-day: compensating controls, not patches.</li>
  <li>Tailgating → access control vestibule. Social engineering → training.</li>
</ul>`,
  quiz: [
    { text: "An attacker sends forged ARP replies so that traffic destined for the gateway flows through their machine. Which mitigation directly addresses this?",
      choices: ["Dynamic ARP Inspection with DHCP snooping", "Port mirroring", "PoE budgeting", "Storm control"], answer: 0,
      expl: "DAI validates ARP replies against the DHCP snooping binding table and drops forged ones, defeating ARP poisoning and the on-path attack it enables." },
    { text: "A switch begins flooding all frames out every port after an attacker overwhelms its CAM table. Which attack is this, and what stops it?",
      choices: [
        "MAC flooding — mitigated by port security",
        "ARP spoofing — mitigated by DAI",
        "VLAN hopping — mitigated by changing the native VLAN",
        "DNS poisoning — mitigated by DNSSEC"],
      answer: 0,
      expl: "MAC flooding exhausts the CAM table so the switch fails open and floods frames, letting the attacker sniff traffic. Port security limits learned MACs per port." },
    { text: "Which feature prevents a rogue DHCP server from handing out addresses on the network?",
      choices: ["DHCP snooping", "PortFast", "LACP", "NAT"], answer: 0,
      expl: "DHCP snooping designates trusted ports toward the legitimate server and drops server-class DHCP messages arriving on untrusted ports." },
    { text: "A rogue access point broadcasts the corporate SSID to trick users into connecting. What is this attack called?",
      choices: ["Evil twin", "War driving", "Bluesnarfing", "Smurf attack"], answer: 0,
      expl: "An evil twin impersonates a legitimate SSID to capture credentials or traffic. 802.1X with certificate validation and WIPS are the main defenses." },
    { text: "An email appears to come from the CEO urgently demanding a wire transfer. Which attack is this?",
      choices: ["Whaling / business email compromise", "Tailgating", "Shoulder surfing", "MAC flooding"], answer: 0,
      expl: "Whaling targets or impersonates executives to authorize high-value fraud. The defense is verification procedures and user training, not technology alone." },
    { text: "A vulnerability is actively exploited before any patch exists. What is the appropriate response?",
      choices: [
        "Apply compensating controls such as IPS signatures, segmentation, or disabling the feature",
        "Wait for the vendor patch and do nothing",
        "Disable all logging",
        "Switch to Telnet for management"],
      answer: 0,
      expl: "A zero-day cannot be patched by definition, so you reduce exposure with compensating controls until a fix is available." },
    { text: "Which two mitigations defend against VLAN hopping via double-tagging? (Select TWO.)",
      choices: [
        "Change the native VLAN to an unused VLAN",
        "Enable PortFast on trunk links",
        "Disable automatic trunk negotiation (DTP)",
        "Increase the PoE budget",
        "Enable SNMPv1"],
      answer: [0, 2],
      expl: "Double-tagging exploits the untagged native VLAN. Moving the native VLAN to an unused ID and disabling auto-trunking removes the opportunity." },
    { text: "Which physical control specifically prevents tailgating into a secure area?",
      choices: ["Access control vestibule (mantrap)", "Faraday cage", "UPS", "Patch panel"], answer: 0,
      expl: "An access control vestibule admits one authenticated person at a time between interlocking doors, making it impossible to follow someone in unnoticed." }
  ]
}
    ],

/* ================= CHECKPOINT 4 (cumulative) ================= */
    checkpoint: {
      id: "cp4", title: "Operations and Security", n: 18,
      questions: [
        { text: "Which protocol collects device health metrics using a manager/agent model with MIBs and OIDs?",
          choices: ["Syslog", "SNMP", "NetFlow", "NTP"], answer: 1,
          expl: "SNMP polls agents for values defined in MIBs and receives traps. Syslog carries event messages; NetFlow reports traffic flows." },
        { text: "RPO defines which of the following?",
          choices: [
            "How much data loss is acceptable, measured in time",
            "How quickly service must be restored",
            "The average time to repair a failure",
            "The uptime percentage in the SLA"],
          answer: 0,
          expl: "Recovery Point Objective sets acceptable data loss and therefore drives backup frequency. RTO governs recovery speed." },
        { text: "Which attack is mitigated by port security limiting the number of MAC addresses per port?",
          choices: ["MAC flooding", "DNS poisoning", "Phishing", "DDoS amplification"], answer: 0,
          expl: "Port security caps learned MAC addresses, preventing an attacker from overflowing the CAM table and forcing the switch to flood frames." },
        { text: "Which two are components of the CIA triad? (Select TWO.)",
          choices: ["Confidentiality", "Compliance", "Integrity", "Configuration", "Certification"], answer: [0, 2],
          expl: "The CIA triad is Confidentiality, Integrity, and Availability — the three goals every security control serves." },
        { text: "A backup strategy stores three copies on two media types with one offsite. What is this called?",
          choices: ["The 3-2-1 rule", "RAID 5", "Differential backup", "Hot site replication"], answer: 0,
          expl: "3-2-1 protects against both media failure and site-wide disaster: three copies, two media types, one offsite." },
        { text: "Which SNMP version should be used when security is required?",
          choices: ["v1", "v2c", "v3", "Any version"], answer: 2,
          expl: "Only SNMPv3 offers authentication and encryption. v1 and v2c send community strings in clear text." },
        { text: "Which security model assumes no implicit trust based on network location and verifies every request?",
          choices: ["Perimeter security", "Zero trust", "Open access", "Defense by obscurity"], answer: 1,
          expl: "Zero trust replaces the trusted-internal-network assumption with continuous verification, least privilege, and an assume-breach posture." },
        { text: "Approximately how much downtime per year does 99.99% availability allow?",
          choices: ["About 5 minutes", "About 53 minutes", "About 8.8 hours", "About 3.6 days"], answer: 1,
          expl: "Four nines permits roughly 52.6 minutes of downtime annually." },
        { text: "Which two are true about a differential backup? (Select TWO.)",
          choices: [
            "It copies all changes since the last full backup",
            "It copies only changes since the last backup of any type",
            "Restoring requires the full backup plus the latest differential",
            "Restoring requires the full backup plus every differential",
            "It is always faster to create than an incremental"],
          answer: [0, 2],
          expl: "Differentials accumulate changes since the last full backup, so a restore needs only the full plus the most recent differential." },
        { text: "Which mitigation defends against a rogue DHCP server?",
          choices: ["DHCP snooping", "Root Guard", "LACP", "QoS marking"], answer: 0,
          expl: "DHCP snooping permits DHCP server messages only from trusted ports, blocking rogue servers on user-facing ports." },
        { text: "A user reports the correct URL leads to a fraudulent site. Which attack is MOST likely?",
          choices: ["DNS poisoning", "MAC flooding", "Tailgating", "Deauthentication"], answer: 0,
          expl: "DNS cache poisoning returns attacker-controlled addresses for legitimate names, so the URL looks right but the destination is not." },
        { text: "Which document defines what employees may and may not do on company systems?",
          choices: ["AUP", "SLA", "MOU", "SOW"], answer: 0,
          expl: "An Acceptable Use Policy sets the rules for user behavior on company resources and is typically acknowledged at onboarding." },
        { text: "Which two controls are physical rather than technical? (Select TWO.)",
          choices: [
            "Badge-controlled door locks",
            "Firewall ACLs",
            "Security cameras with access logging",
            "SNMPv3",
            "Router encryption"],
          answer: [0, 2],
          expl: "Locks and cameras are physical controls. ACLs, SNMPv3, and encryption are technical controls — important, but they don't stop someone entering the wiring closet." },
        { text: "Multifactor authentication requires:",
          choices: [
            "Two credentials from different factor categories",
            "Two passwords",
            "A password of at least 16 characters",
            "Biometrics only"],
          answer: 0,
          expl: "MFA combines categories — for example something you know plus something you have. Two knowledge factors remain single-factor." },
        { text: "Which prefix would you use for a point-to-point router link?",
          choices: ["/24", "/28", "/30", "/32"], answer: 2,
          expl: "A /30 provides exactly two usable addresses, one per router, with no waste." },
        { text: "Which feature copies traffic from one switch port to another for capture and analysis?",
          choices: ["Port mirroring (SPAN)", "Port security", "PoE", "Trunking"], answer: 0,
          expl: "SPAN duplicates traffic to a monitor port so a protocol analyzer can capture it. A physical TAP performs the same job passively." },
        { text: "Which two mitigations address ARP spoofing / on-path attacks? (Select TWO.)",
          choices: [
            "Dynamic ARP Inspection",
            "Disabling logging",
            "TLS with proper certificate validation",
            "Using hubs instead of switches",
            "Accepting self-signed certificates"],
          answer: [0, 2],
          expl: "DAI blocks forged ARP replies, and TLS with certificate validation ensures the endpoint is authentic. Blindly accepting self-signed certificates enables the attack." },
        { text: "Which principle layers multiple independent controls so that one failure is not fatal?",
          choices: ["Defense in depth", "Least privilege", "Separation of duties", "Single sign-on"], answer: 0,
          expl: "Defense in depth stacks controls — firewall, segmentation, endpoint protection, monitoring — so that no single failure results in a breach." },
        { text: "Which type of site has hardware installed but requires data to be restored before operations resume?",
          choices: ["Cold site", "Warm site", "Hot site", "Mobile site"], answer: 1,
          expl: "A warm site has equipment ready but needs current data restored, placing it between a cold site (empty) and a hot site (ready now)." },
        { text: "Which two are true about baselines? (Select TWO.)",
          choices: [
            "They record normal performance so deviations can be detected",
            "They prevent hardware failures",
            "They should inform where alert thresholds are set",
            "They replace the need for monitoring tools",
            "They are only useful for wireless networks"],
          answer: [0, 2],
          expl: "A baseline defines normal, and thresholds derived from it fire on genuine deviation instead of arbitrary numbers — which is what keeps alerts trustworthy." }
      ]
    }
  });
})();
