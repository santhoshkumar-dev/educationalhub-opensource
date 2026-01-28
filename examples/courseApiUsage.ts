/**
 * Course API Usage Examples
 *
 * This file demonstrates how to use the updated Course API with proper validation.
 */

import { BaseCourseData, CourseType } from "@/types/course";

// Example 1: Creating a chapter-based course
export const createChapterBasedCourse = async () => {
  const courseData: BaseCourseData = {
    courseType: "chapter",
    course_name: "Advanced React Development",
    course_image: "https://example.com/react-course.jpg",
    htmlDescription: "<p>Learn advanced React concepts and patterns</p>",
    description:
      "A comprehensive course covering advanced React development techniques.",
    chapters: [
      {
        chapter_name: "React Hooks Deep Dive",
        videos: [
          {
            video_src: "/videos/react-hooks/intro.mp4",
            title: "Introduction to Hooks",
            video_length: "15:30",
            preview: true,
          },
          {
            video_src: "/videos/react-hooks/usestate.mp4",
            title: "useState Hook",
            video_length: "12:45",
          },
        ],
      },
      {
        chapter_name: "Context API and State Management",
        videos: [
          {
            video_src: "/videos/context/intro.mp4",
            title: "Context API Basics",
            video_length: "18:20",
          },
        ],
      },
    ],
    tags: ["react", "javascript", "frontend"],
    price: 99.99,
    isPaid: true,
    published: false,
  };

  try {
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Validation errors:", error.details);
      return;
    }

    const result = await response.json();
    console.log("Course created successfully:", result);
  } catch (error) {
    console.error("Error creating course:", error);
  }
};

// Example 2: Creating a video-based course
export const createVideoBasedCourse = async () => {
  const courseData: BaseCourseData = {
    courseType: "video",
    course_name: "JavaScript Fundamentals",
    course_image: "https://example.com/js-course.jpg",
    htmlDescription: "<p>Master the fundamentals of JavaScript programming</p>",
    description: "Learn JavaScript from scratch with practical examples.",
    videos: [
      {
        video_src: "/videos/js-fundamentals/variables.mp4",
        title: "Variables and Data Types",
        video_length: "20:15",
        preview: true,
      },
      {
        video_src: "/videos/js-fundamentals/functions.mp4",
        title: "Functions and Scope",
        video_length: "25:30",
      },
      {
        video_src: "/videos/js-fundamentals/objects.mp4",
        title: "Objects and Arrays",
        video_length: "22:45",
      },
    ],
    tags: ["javascript", "programming", "beginner"],
    price: 49.99,
    isPaid: true,
    published: true,
    instructors: ["507f1f77bcf86cd799439011"], // Example ObjectId
    organization: "507f1f77bcf86cd799439012", // Example ObjectId
  };

  try {
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    const result = await response.json();
    console.log("Course created:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Example 3: Updating a course
export const updateCourse = async (courseId: string) => {
  const updateData = {
    course_name: "Advanced React Development - Updated",
    price: 129.99,
    published: true,
    tags: ["react", "javascript", "frontend", "advanced"],
  };

  try {
    const response = await fetch(`/api/admin/courses?id=${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    console.log("Course updated:", result);
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

// Example 4: Fetching courses with pagination
export const fetchCourses = async (page = 1, limit = 10, sort = "newest") => {
  try {
    const response = await fetch(
      `/api/admin/courses?page=${page}&limit=${limit}&sort=${sort}`,
    );

    const result = await response.json();
    console.log("Courses:", result.courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
};

// Example 5: Deleting a course
export const deleteCourse = async (courseId: string) => {
  try {
    const response = await fetch(`/api/admin/courses?id=${courseId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    console.log("Course deleted:", result);
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};

// Example 6: Validation error handling
export const handleValidationErrors = async (courseData: BaseCourseData) => {
  try {
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();

      if (error.error === "Validation failed") {
        console.log("Validation errors found:");
        error.details.forEach((detail: string, index: number) => {
          console.log(`${index + 1}. ${detail}`);
        });
      } else {
        console.error("Other error:", error.error);
      }
      return;
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Network error:", error);
  }
};
