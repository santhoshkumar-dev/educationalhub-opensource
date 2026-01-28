"use client";

import { useEffect, useState, useRef } from "react";
import TorrentVideoPlayer from "@/components/TorrentVideoPlayer";
import StreamingTorrentPlayer from "@/components/StreamingTorrentPlayer";

// WebTorrent types
interface TorrentFile {
  name: string;
  length: number;
  streamURL: string; // Modern API - returns a streamable URL
  appendTo: (
    element: HTMLElement | string,
    options?: any,
    callback?: (err: Error | null, elem: HTMLElement) => void,
  ) => void;
}

interface Torrent {
  name: string;
  infoHash: string;
  magnetURI: string;
  files: TorrentFile[];
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  downloaded: number;
  uploaded: number;
  timeRemaining: number;
  done: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  destroy: () => void;
}

interface WebTorrentClient {
  add: (
    torrentId: string,
    options?: any,
    callback?: (torrent: Torrent) => void,
  ) => Torrent;
  destroy: (callback?: () => void) => void;
  torrents: Torrent[];
}

// Test magnet links
// Option 1: Seeder bridge magnet (connects to your Node.js seeder)
const SEEDER_BRIDGE_MAGNET =
  "magnet:?xt=urn:btih:61151833778635b3dcb8190d084fe70c88afa301" +
  "&tr=wss://tracker.educationalhub.in" +
  "&tr=udp://tracker.educationalhub.in:6969";

// Option 2: Sintel (public test video with many seeders)
const SINTEL_MAGNET =
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10" +
  "&dn=Sintel" +
  "&xl=129302391";

// Choose which magnet to use for testing
const TEST_MAGNET = SINTEL_MAGNET;

