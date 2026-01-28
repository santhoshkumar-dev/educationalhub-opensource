import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { VideoItem } from "./VideoItem";

interface Chapter {
  _id: string;
  chapter_name: string;
  videos: any[];
}

interface Course {
  courseType: "chapter" | "video";
  chapters: Chapter[];
  videos?: any[];
}

interface CourseContentListProps {
  course: Course;
  currentVideoTitle: string | null;
  watchedVideos: { [key: string]: boolean };
  visibleContent: { [key: string]: boolean };
  chapterRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onToggleVisibility: (chapterId: string) => void;
  onVideoChange: (chapterIndex: number, videoIndex: number) => void;
  onFileSelect: (_id: string, chapterIndex: number, videoIndex: number) => void;
  onMarkAsWatched: (chapterIndex: number, videoIndex: number) => void;
  canAccessContent: (chapterIndex: number, videoIndex: number) => boolean;
  hasUser: boolean;
  isPaidCourse: boolean;
  hasAccess: boolean;
}

export const CourseContentList: React.FC<CourseContentListProps> = ({
  course,
  currentVideoTitle,
  watchedVideos,
  visibleContent,
  chapterRefs,
  onToggleVisibility,
  onVideoChange,
  onFileSelect,
  onMarkAsWatched,
  canAccessContent,
  hasUser,
  isPaidCourse,
  hasAccess,
}) => {
  const shouldShowContent = !(
    course.courseType === "video" && course.videos?.length === 1
  );

  if (!shouldShowContent) return null;

  return (
    <div className="w-full">
      <div className="overflow-auto rounded-lg border border-[#333333] p-4">
        <h3 className="mb-4 text-lg font-semibold">Course Content</h3>
        <div className="space-y-2">
          {course.courseType === "chapter"
            ? course.chapters.map((chapter, chapterIndex) => (
                <div
                  key={chapter._id || chapterIndex}
                  ref={(el) => {
                    if (el) {
                      chapterRefs.current[chapter._id || chapterIndex] = el;
                    }
                  }}
                  className="border-b border-[#333333] pb-2 last:border-b-0 last:pb-0"
                >
                  <div
                    onClick={() =>
                      onToggleVisibility(chapter._id || String(chapterIndex))
                    }
                    className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <h4 className="text-base font-medium">
                      {chapter.chapter_name}
                    </h4>
                    <button type="button" className="text-gray-500">
                      {visibleContent[chapter._id || chapterIndex] ? (
                        <FaAngleUp className="h-4 w-4" />
                      ) : (
                        <FaAngleDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {visibleContent[chapter._id || chapterIndex] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-3 space-y-1"
                      >
                        {chapter.videos.map((video, index) => {
                          const watchKey = `${chapterIndex}-${index}`;
                          const isAccessible = canAccessContent(
                            chapterIndex,
                            index,
                          );
                          return (
                            <VideoItem
                              key={video._id || index}
                              video={video}
                              chapterIndex={chapterIndex}
                              videoIndex={index}
                              isCurrentlyPlaying={
                                currentVideoTitle === video.title
                              }
                              isLocked={!isAccessible}
                              isWatched={watchedVideos[watchKey] || false}
                              hasUser={hasUser}
                              isPaidCourse={isPaidCourse}
                              hasAccess={hasAccess}
                              onVideoClick={() =>
                                onVideoChange(chapterIndex, index)
                              }
                              onFileClick={() =>
                                onFileSelect(video._id, chapterIndex, index)
                              }
                              onMarkAsWatched={(e) => {
                                e.stopPropagation();
                                onMarkAsWatched(chapterIndex, index);
                              }}
                            />
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            : course.videos?.map((video, index) => {
                const watchKey = `0-${index}`;
                const isAccessible = canAccessContent(0, index);
                return (
                  <VideoItem
                    key={video._id || index}
                    video={video}
                    chapterIndex={0}
                    videoIndex={index}
                    isCurrentlyPlaying={currentVideoTitle === video.title}
                    isLocked={!isAccessible}
                    isWatched={watchedVideos[watchKey] || false}
                    hasUser={hasUser}
                    isPaidCourse={isPaidCourse}
                    hasAccess={hasAccess}
                    onVideoClick={() => onVideoChange(0, index)}
                    onFileClick={() => onFileSelect(video._id, 0, index)}
                    onMarkAsWatched={(e) => {
                      e.stopPropagation();
                      onMarkAsWatched(0, index);
                    }}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};
