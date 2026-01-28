// utils/uploadToCloudinary.ts
import axios from "axios";

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is required",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / (e.total || 1));
        if (onProgress) onProgress(percent);
      },
    },
  );

  return response.data.url;
}
