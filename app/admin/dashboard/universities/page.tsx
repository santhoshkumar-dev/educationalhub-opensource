"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/custom/customButton";
import { useRouter } from "@bprogress/next/app";
import SimpleSelectDropdown, {
  Option,
} from "@/components/custom/SimpleSelectDropdown";
import { Plus } from "lucide-react";

const SORT_OPTIONS: Option[] = [
  { value: "", label: "Sort By" },
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

function Page() {
  const router = useRouter();
  const [sort, setSort] = useState("latest");
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    const fetchTotalUniversities = async () => {
      try {
        const response = await fetch("/api/admin/universities/count", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch total universities");
        }

        const data = await response.json();
        setTotalUniversities(data.universities);
      } catch (error) {
        console.error("Error fetching total universities:", error);
      }
    };

    fetchTotalUniversities();
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch(
          `/api/admin/universities?sort=${sort}&page=1&limit=10`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch universities");
        }

        const data = await response.json();
        setUniversities(data.universities);
      } catch (error) {
        console.error("Error fetching universities:", error);
      }
    };

    fetchUniversities();
  }, [sort]);

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <section className="px-10 py-10">
      <h1 className="custom-h1">Universities Dashboard</h1>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Universities</h3>
            <p className="text-white/50">
              {totalUniversities} universities created
            </p>
          </div>

          <div className="space-y-5">
            <CustomButton
              onClick={() =>
                router.push("/admin/dashboard/universities/create")
              }
            >
              <div className="flex items-center gap-2">
                <Plus /> Create University
              </div>
            </CustomButton>
            <SimpleSelectDropdown
              label="Sort By"
              options={SORT_OPTIONS}
              defaultValue="latest"
              onChange={handleSortChange}
            />
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-6">
          {universities.map((university) => (
            <li
              onClick={() =>
                router.push(
                  `/admin/dashboard/universities/create?id=${university._id}`,
                )
              }
              key={university._id}
              className="flex h-[30rem] w-[20rem] cursor-pointer flex-col overflow-hidden rounded border shadow-lg"
            >
              {/* Image */}
              <div className="flex h-[18rem] items-center justify-center bg-gray-300">
                <Image
                  width={300}
                  height={300}
                  src={university.logo || "/placeholder.png"}
                  alt={university.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between bg-[#111] text-white">
                <div className="flex h-full flex-col justify-between p-4">
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold">
                    {university.name}
                  </h3>
                  <p className="text-sm text-gray-400">Preview</p>
                </div>

                <button className="mt-4 bg-primaryPurple py-4 text-sm hover:underline">
                  Edit University
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Page;
