"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface University {
  _id: string;
  name: string;
}

export default function ParentUniversitySelect() {
  const { setValue, register, watch } = useFormContext();
  const selectedId = watch("parentUniversity");

  const [selected, setSelected] = useState<University | null>(null);
  const [query, setQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);

  // Fetch matching universities
  useEffect(() => {
    const fetchUniversities = async () => {
      const res = await fetch(`/api/admin/universities?search=${query}`);
      const data = await res.json();
      setUniversities(data.universities || []);
    };

    const timeout = setTimeout(fetchUniversities, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Update form value when university is selected
  const handleChange = (uni: University) => {
    setSelected(uni);
    setValue("parentUniversity", uni?._id);
    console.log("Selected university:", uni);
  };

  return (
    <div className="w-full px-4">
      <label className="mb-2 block text-base font-medium">
        Parent University
      </label>
      <Combobox value={selected} onChange={handleChange}>
        <div className="relative w-full">
          <ComboboxInput
            aria-label="Parent University"
            displayValue={(uni: University) => uni?.name || ""}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0"
            placeholder="Search and select a university"
          />
          <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border bg-transparent shadow">
            {universities.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}
            {universities.map((uni) => (
              <ComboboxOption
                key={uni._id}
                value={uni}
                className="w-full cursor-pointer px-3 py-2 text-sm"
              >
                {uni.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}
