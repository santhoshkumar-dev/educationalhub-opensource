"use client";

import { useEffect, useState, useRef, memo } from "react";

/**
 * StreamingTorrentPlayer - Progressive streaming video player using WebTorrent
 *
 * This component uses WebTorrent's `appendTo` method which supports TRUE progressive
 * streaming - you can start watching immediately while the video downloads.
 *
 * Requirements for smooth streaming:
 * - MP4 files should have "faststart" (moov atom at beginning)
 * - WebM files work well for streaming
 * - MKV may have compatibility issues in browsers
 */

// WebTorrent types
interface TorrentFile {
  name: string;
  length: number;
  path: string;
  appendTo: (
    element: HTMLElement | string,
    options?: { autoplay?: boolean; controls?: boolean; muted?: boolean },
    callback?: (err: Error | null, elem: HTMLMediaElement) => void,
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
  length: number;
  timeRemaining: number;
  done: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
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

type Props = {
  magnetLink: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onReady?: (torrentName: string) => void;
  onError?: (error: string) => void;
  onPeersChange?: (numPeers: number) => void;
};

function StreamingTorrentPlayer({
  magnetLink,
  className = "",
  autoplay = false,
  muted = false,
  onEnded,
  onProgress,
  onReady,
  onError,
  onPeersChange,
}: Props) {
  const [status, setStatus] = useState<string>("Initializing...");
  const [progress, setProgress] = useState<number>(0);
  const [downloaded, setDownloaded] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [numPeers, setNumPeers] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [torrentName, setTorrentName] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<WebTorrentClient | null>(null);
  const torrentRef = useRef<Torrent | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Default WSS trackers for browser WebRTC peer discovery
  const DEFAULT_WSS_TRACKERS = [
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.btorrent.xyz",
    "wss://tracker.webtorrent.dev",
    "wss://tracker.files.fm:7073/announce",
  ];

  useEffect(() => {
    if (!magnetLink) return;

    let isMounted = true;

    const initTorrent = async () => {
      try {
        setStatus("Loading WebTorrent...");
        setError(null);
        setIsStreaming(false);

        // Dynamically import WebTorrent (client-side only)
        const WebTorrent = (await import("webtorrent")).default;

        if (!isMounted) return;

        setStatus("Creating client...");
        const client = new WebTorrent() as unknown as WebTorrentClient;
        clientRef.current = client;

        setStatus("Connecting to swarm...");
        console.log("[StreamingTorrentPlayer] Adding magnet:", magnetLink);

        // Combine default WSS trackers with any in the magnet
        const torrent = client.add(magnetLink, {
          announce: DEFAULT_WSS_TRACKERS,
        });
        torrentRef.current = torrent;

        // Metadata received - we now know file info
        torrent.on("metadata", () => {
          if (!isMounted) return;
          console.log(
            "[StreamingTorrentPlayer] Metadata received:",
            torrent.name,
          );
          setTorrentName(torrent.name);
          setTotalSize(torrent.length);
          setStatus(`Found: ${torrent.name}`);
        });

        // Torrent is ready to stream
        torrent.on("ready", () => {
          if (!isMounted) return;
          console.log("[StreamingTorrentPlayer] Torrent ready:", {
            name: torrent.name,
            files: torrent.files.map((f) => f.name),
            size: torrent.length,
          });

          // Find the largest video file (usually the main video)
          const videoExtensions = [".mp4", ".webm", ".mkv", ".m4v", ".avi"];
          let videoFile = torrent.files.find((file) =>
            videoExtensions.some((ext) =>
              file.name.toLowerCase().endsWith(ext),
            ),
          );

          // If no video found, try the largest file
          if (!videoFile && torrent.files.length > 0) {
            videoFile = torrent.files.reduce((a, b) =>
              a.length > b.length ? a : b,
            );
          }

          if (videoFile && containerRef.current) {
            console.log(
              "[StreamingTorrentPlayer] Streaming video:",
              videoFile.name,
            );
            setStatus("Starting stream...");

            // Clear container
            containerRef.current.innerHTML = "";

            // appendTo creates a video element and starts streaming progressively
            videoFile.appendTo(
              containerRef.current,
              {
                autoplay,
                controls: true,
                muted,
              },
              (err, elem) => {
                if (!isMounted) return;
                if (err) {
                  console.error(
                    "[StreamingTorrentPlayer] appendTo error:",
                    err,
                  );
                  setError(`Stream error: ${err.message}`);
                  onError?.(err.message);
                } else {
                  console.log("[StreamingTorrentPlayer] Video element created");
                  videoRef.current = elem as HTMLVideoElement;
                  setIsStreaming(true);
                  setStatus("Streaming...");
                  onReady?.(torrent.name);

                  // Add event listeners to the video element
                  if (elem) {
                    elem.addEventListener("ended", () => {
                      onEnded?.();
                    });

                    // Style the video to fill container
                    elem.style.width = "100%";
                    elem.style.height = "100%";
                    elem.style.objectFit = "contain";
                  }
                }
              },
            );
          } else {
            const errMsg = "No video file found in torrent";
            console.error("[StreamingTorrentPlayer]", errMsg);
            setError(errMsg);
            setStatus("Error");
            onError?.(errMsg);
          }
        });

        // Download progress updates
        torrent.on("download", () => {
          if (!isMounted) return;
          const prog = Math.round(torrent.progress * 100);
          setProgress(prog);
          setDownloaded(torrent.downloaded);
          setDownloadSpeed(torrent.downloadSpeed);
          setNumPeers(torrent.numPeers);
          onProgress?.(prog);
          onPeersChange?.(torrent.numPeers);
        });

        // Wire (peer connection) events
        torrent.on("wire", () => {
          if (!isMounted) return;
          setNumPeers(torrent.numPeers);
          onPeersChange?.(torrent.numPeers);
          console.log(
            "[StreamingTorrentPlayer] Peer connected, total:",
            torrent.numPeers,
          );
        });

        // Download complete
        torrent.on("done", () => {
          if (!isMounted) return;
          console.log("[StreamingTorrentPlayer] Download complete!");
          setStatus("Complete");
          setProgress(100);
        });

        // Error handling
        torrent.on("error", (err: Error) => {
          if (!isMounted) return;
          console.error("[StreamingTorrentPlayer] Torrent error:", err);
          setError(err.message);
          setStatus("Error");
          onError?.(err.message);
        });

        torrent.on("warning", (warn: Error) => {
          console.warn("[StreamingTorrentPlayer] Warning:", warn.message);
        });
      } catch (err: any) {
        if (!isMounted) return;
        console.error("[StreamingTorrentPlayer] Init error:", err);
        setError(err.message);
        setStatus("Failed");
        onError?.(err.message);
      }
    };

    initTorrent();

    // Cleanup
    return () => {
      isMounted = false;
      if (torrentRef.current) {
        torrentRef.current.destroy();
        torrentRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [magnetLink, autoplay, muted]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Video Container - WebTorrent will append video element here */}
      <div
        ref={containerRef}
        className="aspect-video w-full overflow-hidden rounded-lg bg-black"
      >
        {/* Loading state shown before video is appended */}
        {!isStreaming && !error && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" />
            <p className="text-center text-sm text-gray-300">{status}</p>
            {numPeers > 0 && (
              <p className="text-xs text-gray-500">
                Connected to {numPeers} peer{numPeers > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            <div className="text-4xl">❌</div>
            <p className="text-center text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Stats overlay - shown while downloading */}
      {isStreaming && progress < 100 && (
        <div className="absolute left-2 top-2 flex gap-3 rounded bg-black/80 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Streaming
          </span>
          <span>📥 {progress}%</span>
          <span>⚡ {formatBytes(downloadSpeed)}/s</span>
          <span>👥 {numPeers}</span>
        </div>
      )}

      {/* Download complete indicator */}
      {progress === 100 && isStreaming && (
        <div className="absolute left-2 top-2 rounded bg-green-600/90 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          ✓ Fully cached
        </div>
      )}
    </div>
  );
}

export default memo(StreamingTorrentPlayer);
