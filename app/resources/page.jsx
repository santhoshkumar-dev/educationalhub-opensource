"use client";
import { useState, useEffect } from "react";
import {
  FaUniversalAccess,
  FaRobot,
  FaChartLine,
  FaCodeBranch,
  FaVolumeUp,
  FaLock,
  FaBlogger,
  FaBook,
  FaGlobe,
  FaCloud,
  FaBookOpen,
  FaCode,
  FaMagic,
  FaPalette,
  FaUsers,
  FaDatabase,
  FaPaintBrush,
  FaFileAlt,
  FaEdit,
  FaEnvelope,
  FaPuzzlePiece,
  FaFont,
  FaComments,
  FaUserTie,
  FaGithub,
  FaServer,
  FaIcons,
  FaImage,
  FaLightbulb,
  FaBriefcase,
  FaGraduationCap,
  FaGavel,
  FaTrademark,
  FaBullhorn,
  FaNewspaper,
  FaTachometerAlt,
  FaPodcast,
  FaClock,
  FaDraftingCompass,
  FaSpinner,
  FaShieldAlt,
  FaSearch,
  FaRocket,
  FaWrench,
  FaTwitter,
  FaKeyboard,
  FaDesktop,
  FaUser,
  FaVideo,
  FaBuilding,
  FaPen,
  FaYoutube,
  FaTerminal,
  FaFlask,
} from "react-icons/fa";
import { MdAnimation, MdOutlineScreenshot } from "react-icons/md";
import { SiBlockchaindotcom } from "react-icons/si";

import Image from "next/image";

