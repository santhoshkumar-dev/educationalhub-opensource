import { useState, useEffect } from "react";

export function useCourseLike(courseSlug: string) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    // 🛑 GUARD CLAUSE: Prevent API call if courseSlug is invalid or a loading placeholder
    // The placeholder URLs (loading-0, loading-1, etc.) indicate the prop isn't ready.
    if (!courseSlug || courseSlug.startsWith("loading-")) {
      // You can optionally reset state or just skip the fetch
      setLiked(false);
      setLikesCount(0);
      return;
    }

    const fetchLikeStatus = async () => {
      try {
        // Use the valid courseSlug for the API call
        const res = await fetch(`/api/courses/${courseSlug}/like-status`);
        const data = await res.json();

        if (res.ok) {
          setLiked(data.liked);
          setLikesCount(data.likes ?? 0);
        } else {
          console.error("Failed to fetch like status:", data.error);
          // Important: Reset state on API error to avoid showing stale data
          setLiked(false);
          setLikesCount(0);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
        // Reset state on network failure
        setLiked(false);
        setLikesCount(0);
      }
    };

    fetchLikeStatus();
  }, [courseSlug]);

  const likeCourse = async () => {
    if (liked) return; // Prevent double like

    try {
      const res = await fetch(`/api/courses/${courseSlug}/like`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setLiked(true);
        setLikesCount(data.likes ?? 0);
      } else {
        console.error("Failed to like course:", data.error);
      }
    } catch (error) {
      console.error("Error liking course:", error);
    }
  };

  const unlikeCourse = async () => {
    if (!liked) return; // Prevent unliking if not liked

    try {
      const res = await fetch(`/api/courses/${courseSlug}/like`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setLiked(false);
        setLikesCount(data.likes ?? 0);
      } else {
        console.error("Failed to unlike course:", data.error);
      }
    } catch (error) {
      console.error("Error unliking course:", error);
    }
  };

  return { liked, likeCourse, unlikeCourse, likesCount };
}
