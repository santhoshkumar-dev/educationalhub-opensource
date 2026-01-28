"use client";

import { useFormContext } from "react-hook-form";

export default function ContributionSelect() {
  const { register } = useFormContext();

  return (
    <div className="w-full px-4">
      <label className="mb-2 block text-base font-medium">
        Contribution Type
      </label>
      <select
        {...register("contributionType")}
        className="mt-3 block w-full border bg-customWhite bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0 dark:bg-customBlack"
        defaultValue=""
      >
        <option value="" disabled>
          Select Contribution
        </option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
        <option value="both">Both</option>
      </select>
    </div>
  );
}
