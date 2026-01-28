import React, { ReactNode, useEffect, useState } from "react";
import { FiArrowRight, FiChevronDown, FiPieChart } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  University,
  Code2,
  Brain,
  Palette,
  Shield,
  Cloud,
  Database,
  Copy,
} from "lucide-react";
import Image from "next/image";

export const ShiftingDropDown = () => {
  return (
    <div className="flex w-full justify-start p-8 md:justify-center">
      <Tabs />
    </div>
  );
};

const Tabs = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [dir, setDir] = useState<null | "l" | "r">(null);

  const handleSetSelected = (val: number | null) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  return (
    <div
      onMouseLeave={() => handleSetSelected(null)}
      className="relative flex h-fit gap-2"
    >
      {TABS.map((t) => {
        return (
          <Tab
            key={t.id}
            link={t.link}
            selected={selected}
            handleSetSelected={handleSetSelected}
            tab={t.id}
          >
            {t.title}
          </Tab>
        );
      })}

      <AnimatePresence>
        {selected && <Content dir={dir} selected={selected} />}
      </AnimatePresence>
    </div>
  );
};

const Tab = ({
  children,
  tab,
  handleSetSelected,
  selected,
  link,
}: {
  children: ReactNode;
  tab: number;
  handleSetSelected: (val: number | null) => void;
  selected: number | null;
  link?: string;
}) => {
  return (
    <button
      id={`shift-tab-${tab}`}
      onMouseEnter={() => handleSetSelected(tab)}
      onClick={() => {
        if (link) {
          window.location.href = link;
        }
      }}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${
        selected === tab
          ? "bg-[#01C5BA] text-white"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <span>{children}</span>
      <FiChevronDown
        className={`transition-transform ${
          selected === tab ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const Content = ({
  selected,
  dir,
}: {
  selected: number | null;
  dir: null | "l" | "r";
}) => {
  return (
    <motion.div
      id="overlay-content"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      className="absolute left-0 top-[calc(100%_+_24px)] w-96 rounded-lg border border-gray-300 bg-customWhite p-4 shadow-lg dark:border-gray-600 dark:bg-[#191919]"
    >
      <Bridge />
      <Nub selected={selected} />

      {TABS.map((t) => {
        return (
          <div className="overflow-hidden" key={t.id}>
            {selected === t.id && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <t.Component />
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

const Bridge = () => (
  <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
);

const Nub = ({ selected }: { selected: number | null }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      const overlayContent = document.getElementById("overlay-content");

      if (!hoveredTab || !overlayContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();

      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

      setLeft(tabCenter);
    }
  };

  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border border-gray-300 bg-customWhite dark:border-gray-600 dark:bg-[#191919]"
    />
  );
};

const Courses = () => {
  return (
    <div>
      <div className="flex gap-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Development</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="/courses?search=full-stack"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Full Stack
            </Link>
            <Link
              href="/courses?search=python"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Python
            </Link>
            <Link
              href="/courses?search=java"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Java
            </Link>
            <Link
              href="/courses?search=javascript"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              JavaScript
            </Link>
            <Link
              href="/courses?search=aws"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              AWS
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Business</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="/courses?search=marketing"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Marketing
            </Link>
            <Link
              href="/courses?search=finance"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Finance
            </Link>
            <Link
              href="/courses?search=entrepreneurship"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Entrepreneurship
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Design</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="/courses?search=ui-ux"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              UI/UX
            </Link>
            <Link
              href="/courses?search=graphic-design"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Graphic Design
            </Link>
            <Link
              href="/courses?search=photography"
              className="block text-sm text-gray-500 hover:text-[#01C5BA] dark:text-gray-400"
            >
              Photography
            </Link>
          </div>
        </div>
      </div>

      <Link
        href={"/courses"}
        className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#01C5BA] hover:text-[#00A396]"
      >
        <span>View all courses</span>
        <FiArrowRight />
      </Link>
    </div>
  );
};

const Providers = () => {
  return (
    <div className="grid grid-cols-3 gap-4 divide-x divide-gray-300 dark:divide-gray-600">
      <Link
        href="/organizations"
        className="flex w-full flex-col items-center justify-center py-2 text-gray-500 transition-colors hover:text-[#01C5BA] dark:text-gray-400"
      >
        <Building2 className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Organizations</span>
      </Link>
      <Link
        href="/universities"
        className="flex w-full flex-col items-center justify-center py-2 text-gray-500 transition-colors hover:text-[#01C5BA] dark:text-gray-400"
      >
        <University className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Universities</span>
      </Link>
      <a
        href="#"
        className="flex w-full flex-col items-center justify-center py-2 text-gray-500 transition-colors hover:text-[#01C5BA] dark:text-gray-400"
      >
        <FiPieChart className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Enterprise</span>
      </a>
    </div>
  );
};

const Blog = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <a href="#" className="hover:opacity-80">
          <Image
            className="mb-2 h-14 w-full rounded object-cover"
            src="/imgs/blog/4.png"
            alt="Placeholder image"
            width={200}
            height={100}
          />
          <h4 className="mb-0.5 text-sm font-medium">Lorem ipsum dolor</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet illo
            quidem eos.
          </p>
        </a>
        <a href="#" className="hover:opacity-80">
          <Image
            className="mb-2 h-14 w-full rounded object-cover"
            src="/imgs/blog/5.png"
            alt="Placeholder image"
            width={200}
            height={100}
          />
          <h4 className="mb-0.5 text-sm font-medium">Lorem ipsum dolor</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet illo
            quidem eos.
          </p>
        </a>
      </div>
      <button className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#01C5BA]">
        <span>View more</span>
        <FiArrowRight />
      </button>
    </div>
  );
};

const Categories = () => {
  return (
    <div className="grid grid-cols-3">
      {/* Row 1 */}
      <Link
        href="/category/web-development"
        className="flex w-full flex-col items-center justify-center border-b border-r border-gray-300 py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:border-gray-600 dark:text-gray-400"
      >
        <Code2 className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Web Dev</span>
      </Link>
      <Link
        href="/category/artificial-intelligence"
        className="flex w-full flex-col items-center justify-center border-b border-r border-gray-300 py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:border-gray-600 dark:text-gray-400"
      >
        <Brain className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">AI & ML</span>
      </Link>
      <Link
        href="/category/ui-ux-design"
        className="flex w-full flex-col items-center justify-center border-b border-gray-300 py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:border-gray-600 dark:text-gray-400"
      >
        <Palette className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">UI/UX Design</span>
      </Link>

      {/* Row 2 */}
      <Link
        href="/category/data-science"
        className="flex w-full flex-col items-center justify-center border-r border-gray-300 py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:border-gray-600 dark:text-gray-400"
      >
        <Database className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Data Science</span>
      </Link>
      <Link
        href="/category/cloud-computing"
        className="flex w-full flex-col items-center justify-center border-r border-gray-300 py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:border-gray-600 dark:text-gray-400"
      >
        <Cloud className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Cloud Computing</span>
      </Link>
      <Link
        href="/category/cybersecurity"
        className="flex w-full flex-col items-center justify-center py-4 text-gray-500 transition-colors hover:text-[#01C5BA] dark:text-gray-400"
      >
        <Shield className="mb-2 text-xl text-[#01C5BA]" />
        <span className="text-xs">Cybersecurity</span>
      </Link>
    </div>
  );
};

const Donate = () => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-lg font-medium">Support Our Mission</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your donations help us keep providing free educational resources to
        learners worldwide. Every contribution, big or small, makes a
        difference!
      </p>
      <Link
        href="/donate"
        className="mt-4 inline-block rounded bg-[#01C5BA] px-4 py-2 text-sm text-white hover:bg-[#00A396]"
      >
        Donate Now
      </Link>
    </div>
  );
};

const Request = () => {
  return (
    <div>
      <h3 className="text-lg font-medium">Request a Course</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Have a course in mind that you&apos;d like to see on our platform? Let
        us know by filling out our course request form!
      </p>
      <Link
        href="https://tally.so/r/ob9ApX"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded bg-[#01C5BA] px-4 py-2 text-sm text-white hover:bg-[#00A396]"
      >
        Request a Course
      </Link>
    </div>
  );
};

const TABS = [
  {
    title: "Courses",
    link: "/courses",
    Component: Courses,
  },
  {
    title: "Categories",
    link: "/category",
    Component: Categories,
  },
  // {
  //   title: "Providers",
  //   link: "/providers",
  //   Component: Providers,
  // },
  // {
  //   title: "Blog",
  //   Component: Blog,
  //   link: "/blog",
  // },
  {
    title: "Donate",
    Component: Donate,
    link: "/donate",
  },
  {
    title: "Request",
    Component: Request,
    link: "https://tally.so/r/ob9ApX",
  },
].map((n, idx) => ({ ...n, id: idx + 1 }));
