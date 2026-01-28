import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = auth();

  if (!sessionClaims) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
