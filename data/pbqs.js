/* Performance-Based Questions - scored per item (partial credit). */
(function () {
  const B = window.NETBANK = window.NETBANK || {};
  B.pbqs = B.pbqs || [];

  const PORTS = ["20/21", "22", "23", "25", "53", "67/68", "69", "80", "110", "123", "143", "161", "389", "443", "445", "514", "636", "3389"];
  const STEPS = [
    "Identify the problem",
    "Establish a theory of probable cause",
    "Test the theory to determine the cause",
    "Establish a plan of action",
    "Implement the solution or escalate",
    "Verify full system functionality",
    "Document findings, actions, and outcomes"
  ];

  B.pbqs.push(
    /* ---------- PBQ 1: ports & protocols matching ---------- */
    { id: "pbq_ports", domain: 1, diff: "medium",
      title: "PBQ: Match each protocol to its default port",
      note: "A firewall administrator must open the correct ports. Select the default port for each protocol.",
      stem: "<p>The security team is building the firewall rule base below. For each protocol, choose the default port number it uses.</p>",
      items: [
        { kind: "select", label: "<b>SSH</b> (secure remote CLI)", options: PORTS, answer: 1 },
        { kind: "select", label: "<b>DNS</b> (name resolution)", options: PORTS, answer: 4 },
        { kind: "select", label: "<b>HTTPS</b> (secure web)", options: PORTS, answer: 13 },
        { kind: "select", label: "<b>RDP</b> (Remote Desktop)", options: PORTS, answer: 17 },
        { kind: "select", label: "<b>SMTP</b> (mail transfer)", options: PORTS, answer: 3 },
        { kind: "select", label: "<b>Syslog</b> (centralized logging)", options: PORTS, answer: 15 }
      ],
      expl: "SSH 22, DNS 53, HTTPS 443, RDP 3389, SMTP 25, Syslog 514. These are among the most frequently tested ports on the exam, and the ones you will open and close constantly in practice.",
      tip: "Build the ports table into memory early; several MC questions plus most port PBQs are free points once you have it." },

    /* ---------- PBQ 2: troubleshooting methodology ordering ---------- */
    { id: "pbq_methodology", domain: 5, diff: "easy",
      title: "PBQ: Place the troubleshooting steps in the correct order",
      note: "Select the correct step for each position in the CompTIA troubleshooting methodology.",
      stem: "<p>A help desk is being trained on the standard troubleshooting methodology. Place each step in its correct sequence.</p>",
      items: [
        { kind: "select", label: "<b>Step 1</b>", options: STEPS, answer: 0 },
        { kind: "select", label: "<b>Step 2</b>", options: STEPS, answer: 1 },
        { kind: "select", label: "<b>Step 3</b>", options: STEPS, answer: 2 },
        { kind: "select", label: "<b>Step 4</b>", options: STEPS, answer: 3 },
        { kind: "select", label: "<b>Step 5</b>", options: STEPS, answer: 4 },
        { kind: "select", label: "<b>Step 6</b>", options: STEPS, answer: 5 },
        { kind: "select", label: "<b>Step 7</b>", options: STEPS, answer: 6 }
      ],
      expl: "Identify → theorize → test the theory → plan of action → implement or escalate → verify full functionality (and prevent recurrence) → document. If a test disproves your theory, you return to step 2 rather than pressing forward.",
      tip: "This exact sequence is nearly guaranteed to appear in some form. Memorize it verbatim." },

    /* ---------- PBQ 3: subnetting worksheet ---------- */
    { id: "pbq_subnet", domain: 1, diff: "hard",
      title: "PBQ: Complete the subnet worksheet",
      note: "Type each answer exactly (for example: 255.255.255.192 or 10.1.1.63).",
      stem: `<p>A branch office is assigned the subnet <b>192.168.20.64/26</b>. A workstation on this subnet is configured with the address <b>192.168.20.75</b>.</p>
             <p>Complete the addressing details below.</p>`,
      items: [
        { kind: "fill", label: "Subnet mask in dotted-decimal", answer: ["255.255.255.192"], placeholder: "x.x.x.x" },
        { kind: "fill", label: "Network (subnet) address", answer: ["192.168.20.64"], placeholder: "x.x.x.x" },
        { kind: "fill", label: "Broadcast address", answer: ["192.168.20.127"], placeholder: "x.x.x.x" },
        { kind: "fill", label: "First usable host address", answer: ["192.168.20.65"], placeholder: "x.x.x.x" },
        { kind: "fill", label: "Last usable host address", answer: ["192.168.20.126"], placeholder: "x.x.x.x" },
        { kind: "fill", label: "Number of usable host addresses", answer: ["62"], placeholder: "number" }
      ],
      expl: "/26 = 255.255.255.192, a block size of 64. The blocks are .0, .64, .128, .192, so .75 lives in the .64 block: network 192.168.20.64, broadcast 192.168.20.127, usable range .65–.126, giving 2⁶ − 2 = 62 hosts.",
      tip: "Block size = 256 − mask octet. Find the block containing the host, and everything else follows mechanically." },

    /* ---------- PBQ 4: command output analysis ---------- */
    { id: "pbq_cmdoutput", domain: 5, diff: "medium",
      title: "PBQ: Diagnose the workstation from command output",
      note: "Review the output, then answer each item.",
      stem: `<p>A user reports being unable to reach any website. You run the following commands on their workstation:</p>
        <div class="terminal">C:\\> ipconfig
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 169.254.88.14
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :

C:\\> ping 192.168.1.1
Destination host unreachable.</div>
        <p>Other users on the same floor are working normally.</p>`,
      items: [
        { kind: "select", label: "What kind of address has the workstation assigned itself?",
          options: ["A public IPv4 address", "An APIPA (link-local) address", "A loopback address", "A multicast address"], answer: 1 },
        { kind: "select", label: "What does this indicate about DHCP?",
          options: ["The client received a valid lease", "The client could not reach a DHCP server", "The DHCP server assigned a static address", "DHCP is not required on this network"], answer: 1 },
        { kind: "select", label: "Since other users on the floor work fine, what is the MOST likely cause?",
          options: ["The DHCP server is completely offline", "A problem local to this port/host, bad cable, wrong VLAN, or NIC issue", "The internet circuit is down", "DNS is misconfigured network-wide"], answer: 1 },
        { kind: "select", label: "Which command would you run FIRST after fixing the physical/VLAN issue?",
          options: ["ipconfig /renew", "route delete", "netstat -an", "arp -d"], answer: 0 }
      ],
      expl: "169.254.x.x is APIPA: the client self-assigned because no DHCP server answered. Because peers on the same floor work, shared infrastructure (the DHCP server, the circuit) is exonerated; the fault is local to this port or host: a bad cable, a port on the wrong VLAN, or a NIC problem. After correcting it, ipconfig /renew requests a proper lease.",
      tip: "Comparing a broken host against a working peer on the same segment is the fastest way to localize a fault." },

    /* ---------- PBQ 5: topology / device selection ---------- */
    { id: "pbq_topology", domain: 2, diff: "medium",
      title: "PBQ: Select the correct device for each position",
      note: "Choose the appropriate device or medium for each labeled position in the topology.",
      stem: `<p>A small office is being built out as shown. Select the correct component for each labeled position.</p>
        <div class="figure">
        <svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg">
          <rect x="16" y="80" width="96" height="46" fill="#fff" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="64" y="100" font-size="12" text-anchor="middle" fill="#16181c">Internet</text>
          <text x="64" y="116" font-size="11" text-anchor="middle" fill="#5b6572">(ISP)</text>
          <line x1="112" y1="103" x2="176" y2="103" stroke="#333" stroke-width="1.5"/>
          <rect x="176" y="80" width="96" height="46" fill="#eef1f5" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="224" y="107" font-size="13" text-anchor="middle" font-weight="bold" fill="#16181c">A</text>
          <line x1="272" y1="103" x2="336" y2="103" stroke="#333" stroke-width="1.5"/>
          <rect x="336" y="80" width="96" height="46" fill="#eef1f5" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="384" y="107" font-size="13" text-anchor="middle" font-weight="bold" fill="#16181c">B</text>
          <line x1="432" y1="103" x2="496" y2="103" stroke="#333" stroke-width="1.5"/>
          <rect x="496" y="80" width="120" height="46" fill="#eef1f5" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="556" y="107" font-size="13" text-anchor="middle" font-weight="bold" fill="#16181c">C</text>
          <line x1="384" y1="126" x2="384" y2="166" stroke="#333" stroke-width="1.5"/>
          <rect x="320" y="166" width="128" height="34" fill="#fff" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="384" y="188" font-size="11.5" text-anchor="middle" fill="#16181c">Public web server</text>
          <line x1="556" y1="126" x2="556" y2="166" stroke="#333" stroke-width="1.5"/>
          <rect x="492" y="166" width="128" height="34" fill="#fff" stroke="#333" stroke-width="1.5" rx="4"/>
          <text x="556" y="188" font-size="11.5" text-anchor="middle" fill="#16181c">Employee PCs</text>
        </svg>
        </div>
        <p>Position <b>B</b> connects the public web server; position <b>C</b> connects employee workstations.</p>`,
      items: [
        { kind: "select", label: "Position <b>A</b>: connects the office to the ISP and routes between networks",
          options: ["Router", "Unmanaged hub", "Media converter", "Repeater"], answer: 0 },
        { kind: "select", label: "Position <b>B</b>: filters traffic and isolates the public server in a screened subnet",
          options: ["Firewall (with DMZ/screened subnet)", "Layer 2 hub", "Patch panel", "Load balancer"], answer: 0 },
        { kind: "select", label: "Position <b>C</b>: connects employee PCs and forwards frames by MAC address",
          options: ["Switch", "Router", "Modem", "Bridge tap"], answer: 0 },
        { kind: "select", label: "The public web server should be placed in which zone?",
          options: ["The internal LAN with the PCs", "A screened subnet (DMZ)", "The ISP's network", "A guest wireless VLAN"], answer: 1 }
      ],
      expl: "The edge router connects to the ISP and routes between networks. The firewall enforces policy and hosts the screened subnet (DMZ) where the internet-facing web server belongs, so a compromise of that server does not directly expose the internal LAN. The switch serves the employee access layer, forwarding by MAC address.",
      tip: "Any internet-reachable service belongs in a DMZ, never on the internal user VLAN." },

    /* ---------- PBQ 6: wireless configuration ---------- */
    { id: "pbq_wireless", domain: 2, diff: "medium",
      title: "PBQ: Configure the wireless network securely",
      note: "Choose the best setting for each configuration field.",
      stem: `<p>You are deploying wireless for a 60-employee company with a RADIUS server already in place. Three APs will cover the office on the 2.4 GHz band, and a separate network is needed for visitors.</p>`,
      items: [
        { kind: "select", label: "Corporate SSID, security mode",
          options: ["WEP 128-bit", "WPA2-Personal (PSK)", "WPA3-Enterprise with 802.1X", "Open with MAC filtering"], answer: 2 },
        { kind: "select", label: "Channel plan for the three 2.4 GHz APs",
          options: ["1, 6, 11", "1, 2, 3", "6, 7, 8", "All APs on channel 6"], answer: 0 },
        { kind: "select", label: "Guest network configuration",
          options: ["Same VLAN as corporate, shared PSK", "Separate VLAN, internet-only access, client isolation", "Open with no segmentation", "Bridged directly to the server VLAN"], answer: 1 },
        { kind: "select", label: "Authentication back end for the corporate SSID",
          options: ["RADIUS server", "The AP's local user list", "A shared spreadsheet of passwords", "No authentication"], answer: 0 },
        { kind: "select", label: "Two APs must cover a large open floor. What causes performance loss if both use the same channel?",
          options: ["Co-channel interference", "Duplex mismatch", "CRC errors", "APIPA addressing"], answer: 0 }
      ],
      expl: "WPA3-Enterprise with 802.1X against RADIUS gives each user unique credentials: the strongest option available here. In 2.4 GHz only channels 1, 6, and 11 are non-overlapping, so three APs should use those. Guests belong on a segmented, internet-only VLAN with client isolation. Two APs sharing a channel with overlapping coverage contend for airtime, which is co-channel interference.",
      tip: "Enterprise (802.1X + RADIUS) beats Personal (PSK) whenever a RADIUS server exists: the exam rewards this every time." },

    /* ---------- PBQ 7: firewall ACL ordering ---------- */
    { id: "pbq_acl", domain: 4, diff: "hard",
      title: "PBQ: Build the firewall rule base in the correct order",
      note: "Rules are evaluated top-down, first match wins, with an implicit deny at the end.",
      stem: `<p>Requirements for the perimeter firewall:</p>
        <ul>
          <li>The public web server (203.0.113.10) must be reachable from the internet on HTTPS only.</li>
          <li>The contractor subnet (10.10.99.0/24) must be blocked from the finance server (10.10.5.20) entirely.</li>
          <li>All other internal users may reach the finance server.</li>
          <li>Everything not explicitly permitted must be denied.</li>
        </ul>
        <p>Assign the correct rule to each position.</p>`,
      items: [
        { kind: "select", label: "<b>Rule 1</b> (evaluated first)",
          options: [
            "PERMIT any → 203.0.113.10 tcp/443",
            "DENY 10.10.99.0/24 → 10.10.5.20 any",
            "PERMIT 10.0.0.0/8 → 10.10.5.20 any",
            "DENY any → any"],
          answer: 1 },
        { kind: "select", label: "<b>Rule 2</b>",
          options: [
            "DENY any → any",
            "PERMIT 10.0.0.0/8 → 10.10.5.20 any",
            "DENY 10.10.99.0/24 → 10.10.5.20 any",
            "PERMIT any → any"],
          answer: 1 },
        { kind: "select", label: "<b>Rule 3</b>",
          options: [
            "PERMIT any → 203.0.113.10 tcp/443",
            "PERMIT any → any",
            "DENY 10.10.99.0/24 → any",
            "PERMIT any → 203.0.113.10 tcp/80"],
          answer: 0 },
        { kind: "select", label: "<b>Rule 4</b> (last)",
          options: [
            "PERMIT any → any",
            "DENY any → any (explicit deny-all)",
            "PERMIT 10.10.99.0/24 → any",
            "DENY 203.0.113.10 → any"],
          answer: 1 },
        { kind: "select", label: "What happens if the contractor DENY rule is placed BELOW the internal PERMIT rule?",
          options: [
            "Nothing changes: order is irrelevant",
            "Contractors would be permitted, because the broader PERMIT matches first and stops evaluation",
            "Both rules would apply simultaneously",
            "The firewall would reject the configuration"],
          answer: 1 }
      ],
      expl: "ACLs are evaluated top-down and stop at the first match, so specific denies must precede broader permits. Blocking contractors first, then permitting internal users to finance, then permitting inbound HTTPS to the web server, and finally an explicit deny-all satisfies every requirement. If the contractor deny sat below the 10.0.0.0/8 permit, contractors (who are inside 10.0.0.0/8) would match the permit first and gain access. The rule would never be reached.",
      tip: "Rule order questions are pure logic: specific before general, and remember the implicit deny at the bottom." },

    /* ---------- PBQ 8: cable and media selection ---------- */
    { id: "pbq_cabling", domain: 2, diff: "medium",
      title: "PBQ: Choose the correct cable or media for each run",
      note: "Select the most appropriate and cost-effective media that meets each requirement.",
      stem: `<p>A campus network requires the runs below. Choose the most appropriate media for each: meeting the requirement without over-engineering.</p>`,
      items: [
        { kind: "select", label: "10 Gbps between two switches in the same rack, 3 m apart",
          options: ["Cat 6a patch cable (or DAC)", "Single-mode fiber with long-haul optics", "Cat 3 cable", "Coaxial cable"], answer: 0 },
        { kind: "select", label: "10 Gbps from the MDF to an IDF 90 m away, over copper",
          options: ["Cat 5e", "Cat 6a", "Cat 3", "RJ11 phone cable"], answer: 1 },
        { kind: "select", label: "1 Gbps link between two buildings 2 km apart",
          options: ["Single-mode fiber", "Cat 6a copper", "Multimode fiber with 850 nm optics only", "Cat 5e copper"], answer: 0 },
        { kind: "select", label: "Connector for an SFP+ transceiver on a fiber uplink",
          options: ["LC", "RJ45", "BNC", "RJ11"], answer: 0 },
        { kind: "select", label: "Connecting a laptop to a switch's console port for CLI access",
          options: ["Rollover (console) cable", "Crossover cable", "Fiber patch cable", "Coaxial cable"], answer: 0 }
      ],
      expl: "Short in-rack 10G runs use Cat 6a or a DAC. Copper 10G at 90 m requires Cat 6a (Cat 6 only reaches ~55 m). A 2 km inter-building run exceeds both copper and typical multimode distances, so single-mode fiber is the answer. SFP/SFP+ optics use LC connectors, and switch console ports use a rollover cable.",
      tip: "Let distance and speed drive the media choice; over-specifying single-mode for a 3 m run wastes money, the exam tests judgment, not just maximums." }
  );
})();
