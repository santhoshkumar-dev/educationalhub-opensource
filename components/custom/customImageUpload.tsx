"use client";
import { Image } from "lucide-react";
import NextImage from "next/image";
import React, { useRef } from "react";

type Props = {
  label?: string;
  subtext?: string;
  onChange: (file: File) => void;
  value?: File | null;
};

const CustomImageUpload: React.FC<Props> = ({
  label = "Profile photo",
  subtext = "We recommend an image of at least 400x400. Gifs work too 🙌",
  onChange,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4 border-b p-6">
      <div
        onClick={handleClick}
        className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition"
      >
        {!value ? (
          <Image size={40} />
        ) : (
          <NextImage
            src={URL.createObjectURL(value)}
            alt="Preview"
            className="h-full w-full object-cover"
            width={96}
            height={96}
          />
        )}

        {/* <img
          src={
            value
              ? URL.createObjectURL(value)
              : "https://via.placeholder.com/150?text=Upload"
          }
          alt="Preview"
          className="object-cover h-full w-full"
        /> */}
      </div>

      {/* Label & Upload */}
      <div className="flex flex-col">
        <p className="text-lg font-bold">{label}</p>
        <p className="mt-1 text-sm">{subtext}</p>
        <button
          type="button"
          onClick={handleClick}
          className="mt-3 max-w-72 rounded border px-4 py-1.5 transition"
        >
          Upload
        </button>
        <input
          title="file"
          type="file"
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onChange(e.target.files[0]);
            }
          }}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CustomImageUpload;
