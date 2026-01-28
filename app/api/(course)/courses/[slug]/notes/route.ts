import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Note from "@/models/notes";
import Course from "@/models/course";
import connectMongoDB from "@/lib/connectMongoDB";

// GET notes for a specific chapter
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json(
      { error: "Chapter ID is required" },
      { status: 400 },
    );
  }

  try {
    await connectMongoDB();
    const course = await Course.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const notes = await Note.find({
      userId: userId,
      courseId: course._id,
      chapterId: chapterId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST a new note for a specific chapter
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, chapterId } = await req.json();

    await connectMongoDB();
    const course = await Course.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const newNote = new Note({
      content,
      userId: userId,
      courseId: course._id,
      chapterId: chapterId,
    });

    await newNote.save();
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
