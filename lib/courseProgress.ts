// lib/courseProgress.ts
import CourseProgress from "@/models/courseProgress";
import connectMongoDB from "@/lib/connectMongoDB";
import {
  ICourseProgress,
  IVideoProgress,
  IVideoProgressUpdate,
} from "@/types/courseProgress";

/**
 * Get or create course progress for a user
 */
export async function getOrCreateProgress(
  clerkId: string,
  courseSlug: string,
): Promise<ICourseProgress> {
  await connectMongoDB();

  let progress = await CourseProgress.findOne({ clerkId, courseSlug });

  if (!progress) {
    progress = await CourseProgress.create({
      clerkId,
      courseSlug,
      videos: [],
    });
  }

  return progress;
}

/**
 * Update video progress
 */
export async function updateVideoProgress(
  clerkId: string,
  courseSlug: string,
  chapterIndex: number,
  videoIndex: number,
  updates: IVideoProgressUpdate = {},
  courseId?: string,
  userId?: string,
): Promise<ICourseProgress> {
  await connectMongoDB();

  let progress = await CourseProgress.findOne({ clerkId, courseSlug });

  if (!progress) {
    // Create new progress with this video
    progress = await CourseProgress.create({
      courseId,
      userId,
      clerkId,
      courseSlug,
      videos: [
        {
          chapterIndex,
          videoIndex,
          ...updates,
          lastWatchedAt: new Date(),
        },
      ],
    });
    return progress;
  }

  // Find existing video progress
  const videoIdx = progress.videos.findIndex(
    (v: IVideoProgress) =>
      v.chapterIndex === chapterIndex && v.videoIndex === videoIndex,
  );

  if (videoIdx >= 0) {
    // Update existing
    Object.assign(progress.videos[videoIdx], updates);
    progress.videos[videoIdx].lastWatchedAt = new Date();
  } else {
    // Add new
    progress.videos.push({
      chapterIndex,
      videoIndex,
      currentTime: updates.currentTime || 0,
      duration: updates.duration || 0,
      completed: updates.completed || false,
      lastWatchedAt: new Date(),
    } as IVideoProgress);
  }

  await progress.save();
  return progress;
}

/**
 * Get specific video progress
 */
export async function getVideoProgress(
  clerkId: string,
  courseSlug: string,
  chapterIndex: number,
  videoIndex: number,
): Promise<IVideoProgress | null> {
  await connectMongoDB();

  const progress = await CourseProgress.findOne({ clerkId, courseSlug });

  if (!progress) return null;

  const video = progress.videos.find(
    (v: IVideoProgress) =>
      v.chapterIndex === chapterIndex && v.videoIndex === videoIndex,
  );

  return video || null;
}

/**
 * Get all progress for a course
 */
export async function getCourseProgress(
  clerkId: string,
  courseSlug: string,
): Promise<ICourseProgress | null> {
  await connectMongoDB();
  return await CourseProgress.findOne({ clerkId, courseSlug });
}

/**
 * Get all courses progress for a user
 */
export async function getAllUserProgress(
  clerkId: string,
): Promise<ICourseProgress[]> {
  await connectMongoDB();
  return await CourseProgress.find({ clerkId }).sort({ lastAccessedAt: -1 });
}

/**
 * Mark video as completed
 */
export async function markVideoCompleted(
  clerkId: string,
  courseSlug: string,
  chapterIndex: number,
  videoIndex: number,
): Promise<ICourseProgress> {
  return await updateVideoProgress(
    clerkId,
    courseSlug,
    chapterIndex,
    videoIndex,
    {
      completed: true,
    },
  );
}

/**
 * Save video playback position
 */
export async function savePlaybackPosition(
  clerkId: string,
  courseSlug: string,
  chapterIndex: number,
  videoIndex: number,
  currentTime: number,
  duration: number,
): Promise<ICourseProgress> {
  return await updateVideoProgress(
    clerkId,
    courseSlug,
    chapterIndex,
    videoIndex,
    {
      currentTime,
      duration,
    },
  );
}

/**
 * Get completed videos count for a course
 */
export async function getCompletedVideosCount(
  clerkId: string,
  courseSlug: string,
): Promise<number> {
  await connectMongoDB();

  const progress = await CourseProgress.findOne({ clerkId, courseSlug });

  if (!progress) return 0;

  return progress.videos.filter((v: IVideoProgress) => v.completed).length;
}

/**
 * Get overall progress percentage
 */
export async function getProgressPercentage(
  clerkId: string,
  courseSlug: string,
  totalVideos: number,
): Promise<number> {
  const completedCount = await getCompletedVideosCount(clerkId, courseSlug);

  if (totalVideos === 0) return 0;

  return Math.round((completedCount / totalVideos) * 100);
}
