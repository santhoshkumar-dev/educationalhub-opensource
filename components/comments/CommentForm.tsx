// components/CommentForm.tsx
"use client";

import { useState } from "react";
import { CommentFormData } from "@/types/comment";

interface CommentFormProps {
  onSubmit: (
    data: CommentFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  parentCommentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  parentCommentId,
  placeholder = "Write a comment...",
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit({
      text: text.trim(),
      parentCommentId,
    });

    if (result.success) {
      setText("");
      onCancel?.(); // Close reply form if it's a reply
    } else {
      setError(result.error || "Failed to post comment");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          maxLength={1000}
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {text.length}/1000 characters
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
