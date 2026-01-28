"use client";

import { useFormContext } from "react-hook-form";

export default function OrgTypeSelect() {
  const { register } = useFormContext();

  return (
    <div className="w-full px-4">
      <label className="mb-2 block text-base font-medium">
        Organization Type
      </label>
      <select
        {...register("orgType")}
        className="mt-3 block w-full border bg-customWhite bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0 dark:bg-customBlack"
        defaultValue=""
      >
        <option value="" disabled>
          Select Organization Type
        </option>
        <option value="open-source">Open Source</option>
        <option value="non-profit">Non-Profit</option>
        <option value="corporate">Corporate</option>
        <option value="educational">Educational</option>
        <option value="freelancer">Freelancer</option>
        <option value="community">Community</option>
      </select>
    </div>
  );
}
