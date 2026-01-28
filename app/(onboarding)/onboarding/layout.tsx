export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { sessionClaims } = auth();

    if (!sessionClaims) {
      console.warn("No session found — redirecting to sign-in");
      redirect("/sign-in");
    }

    if ((sessionClaims as any)?.metadata?.onboardingComplete === true) {
      console.log("✅ User has completed onboarding");

      redirect("/");
    } else {
      console.log("🚧 Onboarding incomplete");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("🔥 Clerk auth() failed in onboarding layout:", error);
    redirect("/sign-in"); // fallback for broken session or middleware issue
  }
}
