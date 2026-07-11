/* Network+ Study Course - Unit 2: Addressing & Core Protocols */
(function () {
  const C = window.NETCOURSE = window.NETCOURSE || { units: [] };

  C.units.push({
    id: "u2",
    title: "Unit 2: Addressing and Core Protocols",
    blurb: "Binary, IPv4, subnetting from scratch, IPv6, and the protocols that make a network usable. This unit is where the exam is won or lost.",
    modules: [

/* ================= MODULE 5 ================= */
{
  id: "m2_1", title: "Binary and IPv4 Addressing", minutes: 14, level: "core",
  content: `
<p>You cannot subnet without binary, and you cannot pass this exam without subnetting. The good news:
you only need eight bits at a time.</p>

<h2>Binary in five minutes</h2>
<p>Each bit position in an octet has a value. Memorize this row. It is the single most useful thing
in the entire certification:</p>
<table>
  <tr><th>128</th><th>64</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th></tr>
  <tr><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
</table>
<p>A bit that's "on" contributes its column value. So <code>11000000</code> = 128 + 64 = <strong>192</strong>.
And <code>11111111</code> = 255 (all eight columns added). An octet can hold 0–255: that's why IP
addresses never contain 256.</p>
<div class="worked"><h4>Convert 172 to binary</h4>
<p>Work left to right, greedily: does 128 fit in 172? Yes → 1, remainder 44. Does 64 fit in 44? No → 0.
32 into 44? Yes → 1, remainder 12. 16 into 12? No → 0. 8 into 12? Yes → 1, remainder 4. 4 into 4? Yes → 1,
remainder 0. Then 0, 0.</p>
<p>Result: <code>10101100</code> = 172. ✓</p></div>

<h2>An IPv4 address is two things at once</h2>
<p>32 bits, written as four octets. Every address splits into a <strong>network portion</strong> (which
network you're on) and a <strong>host portion</strong> (which machine you are). The <strong>subnet
mask</strong> is what tells you where the split happens.</p>
<p><code>192.168.10.25 / 255.255.255.0</code>: the mask's 255s mark network bits. So the network is
192.168.10.0 and this host is number 25 on it. The same thing in CIDR notation:
<code>192.168.10.25/24</code>, where /24 just means "the first 24 bits are network."</p>
<div class="keybox"><strong>Why this matters practically:</strong> when your PC wants to send a packet, it
compares its own network portion to the destination's. Same network? ARP for the destination and send
directly. Different network? Send it to the default gateway. <em>A wrong subnet mask makes your PC
misjudge that comparison</em>, which produces bizarre, selective connectivity failures.</div>

<h2>The address ranges you must know cold</h2>
<table>
  <tr><th>Range</th><th>Name</th><th>Meaning</th></tr>
  <tr><td>10.0.0.0 – 10.255.255.255</td><td>Private (RFC 1918)</td><td>/8: huge, common in enterprises</td></tr>
  <tr><td>172.16.0.0 – 172.31.255.255</td><td>Private (RFC 1918)</td><td>Only 16–31! 172.32 is public.</td></tr>
  <tr><td>192.168.0.0 – 192.168.255.255</td><td>Private (RFC 1918)</td><td>Home routers live here</td></tr>
  <tr><td>127.0.0.0/8</td><td>Loopback</td><td>127.0.0.1 = "myself." Pings your own TCP/IP stack.</td></tr>
  <tr><td><strong>169.254.0.0/16</strong></td><td><strong>APIPA</strong></td><td>Self-assigned when DHCP fails. A diagnostic gift.</td></tr>
  <tr><td>224.0.0.0 – 239.255.255.255</td><td>Multicast</td><td>Class D</td></tr>
</table>
<div class="exambox"><strong>Exam angle:</strong> if a host has a 169.254.x.x address, DHCP failed. Full
stop. The question is only <em>why</em>: server down, relay/helper missing, wrong VLAN, or a Layer 1 fault.</div>

<h2>Legacy classes (still tested)</h2>
<table>
  <tr><th>Class</th><th>First octet</th><th>Default mask</th></tr>
  <tr><td>A</td><td>1–126</td><td>/8 (255.0.0.0)</td></tr>
  <tr><td>B</td><td>128–191</td><td>/16 (255.255.0.0)</td></tr>
  <tr><td>C</td><td>192–223</td><td>/24 (255.255.255.0)</td></tr>
  <tr><td>D</td><td>224–239</td><td>Multicast</td></tr>
  <tr><td>E</td><td>240–255</td><td>Experimental</td></tr>
</table>
<p>Classful addressing was wasteful (a class A gives you 16 million hosts. Nobody needs that on one
network), so <strong>CIDR</strong> replaced it: you can put the network/host boundary anywhere you like.</p>

<h2>Three addresses you can't assign to a host</h2>
<ul>
  <li>The <strong>network address</strong>: all host bits 0. It names the network itself.</li>
  <li>The <strong>broadcast address</strong>: all host bits 1. Reaches every host on that network.</li>
  <li>(And by convention, the <strong>gateway</strong> usually takes the first or last usable address.)</li>
</ul>
<p>That's why usable hosts = 2<sup>host bits</sup> − 2. The minus 2 is the network and broadcast addresses.</p>

<h2>Static vs. DHCP</h2>
<ul>
  <li><strong>Static</strong>: typed in manually. Use for routers, switches, and things that must never move. Risky: typos create duplicate IPs.</li>
  <li><strong>DHCP</strong>: assigned automatically. Use for everything else.</li>
  <li><strong>DHCP reservation</strong>: the best of both: the server always hands the same IP to a given MAC. Manageable from one place, no typos.</li>
</ul>
<div class="warnbox"><strong>The classic outage:</strong> someone statically assigns an address that sits
inside the DHCP pool. Weeks later DHCP leases the same address to a laptop and both devices start
dropping. Fix: use reservations, or exclude static ranges from the scope.</div>

<h2>What you must remember</h2>
<ul>
  <li>128-64-32-16-8-4-2-1. Burn it in.</li>
  <li>Mask splits network from host. Wrong mask = selective, confusing failures.</li>
  <li>RFC 1918: 10/8, 172.16–31, 192.168/16. <strong>169.254 = DHCP failed.</strong> 127.0.0.1 = yourself.</li>
  <li>Usable hosts = 2<sup>h</sup> − 2.</li>
</ul>`,
  quiz: [
    { text: "What is the decimal value of the binary octet 11000000?",
      choices: ["128", "192", "224", "240"], answer: 1,
      expl: "The two leftmost bits are set: 128 + 64 = 192." },
    { text: "A host is configured with 169.254.10.55. What does this tell you?",
      choices: [
        "It has a valid public address",
        "It failed to contact a DHCP server and self-assigned an APIPA address",
        "It is using a loopback address",
        "It is on a multicast network"],
      answer: 1,
      expl: "169.254.0.0/16 is APIPA. The host could not reach a DHCP server, so it assigned itself a link-local address and cannot communicate off-subnet." },
    { text: "Which of the following is a private (RFC 1918) address?",
      choices: ["172.32.5.1", "192.168.100.7", "11.10.10.10", "169.254.4.4"], answer: 1,
      expl: "192.168.0.0/16 is private. The private 172 range stops at 172.31: 172.32 is public. 169.254 is APIPA, not RFC 1918." },
    { text: "How many usable host addresses exist in a /26 network?",
      choices: ["30", "62", "126", "254"], answer: 1,
      expl: "/26 leaves 6 host bits: 2⁶ = 64 addresses, minus the network and broadcast addresses = 62 usable." },
    { text: "Why can't the all-zeros and all-ones host addresses be assigned to devices?",
      choices: [
        "They are reserved for the network address and the broadcast address",
        "They are reserved for DHCP servers",
        "They are used only by routers",
        "They are reserved for IPv6 compatibility"],
      answer: 0,
      expl: "All host bits 0 identifies the network itself; all host bits 1 is the broadcast address for that network. This is why usable hosts is 2^h − 2." },
    { text: "Which two are valid reasons to use a DHCP reservation rather than a static IP on a printer? (Select TWO.)",
      choices: [
        "The address is managed centrally from the DHCP server",
        "It prevents the printer from ever getting an IP address",
        "It avoids the risk of a duplicate IP caused by a manual typo",
        "It increases the printer's link speed",
        "It removes the need for a default gateway"],
      answer: [0, 2],
      expl: "Reservations bind a MAC to a fixed IP while keeping management centralized and avoiding manual configuration errors that create duplicate addresses." },
    { text: "A host's subnet mask is configured incorrectly. What symptom is MOST likely?",
      choices: [
        "The link light does not come on",
        "The host misjudges which destinations are local, causing selective connectivity failures",
        "The host cannot obtain a MAC address",
        "DNS names resolve but pings fail entirely"],
      answer: 1,
      expl: "The mask determines whether a destination is local (ARP directly) or remote (send to the gateway). A wrong mask makes that decision incorrectly, producing puzzling partial connectivity." }
  ]
},

/* ================= MODULE 6 ================= */
{
  id: "m2_2", title: "Subnetting, The Complete Method", minutes: 20, level: "core",
  content: `
<p>Subnetting is the highest-value skill on this exam. It appears in multiple-choice questions and in
performance-based questions, and it terrifies people needlessly. Here is a method that works every
time, without binary conversion of whole addresses.</p>

<h2>Step 1: memorize the mask table</h2>
<p>There are only eight possible values in a mask octet. Learn this table and subnetting becomes arithmetic.</p>
<table>
  <tr><th>CIDR (last octet)</th><th>Mask octet</th><th>Block size</th><th>Usable hosts</th></tr>
  <tr><td>/24</td><td>0</td><td>256</td><td>254</td></tr>
  <tr><td>/25</td><td>128</td><td>128</td><td>126</td></tr>
  <tr><td>/26</td><td>192</td><td>64</td><td>62</td></tr>
  <tr><td>/27</td><td>224</td><td>32</td><td>30</td></tr>
  <tr><td>/28</td><td>240</td><td>16</td><td>14</td></tr>
  <tr><td>/29</td><td>248</td><td>8</td><td>6</td></tr>
  <tr><td>/30</td><td>252</td><td>4</td><td>2</td></tr>
</table>
<p><strong>Block size = 256 − mask octet.</strong> That's the whole trick. A /26 has mask octet 192,
so 256 − 192 = <strong>64</strong>. Subnets begin at multiples of the block size: .0, .64, .128, .192.</p>

<h2>Step 2: the four questions (answer any subnetting problem)</h2>
<div class="worked"><h4>Given: 192.168.20.75 / 26: find everything</h4>
<ol>
  <li><strong>What's the block size?</strong> /26 → mask 255.255.255.192 → 256 − 192 = <strong>64</strong>.</li>
  <li><strong>Where do the subnets start?</strong> Multiples of 64: <strong>0, 64, 128, 192</strong>.</li>
  <li><strong>Which block holds .75?</strong> It's between 64 and 128 → the <strong>.64</strong> block.
      So the network address is <strong>192.168.20.64</strong>.</li>
  <li><strong>What's the broadcast?</strong> One below the <em>next</em> block start (128) →
      <strong>192.168.20.127</strong>.</li>
</ol>
<p>Everything else follows: <strong>first usable</strong> = network + 1 = .65. <strong>Last usable</strong>
= broadcast − 1 = .126. <strong>Usable hosts</strong> = 64 − 2 = <strong>62</strong>.</p></div>

<h2>Step 3: sizing a subnet from a host requirement</h2>
<p>Work backwards. "I need 50 hosts per branch: what prefix?"</p>
<ul>
  <li>Find the smallest 2<sup>h</sup> − 2 that covers 50: 2⁵ − 2 = 30 (too small). 2⁶ − 2 = 62 ✓.</li>
  <li>So you need <strong>6 host bits</strong>. Prefix = 32 − 6 = <strong>/26</strong>.</li>
</ul>
<div class="warnbox"><strong>Don't forget the gateway.</strong> "50 hosts" really means 50 devices <em>plus</em>
the router interface. A /26 (62 usable) is comfortable; a subnet sized to exactly 50 would not be.</div>

<h2>Step 4: VLSM, different sizes from one block</h2>
<p>Variable Length Subnet Masking means you don't have to make every subnet the same size. Rule:
<strong>allocate largest first</strong>, or you'll fragment your space and run out.</p>
<div class="worked"><h4>Given 192.168.1.0/24, allocate: Sales 100 hosts, IT 50 hosts, Ops 20 hosts, and a router-to-router link</h4>
<table>
  <tr><th>Need</th><th>Prefix</th><th>Block</th><th>Range</th></tr>
  <tr><td>Sales: 100 hosts</td><td>/25 (126 usable)</td><td>128</td><td>192.168.1.0 – .127</td></tr>
  <tr><td>IT: 50 hosts</td><td>/26 (62 usable)</td><td>64</td><td>192.168.1.128 – .191</td></tr>
  <tr><td>Ops: 20 hosts</td><td>/27 (30 usable)</td><td>32</td><td>192.168.1.192 – .223</td></tr>
  <tr><td>Router link: 2 hosts</td><td><strong>/30</strong> (2 usable)</td><td>4</td><td>192.168.1.224 – .227</td></tr>
</table>
<p>Note the <strong>/30 for point-to-point links</strong>, exactly two usable addresses, one for each
router. Using a /24 there would waste 252 addresses. Expect this on the exam.</p></div>

<h2>Speed technique for the exam</h2>
<p>You will not have a calculator. Practice this until it's mechanical:</p>
<ol>
  <li>Read the prefix. Convert to block size (256 − mask octet).</li>
  <li>Count up in block-size steps until you pass the host's octet. Back up one: that's the network.</li>
  <li>Next block start − 1 = broadcast. Network + 1 and broadcast − 1 bound the usable range.</li>
</ol>
<div class="exambox"><strong>Which octet?</strong> For /25–/30, work in the <em>fourth</em> octet. For
/17–/24, the block size applies to the <em>third</em> octet (e.g. /22 → 256 − 252 = 4, so third-octet
blocks are 0, 4, 8, 12…). The method is identical; only the octet moves.</div>
<div class="worked"><h4>Harder: 172.16.37.200 / 22</h4>
<p>/22 → mask 255.255.<strong>252</strong>.0 → block size in the <em>third</em> octet = 256 − 252 = 4.</p>
<p>Third-octet blocks: 0, 4, 8, … 36, <strong>40</strong>. Our third octet is 37, which falls in the
<strong>36</strong> block.</p>
<p>Network = <strong>172.16.36.0</strong>. Broadcast = one below the next block (40.0) =
<strong>172.16.39.255</strong>. Usable = 172.16.36.1 – 172.16.39.254 → <strong>1,022 hosts</strong>
(2¹⁰ − 2).</p></div>

<h2>What you must remember</h2>
<ul>
  <li><strong>Block size = 256 − mask octet.</strong> Everything flows from this.</li>
  <li>Network = the block start containing the host. Broadcast = next block start − 1.</li>
  <li>Usable hosts = 2<sup>h</sup> − 2. Size subnets from the host requirement, then convert to a prefix.</li>
  <li>VLSM: allocate largest first. Point-to-point links get a /30.</li>
</ul>`,
  quiz: [
    { text: "What is the block size of a /27 subnet?",
      choices: ["16", "32", "64", "128"], answer: 1,
      expl: "A /27 has a mask octet of 224. Block size = 256 − 224 = 32, so subnets begin at .0, .32, .64, .96, and so on." },
    { text: "A host is 10.1.1.100/26. What is its network address?",
      choices: ["10.1.1.0", "10.1.1.64", "10.1.1.96", "10.1.1.128"], answer: 1,
      expl: "/26 gives a block size of 64, so blocks start at 0, 64, 128, 192. The address .100 falls in the .64 block, making 10.1.1.64 the network address." },
    { text: "What is the broadcast address for 192.168.5.40/28?",
      choices: ["192.168.5.47", "192.168.5.48", "192.168.5.63", "192.168.5.255"], answer: 0,
      expl: "/28 gives a block size of 16: blocks are 32, 48, 64… .40 sits in the .32 block, so the broadcast is one below the next block start (48) = .47." },
    { text: "A department needs 100 usable host addresses. Which is the smallest prefix that satisfies this?",
      choices: ["/24", "/25", "/26", "/27"], answer: 1,
      expl: "/25 provides 2⁷ − 2 = 126 usable hosts, covering 100. A /26 gives only 62, which is too few." },
    { text: "Which prefix is the correct choice for a point-to-point link between two routers?",
      choices: ["/24", "/28", "/30", "/32"], answer: 2,
      expl: "A /30 provides exactly 2 usable addresses (one per router) with no waste. Larger prefixes squander address space on a two-host link." },
    { text: "A host has address 172.16.37.200/22. What is its network address?",
      choices: ["172.16.32.0", "172.16.36.0", "172.16.37.0", "172.16.40.0"], answer: 1,
      expl: "/22 gives a third-octet block size of 4 (256 − 252). Blocks run 32, 36, 40, so third octet 37 falls in the 36 block, making the network 172.16.36.0." },
    { text: "How many usable hosts does a /22 network provide?",
      choices: ["254", "510", "1,022", "2,046"], answer: 2,
      expl: "/22 leaves 10 host bits: 2¹⁰ = 1,024 addresses, minus network and broadcast = 1,022 usable." },
    { text: "When using VLSM to carve up one block, which allocation order avoids fragmenting the address space?",
      choices: [
        "Allocate the largest subnets first",
        "Allocate the smallest subnets first",
        "Allocate randomly",
        "Allocate point-to-point links first"],
      answer: 0,
      expl: "Largest first keeps the remaining space contiguous. Starting small fragments the block and can leave you unable to fit a large subnet later." }
  ]
},

/* ================= MODULE 7 ================= */
{
  id: "m2_3", title: "IPv6", minutes: 12, level: "core",
  content: `
<p>IPv4 has about 4.3 billion addresses and the world ran out. IPv6 uses 128 bits: roughly
340 undecillion addresses. But the exam doesn't test the size; it tests the <em>patterns</em>.</p>

<h2>Reading an IPv6 address</h2>
<p>Eight groups of four hex digits, separated by colons:</p>
<p><code>2001:0db8:0000:0000:0000:ff00:0042:8329</code></p>
<p>Two compression rules make this bearable:</p>
<ol>
  <li><strong>Drop leading zeros</strong> in each group: <code>2001:db8:0:0:0:ff00:42:8329</code></li>
  <li><strong>Replace one run of all-zero groups with <code>::</code></strong>: <code>2001:db8::ff00:42:8329</code></li>
</ol>
<div class="warnbox"><strong>You may use <code>::</code> only once per address.</strong> Otherwise the
address is ambiguous. Nothing would say how many zero groups belong to each gap.</div>

<h2>The prefixes you must recognize on sight</h2>
<table>
  <tr><th>Prefix</th><th>Type</th><th>What it means</th></tr>
  <tr><td><strong>2000::/3</strong></td><td>Global unicast</td><td>Routable on the internet. Starts with 2 or 3.</td></tr>
  <tr><td><strong>fe80::/10</strong></td><td>Link-local</td><td>Auto-configured on <em>every</em> IPv6 interface. Never routed. The IPv6 equivalent of "always present."</td></tr>
  <tr><td><strong>fc00::/7</strong></td><td>Unique local (ULA)</td><td>The rough equivalent of RFC 1918 private space</td></tr>
  <tr><td><strong>ff00::/8</strong></td><td>Multicast</td><td>ff02::1 = all nodes; ff02::2 = all routers</td></tr>
  <tr><td><strong>::1</strong></td><td>Loopback</td><td>The IPv6 127.0.0.1</td></tr>
  <tr><td><code>::</code></td><td>Unspecified</td><td>All zeros, "no address yet"</td></tr>
</table>

<h2>What IPv6 removed and replaced</h2>
<ul>
  <li><strong>No broadcast.</strong> Multicast does that job now: more efficient, since only interested hosts process it.</li>
  <li><strong>No ARP.</strong> It's replaced by <strong>NDP</strong> (Neighbor Discovery Protocol), which uses ICMPv6 Neighbor Solicitation and Neighbor Advertisement messages to the solicited-node multicast address (<code>ff02::1:ffxx:xxxx</code>).</li>
  <li><strong>NAT is unnecessary.</strong> Every device can have a globally unique address. (NAT was always about address scarcity, not security.)</li>
</ul>

<h2>How devices get IPv6 addresses</h2>
<ul>
  <li><strong>SLAAC</strong> (Stateless Address Autoconfiguration): the host listens for a Router Advertisement, takes the announced /64 prefix, and generates its own interface ID. <strong>No server required.</strong></li>
  <li><strong>DHCPv6</strong>: stateful assignment from a server, when you need central control and tracking.</li>
  <li>Both can coexist: SLAAC for the address, DHCPv6 for options like DNS servers.</li>
</ul>
<div class="exambox"><strong>Exam angle:</strong> "A host obtained an IPv6 address with no DHCP server on the
network" → SLAAC, using the Router Advertisement's prefix.</div>

<h2>Transitioning from IPv4</h2>
<table>
  <tr><th>Method</th><th>How it works</th><th>Use when</th></tr>
  <tr><td><strong>Dual stack</strong></td><td>Run IPv4 and IPv6 simultaneously on the same interfaces</td><td>The preferred approach whenever devices support both</td></tr>
  <tr><td><strong>Tunneling</strong></td><td>Encapsulate IPv6 inside IPv4 (6to4, GRE, Teredo)</td><td>You must cross an IPv4-only network</td></tr>
  <tr><td><strong>Translation</strong></td><td>NAT64 converts between the two protocols</td><td>An IPv6-only host must reach an IPv4-only server</td></tr>
</table>

<h2>The /64 convention</h2>
<p>Nearly every IPv6 subnet is a <strong>/64</strong>, regardless of how many hosts it holds: that's what
SLAAC expects. Subnetting IPv6 means carving up the network bits <em>above</em> the /64, not squeezing
the host portion. There's no address-conservation pressure, so the arithmetic gymnastics of IPv4
subnetting simply don't apply.</p>

<h2>What you must remember</h2>
<ul>
  <li><code>::</code> compresses one run of zero groups, and only once.</li>
  <li><strong>fe80 = link-local</strong> (always present), 2000::/3 = global, ff02 = multicast, ::1 = loopback.</li>
  <li>No broadcast, no ARP (NDP instead), no need for NAT.</li>
  <li>SLAAC = self-configuration from a Router Advertisement. DHCPv6 = stateful server assignment.</li>
  <li>Dual stack is the preferred transition method.</li>
</ul>`,
  quiz: [
    { text: "Which IPv6 address is a link-local address?",
      choices: ["2001:db8::1", "fe80::1a2b:3c4d:5e6f:7a8b", "ff02::1", "::1"], answer: 1,
      expl: "Link-local addresses use the fe80::/10 prefix and are automatically configured on every IPv6 interface. ff02::1 is multicast, ::1 is loopback, and 2001:db8:: is documentation/global space." },
    { text: "How many times may the '::' compression be used in a single IPv6 address?",
      choices: ["Once", "Twice", "As many times as needed", "It cannot be used"], answer: 0,
      expl: "Using :: more than once would make the address ambiguous. There would be no way to know how many zero groups belong in each gap." },
    { text: "Which protocol replaces ARP in IPv6?",
      choices: ["ICMPv4", "NDP (Neighbor Discovery Protocol)", "DHCPv6", "RARP"], answer: 1,
      expl: "NDP uses ICMPv6 Neighbor Solicitation and Neighbor Advertisement messages to resolve link-layer addresses, replacing ARP entirely." },
    { text: "A host obtains a valid IPv6 address on a network with no DHCP server. Which mechanism did it use?",
      choices: ["SLAAC", "DHCPv6", "APIPA", "NAT64"], answer: 0,
      expl: "SLAAC lets a host build its own address from the prefix advertised in a Router Advertisement, requiring no server at all." },
    { text: "Which two statements about IPv6 are correct? (Select TWO.)",
      choices: [
        "IPv6 has no broadcast traffic type",
        "IPv6 requires NAT for internet access",
        "Multicast replaces the role broadcast played in IPv4",
        "IPv6 addresses are 64 bits long",
        "IPv6 still uses ARP for address resolution"],
      answer: [0, 2],
      expl: "IPv6 eliminated broadcast in favor of multicast. Addresses are 128 bits, ARP is replaced by NDP, and the vast address space removes the need for NAT." },
    { text: "Which IPv6 transition technique runs both protocols simultaneously on the same interfaces and is generally preferred?",
      choices: ["Tunneling", "Dual stack", "NAT64", "Teredo"], answer: 1,
      expl: "Dual stack runs IPv4 and IPv6 natively side by side, avoiding the overhead and complexity of tunneling or translation." },
    { text: "What is the compressed form of 2001:0db8:0000:0000:0000:0000:0000:0001?",
      choices: ["2001:db8::1", "2001:db8:0::0:1", "2001::db8::1", "2001:0db8:1"], answer: 0,
      expl: "Drop leading zeros in each group, then replace the single longest run of zero groups with ::, giving 2001:db8::1." }
  ]
},

/* ================= MODULE 8 ================= */
{
  id: "m2_4", title: "Ports, Protocols, and Core Services", minutes: 16, level: "core",
  content: `
<p>If IP addresses get data to the right <em>machine</em>, port numbers get it to the right
<em>application</em> on that machine. Your PC can hold a hundred conversations at once because each
one has a different port pairing.</p>

<h2>TCP vs UDP: pick the right tool</h2>
<table>
  <tr><th></th><th>TCP</th><th>UDP</th></tr>
  <tr><td>Connection</td><td>Connection-oriented (3-way handshake)</td><td>Connectionless, just send</td></tr>
  <tr><td>Reliability</td><td>Acknowledgments, retransmission, ordering</td><td>None. Fire and forget.</td></tr>
  <tr><td>Overhead</td><td>Higher</td><td>Minimal</td></tr>
  <tr><td>Use for</td><td>Web, email, file transfer (anything where correctness matters</td><td>Voice, video, DNS lookups, gaming) anything where <em>speed</em> beats perfection</td></tr>
</table>
<p>The TCP <strong>three-way handshake</strong>: <code>SYN → SYN-ACK → ACK</code>. Know it by name.</p>
<div class="keybox"><strong>Why VoIP uses UDP:</strong> if a voice packet is lost, retransmitting it is
pointless, by the time it arrives, that moment of speech has passed. A tiny gap is better than a delay.
That's the whole logic behind choosing UDP.</div>

<h2>The ports table: memorize this</h2>
<table>
  <tr><th>Port</th><th>Protocol</th><th>Purpose</th></tr>
  <tr><td>20 / 21</td><td>FTP (TCP)</td><td>File transfer (20 = data, 21 = control). Insecure.</td></tr>
  <tr><td><strong>22</strong></td><td><strong>SSH / SFTP / SCP</strong></td><td>Secure remote CLI and file transfer</td></tr>
  <tr><td>23</td><td>Telnet</td><td>Remote CLI in <em>clear text</em>. Never use it.</td></tr>
  <tr><td>25</td><td>SMTP</td><td>Sending mail between servers</td></tr>
  <tr><td><strong>53</strong></td><td><strong>DNS</strong></td><td>UDP for queries; TCP for zone transfers</td></tr>
  <tr><td>67 / 68</td><td>DHCP (UDP)</td><td>67 = server, 68 = client</td></tr>
  <tr><td>69</td><td>TFTP (UDP)</td><td>Trivial file transfer: firmware, configs. No authentication.</td></tr>
  <tr><td>80</td><td>HTTP</td><td>Web, unencrypted</td></tr>
  <tr><td>110</td><td>POP3</td><td>Mail retrieval: downloads and typically deletes</td></tr>
  <tr><td>123</td><td>NTP (UDP)</td><td>Time sync</td></tr>
  <tr><td>143</td><td>IMAP</td><td>Mail retrieval: syncs folders across devices</td></tr>
  <tr><td>161 / 162</td><td>SNMP (UDP)</td><td>Monitoring; 162 = traps</td></tr>
  <tr><td>389 / 636</td><td>LDAP / LDAPS</td><td>Directory services; 636 is TLS-protected</td></tr>
  <tr><td><strong>443</strong></td><td><strong>HTTPS</strong></td><td>Web over TLS</td></tr>
  <tr><td>445</td><td>SMB</td><td>Windows file and print sharing</td></tr>
  <tr><td>514</td><td>Syslog (UDP)</td><td>Centralized logging</td></tr>
  <tr><td>587</td><td>SMTP submission</td><td>Authenticated mail submission with TLS</td></tr>
  <tr><td>3389</td><td>RDP</td><td>Remote Desktop</td></tr>
  <tr><td>5060 / 5061</td><td>SIP</td><td>VoIP call setup (5061 = TLS)</td></tr>
</table>
<div class="exambox"><strong>Secure-variant pairs</strong> are a favorite: HTTP 80 → HTTPS 443,
LDAP 389 → LDAPS 636, Telnet 23 → SSH 22, FTP 21 → SFTP 22.</div>

<h2>DNS: how a name becomes an address</h2>
<p>Your PC asks its configured resolver. If the resolver doesn't know, it walks the hierarchy: root →
top-level domain (.com) → the domain's authoritative name server. The answer is cached along the way for
its <strong>TTL</strong>.</p>
<table>
  <tr><th>Record</th><th>Maps</th></tr>
  <tr><td><strong>A</strong></td><td>Hostname → IPv4 address</td></tr>
  <tr><td><strong>AAAA</strong></td><td>Hostname → IPv6 address</td></tr>
  <tr><td><strong>CNAME</strong></td><td>An alias → another name</td></tr>
  <tr><td><strong>MX</strong></td><td>Domain → its mail server</td></tr>
  <tr><td><strong>PTR</strong></td><td>IP → name (reverse lookup)</td></tr>
  <tr><td><strong>TXT</strong></td><td>Free text: SPF, DKIM, domain verification</td></tr>
  <tr><td><strong>NS</strong></td><td>Which name servers are authoritative for the zone</td></tr>
</table>

<h2>DHCP: the four-step dance</h2>
<p><strong>DORA</strong>: <strong>D</strong>iscover (client broadcasts) → <strong>O</strong>ffer (server
proposes an address) → <strong>R</strong>equest (client accepts) → <strong>A</strong>cknowledge (server
confirms).</p>
<p>Key terms: <strong>scope</strong> (the pool of assignable addresses), <strong>reservation</strong>
(a fixed address for a specific MAC), <strong>exclusion</strong> (addresses removed from the pool),
<strong>lease</strong> (how long the assignment lasts).</p>
<div class="warnbox"><strong>The relay agent problem.</strong> DHCP Discover is a <em>broadcast</em>, and
routers don't forward broadcasts. So a DHCP server on a different subnet never hears it. The fix is a
<strong>DHCP relay agent</strong> (configured on the router as an <code>ip helper-address</code>) which
converts the broadcast into a unicast toward the server. <em>A new VLAN where nobody gets an IP address
is almost always a missing helper address.</em></div>

<h2>NAT and PAT</h2>
<ul>
  <li><strong>Static NAT</strong>, one private IP maps to one public IP (for a server you want reachable).</li>
  <li><strong>PAT / NAT overload</strong>: many private IPs share one public IP, distinguished by source port. This is what your home router does, and how the internet survived IPv4 exhaustion.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li>TCP = reliable and ordered. UDP = fast and lossy. Handshake: SYN, SYN-ACK, ACK.</li>
  <li>The ports table. It is free marks: study it until recall is instant.</li>
  <li>A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, PTR = reverse.</li>
  <li><strong>DORA</strong>, and <em>DHCP across subnets needs a relay/helper</em>.</li>
</ul>`,
  quiz: [
    { text: "Which port does HTTPS use by default?",
      choices: ["80", "443", "8080", "22"], answer: 1,
      expl: "HTTPS is HTTP over TLS on TCP port 443. Port 80 is unencrypted HTTP." },
    { text: "What are the four steps of the DHCP process, in order?",
      choices: [
        "Discover, Offer, Request, Acknowledge",
        "Request, Offer, Discover, Accept",
        "Offer, Discover, Acknowledge, Request",
        "Discover, Request, Offer, Accept"],
      answer: 0,
      expl: "DORA: Discover (client broadcast), Offer (server proposes), Request (client accepts), Acknowledge (server confirms)." },
    { text: "Clients on a newly created VLAN receive no IP addresses, while all other VLANs work. What is the MOST likely cause?",
      choices: [
        "A missing DHCP relay agent (ip helper-address) on the VLAN's gateway",
        "The DNS server is offline",
        "The switch firmware is out of date",
        "The DHCP lease time is too long"],
      answer: 0,
      expl: "DHCP Discover is a broadcast that routers do not forward. Without a relay agent pointing to the DHCP server, clients on the new VLAN never reach it and fall back to APIPA." },
    { text: "Which DNS record type maps a hostname to an IPv6 address?",
      choices: ["A", "AAAA", "CNAME", "MX"], answer: 1,
      expl: "AAAA records hold IPv6 addresses; A records hold IPv4. CNAME creates an alias and MX identifies mail servers." },
    { text: "Which two protocols would you choose UDP for, and why? (Select TWO.)",
      choices: [
        "VoIP, because retransmitting late audio is useless",
        "File transfer, because ordering is critical",
        "DNS queries, because they are small and fast",
        "Email delivery, because messages must not be lost",
        "SSH, because sessions must be reliable"],
      answer: [0, 2],
      expl: "UDP suits latency-sensitive or lightweight exchanges like voice and DNS lookups. File transfer, email, and SSH all need TCP's reliability and ordering." },
    { text: "Which port must be open for secure LDAP (LDAPS)?",
      choices: ["389", "636", "443", "445"], answer: 1,
      expl: "LDAPS uses TCP 636. Plain LDAP uses 389, one of several 'secure variant' pairs worth memorizing." },
    { text: "What is PAT (NAT overload) used for?",
      choices: [
        "Allowing many private hosts to share one public IP, distinguished by source port",
        "Encrypting traffic between two sites",
        "Assigning IP addresses to clients",
        "Resolving names to addresses"],
      answer: 0,
      expl: "PAT maps many internal addresses to a single public address, tracking each session by port number. This is standard behavior on home and small-office routers." },
    { text: "Which sequence describes the TCP three-way handshake?",
      choices: ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "SYN, ACK, FIN", "DISCOVER, OFFER, REQUEST"], answer: 0,
      expl: "The client sends SYN, the server replies SYN-ACK, and the client confirms with ACK, establishing the connection." }
  ]
}
    ],

/* ================= CHECKPOINT 2 (cumulative) ================= */
    checkpoint: {
      id: "cp2", title: "Addressing and Protocols", n: 18,
      questions: [
        { text: "What is the block size of a /28 subnet?",
          choices: ["8", "16", "32", "64"], answer: 1,
          expl: "Mask octet 240 → 256 − 240 = 16. Subnets start at .0, .16, .32, and so on." },
        { text: "A host is 192.168.50.130/26. What is its broadcast address?",
          choices: ["192.168.50.127", "192.168.50.159", "192.168.50.191", "192.168.50.255"], answer: 2,
          expl: "/26 has a block size of 64: blocks are 128 and 192. The address .130 sits in the .128 block, so the broadcast is 192.168.50.191." },
        { text: "How many usable hosts does a /29 provide?",
          choices: ["2", "6", "14", "30"], answer: 1,
          expl: "/29 leaves 3 host bits: 2³ − 2 = 6 usable addresses." },
        { text: "Which address indicates that DHCP failed?",
          choices: ["10.0.0.5", "127.0.0.1", "169.254.7.9", "192.168.1.1"], answer: 2,
          expl: "169.254.0.0/16 is APIPA, self-assigned when no DHCP server responds." },
        { text: "Which port is used by SSH?",
          choices: ["21", "22", "23", "25"], answer: 1,
          expl: "SSH uses TCP 22. Telnet (23) is its insecure clear-text predecessor." },
        { text: "Which two are true of TCP but NOT of UDP? (Select TWO.)",
          choices: [
            "It performs a three-way handshake",
            "It is connectionless",
            "It retransmits lost segments",
            "It has minimal overhead",
            "It does not guarantee ordering"],
          answer: [0, 2],
          expl: "TCP is connection-oriented with a handshake and retransmission of lost data. UDP is connectionless, lightweight, and makes no delivery guarantees." },
        { text: "Which IPv6 prefix identifies a link-local address?",
          choices: ["2000::/3", "fe80::/10", "ff00::/8", "fc00::/7"], answer: 1,
          expl: "fe80::/10 is link-local, automatically configured on every IPv6 interface and never routed." },
        { text: "A department requires 25 usable hosts. Which prefix is the smallest that fits?",
          choices: ["/26", "/27", "/28", "/29"], answer: 1,
          expl: "/27 provides 2⁵ − 2 = 30 usable hosts, covering 25. A /28 gives only 14, which is too few." },
        { text: "Which record type would you check if email for a domain is being delivered to the wrong server?",
          choices: ["A", "MX", "CNAME", "PTR"], answer: 1,
          expl: "MX records identify a domain's mail servers and their priority. Misconfigured MX records send mail to the wrong destination." },
        { text: "Which two OSI layers do MAC addresses and IP addresses operate at, respectively? (Select TWO.)",
          choices: [
            "MAC addresses: Layer 2",
            "MAC addresses: Layer 3",
            "IP addresses: Layer 3",
            "IP addresses: Layer 4",
            "MAC addresses: Layer 1"],
          answer: [0, 2],
          expl: "MAC addressing is Layer 2 (Data Link); IP addressing is Layer 3 (Network)." },
        { text: "Which prefix is standard for a point-to-point router link?",
          choices: ["/24", "/29", "/30", "/32"], answer: 2,
          expl: "A /30 provides exactly two usable addresses (one for each router) with no wasted space." },
        { text: "A host obtains an IPv6 address using only a Router Advertisement, with no server involved. What is this called?",
          choices: ["DHCPv6", "SLAAC", "APIPA", "NDP relay"], answer: 1,
          expl: "SLAAC (Stateless Address Autoconfiguration) builds the address from the advertised prefix plus a self-generated interface ID." },
        { text: "Which port does Syslog use by default?",
          choices: ["161", "162", "514", "520"], answer: 2,
          expl: "Syslog listens on UDP 514. SNMP uses 161, and SNMP traps use 162." },
        { text: "Which cable category is required for 10 Gbps over copper at 100 meters?",
          choices: ["Cat 5e", "Cat 6", "Cat 6a", "Cat 3"], answer: 2,
          expl: "Cat 6a is rated for 10 Gbps at the full 100 m channel; Cat 6 only reaches 10 Gbps at roughly 55 m." },
        { text: "Which OSI layer's data unit is the frame?",
          choices: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], answer: 1,
          expl: "Layer 2 (Data Link) works with frames. Packets are Layer 3 and segments are Layer 4." },
        { text: "Which two statements about DHCP reservations are true? (Select TWO.)",
          choices: [
            "They bind a specific IP to a device's MAC address",
            "They prevent a device from using DHCP at all",
            "They are managed centrally on the DHCP server",
            "They increase the device's throughput",
            "They eliminate the need for a subnet mask"],
          answer: [0, 2],
          expl: "A reservation always issues the same address to a given MAC while keeping the configuration centralized on the server, safer than manual static assignment." },
        { text: "What is 172.16.94.200/22's network address?",
          choices: ["172.16.92.0", "172.16.94.0", "172.16.88.0", "172.16.96.0"], answer: 0,
          expl: "/22 gives a third-octet block size of 4: blocks are 88, 92, 96. Third octet 94 falls in the 92 block, so the network is 172.16.92.0." },
        { text: "Which protocol synchronizes device clocks, and on which port?",
          choices: ["NTP (UDP 123", "SNMP) UDP 161", "SMTP (TCP 25", "DNS) UDP 53"], answer: 0,
          expl: "NTP runs on UDP 123. Accurate time is essential for log correlation, certificate validation, and Kerberos authentication." },
        { text: "A packet must cross three routers to reach its destination. What happens to the source and destination MAC addresses along the way?",
          choices: [
            "They stay the same end to end",
            "They are rewritten at every hop",
            "They are removed after the first hop",
            "Only the source MAC changes"],
          answer: 1,
          expl: "MAC addressing is hop-by-hop: each router rewrites both MAC addresses for the next link. The IP addresses remain unchanged end to end." },
        { text: "Which two addresses cannot be assigned to a host in a subnet? (Select TWO.)",
          choices: [
            "The network address (all host bits 0)",
            "The first usable address",
            "The broadcast address (all host bits 1)",
            "The default gateway address",
            "The last usable address"],
          answer: [0, 2],
          expl: "The all-zeros host address names the network, and the all-ones host address is the broadcast. That's why usable hosts equal 2^h − 2." }
      ]
    }
  });
})();
