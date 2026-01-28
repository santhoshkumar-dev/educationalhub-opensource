"use client";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

interface GooglePlacesInputProps {
  name: string;
  title: string;
  required?: boolean;
}

export default function GooglePlacesInput({
  name,
  title,
  required = false,
}: GooglePlacesInputProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const error = errors?.[name]?.message;

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["establishment"], // or ["establishment"] for places
        componentRestrictions: { country: "in" }, // restrict to India
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const mapUrl = place.url || "";
      const address = place.formatted_address || "";
      const phone = place.formatted_phone_number || ""; // Only for establishments

      const components: any = {};
      place.address_components?.forEach((component) => {
        const types = component.types;

        if (types.includes("administrative_area_level_3"))
          components.city = component.long_name;
        if (types.includes("administrative_area_level_1"))
          components.state = component.long_name;
        if (types.includes("country")) components.country = component.long_name;
        if (types.includes("postal_code"))
          components.pincode = component.long_name;
        if (
          types.includes("sublocality") ||
          types.includes("neighborhood") ||
          types.includes("premise")
        )
          components.address = component.long_name;
      });

      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      setValue("address", address, { shouldValidate: true });
      setValue("city", components.city || "", { shouldValidate: true });
      setValue("state", components.state || "", { shouldValidate: true });
      setValue("country", components.country || "", { shouldValidate: true });
      setValue("pincode", components.pincode || "", { shouldValidate: true });
      setValue("phone", phone || "", { shouldValidate: true });
      setValue("latitude", lat || "");
      setValue("longitude", lng || "");
      setValue("mapUrl", mapUrl || "", { shouldValidate: true });
    });
  }, [setValue]);

  return (
    <div className="w-full px-4">
      <label className="block text-base font-medium">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...register(name)}
        ref={(el) => {
          inputRef.current = el;
        }}
        type="text"
        placeholder="Start typing an address..."
        className={clsx(
          "mt-3 block w-full border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-0",
          error ? "border-red-500" : "border-gray-300",
        )}
      />
      <input {...register("city")} hidden />
      <input {...register("state")} hidden />
      <input {...register("country")} hidden />
      <input {...register("pincode")} hidden />
      <input {...register("phone")} hidden />
      <input {...register("latitude")} hidden />
      <input {...register("longitude")} hidden />
      <input {...register("mapUrl")} hidden />
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
