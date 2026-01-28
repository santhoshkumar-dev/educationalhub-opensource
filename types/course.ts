// Course-related TypeScript interfaces and types

export type CourseType = "chapter" | "video";

export interface VideoRef {
  /** Original ref string like "C:\folder\video\123\file.mp4" or "/folder/video/123/file.mp4" */
  video_src: string;
  title: string;
  video_length?: string;
  preview?: boolean;
  type?: "video" | "file";
  fileType?: string;
}

export interface VideoDoc {
  id: string;
  videoPath: string;
  title: string;
  video_length: string;
  preview?: boolean;
}

export interface Chapter {
  chapter_name: string; // Required field as per schema
  videos: (VideoRef | VideoDoc)[];
}

export interface BaseCourseData {
  courseType: CourseType;
  course_name: string; // Required field
  course_image: string; // Required field
  htmlDescription: string; // Required field
  description: string; // Required field
  slug?: string; // Generated automatically
  chapters?: Chapter[];
  videos?: (VideoRef | VideoDoc)[];
  total_chapters?: number; // Computed automatically
  total_videos?: number; // Computed automatically

  // Optional fields with defaults
  likes?: number;
  dislikes?: number;
  rating?: number;
  published?: boolean;
  tags?: string[];
  instructors?: string[]; // ObjectId strings
  organization?: string; // ObjectId string
  institution?: string; // ObjectId string
  price?: number;
  isPaid?: boolean;
  views?: number;
}

export interface CourseResponse {
  _id: string;
  course_name: string;
  slug: string;
  likes: number;
  dislikes: number;
  course_image: string;
  htmlDescription: string;
  description: string;
  rating: number;
  total_chapters: number;
  total_videos: number;
  chapters: Chapter[];
  videos: (VideoRef | VideoDoc)[];
  courseType: CourseType;
  published: boolean;
  tags: string[];
  instructors: string[];
  organization?: string;
  institution?: string;
  price: number;
  isPaid: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseValidationError {
  error: string;
  details?: string[];
}

export interface CourseCreateResponse {
  message: string;
  slug: string;
}

export interface CourseUpdateResponse {
  message: string;
  course: CourseResponse;
}

export interface CourseDeleteResponse {
  message: string;
}

export interface CoursesListResponse {
  courses: CourseResponse[];
}
