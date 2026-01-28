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
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    const fetchTotalOrganizations = async () => {
      try {
        const response = await fetch("/api/admin/organizations/count", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error("Failed to fetch total organizations");

        const data = await response.json();
        setTotalOrganizations(data.count);
      } catch (error) {
        console.error("Error fetching total organizations:", error);
      }
    };

    fetchTotalOrganizations();
  }, []);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          `/api/admin/organizations?sort=${sort}&page=1&limit=10`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch organizations");

        const data = await response.json();
        setOrganizations(data.organizations);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, [sort]);

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <section className="px-10 py-10">
      <h1 className="custom-h1">Organizations Dashboard</h1>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Organizations</h3>
            <p className="text-white/50">
              {totalOrganizations} organizations listed
            </p>
          </div>

          <div className="space-y-5">
            <CustomButton
              onClick={() =>
                router.push("/admin/dashboard/organizations/create")
              }
            >
              <div className="flex items-center gap-2">
                <Plus /> Create Organization
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
          {organizations.map((org) => (
            <li
              key={org._id}
              onClick={() =>
                router.push(
                  `/admin/dashboard/organizations/create?id=${org._id}`,
                )
              }
              className="flex h-[30rem] w-[20rem] cursor-pointer flex-col overflow-hidden rounded border shadow-lg"
            >
              {/* Image */}
              <div className="flex h-[18rem] items-center justify-center bg-gray-300">
                <Image
                  width={300}
                  height={300}
                  src={org.logo || "/placeholder.png"}
                  alt={org.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between bg-[#111] text-white">
                <div className="flex h-full flex-col justify-between p-4">
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold">
                    {org.name}
                  </h3>
                  <p className="text-sm text-gray-400">{org.orgType}</p>
                </div>

                <button className="mt-4 bg-primaryPurple py-4 text-sm hover:underline">
                  Edit Organization
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
