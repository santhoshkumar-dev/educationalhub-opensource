// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "@bprogress/next/app";
import TextEditor from "@/components/static/textEditor";
import Player from "next-video/player";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface Chapter {
  chapter_name: string;
  videos: Video[];
}

interface Video {
  title: string;
  video_src: string;
  video_length: string;
  isVisible: boolean;
}

interface Course {
  course_name: string;
  course_image?: string;
  chapters: Chapter[];
  description: string;
  total_chapters?: number;
  total_videos?: number;
  tags?: string[];
  instructor?: string;
  isPaid?: boolean;
}

const predefinedTags = [
  "Web Development",
  "Python",
  "JavaScript",
  "React",
  "Machine Learning",
  "Data Science",
  "Artificial Intelligence",
  "HTML",
  "CSS",
  "SQL",
  "Node.js",
  "Cybersecurity",
  "Blockchain",
  "Cloud Computing",
  "AWS",
  "Docker",
  "DevOps",
  "Java",
  "C#",
  "Swift",
  "Android Development",
  "iOS Development",
  "Kotlin",
  "Angular",
  "Vue.js",
  "TypeScript",
  "Ruby on Rails",
  "PHP",
  "Flutter",
  "Unity",
  "Game Development",
  "UI/UX Design",
  "Graphic Design",
  "Photography",
  "Video Editing",
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Business Analysis",
  "Project Management",
  "Agile",
  "Scrum",
  "Financial Modeling",
  "Accounting",
  "Entrepreneurship",
  "Leadership",
  "Sales",
  "Communication Skills",
  "Public Speaking",
  "Time Management",
  "Personal Development",
  "Mindfulness",
  "Yoga",
  "Health & Fitness",
];

