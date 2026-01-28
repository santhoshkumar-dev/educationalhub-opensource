"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState } from "react";

interface Instructor {
  _id: string;
  first_name: string;
  last_name: string;
}

export default function InstructorSelect({
  selected,
  setSelected,
}: {
  selected: Instructor[];
  setSelected: (inst: Instructor[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch(`/api/admin/instructors?search=${query}`);
        if (!res.ok) {
          setInstructors([]); // defensive reset
          return;
        }
        const data = await res.json();
        setInstructors(data.instructors || []);
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
        setInstructors([]);
      }
    };

    const t = setTimeout(() => {
      if (query.length >= 3 || query.length === 0) {
        fetchInstructors();
      } else {
        setInstructors([]); // clear if query is too short
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (inst: Instructor) => {
    if (inst && !selected.find((i) => i._id === inst._id)) {
      setSelected([...selected, inst]);
    }
    setQuery("");
  };

  const remove = (id: string) => {
    setSelected(selected.filter((i) => i._id !== id));
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-base font-medium">
        Additional Instructors
      </label>
      <Combobox onChange={handleSelect}>
        <div className="relative w-full">
          <ComboboxInput
            aria-label="Instructor"
            displayValue={() => query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0"
            placeholder="Search instructors..."
          />
          {instructors.length > 0 && (
            <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border bg-white shadow dark:bg-[#191919]">
              {instructors.map((inst) =>
                inst ? (
                  <ComboboxOption
                    key={inst._id}
                    value={inst}
                    className="w-full cursor-pointer px-3 py-2 text-sm"
                  >
                    {inst.first_name} {inst.last_name}
                  </ComboboxOption>
                ) : null,
              )}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((inst) => (
          <span
            key={inst._id}
            className="rounded bg-gray-200 px-2 py-1 text-black dark:bg-[#333333] dark:text-white"
          >
            {inst.first_name} {inst.last_name}
            <button
              type="button"
              className="ml-1 text-red-600"
              onClick={() => remove(inst._id)}
            >
              x
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
