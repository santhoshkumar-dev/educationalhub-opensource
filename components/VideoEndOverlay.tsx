"use client";

import { useEffect, useState } from "react";
import { PlayCircle, Clock } from "lucide-react";
import Image from "next/image";

type VideoEndOverlayProps = {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total video duration in seconds */
  duration: number;
  /** Next video title */
  nextVideoTitle?: string;
  /** Next video thumbnail URL */
  nextVideoThumbnail?: string;
  /** Callback when user clicks to play next video */
  onPlayNext?: () => void;
  /** Callback when user cancels autoplay */
  onCancelAutoplay?: () => void;
  /** Autoplay countdown in seconds (0 = disabled) */
  autoplayCountdown?: number;
};

export default function VideoEndOverlay({
  currentTime,
  duration,
  nextVideoTitle,
  nextVideoThumbnail,
  onPlayNext,
  onCancelAutoplay,
  autoplayCountdown = 0,
}: VideoEndOverlayProps) {
  const [countdown, setCountdown] = useState<number>(autoplayCountdown);
  const [isVisible, setIsVisible] = useState(false);

  // Show overlay in last 20 seconds of video
  const shouldShow =
    duration > 0 && currentTime >= duration - 20 && currentTime < duration;

  useEffect(() => {
    setIsVisible(shouldShow);
  }, [shouldShow]);

  // Handle autoplay countdown
  // useEffect(() => {
  //   if (!isVisible || autoplayCountdown <= 0) {
  //     setCountdown(0);
  //     return;
  //   }

  //   setCountdown(autoplayCountdown);
  //   const interval = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         if (onPlayNext) {
  //           onPlayNext();
  //         }
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [isVisible, autoplayCountdown, onPlayNext]);

  if (!isVisible || !nextVideoTitle) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-6">
      <div className="pointer-events-auto max-w-sm overflow-hidden rounded-lg border border-white/10 bg-black/90 shadow-2xl backdrop-blur-sm">
        {/* Thumbnail */}
        {nextVideoThumbnail && (
          <div className="relative h-32 w-full bg-gray-800">
            <Image
              src={nextVideoThumbnail}
              alt={nextVideoTitle || "Thumbnail"}
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 p-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">
              Up Next
            </p>
            <h3 className="line-clamp-2 text-sm font-semibold text-white">
              {nextVideoTitle}
            </h3>
          </div>

          {/* Autoplay countdown */}
          {countdown > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Clock className="h-4 w-4" />
              <span>Playing in {countdown}s...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onPlayNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4" />
              Play Now
            </button>
            {countdown > 0 && onCancelAutoplay && (
              <button
                onClick={onCancelAutoplay}
                className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
