import { BaseCourseData, VideoRef, VideoDoc, Chapter } from "@/types/course";

/**
 * Validates a video object (either VideoRef or VideoDoc)
 */
export const validateVideo = (video: VideoRef | VideoDoc): string[] => {
  const errors: string[] = [];

  if ("video_src" in video) {
    if (!video.video_src || video.video_src.trim() === "") {
      errors.push("Video source is required");
    }
    if (!video.title || video.title.trim() === "") {
      errors.push("Video title is required");
    }
  } else {
    if (!video.id || video.id.trim() === "") {
      errors.push("Video ID is required");
    }
    if (!video.title || video.title.trim() === "") {
      errors.push("Video title is required");
    }
  }

  return errors;
};

/**
 * Validates a chapter object
 */
export const validateChapter = (chapter: Chapter, index: number): string[] => {
  const errors: string[] = [];

  if (!chapter.chapter_name || chapter.chapter_name.trim() === "") {
    errors.push(`Chapter ${index + 1}: Chapter name is required`);
  }

  if (!chapter.videos || chapter.videos.length === 0) {
    errors.push(`Chapter ${index + 1}: At least one video is required`);
  } else {
    chapter.videos.forEach((video, videoIndex) => {
      const videoErrors = validateVideo(video);
      videoErrors.forEach((error) => {
        errors.push(`Chapter ${index + 1}, Video ${videoIndex + 1}: ${error}`);
      });
    });
  }

  return errors;
};

/**
 * Validates the entire course data object
 */
export const validateCourseData = (data: BaseCourseData): string[] => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.course_name || data.course_name.trim() === "") {
    errors.push("Course name is required");
  }

  if (!data.course_image || data.course_image.trim() === "") {
    errors.push("Course image is required");
  }

  if (!data.htmlDescription || data.htmlDescription.trim() === "") {
    errors.push("HTML description is required");
  }

  if (!data.description || data.description.trim() === "") {
    errors.push("Description is required");
  }

  if (!data.courseType || !["chapter", "video"].includes(data.courseType)) {
    errors.push("Course type must be either 'chapter' or 'video'");
  }

  // Course type specific validation
  if (data.courseType === "chapter") {
    if (!data.chapters || data.chapters.length === 0) {
      errors.push("Chapter-based course must have at least one chapter");
    } else {
      data.chapters.forEach((chapter, index) => {
        const chapterErrors = validateChapter(chapter, index);
        errors.push(...chapterErrors);
      });
    }
  } else if (data.courseType === "video") {
    if (!data.videos || data.videos.length === 0) {
      errors.push("Video-based course must have at least one video");
    } else {
      data.videos.forEach((video, index) => {
        const videoErrors = validateVideo(video);
        videoErrors.forEach((error) => {
          errors.push(`Video ${index + 1}: ${error}`);
        });
      });
    }
  }

  // Optional field validations
  if (data.price !== undefined && data.price < 0) {
    errors.push("Price cannot be negative");
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
    errors.push("Rating must be between 0 and 5");
  }

  if (data.likes !== undefined && data.likes < 0) {
    errors.push("Likes cannot be negative");
  }

  if (data.dislikes !== undefined && data.dislikes < 0) {
    errors.push("Dislikes cannot be negative");
  }

  if (data.views !== undefined && data.views < 0) {
    errors.push("Views cannot be negative");
  }

  // Validate ObjectId format for references
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (data.organization && !objectIdRegex.test(data.organization)) {
    errors.push("Invalid organization ID format");
  }

  if (data.institution && !objectIdRegex.test(data.institution)) {
    errors.push("Invalid institution ID format");
  }

  if (data.instructors) {
    data.instructors.forEach((instructorId, index) => {
      if (!objectIdRegex.test(instructorId)) {
        errors.push(`Invalid instructor ID format at index ${index}`);
      }
    });
  }

  return errors;
};

/**
 * Validates ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validates if a string is a valid video length format (e.g., "10:30", "1:25:45")
 */
export const isValidVideoLength = (length: string): boolean => {
  const timeRegex = /^(\d{1,2}:)?(\d{1,2}):(\d{2})$/;
  return timeRegex.test(length);
};

/**
 * Validates if a price is valid (non-negative number)
 */
export const isValidPrice = (price: number): boolean => {
  return typeof price === "number" && price >= 0 && Number.isFinite(price);
};

/**
 * Validates if a rating is valid (between 0 and 5)
 */
export const isValidRating = (rating: number): boolean => {
  return (
    typeof rating === "number" &&
    rating >= 0 &&
    rating <= 5 &&
    Number.isFinite(rating)
  );
};
