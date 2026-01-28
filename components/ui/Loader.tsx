"use client";
import { createContext, useContext, useState } from "react";

type LoaderContextType = {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  progress: number;
  setProgress: (val: number) => void;
  resetProgress: () => void;
};

const LoaderContext = createContext<LoaderContextType>({
  loading: false,
  showLoader: () => {},
  hideLoader: () => {},
  progress: 0,
  setProgress: () => {},
  resetProgress: () => {},
});

export const useLoader = () => useContext(LoaderContext);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const showLoader = () => setLoading(true);
  const hideLoader = () => {
    setLoading(false);
    setProgress(0); // reset progress after hiding
  };
  const resetProgress = () => setProgress(0);

  return (
    <LoaderContext.Provider
      value={{
        loading,
        showLoader,
        hideLoader,
        progress,
        setProgress,
        resetProgress,
      }}
    >
      {/* Fullscreen loader */}
      {loading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
          <div className="loader">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
        </div>
      )}

      {/* Upload progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="fixed left-0 right-0 top-0 z-[201] h-1 bg-customWhite/10">
          <div
            className="h-full bg-primaryPurple transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {children}
    </LoaderContext.Provider>
  );
}
