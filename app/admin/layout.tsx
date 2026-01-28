import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { getCurrentUser } from "@/lib/auth/user/getCurrentUser";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
