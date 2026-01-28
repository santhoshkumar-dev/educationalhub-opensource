import React from "react";
import {
  BookOpen,
  GraduationCap,
  Users,
  University,
  Landmark,
  Building2,
} from "lucide-react";

export interface AnalyticsItem {
  id: number;
  icon: any;
  title: string;
  value: string;
}

const AnalyticsData: AnalyticsItem[] = [
  {
    id: 1,
    title: "Courses",
    value: "3,220",
    icon: <BookOpen />,
  },
  {
    id: 2,
    title: "Users",
    value: "46,674",
    icon: <Users />,
  },
  { id: 3, title: "Institutions", value: "100", icon: <Landmark /> },
  {
    id: 4,
    title: "Universities",
    value: "100",
    icon: <University />,
  },
  {
    id: 4,
    title: "Organizations",
    value: "100",
    icon: <Building2 />,
  },
];
function ClientPage() {
  return (
    <div className="px-10 py-10">
      <h1 className="custom-h1">Admin Dashboard</h1>

      <AnalyticsButton />
    </div>
  );
}

export default ClientPage;

function AnalyticsButton() {
  return (
    <div className="item-center mt-5 flex w-full border">
      <div className="w-full p-5">
        <div className="grid w-full grid-cols-5 divide-x divide-gray-400">
          {AnalyticsData.map((item: AnalyticsItem) => (
            <button
              type="button"
              key={item.id}
              className="flex justify-center gap-5 py-2"
            >
              <div>
                <div className="bg-[#018DF0] p-4">{item.icon}</div>
              </div>
              <div className="text-left">
                <h2 className="text-md font-medium">{item.title}</h2>
                <h3 className="mt-1 text-4xl font-bold">{item.value}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
