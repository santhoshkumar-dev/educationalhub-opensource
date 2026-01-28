"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "@/components/static/textEditor";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import InstructorSelect from "@/components/custom/InstructorSelect";
import InstitutionSearchSelect from "@/components/custom/InstitutionSearchSelect";
import OrganizationSearchSelect from "@/components/custom/OrganizationSearchSelect";
import { useMongoUser } from "@/app/context/UserContext";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface Video {
  _id: string;
  title: string;
  video_src: string;
  video_length: string;
  preview?: boolean;
  type?: "video" | "file";
  fileType?: string;
}

interface Chapter {
  chapter_name: string;
  videos: Video[];
}

interface Course {
  course_name: string;
  courseType: "chapter" | "video";
  description: string;
  htmlDescription?: string;
  chapters: Chapter[];
  videos: Video[];
  tags: string[];
  instructors: string[];
  course_image?: string;
  institution?: string;
  organization?: string;
  total_chapters?: number;
  total_videos?: number;
  published?: boolean;
  price?: number;
  isPaid?: boolean;
}

const predefinedTags = [
  "Web Development",
  "Python",
  "JavaScript",
  "React",
  "Machine Learning",
  "Data Science",
  "HTML",
  "CSS",
  "SQL",
  "Node.js",
  "UI/UX Design",
  "Project Management",
  "Leadership",
  "Communication Skills",
  "Time Management",
  "Personal Development",
];

