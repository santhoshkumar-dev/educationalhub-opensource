import { Metadata } from "next";
import SignUpPage from "./SignUpPage";

export const metadata: Metadata = {
  title: "Create Your Account | Join Educational Hub",
  description:
    "Sign up on Educational Hub to access online courses, resources, and build your career with skill-based learning.",
  keywords: [
    "Educational Hub sign up",
    "Create account Educational Hub",
    "Join online courses",
    "Student registration",
    "E-learning signup",
    "Skill development platform",
  ],
  openGraph: {
    title: "Join Educational Hub",
    description:
      "Create your account to access top online courses and build your skills at Educational Hub.",
    url: "https://educationalhub.in/sign-up",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - Educational Hub",
    description:
      "Create your Educational Hub account and start your learning journey with skill-based online courses.",
    images: [
      "https://res.cloudinary.com/duhg69iln/image/upload/v1726305829/wg0mwcu9yjkjhsacesyv.png",
    ],
  },
};

export default function Page() {
  return <SignUpPage />;
}