export default function Page() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileAside, setShowMobileAside] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();
        setResources(data.resources);

        const extractedCategories = [
          ...new Set(data.resources.map((resource) => resource.category)),
        ];
        setCategories(extractedCategories);
        setFilteredCategories(extractedCategories);

        console.log("Resources:", data.resources);
        console.log("Categories:", extractedCategories);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const categoryLinks = document.querySelectorAll("aside a");
      const sections = document.querySelectorAll("section > div[id]");

      let currentCategory = "";
      sections.forEach((section) => {
        const { top } = section.getBoundingClientRect();
        if (top <= 150 && top >= -section.clientHeight) {
          currentCategory = section.id.replace(/-/g, " ");
        }
      });

      setActiveCategory(currentCategory);

      categoryLinks.forEach((link) => {
        if (
          link.getAttribute("href") ===
          `#${currentCategory.replace(/\s+/g, "-")}`
        ) {
          link.classList.add("text-[#01C5BA]", "font-bold");
        } else {
          link.classList.remove("text-[#01C5BA]", "font-bold");
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [resources]);

  useEffect(() => {
    const handleClick = (event) => {
      const targetId = event.currentTarget
        .getAttribute("href")
        .replace("#", "");
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth",
        });
      }
    };

    const categoryLinks = document.querySelectorAll("aside a");
    categoryLinks.forEach((link) =>
      link.addEventListener("click", handleClick),
    );

    return () => {
      categoryLinks.forEach((link) =>
        link.removeEventListener("click", handleClick),
      );
    };
  }, [categories]);

  const iconMap = {
    accessibility: <FaUniversalAccess />,
    ai: <FaRobot />,
    analytics: <FaChartLine />,
    animation: <MdAnimation />,
    "api-building": <FaCodeBranch />,
    audio: <FaVolumeUp />,
    authentication: <FaLock />,
    blog: <FaBlogger />,
    book: <FaBook />,
    browser: <FaGlobe />,
    cdn: <FaCloud />,
    cheatsheet: <FaBookOpen />,
    "cloud-computing": <FaCloud />,
    "code-challenge": <FaCode />,
    "code-generator": <FaMagic />,
    "code-snippet": <FaCode />,
    color: <FaPalette />,
    conference: <FaUsers />,
    database: <FaDatabase />,
    design: <FaPaintBrush />,
    documentation: <FaFileAlt />,
    domain: <FaGlobe />,
    editor: <FaEdit />,
    email: <FaEnvelope />,
    extension: <FaPuzzlePiece />,
    font: <FaFont />,
    forum: <FaComments />,
    freelance: <FaUserTie />,
    hacktoberfest: <FaGithub />,
    hosting: <FaServer />,
    icon: <FaIcons />,
    illustration: <FaPalette />,
    image: <FaImage />,
    inspiration: <FaLightbulb />,
    interview: <FaUser />,
    job: <FaBriefcase />,
    learn: <FaGraduationCap />,
    legal: <FaGavel />,
    library: <FaBook />,
    logging: <FaFileAlt />,
    logo: <FaTrademark />,
    marketing: <FaBullhorn />,
    newsletter: <FaNewspaper />,
    "open-source": <FaGithub />,
    performance: <FaTachometerAlt />,
    "personal-website": <FaUser />,
    podcast: <FaPodcast />,
    productivity: <FaClock />,
    programming: <FaCode />,
    prototyping: <FaDraftingCompass />,
    resume: <FaFileAlt />,
    scraping: <FaSpinner />,
    security: <FaShieldAlt />,
    seo: <FaSearch />,
    serverless: <FaCloud />,
    startup: <FaRocket />,
    storage: <FaDatabase />,
    screenshot: <MdOutlineScreenshot />,
    template: <FaFileAlt />,
    terminal: <FaTerminal />,
    testing: <FaFlask />,
    tooling: <FaWrench />,
    twitter: <FaTwitter />,
    typing: <FaKeyboard />,
    ui: <FaDesktop />,
    ux: <FaUser />,
    video: <FaVideo />,
    "website-builder": <FaBuilding />,
    writing: <FaPen />,
    web3: <SiBlockchaindotcom />,
    "youtube-channel": <FaYoutube />,
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setShowMobileAside(term !== "");

    if (term === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.toLowerCase().includes(term.toLowerCase()),
      );
      setFilteredCategories(filtered);
    }
  };

  return (
    <div className="relative -mb-24 flex flex-col text-black dark:text-white lg:flex-row">
      <aside className="sticky top-24 hidden h-[80vh] w-[25%] overflow-y-auto border-r lg:block">
        <h2 className="mx-6 mt-12 text-xl font-semibold">Categories</h2>
        <div className="mx-6 mt-4 flex items-center">
          <input
            type="text"
            placeholder="Search for the resources..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 border bg-transparent px-4 py-2 dark:text-white"
          />
        </div>
        <ul className="mx-6 mt-12 space-y-2">
          {filteredCategories.map((category, index) => (
            <li key={index}>
              <a
                onClick={(event) => {
                  event.preventDefault();
                  const targetId = event.currentTarget
                    .getAttribute("href")
                    .replace("#", "");
                  const targetElement = document.getElementById(targetId);

                  if (targetElement) {
                    window.scrollTo({
                      top: targetElement.offsetTop,
                      behavior: "smooth",
                    });
                  }
                }}
                href={`#${category.replace(/\s+/g, "-")}`}
                className={`flex cursor-pointer items-center text-lg ${
                  activeCategory === category
                    ? "text-xl font-bold text-[#01C5BA]"
                    : ""
                }`}
              >
                {iconMap[category]} &nbsp;&nbsp;
                {category
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </a>
            </li>
          ))}
        </ul>
      </aside>
      <input
        onFocus={() => setShowMobileAside(true)}
        onBlur={() => setShowMobileAside(false)}
        type="text"
        placeholder="Search for the resources..."
        value={searchTerm}
        onChange={handleSearch}
        className="sticky top-[6.4rem] z-30 flex-1 border bg-customWhite bg-transparent px-4 py-2 outline-none dark:text-black xl:hidden"
      />
      <aside
        className={`fixed left-0 top-36 z-40 h-[30vh] w-full overflow-y-auto bg-[#333333] shadow-md transition-transform lg:hidden ${
          showMobileAside ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="mx-6 mt-4 border-b text-xl font-semibold">Categories</h2>
        <ul className="mx-6 mt-2 space-y-2">
          {filteredCategories.map((category, index) => (
            <li key={index}>
              <a
                onClick={(event) => {
                  event.preventDefault();
                  const targetId = event.currentTarget
                    .getAttribute("href")
                    .replace("#", "");
                  const targetElement = document.getElementById(targetId);

                  if (targetElement) {
                    window.scrollTo({
                      top: targetElement.offsetTop - 130,
                      behavior: "smooth",
                    });
                  }
                }}
                href={`#${category.replace(/\s+/g, "-")}`}
                className={`flex cursor-pointer items-center text-lg ${
                  activeCategory === category
                    ? "text-xl font-bold text-[#01C5BA]"
                    : ""
                }`}
              >
                {iconMap[category]} &nbsp;&nbsp;
                {category
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </a>
            </li>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-center text-xl font-bold">
              No categories found for <strong>{searchTerm}</strong>
            </p>
          )}
        </ul>
      </aside>

      <section className="flex-1 overflow-y-auto p-6">
        <h1 className="mb-6 text-2xl">Resources</h1>

        {categories.map((category, index) => (
          <div key={index} id={category.replace(/\s+/g, "-")} className="mb-8">
            <h2 className="text-xl font-semibold">
              {category
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {resources
                .find((res) => res.category === category)
                ?.resources.map((resource, i) => (
                  <div key={i} className="mt-4 border p-4">
                    <div className="relative mb-4 h-[300px] w-full">
                      <Image
                        src={resource.image.replace(
                          /\.[^/.]+$/,
                          ".webp?w_1080,q_75,f_auto",
                        )}
                        alt={resource.name}
                        layout="fill"
                        objectFit="contain"
                        className="object-contain"
                      />
                    </div>

                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    <p className="break-words text-gray-500">
                      {resource.description}
                    </p>
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500"
                    >
                      Link
                    </a>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
