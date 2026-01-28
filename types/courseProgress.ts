// types/courseProgress.ts
import { Document, Types } from "mongoose";

export interface IVideoProgress {
  chapterIndex: number;
  videoIndex: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: Date;
}

export interface ICourseProgress extends Document {
  courseId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  clerkId: string;
  courseSlug: string;
  videos: IVideoProgress[];
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateProgressRequest {
  clerk_id: string;
  courseSlug: string;
  chapterIndex: number;
  videoIndex: number;
  currentTime?: number;
  duration?: number;
  completed?: boolean;
  forceUpdate?: boolean;
}

export interface IGetProgressRequest {
  clerk_id: string;
  courseSlug: string;
  chapterIndex: number;
  videoIndex: number;
}

export interface IVideoProgressUpdate {
  currentTime?: number;
  duration?: number;
  completed?: boolean;
}
