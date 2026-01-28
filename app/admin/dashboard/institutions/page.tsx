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
  const [sort, setSort] = useState("latest"); // default sorting: latest
  const [totalInstitutions, setTotalInstitutions] = useState(0);
  const [institutions, setInstitutions] = useState<any[]>([]);

  // Fetch total institutions count
  useEffect(() => {
    const fetchTotalInstitutions = async () => {
      try {
        const response = await fetch("/api/admin/institutions/count", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch total institutions");
        }

        const data = await response.json();
        console.log("Total Institutions:", data.count);
        setTotalInstitutions(data.count);
      } catch (error) {
        console.error("Error fetching total institutions:", error);
      }
    };

    fetchTotalInstitutions();
  }, []);

  // Fetch sorted institutions list based on sorting selection
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch(
          `/api/admin/institutions?sort=${sort}&page=1&limit=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch institutions");
        }

        const data = await response.json();
        setInstitutions(data.institutions);
      } catch (error) {
        console.error("Error fetching institutions:", error);
      }
    };

    fetchInstitutions();
  }, [sort]); // Re-fetch when `sort` changes

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <section className="px-10 py-10">
      <h1 className="custom-h1">Institutions Dashboard</h1>
      {/* Institutions List */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Institutions</h3>
            <p className="text-white/50">
              {totalInstitutions} institutions created
            </p>
          </div>

          <div className="space-y-5">
            <CustomButton
              onClick={() =>
                router.push("/admin/dashboard/institutions/create")
              }
            >
              <div className="flex items-center gap-2">
                <Plus /> Create Institutions
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2"></div>

          <div className="flex min-w-32 items-center space-x-2"></div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-6">
          {institutions.map((institution) => (
            <li
              onClick={() =>
                router.push(
                  `/admin/dashboard/institutions/create?id=${institution._id}`,
                )
              }
              key={institution._id}
              className="flex h-[30rem] w-[20rem] cursor-pointer flex-col overflow-hidden rounded border shadow-lg"
            >
              {/* Image */}
              <div className="flex h-[18rem] items-center justify-center bg-gray-300">
                <Image
                  width={300}
                  height={300}
                  src={institution.logo || "/placeholder.png"}
                  alt={institution.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between bg-[#111] text-white">
                <div className="flex h-full flex-col justify-between p-4">
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold">
                    {institution.name}
                  </h3>
                  <p className="text-sm text-gray-400">Preview</p>
                </div>

                <button className="mt-4 bg-primaryPurple py-4 text-sm hover:underline">
                  Edit Institution
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
