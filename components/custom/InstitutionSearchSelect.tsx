"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";

interface Institution {
  _id: string;
  name: string;
}

export default function InstitutionSearchSelect({
  selected,
  setSelected,
}: {
  selected: Institution | null;
  setSelected: (inst: Institution | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      const res = await fetch(`/api/institutions?search=${query}`);
      const data = await res.json();
      setInstitutions(data.institutions || []);
    };
    const t = setTimeout(fetchInstitutions, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleChange = (inst: Institution) => {
    setSelected(inst);
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-base font-medium">Select Institution</label>
      <Combobox value={selected} onChange={handleChange} nullable>
        <div className="relative w-full">
          <ComboboxInput
            aria-label="Institution"
            displayValue={(inst: Institution) => inst?.name || query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0"
            placeholder="Search institution..."
          />
          {institutions.length > 0 && (
            <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border bg-white shadow dark:bg-[#191919]">
              {institutions.map((inst) => (
                <ComboboxOption
                  key={inst._id}
                  value={inst}
                  className="w-full cursor-pointer px-3 py-2 text-sm"
                >
                  {inst.name}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  );
}
