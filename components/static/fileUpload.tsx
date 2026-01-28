"use client";
import React, { useState } from "react";
import Player from "next-video/player";

const VideoUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoPaths, setVideoPaths] = useState<string[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setVideoPaths([]);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", "Video description");
    formData.append("video", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful:", data);
        setVideoPaths([
          `${process.env.NEXT_PUBLIC_SERVER_URL}${data.video.videoPath}`,
        ]);
        setCurrentVideo(
          `${process.env.NEXT_PUBLIC_SERVER_URL}${data.video.videoPath}`,
        );
        setVideoId(data.video._id);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoPath: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        console.log("Delete successful");
        setVideoPaths(videoPaths.filter((path) => path !== videoPath));
        if (currentVideo === videoPath) {
          setCurrentVideo(videoPaths.length > 1 ? videoPaths[0] : null);
        }
      } else {
        console.error("Delete failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input
          name="video"
          title="Video"
          type="file"
          onChange={handleFileChange}
          accept="video/*"
          className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-black text-sm text-gray-900 focus:outline-none dark:bg-gray-50"
        />
        {file && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            className="block w-full rounded-lg border border-gray-300 bg-black text-sm text-gray-900 focus:outline-none dark:bg-gray-50"
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-black dark:text-white ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        {loading && <p className="text-orange-500">Loading...</p>}
      </form>
      {videoPaths.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Converted Videos:</h3>
          <ul className="space-y-2">
            {videoPaths.map((path, index) => (
              <li key={index} className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentVideo(path)}
                  className="rounded-lg bg-green-500 px-4 py-2 text-black hover:bg-green-700 dark:text-white"
                >
                  Video
                </button>
                <button
                  onClick={() => handleDelete(path)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-black hover:bg-red-700 dark:text-white"
                >
                  Delete Video
                </button>
              </li>
            ))}
          </ul>
          {currentVideo && (
            <div className="mt-4">
              <Player className="mx-auto w-full max-w-lg" src={currentVideo} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploadForm;
