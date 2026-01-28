"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@heroui/react";

interface NoteFormProps {
  courseSlug: string;
  chapterId: string;
  onNoteCreated: () => void;
}

export function NoteForm({
  courseSlug,
  chapterId,
  onNoteCreated,
}: NoteFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${courseSlug}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, chapterId }),
      });

      if (response.ok) {
        setContent("");
        onNoteCreated();
      } else {
        console.error("Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Your notes for this lesson..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        style={{
          outline: "none",
        }}
      />
      <Button type="submit" disabled={isSubmitting || !chapterId}>
        {isSubmitting ? "Adding..." : "Add Note"}
      </Button>
    </form>
  );
}
