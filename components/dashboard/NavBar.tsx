"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Landmark,
  University,
  Users,
} from "lucide-react";

const Links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <GraduationCap /> },
  { href: "/admin/dashboard/courses", label: "Courses", icon: <BookOpen /> },
  { href: "/admin/dashboard/users", label: "Users", icon: <Users /> },
  {
    href: "/admin/dashboard/institutions",
    label: "Institutions",
    icon: <Landmark />,
  },
  {
    href: "/admin/dashboard/universities",
    label: "Universities",
    icon: <University />,
  },
  {
    href: "/admin/dashboard/organizations",
    label: "Organizations",
    icon: <Building2 />,
  },
];

function NavBar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `mx-4 text-base px-4 py-2 md:text-lg flex gap-2 ${
      pathname === href || pathname.startsWith(href + "/")
        ? "text-primaryPurple font-semibold  border  border-primaryPurple"
        : ""
    }`;

  return (
    <nav className="flex border-r px-10 pt-10">
      <div className="flex flex-col gap-5">
        {Links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(link.href)}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
