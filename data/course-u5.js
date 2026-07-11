/* Network+ Study Course - Unit 5: Troubleshooting & Exam Readiness */
(function () {
  const C = window.NETCOURSE = window.NETCOURSE || { units: [] };

  C.units.push({
    id: "u5",
    title: "Unit 5: Troubleshooting and Exam Readiness",
    blurb: "The largest domain on the exam, and the real job. Methodology, tools, the symptom-to-cause map, and how to attack PBQs on test day.",
    modules: [

/* ================= MODULE 17 ================= */
{
  id: "m5_1", title: "The Methodology and the Toolkit", minutes: 14, level: "core",
  content: `
<p>Troubleshooting is 24% of the exam: the single biggest domain. CompTIA tests a specific
seven-step methodology, and it will ask you to name the next step. Memorize the order verbatim.</p>

<h2>The seven steps</h2>
<ol>
  <li><strong>Identify the problem.</strong> Gather information, question users, determine what changed, duplicate the problem if possible, and (critically) establish the <em>scope</em>.</li>
  <li><strong>Establish a theory of probable cause.</strong> Question the obvious. Consider multiple approaches (top-down, bottom-up, divide and conquer).</li>
  <li><strong>Test the theory to determine the cause.</strong> If confirmed → move on. <strong>If NOT confirmed → establish a new theory or escalate.</strong> You never proceed on a disproven theory.</li>
  <li><strong>Establish a plan of action</strong> and identify potential effects.</li>
  <li><strong>Implement the solution</strong> or escalate as necessary.</li>
  <li><strong>Verify full system functionality</strong> and, if applicable, implement preventive measures.</li>
  <li><strong>Document</strong> findings, actions, and outcomes.</li>
</ol>
<div class="exambox"><strong>Two guaranteed questions:</strong> (1) "What is the first step?" → Identify the
problem. (2) "The test disproved the theory. What now?" → Establish a <em>new</em> theory or escalate.
Not "implement a fix anyway."</div>

<h2>Scope is your most powerful first question</h2>
<p>Before touching anything, ask: <em>how many people are affected?</em></p>
<ul>
  <li><strong>One user</strong> → the problem is on their host, their port, or their cable.</li>
  <li><strong>One floor / one VLAN</strong> → a switch, an uplink, or a VLAN configuration.</li>
  <li><strong>Everyone</strong> → the core, the router, DHCP/DNS, or the ISP.</li>
</ul>
<p>And always compare against a <strong>working peer on the same segment</strong>. If their neighbor works
fine, you have just exonerated the switch, the VLAN, the gateway, DHCP, DNS, and the ISP in one move.</p>

<h2>Software tools</h2>
<table>
  <tr><th>Command</th><th>Use it to</th></tr>
  <tr><td><code>ping</code></td><td>Test Layer 3 reachability and measure round-trip time. Sequence: loopback → own IP → gateway → external IP → external name.</td></tr>
  <tr><td><code>tracert</code> / <code>traceroute</code></td><td>Reveal every hop and locate <em>where</em> the path breaks</td></tr>
  <tr><td><code>ipconfig</code> / <code>ifconfig</code> / <code>ip addr</code></td><td>Show IP, mask, gateway; <code>/all</code> adds DNS, DHCP server, and MAC</td></tr>
  <tr><td><code>nslookup</code> / <code>dig</code></td><td>Query DNS directly, and against a <em>specific</em> server</td></tr>
  <tr><td><code>netstat</code> / <code>ss</code></td><td>Show listening ports and active connections: proves a service is actually up</td></tr>
  <tr><td><code>arp -a</code> / <code>arp -d</code></td><td>View or clear the IP-to-MAC cache</td></tr>
  <tr><td><code>route print</code> / <code>ip route</code></td><td>Show the host's routing table (a stray static route explains "only this PC fails")</td></tr>
  <tr><td><code>pathping</code> / <code>mtr</code></td><td>Traceroute + per-hop packet loss statistics. The fastest way to prove the loss is the ISP's.</td></tr>
  <tr><td>Protocol analyzer (Wireshark)</td><td>Capture and decode packets. Feed it from a SPAN port or TAP.</td></tr>
</table>
<div class="keybox"><strong>Read command output for what SUCCEEDED.</strong> If <code>ping 8.8.8.8</code>
works but <code>ping www.example.com</code> fails, you've proven Layers 1–3 and routing are fine. It's DNS.
Success narrows the search as powerfully as failure does.</div>

<h2>Hardware tools</h2>
<table>
  <tr><th>Tool</th><th>Job</th></tr>
  <tr><td><strong>Cable tester</strong></td><td>Wiremap: opens, shorts, reversed pairs, split pairs</td></tr>
  <tr><td><strong>Tone generator and probe</strong></td><td>Find which jack a cable terminates at ("toning out" a run)</td></tr>
  <tr><td><strong>TDR</strong> / <strong>OTDR</strong></td><td>Distance to a fault: copper (TDR) or fiber (OTDR)</td></tr>
  <tr><td><strong>Light meter / OPM</strong></td><td>Measure optical power on a fiber link</td></tr>
  <tr><td><strong>Spectrum analyzer</strong></td><td>Find RF interference sources in wireless</td></tr>
  <tr><td><strong>Punch-down tool</strong></td><td>Terminate wires into a patch panel or keystone jack</td></tr>
  <tr><td><strong>Loopback plug</strong></td><td>Test whether a port itself works</td></tr>
</table>

<h2>What you must remember</h2>
<ul>
  <li>The seven steps, in order. Disproven theory → <em>new theory or escalate</em>, never "fix it anyway."</li>
  <li>Establish scope first; compare against a working peer.</li>
  <li>Toner = find the cable. Cable tester = wiring faults. TDR/OTDR = distance to fault. Spectrum analyzer = RF interference.</li>
  <li>What works tells you as much as what fails.</li>
</ul>`,
  quiz: [
    { text: "What is the FIRST step of the CompTIA troubleshooting methodology?",
      choices: ["Establish a theory", "Identify the problem", "Implement the solution", "Document findings"], answer: 1,
      expl: "Identify the problem: gather information, question users, determine what changed, and establish scope before theorizing." },
    { text: "A technician tests a theory and the test disproves it. What is the correct NEXT step?",
      choices: [
        "Implement a fix anyway",
        "Establish a new theory or escalate",
        "Document findings and close the ticket",
        "Verify full system functionality"],
      answer: 1,
      expl: "A disproven theory sends you back to step 2. Proceeding to a plan of action on a theory you have just disproven is exactly what the methodology forbids." },
    { text: "Which tool shows per-hop packet loss along a path, combining traceroute with statistics?",
      choices: ["ping", "pathping / mtr", "arp", "netstat"], answer: 1,
      expl: "pathping (Windows) and mtr (Linux) run repeated probes to every hop, revealing which hop introduces loss, ideal for proving the fault lies upstream." },
    { text: "Which tool locates the specific wall jack that a cable in the wiring closet terminates at?",
      choices: ["Tone generator and probe", "Protocol analyzer", "Spectrum analyzer", "Loopback plug"], answer: 0,
      expl: "The toner injects a signal onto the cable and the probe detects it at the far end. A protocol analyzer inspects traffic, not physical cable paths." },
    { text: "A fiber link is up but showing errors, and you need to find the distance to a bad splice. Which tool is appropriate?",
      choices: ["OTDR", "TDR", "Toner probe", "Punch-down tool"], answer: 0,
      expl: "An OTDR measures reflections along a fiber to locate breaks, bends, and splice loss at a specific distance. The copper equivalent is a TDR." },
    { text: "A user reports 'the internet is down.' What is the MOST valuable first question?",
      choices: [
        "How many other users are affected?",
        "What brand is your monitor?",
        "Have you tried a new cable?",
        "What is your password?"],
      answer: 0,
      expl: "Scope localizes the fault instantly: one user points to the host or port, a floor points to a switch, everyone points to the core, DHCP/DNS, or the ISP." },
    { text: "Which two commands would help determine whether a service is actually listening on a server? (Select TWO.)",
      choices: [
        "netstat",
        "ping",
        "ss",
        "arp -a",
        "hostname"],
      answer: [0, 2],
      expl: "netstat and ss list listening sockets and active connections, proving whether the service is up. Ping only proves the host responds at Layer 3." },
    { text: "Which troubleshooting approach starts in the middle of the OSI stack, typically with a ping?",
      choices: ["Bottom-up", "Top-down", "Divide and conquer", "Escalation"], answer: 2,
      expl: "Divide and conquer starts at Layer 3 and moves up or down depending on the result, halving the search space with one test." }
  ]
},

/* ================= MODULE 18 ================= */
{
  id: "m5_2", title: "Symptom-to-Cause: The Diagnostic Map", minutes: 16, level: "advanced",
  content: `
<p>This module is the highest-yield page in the course. Learn these symptom→cause pairs and you can
answer most Domain 5 questions on sight.</p>

<h2>Physical layer symptoms</h2>
<table>
  <tr><th>Symptom</th><th>Cause</th></tr>
  <tr><td>No link light at all</td><td>Layer 1: unplugged/broken cable, dead port, port administratively shut down, device powered off</td></tr>
  <tr><td><strong>CRC / FCS errors</strong></td><td>Corrupted frames → bad cable, bad connector, EMI, failing transceiver</td></tr>
  <tr><td><strong>Late collisions</strong></td><td><strong>Duplex mismatch.</strong> They cannot occur on a correctly negotiated full-duplex link.</td></tr>
  <tr><td>Gigabit link negotiates at 100 Mbps</td><td>A damaged pair: 1000BASE-T needs all four; 100BASE-TX needs only two. Or a hard-coded speed setting.</td></tr>
  <tr><td>Intermittent errors on a long run</td><td>Exceeds the 100 m limit → attenuation</td></tr>
  <tr><td>Fiber link won't come up despite good connectors</td><td>Wavelength/optic mismatch (850 nm vs 1310 nm), or TX/RX reversed, or dirty ends</td></tr>
</table>

<h2>Interface states (memorize this table)</h2>
<table>
  <tr><th>State</th><th>Meaning</th></tr>
  <tr><td><code>up / up</code></td><td>Healthy</td></tr>
  <tr><td><code>up / down</code></td><td>Physical OK, <strong>Layer 2 problem</strong>: encapsulation mismatch, keepalive failure, clocking</td></tr>
  <tr><td><code>down / down</code></td><td><strong>Layer 1</strong>: cable, transceiver, or the far end is off</td></tr>
  <tr><td><code>administratively down</code></td><td>Someone disabled the port. <code>no shutdown</code> fixes it.</td></tr>
</table>

<h2>Addressing and DHCP symptoms</h2>
<table>
  <tr><th>Symptom</th><th>Cause</th></tr>
  <tr><td><strong>169.254.x.x address</strong></td><td><strong>DHCP failed.</strong> Server down, missing relay/helper on that VLAN, port on the wrong VLAN, or a Layer 1 fault.</td></tr>
  <tr><td>New VLAN gets no addresses, others fine</td><td><strong>Missing DHCP relay (ip helper-address)</strong>: the #1 cause, every time</td></tr>
  <tr><td>Duplicate IP address warnings</td><td>A static IP assigned inside the DHCP pool. Fix with reservations or exclusions.</td></tr>
  <tr><td>Wrong gateway/DNS handed out to some users</td><td><strong>Rogue DHCP server.</strong> Confirm with <code>ipconfig /all</code>; mitigate with DHCP snooping.</td></tr>
  <tr><td>Can reach local hosts, nothing off-subnet</td><td>Missing or wrong <strong>default gateway</strong></td></tr>
  <tr><td>Selective failures to hosts on the same LAN</td><td>Wrong <strong>subnet mask</strong>: the host misjudges what's local</td></tr>
</table>

<h2>Name resolution and services</h2>
<table>
  <tr><th>Symptom</th><th>Cause</th></tr>
  <tr><td>Ping by IP works, ping by name fails</td><td><strong>DNS</strong>: wrong/unreachable resolver, or bad record</td></tr>
  <tr><td>Correct URL, but the wrong site appears</td><td>DNS poisoning, or a modified hosts file</td></tr>
  <tr><td>Ping succeeds but the app won't connect on its port</td><td>Service not listening, or a firewall/ACL blocking that port. Verify with <code>netstat</code>.</td></tr>
  <tr><td>Certificate warnings</td><td>Expired cert, name mismatch, untrusted CA, or an actual on-path attack. Never train users to click through.</td></tr>
</table>

<h2>Switching and routing symptoms</h2>
<table>
  <tr><th>Symptom</th><th>Cause</th></tr>
  <tr><td><strong>MAC flapping</strong> + broadcast storm + CPU spike</td><td><strong>A switching loop.</strong> Someone bridged two jacks; STP disabled or bypassed. Classic.</td></tr>
  <tr><td>Half a VLAN's users lose connectivity after a change</td><td>The VLAN isn't in the trunk's <strong>allowed VLAN list</strong> (the command overwrites, it doesn't append)</td></tr>
  <tr><td>Config works, then reverts after reboot</td><td>Running config was never saved to startup config</td></tr>
  <tr><td>Traffic takes a slow backup path</td><td>Route selection: wrong <strong>administrative distance</strong> or metric (a stale static route)</td></tr>
  <tr><td>Asymmetric routing / intermittent app failures</td><td>Traffic leaves one path, returns another: stateful firewalls drop the reply</td></tr>
</table>

<h2>Wireless symptoms</h2>
<table>
  <tr><th>Symptom</th><th>Cause</th></tr>
  <tr><td>Slow/dropping only far from the AP</td><td>Weak signal → attenuation. More APs, better placement.</td></tr>
  <tr><td><strong>Strong signal but terrible throughput</strong></td><td><strong>Interference</strong> (noise floor up, SNR down). Use a spectrum analyzer.</td></tr>
  <tr><td>Slow when many users are on one AP</td><td>Capacity/airtime contention, not coverage. Add APs, use band steering.</td></tr>
  <tr><td>Clients cling to a distant AP</td><td>Sticky clients: transmit power set too high</td></tr>
  <tr><td>Users randomly disconnected</td><td>Deauthentication attack, or channel/DFS radar event</td></tr>
</table>

<h2>Performance symptoms</h2>
<ul>
  <li><strong>Link saturated at a predictable time daily</strong> → find the top talkers with flow data before buying bandwidth. It's usually backups or updates.</li>
  <li><strong>No loss, low utilization, but poor single-flow throughput over a long link</strong> → TCP window size vs. the bandwidth-delay product. Window scaling or WAN acceleration.</li>
  <li><strong>Voice quality poor, link lightly loaded</strong> → jitter and latency, not bandwidth. Apply QoS.</li>
</ul>

<h2>What you must remember</h2>
<ul>
  <li><strong>Late collisions = duplex mismatch. CRC errors = physical/cable. 169.254 = DHCP failed.</strong></li>
  <li><strong>MAC flapping = switching loop.</strong> "Worked until reboot" = unsaved config.</li>
  <li>Strong signal + bad throughput = interference. Distance-related = coverage.</li>
  <li><code>up/down</code> = Layer 2. <code>down/down</code> = Layer 1.</li>
</ul>`,
  quiz: [
    { text: "An interface shows a high number of late collisions and poor throughput. What is the MOST likely cause?",
      choices: ["Duplex mismatch", "DHCP exhaustion", "Wrong DNS server", "Missing default gateway"], answer: 0,
      expl: "Late collisions cannot occur on a properly negotiated full-duplex link. They are the signature symptom of a duplex mismatch." },
    { text: "A router interface reports 'up / line protocol is down'. What does this indicate?",
      choices: [
        "The cable is unplugged",
        "A Layer 2 problem such as an encapsulation or keepalive mismatch",
        "The port is administratively shut down",
        "Routing has converged"],
      answer: 1,
      expl: "Up/down means the physical layer is fine but the data link layer is not. Down/down would indicate a Layer 1 fault; a disabled port shows administratively down." },
    { text: "Clients on a newly created VLAN receive no IP address while all other VLANs work fine. What is the MOST likely cause?",
      choices: [
        "A missing DHCP relay / ip helper-address on that VLAN",
        "The DNS server is offline",
        "The switch firmware is outdated",
        "The core router's clock is wrong"],
      answer: 0,
      expl: "DHCP Discover is a broadcast that routers do not forward. A new VLAN without a helper address never reaches the DHCP server." },
    { text: "After an unmanaged switch is connected to two wall jacks in the same room, the whole floor loses connectivity and switch CPU spikes. What happened?",
      choices: [
        "A switching loop caused a broadcast storm",
        "The DHCP server crashed",
        "DNS cache was poisoned",
        "The uplink SFP failed"],
      answer: 0,
      expl: "Bridging two jacks in the same VLAN creates a Layer 2 loop. With no TTL on frames, broadcasts circulate endlessly, saturating links and CPUs." },
    { text: "Wireless users report poor throughput despite an excellent signal strength reading. What is the MOST likely cause?",
      choices: [
        "RF interference raising the noise floor and lowering SNR",
        "Attenuation from distance",
        "An incorrect subnet mask",
        "A duplex mismatch"],
      answer: 0,
      expl: "Strong signal with poor performance is the classic interference fingerprint. Signal-to-noise ratio matters more than raw signal strength." },
    { text: "A switch's VLAN configuration reverts to defaults after a reboot. What is the cause?",
      choices: [
        "The running configuration was never saved to the startup configuration",
        "The switch has a duplex mismatch",
        "DNS is misconfigured",
        "The PoE budget was exceeded"],
      answer: 0,
      expl: "Changes exist only in the running config until saved. On reboot, the device loads the startup config from NVRAM, which never received the changes." },
    { text: "Which two symptoms point to a physical cabling problem? (Select TWO.)",
      choices: [
        "Increasing CRC/FCS errors on an interface",
        "A 169.254.x.x address on the host",
        "A gigabit-capable link negotiating at only 100 Mbps",
        "Ping by IP works but names fail to resolve",
        "The default gateway is unreachable from every VLAN"],
      answer: [0, 2],
      expl: "CRC errors indicate corrupted frames from a damaged cable or connector, and a gigabit link dropping to 100 Mbps suggests a damaged pair, 1000BASE-T needs all four pairs." },
    { text: "After a change window, only the users behind one remote switch lose access to a VLAN, while local users on that VLAN work. What should you check?",
      choices: [
        "The trunk's allowed VLAN list on the uplink",
        "The DNS forwarders",
        "The UPS battery level",
        "The wireless channel plan"],
      answer: 0,
      expl: "If the VLAN was removed from the trunk's allowed list, it cannot cross the uplink, so local ports still work while the remote switch's users are cut off." }
  ]
},

/* ================= MODULE 19 ================= */
{
  id: "m5_3", title: "Command Output Analysis", minutes: 13, level: "advanced",
  content: `
<p>The exam shows you output and asks what's wrong. This is a learnable skill: read what
<em>succeeded</em>, read what <em>failed</em>, and let the gap between them name the fault.</p>

<h2>Case 1: the APIPA address</h2>
<div class="terminal">C:\\> ipconfig
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 169.254.88.14
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :</div>
<p><strong>Read it:</strong> 169.254 = APIPA, mask 255.255.0.0, <em>no gateway at all</em>.
<strong>Conclusion:</strong> DHCP failed. Now find out why: is the port on the right VLAN? Is the
helper address configured? Is the link even up? Compare against a working neighbor.</p>

<h2>Case 2: DNS versus connectivity</h2>
<div class="terminal">C:\\> ping 8.8.8.8
Reply from 8.8.8.8: bytes=32 time=14ms TTL=115

C:\\> ping www.example.com
Ping request could not find host www.example.com.</div>
<p><strong>Read it:</strong> pinging a public IP works, so the NIC, gateway, routing, NAT, and the ISP are all
fine. Only name resolution fails. <strong>Conclusion:</strong> DNS. Check the configured resolver with
<code>ipconfig /all</code> and query it directly with <code>nslookup</code>.</p>

<h2>Case 3: where the path dies</h2>
<div class="terminal">C:\\> tracert 203.0.113.50
  1    1 ms   192.168.1.1
  2    9 ms   10.20.0.1
  3    *      *      *      Request timed out.
  4    *      *      *      Request timed out.
  5    *      *      *      Request timed out.</div>
<p><strong>Read it:</strong> the first two hops answer; everything past hop 2 is silent.
<strong>Conclusion:</strong> the break is at or just beyond hop 2: likely the WAN link or the provider's edge.</p>
<div class="warnbox"><strong>But be careful:</strong> a single hop showing <code>* * *</code> while later hops
respond normally is <em>not</em> a fault. That router simply doesn't reply to ICMP. Only sustained timeouts
<em>through to the destination</em> indicate a real break.</div>

<h2>Case 4: the service isn't listening</h2>
<div class="terminal">C:\\> ping 10.10.5.20
Reply from 10.10.5.20: bytes=32 time=1ms TTL=128

C:\\> telnet 10.10.5.20 443
Connecting To 10.10.5.20...Could not open connection to the host, on port 443: Connect failed</div>
<p><strong>Read it:</strong> the host is alive at Layer 3, but nothing accepts a connection on 443.
<strong>Conclusion:</strong> either the service isn't running (check with <code>netstat -an</code> on the server)
or a firewall/ACL is blocking the port. This is <em>not</em> a network reachability problem.</p>

<h2>Case 5: interface counters</h2>
<div class="terminal">GigabitEthernet0/5 is up, line protocol is up
  Full-duplex, 1000Mb/s
  input errors 24501, CRC 24488, frame 13
  output errors 0, collisions 0</div>
<p><strong>Read it:</strong> the link is up and full-duplex (so it isn't a duplex mismatch, no late
collisions), but CRC errors are enormous. <strong>Conclusion:</strong> corrupted frames = Layer 1. Bad
cable, bad connector, EMI, or a failing transceiver. Swap the patch cable first.</p>

<h2>Case 6: the rogue DHCP server</h2>
<div class="terminal">C:\\> ipconfig /all
   IPv4 Address. . . . . . . . . . . : 192.168.88.13
   Default Gateway . . . . . . . . . : 192.168.88.1
   DHCP Server . . . . . . . . . . . : 192.168.88.99
   DNS Servers . . . . . . . . . . . : 192.168.88.99</div>
<p><strong>Read it:</strong> the client got a lease, but from <code>192.168.88.99</code>, which is not the
corporate DHCP server, and DNS points at the same unfamiliar host. <strong>Conclusion:</strong> a rogue DHCP
server (possibly an on-path attack). Mitigate with DHCP snooping.</p>

<h2>The reading method</h2>
<ol>
  <li><strong>What worked?</strong> Everything below that in the stack is now proven fine.</li>
  <li><strong>What failed?</strong> That's your layer.</li>
  <li><strong>What's suspicious in the details?</strong> An odd address, a missing gateway, an unexpected server, a huge counter.</li>
  <li><strong>What's the scope?</strong> Does a working peer behave differently?</li>
</ol>

<h2>What you must remember</h2>
<ul>
  <li>169.254 = DHCP failed. No gateway listed = no gateway.</li>
  <li>IP pings, name doesn't = DNS.</li>
  <li>Ping works, port refuses = service or firewall, not the network.</li>
  <li>CRC errors + full duplex = cable, not duplex. Late collisions = duplex.</li>
  <li>Scattered <code>* * *</code> in traceroute is normal; sustained timeouts to the end are not.</li>
</ul>`,
  quiz: [
    { text: "A host shows IPv4 address 169.254.5.10 and no default gateway. What is the problem?",
      choices: [
        "The host failed to reach a DHCP server and self-assigned an APIPA address",
        "The host has a static public IP",
        "DNS is misconfigured",
        "The host is using IPv6 only"],
      answer: 0,
      expl: "169.254.0.0/16 with no gateway is APIPA. The host could not obtain a DHCP lease and cannot communicate off its own segment." },
    { text: "Pinging 8.8.8.8 succeeds, but pinging www.example.com returns 'could not find host'. What is the fault?",
      choices: ["DNS resolution", "The default gateway", "The NIC driver", "ICMP is blocked"], answer: 0,
      expl: "Successful pings to a public IP prove connectivity and routing work. Only name resolution is failing, which is a DNS problem." },
    { text: "An interface shows: up/up, full-duplex, 1000 Mb/s, with 24,000 CRC errors and 0 collisions. What is the MOST likely cause?",
      choices: [
        "A physical problem: bad cable, connector, or transceiver",
        "A duplex mismatch",
        "An exhausted DHCP scope",
        "A missing default route"],
      answer: 0,
      expl: "Full-duplex with no collisions rules out a duplex mismatch. Large CRC counts mean corrupted frames: a Layer 1 fault such as a damaged cable or failing optic." },
    { text: "A traceroute shows hops 1 and 2 replying, then sustained timeouts all the way to the destination. What does this indicate?",
      choices: [
        "The path breaks at or beyond hop 2",
        "The destination is fine and this is normal",
        "DNS is failing",
        "The local NIC is disabled"],
      answer: 0,
      expl: "Sustained timeouts through to the destination indicate the path genuinely breaks after hop 2. Isolated asterisks at one hop followed by normal replies are just a router that doesn't answer ICMP." },
    { text: "A server responds to ping, but a connection attempt to TCP 443 is refused. What should you check?",
      choices: [
        "Whether the service is listening and whether a firewall or ACL blocks the port",
        "Whether the cable is plugged in",
        "The subnet mask on the router",
        "The switch's PoE budget"],
      answer: 0,
      expl: "Ping succeeding proves Layers 1 through 3. A refused port points to the service being down or a firewall/ACL blocking it. Verify with netstat on the server." },
    { text: "ipconfig /all shows the client received its lease from an unfamiliar DHCP server address. What does this suggest?",
      choices: [
        "A rogue DHCP server on the network",
        "A DNS cache poisoning attack",
        "A duplex mismatch",
        "An expired certificate"],
      answer: 0,
      expl: "An unexpected DHCP server address means a rogue server answered first, potentially handing out a malicious gateway and DNS. DHCP snooping prevents this." },
    { text: "Which two conclusions can you draw when a host successfully pings its default gateway? (Select TWO.)",
      choices: [
        "Layer 1 connectivity is working",
        "DNS is functioning correctly",
        "The host has a valid IP address on the correct subnet",
        "The internet circuit is up",
        "The application firewall allows all ports"],
      answer: [0, 2],
      expl: "Reaching the gateway proves the physical link, the host's addressing, and the local subnet are correct. It says nothing about DNS, the WAN circuit, or firewall rules." }
  ]
},

/* ================= MODULE 20 ================= */
{
  id: "m5_4", title: "PBQ Tactics and Exam-Day Strategy", minutes: 12, level: "advanced",
  content: `
<p>You know the material now. This module is about converting knowledge into a passing score under a
90-minute clock.</p>

<h2>The exam, mechanically</h2>
<ul>
  <li><strong>Up to 90 questions, 90 minutes.</strong> Multiple-choice, multi-select, and performance-based questions (PBQs).</li>
  <li><strong>Scored 100–900. Passing is 720.</strong> You do <em>not</em> need to be perfect. You need to be solidly competent across all five domains.</li>
  <li><strong>No penalty for wrong answers.</strong> Never, ever leave a question blank.</li>
  <li>You can flag questions and return to them. Use it.</li>
</ul>

<h2>PBQ tactics</h2>
<p>PBQs appear <strong>first</strong> and they are the biggest time trap on the exam. They're also
worth <strong>partial credit</strong>: every correct sub-item scores, even if you get others wrong.</p>
<div class="keybox"><strong>The winning PBQ strategy:</strong>
<ol>
  <li>Read the scenario once and identify what's actually being asked.</li>
  <li>Fill in every item you're confident about immediately.</li>
  <li>For items you're unsure of, <strong>make your best guess anyway</strong>: a blank scores zero, a guess might score.</li>
  <li>If a PBQ is eating your time, <strong>flag it and move on.</strong> You can bank 40 easy multiple-choice points in the time one stubborn PBQ steals.</li>
  <li>Come back at the end with whatever time remains.</li>
</ol></div>
<p>Common PBQ types: match protocols to ports, order the troubleshooting steps, complete a subnetting
worksheet, configure a firewall ACL in the right order, select the correct device for each spot in a
topology, diagnose command output, and configure wireless settings.</p>

<h2>ACL ordering: the PBQ that trips everyone</h2>
<p>Firewall rules are evaluated <strong>top-down, first match wins</strong>, with an <strong>implicit deny</strong>
at the bottom. Therefore:</p>
<ul>
  <li><strong>Specific rules go ABOVE general rules.</strong> Always.</li>
  <li>If a broad <code>PERMIT</code> sits above a specific <code>DENY</code>, the deny is <em>never reached</em>: the permit matches first and evaluation stops.</li>
  <li>End with an explicit deny-all for clarity and logging.</li>
</ul>

<h2>Time management</h2>
<ul>
  <li>90 minutes ÷ ~90 questions ≈ <strong>60 seconds each</strong>, but PBQs need 5–8 minutes apiece.</li>
  <li>Budget: knock out the multiple-choice at ~50 seconds each, leaving 20–25 minutes for PBQs and review.</li>
  <li><strong>Do a first pass answering everything you know.</strong> Flag anything that takes more than 90 seconds.</li>
  <li>Second pass: the flagged items, with a calmer head and no unanswered questions hanging over you.</li>
</ul>

<h2>How to attack a multiple-choice question</h2>
<ol>
  <li><strong>Read the last sentence first</strong>: it tells you what's actually being asked. Scenarios are often padded with irrelevant detail.</li>
  <li><strong>Note the qualifier:</strong> "MOST likely," "BEST," "FIRST." Several answers may be technically true; only one is the best/first.</li>
  <li><strong>Eliminate ruthlessly.</strong> Two answers are usually obviously wrong. That doubles your odds instantly.</li>
  <li><strong>Watch the count</strong> on multi-select: "Select TWO" means exactly two, and there's no partial credit on multiple-choice.</li>
  <li><strong>Trust the methodology.</strong> If a question asks what to do next and the methodology gives an answer, that's the answer, not the "practical" shortcut.</li>
</ol>
<div class="warnbox"><strong>The trap CompTIA loves:</strong> a scenario where the technically clever answer
is available, but the question asks for the <em>FIRST</em> step. The first step is almost always the simple,
methodical one: check the physical layer, gather information, establish scope.</div>

<h2>Final-week checklist</h2>
<ul>
  <li><strong>Ports table</strong>: recall must be instant. Free marks.</li>
  <li><strong>Subnetting</strong>: do ten problems a day until block size arithmetic is reflex.</li>
  <li><strong>OSI layers</strong>: layers, data units, devices.</li>
  <li><strong>Troubleshooting methodology</strong>: the seven steps in exact order.</li>
  <li><strong>Symptom→cause map</strong> (Module 18): reread it the morning of the exam.</li>
  <li><strong>Wireless</strong>: 1/6/11, WPA3-Enterprise, co-channel vs adjacent-channel.</li>
  <li><strong>Attack→mitigation pairs</strong>: DAI, port security, DHCP snooping, BPDU guard.</li>
</ul>

<h2>On the day</h2>
<p>Sleep. Eat. Arrive early. Read every question completely before looking at the answers. When you don't
know, eliminate what you can and commit. A guess costs nothing and a blank scores nothing.</p>
<p>You've done the work. Now go take the mock exam and find out what's left to polish.</p>`,
  quiz: [
    { text: "How should you handle a PBQ that is consuming a large amount of time?",
      choices: [
        "Flag it, move on to the multiple-choice questions, and return at the end",
        "Keep working until you solve it completely",
        "Leave every item blank and skip it permanently",
        "Guess randomly and never return"],
      answer: 0,
      expl: "PBQs come first and can devour your clock. Banking the easier multiple-choice points first protects your score; return to the PBQ with whatever time is left." },
    { text: "Why should you always fill in every item of a PBQ, even when unsure?",
      choices: [
        "PBQs award partial credit per correct item, and there is no penalty for wrong answers",
        "Blank items award half credit",
        "The exam refuses to advance otherwise",
        "Wrong answers deduct points"],
      answer: 0,
      expl: "Each sub-item is scored independently, so a guess can earn points while a blank never can. There is no wrong-answer penalty." },
    { text: "In a firewall ACL, where must a specific DENY rule be placed relative to a broader PERMIT rule that would also match?",
      choices: [
        "Above the PERMIT rule",
        "Below the PERMIT rule",
        "Order does not matter",
        "At the very bottom of the list"],
      answer: 0,
      expl: "ACLs evaluate top-down and stop at the first match. A broad permit placed above a specific deny means the deny is never reached." },
    { text: "What is the passing score on the CompTIA Network+ exam?",
      choices: ["650", "700", "720", "800"], answer: 2,
      expl: "The Network+ exam is scored on a 100–900 scale with 720 required to pass." },
    { text: "A question asks what a technician should do FIRST. Several answers are technically valid actions. Which should you choose?",
      choices: [
        "The step that comes first in the troubleshooting methodology, usually gathering information or checking the physical layer",
        "The most technically advanced fix",
        "The action that costs the least money",
        "The one that escalates to a senior engineer"],
      answer: 0,
      expl: "When a question asks for the FIRST step, CompTIA is testing the methodology. The correct answer is the simple, methodical one: identify the problem, check Layer 1, establish scope." },
    { text: "Which two are sound exam strategies? (Select TWO.)",
      choices: [
        "Never leave a question unanswered, since there is no guessing penalty",
        "Answer questions strictly in order without flagging any",
        "Read the final sentence of a scenario first to identify what is actually being asked",
        "Spend as long as needed on each PBQ before moving on",
        "Select more answers than requested on multi-select questions to improve your odds"],
      answer: [0, 2],
      expl: "Guessing is free, so never leave a blank. Reading the actual question before the scenario detail saves time. Selecting the wrong number of answers on multi-select scores zero." },
    { text: "On a multi-select question that says 'Select TWO', what happens if you select only one correct answer?",
      choices: [
        "The question is scored as incorrect: multiple-choice questions have no partial credit",
        "You receive half credit",
        "The exam prompts you to add another",
        "It is scored as correct"],
      answer: 0,
      expl: "Unlike PBQs, multiple-choice questions require the complete answer set. Selecting the wrong number of choices scores zero for that question." }
  ]
}
    ],

/* ================= CHECKPOINT 5 - FINAL READINESS (cumulative, all units) ================= */
    checkpoint: {
      id: "cp5", title: "Final Readiness Exam", n: 25,
      questions: [
        { text: "What is the FIRST step of the troubleshooting methodology?",
          choices: ["Establish a theory", "Identify the problem", "Implement a solution", "Document findings"], answer: 1,
          expl: "Identify the problem: gather information, question users, determine what changed, and establish scope." },
        { text: "A host has 169.254.10.2 with no gateway. What failed?",
          choices: ["DNS", "DHCP", "The default route", "The MAC address"], answer: 1,
          expl: "169.254.0.0/16 is APIPA, self-assigned when no DHCP server responds." },
        { text: "Which port does SSH use?",
          choices: ["21", "22", "23", "443"], answer: 1,
          expl: "SSH uses TCP 22, replacing the insecure Telnet on port 23." },
        { text: "What is the network address of 192.168.30.150/26?",
          choices: ["192.168.30.64", "192.168.30.128", "192.168.30.192", "192.168.30.0"], answer: 1,
          expl: "/26 has a block size of 64: blocks are 128 and 192. Address .150 falls in the .128 block." },
        { text: "Late collisions on an interface indicate:",
          choices: ["A duplex mismatch", "A DNS failure", "An exhausted DHCP scope", "A routing loop"], answer: 0,
          expl: "Late collisions cannot occur on a correctly negotiated full-duplex link, making them the signature of a duplex mismatch." },
        { text: "Which routing protocol is used between autonomous systems on the internet?",
          choices: ["OSPF", "RIP", "BGP", "EIGRP"], answer: 2,
          expl: "BGP is the path-vector exterior gateway protocol that exchanges routes between autonomous systems." },
        { text: "Which two mitigations counter Layer 2 attacks? (Select TWO.)",
          choices: [
            "Dynamic ARP Inspection for ARP spoofing",
            "Increasing the PoE budget",
            "Port security for MAC flooding",
            "Raising AP transmit power",
            "Disabling logging"],
          answer: [0, 2],
          expl: "DAI validates ARP replies against DHCP snooping bindings, and port security limits learned MACs to prevent CAM table overflow." },
        { text: "Which OSI layer's data unit is the segment?",
          choices: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"], answer: 3,
          expl: "Layer 4 (Transport) works with segments. Packets are Layer 3, frames are Layer 2, and bits are Layer 1." },
        { text: "Which wireless security option is strongest when a RADIUS server is available?",
          choices: ["WPA2-Personal", "WPA3-Enterprise with 802.1X", "WEP", "Open with MAC filtering"], answer: 1,
          expl: "WPA3-Enterprise authenticates each user individually against RADIUS with modern cryptography." },
        { text: "MAC addresses flapping between switch ports indicates:",
          choices: ["A switching loop", "A DNS problem", "An expired certificate", "A PoE fault"], answer: 0,
          expl: "The same MAC learned on multiple ports is the classic symptom of a Layer 2 bridging loop." },
        { text: "Which prefix should be used for a point-to-point link between two routers?",
          choices: ["/24", "/28", "/30", "/32"], answer: 2,
          expl: "A /30 gives exactly two usable addresses (one per router) with no waste." },
        { text: "Which cloud model requires you to manage the operating system and applications?",
          choices: ["SaaS", "PaaS", "IaaS", "None of them"], answer: 2,
          expl: "IaaS provides virtualized infrastructure; the OS, runtime, and applications remain your responsibility." },
        { text: "Which two describe a differential backup? (Select TWO.)",
          choices: [
            "It copies changes since the last full backup",
            "It copies changes since the last backup of any type",
            "Restore requires the full backup plus the latest differential",
            "Restore requires the full backup plus every differential",
            "It never grows in size"],
          answer: [0, 2],
          expl: "Differentials accumulate all changes since the last full backup, so a restore needs only the full plus the most recent differential." },
        { text: "A user can reach hosts on their own subnet but nothing beyond it. What should you check?",
          choices: ["The default gateway configuration", "The DNS suffix", "The switch firmware", "The UPS"], answer: 0,
          expl: "Local connectivity working while all off-subnet traffic fails points to a missing or incorrect default gateway (or a wrong subnet mask)." },
        { text: "Which are the only non-overlapping channels in 2.4 GHz?",
          choices: ["1, 6, 11", "1, 5, 9", "2, 6, 10", "All are non-overlapping"], answer: 0,
          expl: "Only channels 1, 6, and 11 avoid overlap in the 2.4 GHz band." },
        { text: "Which protocol provides centralized logging on UDP 514?",
          choices: ["SNMP", "Syslog", "NetFlow", "NTP"], answer: 1,
          expl: "Syslog sends log messages to a central collector on UDP 514. Severity runs 0 (Emergency) to 7 (Debug)." },
        { text: "A static route (AD 1) and OSPF (AD 110) both know a network. Which is installed?",
          choices: ["OSPF", "The static route", "Both", "Neither"], answer: 1,
          expl: "The lowest administrative distance wins when routes come from different sources." },
        { text: "Which metric defines how quickly service must be restored after an outage?",
          choices: ["RPO", "RTO", "MTBF", "SLA"], answer: 1,
          expl: "RTO (Recovery Time Objective) sets the maximum acceptable downtime. RPO sets acceptable data loss." },
        { text: "Which two are true of PBQs on the Network+ exam? (Select TWO.)",
          choices: [
            "They award partial credit per correct item",
            "They must be completed before you can proceed",
            "They typically appear at the start of the exam",
            "They are worth fewer points than multiple-choice questions",
            "Blank items receive half credit"],
          answer: [0, 2],
          expl: "PBQs come first and score each sub-item independently, which is why you should always fill in every field. A guess can score, a blank cannot." },
        { text: "Which command reveals which DHCP server issued a client's lease?",
          choices: ["ipconfig /all", "ping -t", "tracert", "arp -d"], answer: 0,
          expl: "ipconfig /all displays the DHCP server address, exposing a rogue server when the address is unfamiliar." },
        { text: "Which technology stretches Layer 2 across a Layer 3 underlay in data centers?",
          choices: ["VXLAN", "STP", "LACP", "NAT"], answer: 0,
          expl: "VXLAN encapsulates Layer 2 frames in UDP over an IP network and supports roughly 16 million segments." },
        { text: "Which passing score is required on the CompTIA Network+ exam?",
          choices: ["675", "700", "720", "750"], answer: 2,
          expl: "The exam is scored 100–900 and requires 720 to pass." },
        { text: "Users far from an AP have slow, dropping connections while nearby users are fine. The cause is MOST likely:",
          choices: [
            "Weak signal / insufficient coverage at the cell edge",
            "A rogue DHCP server",
            "A duplex mismatch",
            "An expired certificate"],
          answer: 0,
          expl: "Distance-dependent symptoms indicate attenuation. As signal weakens, clients drop to lower data rates and eventually disconnect." },
        { text: "Which two statements about ACL processing are correct? (Select TWO.)",
          choices: [
            "Rules are evaluated top-down and stop at the first match",
            "All rules are evaluated and the most specific wins",
            "There is an implicit deny at the end of the list",
            "Order has no effect on behavior",
            "Permits always take precedence over denies"],
          answer: [0, 2],
          expl: "First match wins, and anything not explicitly permitted is denied by the implicit deny-all. This is why specific rules must sit above general ones." },
        { text: "Which tool identifies the source of RF interference in a wireless environment?",
          choices: ["Spectrum analyzer", "Protocol analyzer", "Cable tester", "Toner probe"], answer: 0,
          expl: "A spectrum analyzer visualizes RF energy across the band, revealing non-Wi-Fi interference sources such as microwaves or cordless phones." },
        { text: "A configuration works until the switch is rebooted, then reverts. Why?",
          choices: [
            "The running config was never saved to the startup config",
            "The switch has a hardware fault",
            "DNS is misconfigured",
            "The VLAN database is corrupt"],
          answer: 0,
          expl: "Changes live in the running configuration until saved. On reboot the device loads the startup configuration from NVRAM." },
        { text: "Which two are true about SNMPv3 compared with v2c? (Select TWO.)",
          choices: [
            "It adds authentication",
            "It removes the need for a management station",
            "It supports encryption of SNMP traffic",
            "It runs exclusively over TCP 443",
            "It replaces syslog"],
          answer: [0, 2],
          expl: "SNMPv3 introduces user-based authentication and encryption, fixing the clear-text community string weakness of v1 and v2c." }
      ]
    }
  });
})();
