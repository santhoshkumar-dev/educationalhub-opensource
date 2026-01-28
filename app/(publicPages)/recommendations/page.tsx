import RecommendedCourses from "@/components/RecommendedCourses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Personalized Recommendations | Educational Hub",
  description: "Discover courses tailored just for you based on your interests and learning activity",
};

export default async function RecommendationsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-customBlack text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-Monument font-bold mb-4">
            Your Learning Journey
          </h1>
          <p className="text-xl text-gray-400">
            Explore courses handpicked for you based on your interests, activity, and
            learning preferences
          </p>
        </div>

        <RecommendedCourses limit={20} showHeader={true} />
      </div>
    </div>
  );
}
