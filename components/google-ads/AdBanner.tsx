"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (!adRef.current || !adClientId) return;
    if (adRef.current.getAttribute("data-adsbygoogle-status")) return; // ✅ Already initialized

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, [adClientId]);

  if (!adClientId || !adSlotId) {
    return null; // Don't render ads if not configured
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={adClientId}
      data-ad-slot={adSlotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdBanner;