function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [course, setCourse] = useState<Course>({
    course_name: "",
    chapters: [],
    description: "",
  });
  const [description, setDescription] = useState<string>("");
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [videoFiles, setVideoFiles] = useState<FileList | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVideoSrc, setSelectedVideoSrc] = useState<string | null>(null);
  const [visibleContent, setVisibleContent] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(
    "https://via.placeholder.com/500x500",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/instructor/my-courses/${id}`);
        console.log(response.data);

        setCourse(response.data[0]);
        setDescription(response.data[0].description);
        setTags(response.data[0].tags);
        setImagePreview(response.data[0].course_image);
      } catch (error) {
        toast.error("Error fetching course");

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);

        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [id, router]);

  const handleCourseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Update the image preview URL
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleTagClick = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      console.log("Tags:", tags);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUploadClick = () => {
    document.getElementById("imageUpload")?.click();
  };

  const handleCustomTagSubmit = (e) => {
    e.preventDefault();
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      // also add it to the predefined tags list
      predefinedTags.push(customTag);
      setCustomTag(""); // Clear the input field after adding the tag
    }
  };

  const handleChapterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setCurrentChapter(capitalizedValue);
  };

  const addChapter = () => {
    if (!currentChapter) {
      alert("Please enter a chapter name");
      return;
    }
    setCourse((prevState) => ({
      ...prevState,
      chapters: [
        ...prevState.chapters,
        { chapter_name: currentChapter, videos: [] },
      ],
    }));
    setCurrentChapter("");
  };

  useEffect(() => {
    setCourse((prevState) => ({ ...prevState, tags }));
  }, [tags]);

  const handleVideoFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles(e.target.files);
    }
  };

  const uploadVideos = async (chapterName: string) => {
    if (!chapterName) {
      alert("Please select a chapter");
      return;
    }
    if (!videoFiles || videoFiles.length === 0) {
      alert("Please select video files");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const formData = new FormData();
        formData.append("title", file.name.split(".").slice(0, -1).join("."));
        formData.append("video", file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1),
              );
              setUploadProgress(percentCompleted);
            },
          },
        );

        const newVideo: Video = {
          title: response.data.video.title,
          video_src: response.data.video.videoPath,
          video_length: response.data.video.video_length,
          isVisible: true,
        };

        setSelectedVideoSrc(`${response.data.video.videoPath}`);

        setCourse((prevState) => {
          const updatedChapters = prevState.chapters.map((chapter) =>
            chapter.chapter_name === chapterName
              ? { ...chapter, videos: [...chapter.videos, newVideo] }
              : chapter,
          );
          return { ...prevState, chapters: updatedChapters };
        });
      }

      setVisibleContent((prevState) => ({
        ...prevState,
        [chapterName]: true,
      }));

      setVideoFiles(null);
    } catch (error) {
      console.error("Error uploading videos:", error);
    } finally {
      setLoading(false);
      setUploadProgress(100); // Ensure progress is set to 100% when done
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
        {
          data: { filePath: videoPath },
        },
      );

      setCourse((prevState) => {
        const updatedChapters = prevState.chapters.map((chapter) => {
          if (chapter.chapter_name === chapterName) {
            const updatedVideos = chapter.videos.filter(
              (_, index) => index !== videoIndex,
            );
            return { ...chapter, videos: updatedVideos };
          }
          return chapter;
        });
        return { ...prevState, chapters: updatedChapters };
      });
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleToggleVisibility = (chapterName: string) => {
    setVisibleContent((prevState) => ({
      ...prevState,
      [chapterName]: !prevState[chapterName],
    }));
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

  const handleVideoClick = (src: string) => {
    setSelectedVideoSrc(src);
  };

  const handleEditVideoTitle = (chapterName: string, videoIndex: string) => {
    const video_id = videoIndex?.split("/")?.pop()?.split(".")?.shift();
    const newTitle = prompt("Enter new title for the video:");
    // do a api call to update the title with the video id
    if (newTitle) {
      console.log("New title:", newTitle);

      const response = axios
        .put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/update`, {
          video_id,
          title: newTitle,
        })
        .then((res) => {
          console.log("Response:", res.data);
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
        .catch((error) => {
          console.error("Error updating video title:", error);
        });
    }
  };

  const publishCourse = async () => {
    console.log("Publishing course:", course);
    course.total_chapters = course.chapters.length;
    course.total_videos = course.chapters.reduce(
      (acc, chapter) => acc + chapter.videos.length,
      0,
    );

    try {
      const formData = new FormData();

      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default",
      );

      if (imageFile === course.course_image) {
        console.log("Image not changed");
      } else {
        console.log("Image changed");

        await axios
          .post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData,
          )
          .then((res) => {
            console.log("Uploaded image to cloudinary:", res.data);
            setCourse((prevState) => ({
              ...prevState,
              course_image: res.data.url,
              instructor: user?.id,
            }));
            console.log(user?.id);
            console.log("Course to be published:", course);
          })
          .catch((error) => {
            console.error("Error uploading image to cloudinary:", error);
          });
      }

      console.log("Course to be published:", course);

      const response = await axios.patch(
        `/api/instructor/my-courses/${course._id}`,
        course,
      );
      if (response.status === 200) {
        toast.success("Course published successfully");
        router.push("/dashboard");
      } else {
        toast.error("Error publishing course");
      }
    } catch (error) {
      console.error("Error publishing course:", error);
      toast.error("Error publishing course");
    }
  };

  return (
    <div className="px-12 text-black dark:text-white">
      <h1 className="my-6 font-Monument text-4xl">Edit Course</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Course Details</h2>
        <input
          className="my-3 w-full border border-black bg-transparent p-4 dark:border-[#333333] dark:text-white dark:placeholder:text-[#ffffff6d]"
          type="text"
          name="course_name"
          placeholder="Course Name"
          value={course.course_name}
          onChange={handleCourseChange}
        />
        <div
          style={{ marginBottom: "20px" }}
          className="flex flex-col gap-7 md:flex-row"
        >
          <div className="basis-1/2">
            <h2 className="my-3">Course Image</h2>
            <input
              title="Upload Image"
              type="file"
              name="imageUpload"
              accept="image/*"
              id="imageUpload"
              className="hidden"
              onChange={handleFileChange}
            />
            <Image
              src={imagePreview as string}
              alt="Profile Image"
              className="h-[500px] w-[500px] cursor-pointer object-cover"
              onClick={handleUploadClick}
              width={500}
              height={500}
            />
          </div>

          <div className="h-[500px] w-full overflow-auto">
            <div className="flex-wrap">
              <h2 className="my-3">Course Tags</h2>
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    handleTagClick(tag);

                    if (tags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      setTags([...tags, tag]);
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    margin: "5px",
                    background: tags.includes(tag) ? "#4CAF50" : "#555",
                    color: "#fff",
                  }}
                >
                  {tag}
                </button>
              ))}
              <form onSubmit={handleCustomTagSubmit}>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  className="border border-black bg-transparent text-black dark:border-[#333333] dark:text-white"
                  style={{ padding: "10px", margin: "5px" }}
                />
                <button
                  type="submit"
                  style={{ padding: "10px 20px", margin: "5px" }}
                >
                  Add Tag
                </button>
              </form>
            </div>
          </div>
        </div>

        <TextEditor
          formats={true}
          text={description}
          setText={(text: string) => {
            setDescription(text);
            setCourse((prevState) => ({ ...prevState, description: text }));
          }}
          placeholder="Course Description..."
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Add Chapter</h2>
        <input
          className="my-3 w-full border border-black bg-transparent p-4 dark:border-[#333333] dark:text-white dark:placeholder:text-[#ffffff6d]"
          type="text"
          placeholder="Chapter Name"
          value={currentChapter}
          onChange={handleChapterChange}
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px",
          }}
        />
        <button
          onClick={addChapter}
          style={{ padding: "10px 20px", background: "#000", color: "#fff" }}
        >
          Add Chapter
        </button>
      </div>

      <div>
        <h2>Upload Videos To Chapter</h2>
        <select
          title="Select Chapter"
          name="chapter"
          className="my-3 w-full border border-white bg-[#191919] p-4 text-white"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px",
          }}
        >
          <option value="">Select Chapter</option>
          {course.chapters.map((chapter, index) => (
            <option key={index} value={chapter.chapter_name}>
              {chapter.chapter_name}
            </option>
          ))}
        </select>

        <input
          title="Upload Videos"
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoFilesChange}
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px",
          }}
        />
        <button
          onClick={() => uploadVideos(selectedChapter)}
          style={{ padding: "10px 20px", background: "#ff0", color: "#000" }}
        >
          {loading ? <p>Uploading... {uploadProgress}%</p> : "Upload Videos"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Course Preview</h2>
        <div className="flex flex-col gap-12 md:flex-row">
          <div className="md:basis-[70%]">
            {selectedVideoSrc && (
              <Player
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}${selectedVideoSrc}`}
                className="h-[500px] w-full"
              />
            )}
          </div>

          <div className="flex flex-col overflow-y-auto md:h-[500px] md:w-full md:basis-[30%]">
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
                                  onClick={() =>
                                    handleVideoClick(video.video_src)
                                  }
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
      </div>

      <button
        onClick={publishCourse}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#018DFF",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Publish Course
      </button>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Page;
