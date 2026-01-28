"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, Tab } from "@heroui/react";
import axios from "axios";
import { useRouter } from "@bprogress/next/app";
import { useCourseLike } from "@/hooks/useCourseLike";
import { Icon } from "@iconify/react";
import VideoPlayer1 from "@/components/VideoPlayer";
import FeedbackModal from "@/components/hero-ui/modal-feedback (1)/FeedbackModal";
import Comments from "@/components/comments/Comments";
import { Notes } from "@/components/notes/Notes";
import LoginModal from "@/components/ClerkLoginPopup";
import CoursePaymentModal from "@/components/payment/CoursePaymentModal";
import { useCart } from "@/app/context/CartContext";
import { useAutoplaySettings } from "@/hooks/useAutoplaySettings";

// Extracted components
import { CourseBreadcrumb } from "./components/CourseBreadcrumb";
import { LockedContentOverlay } from "./components/LockedContentOverlay";
import { CourseSkeleton } from "./components/CourseSkeleton";
import { CourseOverviewTab } from "./components/CourseOverviewTab";
import { CourseContentList } from "./components/CourseContentList";

type Chapter = {
  _id: string;
  chapter_name: string;
  videos: {
    _id: string;
    video_src: string;
    title: string;
    video_length: string;
    type: "video" | "file";
    fileType?: string;
    preview?: boolean;
  }[];
};

interface Course {
  slug: string;
  course_name: string;
  course_image: string;
  views: number;
  tags: string[];
  _id: string;
  instructors: [
    {
      _id: string;
      first_name: string;
      last_name: string;
      profile_image_url: string;
      email: string;
      clerk_id: string;
    },
  ];
  organization?: {
    name: string;
    logo?: string;
    _id: string;
    slug: string;
  };
  description: string;
  htmlDescription: string;
  total_videos: number;
  courseType: "chapter" | "video";
  videos?: {
    _id: string;
    video_src: string;
    title: string;
    video_length: string;
    type: "video" | "file";
    preview?: boolean;
  }[];
  chapters: {
    _id: string;
    chapter_name: string;
    videos: {
      _id: string;
      video_src: string;
      title: string;
      video_length: string;
      type: "video" | "file";
      preview?: boolean;
      fileType?:
        | "pdf"
        | "docx"
        | "pptx"
        | "mp4"
        | "avi"
        | "mov"
        | "mkv"
        | "flv"
        | "wmv"
        | "webm"
        | "mpeg"
        | "zip"
        | "3gp";
    }[];
  }[];
  isPaid?: boolean;
  hasAccess?: boolean;
  price?: number;
  discountedPrice?: number;
}

type ContentItem =
  | { type: "video"; title: string; video_src: string }
  | { type: "file"; title: string; video_src: string };

const isVideo = (item?: ContentItem | null) => item?.type === "video";
const isFile = (item?: ContentItem | null) => item?.type === "file";
const isVideoItem = (it?: any) => it?.type === "video";

function findNextVideoPosition(
  course: Course,
  startChapterIndex: number,
  startVideoIndex: number,
): { chapterIndex: number; videoIndex: number } | null {
  const isChapterCourse = course.courseType === "chapter";
  if (!isChapterCourse) {
    for (let i = startVideoIndex + 1; i < (course.videos?.length ?? 0); i++) {
      const item = course.videos![i] as any;
      if (isVideoItem(item)) return { chapterIndex: 0, videoIndex: i };
    }
    return null;
  }

  for (let c = startChapterIndex; c < course.chapters.length; c++) {
    const start = c === startChapterIndex ? startVideoIndex + 1 : 0;
    const vids = course.chapters[c].videos as any[];
    for (let v = start; v < vids.length; v++) {
      if (isVideoItem(vids[v])) return { chapterIndex: c, videoIndex: v };
    }
  }
  return null;
}

function getItem(course: any, cIdx: number, vIdx: number): any | undefined {
  return course.courseType === "chapter"
    ? course.chapters[cIdx]?.videos?.[vIdx]
    : course.videos?.[vIdx];
}

function buildWatchedSet(
  watched: Array<{
    chapterIndex: number;
    videoIndex: number;
    completed?: boolean;
  }> = [],
) {
  const s = new Set<string>();
  // Only include videos that are actually completed
  for (const w of watched) {
    if (w.completed === true) {
      s.add(`${w.chapterIndex}-${w.videoIndex}`);
    }
  }
  return s;
}

