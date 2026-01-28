import React from "react";
import { Play, File, Check } from "lucide-react";

interface VideoItemProps {
  video: {
    _id: string;
    title: string;
    video_length: string;
    type: "video" | "file";
    fileType?: string;
  };
  chapterIndex: number;
  videoIndex: number;
  isCurrentlyPlaying: boolean;
  isLocked: boolean;
  isWatched: boolean;
  hasUser: boolean;
  isPaidCourse: boolean;
  hasAccess: boolean;
  onVideoClick: () => void;
  onFileClick: () => void;
  onMarkAsWatched: (e: React.MouseEvent) => void;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  video,
  isCurrentlyPlaying,
  isLocked,
  isWatched,
  hasUser,
  isPaidCourse,
  hasAccess,
  onVideoClick,
  onFileClick,
  onMarkAsWatched,
}) => {
  return (
    <div
      key={video._id}
      className={`flex cursor-pointer items-center justify-between rounded p-2 transition-colors ${
        isCurrentlyPlaying
          ? "bg-primaryPurple/10 text-primaryPurple"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      } ${isLocked ? "opacity-60" : ""}`}
    >
      <div
        onClick={video.type === "video" ? onVideoClick : onFileClick}
        className="flex flex-1 items-center gap-2 pr-2"
      >
        <div className="relative">
          {video.type === "file" ? <File size={16} /> : <Play size={16} />}
          {isLocked && (
            <div className="absolute -right-1 -top-1 text-xs">🔒</div>
          )}
        </div>
        <div className="line-clamp-1">
          {video.title}
          {isLocked && !hasUser && (
            <span className="ml-2 text-xs text-yellow-600">
              (Sign in to unlock)
            </span>
          )}
          {isLocked && hasUser && isPaidCourse && !hasAccess && (
            <span className="ml-2 text-xs text-yellow-600">
              (Purchase to unlock)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{video.video_length}</span>
        <button
          onClick={onMarkAsWatched}
          disabled={isLocked}
          className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
            isWatched
              ? "bg-green-500 hover:bg-green-600"
              : "border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
          title={
            isLocked
              ? "Sign in to access"
              : isWatched
                ? "Mark as unwatched"
                : "Mark as watched"
          }
        >
          {isWatched && <Check className="h-3 w-3 text-white" />}
        </button>
      </div>
    </div>
  );
};
