"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";

interface Organization {
  _id: string;
  name: string;
}

export default function OrganizationSearchSelect({
  selected,
  setSelected,
}: {
  selected: Organization | null;
  setSelected: (org: Organization | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const res = await fetch(`/api/organizations?search=${query}`);
      const data = await res.json();
      setOrganizations(data.organizations || []);
    };
    const t = setTimeout(fetchOrganizations, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleChange = (org: Organization) => {
    setSelected(org);
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-base font-medium">Select Organization</label>
      <Combobox value={selected} onChange={handleChange} nullable>
        <div className="relative w-full">
          <ComboboxInput
            aria-label="Organization"
            displayValue={(org: Organization) => org?.name || query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0"
            placeholder="Search organization..."
          />
          {organizations.length > 0 && (
            <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border bg-white shadow dark:bg-[#191919]">
              {organizations.map((org) => (
                <ComboboxOption
                  key={org._id}
                  value={org}
                  className="w-full cursor-pointer px-3 py-2 text-sm"
                >
                  {org.name}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  );
}
