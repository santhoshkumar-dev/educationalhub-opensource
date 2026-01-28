import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Note from "@/models/notes";

// DELETE a specific note
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; noteId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: params.noteId,
      userId: userId, // Ensure the user owns the note
    });

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
