import { notFound } from "next/navigation";
import { OrgProvider } from "./OrgContext";
import { BookOpen, CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getOrg(slug: string) {
  const res = await fetch(
    `https://educationalhub.in/api/organizations/${slug}`,
    {
      next: { revalidate: 60 },
    },
  );
  if (!res.ok) notFound();
  return res.json();
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const data = await getOrg(params.slug);
  return (
    <OrgProvider
      value={{ organization: data.organization, courses: data.courses || [] }}
    >
      <>
        <div
          className="flex h-[400px] w-full flex-col items-center justify-center gap-4"
          style={{
            backgroundImage: "url('/custom/banner.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative h-32 w-32 overflow-hidden rounded-full">
            <Image
              src={data.organization.logo || "/default-profile.png"}
              alt="Logo"
              className="object-cover"
              sizes="128px"
              fill
            />
          </div>

          <h1 className="font-Monument text-4xl text-white">
            {data.organization?.name}
          </h1>
        </div>
      </>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col items-center border-r px-10 pt-10 md:flex">
          <nav className="flex w-full flex-col gap-3 text-xl font-medium">
            <a
              href={`/org/${params.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded px-3 py-2 hover:bg-white/10"
            >
              <CircleUser className="h-5 w-5" /> <span>About</span>
            </a>

            <a
              href={`/org/${params.slug}/courses`}
              className="flex w-full items-center justify-center gap-2 rounded px-3 py-2 hover:bg-white/10"
            >
              <BookOpen className="h-5 w-5" /> <span>Courses</span>
            </a>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </OrgProvider>
  );
}
