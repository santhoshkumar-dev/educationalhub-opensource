import { Metadata } from "next";
import SignInPage from "./SignInPage";

export const metadata: Metadata = {
  title: "Login to Educational Hub | Access Your Courses",
  description:
    "Sign in to Educational Hub to access your online courses, learning resources, and continue your career growth journey.",
  keywords: [
    "Educational Hub login",
    "Sign in Educational Hub",
    "Access online courses",
    "Student login",
    "Learning portal login",
    "Career growth platform",
  ],
  openGraph: {
    title: "Login to Educational Hub",
    description:
      "Sign in to Educational Hub to access courses and learning resources.",
    url: "https://your-domain.com/sign-in",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login - Educational Hub",
    description:
      "Sign in to Educational Hub and continue your learning journey.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
};

export default function Page() {
  return <SignInPage />;
}
