"use client";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

export default function CustomInput({ name, title, required, disabled }: any) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message;

  return (
    <div className="w-full px-4">
      <label className="block text-base font-medium">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        disabled={disabled}
        {...register(name)}
        type="text"
        className={clsx(
          "mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0",
          error ? "border-red-500" : "",
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-sm text-red-500"
          >
            {typeof error === "string" ? error : ""}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
