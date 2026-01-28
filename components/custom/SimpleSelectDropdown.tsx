"use client";

import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export interface Option {
  value: string;
  label: string;
}

interface SimpleSelectDropdownProps {
  options: Option[];
  label?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}

export default function SimpleSelectDropdown({
  options,
  label = "Select",
  defaultValue,
  onChange,
}: SimpleSelectDropdownProps) {
  const defaultOption =
    options.find((opt) => opt.value === defaultValue) || options[0];
  const [selected, setSelected] = useState<Option>(defaultOption);

  useEffect(() => {
    if (defaultOption) onChange(defaultOption.value);
  }, [defaultOption, onChange]);

  const handleChange = (option: Option) => {
    setSelected(option);
    onChange(option.value);
  };

  return (
    <div className="w-full">
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button className="w-full border border-white/50 bg-transparent px-3 py-2 text-left text-sm">
            {selected.label}{" "}
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 transform" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full rounded border border-white/50 bg-black shadow">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option}
                className="cursor-pointer px-3 py-2 text-sm"
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
