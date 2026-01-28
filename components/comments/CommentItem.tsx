// components/CommentItem.tsx
"use client";

import { useState } from "react";
import { Comment, CommentFormData } from "@/types/comment";
import CommentForm from "./CommentForm";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (
    data: CommentFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  courseSlug: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  replies,
  onReply,
  courseSlug,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { isSignedIn } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString();
  };

  const handleReplySubmit = async (data: CommentFormData) => {
    const result = await onReply({
      ...data,
      parentCommentId: comment._id,
    });

    if (result.success) {
      setShowReplyForm(false);
    }

    return result;
  };

  return (
    <div className={`${isReply ? "ml-8" : ""}`}>
      <div className="rounded-lg border p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              {comment.user.profile_image_url ? (
                <Image
                  title="profile"
                  alt="profile"
                  src={comment.user.profile_image_url}
                  className="rounded-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {comment.user.first_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center space-x-2">
              <h4 className="font-medium">
                {`${comment.user?.first_name} ${comment.user?.last_name}` ||
                  "Anonymous User"}
              </h4>
              <span className="text-sm text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <p className="whitespace-pre-wrap">{comment.text}</p>

            <div className="mt-3 flex items-center space-x-4">
              {isSignedIn && !isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              )}

              {replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {showReplies ? "Hide" : "Show"} {replies.length}{" "}
                  {replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && (
          <div className="ml-11 mt-4">
            <CommentForm
              onSubmit={handleReplySubmit}
              placeholder="Write a reply..."
              autoFocus
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {showReplies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              courseSlug={courseSlug}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
