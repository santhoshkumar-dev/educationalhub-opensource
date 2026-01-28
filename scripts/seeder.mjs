import WebTorrent from "webtorrent";

console.log("🚀 Starting WebTorrent bridge...");

const client = new WebTorrent({
  tracker: true,
  dht: true,
  utp: true,
  tcp: true,
});

// Configure your tracker URLs via environment variables
const TRACKER_UDP =
  process.env.TRACKER_UDP_URL || "udp://tracker.example.com:6969";
const TRACKER_WSS = process.env.TRACKER_WSS_URL || "wss://tracker.example.com";

/* VERY IMPORTANT: include UDP + WSS */
const magnet =
  "magnet:?xt=urn:btih:61151833778635b3dcb8190d084fe70c88afa301" +
  `&tr=${TRACKER_UDP}` +
  `&tr=${TRACKER_WSS}`;

client.on("error", (err) => {
  console.error("❌ Client error:", err);
});

client.on("warning", (err) => {
  console.warn("⚠️ Client warning:", err);
});

client.add(magnet, { path: "./cache" }, (torrent) => {
  console.log("✅ Torrent added:", torrent.name);
  console.log("InfoHash:", torrent.infoHash);

  torrent.on("metadata", () => {
    console.log("📦 Metadata received");
  });

  torrent.on("wire", (wire) => {
    console.log("🔗 Peer connected via:", wire.type);
  });

  torrent.on("download", (bytes) => {
    console.log("⬇ Downloaded", bytes, "bytes");
  });

  torrent.on("done", () => {
    console.log("✅ Fully cached — now seeding to browsers");
  });
});
