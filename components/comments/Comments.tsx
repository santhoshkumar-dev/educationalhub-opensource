// components/Comments.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Comment, CommentFormData } from "@/types/comment";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

interface CommentsProps {
  courseSlug: string;
}

export default function Comments({ courseSlug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${courseSlug}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (formData: CommentFormData) => {
    try {
      const response = await fetch(`/api/courses/${courseSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }

      const data = await response.json();

      // Add new comment to the list
      setComments((prev) => [data.comment, ...prev]);

      return { success: true };
    } catch (err) {
      console.error("Error posting comment:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to post comment",
      };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchComments}
          className="mt-2 text-red-700 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  const topLevelComments = comments.filter((comment) => !comment.parentComment);
  const getReplies = (commentId: string) =>
    comments.filter((comment) => comment.parentComment === commentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {isSignedIn && (
        <CommentForm
          onSubmit={handleCommentSubmit}
          placeholder="Share your thoughts about this course..."
        />
      )}

      {!isSignedIn && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-700">
            Please sign in to leave a comment and join the discussion.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              replies={getReplies(comment._id)}
              onReply={handleCommentSubmit}
              courseSlug={courseSlug}
            />
          ))
        )}
      </div>
    </div>
  );
}
