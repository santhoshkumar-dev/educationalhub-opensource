"use client";

import { Play, Pause } from "lucide-react";

type AutoplayToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
};

export default function AutoplayToggle({
  enabled,
  onToggle,
  className = "",
}: AutoplayToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        enabled
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      } ${className}`}
      title={enabled ? "Autoplay: On" : "Autoplay: Off"}
    >
      {enabled ? (
        <Play className="w-4 h-4" />
      ) : (
        <Pause className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        Autoplay {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}