function getStartPosition(course: any, watchedSet: Set<string>) {
  if (!course) return { chapterIndex: 0, videoIndex: 0 };

  if (course.courseType === "chapter") {
    let lastVideoPos: { chapterIndex: number; videoIndex: number } | null =
      null;

    for (let c = 0; c < course.chapters.length; c++) {
      const items: any[] = course.chapters[c].videos ?? [];
      for (let v = 0; v < items.length; v++) {
        const it = items[v];
        if (isVideoItem(it)) {
          lastVideoPos = { chapterIndex: c, videoIndex: v };
          if (!watchedSet.has(`${c}-${v}`)) {
            return { chapterIndex: c, videoIndex: v };
          }
        }
      }
    }
    return lastVideoPos ?? { chapterIndex: 0, videoIndex: 0 };
  }

  const items: any[] = course.videos ?? [];
  let lastVideoIdx: number | null = null;
  for (let v = 0; v < items.length; v++) {
    const it = items[v];
    if (isVideoItem(it)) {
      lastVideoIdx = v;
      if (!watchedSet.has(`0-${v}`)) {
        return { chapterIndex: 0, videoIndex: v };
      }
    }
  }
  return { chapterIndex: 0, videoIndex: lastVideoIdx ?? 0 };
}

const getCurrentChapterId = (c?: Course, idx?: number) =>
  c && typeof idx === "number" && c.chapters?.[idx]?._id
    ? c.chapters[idx]._id
    : undefined;

