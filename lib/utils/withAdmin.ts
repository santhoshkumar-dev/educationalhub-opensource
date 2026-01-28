import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../connectMongoDB";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";

export function withAdmin<T = any>(
  handler: (req: NextRequest, context: T) => Promise<Response>,
): (req: NextRequest, context: T) => Promise<Response> {
  return async function (req: NextRequest, context: T) {
    try {
      await connectMongoDB();

      const { userId } = auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await User.findOne({ clerk_id: userId }).select("role");

      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admins only" },
          { status: 403 },
        );
      }

      return handler(req, context);
    } catch (error) {
      console.error("withAdmin error:", error);
      return NextResponse.json(
        { error: "Authorization middleware error" },
        { status: 500 },
      );
    }
  };
}
