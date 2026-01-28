import WebTorrent from "webtorrent";

const client = new WebTorrent();

// Configure tracker URL via environment variable
const TRACKER_WSS = process.env.TRACKER_WSS_URL || "wss://tracker.example.com";

const magnet =
  "magnet:?xt=urn:btih:a4954b3db96f5283a4d2e9c0869e97c608f71a02" +
  `&tr=${TRACKER_WSS}`;

client.add(magnet, (torrent) => {
  console.log("✅ Connected via WSS");
  console.log("Peers:", torrent.numPeers);

  torrent.on("wire", (wire) => {
    console.log("🔗 WebRTC peer connected");
  });
});