const Page = () => {
  const currentUser = useMongoUser();
  const currentUserId = currentUser?._id;
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const [visibleContent, setVisibleContent] = useState<{
    [key: string]: boolean;
  }>({});

  const [course, setCourse] = useState<Course>({
    course_name: "",
    courseType: "chapter",
    description: "",
    chapters: [],
    videos: [],
    tags: [],
    instructors: [],
  });

  const [currentChapter, setCurrentChapter] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);

  // === FILE UPLOAD (docs/html) ===
  const [docFiles, setDocFiles] = useState<FileList | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [selectedVideoSrc, setSelectedVideoSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalInstructors, setAdditionalInstructors] = useState<
    { _id: string; first_name: string; last_name: string }[]
  >([]);
  const [includeSelf, setIncludeSelf] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(
    null,
  );
  const [selectedOrganization, setSelectedOrganization] = useState<any | null>(
    null,
  );
  const [editorHtml, setEditorHtml] = useState("");
  const [editorText, setEditorText] = useState("");

  const isEditMode = Boolean(courseId);

  useEffect(() => {
    setCourse((prev) => ({ ...prev, tags }));
  }, [tags]);

  useEffect(() => {
    setCourse((prev) => ({
      ...prev,
      instructors: [
        ...(includeSelf && currentUserId ? [currentUserId] : []),
        ...additionalInstructors.map((i) => i._id),
      ],
    }));
  }, [additionalInstructors, includeSelf, currentUserId]);

  useEffect(() => {
    setCourse((prev) => ({ ...prev, institution: selectedInstitution?._id }));
  }, [selectedInstitution]);

  useEffect(() => {
    setCourse((prev) => ({ ...prev, organization: selectedOrganization?._id }));
  }, [selectedOrganization]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/admin/courses/${courseId}`);
        const data = res.data;
        setCourse({
          course_name: data.course_name || "",
          courseType: data.courseType || "chapter",
          description: data.description || "",
          chapters: data.chapters || [],
          videos: data.videos || [],
          tags: data.tags || [],
          instructors: data.instructors?.map((i: any) => i._id) || [],
          course_image: data.course_image,
          institution: data.institution?._id,
          organization: data.organization?._id,
        });
        setTags(data.tags || []);
        if (data.course_image) setImagePreview(data.course_image);
        const others =
          data.instructors?.filter((i: any) => i._id !== currentUserId) || [];
        setAdditionalInstructors(others);
        setIncludeSelf(
          data.instructors?.some((i: any) => i._id === currentUserId) || false,
        );
        if (data.institution) setSelectedInstitution(data.institution);
        if (data.organization) setSelectedOrganization(data.organization);
        setEditorHtml(data.description || "");
        setEditorText(data.description || "");
      } catch {
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, currentUserId]);

  const handleCourseChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleChapterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentChapter(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleVideoFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setVideoFiles(e.target.files);
  };

  // === FILE UPLOAD (docs/html) ===
  const handleDocFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setDocFiles(e.target.files);
  };

  const addChapter = () => {
    if (!currentChapter.trim()) {
      toast.error("Enter a chapter name");
      return;
    }
    setCourse((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        { chapter_name: currentChapter.trim(), videos: [] },
      ],
    }));
    setCurrentChapter("");
  };

  const uploadVideos = async (chapterName: string) => {
    if (!chapterName) {
      toast.error("Select a chapter");
      return;
    }
    if (!videoFiles || videoFiles.length === 0) {
      toast.error("Select video files");
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);
    try {
      for (const file of Array.from(videoFiles)) {
        const formData = new FormData();
        const title = file.name.replace(/\.[^/.]+$/, "");
        const fileType = file.type.split("/")[0];
        formData.append("title", title);
        formData.append("video", file); // Multer expects "video"
        formData.append("type", "video"); // tell backend it's a video
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) =>
              setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1))),
          },
        );
        const uploaded = res.data.video;
        const newVideo: Video = {
          _id: uploaded._id,
          title: uploaded.title,
          video_src: uploaded.videoPath,
          video_length: uploaded.video_length,
          type: "video",
          fileType: fileType,
        };
        setCourse((prev) => {
          const chapters = prev.chapters.map((ch) =>
            ch.chapter_name === chapterName
              ? { ...ch, videos: [...ch.videos, newVideo] }
              : ch,
          );
          return { ...prev, chapters };
        });
      }
      toast.success("Videos uploaded successfully");
      setVideoFiles(null);
    } catch (err) {
      console.error(err);
      toast.error("Error uploading videos");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // === FILE UPLOAD (docs/html) ===
  const uploadFiles = async (chapterName: string) => {
    if (!chapterName) {
      toast.error("Select a chapter");
      return;
    }
    if (!docFiles || docFiles.length === 0) {
      toast.error("Select files");
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);

    const extFromName = (name: string) => {
      const m = name.toLowerCase().match(/\.(pdf|docx|pptx|html|htm)$/i);
      return m ? m[1] : "";
    };

    try {
      for (const file of Array.from(docFiles)) {
        const formData = new FormData();
        const title = file.name.replace(/\.[^/.]+$/, "");
        formData.append("title", title);
        formData.append("video", file); // keep field name "video" for Multer
        formData.append("type", "file"); // tell backend this is a non-video file

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) =>
              setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1))),
          },
        );

        const uploaded = res.data.video; // server returns the saved doc
        // Prefer server-calculated fields; fallback to local inference
        const serverFileType: string | undefined = uploaded.fileType;
        const localFileType =
          extFromName(file.name) ||
          (file.type === "text/html" ? "html" : "") ||
          "file";

        const newItem: Video = {
          _id: uploaded._id,
          title: uploaded.title || title,
          video_src: uploaded.videoPath, // S3 key like files/<id>.<ext>
          video_length: uploaded.video_length || "", // usually empty for docs
          type: "file",
        };

        setCourse((prev) => {
          const chapters = prev.chapters.map((ch) =>
            ch.chapter_name === chapterName
              ? { ...ch, videos: [...ch.videos, newItem] }
              : ch,
          );
          return { ...prev, chapters };
        });
      }
      toast.success("Files uploaded successfully");
      setDocFiles(null);
    } catch (err) {
      console.error(err);
      toast.error("Error uploading files");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const getVideoSignedUrl = async (id: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${id}/signed-url`,
      );
      return res.data.signedUrl;
    } catch (err) {
      console.error("Error fetching video signed URL:", err);
      return null;
    }
  };

  const getFileSignedUrl = async (id: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${id}/file`,
      );
      return res.data.signedUrl;
    } catch (err) {
      console.error("Error fetching file signed URL:", err);
      return null;
    }
  };

  const uploadCourseVideo = async () => {
    if (!videoFiles || videoFiles.length === 0) {
      toast.error("Select a video file");
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);
    try {
      const file = videoFiles[0];
      const formData = new FormData();
      const title = file.name.replace(/\.[^/.]+$/, "");
      formData.append("title", title);
      formData.append("video", file);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) =>
            setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1))),
        },
      );
      const uploaded = res.data.video;
      const newVideo: Video = {
        _id: uploaded._id,
        title: uploaded.title,
        video_src: uploaded.videoPath,
        video_length: uploaded.video_length,
      };
      setCourse((prev) => ({ ...prev, videos: [newVideo] }));
      setVideoFiles(null);
      const videoSrc = await getVideoSignedUrl(uploaded._id);
      setSelectedVideoSrc(videoSrc);
      toast.success("Video uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error uploading video");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const deleteVideo = async (
    chapterName: string,
    videoIndex: number,
    videoPath: string,
  ) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/delete`,
        { data: { filePath: videoPath } },
      );
      setCourse((prev) => {
        const chapters = prev.chapters.map((ch) =>
          ch.chapter_name === chapterName
            ? {
                ...ch,
                videos: ch.videos.filter((_, idx) => idx !== videoIndex),
              }
            : ch,
        );
        return { ...prev, chapters };
      });
    } catch (err) {
      console.error(err);
      toast.error("Error deleting video");
    }
  };

  const deleteSingleVideo = async (index: number, videoPath: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/delete`,
        { data: { filePath: videoPath } },
      );
      setCourse((prev) => ({
        ...prev,
        videos: prev.videos.filter((_, idx) => idx !== index),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Error deleting video");
    }
  };

  const handleCustomTagSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag("");
    }
  };

  const handleTagClick = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleUploadClick = () => {
    document.getElementById("imageUpload")?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const publishCourse = async () => {
    try {
      let imageUrl = course.course_image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
        );
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
        );
        imageUrl = cloudinaryRes.data.url;
      }
      const payload = {
        ...course,
        course_image: imageUrl,
        htmlDescription: editorHtml,
        description: editorText,
        instructors: [
          ...(includeSelf && currentUserId ? [currentUserId] : []),
          ...additionalInstructors.map((i) => i._id),
        ],
        institution: selectedInstitution?._id,
        organization: selectedOrganization?._id,
        total_chapters:
          course.courseType === "chapter" ? course.chapters.length : 0,
        total_videos:
          course.courseType === "chapter"
            ? course.chapters.reduce(
                (acc, chapter) => acc + chapter.videos.length,
                0,
              )
            : course.videos.length,
      };

      const url = courseId
        ? `/api/admin/courses?id=${courseId}`
        : "/api/admin/courses";
      const method = courseId ? "put" : "post";

      await axios({ url, method, data: payload });
      toast.success(
        courseId
          ? "Course updated successfully 🎉"
          : "Course published successfully 🎉",
      );
    } catch (err: any) {
      console.error("Error saving course:", err);
      if (err.response?.data?.details) {
        const errorDetails = err.response.data.details.join("\n");
        toast.error(`Validation failed:\n${errorDetails}`);
      } else {
        toast.error(
          courseId ? "Error updating course" : "Error publishing course",
        );
      }
    }
  };

  const handleVideoPreview = async (id: string) => {
    const videoSrc = await getVideoSignedUrl(id);
    setSelectedVideoSrc(videoSrc);
  };

  const handleFilePreview = async (id: string) => {
    const fileSrc = await getFileSignedUrl(id);
    window.open(fileSrc, "_blank");
  };

  const handleReorder = (chapterName: string, reorderedVideos: Video[]) => {
    setCourse((prevState) => {
      const updatedChapters = prevState.chapters.map((chapter) =>
        chapter.chapter_name === chapterName
          ? { ...chapter, videos: reorderedVideos }
          : chapter,
      );
      return { ...prevState, chapters: updatedChapters };
    });
  };

  const handleEditVideoTitle = (chapterName: string, videoIndex: string) => {
    const video_id = videoIndex?.split("/")?.pop()?.split(".")?.shift();
    const newTitle = prompt("Enter new title for the item:");
    if (newTitle) {
      axios
        .put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/update`, {
          video_id,
          title: newTitle,
        })
        .then(() => {
          setCourse((prevState) => {
            const updatedChapters = prevState.chapters.map((chapter) => {
              if (chapter.chapter_name === chapterName) {
                const updatedVideos = chapter.videos.map((video) =>
                  video.video_src === videoIndex
                    ? { ...video, title: newTitle }
                    : video,
                );
                return { ...chapter, videos: updatedVideos };
              }
              return chapter;
            });
            return { ...prevState, chapters: updatedChapters };
          });
        })
        .catch((error) => console.error("Error updating title:", error));
    }
  };

  const handleToggleVisibility = (chapterName: string) => {
    setVisibleContent((prevState) => ({
      ...prevState,
      [chapterName]: !prevState[chapterName],
    }));
  };

  return (
    <div className="px-12 text-black dark:text-white">
      {isLoading && <div className="p-4">Loading...</div>}
      {!isLoading && (
        <>
          <h1 className="my-6 font-Monument text-4xl">
            {isEditMode ? "Edit Course" : "Create Course"}
          </h1>
          <div className="mb-6 space-y-4">
            <input
              name="course_name"
              placeholder="Course name"
              value={course.course_name}
              onChange={handleCourseChange}
              className="w-full border bg-transparent p-3 dark:border-[#333333]"
            />
            <select
              title="Select course type"
              name="courseType"
              value={course.courseType}
              onChange={handleCourseChange}
              className="w-full border bg-transparent p-3 dark:border-[#333333]"
            >
              <option value="chapter">Chapter Based</option>
              <option value="video">Single Video</option>
            </select>
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="space-y-2 md:w-1/2">
                <h2>Course Image</h2>
                <input
                  title="Select course image"
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Course preview"
                    width={400}
                    height={256}
                    className="h-64 w-full cursor-pointer object-cover"
                    onClick={handleUploadClick}
                  />
                ) : (
                  <div
                    onClick={handleUploadClick}
                    className="flex h-64 w-full cursor-pointer items-center justify-center border border-dashed"
                  >
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="h-64 overflow-auto md:w-1/2">
                <h2>Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`rounded px-2 py-1 text-sm ${tags.includes(tag) ? "bg-green-600" : "bg-gray-700"} text-white`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={handleCustomTagSubmit}
                  className="mt-2 flex gap-2"
                >
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="flex-1 border bg-transparent p-2 dark:border-[#333333]"
                    placeholder="Add custom tag"
                  />
                  <button
                    type="submit"
                    className="rounded bg-blue-500 px-3 py-1 text-white"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
            <InstructorSelect
              selected={additionalInstructors}
              setSelected={setAdditionalInstructors}
            />
            <div className="flex items-center gap-2">
              <input
                id="includeSelf"
                type="checkbox"
                checked={includeSelf}
                onChange={(e) => setIncludeSelf(e.target.checked)}
              />
              <label htmlFor="includeSelf">Include me as instructor</label>
            </div>
            <InstitutionSearchSelect
              selected={selectedInstitution}
              setSelected={setSelectedInstitution}
            />
            <OrganizationSearchSelect
              selected={selectedOrganization}
              setSelected={setSelectedOrganization}
            />
            <TextEditor
              formats
              text={editorHtml}
              setText={(html) => {
                setEditorHtml(html);
                setEditorText(html);
              }}
              placeholder="Course Description..."
            />
          </div>

          {course.courseType === "chapter" && (
            <>
              <div className="mb-6 space-y-2">
                <h2>Add Chapter</h2>
                <input
                  value={currentChapter}
                  onChange={handleChapterChange}
                  placeholder="Chapter name"
                  className="w-full border bg-transparent p-2 dark:border-[#333333]"
                />
                <button
                  type="button"
                  onClick={addChapter}
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Add Chapter
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <h2>Upload Videos To Chapter</h2>
                <select
                  title="Select chapter"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full border bg-transparent p-2 dark:border-[#333333]"
                >
                  <option value="">Select chapter</option>
                  {course.chapters.map((ch) => (
                    <option key={ch.chapter_name} value={ch.chapter_name}>
                      {ch.chapter_name}
                    </option>
                  ))}
                </select>

                <input
                  title="Upload video files"
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoFilesChange}
                  className="w-full border bg-transparent p-2 dark:border-[#333333]"
                />
                <button
                  type="button"
                  onClick={() => uploadVideos(selectedChapter)}
                  className="rounded bg-yellow-400 px-4 py-2 text-black"
                >
                  {isLoading ? `Uploading ${uploadProgress}%` : "Upload"}
                </button>
              </div>

              {/* === FILE UPLOAD (docs/html) === */}
              <div className="mb-6 space-y-2">
                <h2>Upload Files To Chapter (PDF/DOCX/PPTX/HTML)</h2>
                <select
                  title="Select chapter"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full border bg-transparent p-2 dark:border-[#333333]"
                >
                  <option value="">Select chapter</option>
                  {course.chapters.map((ch) => (
                    <option key={ch.chapter_name} value={ch.chapter_name}>
                      {ch.chapter_name}
                    </option>
                  ))}
                </select>

                <input
                  title="Upload files"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.html,.htm,text/html"
                  onChange={handleDocFilesChange}
                  className="w-full border bg-transparent p-2 dark:border-[#333333]"
                />
                <button
                  type="button"
                  onClick={() => uploadFiles(selectedChapter)}
                  className="rounded bg-indigo-400 px-4 py-2 text-black"
                >
                  {isLoading ? `Uploading ${uploadProgress}%` : "Upload Files"}
                </button>
              </div>
            </>
          )}

          {course.courseType === "video" && (
            <div className="mb-6 space-y-2">
              <h2>Upload Course Video</h2>
              <input
                placeholder="Select video file"
                type="file"
                accept="video/*"
                onChange={handleVideoFilesChange}
                className="w-full border bg-transparent p-2 dark:border-[#333333]"
              />
              <button
                type="button"
                onClick={uploadCourseVideo}
                className="rounded bg-yellow-400 px-4 py-2 text-black"
              >
                {isLoading ? `Uploading ${uploadProgress}%` : "Upload Video"}
              </button>
              {course.videos.map((video, idx) => (
                <div
                  key={video._id}
                  className="mt-2 flex items-center justify-between"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => handleVideoPreview(video._id)}
                  >
                    {video.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteSingleVideo(idx, video.video_src)}
                    className="rounded bg-red-500 px-3 py-1 text-white"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between gap-4">
            {/* {selectedVideoSrc && (
              <div className="mb-6 basis-1/2">
                <VjsHlsWithQuality
                  key={selectedVideoSrc}
                  mp4Url={selectedVideoSrc}
                />
              </div>
            )} */}

            <div className="mb-6 basis-1/2 space-y-4">
              {course.chapters.map((chapter, index) => (
                <div
                  key={index}
                  className="flex flex-col border border-black p-4 dark:border-[#333333]"
                >
                  <div
                    onClick={() => handleToggleVisibility(chapter.chapter_name)}
                    className="mb-4 flex cursor-pointer items-center justify-between"
                  >
                    <h3 className="font-Monument text-xl">
                      {chapter.chapter_name}
                    </h3>
                    <button className="text-black dark:text-white">
                      {visibleContent[chapter.chapter_name] ? (
                        <>
                          <FaAngleDown className="inline-block text-xl" />
                        </>
                      ) : (
                        <>
                          <FaAngleUp className="inline-block text-xl" />
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {visibleContent[chapter.chapter_name] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex">
                          <div className="w-full">
                            <Reorder.Group
                              axis="y"
                              values={chapter.videos}
                              onReorder={(newOrder) =>
                                handleReorder(chapter.chapter_name, newOrder)
                              }
                              className="space-y-4"
                            >
                              {chapter.videos.map((video, vidIndex) => (
                                <Reorder.Item
                                  key={video.video_src}
                                  value={video}
                                  as="div"
                                >
                                  <div
                                    className="flex w-full cursor-grab justify-between rounded-md bg-customWhite p-2 shadow-md"
                                    onClick={() => {
                                      if (video.type === "video") {
                                        handleVideoPreview(video._id);
                                      } else {
                                        handleFilePreview(video._id);
                                      }
                                    }}
                                  >
                                    <div className="flex basis-[60%] flex-col">
                                      <h4 className="break-words text-lg font-medium text-black">
                                        {video.title}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Length: {video.video_length}
                                      </p>
                                    </div>

                                    <div className="flex basis-[30%] flex-col justify-center">
                                      <button
                                        className="w-full rounded bg-blue-500 px-3 py-1 text-white"
                                        onClick={() =>
                                          handleEditVideoTitle(
                                            chapter.chapter_name,
                                            video.video_src,
                                          )
                                        }
                                      >
                                        Edit Title
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteVideo(
                                            chapter.chapter_name,
                                            vidIndex,
                                            video.video_src,
                                          )
                                        }
                                        className="mt-2 w-full rounded bg-red-500 px-3 py-1 text-white"
                                      >
                                        Delete Video
                                      </button>
                                    </div>
                                  </div>
                                </Reorder.Item>
                              ))}
                            </Reorder.Group>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={publishCourse}
            className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            {isEditMode ? "Update Course" : "Publish Course"}
          </button>
          <ToastContainer position="bottom-center" />
        </>
      )}
    </div>
  );
};

export default Page;
