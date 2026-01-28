/**
 * Test if a tracker is reachable
 */

import http from "http";

// Configure tracker URL via environment variable
const TRACKER_URL =
  process.env.TRACKER_HTTP_URL || "http://localhost:8000/announce";

console.log(`Testing tracker: ${TRACKER_URL}\n`);

const testTracker = () => {
  const url = new URL(TRACKER_URL);

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "GET",
    timeout: 5000,
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Tracker is reachable!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`   Response: ${data.substring(0, 100)}...`);
    });
  });

  req.on("error", (err) => {
    console.error(`❌ Tracker is NOT reachable!`);
    console.error(`   Error: ${err.message}`);
    console.error(`\nPossible issues:`);
    console.error(`   1. Tracker server is not running`);
    console.error(`   2. Firewall blocking port 8000`);
    console.error(`   3. IP address is not accessible from your network`);
    console.error(`   4. Tracker only accepts UDP, not HTTP`);
  });

  req.on("timeout", () => {
    console.error(`❌ Connection timeout!`);
    req.destroy();
  });

  req.end();
};

testTracker();
