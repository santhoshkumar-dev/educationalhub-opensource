"use client";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

const useDevicePerformance = () => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check CPU performance
      const logicalProcessors = navigator.hardwareConcurrency || 4; // Default to 4 if not available

      // Check GPU performance via WebGL
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      const gpuInfo = gl ? gl.getParameter(gl.RENDERER) : "Unknown GPU";

      // Check screen resolution and pixel ratio
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Define criteria for a low-end device
      const isLowEnd =
        logicalProcessors <= 4 ||
        (gl &&
          gpuInfo.includes("Intel") &&
          screenWidth <= 1280 &&
          screenHeight <= 800 &&
          devicePixelRatio <= 1);

      setIsLowEndDevice(isLowEnd);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return isLowEndDevice;
};

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const isLowEndDevice = useDevicePerformance();

  if (isLowEndDevice) {
    return <>{children}</>; // Render children without the background if the device is low-end
  }

  return (
    <div>
      <div
        className={cn(
          "transition-bg relative flex min-h-[100vh] flex-col bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 hidden overflow-hidden">
          <div
            className={cn(
              `pointer-events-none absolute -inset-[10px] opacity-30 blur-[4px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_10%,var(--transparent)_15%,var(--transparent)_20%,var(--black)_25%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_10%,var(--transparent)_15%,var(--transparent)_20%,var(--white)_25%)] [background-image:var(--white-gradient),var(--aurora)] [background-position:50%_50%,50%_50%] [background-size:150%,_100%] after:absolute after:inset-0 after:animate-aurora after:mix-blend-difference after:content-[""] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:150%,_100%] dark:invert-0 dark:[background-image:var(--dark-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,var(--transparent)_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </div>
  );
};
