/* Network+ Study Course - Unit 3: Implementation */
(function () {
  const C = window.NETCOURSE = window.NETCOURSE || { units: [] };

  C.units.push({
    id: "u3",
    title: "Unit 3: Building the Network",
    blurb: "Switching, routing, wireless, and the appliances and cloud services that sit on top. This is the hands-on core of the job.",
    modules: [

/* ================= MODULE 9 ================= */
{
  id: "m3_1", title: "Switching, VLANs, and Spanning Tree", minutes: 16, level: "core",
  content: `
<p>A switch has one job: get a frame to the right port and nowhere else. Everything else (VLANs,
trunking, STP) exists to make that job work at scale and survive redundancy.</p>

<h2>How a switch learns</h2>
<ol>
  <li>A frame arrives on port 3 with source MAC <code>AA:AA</code>. The switch writes "AA:AA is on port 3" into its <strong>MAC address table</strong> (CAM table).</li>
  <li>It looks up the <em>destination</em> MAC. If it's in the table, it forwards out that one port.</li>
  <li>If the destination is unknown, it <strong>floods</strong> the frame out every port except the one it arrived on, and learns from the reply.</li>
  <li>Broadcasts are always flooded to every port in the VLAN.</li>
</ol>
<div class="keybox"><strong>Switches learn from source addresses and forward using destination
addresses.</strong> That one sentence explains flooding, MAC flooding attacks, and MAC address table
"flapping" all at once.</div>

<h2>VLANs, one switch, many networks</h2>
<p>By default every port on a switch is in one broadcast domain. A <strong>VLAN</strong> logically splits
the switch so ports in VLAN 10 cannot talk to ports in VLAN 20 without a router. Benefits:</p>
<ul>
  <li><strong>Segmentation</strong>: smaller broadcast domains, less wasted CPU on every host.</li>
  <li><strong>Security</strong>: HR traffic is separated from Guest traffic at Layer 2.</li>
  <li><strong>Flexibility</strong>: group users logically (by department) regardless of where they physically sit.</li>
</ul>
<p><strong>One VLAN = one broadcast domain = (normally) one IP subnet.</strong></p>

<h3>Access ports vs trunk ports</h3>
<table>
  <tr><th></th><th>Access port</th><th>Trunk port</th></tr>
  <tr><td>Carries</td><td>Exactly one VLAN</td><td>Many VLANs</td></tr>
  <tr><td>Tagging</td><td>Untagged frames</td><td><strong>802.1Q</strong> tags identify each VLAN</td></tr>
  <tr><td>Connects to</td><td>PCs, printers, APs</td><td>Other switches, routers, hypervisors</td></tr>
</table>
<p>The <strong>native VLAN</strong> on a trunk is sent <em>untagged</em>. Leave it as VLAN 1 with user
traffic on it and you invite a double-tagging VLAN-hopping attack, so change it to an unused VLAN.</p>

<h3>Getting between VLANs</h3>
<ul>
  <li><strong>Router-on-a-stick</strong>, one physical router link carrying a trunk, with a
      <strong>subinterface</strong> per VLAN. Cheap; the single link can bottleneck.</li>
  <li><strong>Layer 3 switch (SVI)</strong>: the switch itself routes between VLANs at hardware speed.
      This is what modern networks do.</li>
</ul>

<h2>Spanning Tree Protocol: why redundancy doesn't kill you</h2>
<p>Redundant switch links are essential. They are also lethal, because Layer 2 frames have <strong>no
TTL</strong>. A broadcast entering a loop circulates forever, multiplying at every switch: a
<strong>broadcast storm</strong> that saturates links and pins CPUs within seconds.</p>
<p>STP (802.1D, and its faster successor RSTP 802.1w) solves this by building a loop-free tree:</p>
<ol>
  <li>Switches elect a <strong>root bridge</strong>: the one with the lowest bridge ID (priority, then MAC address).</li>
  <li>Every other switch finds its single best path to the root.</li>
  <li>Redundant links are put into <strong>blocking</strong> state: physically connected, logically off.</li>
  <li>If the active path fails, a blocked port transitions to forwarding, restoring connectivity automatically.</li>
</ol>
<div class="warnbox"><strong>Set the root bridge deliberately.</strong> If you don't set priorities, STP
elects by lowest MAC address, which is usually the <em>oldest</em>, slowest switch in the building.
Lower the priority on your core switch so the tree is built where you want it.</div>

<h3>Port features you must know</h3>
<ul>
  <li><strong>PortFast (edge port)</strong>: skips the listening/learning delay on access ports so PCs get DHCP immediately. Only ever on ports facing end devices.</li>
  <li><strong>BPDU Guard</strong>: shuts a PortFast port down if it receives a BPDU (meaning someone plugged in a switch). PortFast + BPDU Guard is the standard pairing.</li>
  <li><strong>Root Guard</strong>: prevents a downstream switch from becoming root.</li>
  <li><strong>Port security</strong>: limits how many MAC addresses a port may learn; violation can shut the port.</li>
</ul>

<h2>Link aggregation (LACP)</h2>
<p><strong>802.3ad / LACP</strong> bundles multiple physical links into one logical link: more bandwidth
and automatic failover if one member dies. STP treats the bundle as a single link, so it doesn't block
half of it. Also called EtherChannel, port channel, or a LAG.</p>

<h2>Power over Ethernet</h2>
<table>
  <tr><th>Standard</th><th>Name</th><th>Power at device</th></tr>
  <tr><td>802.3af</td><td>PoE</td><td>~12.95 W</td></tr>
  <tr><td>802.3at</td><td>PoE+</td><td>~25.5 W</td></tr>
  <tr><td>802.3bt</td><td>PoE++</td><td>~51–71 W</td></tr>
</table>
<p>Watch the switch's total <strong>power budget</strong>: a fully populated switch of cameras and APs can
exhaust it, and devices then fail to boot or cycle repeatedly.</p>

<h2>What you must remember</h2>
<ul>
  <li>Switches learn source MACs, forward on destination MACs, flood the unknown.</li>
  <li>Access port = one VLAN, untagged. Trunk = many VLANs, 802.1Q tagged. Native VLAN is untagged: change it.</li>
  <li>Layer 2 has no TTL, so loops are fatal. That's why STP exists. Set the root bridge manually.</li>
  <li>PortFast + BPDU Guard on access ports. LACP bundles links.</li>
</ul>`,
  quiz: [
    { text: "A switch receives a frame with a destination MAC address that is not in its MAC address table. What does it do?",
      choices: [
        "Drops the frame",
        "Floods it out all ports except the one it arrived on",
        "Sends it to the default gateway",
        "Returns it to the sender"],
      answer: 1,
      expl: "Unknown unicast frames are flooded out every port in the VLAN except the ingress port. The switch learns the correct port when a reply comes back." },
    { text: "Which protocol tags frames on a trunk link to identify which VLAN they belong to?",
      choices: ["802.1X", "802.1Q", "802.3ad", "802.11ac"], answer: 1,
      expl: "802.1Q inserts a 4-byte tag containing a 12-bit VLAN ID and priority bits. 802.1X is port authentication and 802.3ad is link aggregation." },
    { text: "Why is a Layer 2 switching loop so destructive?",
      choices: [
        "Ethernet frames have no TTL, so broadcasts circulate and multiply endlessly",
        "It causes IP address conflicts",
        "It disables the DHCP server",
        "It corrupts the routing table"],
      answer: 0,
      expl: "Unlike IP packets, Ethernet frames carry no TTL to expire them. A loop lets broadcasts circulate forever, multiplying at each switch and producing a broadcast storm." },
    { text: "Which feature should be enabled on access ports connected to PCs so they don't wait through STP's listening and learning states?",
      choices: ["PortFast", "Root Guard", "LACP", "Trunking"], answer: 0,
      expl: "PortFast moves an access port straight to forwarding, avoiding the ~30 second delay that otherwise causes DHCP failures on boot. Pair it with BPDU Guard." },
    { text: "How does a switch elect the STP root bridge if no priorities have been configured?",
      choices: [
        "The switch with the lowest MAC address wins",
        "The switch with the highest IP address wins",
        "The newest switch wins",
        "The switch with the most ports wins"],
      answer: 0,
      expl: "With equal priorities, the tiebreaker is the lowest MAC address, often the oldest switch. This is why you should set the priority manually on your core switch." },
    { text: "Which two are true about VLANs? (Select TWO.)",
      choices: [
        "Each VLAN is a separate broadcast domain",
        "VLANs increase the maximum cable length",
        "Traffic between VLANs requires a Layer 3 device",
        "VLANs double the link speed",
        "All VLANs share a single IP subnet"],
      answer: [0, 2],
      expl: "A VLAN bounds a broadcast domain, and crossing between VLANs requires routing. VLANs change neither cable distance nor link speed, and each normally maps to its own subnet." },
    { text: "What does LACP (802.3ad) accomplish?",
      choices: [
        "It bundles multiple physical links into one logical link for bandwidth and redundancy",
        "It prevents switching loops",
        "It authenticates users on a port",
        "It supplies power over the Ethernet cable"],
      answer: 0,
      expl: "LACP negotiates link aggregation, combining links into a single logical bundle with more bandwidth and automatic failover." },
    { text: "A PoE+ access point fails to boot on a fully populated switch. What should you check FIRST?",
      choices: [
        "The switch's total PoE power budget and the port's power class",
        "The DNS server settings",
        "The VLAN description",
        "The syslog severity level"],
      answer: 0,
      expl: "A switch has a finite PoE budget. When it is exhausted, or when a PoE+ device is connected to an 802.3af port, the device may fail to power on or boot-loop." }
  ]
},

/* ================= MODULE 10 ================= */
{
  id: "m3_2", title: "Routing: Getting Between Networks", minutes: 15, level: "core",
  content: `
<p>Switches move frames <em>within</em> a network. Routers move packets <em>between</em> networks: 
and to do that, every router needs to answer one question: "for this destination, which way is out?"</p>

<h2>The routing table</h2>
<p>A router matches each packet's destination against its table using <strong>longest prefix
match</strong>: the most specific route wins.</p>
<div class="worked"><h4>Which route is used for 10.1.5.20?</h4>
<table>
  <tr><th>Route</th><th>Matches?</th></tr>
  <tr><td>0.0.0.0/0 (default)</td><td>Yes: matches everything</td></tr>
  <tr><td>10.0.0.0/8</td><td>Yes</td></tr>
  <tr><td><strong>10.1.5.0/24</strong></td><td>Yes, and it's the most specific ✓</td></tr>
</table>
<p>The <strong>/24</strong> wins because it's the longest (most specific) prefix. The default route,
0.0.0.0/0, is the shortest possible match: the gateway of last resort, used only when nothing else matches.</p></div>

<h2>Static vs dynamic routing</h2>
<table>
  <tr><th></th><th>Static</th><th>Dynamic</th></tr>
  <tr><td>Configured</td><td>By hand</td><td>Learned from neighbors automatically</td></tr>
  <tr><td>Adapts to failure</td><td>No (you fix it manually</td><td>Yes) reconverges around the break</td></tr>
  <tr><td>Overhead</td><td>None</td><td>CPU, memory, bandwidth</td></tr>
  <tr><td>Use for</td><td>Small networks, stub sites, default routes</td><td>Anything with redundancy or scale</td></tr>
</table>

<h3>The dynamic protocols</h3>
<table>
  <tr><th>Protocol</th><th>Type</th><th>Metric</th><th>Scope</th></tr>
  <tr><td><strong>RIP</strong></td><td>Distance vector</td><td>Hop count (max 15)</td><td>Legacy, tiny networks</td></tr>
  <tr><td><strong>OSPF</strong></td><td>Link state</td><td>Cost (from bandwidth)</td><td>Interior: the enterprise standard</td></tr>
  <tr><td><strong>EIGRP</strong></td><td>Advanced distance vector</td><td>Bandwidth + delay</td><td>Interior: Cisco</td></tr>
  <tr><td><strong>BGP</strong></td><td>Path vector</td><td>AS path + policy</td><td><strong>Exterior</strong>, between autonomous systems; runs the internet</td></tr>
</table>
<p><strong>Link-state</strong> protocols (OSPF) flood link-state advertisements so every router builds an
identical topology map, then runs Dijkstra's SPF algorithm to compute best paths. They converge fast.
<strong>Distance-vector</strong> protocols (RIP) just tell neighbors "I can reach X in N hops": routing
by rumor. Slow, and prone to loops.</p>

<h2>Administrative distance vs metric: the distinction that gets tested</h2>
<div class="keybox">
<p><strong>Administrative distance (AD)</strong> compares routes learned from <em>different sources</em>.
Lower wins. It answers: "OSPF and a static route both know this network, whom do I trust?"</p>
<p><strong>Metric</strong> compares routes <em>within the same protocol</em>. It answers: "OSPF knows two
paths to this network, which is better?"</p>
</div>
<table>
  <tr><th>Source</th><th>AD</th></tr>
  <tr><td>Directly connected</td><td>0</td></tr>
  <tr><td>Static route</td><td>1</td></tr>
  <tr><td>eBGP</td><td>20</td></tr>
  <tr><td>OSPF</td><td>110</td></tr>
  <tr><td>RIP</td><td>120</td></tr>
</table>
<p>So a static route (AD 1) always beats OSPF (AD 110) for the same prefix, even if OSPF's path is
genuinely better. That's a common cause of traffic taking a slow, "wrong" path: someone left a static
route in place.</p>

<h2>First Hop Redundancy (FHRP)</h2>
<p>Your PC has exactly one default gateway. If that router dies, everything off-subnet dies with it.
FHRPs (<strong>VRRP</strong> (standard), <strong>HSRP</strong>/<strong>GLBP</strong> (Cisco)) solve this:
two routers share a <em>virtual</em> IP and MAC. Hosts point at the virtual address; if the active router
fails, the standby takes over silently. Hosts never notice.</p>

<h2>NAT recap in the routing context</h2>
<p>NAT lives on the router at the boundary. Traffic leaving your private network gets its source address
rewritten to a public one; replies get rewritten back. <strong>PAT</strong> tracks the many-to-one mapping
by source port. Remember: NAT is about address conservation, <em>not</em> security.</p>

<h2>What you must remember</h2>
<ul>
  <li>Longest prefix match wins. 0.0.0.0/0 is the last resort.</li>
  <li><strong>AD compares protocols; metric compares paths within one protocol.</strong> Static (1) beats OSPF (110).</li>
  <li>OSPF = link state, cost, interior. BGP = path vector, exterior, the internet.</li>
  <li>VRRP/HSRP give hosts a redundant default gateway via a shared virtual IP.</li>
</ul>`,
  quiz: [
    { text: "A router has routes 0.0.0.0/0, 10.0.0.0/8, and 10.1.5.0/24. Which does it use for a packet destined to 10.1.5.20?",
      choices: ["0.0.0.0/0", "10.0.0.0/8", "10.1.5.0/24", "It load-balances across all three"], answer: 2,
      expl: "Longest prefix match: the /24 is the most specific route that matches, so it wins over the /8 and the default route." },
    { text: "A network is learned via both OSPF (AD 110) and a static route (AD 1). Which is installed in the routing table?",
      choices: [
        "The OSPF route, because dynamic routing is more current",
        "The static route, because it has the lower administrative distance",
        "Both, load-balanced",
        "Neither, until the conflict is resolved"],
      answer: 1,
      expl: "Administrative distance decides between different sources, and lower wins. Static (1) beats OSPF (110), even if OSPF's path is objectively better." },
    { text: "Which routing protocol is used between autonomous systems and effectively runs the internet?",
      choices: ["OSPF", "RIP", "EIGRP", "BGP"], answer: 3,
      expl: "BGP is a path-vector exterior gateway protocol that exchanges routes between autonomous systems using AS-path attributes and policy." },
    { text: "What does OSPF use as its metric?",
      choices: ["Hop count", "Cost, derived from bandwidth", "MAC address", "Administrative distance"], answer: 1,
      expl: "OSPF computes cost from interface bandwidth and selects the lowest cumulative cost path. Hop count is RIP's metric." },
    { text: "Which technology gives hosts a redundant default gateway using a shared virtual IP address?",
      choices: ["LACP", "VRRP", "STP", "NAT"], answer: 1,
      expl: "First Hop Redundancy Protocols such as VRRP and HSRP present a virtual IP and MAC shared between routers, so gateway failover is invisible to hosts." },
    { text: "Which two describe link-state routing protocols? (Select TWO.)",
      choices: [
        "Each router builds a full topology map of the area",
        "They advertise entire routing tables to neighbors periodically",
        "They use Dijkstra's shortest path first algorithm",
        "They select paths purely by hop count",
        "They converge more slowly than distance-vector protocols"],
      answer: [0, 2],
      expl: "Link-state protocols flood LSAs so every router builds an identical topology database, then run SPF (Dijkstra). Periodic full-table advertisements and hop-count metrics describe distance-vector protocols." },
    { text: "What is the purpose of the 0.0.0.0/0 route?",
      choices: [
        "It is the default route, used when no more specific route matches",
        "It blocks all traffic",
        "It is the loopback route",
        "It identifies the local subnet"],
      answer: 0,
      expl: "0.0.0.0/0 matches everything but is the least specific route, so it is only used as the gateway of last resort when nothing more specific matches." },
    { text: "Traffic to a branch office is taking a slow backup path even though the primary link is up. What should you check FIRST?",
      choices: [
        "The administrative distance and metric of the competing routes",
        "The switch's PoE budget",
        "The DHCP scope size",
        "The wireless channel plan"],
      answer: 0,
      expl: "Suboptimal routing is a route-selection problem. A misconfigured static route (AD 1) or a bad metric can make the backup path win over the primary." }
  ]
},

/* ================= MODULE 11 ================= */
{
  id: "m3_3", title: "Wireless Networking", minutes: 15, level: "core",
  content: `
<p>Wi-Fi is a <em>shared, half-duplex</em> medium: only one device can transmit on a channel at a time,
and everyone must listen first. Every wireless problem you'll ever troubleshoot traces back to that fact.</p>

<h2>The standards</h2>
<table>
  <tr><th>Standard</th><th>Name</th><th>Band</th><th>Max (theoretical)</th></tr>
  <tr><td>802.11b/g</td><td>-</td><td>2.4 GHz</td><td>11 / 54 Mbps</td></tr>
  <tr><td>802.11a</td><td>-</td><td>5 GHz</td><td>54 Mbps</td></tr>
  <tr><td>802.11n</td><td>Wi-Fi 4</td><td>2.4 + 5 GHz</td><td>600 Mbps (MIMO)</td></tr>
  <tr><td>802.11ac</td><td>Wi-Fi 5</td><td><strong>5 GHz only</strong></td><td>~3.5 Gbps</td></tr>
  <tr><td>802.11ax</td><td>Wi-Fi 6</td><td>2.4 + 5 GHz</td><td>~9.6 Gbps (OFDMA)</td></tr>
  <tr><td>802.11ax</td><td><strong>Wi-Fi 6E</strong></td><td>adds <strong>6 GHz</strong></td><td>Same, more clean spectrum</td></tr>
</table>

<h2>Bands and channels: the heart of wireless design</h2>
<div class="keybox"><strong>2.4 GHz:</strong> travels farther, penetrates walls better, but is crowded
(microwaves, Bluetooth, cordless phones) and has only <strong>three non-overlapping channels: 1, 6,
and 11</strong>. That constraint drives every 2.4 GHz design decision.<br><br>
<strong>5 GHz:</strong> many more non-overlapping channels, much less interference, higher throughput: 
but shorter range and weaker wall penetration. Some channels require <strong>DFS</strong> (Dynamic
Frequency Selection), meaning the AP must vacate the channel if it detects radar.</div>

<h3>Interference: know the two kinds</h3>
<ul>
  <li><strong>Co-channel interference</strong>, two APs on the <em>same</em> channel with overlapping coverage. They don't corrupt each other; they take turns, so everyone's throughput halves. Fix with channel planning.</li>
  <li><strong>Adjacent-channel interference</strong>: APs on <em>partially overlapping</em> channels (e.g. 1 and 3). This genuinely corrupts frames and is worse than co-channel. This is why you use 1, 6, 11 and nothing between.</li>
</ul>
<div class="warnbox"><strong>Counterintuitive but tested:</strong> cranking AP transmit power to "improve
coverage" usually makes things worse. It expands co-channel interference and creates a <em>sticky client</em>
problem: laptops cling to a distant AP they can hear but can't reach at speed. Lower power + more APs is
the professional answer.</div>

<h2>Security: the only ranking you need</h2>
<table>
  <tr><th>Method</th><th>Verdict</th></tr>
  <tr><td>Open / MAC filtering</td><td>No security. MAC addresses are trivially spoofed.</td></tr>
  <tr><td>WEP</td><td><strong>Broken.</strong> Crackable in minutes. Never use.</td></tr>
  <tr><td>WPA (TKIP)</td><td>Deprecated.</td></tr>
  <tr><td>WPA2 (AES/CCMP)</td><td>The long-time standard; still acceptable.</td></tr>
  <tr><td><strong>WPA3 (SAE/GCMP)</strong></td><td>Current best. Resists offline password cracking.</td></tr>
</table>
<p>Each of WPA2/WPA3 comes in two flavors:</p>
<ul>
  <li><strong>Personal (PSK)</strong>, one shared passphrase for everyone. When an employee leaves, you should change it for everyone. Nobody ever does.</li>
  <li><strong>Enterprise (802.1X)</strong>: each user authenticates with their own credentials against a <strong>RADIUS</strong> server. Revoke one person without touching anyone else. <em>If a RADIUS server exists, Enterprise is always the right exam answer.</em></li>
</ul>
<p>802.1X has three roles: <strong>supplicant</strong> (the client) → <strong>authenticator</strong> (the AP or switch) → <strong>authentication server</strong> (RADIUS).</p>

<h2>Deployment concepts</h2>
<ul>
  <li><strong>SSID</strong>: the network name. <strong>BSSID</strong>: the AP radio's MAC address. Hiding the SSID is not security; it's trivially discovered.</li>
  <li><strong>Site survey / heat map</strong>: measure real coverage before and after deployment. Plan for <strong>10–15% cell overlap</strong> so clients can roam without dropping.</li>
  <li><strong>Wireless controller (WLC)</strong>: centrally manages many APs: channel and power assignment, firmware, and configuration.</li>
  <li><strong>Mesh</strong>: APs backhaul wirelessly to each other where cabling is impractical. Each hop costs throughput.</li>
  <li><strong>Captive portal</strong>: the "accept terms / log in" page for guest networks.</li>
</ul>

<h2>Signal metrics</h2>
<ul>
  <li><strong>RSSI</strong>: received signal strength, in dBm. It's negative; <em>closer to zero is stronger</em>. −50 dBm is excellent, −70 dBm is workable, −85 dBm is unusable.</li>
  <li><strong>SNR</strong>: signal-to-noise ratio. This matters more than raw signal: a strong signal in a noisy room still performs terribly.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>2.4 GHz = range, crowded, <strong>only channels 1, 6, 11</strong>. 5 GHz = speed, more channels, shorter range.</li>
  <li>WPA3-Enterprise with 802.1X/RADIUS is the strongest option. WEP is broken; MAC filtering is not security.</li>
  <li>Co-channel = same channel, contention. Adjacent-channel = overlapping channels, corruption.</li>
  <li>More power is usually the wrong fix. More APs at lower power is right.</li>
</ul>`,
  quiz: [
    { text: "Which channels are the only non-overlapping channels in the 2.4 GHz band (in North America)?",
      choices: ["1, 5, 9", "1, 6, 11", "2, 7, 12", "1, 4, 8"], answer: 1,
      expl: "Only channels 1, 6, and 11 are fully non-overlapping in 2.4 GHz. Any other assignment causes adjacent-channel interference." },
    { text: "Which wireless security configuration is strongest for an enterprise with a RADIUS server?",
      choices: ["WPA2-Personal with a long passphrase", "WPA3-Enterprise with 802.1X", "WEP with a 128-bit key", "Open with MAC filtering"], answer: 1,
      expl: "WPA3-Enterprise authenticates each user individually against RADIUS with modern cryptography. PSK schemes share one secret, and WEP and MAC filtering offer no real protection." },
    { text: "Two APs with overlapping coverage are configured on the same channel. Users report slow speeds despite a strong signal. What is happening?",
      choices: ["Co-channel interference", "Adjacent-channel interference", "Attenuation", "A duplex mismatch"], answer: 0,
      expl: "APs on the same channel must contend for airtime, halving effective throughput. The signal is strong but everyone is taking turns." },
    { text: "Which standard is the first to operate in the 6 GHz band?",
      choices: ["802.11ac (Wi-Fi 5)", "Wi-Fi 6 (802.11ax)", "Wi-Fi 6E", "802.11n"], answer: 2,
      expl: "Wi-Fi 6E extends 802.11ax into the 6 GHz band, opening a large amount of clean spectrum. Base Wi-Fi 6 uses only 2.4 and 5 GHz." },
    { text: "In 802.1X, which device acts as the authenticator?",
      choices: ["The client laptop", "The access point or switch", "The RADIUS server", "The DHCP server"], answer: 1,
      expl: "The supplicant is the client, the authenticator is the AP or switch controlling port access, and the authentication server is RADIUS." },
    { text: "Users far from an AP report slow speeds and dropped connections, while nearby users are fine. What is the MOST likely cause?",
      choices: [
        "Low signal strength and poor SNR at the cell edge",
        "DHCP scope exhaustion",
        "An expired DNS record",
        "A duplex mismatch on the AP uplink"],
      answer: 0,
      expl: "Distance-dependent symptoms point to attenuation: as signal drops, clients fall back to lower data rates and eventually disconnect. A site survey and better AP placement is the fix." },
    { text: "Which two statements about increasing AP transmit power are true? (Select TWO.)",
      choices: [
        "It can worsen co-channel interference",
        "It always improves client throughput",
        "It can create sticky-client problems where devices cling to distant APs",
        "It increases the number of available channels",
        "It eliminates the need for a site survey"],
      answer: [0, 2],
      expl: "Higher power expands each cell, increasing co-channel contention and encouraging clients to stay attached to APs they can hear but cannot reach at speed. The professional fix is more APs at lower power." },
    { text: "What does RSSI measure, and how should it be read?",
      choices: [
        "Signal strength in dBm: values closer to zero are stronger",
        "Data rate in Mbps: higher is better",
        "Latency in milliseconds: lower is better",
        "Channel width in MHz"],
      answer: 0,
      expl: "RSSI is expressed in negative dBm. −50 dBm is a very strong signal; −85 dBm is essentially unusable." }
  ]
},

/* ================= MODULE 12 ================= */
{
  id: "m3_4", title: "Network Services, Appliances, and Cloud", minutes: 14, level: "advanced",
  content: `
<p>Beyond switches and routers sits a layer of devices and services that shape, secure, and scale traffic.
The exam expects you to pick the right one for a stated requirement.</p>

<h2>The appliances</h2>
<table>
  <tr><th>Device</th><th>What it does</th><th>Keyword in the question</th></tr>
  <tr><td><strong>Firewall</strong></td><td>Permits/denies traffic by rules; stateful firewalls track connections</td><td>"filter," "block," "allow only"</td></tr>
  <tr><td><strong>NGFW</strong></td><td>Adds application awareness, user identity, IPS, deep packet inspection</td><td>"identify the app, not just the port"</td></tr>
  <tr><td><strong>IDS</strong></td><td><em>Detects</em> and alerts: passive, out of band</td><td>"alert," "monitor"</td></tr>
  <tr><td><strong>IPS</strong></td><td><em>Blocks</em> inline</td><td>"prevent," "drop the traffic"</td></tr>
  <tr><td><strong>Load balancer</strong></td><td>Distributes connections across a server pool; health checks; TLS offload</td><td>"scale," "distribute," "VIP"</td></tr>
  <tr><td><strong>Proxy</strong></td><td>Intermediates requests; can cache, filter, and log</td><td>"content filtering," "caching"</td></tr>
  <tr><td><strong>VPN concentrator</strong></td><td>Terminates encrypted tunnels</td><td>"remote access," "encrypted over the internet"</td></tr>
  <tr><td><strong>Media converter</strong></td><td>Bridges copper ⇄ fiber</td><td>"different media types"</td></tr>
</table>
<div class="exambox"><strong>IDS vs IPS is a guaranteed question.</strong> IDS = <em>Detection</em> = passive,
alerts you. IPS = <em>Prevention</em> = inline, stops it. One letter, completely different behavior.</div>

<h2>VPNs</h2>
<ul>
  <li><strong>Site-to-site</strong>: connects whole networks (branch ↔ HQ) over the internet, typically with IPSec. Users don't know it's there.</li>
  <li><strong>Client-to-site (remote access)</strong>: an individual user's device tunnels in, usually with SSL/TLS or IPSec.</li>
  <li><strong>Split tunneling</strong>, only corporate traffic goes through the tunnel; internet traffic goes direct. Faster, but bypasses corporate inspection.</li>
  <li><strong>Full tunnel</strong>: everything goes through the tunnel. Slower, but everything is inspected and protected.</li>
</ul>
<p>IPSec components: <strong>IKE</strong> negotiates keys, <strong>ESP</strong> encrypts and authenticates the
payload, <strong>AH</strong> provides integrity only (rarely used, since it doesn't encrypt).</p>

<h2>Cloud service models</h2>
<table>
  <tr><th>Model</th><th>You manage</th><th>Example</th></tr>
  <tr><td><strong>IaaS</strong></td><td>OS, runtime, apps, data (provider gives hardware/virtualization)</td><td>A VM in AWS EC2</td></tr>
  <tr><td><strong>PaaS</strong></td><td>Just your app and data</td><td>A managed app platform or database</td></tr>
  <tr><td><strong>SaaS</strong></td><td>Nothing but your data and users</td><td>Microsoft 365, Salesforce</td></tr>
</table>
<p>Deployment models: <strong>public</strong> (shared provider infrastructure), <strong>private</strong>
(dedicated to one organization), <strong>hybrid</strong> (a mix, often with cloud bursting),
<strong>community</strong> (shared by organizations with common requirements).</p>

<h3>Cloud networking pieces</h3>
<ul>
  <li><strong>VPC</strong>: your logically isolated network inside the provider's cloud.</li>
  <li><strong>Internet gateway</strong>: lets VPC resources reach the internet. <strong>NAT gateway</strong>: lets private instances reach out without being reachable.</li>
  <li><strong>Site-to-site VPN or Direct Connect</strong>: private connectivity between your data center and the VPC. <em>"Private connectivity to cloud" is always one of these two.</em></li>
</ul>

<h2>Modern architecture concepts</h2>
<ul>
  <li><strong>SDN</strong>: control plane separated from data plane, centralized in a programmable controller.</li>
  <li><strong>SD-WAN</strong>: a controller steers traffic across MPLS, broadband, and LTE based on policy and real-time link quality. Transport-independent and application-aware.</li>
  <li><strong>VXLAN</strong>: Layer 2 over Layer 3 with ~16 million segments; the data center overlay standard.</li>
  <li><strong>Infrastructure as Code</strong>: device configuration expressed in version-controlled templates and deployed automatically. Consistent, auditable, and it makes a bad change deploy everywhere at once, which is why change control still matters.</li>
  <li><strong>Zero trust</strong>, no implicit trust based on network location; verify every request.</li>
</ul>

<h2>QoS, when the pipe is full, who wins?</h2>
<ul>
  <li><strong>Classification and marking</strong>: tag traffic at the network edge (DSCP). Voice gets <strong>EF</strong> (Expedited Forwarding, DSCP 46).</li>
  <li><strong>Queuing</strong>: priority queues serve voice first.</li>
  <li><strong>Shaping</strong> buffers excess traffic to smooth it; <strong>policing</strong> drops or remarks it.</li>
</ul>
<p>Targets for voice: latency under ~150 ms one-way, jitter under ~30 ms, loss under 1%.</p>

<h2>What you must remember</h2>
<ul>
  <li>IDS detects (passive). IPS prevents (inline).</li>
  <li>Site-to-site connects networks; client-to-site connects one user. Split tunnel is faster but bypasses inspection.</li>
  <li>IaaS → PaaS → SaaS: you manage less at each step.</li>
  <li>Voice is marked DSCP EF. Shaping buffers; policing drops.</li>
</ul>`,
  quiz: [
    { text: "Which device sits inline and actively blocks malicious traffic?",
      choices: ["IDS", "IPS", "SIEM", "Honeypot"], answer: 1,
      expl: "An IPS is inline and can drop or reset malicious traffic. An IDS is passive: it detects and alerts but does not block." },
    { text: "A company needs to distribute web requests across five identical servers, with automatic removal of any server that fails a health check. Which device is required?",
      choices: ["Load balancer", "Proxy server", "Media converter", "IDS"], answer: 0,
      expl: "Load balancers distribute connections across a server pool, monitor health, and commonly offload TLS from the backends." },
    { text: "Which cloud model leaves you responsible for the operating system, runtime, and applications?",
      choices: ["SaaS", "PaaS", "IaaS", "FaaS"], answer: 2,
      expl: "IaaS gives you virtualized hardware; everything above it (OS, runtime, apps) is yours to manage. SaaS delivers a finished application." },
    { text: "A remote employee needs their laptop to behave as though it were on the corporate LAN. Which solution fits?",
      choices: ["Site-to-site VPN", "Client-to-site (remote access) VPN", "A proxy server", "Port mirroring"], answer: 1,
      expl: "Client-to-site VPNs tunnel an individual device into the corporate network. Site-to-site connects entire networks, not single roaming users." },
    { text: "Which DSCP marking is applied to voice traffic for priority queuing?",
      choices: ["Best effort (default)", "EF (Expedited Forwarding)", "AF11", "CS0"], answer: 1,
      expl: "Voice is marked EF (DSCP 46) so queuing gives it low-latency priority treatment on congested links." },
    { text: "Which two describe SD-WAN? (Select TWO.)",
      choices: [
        "A centralized controller applies application-aware policy",
        "It requires MPLS at every site",
        "It can steer traffic across multiple transports based on real-time link quality",
        "It removes the need for encryption on public links",
        "It only supports a single ISP"],
      answer: [0, 2],
      expl: "SD-WAN is transport-independent: a controller applies policy and dynamically steers traffic across MPLS, broadband, or LTE based on link health. Tunnels are still encrypted." },
    { text: "What is the difference between traffic shaping and policing?",
      choices: [
        "Shaping buffers excess traffic to smooth it; policing drops or remarks it",
        "Shaping drops traffic; policing buffers it",
        "They are the same thing",
        "Shaping applies only to wireless"],
      answer: 0,
      expl: "Shaping delays traffic in a buffer to conform to a rate. Policing enforces the rate immediately by dropping or remarking packets that exceed it." },
    { text: "A public-facing web server must be reachable from the internet without exposing the internal LAN. Where should it be placed?",
      choices: ["On the internal user VLAN", "In a screened subnet (DMZ)", "On the guest wireless network", "Directly on the ISP's network"], answer: 1,
      expl: "A DMZ isolates internet-facing services behind firewall rules on both sides, so a compromise of the server does not directly expose internal systems." }
  ]
}
    ],

/* ================= CHECKPOINT 3 (cumulative) ================= */
    checkpoint: {
      id: "cp3", title: "Building the Network", n: 18,
      questions: [
        { text: "Which port type carries multiple VLANs between two switches?",
          choices: ["Access port", "Trunk port", "Console port", "Mirrored port"], answer: 1,
          expl: "Trunk ports carry multiple VLANs, tagging frames with 802.1Q VLAN IDs. Access ports belong to exactly one VLAN." },
        { text: "Why must Spanning Tree Protocol exist on redundant Layer 2 networks?",
          choices: [
            "Ethernet frames have no TTL, so loops cause broadcast storms",
            "IP packets would run out of addresses",
            "Switches cannot learn MAC addresses otherwise",
            "It assigns IP addresses to switches"],
          answer: 0,
          expl: "Without a TTL, a looping frame circulates forever and multiplies at every switch, saturating the network within seconds." },
        { text: "A static route (AD 1) and an OSPF route (AD 110) exist for the same network. Which is used?",
          choices: ["OSPF", "The static route", "Both, load-balanced", "Neither"], answer: 1,
          expl: "The lowest administrative distance wins when routes come from different sources. Static (1) beats OSPF (110)." },
        { text: "Which are the only non-overlapping 2.4 GHz channels?",
          choices: ["1, 6, 11", "1, 2, 3", "5, 10, 15", "All channels are non-overlapping"], answer: 0,
          expl: "Only 1, 6, and 11 avoid overlap in the 2.4 GHz band, which is why every 2.4 GHz design uses them exclusively." },
        { text: "Which two features should be applied together on switch access ports facing PCs? (Select TWO.)",
          choices: ["PortFast", "Trunking", "BPDU Guard", "LACP", "DFS"], answer: [0, 2],
          expl: "PortFast skips STP's listening/learning delay so PCs get DHCP immediately, and BPDU Guard shuts the port if someone plugs in a switch." },
        { text: "Which routing protocol uses cost derived from bandwidth as its metric?",
          choices: ["RIP", "OSPF", "BGP", "ARP"], answer: 1,
          expl: "OSPF is a link-state protocol that computes cost from interface bandwidth and selects the lowest-cost path." },
        { text: "Which appliance distributes incoming connections across a pool of servers and can offload TLS?",
          choices: ["IDS", "Load balancer", "Media converter", "Proxy"], answer: 1,
          expl: "Load balancers spread traffic across healthy backend servers behind a virtual IP and commonly terminate TLS to reduce backend CPU load." },
        { text: "What is the difference between an IDS and an IPS?",
          choices: [
            "IDS detects and alerts; IPS sits inline and blocks",
            "IDS blocks; IPS only alerts",
            "They are identical",
            "IDS works only on wireless networks"],
          answer: 0,
          expl: "Detection versus Prevention: an IDS is passive and alerts, while an IPS is inline and actively drops malicious traffic." },
        { text: "A switch's MAC address table shows the same MAC appearing on multiple ports repeatedly. What does this indicate?",
          choices: [
            "A Layer 2 loop (MAC flapping)",
            "A DNS misconfiguration",
            "An exhausted DHCP scope",
            "A duplex mismatch"],
          answer: 0,
          expl: "MAC flapping (the same address learned on different ports) is the classic signature of a bridging loop, usually with STP disabled or misconfigured." },
        { text: "Which VPN configuration sends only corporate traffic through the tunnel while internet traffic goes direct?",
          choices: ["Full tunnel", "Split tunnel", "Site-to-site", "Clientless"], answer: 1,
          expl: "Split tunneling is faster and reduces load on the concentrator, but internet traffic bypasses corporate inspection and filtering." },
        { text: "Which PoE standard delivers approximately 25.5 W to the powered device?",
          choices: ["802.3af", "802.3at", "802.3bt", "802.11ax"], answer: 1,
          expl: "802.3at (PoE+) supplies about 25.5 W at the device. 802.3af delivers around 13 W and 802.3bt scales to 51–71 W." },
        { text: "Which two are true about link aggregation (LACP)? (Select TWO.)",
          choices: [
            "It combines multiple physical links into one logical link",
            "It prevents Layer 2 loops on its own",
            "It provides failover if one member link fails",
            "It assigns VLANs automatically",
            "It authenticates users"],
          answer: [0, 2],
          expl: "LACP bundles links for greater aggregate bandwidth and automatic failover. Loop prevention is STP's job; authentication is 802.1X." },
        { text: "Which cloud connectivity option provides private connectivity between an on-premises data center and a VPC?",
          choices: ["Internet gateway", "Site-to-site VPN or a direct connection", "NAT gateway", "Public elastic IPs"], answer: 1,
          expl: "A site-to-site VPN or a dedicated direct-connect circuit extends private addressing into the VPC without traversing the public internet." },
        { text: "Which subnet mask corresponds to a /27?",
          choices: ["255.255.255.192", "255.255.255.224", "255.255.255.240", "255.255.255.248"], answer: 1,
          expl: "/27 = 255.255.255.224, giving a block size of 32 and 30 usable hosts." },
        { text: "A host is 10.0.5.200/26. What is its network address?",
          choices: ["10.0.5.128", "10.0.5.192", "10.0.5.64", "10.0.5.0"], answer: 1,
          expl: "/26 has a block size of 64: blocks are 128 and 192. Address .200 falls in the .192 block." },
        { text: "Which technology allows a single router interface to route between multiple VLANs?",
          choices: [
            "Subinterfaces on a trunk (router-on-a-stick)",
            "Port mirroring",
            "Link aggregation",
            "Storm control"],
          answer: 0,
          expl: "Router-on-a-stick divides one physical interface into 802.1Q-tagged subinterfaces, one per VLAN, allowing inter-VLAN routing over a single link." },
        { text: "Which authentication server is used by 802.1X?",
          choices: ["DHCP", "RADIUS", "NTP", "Syslog"], answer: 1,
          expl: "802.1X uses a RADIUS server as the authentication server, with the switch or AP acting as the authenticator." },
        { text: "Which two statements about the native VLAN on a trunk are correct? (Select TWO.)",
          choices: [
            "Its traffic is sent untagged",
            "It must always be VLAN 1",
            "Leaving user traffic on it enables double-tagging attacks",
            "It cannot carry any traffic",
            "It requires 802.1X"],
          answer: [0, 2],
          expl: "Native VLAN traffic is untagged, which is exactly what a double-tagging VLAN-hopping attack exploits. Best practice is to move the native VLAN to an unused ID." },
        { text: "Which protocol provides a virtual IP shared by two routers so hosts keep connectivity if one fails?",
          choices: ["VRRP", "LACP", "STP", "OSPF"], answer: 0,
          expl: "First Hop Redundancy Protocols such as VRRP and HSRP present a shared virtual gateway address, failing over transparently to hosts." },
        { text: "Which is the correct order of the OSI layers from 1 to 4?",
          choices: [
            "Physical, Data Link, Network, Transport",
            "Physical, Network, Data Link, Transport",
            "Data Link, Physical, Transport, Network",
            "Network, Physical, Data Link, Transport"],
          answer: 0,
          expl: "Layer 1 Physical, Layer 2 Data Link, Layer 3 Network, Layer 4 Transport, bits, frames, packets, segments." }
      ]
    }
  });
})();
