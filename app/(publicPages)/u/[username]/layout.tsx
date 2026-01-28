"use client";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Settings,
  SquarePen,
  Twitter,
} from "lucide-react";
import { useFollow } from "@/hooks/useFollow";
import { useMongoUser } from "@/app/context/UserContext";
import { useRouter } from "next/router";

interface PublicUser {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  bio: string;
  role: "user" | "instructor" | "admin";
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
  linkedin?: string;
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const username = params.username as string;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  const { followed, follow, unfollow } = useFollow(username, setFollowerCount);
  const currentUser = useMongoUser();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`/api/u/${username}`);
        if (!userRes.ok) throw new Error("Failed to fetch user data");

        const userData = await userRes.json();
        setUser(userData.user);
      } catch (error) {
        console.error("Error fetching layout data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const base = `/u/${username}`;

  // Links array (will only render after loading)
  const links = [
    { href: `${base}`, label: "About" },
    { href: `${base}/courses`, label: "Courses", hide: user?.role === "user" },
    { href: `${base}/library`, label: "Library" },
    { href: `${base}/enrolled-courses`, label: "Enrolled" },
    { href: `${base}/liked-courses`, label: "Liked" },
  ];

  const linkClass = (href: string, hide?: boolean) => {
    const isActive =
      href === base ? pathname === href : pathname.startsWith(href);
    return `px-3 py-2 text-sm md:px-4 md:text-base transition-colors ${
      hide
        ? "hidden"
        : isActive
          ? "border-b-2 border-primaryPurple text-primaryPurple"
          : ""
    }`;
  };

  return (
    <section className="min-h-screen">
      {/* --- USER PROFILE HEADER --- */}
      <div
        style={{
          backgroundImage: "url('/custom/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="flex flex-col items-center space-y-5 p-4 pt-12 md:p-10"
      >
        {/* Profile Image */}
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white">
          {loading ? (
            <Skeleton className="h-32 w-32 rounded-full bg-white/20" />
          ) : (
            <Image
              src={user?.profile_image_url || "/default-profile.png"}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
              width={128}
              height={128}
            />
          )}
        </div>

        {/* Name */}
        {loading ? (
          <Skeleton className="h-8 w-60 bg-white/20" />
        ) : (
          <h1 className="text-center font-Monument text-2xl text-white md:text-4xl">
            {user?.first_name} {user?.last_name}
          </h1>
        )}

        {/* Social Links */}
        {(user?.facebook ||
          user?.instagram ||
          user?.twitter ||
          user?.linkedin ||
          user?.website) && (
          <div className="mb-1 mt-1 flex min-h-[40px] flex-wrap justify-center gap-4">
            {loading
              ? Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="h-10 w-10 rounded-full bg-white/20"
                    />
                  ))
              : [
                  { key: "facebook", icon: <Facebook />, href: user?.facebook },
                  {
                    key: "instagram",
                    icon: <Instagram />,
                    href: user?.instagram,
                  },
                  { key: "twitter", icon: <Twitter />, href: user?.twitter },
                  { key: "linkedin", icon: <Linkedin />, href: user?.linkedin },
                  { key: "website", icon: <Globe />, href: user?.website },
                ]
                  .filter((item) => item.href)
                  .map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="rounded-full bg-white/20 p-2 text-white transition-opacity hover:opacity-80">
                        {item.icon}
                      </div>
                    </a>
                  ))}
          </div>
        )}

        {/* Edit Buttons */}
        {user && currentUser && currentUser.username === username && (
          <div className="mt-2 flex gap-4">
            <button
              type="button"
              className="flex items-center gap-2 border border-primaryPurple bg-transparent px-4 py-2 text-white transition-colors hover:bg-primaryPurple hover:text-white md:px-8"
            >
              <SquarePen />
              <span>Edit Banner</span>
            </button>

            <a
              type="button"
              className="flex items-center gap-2 border border-primaryPurple bg-transparent px-4 py-2 text-white transition-colors hover:bg-primaryPurple hover:text-white md:px-8"
              href="/my-profile/edit-profile"
            >
              <Settings />
              <span>Edit Profile</span>
            </a>
          </div>
        )}

        {/* Follow Button & Follower Count */}
        <div className="mt-2 flex min-h-[40px] items-center gap-3">
          {loading ? (
            <Skeleton className="h-10 w-48 rounded-md bg-white/20" />
          ) : (
            user &&
            currentUser &&
            currentUser.username !== username && (
              <>
                <button
                  onClick={followed ? unfollow : follow}
                  className="rounded-md border border-primaryPurple px-4 py-2 text-white transition-colors hover:bg-primaryPurple/20"
                >
                  {followed ? "Unfollow" : "Follow"}
                </button>
                <span className="text-white/70">
                  {followerCount}{" "}
                  {followerCount === 1 ? "Follower" : "Followers"}
                </span>
              </>
            )
          )}
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <nav className="sticky top-0 z-10 flex justify-center gap-2 border-b p-4 backdrop-blur-md md:gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-8 w-24 rounded-md bg-white/20"
                />
              ))
          : links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href, link.hide)}
              >
                {link.label}
              </Link>
            ))}
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="p-4 md:p-8">{children}</main>
    </section>
  );
}
