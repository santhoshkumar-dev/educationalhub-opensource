"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";
import Hls, { Level } from "hls.js";
import MuxPlayer from "@mux/mux-player-react";
import VideoEndOverlay from "./VideoEndOverlay";

type Rendition = {
  label: string;
  index: number;
  height: number;
  bitrate: number;
};

type Props = {
  /** Your DB/video id */
  videoId: string;
  /** Optional className for styling */
  className?: string;
  /** Callback when video ends */
  onEnded?: () => void;
  /** User clerk ID for progress tracking */
  clerk_id?: string;
  /** Course slug for progress tracking */
  courseSlug?: string;
  /** Chapter index for progress tracking */
  chapterIndex?: number;
  /** Video index for progress tracking */
  videoIndex?: number;
  /** Initial playback time (for resume functionality) */
  initialTime?: number;
  /** Next video title for end overlay */
  nextVideoTitle?: string;
  /** Next video thumbnail for end overlay */
  nextVideoThumbnail?: string;
  /** Callback when user clicks to play next video */
  onPlayNext?: () => void;
  /** Enable autoplay for next video (default: false) */
  enableAutoplay?: boolean;
  /** Autoplay countdown in seconds (default: 5) */
  autoplayCountdown?: number;
};

function VideoPlayer({
  videoId,
  className,
  onEnded,
  clerk_id,
  courseSlug,
  chapterIndex,
  videoIndex,
  initialTime = 0,
  nextVideoTitle,
  nextVideoThumbnail,
  onPlayNext,
  enableAutoplay = false,
  autoplayCountdown = 5,
}: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [renditions, setRenditions] = useState<Rendition[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [isHls, setIsHls] = useState<boolean>(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const muxRef = useRef<any>(null); // <mux-player> web component
  const hlsRef = useRef<Hls | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const injectedTrackRef = useRef<HTMLTrackElement | null>(null);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasResumedRef = useRef<boolean>(false);
  const autoplayTriggeredRef = useRef<boolean>(false);
  function useCookieReady(cookieName: string) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
      function checkCookie() {
        if (document.cookie.includes(cookieName + "=")) {
          setReady(true);
        } else {
          setTimeout(checkCookie, 100);
        }
      }
      checkCookie();
    }, [cookieName]);

    return ready;
  }

  // const cookieReady = useCookieReady("b2_token"); // <- use your actual cookie name
  const cookieReady = true; // <- use your actual cookie name

  console.log("Cookie ready:", cookieReady);

  useEffect(() => {
    if (!cookieReady) return;
    // Now fetch signed cookies/etc safely
  }, [cookieReady, videoId]);

  // Helper: find the inner <video> inside mux-player's shadow DOM
  const getInnerVideo = () => {
    const muxEl: HTMLElement | null = muxRef.current;
    const muxVideo = muxEl?.shadowRoot
      ?.querySelector("mux-video")
      ?.shadowRoot?.querySelector("video") as HTMLVideoElement | null;
    return muxVideo ?? null;
  };

  // 1) Request signed cookies for this video (for HLS on CDN)
  useEffect(() => {
    // if there is no cookies don't fire the backend request
    if (!videoId) return;

    let abort = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}/signed-cookies`,
          { method: "GET", credentials: "include" },
        );

        if (!res.ok) throw new Error(`Sign cookie failed (${res.status})`);
        if (abort) return;

        const data = await res.json();
        const hlsUrl = data?.hlsUrl;

        if (data.hlsUrl) {
          setIsHls(true);
        } else {
          setIsHls(false);
          setSourceUrl(data.sourceUrl);
        }

        setVideoUrl(hlsUrl);
      } catch (err) {
        console.error("Failed to sign cookies:", err);
        setVideoUrl(null);
      }
    })();
    return () => {
      abort = true;
    };
  }, [videoId]); // Safe as is, no other dependencies used inside

  // 2) Attach Hls.js to the actual <video> inside mux-player
  useEffect(() => {
    if (!videoUrl) return;

    const muxVideo = getInnerVideo();
    if (!muxVideo) return;

    videoElRef.current = muxVideo;

    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    muxVideo.addEventListener("ended", handleEnded);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true; // send signed cookies
        },
        capLevelToPlayerSize: true,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: Level[] = data.levels || [];
        const list: Rendition[] = levels
          .map((lvl, idx) => ({
            index: idx,
            height: lvl.height ?? 0,
            bitrate: lvl.bitrate ?? 0,
            label:
              (lvl.height
                ? `${lvl.height}p`
                : `${Math.round((lvl.bitrate ?? 0) / 1000)} kbps`) +
              (lvl.attrs?.FRAME_RATE ? ` @ ${lvl.attrs.FRAME_RATE}fps` : ""),
          }))
          .sort((a, b) => b.height - a.height || b.bitrate - a.bitrate);

        setRenditions(list);
        setCurrentLevel(-1);
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(muxVideo);
      hlsRef.current = hls;

      return () => {
        muxVideo.removeEventListener("ended", handleEnded);
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Safari fallback
    if (muxVideo.canPlayType("application/vnd.apple.mpegurl")) {
      muxVideo.src = videoUrl;
    }

    return () => {
      muxVideo.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl, onEnded]); // Safe as is

  // 3) Fetch **VTT** subtitle URL (browsers don't render SRT directly)
  useEffect(() => {
    if (!videoId) return;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}/transcript?format=vtt`,
          { credentials: "include" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data?.url) {
          console.log("Subtitle (VTT) URL:", data.url);
          setSubtitleUrl(data.url);
        }
      } catch (e) {
        console.error("Transcript fetch failed:", e);
      }
    })();
  }, [videoId]);

  // 4) Inject <track> into the real <video> (inside shadow DOM)
  useEffect(() => {
    const muxVideo = getInnerVideo();
    if (!muxVideo || !subtitleUrl) return;

    // Remove previously injected track (avoid duplicates)
    if (injectedTrackRef.current) {
      try {
        injectedTrackRef.current.remove();
      } catch {}
      injectedTrackRef.current = null;
    }

    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = "English";
    track.srclang = "en";
    track.default = true;
    track.src = subtitleUrl; // MUST be VTT served with Content-Type: text/vtt

    // Attach and keep a ref for cleanup
    muxVideo.appendChild(track);
    injectedTrackRef.current = track;

    // Optional: debug loaded cues
    const onLoad = () => {
      try {
        const tt = muxVideo.textTracks?.[0];
        console.log("Subtitle cues loaded:", tt?.cues?.length ?? 0);
      } catch {}
    };
    track.addEventListener("load", onLoad);

    return () => {
      track.removeEventListener("load", onLoad);
      try {
        track.remove();
      } catch {}
      if (injectedTrackRef.current === track) {
        injectedTrackRef.current = null;
      }
    };
  }, [subtitleUrl]);

  // 5) Manual quality switcher (kept intact)
  const handleQualityChange = (value: string) => {
    const level = parseInt(value, 10);
    setCurrentLevel(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  // 6) Save video progress to backend
  const saveProgress = useCallback(
    async (
      currentTime: number,
      duration: number,
      completed: boolean = false,
    ) => {
      if (
        !clerk_id ||
        !courseSlug ||
        chapterIndex === undefined ||
        videoIndex === undefined
      ) {
        return; // Skip if tracking props not provided
      }

      try {
        await fetch("/api/courses/updateProgress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id,
            courseSlug,
            chapterIndex,
            videoIndex,
            currentTime,
            duration,
            completed,
          }),
        });
      } catch (error) {
        console.error("Failed to save video progress:", error);
      }
    },
    [clerk_id, courseSlug, chapterIndex, videoIndex],
  );

  // 7) Resume video from saved position
  useEffect(() => {
    const muxVideo = getInnerVideo();
    if (!muxVideo || hasResumedRef.current || initialTime <= 0) return;

    const handleLoadedMetadata = () => {
      if (initialTime > 0 && initialTime < muxVideo.duration - 5) {
        muxVideo.currentTime = initialTime;
        hasResumedRef.current = true;
      }
    };

    if (muxVideo.readyState >= 1) {
      // Metadata already loaded
      handleLoadedMetadata();
    } else {
      muxVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        muxVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [initialTime, videoUrl]);

  // 8) Periodic progress saving + time tracking for overlay
  useEffect(() => {
    const muxVideo = getInnerVideo();
    if (!muxVideo) return;

    const handleTimeUpdate = () => {
      const time = muxVideo.currentTime;
      const dur = muxVideo.duration;

      // Update state for overlay
      setCurrentTime(time);
      setDuration(dur);

      // Clear existing timer
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }

      // Check if video has reached 95% completion threshold
      const completionThreshold = 0.95;
      const isCompleted = dur > 0 && time >= dur * completionThreshold;

      // Debounce: save progress 1 second after user stops seeking
      progressSaveTimerRef.current = setTimeout(() => {
        saveProgress(time, dur, isCompleted);
      }, 1000);
    };

    const handleLoadedMetadata = () => {
      setDuration(muxVideo.duration);
    };

    const handleEnded = () => {
      const dur = muxVideo.duration;
      saveProgress(dur, dur, true);
    };

    muxVideo.addEventListener("timeupdate", handleTimeUpdate);
    muxVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
    muxVideo.addEventListener("ended", handleEnded);

    return () => {
      muxVideo.removeEventListener("timeupdate", handleTimeUpdate);
      muxVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
      muxVideo.removeEventListener("ended", handleEnded);
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
    };
  }, [
    videoUrl,
    clerk_id,
    courseSlug,
    chapterIndex,
    videoIndex,
    saveProgress,
    videoId,
  ]); // Added videoId as getInnerVideo relies on refs which might change or just to be safe, but actually getInnerVideo uses refs. The main issue usually is missing props. `saveProgress` is used.
  // Actually, `saveProgress` is a function defined in scope. It should be added or wrapped in useCallback.
  // Let's check `saveProgress`. It uses `clerk_id`, `courseSlug` etc.
  // Better to wrap `saveProgress` in useCallback or add it to dependency.
  // But `saveProgress` is defined inside.
  // Let's add `saveProgress` to dependencies if I wrap it.
  // The previous analysis said: `useEffect` dependencies.
  // Let's look at `saveProgress`.
  // It is defined at line 291.
  // I will wrap `saveProgress` in useCallback.

  return (
    <div className={className} style={{ position: "relative" }}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
        {/* No src so Mux doesn't fetch itself; Hls.js will attach to the inner <video> */}
        {isHls ? (
          <MuxPlayer
            ref={muxRef}
            crossOrigin="use-credentials"
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <MuxPlayer
            ref={muxRef}
            src={sourceUrl || undefined}
            crossOrigin="use-credentials"
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}

        {/* Quality selector - moved inside video container */}
        {renditions.length > 0 && (
          <div
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              background: "rgba(0,0,0,0.6)",
              padding: "6px 8px",
              borderRadius: 8,
              display: "flex",
              gap: 8,
              alignItems: "center",
              zIndex: 20,
            }}
          >
            <label style={{ color: "#fff", fontSize: 12 }}>Quality</label>
            <select
              title="Select video quality"
              value={currentLevel}
              onChange={(e) => handleQualityChange(e.target.value)}
              style={{ padding: "4px 6px", borderRadius: 6 }}
            >
              <option value={-1}>Auto</option>
              {renditions.map((r) => (
                <option key={r.index} value={r.index}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* End-of-video overlay with next video - moved inside video container */}
        <VideoEndOverlay
          currentTime={currentTime}
          duration={duration}
          nextVideoTitle={nextVideoTitle}
          nextVideoThumbnail={nextVideoThumbnail}
          onPlayNext={onPlayNext}
          onCancelAutoplay={() => {
            autoplayTriggeredRef.current = true;
          }}
          autoplayCountdown={enableAutoplay ? autoplayCountdown : 0}
        />
      </div>
    </div>
  );
}

export default memo(VideoPlayer);
