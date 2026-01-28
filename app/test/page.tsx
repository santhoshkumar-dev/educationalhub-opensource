"use client";

import "@mux/mux-player";
import VideoPlayer from "@/components/VideoPlayer";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

export default function Page() {
  // 1️⃣ Fetch the signed URL and set CloudFront cookies
  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2>🎥 Mux Player with Manual Hls.js</h2>

      {/* <VideoPlayer videoId={"68d6db41a9ce97fff52574cb"} /> */}
      <div className="relative aspect-video overflow-hidden rounded-lg bg-black shadow-xl">
        {" "}
        <MediaPlayer
          className="absolute inset-0 h-full w-full"
          src="https://telegram.puffkinger.shop/3350921?hash=AgADyQ&temp_token=eyJmaWxlX2lkIjogIjMzNTA5MjEiLCAiZXhwIjogMTc2NzAzOTI3OC4wOTgyODIzLCAic2FsdCI6ICJkNDIyODI5NjVlYjRhODlmIn3Rc664vQ56geECBZF00lmoeIE_uCpLH-0CotuoNtArkQ=="
        >
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      </div>
    </div>
  );
}
