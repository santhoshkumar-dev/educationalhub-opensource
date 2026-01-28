"use client";

import { useEffect, useState, useRef, memo } from "react";
import {
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
  type MediaPlayerInstance,
  MediaPlayer,
  MediaProvider,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

// WebTorrent types
interface TorrentFile {
  name: string;
  length: number;
  streamURL: string; // Modern API - returns a streamable blob URL
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

type Props = {
  magnetLink: string;
  className?: string;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onReady?: (torrentName: string) => void;
  onError?: (error: string) => void;
};

function TorrentVideoPlayer({
  magnetLink,
  className,
  onEnded,
  onProgress,
  onReady,
  onError,
}: Props) {
  const [status, setStatus] = useState<string>("Initializing...");
  const [progress, setProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [numPeers, setNumPeers] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torrentName, setTorrentName] = useState<string>("");

  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const clientRef = useRef<WebTorrentClient | null>(null);
  const torrentRef = useRef<Torrent | null>(null);

  // Extract trackers from magnet link
  const extractTrackers = (magnetUri: string): string[] => {
    const trackers: string[] = [];
    const params = magnetUri.split("?")[1];
    if (!params) return trackers;

    const urlParams = new URLSearchParams(params);
    const trParams = urlParams.getAll("tr");

    trParams.forEach((tracker) => {
      const decoded = decodeURIComponent(tracker);
      if (decoded) {
        trackers.push(decoded);
      }
    });

    console.log("Extracted trackers:", trackers);
    return trackers;
  };

  useEffect(() => {
    if (!magnetLink) return;

    let isMounted = true;

    const initTorrent = async () => {
      try {
        setStatus("Loading WebTorrent...");
        setError(null);
        setIsReady(false);
        setBlobUrl(null);

        // Dynamically import WebTorrent (client-side only)
        const WebTorrent = (await import("webtorrent")).default;

        if (!isMounted) return;

        setStatus("Creating client...");
        const client = new WebTorrent() as unknown as WebTorrentClient;
        clientRef.current = client;

        setStatus("Connecting to peers...");
        console.log("Adding magnet:", magnetLink);

        // Default WSS trackers for browser WebRTC peer discovery
        // These are essential for connecting to the Node.js P2P bridge
        const defaultWssTrackers = [
          "wss://tracker.educationalhub.in",
          "wss://tracker.openwebtorrent.com",
          "wss://tracker.btorrent.xyz",
          "wss://tracker.webtorrent.dev",
        ];

        // Extract trackers from the magnet link
        const magnetTrackers = extractTrackers(magnetLink);

        // Combine default WSS trackers with magnet trackers (WSS trackers first)
        const allTrackers = [
          ...defaultWssTrackers,
          ...magnetTrackers.filter((t) => !defaultWssTrackers.includes(t)),
        ];

        const torrent = client.add(magnetLink, {
          announce: allTrackers,
        });
        torrentRef.current = torrent;

        torrent.on("metadata", () => {
          if (!isMounted) return;
          console.log("Torrent metadata:", torrent.name);
          setTorrentName(torrent.name);
          setStatus(`Loading: ${torrent.name}`);
        });

        torrent.on("ready", () => {
          if (!isMounted) return;
          console.log("Torrent ready:", torrent.name);
          setStatus("Finding video file...");

          // Find video file
          const videoFile = torrent.files.find(
            (file) =>
              file.name.endsWith(".mp4") ||
              file.name.endsWith(".webm") ||
              file.name.endsWith(".mkv") ||
              file.name.endsWith(".avi"),
          );

          if (videoFile) {
            console.log("Video file found:", videoFile.name);
            setStatus("Preparing stream...");

            // Get stream URL for Vidstack player (modern WebTorrent API)
            // file.streamURL is a property that returns a streamable blob URL
            try {
              const url = videoFile.streamURL;
              if (url) {
                console.log("Stream URL ready:", url);
                setBlobUrl(url);
                setIsReady(true);
                setStatus("Ready to play!");
                onReady?.(torrent.name);
              } else {
                throw new Error("No stream URL available");
              }
            } catch (err: any) {
              console.error("Stream URL error:", err);
              const errMsg = `Failed to create video stream: ${err.message}`;
              setError(errMsg);
              onError?.(errMsg);
            }
          } else {
            const errMsg = "No video file found in torrent";
            setError(errMsg);
            setStatus("Error");
            onError?.(errMsg);
          }
        });

        torrent.on("download", () => {
          if (!isMounted) return;
          const prog = Math.round(torrent.progress * 100);
          setProgress(prog);
          setDownloadSpeed(torrent.downloadSpeed);
          setNumPeers(torrent.numPeers);
          onProgress?.(prog);
        });

        torrent.on("done", () => {
          if (!isMounted) return;
          console.log("Torrent complete!");
          setStatus("Download complete!");
          setProgress(100);
        });

        torrent.on("error", (err: Error) => {
          if (!isMounted) return;
          console.error("Torrent error:", err);
          setError(err.message);
          setStatus("Error");
          onError?.(err.message);
        });
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Init error:", err);
        setError(err.message);
        setStatus("Failed");
        onError?.(err.message);
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
  }, [magnetLink]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleEnded = () => {
    onEnded?.();
  };

  // Loading/Connecting state
  if (!isReady || !blobUrl) {
    return (
      <div className={className || ""}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900 shadow-xl">
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            {error ? (
              <>
                <div className="text-4xl">❌</div>
                <p className="text-center text-sm text-red-400">{error}</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
                <p className="text-center text-sm text-gray-300">{status}</p>

                {/* Progress info */}
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress: {progress}%</span>
                    <span>{formatBytes(downloadSpeed)}/s</span>
                    <span>{numPeers} peers</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className || ""} style={{ position: "relative" }}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
        <MediaPlayer
          ref={playerRef}
          title={torrentName || "Torrent Video"}
          src={blobUrl}
          playsInline
          className="absolute inset-0 h-full w-full"
          onEnded={handleEnded}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      </div>

      {/* Download stats overlay */}
      {progress < 100 && (
        <div className="absolute left-2 top-2 flex gap-3 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <span>📥 {progress}%</span>
          <span>⚡ {formatBytes(downloadSpeed)}/s</span>
          <span>👥 {numPeers} peers</span>
        </div>
      )}
    </div>
  );
}

export default memo(TorrentVideoPlayer);
