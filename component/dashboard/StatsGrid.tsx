import React from "react";
import { TrendingUp } from "lucide-react";
import type { DashboardOverview } from "../redux/features/dashboardApi";

interface StatCardProps {
  title: string;
  value: string;
  percentage: string;
  subText: string;
}

const StatCard = ({ title, value, percentage, subText }: StatCardProps) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[210px] border border-gray-50">
      <h3 className="text-black   text-xl font-light mb-2">
        {title}
      </h3>

      <div className="flex-1 flex items-center">
        <h4 className="text-black text-5xl font-bold   tracking-tight">
          {value}
        </h4>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-[#4f795a]">
          <TrendingUp size={24} strokeWidth={2.5} />
          <span className="text-lg font-bold  ">{percentage}</span>
        </div>
        <p className="text-[#444444] text-sm font-light   whitespace-nowrap">
          {subText}
        </p>
      </div>
    </div>
  );
};

interface StatsGridProps {
  overview?: DashboardOverview;
  isLoading?: boolean;
}

const formatCount = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return value.toLocaleString("en-GB");
};

const readText = (value?: string, fallback = "0%") =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

export default function StatsGrid({ overview, isLoading = false }: StatsGridProps) {
  const totalUsers = overview?.totalUsers;
  const activeSubscriptions = overview?.activeSubscriptions;
  const roadmapsCreated = overview?.roadmapsCreated;
  const sessionCompletion = overview?.sessionCompletion;

  const loadingValue = "...";

  return (
    <div className="bg-transparent py-2  ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatCard
          title="Total Users"
          value={isLoading ? loadingValue : formatCount(totalUsers?.count)}
          percentage={isLoading ? loadingValue : readText(totalUsers?.growth)}
          subText={
            isLoading
              ? "Loading user activity..."
              : `${formatCount(totalUsers?.active)} Active / ${formatCount(totalUsers?.inactive)} Inactive`
          }
        />
        <StatCard
          title="Active Subscriptions"
          value={isLoading ? loadingValue : formatCount(activeSubscriptions?.count)}
          percentage={isLoading ? loadingValue : readText(activeSubscriptions?.growth)}
          subText={
            isLoading
              ? "Loading subscription data..."
              : `${readText(activeSubscriptions?.conversionRate)} conversion rate`
          }
        />
        <StatCard
          title="Roadmaps Created"
          value={isLoading ? loadingValue : formatCount(roadmapsCreated?.count)}
          percentage={isLoading ? loadingValue : readText(roadmapsCreated?.growth)}
          subText={
            isLoading
              ? "Loading roadmap counts..."
              : `${formatCount(roadmapsCreated?.ai)} AI / ${formatCount(roadmapsCreated?.psychologist)} Psychologist`
          }
        />
        <StatCard
          title="Session Completion"
          value={isLoading ? loadingValue : readText(sessionCompletion?.rate)}
          percentage={isLoading ? loadingValue : readText(sessionCompletion?.growth)}
          subText={isLoading ? "Loading completion rate..." : "Average completion rate"}
        />
      </div>
    </div>
  );
}
