import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Resources - Educational Hub | Tools & Guides",
  description:
    "Explore top free developer resources, tools, cheat sheets, and guides curated by Educational Hub to support your learning and coding journey.",
  keywords: [
    "Developer resources",
    "Free coding tools",
    "Programming guides",
    "Educational Hub resources",
    "Developer cheat sheets",
    "Frontend backend resources",
    "Full stack development tools",
    "Learning resources for developers",
  ],
  openGraph: {
    title: "Developer Resources - Educational Hub",
    description:
      "Browse free developer tools, code references, and guides on Educational Hub to level up your programming skills.",
    url: "https://educationalhub.in/resources",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources for Developers - Educational Hub",
    description:
      "Find hand-picked coding tools, developer kits, and learning guides curated by Educational Hub.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
