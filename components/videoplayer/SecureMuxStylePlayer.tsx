"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  videoId: string;
};

export default function SecureMuxStylePlayer({ videoId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // 1️⃣ Fetch signed HLS URL + set cookies
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}/signed-cookies`,
          {
            method: "GET",
            credentials: "include", // ✅ Store CF cookies
          },
        );
        const data = await res.json();
        if (res.ok && data.hlsUrl) {
          setVideoUrl(data.hlsUrl);
        } else {
          console.error("❌ Failed to fetch signed URL:", data.message);
        }
      } catch (err) {
        console.error("❌ Error fetching video:", err);
      }
    };

    fetchVideoUrl();
  }, [videoId]);

  // 2️⃣ Attach Hls.js to <video>
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.withCredentials = true; // ✅ Send CF cookies
          },
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);

        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        // Safari native HLS
        videoRef.current.src = videoUrl;
      }
    }
  }, [videoUrl]);

  return (
    <div
      className="mux-player-theme"
      style={{ maxWidth: "800px", margin: "auto" }}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          controls
          crossOrigin="use-credentials" // ✅ Allow cookies for posters/tracks
          style={{
            width: "100%",
            height: "384px",
            backgroundColor: "black",
            borderRadius: "8px",
          }}
        />
      ) : (
        <p>Loading secure video...</p>
      )}
    </div>
  );
}
