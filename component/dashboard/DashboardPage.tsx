"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, TrendingUp, X } from "lucide-react";
import StatsGrid from "./StatsGrid";
import { useGetDashboardQuery } from "../redux/features/dashboardApi";

// Mock data
const dashboardUsers = [
  {
    id: "User-213",
    name: "User1",
    email: "user1@example.com",
    plan: "Rockstar Plan",
    subPlan: "Rockstar",
    type: "ABCD",
    progress: 80,
    status: "Active",
    joined: "Nov 13, 2025",
    lastActive: "Nov 13, 2025",
    sessions: 12
  },
  {
    id: "User-214",
    name: "User2",
    email: "user2@example.com",
    plan: "Hero Plan",
    subPlan: "Hero",
    type: "EFGH",
    progress: 45,
    status: "Suspended",
    joined: "Oct 10, 2025",
    lastActive: "Jan 10, 2026",
    sessions: 8
  },
  {
    id: "User-215",
    name: "User3",
    email: "user3@example.com",
    plan: "Main Plan",
    subPlan: "Prime",
    type: "IJKL",
    progress: 92,
    status: "Active",
    joined: "Dec 01, 2026",
    lastActive: "Now",
    sessions: 24
  }
];

type DashboardUser = (typeof dashboardUsers)[number];

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "Failed to load dashboard data.";
  }

  if ("data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;

      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  if ("message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return "Failed to load dashboard data.";
};

const formatCount = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-GB") : "0";

const formatCurrencyValue = (amount?: number, currency = "") => {
  const safeAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return `${currency}${safeAmount.toLocaleString("en-GB")}`;
};

const readText = (value?: string, fallback = "0%") =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDashboardQuery();

  const overview = data?.overview;
  const revenue = data?.revenue;
  const subscriptionDistribution = data?.subscriptionDistribution ?? [];
  const totalUsersCount = overview?.totalUsers?.count ?? 0;
  const distributionBase =
    totalUsersCount > 0
      ? totalUsersCount
      : Math.max(...subscriptionDistribution.map((item) => item.userCount), 0);

  const getDistributionWidth = (userCount: number) => {
    if (distributionBase <= 0) {
      return 0;
    }

    const width = (userCount / distributionBase) * 100;
    return Math.min(Math.max(width, userCount > 0 ? 8 : 0), 100);
  };

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl   text-gray-800">System Overview</h1>
        <p className="text-gray-500 text-sm">Real-time monitoring of platform health and user activity</p>
      </section>

      {isError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg bg-[#4f795a] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#3d5e46]"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <StatsGrid overview={overview} isLoading={isLoading && !data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <h3 className="text-2xl   mb-1 text-gray-800">Monthly Recurring Revenue</h3>
          <p className="text-gray-500 text-sm mb-6">Current recurring revenue snapshot</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-bold   text-gray-800">
              {isLoading && !data ? "Loading..." : formatCurrencyValue(revenue?.mrr, revenue?.currency)}
            </span>
            <div className="flex items-center gap-1 text-[#497955]">
              <TrendingUp size={24} />
              <span className="text-lg font-bold">
                {isLoading && !data ? "..." : readText(revenue?.growth)}
              </span>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#dbe4dd] bg-[#f7faf8] px-6 py-5">
            <p className="text-sm text-gray-500">Revenue chart is hidden on this dashboard.</p>
            <p className="mt-2 text-base font-medium text-gray-800">
              {isFetching && !data ? "Refreshing revenue data..." : "Showing the latest MRR value only."}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <h3 className="text-2xl   mb-6 text-gray-800">Subscription Distribution</h3>
          {subscriptionDistribution.length > 0 ? (
            <div className="space-y-8">
              {subscriptionDistribution.map((plan) => (
                <div key={plan._id || plan.planName} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{plan.planName}</span>
                    <p className="text-[14px] font-bold text-gray-500">
                      <span className="mr-2 text-[14px] font-normal text-gray-800">
                        {formatCount(plan.userCount)} {plan.userCount === 1 ? "User" : "Users"}
                      </span>
                      {plan.pricePerMonth}
                    </p>
                  </div>
                  <div className="w-full bg-[#dbe4dd] h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4f795a] h-full rounded-full transition-all"
                      style={{ width: `${getDistributionWidth(plan.userCount)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-[#dbe4dd] bg-[#f7faf8] text-sm text-gray-500">
              {isLoading && !data ? "Loading subscription data..." : "No subscription distribution available yet."}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm">
        <div className="flex justify-end mb-4">
          <Link href="/dashboard/users" className="  text-gray-800 underline hover:text-[#4f795a] transition-colors">
            View all
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="bg-[#76977e] text-white  ">
                <th className="px-6 py-4 font-normal text-left rounded-l-2xl">User Name</th>
                <th className="px-6 py-4 font-normal text-left">Email</th>
                <th className="px-6 py-4 font-normal text-left">Subscription</th>
                <th className="px-6 py-4 font-normal text-left">Roadmap Type</th>
                <th className="px-6 py-4 font-normal text-left">Session Progress</th>
                <th className="px-6 py-4 font-normal text-left">Status</th>
                <th className="px-6 py-4 font-normal text-left rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardUsers.map((user) => (
                <tr key={user.id} className="text-sm  ">
                  <td className="px-6 py-4 text-gray-500">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500  ">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-1.5 border border-[#4f795a]/20 text-[#2db394] rounded-lg">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.type}</td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <span className="text-[10px] font-bold   block mb-1 text-gray-800">{user.progress}%</span>
                      <div className="w-full bg-[#cbd5cc] h-2 rounded-full">
                        <div className="bg-[#4f795a] h-full rounded-full" style={{ width: `${user.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-5 py-1 rounded-xl border ${user.status === 'Active' ? 'bg-[#f4faf7] text-[#2db394]' : 'bg-[#fff5f5] text-[#f25c5c]'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 text-[#4f795a] hover:opacity-70"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- USER DETAILS MODAL (New Design) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Cream Card */}
            <div className="px-8 pb-8">
              <div className="bg-[#fff9f2] rounded-2xl p-8 space-y-8">
                
                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">User ID</p>
                    <p className="text-gray-700 font-medium">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-gray-800  ">{selectedUser.email}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Roadmap Type</p>
                    <p className="text-gray-700 font-medium">{selectedUser.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Sessions Completed</p>
                    <p className="text-gray-700 font-medium">{selectedUser.sessions}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Subscription Plan</p>
                    <p className="text-gray-700 font-medium">{selectedUser.plan}</p>
                  </div>
                  <div>
                    <p className="text-[#eab308]/80 text-sm mb-1">Status</p>
                    <span className={`inline-block px-4 py-1 rounded-lg text-xs font-bold border bg-white ${selectedUser.status === 'Active' ? 'text-[#2db394] border-gray-100' : 'text-red-500 border-red-100'}`}>
                      {selectedUser.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Joined Date</p>
                    <p className="text-gray-700 font-medium">{selectedUser.joined}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Last Active</p>
                    <p className="text-gray-700 font-medium">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div>
                  <p className="  text-gray-800 mb-3">Overall Progress</p>
                  <div className="relative w-full bg-[#dce6e0] h-7 rounded-full overflow-hidden flex items-center px-1">
                    <div 
                      className="bg-[#4f795a] h-5 rounded-full" 
                      style={{ width: `${selectedUser.progress}%` }}
                    ></div>
                    <span className="ml-3 text-xs font-bold text-gray-700 z-10">{selectedUser.progress}%</span>
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="bg-[#347B76] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#2a625e] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
