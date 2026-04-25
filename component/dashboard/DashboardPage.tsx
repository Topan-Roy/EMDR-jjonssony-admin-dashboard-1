"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, TrendingUp, X } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import StatsGrid from "./StatsGrid";
import { useGetDashboardQuery } from "../redux/features/dashboardApi";
import type { AdminUserListItem } from "../redux/features/usersApi";
import {
  useGetAdminUsersQuery,
  useLazyGetAdminUserByIdQuery,
  useUpdateAdminUserStatusMutation,
} from "../redux/features/usersApi";

const DASHBOARD_USERS_LIMIT = 5;
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
];

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

const formatStatus = (status: string) => {
  if (!status.trim()) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getStatusClasses = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  return normalizedStatus === "active"
    ? "bg-[#f4faf7] text-[#2db394] border-[#2db394]/10"
    : "bg-[#fff5f5] text-[#f25c5c] border-[#f25c5c]/10";
};

const parseProgress = (value: string) => {
  const match = value.match(/(\d+(\.\d+)?)/);

  if (!match) {
    return 0;
  }

  const progress = Number(match[1]);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(Math.max(progress, 0), 100);
};

const formatDate = (value: string) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [nextStatus, setNextStatus] = useState("active");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetDashboardQuery();
  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    page: 1,
    limit: DASHBOARD_USERS_LIMIT,
    search: "",
  });
  const [
    fetchUserDetails,
    {
      data: selectedUserDetails,
      isFetching: isFetchingSelectedUser,
      isError: isSelectedUserError,
      error: selectedUserError,
    },
  ] = useLazyGetAdminUserByIdQuery();
  const [updateAdminUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminUserStatusMutation();

  const overview = data?.overview;
  const revenue = data?.revenue;
  const chartData = revenue?.trend ?? [];
  const subscriptionDistribution = data?.subscriptionDistribution ?? [];
  const dashboardUsers = usersResponse?.users ?? [];
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

  const handleViewUser = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setNextStatus(user.status || "active");
    setStatusMessage(null);
    setStatusErrorMessage(null);
    void fetchUserDetails(user.id);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setStatusMessage(null);
    setStatusErrorMessage(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedUser) {
      return;
    }

    setStatusMessage(null);
    setStatusErrorMessage(null);

    try {
      const response = await updateAdminUserStatus({
        userId: selectedUser.id,
        status: nextStatus,
      }).unwrap();

      setSelectedUser((currentUser) =>
        currentUser ? { ...currentUser, status: response.status } : currentUser,
      );
      setNextStatus(response.status);
      setStatusMessage(`User status updated to ${formatStatus(response.status)}.`);
      void refetchUsers();
      void fetchUserDetails(selectedUser.id);
    } catch (updateError) {
      setStatusErrorMessage(getErrorMessage(updateError));
    }
  };

  const modalProgress = parseProgress(
    selectedUserDetails?.overallProgress ?? selectedUser?.sessionProgress ?? "0%",
  );

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
          <p className="text-gray-500 text-sm mb-6">Revenue trends over the last 12 months</p>
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
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dashboard-revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f795a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f795a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#4f795a"
                    strokeWidth={2}
                    fill="url(#dashboard-revenue-gradient)"
                    dot={{ r: 4, fill: "#fff", stroke: "#4f795a", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#4f795a", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[2rem] border border-dashed border-[#dbe4dd] bg-[#f7faf8] px-6 py-5 text-sm text-gray-500">
                {isFetching && !data ? "Refreshing revenue data..." : "No revenue trend available yet."}
              </div>
            )}
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

        {isUsersError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{getErrorMessage(usersError)}</p>
              <button
                type="button"
                onClick={() => void refetchUsers()}
                className="rounded-lg bg-[#4f795a] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#3d5e46]"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
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
              {isUsersLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : dashboardUsers.length > 0 ? (
                dashboardUsers.map((user) => {
                  const progress = parseProgress(user.sessionProgress);

                  return (
                    <tr key={user.id} className="text-sm">
                      <td className="px-6 py-4 text-gray-500">{user.userName || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-1.5 border border-[#4f795a]/20 text-[#2db394] rounded-lg">
                          {user.subscription || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.roadmapType || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <span className="text-[10px] font-bold block mb-1 text-gray-800">
                            {user.sessionProgress || "0%"}
                          </span>
                          <div className="w-full bg-[#cbd5cc] h-2 rounded-full">
                            <div
                              className="bg-[#4f795a] h-full rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-5 py-1 rounded-xl border ${getStatusClasses(user.status)}`}>
                          {formatStatus(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewUser(user)}
                          className="flex items-center gap-2 text-[#4f795a] hover:opacity-70"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    {isUsersFetching ? "Refreshing users..." : "No users found."}
                  </td>
                </tr>
              )}
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
              <button type="button" onClick={handleCloseModal} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Cream Card */}
            <div className="px-8 pb-8">
              <div className="bg-[#fff9f2] rounded-2xl p-8 space-y-8">
                {statusMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {statusMessage}
                  </div>
                )}

                {statusErrorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {statusErrorMessage}
                  </div>
                )}

                {isFetchingSelectedUser && !selectedUserDetails ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    Loading user details...
                  </div>
                ) : isSelectedUserError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    <p>{getErrorMessage(selectedUserError)}</p>
                    <button
                      type="button"
                      onClick={() => void fetchUserDetails(selectedUser.id)}
                      className="mt-3 rounded-lg bg-[#4f795a] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#3d5e46]"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">User ID</p>
                        <p className="text-gray-700 font-medium">
                          {selectedUserDetails?.userId || selectedUser.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Email</p>
                        <p className="text-gray-800">{selectedUserDetails?.email || selectedUser.email}</p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm mb-1">Roadmap Type</p>
                        <p className="text-gray-700 font-medium">
                          {selectedUserDetails?.roadmapType || selectedUser.roadmapType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Sessions Completed</p>
                        <p className="text-gray-700 font-medium">
                          {selectedUserDetails?.sessionsCompleted ?? 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm mb-1">Subscription Plan</p>
                        <p className="text-gray-700 font-medium">
                          {selectedUserDetails?.subscriptionPlan || selectedUser.subscription || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#eab308]/80 text-sm mb-1">Status</p>
                        <div className="space-y-2">
                          <select
                            value={nextStatus}
                            onChange={(event) => setNextStatus(event.target.value)}
                            disabled={isUpdatingStatus}
                            className="w-full rounded-lg border border-[#E5DED2] bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition-colors focus:border-[#4f795a]"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {/* <span
                            className={`inline-block px-4 py-1 rounded-lg text-xs font-bold border bg-white ${getStatusClasses(
                              selectedUserDetails?.status || selectedUser.status,
                            )}`}
                          >
                            Current: {modalStatus}
                          </span> */}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm mb-1">Joined Date</p>
                        <p className="text-gray-700 font-medium">
                          {formatDate(selectedUserDetails?.joinedDate || selectedUser.joinedDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Last Active</p>
                        <p className="text-gray-700 font-medium">
                          {formatDate(selectedUserDetails?.lastActive || selectedUser.joinedDate)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-3">Overall Progress</p>
                      <div className="relative w-full bg-[#dce6e0] h-7 rounded-full overflow-hidden flex items-center px-1">
                        <div
                          className="bg-[#4f795a] h-5 rounded-full"
                          style={{ width: `${modalProgress}%` }}
                        />
                        <span className="ml-3 text-xs font-bold text-gray-700 z-10">
                          {selectedUserDetails?.overallProgress || selectedUser.sessionProgress || "0%"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => void handleSaveStatus()}
                  disabled={isUpdatingStatus || nextStatus === (selectedUserDetails?.status || selectedUser.status)}
                  className="bg-[#4f795a] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#3d5e46] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingStatus ? "Saving..." : "Save Status"}
                </button>
                <button 
                  type="button"
                  onClick={handleCloseModal}
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
