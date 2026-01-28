export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import User from "@/models/userModel";

export async function getCurrentUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await User.findOne({ clerk_id: userId });

  if (!user) {
    return null;
  }

  return user;
}