export default function TestTorrentPage() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [progress, setProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [numPeers, setNumPeers] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<WebTorrentClient | null>(null);
  const torrentRef = useRef<Torrent | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initTorrent = async () => {
      try {
        setStatus("Loading WebTorrent library...");

        // Dynamically import WebTorrent (client-side only)
        const WebTorrent = (await import("webtorrent")).default;

        if (!isMounted) return;

        setStatus("Creating WebTorrent client...");
        const client = new WebTorrent() as unknown as WebTorrentClient;
        clientRef.current = client;

        setStatus("Adding torrent...");
        console.log("Adding magnet:", TEST_MAGNET);

        const torrent = client.add(TEST_MAGNET, {
          announce: [
            // Self-hosted WebSocket tracker (connects to seeder bridge)
            "wss://tracker.educationalhub.in",
            // Public WebSocket trackers (fallback for peer discovery)
            "wss://tracker.openwebtorrent.com",
            "wss://tracker.btorrent.xyz",
            "wss://tracker.webtorrent.dev",
          ],
        });

        torrentRef.current = torrent;

        torrent.on("metadata", () => {
          if (!isMounted) return;
          console.log("Torrent metadata received:", torrent.name);
          setStatus(`Metadata received: ${torrent.name}`);
        });

        torrent.on("ready", () => {
          if (!isMounted) return;
          console.log("Torrent ready:", torrent.name);
          console.log(
            "Files:",
            torrent.files.map((f) => f.name),
          );
          setStatus(`Torrent ready: ${torrent.name}`);

          // Find video file
          const videoFile = torrent.files.find(
            (file) =>
              file.name.endsWith(".mp4") ||
              file.name.endsWith(".webm") ||
              file.name.endsWith(".mkv"),
          );

          if (videoFile) {
            console.log("Video file found:", videoFile.name);
            setStatus(`Found video: ${videoFile.name}`);

            // Method 1: Use appendTo to render video (replaces renderTo)
            if (videoContainerRef.current) {
              try {
                videoFile.appendTo(videoContainerRef.current, {
                  autoplay: false,
                  controls: true,
                  playsInline: true,
                });
                console.log("Video appended successfully");
                setIsReady(true);
              } catch (err: any) {
                console.error("appendTo error:", err);
                setError(`Append error: ${err.message}`);
              }
            }

            // Method 2: Get stream URL for blob player (modern API)
            try {
              const url = videoFile.streamURL;
              if (url) {
                console.log("Got stream URL:", url);
                setBlobUrl(url);
                // Set stream URL to native video ref
                if (nativeVideoRef.current) {
                  nativeVideoRef.current.src = url;
                }
              }
            } catch (err: any) {
              console.error("streamURL error:", err);
            }
          } else {
            setError("No video file found in torrent");
          }
        });

        torrent.on("download", () => {
          if (!isMounted) return;
          setProgress(Math.round(torrent.progress * 100));
          setDownloadSpeed(torrent.downloadSpeed);
          setNumPeers(torrent.numPeers);
        });

        torrent.on("done", () => {
          if (!isMounted) return;
          console.log("Torrent download complete!");
          setStatus("Download complete!");
          setProgress(100);
        });

        torrent.on("error", (err: Error) => {
          if (!isMounted) return;
          console.error("Torrent error:", err);
          setError(err.message);
          setStatus("Error occurred");
        });

        torrent.on("warning", (warn: Error) => {
          console.warn("Torrent warning:", warn);
        });
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Init error:", err);
        setError(err.message);
        setStatus("Failed to initialize");
      }
    };

    initTorrent();

    return () => {
      isMounted = false;
      if (torrentRef.current) {
        torrentRef.current.destroy();
      }
      if (clientRef.current) {
        clientRef.current.destroy();
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">
          🧲 Torrent Video Player Test
        </h1>

        {/* Status Panel */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Status</h2>

          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded bg-gray-700 p-3">
              <div className="text-sm text-gray-400">Status</div>
              <div className="truncate font-medium">{status}</div>
            </div>
            <div className="rounded bg-gray-700 p-3">
              <div className="text-sm text-gray-400">Progress</div>
              <div className="font-medium">{progress}%</div>
            </div>
            <div className="rounded bg-gray-700 p-3">
              <div className="text-sm text-gray-400">Download Speed</div>
              <div className="font-medium">{formatBytes(downloadSpeed)}/s</div>
            </div>
            <div className="rounded bg-gray-700 p-3">
              <div className="text-sm text-gray-400">Peers</div>
              <div className="font-medium">{numPeers}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500 bg-red-500/20 p-4">
              <p className="text-red-400">❌ Error: {error}</p>
            </div>
          )}
        </div>

        {/* Magnet Link Display */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Magnet Link</h2>
          <code className="block break-all rounded bg-gray-700 p-4 text-sm text-green-400">
            {TEST_MAGNET}
          </code>
        </div>

        {/* WebTorrent appendTo Video Player */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            🎬 Native Video Player (WebTorrent appendTo)
          </h2>
          <div
            ref={videoContainerRef}
            className="aspect-video overflow-hidden rounded-lg bg-black"
          >
            {/* Video will be appended here by WebTorrent */}
          </div>
          <p className="mt-2 text-sm text-gray-400">
            This player uses WebTorrent&apos;s appendTo() method to stream
            directly.
          </p>
        </div>

        {/* Blob URL Player */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            🎬 Native HTML5 Video Player (Blob URL)
          </h2>
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <video
              ref={nativeVideoRef}
              controls
              className="h-full w-full"
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            This player uses a Blob URL generated from the torrent file.
            {blobUrl && (
              <>
                {" "}
                URL: <code className="break-all text-green-400">{blobUrl}</code>
              </>
            )}
          </p>
        </div>

        {/* TorrentVideoPlayer Component (Vidstack Integration) */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            🎬 TorrentVideoPlayer Component (Vidstack)
          </h2>
          <TorrentVideoPlayer
            magnetLink={TEST_MAGNET}
            onReady={(name) => console.log("TorrentVideoPlayer ready:", name)}
            onProgress={(progress) =>
              console.log("TorrentVideoPlayer progress:", progress)
            }
            onError={(error) =>
              console.error("TorrentVideoPlayer error:", error)
            }
          />
          <p className="mt-2 text-sm text-gray-400">
            This uses the TorrentVideoPlayer component with Vidstack player
            integration.
          </p>
        </div>

        {/* NEW: Streaming Torrent Player (Progressive Playback) */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            🚀 StreamingTorrentPlayer (Progressive Streaming)
          </h2>
          <StreamingTorrentPlayer
            magnetLink={TEST_MAGNET}
            autoplay={false}
            onReady={(name) =>
              console.log("StreamingTorrentPlayer ready:", name)
            }
            onProgress={(progress) =>
              console.log("StreamingTorrentPlayer progress:", progress)
            }
            onPeersChange={(peers) =>
              console.log("StreamingTorrentPlayer peers:", peers)
            }
            onError={(error) =>
              console.error("StreamingTorrentPlayer error:", error)
            }
          />
          <p className="mt-2 text-sm text-gray-400">
            ✨ <strong>TRUE PROGRESSIVE STREAMING</strong> - Start watching
            immediately while the video downloads! Uses WebTorrent&apos;s
            appendTo() method.
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">📋 How It Works</h2>
          <ol className="list-inside list-decimal space-y-2 text-gray-300">
            <li>WebTorrent is initialized in the browser using WebRTC</li>
            <li>
              The magnet link is parsed and metadata is fetched from
              peers/trackers
            </li>
            <li>Video chunks are downloaded from available peers</li>
            <li>The video is streamed to the player as it downloads</li>
            <li>You can start watching before the full download completes!</li>
          </ol>

          <div className="mt-6 rounded-lg border border-yellow-500 bg-yellow-500/20 p-4">
            <p className="text-yellow-400">
              ⚠️ <strong>Note:</strong> Playback depends on peer availability.
              If no peers are seeding, the video won&apos;t load. WebSocket
              trackers are required for browser-to-browser connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
