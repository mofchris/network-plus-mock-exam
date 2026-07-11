/* Network+ Study Course - Unit 1: Foundations */
(function () {
  const C = window.NETCOURSE = window.NETCOURSE || { units: [] };

  C.units.push({
    id: "u1",
    title: "Unit 1: Foundations",
    blurb: "Start here even if you've never touched a switch. What networks are, how the layered model works, and the physical media everything runs on.",
    modules: [

/* ================= MODULE 1 ================= */
{
  id: "m1_1", title: "What a Network Actually Is", minutes: 12, level: "foundation",
  content: `
<p>A network is just two or more devices that can exchange data. Everything else (the
protocols, the acronyms, the $50,000 switches) exists to solve problems that appear when
you scale that simple idea up.</p>

<h2>The pieces</h2>
<p>Every network is built from four kinds of things:</p>
<ul>
  <li><strong>Hosts (endpoints)</strong>: devices that produce or consume data: PCs, phones, servers, printers, cameras.</li>
  <li><strong>Media</strong>: what carries the signal: copper cable, fiber, or radio waves.</li>
  <li><strong>Intermediary devices</strong>: things that move data between hosts: switches, routers, firewalls, access points.</li>
  <li><strong>Protocols</strong>: the agreed rules for how data is formatted and exchanged. Hardware without agreed rules is just expensive plastic.</li>
</ul>

<h2>Clients, servers, and peers</h2>
<p>In a <strong>client-server</strong> model, a server provides a resource (files, web pages,
authentication) and clients request it. This centralizes control, backup, and security, which
is why every business network looks like this.</p>
<p>In a <strong>peer-to-peer</strong> model, each device is both client and server. It's simple
and cheap for a handful of machines, but it becomes ungovernable fast: no central accounts,
no central backups, no central security.</p>

<h2>Networks by size</h2>
<table>
  <tr><th>Type</th><th>Scope</th><th>Example</th></tr>
  <tr><td><strong>PAN</strong> (Personal Area Network)</td><td>A few meters</td><td>Bluetooth earbuds to a phone</td></tr>
  <tr><td><strong>LAN</strong> (Local Area Network)</td><td>One building or floor</td><td>An office's switches and PCs</td></tr>
  <tr><td><strong>WLAN</strong></td><td>A LAN, but wireless</td><td>The office Wi-Fi</td></tr>
  <tr><td><strong>CAN</strong> (Campus)</td><td>Several nearby buildings you own</td><td>A university campus</td></tr>
  <tr><td><strong>MAN</strong> (Metropolitan)</td><td>A city</td><td>A city government's fiber ring</td></tr>
  <tr><td><strong>WAN</strong> (Wide Area Network)</td><td>Cities, countries</td><td>Branch offices linked to HQ; the internet is the biggest WAN</td></tr>
  <tr><td><strong>SAN</strong> (Storage Area Network)</td><td>A data center</td><td>High-speed block storage for servers</td></tr>
</table>
<div class="keybox"><strong>The distinction that matters:</strong> you own and control a LAN.
You generally <em>rent</em> a WAN link from a service provider. That's why WAN links are slower,
more expensive, and the first thing you suspect when a branch office complains.</div>

<h2>The one idea that unlocks everything: addressing</h2>
<p>If two devices are on the same wire, "sending data" is easy. The moment you have thousands
of devices, you need a way to say <em>who</em> a message is for. Networks solve this with two
different addresses, and confusing them is the single most common beginner mistake:</p>
<table>
  <tr><th></th><th>MAC address</th><th>IP address</th></tr>
  <tr><td>Looks like</td><td><code>00:1A:2B:3C:4D:5E</code></td><td><code>192.168.1.50</code></td></tr>
  <tr><td>Assigned by</td><td>The manufacturer, burned into the NIC</td><td>The network admin or DHCP</td></tr>
  <tr><td>Scope</td><td>Only meaningful on the local segment</td><td>Meaningful across the whole internet</td></tr>
  <tr><td>Analogy</td><td>Your name</td><td>Your street address</td></tr>
  <tr><td>Used by</td><td>Switches</td><td>Routers</td></tr>
</table>
<p>Your name doesn't help a courier in another country; they need your street address. But once
the package reaches your building, the doorman uses your name. Networks work exactly like this:
<strong>IP gets data across networks; MAC delivers it on the final segment.</strong></p>

<h2>Bandwidth, throughput, and latency</h2>
<ul>
  <li><strong>Bandwidth</strong>: the theoretical maximum capacity of a link (1 Gbps).</li>
  <li><strong>Throughput</strong>: what you actually get (often far less, thanks to overhead, errors, and congestion).</li>
  <li><strong>Latency</strong>: the delay for data to make the trip, measured in milliseconds.</li>
  <li><strong>Jitter</strong>: the <em>variation</em> in latency. Steady 80 ms is fine for a call; latency bouncing between 20 ms and 200 ms is not.</li>
</ul>
<div class="exambox"><strong>Exam angle:</strong> a link can be at 15% utilization and still deliver
terrible voice quality, because voice cares about latency and jitter, not raw bandwidth. Expect a
question that tries to make you blame bandwidth when the answer is jitter.</div>

<h2>What you must remember</h2>
<ul>
  <li>Hosts, media, intermediary devices, protocols: that's every network.</li>
  <li>LAN = you own it; WAN = you rent it.</li>
  <li>MAC = local identity (switches). IP = global address (routers).</li>
  <li>Bandwidth ≠ throughput. Latency and jitter matter independently of both.</li>
</ul>`,
  quiz: [
    { text: "Which address is burned into a network interface card by the manufacturer and only has meaning on the local segment?",
      choices: ["The IP address", "The MAC address", "The default gateway", "The subnet mask"], answer: 1,
      expl: "MAC addresses are hardware addresses used by switches on the local segment. IP addresses are logical, assigned by an admin or DHCP, and are routable across networks." },
    { text: "A company rents a circuit from a telecom provider to connect its head office to a branch 200 km away. What is this link best described as?",
      choices: ["A LAN", "A PAN", "A WAN", "A SAN"], answer: 2,
      expl: "A WAN spans large geographic distances and is typically leased from a service provider, unlike a LAN which the organization owns and controls." },
    { text: "Users on a VoIP call report choppy audio, though the WAN link shows only 20% utilization. Which metric should you investigate?",
      choices: ["Total bandwidth", "Jitter and latency", "MAC table size", "Cable category"], answer: 1,
      expl: "Voice quality depends on delay and its variation (jitter), not raw utilization. A lightly loaded link with unstable delay still produces choppy audio." },
    { text: "In a client-server model, what is the main advantage over peer-to-peer?",
      choices: ["It requires no protocols", "Centralized control of security, accounts, and backups", "It eliminates the need for IP addresses", "It is always cheaper for two devices"], answer: 1,
      expl: "Centralization is the point: one place to manage authentication, permissions, and backups. Peer-to-peer is cheap for a few machines but becomes unmanageable at scale." },
    { text: "Which two statements correctly distinguish bandwidth from throughput? (Select TWO.)",
      choices: [
        "Bandwidth is the theoretical maximum capacity of the link",
        "Throughput is always equal to bandwidth",
        "Throughput is the actual data rate achieved in practice",
        "Bandwidth is measured in milliseconds",
        "Throughput cannot be affected by congestion"],
      answer: [0, 2],
      expl: "Bandwidth is capacity; throughput is what you actually achieve after overhead, errors, and congestion. Delay is measured in milliseconds: that's latency, not bandwidth." },
    { text: "Which device uses MAC addresses to make its forwarding decisions?",
      choices: ["Router", "Switch", "Firewall (Layer 3 rules)", "Modem"], answer: 1,
      expl: "Switches forward frames using MAC addresses within a local segment. Routers forward packets between networks using IP addresses." }
  ]
},

/* ================= MODULE 2 ================= */
{
  id: "m1_2", title: "The OSI Model and How Data Really Moves", minutes: 15, level: "foundation",
  content: `
<p>The OSI model is a seven-layer map of how communication works. It is not software you install: 
it's a shared vocabulary. When someone says "that's a Layer 2 problem," they've told you exactly
where to look. CompTIA tests this relentlessly, and more importantly, it is the backbone of
every troubleshooting decision you will ever make.</p>

<h2>The seven layers (top down)</h2>
<table>
  <tr><th>#</th><th>Layer</th><th>Data unit</th><th>What lives here</th></tr>
  <tr><td>7</td><td>Application</td><td>Data</td><td>HTTP, DNS, SMTP, FTP: the protocols apps speak</td></tr>
  <tr><td>6</td><td>Presentation</td><td>Data</td><td>Encryption (TLS), encoding, compression</td></tr>
  <tr><td>5</td><td>Session</td><td>Data</td><td>Setting up, maintaining, tearing down conversations</td></tr>
  <tr><td>4</td><td>Transport</td><td><strong>Segment</strong></td><td>TCP, UDP, <strong>port numbers</strong></td></tr>
  <tr><td>3</td><td>Network</td><td><strong>Packet</strong></td><td>IP addresses, routers, ICMP</td></tr>
  <tr><td>2</td><td>Data Link</td><td><strong>Frame</strong></td><td>MAC addresses, switches, Ethernet, VLANs</td></tr>
  <tr><td>1</td><td>Physical</td><td><strong>Bit</strong></td><td>Cables, connectors, radio, voltage, light</td></tr>
</table>
<p>Mnemonic, bottom to top: <strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot
<strong>T</strong>hrow <strong>S</strong>ausage <strong>P</strong>izza <strong>A</strong>way.</p>

<h2>Encapsulation: what actually happens when you load a web page</h2>
<p>Data doesn't teleport. Each layer wraps the layer above it in its own header, like putting a
letter in an envelope, the envelope in a box, and the box in a shipping container.</p>
<ol>
  <li><strong>Layer 7</strong>: your browser writes an HTTP request: <code>GET /index.html</code>.</li>
  <li><strong>Layer 4</strong>: TCP adds a header with source port (random, e.g. 51234) and destination port (443). Now it's a <strong>segment</strong>.</li>
  <li><strong>Layer 3</strong>: IP adds source IP (your PC) and destination IP (the server). Now it's a <strong>packet</strong>.</li>
  <li><strong>Layer 2</strong>: Ethernet adds source MAC (your NIC) and destination MAC (<em>your router's</em>, not the server's!). Now it's a <strong>frame</strong>.</li>
  <li><strong>Layer 1</strong>: the frame becomes electrical pulses, light, or radio waves, <strong>bits</strong>.</li>
</ol>
<p>At the far end, the process runs in reverse (de-encapsulation): each layer strips its own header
and hands the contents up.</p>
<div class="keybox"><strong>The detail everyone misses:</strong> in step 4, the destination MAC is
your <em>default gateway's</em>, not the web server's. Your PC has no idea what the server's MAC is,
and it doesn't need to. The IP header carries the final destination; the MAC header only gets the
frame to the next hop. At every hop, the MAC addresses are rewritten; the IP addresses stay the same.</div>

<h2>TCP/IP: the model that's actually implemented</h2>
<p>The internet runs on the four-layer TCP/IP model. OSI is the teaching tool; TCP/IP is the reality.</p>
<table>
  <tr><th>TCP/IP layer</th><th>Maps to OSI</th></tr>
  <tr><td>Application</td><td>Layers 5, 6, 7</td></tr>
  <tr><td>Transport</td><td>Layer 4</td></tr>
  <tr><td>Internet</td><td>Layer 3</td></tr>
  <tr><td>Link / Network Access</td><td>Layers 1, 2</td></tr>
</table>

<h2>Why this makes you a better troubleshooter</h2>
<p>The layers give you a search algorithm. Instead of guessing, you bisect:</p>
<ul>
  <li>No link light? <strong>Layer 1.</strong> No amount of IP configuration will save you.</li>
  <li>Link up but the interface shows CRC errors and late collisions? <strong>Layer 1/2</strong>: bad cable or duplex mismatch.</li>
  <li>Can ping by IP but not by name? Layers 1–3 are proven fine. It's <strong>DNS</strong> (Layer 7).</li>
  <li>Can ping the server but the app won't connect on port 443? Layers 1–3 fine. Check the <strong>service and firewall (Layer 4+)</strong>.</li>
</ul>
<div class="exambox"><strong>Exam angle:</strong> "bottom-up" troubleshooting starts at Layer 1 and
works up; "top-down" starts at the application. "Divide and conquer" starts in the middle (usually
a ping, at Layer 3) and moves in whichever direction the result points. Know all three names.</div>

<h2>What you must remember</h2>
<ul>
  <li>Layers 1–4 by number, their data units, and their devices. Segment (4), Packet (3), Frame (2), Bit (1).</li>
  <li>Encapsulation adds headers going down; de-encapsulation strips them going up.</li>
  <li>IP addresses survive end-to-end. MAC addresses are rewritten at every hop.</li>
  <li>What succeeds tells you as much as what fails. It eliminates all the layers beneath it.</li>
</ul>`,
  quiz: [
    { text: "At which OSI layer do port numbers operate?",
      choices: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 4 (Transport)", "Layer 7 (Application)"], answer: 2,
      expl: "TCP and UDP port numbers live at Layer 4, the Transport layer. Layer 3 handles IP addresses; Layer 2 handles MAC addresses." },
    { text: "What is the correct data unit name at the Network layer?",
      choices: ["Frame", "Packet", "Segment", "Bit"], answer: 1,
      expl: "Layer 3 = packet. Layer 4 = segment, Layer 2 = frame, Layer 1 = bit. This mapping is heavily tested." },
    { text: "A PC sends an HTTP request to a web server on the internet. What is the destination MAC address in the frame that leaves the PC?",
      choices: [
        "The web server's MAC address",
        "The default gateway's MAC address",
        "A broadcast MAC address",
        "The PC's own MAC address"],
      answer: 1,
      expl: "The destination IP is the server, but the destination MAC is the next hop, the default gateway. MAC addresses are rewritten at each hop while the IP addresses remain end-to-end." },
    { text: "A user cannot reach a website by name but CAN reach it by IP address. Which layer is the problem MOST likely at?",
      choices: ["Layer 1 (Physical)", "Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 7 (Application, DNS)"], answer: 3,
      expl: "Reaching it by IP proves Layers 1 through 3 are working. Only name resolution fails, and DNS is an application-layer service." },
    { text: "Which two are true about encapsulation? (Select TWO.)",
      choices: [
        "Each layer adds its own header as data moves down the stack",
        "Headers are removed as data moves down the stack",
        "The receiving device de-encapsulates by stripping headers as data moves up",
        "Encapsulation only occurs at Layer 1",
        "Encapsulation removes the need for addressing"],
      answer: [0, 2],
      expl: "Sending encapsulates (adds headers going down); receiving de-encapsulates (strips headers going up). Every layer contributes its own header with its own addressing." },
    { text: "A switch operates primarily at which layer, and a router at which layer?",
      choices: [
        "Switch: Layer 1; Router: Layer 2",
        "Switch: Layer 2; Router: Layer 3",
        "Switch: Layer 3; Router: Layer 4",
        "Switch: Layer 2; Router: Layer 2"],
      answer: 1,
      expl: "Switches forward frames using MAC addresses (Layer 2). Routers forward packets between networks using IP addresses (Layer 3)." },
    { text: "A technician starts troubleshooting by checking the cable and link lights, then moves upward through the layers. What is this approach called?",
      choices: ["Top-down", "Bottom-up", "Divide and conquer", "Escalation"], answer: 1,
      expl: "Bottom-up starts at the Physical layer. Top-down starts at the application. Divide-and-conquer starts in the middle, typically with a ping at Layer 3." }
  ]
},

/* ================= MODULE 3 ================= */
{
  id: "m1_3", title: "Topologies, Traffic Types, and Network Architecture", minutes: 12, level: "foundation",
  content: `
<p>Topology describes how devices are arranged and connected. There's a <em>physical</em> topology
(where the cables actually run) and a <em>logical</em> topology (how data actually flows), and they
often differ.</p>

<h2>The topologies</h2>
<table>
  <tr><th>Topology</th><th>How it works</th><th>Weakness</th></tr>
  <tr><td><strong>Star</strong></td><td>Every node connects to a central device (a switch)</td><td>The central device is a single point of failure, but one bad cable affects only one node</td></tr>
  <tr><td><strong>Bus</strong></td><td>All devices share one backbone cable</td><td>One break kills the entire segment. Obsolete.</td></tr>
  <tr><td><strong>Ring</strong></td><td>Each device connects to two neighbors, forming a loop</td><td>A single break can bring down the ring unless it's dual-ring</td></tr>
  <tr><td><strong>Mesh</strong></td><td>Devices interconnect with multiple paths (full = everything to everything)</td><td>Extremely resilient, but cost and cabling explode: n(n−1)/2 links</td></tr>
  <tr><td><strong>Hybrid</strong></td><td>A mix: e.g. star-of-stars</td><td>What real networks actually are</td></tr>
</table>
<p>Modern Ethernet LANs are <strong>physical stars</strong> (everything home-runs to a switch), and
WAN cores are often partial meshes for redundancy.</p>

<h2>Three-tier architecture</h2>
<p>Enterprise campus networks are built in layers, each with one job:</p>
<ul>
  <li><strong>Access layer</strong>: where end devices plug in. Lots of ports, PoE, port security, VLAN assignment.</li>
  <li><strong>Distribution (aggregation) layer</strong>: aggregates access switches; this is where routing between VLANs and policy (ACLs, QoS marking) live.</li>
  <li><strong>Core layer</strong>: the high-speed backbone. Its only job is to forward packets as fast as possible. You do <em>not</em> put heavy filtering here; it adds latency and risk.</li>
</ul>
<p>In smaller networks, core and distribution merge into one layer: a <strong>collapsed core</strong>.</p>
<div class="exambox"><strong>Exam angle:</strong> "Access = user ports. Distribution = aggregation and
policy. Core = fast and dumb." If an answer suggests deep packet inspection in the core, it's wrong.</div>

<h2>Other architectures you must recognize</h2>
<ul>
  <li><strong>Spine-and-leaf</strong>: the data center standard. Every leaf switch connects to every spine switch, so any server is exactly two hops from any other. Predictable latency, easy to scale by adding spines.</li>
  <li><strong>Software-Defined Networking (SDN)</strong>: separates the <em>control plane</em> (the decision-making) from the <em>data plane</em> (the actual forwarding) and centralizes control in a controller you can program via API.</li>
  <li><strong>SD-WAN</strong>: a controller applies application-aware policy across multiple transports (MPLS, broadband, LTE), steering traffic based on real-time link quality.</li>
  <li><strong>VXLAN</strong>: encapsulates Layer 2 frames inside UDP so you can stretch a Layer 2 segment across a routed Layer 3 network. It also raises the segment limit from 4,094 VLANs to ~16 million.</li>
</ul>

<h2>Traffic types: who receives the message?</h2>
<table>
  <tr><th>Type</th><th>Recipients</th><th>Example</th></tr>
  <tr><td><strong>Unicast</strong></td><td>Exactly one</td><td>You loading a web page</td></tr>
  <tr><td><strong>Broadcast</strong></td><td>Everyone on the segment</td><td>An ARP request; DHCP DISCOVER. IPv4 only: <strong>IPv6 has no broadcast</strong>.</td></tr>
  <tr><td><strong>Multicast</strong></td><td>A subscribed group</td><td>A video stream sent once to many subscribers (224.0.0.0/4)</td></tr>
  <tr><td><strong>Anycast</strong></td><td>The nearest of several identical hosts</td><td>Public DNS like 8.8.8.8, announced from many sites at once</td></tr>
</table>
<div class="keybox"><strong>Broadcast domains matter enormously.</strong> Every device in a broadcast
domain must process every broadcast. Too many devices in one domain = wasted CPU and bandwidth on
every host. A <strong>switch</strong> forwards broadcasts (one big broadcast domain), but a
<strong>router</strong> blocks them. VLANs let one switch create several broadcast domains, which
is exactly why VLANs exist.</div>

<h2>Collision domains vs. broadcast domains</h2>
<ul>
  <li><strong>Collision domain</strong>: where two devices can transmit at once and corrupt each other. On a modern full-duplex switch, <em>every port is its own collision domain</em>, so collisions basically don't happen. Hubs put everyone in one collision domain, which is why they're extinct.</li>
  <li><strong>Broadcast domain</strong>: how far a broadcast travels. One VLAN = one broadcast domain. Routers are the boundary.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>Modern LANs are physical stars; data centers use spine-and-leaf.</li>
  <li>Access / Distribution / Core, and the core stays fast and simple.</li>
  <li>Switch ports = separate collision domains. Router interfaces = separate broadcast domains. VLANs = broadcast domains on one switch.</li>
  <li>Unicast (one), broadcast (all, IPv4 only), multicast (subscribed group), anycast (nearest).</li>
</ul>`,
  quiz: [
    { text: "Which device separates broadcast domains by default?",
      choices: ["Hub", "Switch", "Router", "Repeater"], answer: 2,
      expl: "Routers do not forward broadcasts, so each router interface bounds a broadcast domain. Switches forward broadcasts out all ports in the same VLAN." },
    { text: "A single video stream is sent once and received simultaneously by all subscribed hosts. Which traffic type is this?",
      choices: ["Unicast", "Broadcast", "Multicast", "Anycast"], answer: 2,
      expl: "Multicast sends one stream to a subscribed group. Broadcast would hit every host on the segment; anycast delivers to the nearest of several identical endpoints." },
    { text: "In the three-tier architecture, which layer aggregates access switches and typically performs inter-VLAN routing and policy enforcement?",
      choices: ["Core", "Distribution", "Access", "Edge"], answer: 1,
      expl: "The distribution layer aggregates access switches and applies routing and policy. The core is intentionally kept fast and simple; access is where users connect." },
    { text: "Which data center topology places every leaf switch one hop from every spine switch, giving predictable latency between any two servers?",
      choices: ["Bus", "Ring", "Spine-and-leaf", "Collapsed core"], answer: 2,
      expl: "Spine-and-leaf ensures any server is two hops from any other, giving consistent east-west latency and easy horizontal scaling." },
    { text: "Which two statements are true about broadcast domains? (Select TWO.)",
      choices: [
        "Every device in a broadcast domain must process every broadcast frame",
        "A router forwards broadcasts between all its interfaces",
        "Each VLAN creates a separate broadcast domain",
        "Switch ports are all in separate broadcast domains by default",
        "IPv6 relies heavily on broadcast traffic"],
      answer: [0, 2],
      expl: "Broadcasts are processed by every host in the domain, which is why we segment with VLANs. Routers block broadcasts, all ports in one VLAN share a broadcast domain, and IPv6 replaced broadcast with multicast entirely." },
    { text: "What is the key characteristic of SDN?",
      choices: [
        "The control plane is separated from the data plane and centralized in a controller",
        "It eliminates the need for physical switches",
        "It requires all traffic to be unencrypted",
        "It only works on wireless networks"],
      answer: 0,
      expl: "SDN centralizes control-plane decision-making in a programmable controller, while devices continue forwarding traffic in their data planes." }
  ]
},

/* ================= MODULE 4 ================= */
{
  id: "m1_4", title: "Cables, Connectors, and Physical Media", minutes: 14, level: "foundation",
  content: `
<p>Layer 1 is where a shocking share of real outages live. Learn the numbers here: the exam tests
them directly, and every "intermittent weirdness" ticket in your career starts with "is it the cable?"</p>

<h2>Copper: twisted pair</h2>
<p>Two wires twisted together cancel out electromagnetic interference. Tighter twists = better
performance = higher category.</p>
<table>
  <tr><th>Category</th><th>Max speed</th><th>Max distance</th><th>Notes</th></tr>
  <tr><td>Cat 5e</td><td>1 Gbps</td><td>100 m</td><td>The old baseline; still everywhere</td></tr>
  <tr><td>Cat 6</td><td>1 Gbps (10 Gbps to ~55 m)</td><td>100 m</td><td>10G only on short runs</td></tr>
  <tr><td><strong>Cat 6a</strong></td><td><strong>10 Gbps</strong></td><td><strong>100 m</strong></td><td>The answer for 10G over copper at full distance</td></tr>
  <tr><td>Cat 7 / Cat 8</td><td>10–40 Gbps</td><td>100 m / 30 m</td><td>Cat 8 is short-run data center only</td></tr>
</table>
<div class="warnbox"><strong>The 100-meter rule:</strong> that's the total channel, typically 90 m of
solid horizontal cable plus 10 m of stranded patch cables. Exceed it and you get intermittent,
maddening errors rather than a clean failure.</div>

<h3>Shielding and terminations</h3>
<ul>
  <li><strong>UTP</strong> (Unshielded): standard office cable.</li>
  <li><strong>STP/FTP</strong> (Shielded/Foiled): adds a shield for high-EMI environments (factory floors, near motors). The shield <em>must</em> be grounded or it makes things worse.</li>
  <li><strong>Plenum-rated</strong>: fire-safe jacket required in air-handling spaces (above drop ceilings). Non-plenum cable there is a code violation. It emits toxic smoke when burning.</li>
  <li><strong>T568A / T568B</strong>: the two pin-out standards. Use the same one at both ends (B is more common). Different standards at each end = a crossover cable.</li>
</ul>

<h2>Fiber optic</h2>
<table>
  <tr><th></th><th>Single-mode (SMF)</th><th>Multimode (MMF)</th></tr>
  <tr><td>Core size</td><td>~9 µm (tiny)</td><td>50 or 62.5 µm</td></tr>
  <tr><td>Light source</td><td>Laser</td><td>LED / VCSEL</td></tr>
  <tr><td>Distance</td><td>Tens of km</td><td>Hundreds of meters</td></tr>
  <tr><td>Cost</td><td>Cheaper cable, pricier optics</td><td>Cheaper optics</td></tr>
  <tr><td>Use it for</td><td>Between buildings, long haul, ISP links</td><td>Inside a building or data center</td></tr>
  <tr><td>Jacket color (typical)</td><td>Yellow</td><td>Orange / aqua (OM3/OM4)</td></tr>
</table>
<p>Fiber is immune to EMI, doesn't radiate a signal (harder to tap), and covers distances copper
can't touch. It's also fragile: mind the <strong>bend radius</strong> and keep the ends spotlessly clean.</p>

<h3>Connectors: know these on sight</h3>
<ul>
  <li><strong>LC</strong>: small, latching. The standard on SFP/SFP+ optics. ("Little Connector")</li>
  <li><strong>SC</strong>: larger, square, push-pull. ("Square Connector")</li>
  <li><strong>ST</strong>: round bayonet, twist-lock. ("Stick and Twist")</li>
  <li><strong>MPO/MTP</strong>: multi-fiber ribbon connector for 40G/100G trunks.</li>
  <li><strong>RJ45</strong>: 8-pin copper Ethernet. <strong>RJ11</strong>: 6-pin telephone. <strong>BNC</strong>: legacy coax. <strong>F-type</strong>: coax for cable modems.</li>
</ul>

<h2>Transceivers</h2>
<p>Modular switches use pluggable optics so one port can be copper or fiber, short or long range:</p>
<ul>
  <li><strong>SFP</strong>: 1 Gbps. <strong>SFP+</strong>: 10 Gbps. <strong>QSFP+</strong>: 40 Gbps. <strong>QSFP28</strong>: 100 Gbps.</li>
  <li><strong>DAC</strong> (Direct Attach Copper): a cheap fixed cable with transceivers on both ends, for very short in-rack runs.</li>
</ul>
<div class="warnbox"><strong>Wavelength must match.</strong> An 850 nm multimode optic will not talk to a
1310 nm single-mode optic, even though the connectors fit perfectly. Mismatched optics are a classic
"link won't come up" cause.</div>

<h2>Copper's failure modes (and what they look like)</h2>
<ul>
  <li><strong>Attenuation</strong>: the signal weakens over distance. Symptom: errors on long runs.</li>
  <li><strong>Crosstalk</strong>: signal bleeding between pairs, often from untwisting too much wire at the termination.</li>
  <li><strong>EMI</strong>: interference from motors, fluorescent lights, power cables run in parallel.</li>
  <li><strong>Open / short</strong>: a broken conductor, or two touching.</li>
  <li><strong>Split pair</strong>: wires connected in the right pin order but using the wrong <em>pairs</em>. It passes a simple continuity test but fails at speed: a nasty, subtle fault.</li>
</ul>
<div class="exambox"><strong>Exam angle:</strong> a gigabit link that negotiates at only 100 Mbps often
means a damaged pair: 1000BASE-T needs all four pairs, while 100BASE-TX needs only two. That's a
free point if you know it.</div>

<h2>What you must remember</h2>
<ul>
  <li>Cat 5e = 1G, Cat 6 = 10G only to 55 m, <strong>Cat 6a = 10G to 100 m</strong>. Copper's limit is 100 m, period.</li>
  <li>Single-mode = long distance. Multimode = short. LC on SFPs; SC square; ST twist; MPO for 40/100G.</li>
  <li>Plenum cable in air-handling spaces. Shielded cable in high-EMI areas, and ground the shield.</li>
  <li>Gigabit needs all four pairs. Speed dropping to 100 Mbps = suspect the cable.</li>
</ul>`,
  quiz: [
    { text: "Which copper cable category is the minimum required to support 10GBASE-T over a full 100-meter run?",
      choices: ["Cat 5e", "Cat 6", "Cat 6a", "Cat 3"], answer: 2,
      expl: "Cat 6a supports 10 Gbps at 100 m. Cat 6 supports 10 Gbps only to roughly 55 m; Cat 5e tops out at 1 Gbps." },
    { text: "A 2 km link is needed between two buildings at 1 Gbps. Which media is appropriate?",
      choices: ["Cat 6a copper", "Single-mode fiber", "Cat 5e copper", "Coaxial cable"], answer: 1,
      expl: "Copper is limited to 100 m, so a 2 km run requires fiber. Single-mode fiber is designed for long distances measured in kilometers." },
    { text: "Which connector is most commonly found on SFP+ fiber transceivers?",
      choices: ["LC", "RJ45", "BNC", "RJ11"], answer: 0,
      expl: "LC is the small-form-factor fiber connector used on SFP/SFP+ optics. RJ45 is copper Ethernet, RJ11 is telephone, and BNC is legacy coax." },
    { text: "Cable installed above a drop ceiling used for air circulation must be:",
      choices: ["Plenum-rated", "Shielded", "Crossover-wired", "Cat 3 or lower"], answer: 0,
      expl: "Plenum spaces require fire-rated cable with a low-smoke jacket. Standard PVC cable in a plenum is a fire-code violation because of the toxic smoke it releases when burned." },
    { text: "A gigabit-capable PC and switch negotiate only 100 Mbps on a new cable run. What is the MOST likely cause?",
      choices: [
        "A damaged or improperly terminated pair: 1000BASE-T requires all four pairs",
        "The DNS server is misconfigured",
        "The switch has too many VLANs",
        "The cable is too short"],
      answer: 0,
      expl: "100BASE-TX uses only two pairs, but 1000BASE-T requires all four. A broken or mis-terminated pair silently drops the link to 100 Mbps." },
    { text: "Which two are true about single-mode fiber compared to multimode? (Select TWO.)",
      choices: [
        "It supports much longer distances",
        "It uses a larger core diameter",
        "It typically uses a laser light source",
        "It is limited to about 100 meters",
        "It is susceptible to electromagnetic interference"],
      answer: [0, 2],
      expl: "Single-mode has a very small core (~9 µm) and uses lasers, supporting distances of tens of kilometers. All fiber is immune to EMI." },
    { text: "A technician terminates one end of a cable with T568A and the other with T568B. What has been created?",
      choices: ["A rollover cable", "A crossover cable", "A plenum cable", "A shielded cable"], answer: 1,
      expl: "Different standards at each end produce a crossover cable. Modern Auto-MDIX ports compensate automatically, but the wiring is still non-standard." }
  ]
}
    ],

/* ================= CHECKPOINT 1 ================= */
    checkpoint: {
      id: "cp1", title: "Foundations", n: 15,
      questions: [
        { text: "Which OSI layer is responsible for logical addressing and routing between networks?",
          choices: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], answer: 2,
          expl: "Layer 3 (Network) handles IP addressing and routing. Layer 2 handles MAC addressing within a segment." },
        { text: "What data unit exists at the Transport layer?",
          choices: ["Frame", "Packet", "Segment", "Bit"], answer: 2,
          expl: "Segment (Layer 4). Packet is Layer 3, frame is Layer 2, bit is Layer 1." },
        { text: "Which media should be used for a 10 Gbps copper run of 95 meters?",
          choices: ["Cat 5e", "Cat 6", "Cat 6a", "Cat 3"], answer: 2,
          expl: "Cat 6a carries 10 Gbps the full 100 m. Cat 6 only manages 10 Gbps to roughly 55 m." },
        { text: "A frame leaving a PC bound for an internet server carries which destination MAC address?",
          choices: ["The server's MAC", "The default gateway's MAC", "FF:FF:FF:FF:FF:FF", "The PC's own MAC"], answer: 1,
          expl: "MAC addressing is hop-by-hop. The frame is addressed to the default gateway; the IP header still names the final server." },
        { text: "Which traffic type does IPv6 NOT support?",
          choices: ["Unicast", "Multicast", "Broadcast", "Anycast"], answer: 2,
          expl: "IPv6 eliminated broadcast entirely, replacing it with multicast (for example, ff02::1 for all nodes)." },
        { text: "Which device places every port in its own collision domain?",
          choices: ["Hub", "Switch", "Repeater", "Media converter"], answer: 1,
          expl: "Each switch port is its own collision domain; full-duplex switching effectively eliminates collisions. Hubs share one collision domain across all ports." },
        { text: "Which two are characteristics of a WAN? (Select TWO.)",
          choices: [
            "It spans large geographic distances",
            "It is always owned outright by the organization",
            "Links are typically leased from a service provider",
            "It is limited to a single building",
            "It cannot carry IP traffic"],
          answer: [0, 2],
          expl: "WANs cross large distances and are usually leased from providers, unlike LANs which the organization owns and controls." },
        { text: "In the three-tier model, which layer should be kept fast and free of heavy filtering?",
          choices: ["Access", "Distribution", "Core", "Edge"], answer: 2,
          expl: "The core exists to forward traffic as quickly as possible. Policy and filtering belong at the distribution layer." },
        { text: "Which fiber connector is a square push-pull design?",
          choices: ["LC", "SC", "ST", "MPO"], answer: 1,
          expl: "SC is the Square Connector with a push-pull latch. LC is smaller and latching, ST is a bayonet twist, and MPO carries multiple fibers." },
        { text: "A technician measures a 130-meter Cat 6 run and sees intermittent errors. What is the MOST likely cause?",
          choices: [
            "The run exceeds the 100-meter Ethernet limit, causing attenuation",
            "The cable is plenum-rated",
            "The switch has PoE disabled",
            "The VLAN is misconfigured"],
          answer: 0,
          expl: "Copper Ethernet is limited to a 100 m channel. Beyond that, attenuation produces intermittent errors rather than a clean failure." },
        { text: "Which addressing scheme routes each client to the topologically nearest of several servers sharing one IP address?",
          choices: ["Unicast", "Multicast", "Anycast", "Broadcast"], answer: 2,
          expl: "Anycast advertises the same address from many locations; routing delivers each client to the nearest instance. This is how public DNS resolvers such as 8.8.8.8 work." },
        { text: "Which two statements about VLANs are accurate? (Select TWO.)",
          choices: [
            "Each VLAN forms a separate broadcast domain",
            "VLANs increase the physical distance limit of cabling",
            "Traffic between VLANs requires routing",
            "VLANs eliminate the need for a switch",
            "VLANs double link speed"],
          answer: [0, 2],
          expl: "A VLAN is a broadcast domain, and moving traffic between VLANs requires a Layer 3 device. VLANs change neither cable distance nor link speed." },
        { text: "Which technology stretches a Layer 2 segment across a routed Layer 3 network and supports roughly 16 million segments?",
          choices: ["STP", "VXLAN", "QinQ", "LACP"], answer: 1,
          expl: "VXLAN encapsulates Layer 2 frames in UDP over an IP underlay and uses a 24-bit VNI, allowing about 16 million segments versus 4,094 VLAN IDs." },
        { text: "A VoIP call sounds choppy while the link sits at 18% utilization. Which metric is the MOST likely culprit?",
          choices: ["Bandwidth", "Jitter", "MAC table size", "Cable category"], answer: 1,
          expl: "Jitter (variation in packet delay) degrades voice even on lightly loaded links. Utilization alone tells you nothing about delay stability." },
        { text: "Which troubleshooting approach begins at the Physical layer and works upward?",
          choices: ["Top-down", "Bottom-up", "Divide and conquer", "Escalate first"], answer: 1,
          expl: "Bottom-up starts at Layer 1 (cables, link lights) and works up the stack. It is the right instinct when physical symptoms are present." },
        { text: "Which two devices operate at Layer 1 only? (Select TWO.)",
          choices: ["Hub", "Switch", "Repeater", "Router", "Firewall"], answer: [0, 2],
          expl: "Hubs and repeaters simply regenerate electrical signals with no addressing intelligence. Switches are Layer 2; routers and most firewalls operate at Layer 3 and above." },
        { text: "What is the primary purpose of shielded twisted pair (STP) cabling?",
          choices: [
            "To resist electromagnetic interference in noisy environments",
            "To increase the maximum cable length beyond 100 m",
            "To carry power to devices",
            "To eliminate the need for connectors"],
          answer: 0,
          expl: "Shielding protects against EMI in electrically noisy locations. The shield must be properly grounded, and the 100 m distance limit still applies." }
      ]
    }
  });
})();
