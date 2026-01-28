import { Metadata } from "next";

interface CanonicalUrlProps {
  url: string;
}

export function generateCanonicalMetadata(url: string): Metadata {
  return {
    alternates: {
      canonical: url,
    },
  };
}

