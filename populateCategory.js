// upsertCourses.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI or MONGO_URL environment variable is required");
}

const CourseSchema = new mongoose.Schema(
  {
    course_name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseCategory",
      },
    ],
  },
  { timestamps: true },
);

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

const coursesData = [
  {
    course_name: "Ultimate AWS Certified Cloud Practitioner CLF-C02 2025",
    slug: "ultimate-aws-certified-cloud-practitioner-clf-c02-2025",
    tags: ["AWS", "CLF-C02", "Foundational"],
    views: 4,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
    ],
  },
  {
    course_name: "Ultimate AWS Certified Developer Associate 2025 DVA-C02",
    slug: "ultimate-aws-certified-developer-associate-2025-dva-c02",
    tags: ["AWS", "DVA-C02", "Associate"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
    ],
  },
  {
    course_name:
      "Ultimate AWS Certified Solutions Architect Associate 2025 SAA-C03",
    slug: "ultimate-aws-certified-solutions-architect-associate-2025-saa-c03",
    tags: ["AWS", "SAA-C03", "Associate"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
    ],
  },
  {
    course_name: "Ultimate AWS Certified SysOps Administrator Associate 2024",
    slug: "ultimate-aws-certified-sysops-administrator-associate-2024",
    tags: ["AWS", "SysOps", "Associate"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
      {
        $oid: "68e3c4dbe2352184b78a4261",
      },
    ],
  },
  {
    course_name: "ChatGPT Complete Guide Learn Midjourney, ChatGPT 4 & More",
    slug: "chatgpt-complete-guide-learn-midjourney-chatgpt-4-more",
    tags: ["AI", "ChatGPT", "Midjourney"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4277",
      },
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
  {
    course_name: "Adobe Premiere Pro Masterclass Video Editing in Premiere",
    slug: "adobe-premiere-pro-masterclass-video-editing-in-premiere",
    tags: ["Adobe Premiere Pro", "Video Editing", "Masterclass"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4265",
      },
    ],
  },
  {
    course_name: "Complete Figma Megacourse UIUX Design Beginner to Expert",
    slug: "complete-figma-megacourse-uiux-design-beginner-to-expert",
    tags: ["Figma", "UI/UX", "Design"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4263",
      },
    ],
  },
  {
    course_name: "Complete C# Unity Game Developer 2D",
    slug: "complete-c-unity-game-developer-2d",
    tags: ["Unity", "C#", "Game Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4262",
      },
    ],
  },
  {
    course_name: "Complete Ethical Hacking Bootcamp 2023 Zero to Mastery",
    slug: "complete-ethical-hacking-bootcamp-2023-zero-to-mastery",
    tags: ["Ethical Hacking", "Linux", "Python"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4260",
      },
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
    ],
  },
  {
    course_name: "Machine Learning A-Z AI, Python & R + ChatGPT Prize [2024]",
    slug: "machine-learning-a-z-ai-python-r-chatgpt-prize-2024",
    tags: ["Machine Learning", "AI", "Python"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
      {
        $oid: "68e3c4dbe2352184b78a4277",
      },
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
  {
    course_name: "iOS & Swift - The Complete iOS App Development Bootcamp",
    slug: "ios-swift-the-complete-ios-app-development-bootcamp",
    tags: ["iOS Development", "Swift Programming", "App Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425e",
      },
    ],
  },
  {
    course_name: "DaVinci Resolve Mastery The Ultimate Video Editing Bootcamp",
    slug: "davinci-resolve-mastery-the-ultimate-video-editing-bootcamp",
    tags: ["Video Editing", "DaVinci Resolve", "Bootcamp"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4265",
      },
    ],
  },
  {
    course_name: "React Native - The Practical Guide [2023]",
    slug: "react-native-the-practical-guide-2023",
    tags: ["React Native", "App Development", "JavaScript"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425b",
      },
      {
        $oid: "68e3c4dbe2352184b78a425e",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "ZeroToMastery - Unity Bootcamp 3D Game Development 2025",
    slug: "zerotomastery-unity-bootcamp-3d-game-development-2025",
    tags: ["Unity", "C#", "Game Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4262",
      },
    ],
  },
  {
    course_name: "The Complete Adobe After Effects Bootcamp Basic to Advanced",
    slug: "the-complete-adobe-after-effects-bootcamp-basic-to-advanced",
    tags: ["Adobe After Effects", "Motion Graphics", "Visual Effects"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4265",
      },
    ],
  },
  {
    course_name:
      "Udemy - PHP for Beginners - Become a PHP Master - CMS Project",
    slug: "udemy-php-for-beginners-become-a-php-master-cms-project",
    tags: ["PHP", "Beginner", "CMS"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "The Complete 2023 Web Development Bootcamp",
    slug: "the-complete-2023-web-development-bootcamp",
    tags: ["Web Development", "HTML", "CSS"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "The Complete Digital Marketing Guide - 27 Courses in 1",
    slug: "the-complete-digital-marketing-guide-27-courses-in-1",
    tags: [],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a426e",
      },
    ],
  },
  {
    course_name: "Udemy - Java Masterclass 2025 130+ Hours of Expert Lessons",
    slug: "udemy-java-masterclass-2025-130-hours-of-expert-lessons",
    tags: ["Java", "Beginner to Advanced", "Comprehensive Course"],
    views: 0,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "AWS Certified Data Engineer Associate 2024 - Hands On!",
    slug: "aws-certified-data-engineer-associate-2024",
    tags: ["AWS", "Data Engineering", "Cloud Computing"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
      {
        $oid: "68e3c4dbe2352184b78a425d",
      },
    ],
  },
  {
    course_name: "The Ultimate React Course 2024 React, Next.js, Redux & More",
    slug: "the-ultimate-react-course-2024-react-nextjs-redux-more",
    tags: ["React", "Next.js", "Redux"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Complete Web & Mobile Designer in 2023 UIUX, Figma, +more",
    slug: "complete-web-mobile-designer-in-2023-uiux-figma-more",
    tags: ["UI/UX", "Figma", "Design"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425e",
      },
      {
        $oid: "68e3c4dbe2352184b78a4263",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "TheDesignership - UX-UI Design Course by Michael Wong",
    slug: "thedesignership-ux-ui-design-course-by-michael-wong",
    tags: ["UI/UX", "Design Fundamentals", "Creative Skills"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4263",
      },
    ],
  },
  {
    course_name: "Fireship.io - Dart 101",
    slug: "fireshipio-dart-101",
    tags: ["Dart Programming", "Beginner-Friendly", "Web Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - Deno Full Course",
    slug: "fireshipio-deno-full-course",
    tags: ["Deno", "Web Development", "Full Stack"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - Firebase Security Course",
    slug: "fireshipio-firebase-security-course",
    tags: ["Firebase Security", "Firestore Rules", "Cloud Security"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4260",
      },
    ],
  },
  {
    course_name: "Fireship.io - Firestore Data Modeling",
    slug: "fireshipio-firestore-data-modeling",
    tags: ["Firestore", "Data Modeling", "Cloud Firestore"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425d",
      },
    ],
  },
  {
    course_name: "Fireship.io - Git & GitHub Full Course",
    slug: "fireshipio-git-github-full-course",
    tags: ["Git", "GitHub", "Version Control"],
    views: 0,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "Fireship.io - Flutter Firebase",
    slug: "fireshipio-flutter-firebase",
    tags: ["Flutter", "Firebase", "Mobile App Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425e",
      },
    ],
  },
  {
    course_name: "Fireship.io - Linux Full Course",
    slug: "fireshipio-linux-full-course",
    tags: ["Linux Fundamentals", "Terminal Mastery", "VPS Setup"],
    views: 0,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "Fireship.io - Modern JavaScript Full Course",
    slug: "fireshipio-modern-javascript-full-course",
    tags: ["JavaScript", "Web Development", "Coding Skills"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425b",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - Next.js Full Course",
    slug: "fireshipio-nextjs-full-course",
    tags: ["Next.js", "Web Development", "Full Stack"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - React Supabase Full Course",
    slug: "fireshipio-react-supabase-full-course",
    tags: ["React", "Supabase", "Full-Stack"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - React - The Full Course",
    slug: "fireshipio-react-the-full-course",
    tags: ["React", "Frontend", "JavaScript"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425b",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - Stripe for SaaS",
    slug: "fireshipio-stripe-for-saas",
    tags: ["Stripe SaaS", "Payment Gateway", "Web Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a426d",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - SvelteKit Full Course",
    slug: "fireshipio-sveltekit-full-course",
    tags: ["SvelteKit", "Full Stack", "Web Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - The Angular Firebase Project Course",
    slug: "fireshipio-the-angular-firebase-project-course",
    tags: ["Angular", "Firebase", "FullStack"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Fireship.io - VS Code Magic Tricks Course (2025-1)",
    slug: "fireshipio-vs-code-magic-tricks-course-2025-1",
    tags: ["VS Code", "Productivity", "Coding"],
    views: 0,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "The Complete Python Bootcamp From Zero to Hero in Python",
    slug: "the-complete-python-bootcamp-from-zero-to-hero-in-python",
    tags: ["Python", "Beginner to Expert", "Programming Fundamentals"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
    ],
  },
  {
    course_name: "Udemy - 100 Days of Code The Complete Python Pro Bootcamp",
    slug: "udemy-100-days-of-code-the-complete-python-pro-bootcamp",
    tags: ["Python", "Programming", "Data Structures"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
    ],
  },
  {
    course_name: "The Complete Networking Fundamentals Course. Your CCNA start",
    slug: "the-complete-networking-fundamentals-course-your-ccna-start",
    tags: ["CCNA", "Networking Fundamentals", "Network Automation"],
    views: 9,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4271",
      },
    ],
  },
  {
    course_name: "An Entire MBA in 1 Course Award Winning Business School Prof",
    slug: "an-entire-mba-in-1-course-award-winning-business-school-prof",
    tags: ["Business", "Entrepreneurship", "Management"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a426d",
      },
      {
        $oid: "68e3c4dbe2352184b78a4274",
      },
    ],
  },
  {
    course_name: "Python Data Structures & Algorithms + LEETCODE Exercises",
    slug: "python-data-structures-algorithms-leetcode-exercises",
    tags: ["Python", "Data Structures", "Algorithms"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
    ],
  },
  {
    course_name: "JavaScript Data Structures & Algorithms + LEETCODE Exercises",
    slug: "javascript-data-structures-algorithms-leetcode-exercises",
    tags: ["JavaScript", "Data Structures", "Algorithms"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425b",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name: "Java Data Structures & Algorithms + LEETCODE Exercises",
    slug: "java-data-structures-algorithms-leetcode-exercises",
    tags: ["Java", "Data Structures", "Algorithms"],
    views: 0,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "ZeroToMastery - Complete Next.js Developer Zero to Mastery",
    slug: "zerotomastery-complete-nextjs-developer-zero-to-mastery",
    tags: ["Next.js", "Full Stack", "Web Development"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name:
      "Udemy - Master the Coding Interview Big Tech (FAANG) Interviews",
    slug: "udemy-master-the-coding-interview-big-tech-faang-interviews",
    tags: ["Coding Interview", "Big Tech", "FAANG"],
    views: 2,
    categories: [
      {
        $oid: "68e3ca29630b39c6db2ef2e9",
      },
    ],
  },
  {
    course_name: "Calimove - Complete Calisthenics (Level 1-5)",
    slug: "calimove-complete-calisthenics-level-1-5",
    tags: ["Calisthenics", "Fitness", "Progressive"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4282",
      },
    ],
  },
  {
    course_name: "Acoustic Guitar For Complete Beginners",
    slug: "acoustic-guitar-for-complete-beginners",
    tags: ["Acoustic Guitar", "Beginner", "Music"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4269",
      },
    ],
  },
  {
    course_name:
      "ZeroToMastery - Design a Responsive Airbnb Website with Figma",
    slug: "zerotomastery-design-a-responsive-airbnb-website-with-figma",
    tags: ["UI/UX", "Figma", "Responsive Design", "Airbnb Website"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4263",
      },
    ],
  },
  {
    course_name: "Making UX Decisions - Tommy Geoco",
    slug: "making-ux-decisions-tommy-geoco",
    tags: ["UI/UX", "Decision Making", "Design Thinking"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4263",
      },
    ],
  },
  {
    course_name: "Trevor Jones - Master CapCut in 30 Days",
    slug: "trevor-jones-master-capcut-in-30-days",
    tags: ["CapCut", "VideoEditing", "MobileEditing"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4265",
      },
    ],
  },
  {
    course_name: "Machine Learning, Data Science and Generative AI with Python",
    slug: "machine-learning-data-science-and-generative-ai-with-python",
    tags: ["Machine Learning", "Data Science", "Python"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
      {
        $oid: "68e3c4dbe2352184b78a425d",
      },
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
  {
    course_name: "LLM Engineering Master AI, Large Language Models & Agents",
    slug: "llm-engineering-master-ai-large-language-models-agents",
    tags: ["LLM Engineering", "AI Agents", "Large Language Models"],
    views: 3,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
  {
    course_name: "The Data Analyst Course Complete Data Analyst Bootcamp",
    slug: "the-data-analyst-course-complete-data-analyst-bootcamp",
    tags: ["Data Analysis", "Python Basics", "Data Science"],
    views: 6,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
      {
        $oid: "68e3c4dbe2352184b78a425d",
      },
    ],
  },
  {
    course_name: "A deep understanding of deep learning (with Python intro)",
    slug: "a-deep-understanding-of-deep-learning-with-python-intro",
    tags: ["Deep Learning", "Python Programming", "Artificial Intelligence"],
    views: 3,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
  {
    course_name: "Custom GPT Toolkit 2024",
    slug: "custom-gpt-toolkit-2024",
    tags: ["GPT Development", "HTML Mastery", "PDF Automation"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
      {
        $oid: "68e3c4dbe2352184b78a4277",
      },
    ],
  },
  {
    course_name: "7.4K Single Month on Medium",
    slug: "74k-single-month-on-medium",
    tags: ["Medium Writing", "Online Income", "Content Creation"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a426b",
      },
    ],
  },
  {
    course_name: "Build a Micro SaaS Course+Bonuses(Slender)",
    slug: "build-a-micro-saas-coursebonusesslender",
    tags: ["Micro SaaS", "Profitable Business", "No Coding"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a426d",
      },
    ],
  },
  {
    course_name:
      "JSMastery - Web Animations Full Course - Build a GTA VI Website & Master GSAP",
    slug: "jsmastery-web-animations-full-course-build-a-gta-vi-website-master-gsap",
    tags: ["Web Animations", "GSAP", "Web Development"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name:
      "Udemy - Docker & Kubernetes The Practical Guide [2025 Edition] (2025-4)",
    slug: "udemy-docker-kubernetes-the-practical-guide-2025-edition-2025-4",
    tags: ["Docker", "Kubernetes", "Containerization"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4261",
      },
    ],
  },
  {
    course_name: "Road To Next - The Road to Next (2025-6)",
    slug: "road-to-next-the-road-to-next-2025-6",
    tags: ["Web Development", "Programming Course", "Software Development"],
    views: 2,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name:
      "ZeroToMastery - C#.NET Bootcamp Full-Stack Web Development (w ASP.NET Core and Blazor) (2025-4)",
    slug: "zerotomastery-cnet-bootcamp-full-stack-web-development-w-aspnet-core-and-blazor-2025-4",
    tags: ["CSharp", "FullStackDevelopment", "ASPNETCore"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name:
      "ZeroToMastery - The Python Automation Bootcamp Zero to Mastery (2025-4)",
    slug: "zerotomastery-the-python-automation-bootcamp-zero-to-mastery-2025-4",
    tags: ["Python", "Automation", "Bootcamp"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425a",
      },
    ],
  },
  {
    course_name:
      "ZeroToMastery - Web3 Masterclass Blockchain, DApps, DAOs + More (2025-4)",
    slug: "zerotomastery-web3-masterclass-blockchain-dapps-daos-more-2025-4",
    tags: ["Blockchain", "Web3", "DApps"],
    views: 1,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a4279",
      },
    ],
  },
  {
    course_name:
      "[FCSNEW.NET] Udemy - The Complete JavaScript Course 2025 From Zero to Expert!",
    slug: "fcsnewnet-udemy-the-complete-javascript-course-2025-from-zero-to-expert",
    tags: ["javascript", "web development", "programming"],
    views: 4,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425b",
      },
      {
        $oid: "68e3c4dbe2352184b78a4259",
      },
    ],
  },
  {
    course_name:
      "Ultimate AWS Certified Solutions Architect Professional 2024 -",
    slug: "ultimate-aws-certified-solutions-architect-professional-2024-",
    tags: ["AWS", "Cloud Architecture", "Solutions Architect"],
    views: 5,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
    ],
  },
  {
    course_name: "Ultimate AWS Certified Security Specialty [NEW 2025] SCS-C02",
    slug: "ultimate-aws-certified-security-specialty-new-2025-scs-c02",
    tags: ["AWS", "SCS-C02", "Cloud Security"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
      {
        $oid: "68e3c4dbe2352184b78a4260",
      },
    ],
  },
  {
    course_name: "AWS Certified Advanced Networking Specialty 2024 -",
    slug: "aws-certified-advanced-networking-specialty-2024-",
    tags: [
      "AWS",
      "Certified Advanced Networking Specialty",
      "Cloud Networking",
    ],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
    ],
  },
  {
    course_name: "AWS Certified DevOps Engineer Professional 2024 - DOP-C02",
    slug: "aws-certified-devops-engineer-professional-2024-dop-c02",
    tags: ["AWS", "DevOps", "Certification"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
      {
        $oid: "68e3c4dbe2352184b78a4261",
      },
    ],
  },
  {
    course_name: "AWS Certified Machine Learning Specialty 2023 - Hands On!",
    slug: "aws-certified-machine-learning-specialty-2023-hands-on",
    tags: ["AWS", "Machine Learning", "Certification"],
    views: 0,
    categories: [
      {
        $oid: "68e3c4dbe2352184b78a425f",
      },
      {
        $oid: "68e3c4dbe2352184b78a4278",
      },
    ],
  },
];

function convertCategories(categories) {
  return categories.map((cat) => {
    if (cat.$oid) {
      return new mongoose.Types.ObjectId(cat.$oid);
    }
    return cat;
  });
}

async function upsertCourses() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected!");

    console.log("\nUpserting courses...");
    let insertedCount = 0;
    let updatedCount = 0;

    for (const courseData of coursesData) {
      const processedData = {
        categories: convertCategories(courseData.categories || []),
      };

      const result = await Course.updateOne(
        { slug: courseData.slug },
        { $set: processedData },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }

      // Progress indicator
      if ((insertedCount + updatedCount) % 10 === 0) {
        console.log(`   Processed ${insertedCount + updatedCount} courses...`);
      }
    }

    console.log("\n📊 Results:");
    console.log(`   ✓ Inserted: ${insertedCount}`);
    console.log(`   ✓ Updated: ${updatedCount}`);
    console.log(`   Total Processed: ${insertedCount + updatedCount}`);

    console.log("\n✅ Upsert completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 MongoDB connection closed.");
    process.exit(0);
  }
}

upsertCourses();
