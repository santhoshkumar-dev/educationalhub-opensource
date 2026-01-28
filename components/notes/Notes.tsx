"use client";

import { useState, useEffect, useCallback } from "react";
import { NoteForm } from "./NoteForm";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Note {
  _id: string;
  content: string;
  createdAt: string;
}

interface NotesProps {
  courseSlug: string;
  chapterId: string;
}

export function Notes({ courseSlug, chapterId }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses/${courseSlug}/notes?chapterId=${chapterId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseSlug, chapterId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(
        `/api/courses/${courseSlug}/notes/${noteId}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        fetchNotes(); // Refresh notes after deletion
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  if (!chapterId) {
    return null; // Don't render anything if no chapter is selected
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">My Notes for this Lesson</h2>
      <NoteForm
        courseSlug={courseSlug}
        chapterId={chapterId}
        onNoteCreated={fetchNotes}
      />
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div>Loading notes...</div>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="relative rounded-lg border bg-background/50 p-4"
            >
              <p className="text-muted-foreground text-sm">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNote(note._id)}
                className="absolute right-2 top-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            You havent added any notes for this lesson yet.
          </p>
        )}
      </div>
    </div>
  );
}
