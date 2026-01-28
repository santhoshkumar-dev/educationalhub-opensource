export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ClientButton from "@/components/button/goHome";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { sessionClaims } = auth();
    const role = sessionClaims?.metadata?.role;

    if (role === "admin") {
      return <>{children}</>;
    }

    if (role === "instructor") {
      return (
        <div className="container mx-auto flex h-[70vh] flex-col items-center justify-center p-4 text-black dark:text-white">
          <h1 className="text-4xl">
            We are working hard to bring the best experience to you.
          </h1>
          <p className="mt-2 text-black dark:text-white">
            This page is currently under construction. Please check back later
            for updates.
          </p>
          <div className="mt-4">
            <ClientButton />
          </div>
        </div>
      );
    }

    console.warn("⛔ Unauthorized role — redirecting...");
    redirect("/");
  } catch (err) {
    console.error("🔥 Clerk auth() error:", err);
    redirect("/"); // fallback for broken session or missing middleware
  }
}
