"use client";

import { useEffect, useState, useRef, memo } from "react";
import {
  isHLSProvider,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
  type MediaPlayerInstance,
  MediaPlayer,
  MediaProvider,
  type MediaQualityChangeEvent,
  type MediaQualitiesChangeEvent,
  type VideoQuality,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import VideoEndOverlay from "./VideoEndOverlay";
import HLS from "hls.js";

type Props = {
  videoId: string;
  className?: string;
  onEnded?: () => void;
  clerk_id?: string;
  courseSlug?: string;
  chapterIndex?: number;
  videoIndex?: number;
  initialTime?: number;
  nextVideoTitle?: string;
  nextVideoThumbnail?: string;
  onPlayNext?: () => void;
  enableAutoplay?: boolean;
  autoplayCountdown?: number;
};

interface Subtitle {
  language: string;
  languageName: string;
  url: string;
}

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
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasResumed, setHasResumed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedPercentage, setBufferedPercentage] = useState(0);

  // ✅ Quality selector state
  const [qualities, setQualities] = useState<VideoQuality[]>([]);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(
    null,
  );
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [isAutoQuality, setIsAutoQuality] = useState(true);

  const saveProgressRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const qualityMenuRef = useRef<HTMLDivElement | null>(null);

  const onProviderChange = (
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent,
  ) => {
    if (isHLSProvider(provider)) {
      provider.library = HLS;
      provider.config = {
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = true;
        },
        enableWorker: true,
        startLevel: -1,
        capLevelToPlayerSize: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        abrEwmaDefaultEstimate: 500000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      };

      provider.instance?.on(HLS.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ HLS Manifest Parsed - Qualities:", data.levels.length);
      });

      provider.instance?.on(HLS.Events.LEVEL_SWITCHED, (event, data) => {
        console.log(`✅ Quality switched to: ${data.level}`);
      });
    }
  };

  const handleQualitiesChange = (
    newQualities: VideoQuality[],
    nativeEvent: MediaQualitiesChangeEvent,
  ) => {
    console.log("✅ Qualities available:", newQualities.length);
    setQualities(newQualities);
  };

  const handleQualityChange = (
    quality: VideoQuality | null,
    nativeEvent: MediaQualityChangeEvent,
  ) => {
    if (quality) {
      console.log(`✅ Current quality: ${quality.height}p`);
      setCurrentQuality(quality);
    }
  };

  // ✅ Handle quality selection
  const handleQualitySelect = (index: number) => {
    if (!playerRef.current?.qualities) return;

    if (index === -1) {
      // Auto quality
      playerRef.current.qualities.autoSelect();
      setIsAutoQuality(true);
    } else {
      // Specific quality
      const quality = qualities[index];
      if (quality) {
        quality.selected = true;
        setIsAutoQuality(false);
      }
    }
    setIsQualityMenuOpen(false);
  };

  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qualityMenuRef.current &&
        !qualityMenuRef.current.contains(event.target as Node)
      ) {
        setIsQualityMenuOpen(false);
      }
    };

    if (isQualityMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isQualityMenuOpen]);

  useEffect(() => {
    if (!videoId) return;

    setIsLoading(true);
    setVideoUrl(null);
    setSubtitles([]);
    setHasResumed(false);
    setLoadError(null);

    (async () => {
      try {
        const [videoRes, subtitlesRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}/signed-cookies?_t=${Date.now()}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: { "Content-Type": "application/json" },
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}/subtitles?format=vtt`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: { "Content-Type": "application/json" },
            },
          ).catch(() => null),
        ]);

        if (videoRes.ok) {
          const videoData = await videoRes.json();
          const url = videoData.hlsUrl || videoData.sourceUrl;
          console.log("📹 Video URL:", url);

          if (url && url.includes(".m3u8")) {
            console.log("✅ HLS detected");
          } else if (url && url.includes(".mp4")) {
            console.log("✅ MP4 detected");
          }

          setVideoUrl(url);
          setIsLoading(false);
        } else {
          throw new Error(`Failed to load video: ${videoRes.status}`);
        }

        if (subtitlesRes?.ok) {
          const subtitlesData = await subtitlesRes.json();
          if (
            subtitlesData?.subtitles &&
            Array.isArray(subtitlesData.subtitles)
          ) {
            setSubtitles(subtitlesData.subtitles);
          }
        }
      } catch (err: any) {
        console.error("Failed to load video:", err);
        setLoadError(err.message || "Failed to load video");
        setIsLoading(false);
      }
    })();

    return () => {
      if (saveProgressRef.current) {
        clearTimeout(saveProgressRef.current);
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, [videoId]);

  const saveProgress = async (
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
      return;
    }

    try {
      await fetch("/api/courses/updateProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
  };

  const handleTimeUpdate = (time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);

    if (saveProgressRef.current) {
      clearTimeout(saveProgressRef.current);
    }

    saveProgressRef.current = setTimeout(() => {
      const completionThreshold = 0.95;
      const isCompleted = dur > 0 && time >= dur * completionThreshold;
      saveProgress(time, dur, isCompleted);
    }, 2000);
  };

  const handleEnded = () => {
    if (saveProgressRef.current) {
      clearTimeout(saveProgressRef.current);
    }
    saveProgress(duration, duration, true);
    if (onEnded) {
      onEnded();
    }
  };

  const handleCanPlay = (event: any) => {
    const player = event.target;

    // ✅ Reset buffering state when video can play
    setIsBuffering(false);

    if (playerRef.current?.qualities) {
      console.log(
        "✅ Qualities after canPlay:",
        playerRef.current.qualities.length,
      );
      console.log(
        "✅ Can set quality:",
        playerRef.current.qualities.readonly === false,
      );
      console.log("✅ Auto quality:", playerRef.current.qualities.auto);
    }

    if (!hasResumed && initialTime > 0 && player.duration > 0) {
      if (initialTime < player.duration - 5) {
        player.currentTime = initialTime;
        setHasResumed(true);
      }
    }
  };

  const handleSeeking = (event: any) => {
    const seekTime = event.target?.currentTime || 0;
    console.log(`Seeking to ${seekTime}s...`);

    setIsSeeking(true);
    lastSeekTimeRef.current = seekTime;

    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }

    seekTimeoutRef.current = setTimeout(() => {
      console.error("⚠️ Seek timeout! Attempting recovery...");

      if (playerRef.current && videoUrl) {
        const currentSeekTime = lastSeekTimeRef.current;
        const tempUrl = videoUrl;
        setVideoUrl(null);

        setTimeout(() => {
          setVideoUrl(tempUrl);
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.currentTime = currentSeekTime;
              playerRef.current.play();
            }
          }, 500);
        }, 100);
      }

      setIsSeeking(false);
    }, 10000);
  };

  const handleSeeked = () => {
    console.log("✅ Seek completed");
    setIsSeeking(false);

    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
  };

  // ✅ Calculate buffered percentage
  const updateBufferedPercentage = () => {
    if (!playerRef.current) return;

    const player = playerRef.current;
    const currentTime = player.currentTime;
    const duration = player.duration;

    if (!duration || duration === 0) return;

    // Get the buffered time ranges from the state
    const buffered = player.state.buffered;

    if (buffered && buffered.length > 0) {
      // Find the buffered range that contains the current time
      for (let i = 0; i < buffered.length; i++) {
        const start = buffered.start(i);
        const end = buffered.end(i);

        if (currentTime >= start && currentTime <= end) {
          // Calculate percentage of buffer ahead of current position
          const bufferedAhead = end - currentTime;
          const percentBuffered = (bufferedAhead / duration) * 100;
          console.log(`✅ Buffered: ${percentBuffered.toFixed(2)}% ahead`);
          setBufferedPercentage(Math.min(percentBuffered, 100));
          return;
        }
      }

      // If current time not in any buffered range, show 0
      setBufferedPercentage(0);
    }
  };

  const handleWaiting = () => {
    console.log("Video is buffering...");

    // Only show buffering indicator if video has actually started playing
    // This prevents showing buffering during initial load
    if (playerRef.current && playerRef.current.currentTime > 0) {
      // setIsBuffering(true);
      // updateBufferedPercentage();
    }
    // ✅ Removed buffer timeout reload - let the player handle buffering naturally
    // On slow connections, reloading just causes more buffering from the same position
  };

  const handlePlaying = () => {
    console.log("Video is playing");
    setIsBuffering(false);
  };

  const handleCanPlayThrough = () => {
    console.log("Video can play through without buffering");
    setIsBuffering(false);
  };

  const handleProgress = () => {
    updateBufferedPercentage();
  };

  const handleError = (event: any) => {
    console.error("Video player error:", event);
    setLoadError("Video playback error. Please refresh the page.");
  };

  if (loadError) {
    return (
      <div className={className || ""}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-red-400">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !videoUrl) {
    return (
      <div className={className || ""}>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
              <p className="text-sm text-gray-400">Loading video...</p>
            </div>
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
          title="Video"
          src={videoUrl}
          crossOrigin="use-credentials"
          preload="metadata"
          playsInline
          className="absolute inset-0 h-full w-full"
          streamType="on-demand"
          onProviderChange={onProviderChange}
          onCanPlay={handleCanPlay}
          onCanPlayThrough={handleCanPlayThrough}
          onEnded={handleEnded}
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onProgress={handleProgress}
          onError={handleError}
          onQualitiesChange={handleQualitiesChange}
          onQualityChange={handleQualityChange}
          key={videoId}
        >
          <MediaProvider>
            {subtitles.map((subtitle, index) => (
              <track
                key={`${subtitle.language}-${subtitle.url}`}
                src={subtitle.url}
                kind="subtitles"
                label={subtitle.languageName}
                srcLang={subtitle.language}
                default={index === 0}
              />
            ))}
          </MediaProvider>
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>

        {/* ✅ Custom Quality Selector */}
        {qualities.length > 0 && (
          <div className="absolute right-4 top-4 z-50" ref={qualityMenuRef}>
            {/* Quality Menu Dropdown */}
            {isQualityMenuOpen && (
              <div className="mb-2 overflow-hidden rounded-lg bg-black/90 shadow-xl backdrop-blur-sm">
                <div className="max-h-80 overflow-y-auto">
                  {/* Auto Option */}
                  <button
                    onClick={() => handleQualitySelect(-1)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      isAutoQuality
                        ? "bg-white/20 font-semibold text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Auto</span>
                      {isAutoQuality && currentQuality && (
                        <span className="text-xs text-gray-400">
                          ({currentQuality.height}p)
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Quality Options */}
                  {qualities
                    .slice()
                    .sort((a, b) => b.height - a.height)
                    .map((quality, index) => {
                      const originalIndex = qualities.findIndex(
                        (q) => q.height === quality.height,
                      );
                      const isSelected = !isAutoQuality && quality.selected;

                      return (
                        <button
                          key={index}
                          onClick={() => handleQualitySelect(originalIndex)}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? "bg-white/20 font-semibold text-white"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>{quality.height}p</span>
                            <span className="text-xs text-gray-400">
                              {quality.bitrate != null
                                ? `${(quality.bitrate / 1000000).toFixed(1)} Mbps`
                                : "— Mbps"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quality Button */}
            <button
              onClick={() => setIsQualityMenuOpen(!isQualityMenuOpen)}
              className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/90"
              title="Video Quality"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-8.48 8.48L3.34 22.66M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24m-8.48-8.48L3.34 1.34" />
              </svg>
              <span>
                {isAutoQuality
                  ? `Auto${currentQuality ? ` (${currentQuality.height}p)` : ""}`
                  : currentQuality
                    ? `${currentQuality.height}p`
                    : "Quality"}
              </span>
            </button>
          </div>
        )}

        {isSeeking && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
              <p className="text-sm text-white">Seeking...</p>
            </div>
          </div>
        )}

        {/* ✅ Buffering Indicator with Progress */}
        {isBuffering && !isSeeking && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-black/80 px-6 py-4 backdrop-blur-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
              <p className="text-sm font-medium text-white">Buffering...</p>

              {/* Buffer Progress Bar */}
              <div className="w-48">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-300">
                  <span>Buffer Progress</span>
                  <span>{bufferedPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${bufferedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <VideoEndOverlay
          currentTime={currentTime}
          duration={duration}
          nextVideoTitle={nextVideoTitle}
          nextVideoThumbnail={nextVideoThumbnail}
          onPlayNext={onPlayNext}
          onCancelAutoplay={() => {}}
          autoplayCountdown={enableAutoplay ? autoplayCountdown : 0}
        />
      </div>
    </div>
  );
}

export default memo(VideoPlayer);