export default function CoursesIdClient({
  params,
}: {
  params: { slug: string };
}) {
  const { user } = useUser();

  const { addToCart, isInCart } = useCart();
  const { autoplayEnabled, toggleAutoplay } = useAutoplaySettings();
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [snippet, setSnippet] = useState<string>("");
  const [fullText, setFullText] = useState<string>("");
  const [visibleContent, setVisibleContent] = useState<{
    [key: string]: boolean;
  }>({});
  const [playingVideoTitle, setPlayingVideoTitle] = useState<string | null>(
    null,
  );
  const [currentSignedVideoUrl, setCurrentSignedVideoUrl] =
    useState<string>("");
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<"signin" | "signup">(
    "signin",
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [videoInitialTime, setVideoInitialTime] = useState<number>(0);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  const router = useRouter();
  const { liked, likeCourse, unlikeCourse, likesCount } = useCourseLike(
    params.slug,
  );
  const chapterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // State to track watched videos
  const [watchedVideos, setWatchedVideos] = useState<{
    [key: string]: boolean;
  }>({});

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const canAccessContent = useCallback(
    (chapterIndex: number, videoIndex: number): boolean => {
      // 1. If course is free (not paid), everyone can access everything
      if (!course?.isPaid) return true;

      // 2. If user is authenticated and has purchased the course
      if (user && course?.hasAccess) return true;

      // 3. Check if this specific video is marked as preview
      const item = getItem(course, chapterIndex, videoIndex);
      if (item?.preview) return true;

      // 4. If user is not logged in, block access (show login modal)
      if (!user) return false;

      // 5. If user is logged in but hasn't purchased, block access (show payment modal)
      return false;
    },
    [user, course],
  );

  const fetchSignedUrl = useCallback(async (videoPath: string) => {
    try {
      let video_id = "";

      if (videoPath.endsWith(".mp4")) {
        const filename = videoPath.split("/").pop();
        video_id = filename ? filename.replace(".mp4", "") : "";
      } else if (videoPath.endsWith(".m3u8")) {
        const parts = videoPath.split("/");
        video_id = parts[2] || "";
      }

      if (!video_id) {
        console.error("Cannot extract video ID from path:", videoPath);
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${video_id}/signed-cookies`,
        {
          withCredentials: true,
        },
      );

      const signedUrl = res.data.signedUrl;
      setCurrentSignedVideoUrl(signedUrl);
      setCurrentVideoId(video_id);
    } catch (error) {
      console.error("Error fetching signed URL", error);
    }
  }, []);

  const scrollToChapter = (chapterIdOrIndex: string | number) => {
    const el = chapterRefs.current[chapterIdOrIndex];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  function buildWatchedSet(
    watched: Array<{
      chapterIndex: number;
      videoIndex: number;
      completed?: boolean;
    }> = [],
  ) {
    const s = new Set<string>();
    // Only include videos that are actually completed
    for (const w of watched) {
      if (w.completed === true) {
        s.add(`${w.chapterIndex}-${w.videoIndex}`);
      }
    }
    return s;
  }

  function getStartPosition(course: any, watchedSet: Set<string>) {
    if (!course) return { chapterIndex: 0, videoIndex: 0 };

    if (course.courseType === "chapter") {
      let lastVideoPos: { chapterIndex: number; videoIndex: number } | null =
        null;

      for (let c = 0; c < course.chapters.length; c++) {
        const items: any[] = course.chapters[c].videos ?? [];
        for (let v = 0; v < items.length; v++) {
          const it = items[v];
          if (isVideoItem(it)) {
            lastVideoPos = { chapterIndex: c, videoIndex: v };
            if (!watchedSet.has(`${c}-${v}`)) {
              return { chapterIndex: c, videoIndex: v };
            }
          }
        }
      }
      return lastVideoPos ?? { chapterIndex: 0, videoIndex: 0 };
    }

    const items: any[] = course.videos ?? [];
    let lastVideoIdx: number | null = null;
    for (let v = 0; v < items.length; v++) {
      const it = items[v];
      if (isVideoItem(it)) {
        lastVideoIdx = v;
        if (!watchedSet.has(`0-${v}`)) {
          return { chapterIndex: 0, videoIndex: v };
        }
      }
    }
    return { chapterIndex: 0, videoIndex: lastVideoIdx ?? 0 };
  }

  const getCurrentChapterId = (c?: Course, idx?: number) =>
    c && typeof idx === "number" && c.chapters?.[idx]?._id
      ? c.chapters[idx]._id
      : undefined;

  // Payment initiation function
  const handleInitiatePayment = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      setLoginModalMode("signin");
      return;
    }

    if (!course?._id) return;

    setIsProcessingPayment(true);

    try {
      const response = await fetch("/api/payment/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });

      const data = await response.json();

      if (data.success) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;

        Object.entries(data.payuData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Manual mark as watched function
  const handleMarkAsWatched = useCallback(
    async (chapterIndex: number, videoIndex: number) => {
      console.log("Marking as watched");
      if (!canAccessContent(chapterIndex, videoIndex)) {
        if (!user) {
          setIsLoginModalOpen(true);
          setLoginModalMode("signin");
        } else if (course?.isPaid && !course?.hasAccess) {
          setShowPaymentModal(true);
        }
        return;
      }

      const watchKey = `${chapterIndex}-${videoIndex}`;
      const newCompletedState = !watchedVideos[watchKey];

      setWatchedVideos((prev) => ({
        ...prev,
        [watchKey]: newCompletedState,
      }));

      try {
        if (user) {
          const response = await fetch("/api/courses/updateProgress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerk_id: user.id,
              courseSlug: course?.slug,
              chapterIndex: chapterIndex,
              videoIndex: videoIndex,
              completed: newCompletedState,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to update progress: ${response.status}`);
          }
        } else {
          // Save to localStorage for guest users
          if (course?.slug) {
            const storageKey = `course_progress_${course.slug}`;
            const currentProgress = JSON.parse(
              localStorage.getItem(storageKey) || "{}",
            );
            currentProgress[watchKey] = newCompletedState;
            localStorage.setItem(storageKey, JSON.stringify(currentProgress));
          }
        }
      } catch (error) {
        console.error("Failed to update progress:", error);
        // Revert on error
        setWatchedVideos((prev) => ({
          ...prev,
          [watchKey]: !newCompletedState,
        }));
      }
    },
    [user, course, canAccessContent, watchedVideos],
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const courseRes = await axios.get(`/api/courses/${params.slug}`);
        if (!courseRes.data.course) {
          console.error("Course not found");
          return;
        }

        const fetchedCourse = courseRes.data.course;
        setCourse(fetchedCourse);

        let startChapterIndex = 0;
        let startVideoIndex = 0;

        if (user) {
          await axios.post("/api/recommendations/activity", {
            userId: user?.id || null,
            courseId: courseRes.data.course._id,
            actionType: "view",
          });

          // ✅ Fetch ALL course progress (not just single video)
          const progressRes = await axios.post(
            "/api/courses/getCourseProgress",
            {
              clerk_id: user.id,
              courseSlug: params.slug,
            },
          );

          const userProgress = progressRes.data.progress;

          // ✅ Only mark videos as watched if they're actually completed
          const watchedVideosData =
            userProgress?.videos?.reduce(
              (acc: Record<string, boolean>, v: any) => {
                if (v.completed === true) {
                  acc[`${v.chapterIndex}-${v.videoIndex}`] = true;
                }
                return acc;
              },
              {},
            ) ?? {};
          setWatchedVideos(watchedVideosData);

          // ✅ Use watchedVideosData keys directly as the watched set
          const watchedSet = new Set<string>(Object.keys(watchedVideosData));
          const { chapterIndex, videoIndex } = getStartPosition(
            fetchedCourse,
            watchedSet,
          );
          startChapterIndex = chapterIndex;
          startVideoIndex = videoIndex;
        } else {
          // Load from localStorage for guest users
          const storageKey = `course_progress_${params.slug}`;
          const savedProgress = JSON.parse(
            localStorage.getItem(storageKey) || "{}",
          );
          setWatchedVideos(savedProgress);

          const watchedSet = new Set<string>();
          Object.entries(savedProgress).forEach(([key, val]) => {
            if (val) watchedSet.add(key);
          });

          const { chapterIndex, videoIndex } = getStartPosition(
            fetchedCourse,
            watchedSet,
          );
          startChapterIndex = chapterIndex;
          startVideoIndex = videoIndex;
        }

        setCurrentChapterIndex(startChapterIndex);
        setCurrentVideoIndex(startVideoIndex);

        if (
          fetchedCourse.courseType === "chapter" &&
          fetchedCourse.chapters.length > 0
        ) {
          setActiveChapter(fetchedCourse.chapters[startChapterIndex]);
        }

        const item = getItem(fetchedCourse, startChapterIndex, startVideoIndex);
        setPlayingVideoTitle(item?.title ?? null);
        setCurrentVideoId(item?._id ?? "");

        if (isVideoItem(item) && item?.video_src) {
          await fetchSignedUrl(item.video_src);
        }

        setSnippet(
          fetchedCourse.htmlDescription.length > 500
            ? fetchedCourse.htmlDescription.slice(0, 500) + "..."
            : fetchedCourse.htmlDescription,
        );
        setFullText(fetchedCourse.htmlDescription);

        const currentId = getCurrentChapterId(fetchedCourse, startChapterIndex);
        if (currentId) {
          setVisibleContent((prev) => ({ ...prev, [currentId]: true }));
          setTimeout(() => {
            scrollToChapter(currentId);
          }, 100);
        }

        if (!fetchedCourse.hasAccess) {
          setShowEnrollmentModal(true);
        }
      } catch (err) {
        console.error("Init load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, user]);

  const handleToggleVisibility = (chapterName: string) => {
    setVisibleContent((prevState) => ({
      ...prevState,
      [chapterName]: !prevState[chapterName],
    }));
  };

  // Updated handleVideoChange with payment logic
  const handleVideoChange = useCallback(
    async (chapterIndex: number, videoIndex: number) => {
      if (!course) return;

      if (!canAccessContent(chapterIndex, videoIndex)) {
        if (!user) {
          setIsLoginModalOpen(true);
          setLoginModalMode("signin");
        } else if (course.isPaid && !course.hasAccess) {
          setShowPaymentModal(true);
        }
        return;
      }

      setCurrentChapterIndex(chapterIndex);
      setCurrentVideoIndex(videoIndex);

      if (course.courseType === "chapter") {
        setActiveChapter(course.chapters[chapterIndex]);
      }

      const selectedVideo =
        course.courseType === "chapter"
          ? course.chapters[chapterIndex].videos[videoIndex]
          : course.videos?.[videoIndex];

      setPlayingVideoTitle(selectedVideo?.title || null);

      if (selectedVideo?.video_src && selectedVideo.type === "video") {
        await fetchSignedUrl(selectedVideo.video_src);
      }
    },
    [course, canAccessContent, fetchSignedUrl, user],
  );

  const getFileSignedUrl = useCallback(async (id: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${id}/file`,
      );
      return res.data.signedUrl;
    } catch (err) {
      console.error("Error fetching file signed URL:", err);
      return null;
    }
  }, []);

  const handleFileSelect = useCallback(
    async (_id: string, chapterIndex: number, index: number) => {
      if (!canAccessContent(chapterIndex, index)) {
        if (!user) {
          setIsLoginModalOpen(true);
          setLoginModalMode("signin");
        } else if (course?.isPaid && !course?.hasAccess) {
          setShowPaymentModal(true);
        }
        return;
      }

      const fileSrc = await getFileSignedUrl(_id);
      const previousVideoIndex = currentVideoIndex;
      setCurrentVideoIndex(index);

      if (user) {
        await fetch("/api/courses/updateProgress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerk_id: user.id,
            courseSlug: course?.slug,
            chapterIndex: chapterIndex,
            videoIndex: index,
            completed: true, // ✅ Mark file as completed when viewed
          }),
        });
      } else {
        // Save to localStorage for guest users
        if (course?.slug) {
          const storageKey = `course_progress_${course.slug}`;
          const currentProgress = JSON.parse(
            localStorage.getItem(storageKey) || "{}",
          );
          currentProgress[`${chapterIndex}-${index}`] = true;
          localStorage.setItem(storageKey, JSON.stringify(currentProgress));
        }
      }

      setCurrentVideoIndex(previousVideoIndex);
      setWatchedVideos((prev) => ({
        ...prev,
        [`${chapterIndex}-${index}`]: true,
      }));

      window.open(fileSrc, "_blank");
    },
    [user, course, canAccessContent, getFileSignedUrl, currentVideoIndex],
  );

  // Fetch saved video progress when video changes
  useEffect(() => {
    const fetchVideoProgress = async () => {
      if (!user || !course) {
        setVideoInitialTime(0);
        return;
      }

      try {
        const response = await fetch("/api/courses/getProgress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            courseSlug: course.slug,
            chapterIndex: currentChapterIndex,
            videoIndex: currentVideoIndex,
          }),
        });

        const data = await response.json();
        if (data.success && data.progress && data.progress.currentTime > 0) {
          setVideoInitialTime(data.progress.currentTime);
        } else {
          setVideoInitialTime(0);
        }
      } catch (error) {
        console.error("Failed to fetch video progress:", error);
        setVideoInitialTime(0);
      }
    };

    fetchVideoProgress();
  }, [user, course, currentChapterIndex, currentVideoIndex]);

  // Get next video information for end overlay
  const getNextVideoInfo = useCallback(() => {
    if (!course) return { title: undefined, thumbnail: undefined };

    const next = findNextVideoPosition(
      course,
      currentChapterIndex,
      currentVideoIndex,
    );

    if (!next) return { title: undefined, thumbnail: undefined };

    const nextVideo =
      course.courseType === "chapter"
        ? course.chapters[next.chapterIndex]?.videos[next.videoIndex]
        : course.videos?.[next.videoIndex];

    return {
      title: nextVideo?.title,
      thumbnail: course.course_image,
    };
  }, [course, currentChapterIndex, currentVideoIndex]);

  const handlePlayNext = useCallback(() => {
    if (!course) return;
    const next = findNextVideoPosition(
      course,
      currentChapterIndex,
      currentVideoIndex,
    );
    if (next) {
      handleVideoChange(next.chapterIndex, next.videoIndex);
    }
  }, [course, currentChapterIndex, currentVideoIndex, handleVideoChange]);

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginModeSwitch = (mode: "signin" | "signup") => {
    setLoginModalMode(mode);
  };

  const handleVideoEnd = useCallback(async () => {
    if (!course) return;

    const isChapterCourse = course.courseType === "chapter";

    setWatchedVideos((prev) => ({
      ...prev,
      [`${currentChapterIndex}-${currentVideoIndex}`]: true,
    }));

    const showUpcomingFiles = (
      chapterIndex: number,
      fromVideoIndex: number,
    ) => {
      const list: { title: string; url: string }[] = [];
      if (course.courseType === "chapter") {
        const ch = course.chapters[chapterIndex];
        for (let i = fromVideoIndex + 1; i < ch.videos.length; i++) {
          const item = ch.videos[i] as ContentItem;
          if (isFile(item))
            list.push({ title: item.title, url: item.video_src });
          if (isVideo(item)) break;
        }
      } else {
        for (
          let i = fromVideoIndex + 1;
          i < (course.videos?.length ?? 0);
          i++
        ) {
          const item = course.videos![i] as any;
          if (isFile(item))
            list.push({ title: item.title, url: item.video_src });
          if (isVideo(item)) break;
        }
      }
    };

    showUpcomingFiles(currentChapterIndex, currentVideoIndex);

    const next = findNextVideoPosition(
      course,
      currentChapterIndex,
      currentVideoIndex,
    );

    if (next) {
      setCurrentChapterIndex(next.chapterIndex);
      setCurrentVideoIndex(next.videoIndex);
      const selected =
        course.courseType === "chapter"
          ? course.chapters[next.chapterIndex].videos[next.videoIndex]
          : course.videos![next.videoIndex];

      setPlayingVideoTitle(selected.title);
      void handleVideoChange(next.chapterIndex, next.videoIndex);
    }

    try {
      if (user) {
        if (currentChapterIndex === 0 && currentVideoIndex === 0) {
          void fetch("/api/courses/enrolledCourse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerk_id: user.id,
              courseSlug: course.slug,
            }),
          });
        }
        // ✅ Mark video as completed on video end
        void fetch("/api/courses/updateProgress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            courseSlug: course.slug,
            chapterIndex: isChapterCourse ? currentChapterIndex : 0,
            videoIndex: currentVideoIndex,
            completed: true,
          }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [course, currentChapterIndex, currentVideoIndex, user, handleVideoChange]);

  const submitReport = async (reportData: {
    reportType: string;
    description: string;
  }) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/courses/courseReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          courseId: course?._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await response.json();
      console.log("Report submitted successfully:", data);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      setLoginModalMode("signin");
      return;
    }

    if (!course) return;

    if (isInCart(course._id)) {
      router.push("/cart");
      return;
    }

    try {
      await addToCart({
        _id: course._id,
        course_name: course.course_name,
        course_image: course.course_image,
        price: course.price || 0,
        discountedPrice: course.discountedPrice,
        slug: course.slug,
        instructors: course.instructors,
        organization: course.organization,
      });

      alert("Course added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add course to cart. Please try again.");
    }
  };

  return (
    <main className="min-h-screen p-4 md:px-12 xl:px-24">
      {loading ? <CourseSkeleton /> : <></>}

      {course && (
        <div className="space-y-8">
          <div className="flex flex-col gap-6 md:min-h-screen lg:flex-row">
            <div className="flex w-full flex-col lg:w-1/2">
              <div className="top-4 z-10 md:sticky lg:top-32">
                <CourseBreadcrumb courseName={course.course_name} />

                <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
                  {canAccessContent(currentChapterIndex, currentVideoIndex) ? (
                    <VideoPlayer1
                      videoId={currentVideoId}
                      onEnded={handleVideoEnd}
                      clerk_id={user?.id}
                      courseSlug={course?.slug}
                      chapterIndex={currentChapterIndex}
                      videoIndex={currentVideoIndex}
                      initialTime={videoInitialTime}
                      nextVideoTitle={getNextVideoInfo().title}
                      nextVideoThumbnail={getNextVideoInfo().thumbnail}
                      onPlayNext={handlePlayNext}
                      enableAutoplay={autoplayEnabled}
                      autoplayCountdown={5}
                    />
                  ) : (
                    <LockedContentOverlay
                      hasUser={!!user}
                      onSignIn={() => {
                        setIsLoginModalOpen(true);
                        setLoginModalMode("signin");
                      }}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleInitiatePayment}
                      isProcessing={isProcessingPayment}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-4 pb-4">
                  <div>
                    <h2 className="text-base font-bold leading-tight md:text-xl lg:text-2xl">
                      {playingVideoTitle || course.course_name}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => (liked ? unlikeCourse() : likeCourse())}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <Icon
                        icon="solar:heart-bold"
                        className={`h-4 w-4 ${liked ? "text-red-500" : "text-gray-400"}`}
                      />
                      <span className="whitespace-nowrap text-sm font-medium">
                        {likesCount > 0 && (
                          <span className="mr-1">{likesCount}</span>
                        )}
                        {liked ? "Liked" : "Like"}
                      </span>
                    </button>
                    <FeedbackModal onSubmit={submitReport} />
                  </div>
                </div>

                {/* Tabs - Mobile */}
                <div className="md:hidden">
                  <Tabs
                    fullWidth
                    className="md:hidden"
                    classNames={{
                      base: "mt-6",
                      cursor: "bg-content1 dark:bg-content1",
                      panel: "w-full p-0 pt-4",
                    }}
                  >
                    <Tab key="content" title="Course Content">
                      <div className="space-y-6 lg:pt-0">
                        <CourseContentList
                          course={course}
                          currentVideoTitle={playingVideoTitle}
                          watchedVideos={watchedVideos}
                          visibleContent={visibleContent}
                          chapterRefs={chapterRefs}
                          onToggleVisibility={handleToggleVisibility}
                          onVideoChange={handleVideoChange}
                          onFileSelect={handleFileSelect}
                          onMarkAsWatched={handleMarkAsWatched}
                          canAccessContent={canAccessContent}
                          hasUser={!!user}
                          isPaidCourse={!!course.isPaid}
                          hasAccess={!!course.hasAccess}
                        />
                      </div>
                    </Tab>
                    <Tab key="overview" title="Overview">
                      <CourseOverviewTab
                        course={course}
                        isExpanded={isExpanded}
                        onToggle={handleToggle}
                        snippet={snippet}
                        fullText={fullText}
                        router={router}
                      />
                    </Tab>
                    <Tab key="comments" title="Comments">
                      <Comments courseSlug={params.slug} />
                    </Tab>
                    <Tab key="notes" title="Notes">
                      {activeChapter ? (
                        <Notes
                          courseSlug={course.slug}
                          chapterId={activeChapter._id}
                        />
                      ) : (
                        <p className="text-muted-foreground mt-4">
                          Select a chapter to manage your notes.
                        </p>
                      )}
                    </Tab>
                  </Tabs>
                </div>

                {/* Tabs - Desktop */}
                <div className="hidden md:block">
                  <Tabs
                    fullWidth
                    className="hidden md:block"
                    classNames={{
                      base: "mt-6",
                      cursor: "bg-content1 dark:bg-content1",
                      panel: "w-full p-0 pt-4",
                    }}
                  >
                    <Tab key="overview" title="Overview">
                      <CourseOverviewTab
                        course={course as any}
                        isExpanded={isExpanded}
                        onToggle={handleToggle}
                        snippet={snippet}
                        fullText={fullText}
                        router={router}
                      />
                    </Tab>

                    <Tab key="comments" title="Comments">
                      <Comments courseSlug={params.slug} />
                    </Tab>

                    <Tab key="notes" title="Notes">
                      {activeChapter ? (
                        <Notes
                          courseSlug={course.slug}
                          chapterId={activeChapter._id}
                        />
                      ) : (
                        <p className="text-muted-foreground mt-4">
                          Select a chapter to manage your notes.
                        </p>
                      )}
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden flex-1 overflow-y-auto md:block lg:w-1/2 lg:pr-4">
              <div className="space-y-6 pt-4 lg:pt-0">
                <CourseContentList
                  course={course}
                  currentVideoTitle={playingVideoTitle}
                  watchedVideos={watchedVideos}
                  visibleContent={visibleContent}
                  chapterRefs={chapterRefs}
                  onToggleVisibility={handleToggleVisibility}
                  onVideoChange={handleVideoChange}
                  onFileSelect={handleFileSelect}
                  onMarkAsWatched={handleMarkAsWatched}
                  canAccessContent={canAccessContent}
                  hasUser={!!user}
                  isPaidCourse={!!course.isPaid}
                  hasAccess={!!course.hasAccess}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (for locked content) */}
      <CoursePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course as any}
        isProcessingPayment={isProcessingPayment}
        handleInitiatePayment={handleInitiatePayment}
        handleAddToCart={handleAddToCart}
      />

      {/* Enrollment Modal (on page load) */}
      <CoursePaymentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        course={course as any}
        isProcessingPayment={isProcessingPayment}
        handleInitiatePayment={handleInitiatePayment}
        handleAddToCart={handleAddToCart}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        mode={loginModalMode}
        onModeSwitch={handleLoginModeSwitch}
      />
    </main>
  );
}
