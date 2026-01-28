import { withNextVideo } from "next-video/process";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      "res.cloudinary.com",
      "via.placeholder.com",
      "img.clerk.com",
      "eu.ui-avatars.com",
    ],
  },
};

export default withNextVideo(nextConfig);
