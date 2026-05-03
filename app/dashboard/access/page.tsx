"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import Link from "next/link";
import type { AdminUserListItem } from "@/component/redux/features/usersApi";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from "@/component/redux/features/usersApi";

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
];

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "Request failed. Please try again.";
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

  return "Request failed. Please try again.";
};

const formatStatus = (status: string) => {
  if (!status.trim()) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

const getStatusTextClasses = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  return normalizedStatus === "active" ? "text-[#4f795a]" : "text-red-500";
};

export default function AccessPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [nextStatus, setNextStatus] = useState("active");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminUsersQuery({
    page: currentPage,
    limit: 10,
    search: "",
  });

  const [updateAdminUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminUserStatusMutation();

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenModal = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setNextStatus(user.status || "active");
    setSaveMessage(null);
    setSaveErrorMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setSaveMessage(null);
    setSaveErrorMessage(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedUser) {
      return;
    }

    setSaveMessage(null);
    setSaveErrorMessage(null);

    try {
      const response = await updateAdminUserStatus({
        userId: selectedUser.id,
        status: nextStatus,
      }).unwrap();

      setSelectedUser((currentUser) =>
        currentUser ? { ...currentUser, status: response.status } : currentUser,
      );
      setSaveMessage(`User status updated to ${formatStatus(response.status)}.`);
      void refetch();
    } catch (saveError) {
      setSaveErrorMessage(getErrorMessage(saveError));
    }
  };

  return (
    <div className="min-h-screen md:p-8 text-gray-800">
      <div className="flex items-center gap-2 mb-8 text-gray-700">
        <Link href="/dashboard" className="hover:opacity-70 flex items-center gap-2">
          <ChevronLeft size={20} />
          <span className="text-lg font-medium">Access</span>
        </Link>
      </div>

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

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 px-8 py-6 border-b border-gray-100 bg-[#fbfbfb] min-w-[600px]">
            <div className="col-span-5 text-sm font-bold text-gray-500 uppercase tracking-wider">
              User Name
            </div>
            <div className="col-span-5 text-sm font-bold text-gray-500 uppercase tracking-wider">
              Status
            </div>
            <div className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">
              Action
            </div>
          </div>

          <div className="divide-y divide-gray-50 min-w-[600px]">
            {isLoading ? (
              <div className="px-8 py-12 text-center text-sm text-gray-500">Loading users...</div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 px-8 py-6 items-center transition-colors hover:bg-gray-50 ${
                    user.status.trim().toLowerCase() === "active" ? "bg-[#f4faf7]/50" : ""
                  }`}
                >
                  <div className="col-span-5 font-medium text-gray-700">
                    {user.userName || "N/A"}
                  </div>
                  <div className="col-span-5">
                    <span className={`text-sm font-medium ${getStatusTextClasses(user.status)}`}>
                      {formatStatus(user.status)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(user)}
                      className="w-8 h-8 rounded-full bg-[#4f795a] text-white flex items-center justify-center hover:bg-[#3d5e46] transition-all shadow-sm"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center text-sm text-gray-500">
                {isFetching ? "Refreshing users..." : "No users found."}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && users.length > 0 && totalPages > 1 && (
          <div className="px-8 py-6 border-t border-gray-100 bg-[#fbfbfb] flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-700">{currentPage}</span> of{" "}
              <span className="font-medium text-gray-700">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-[#4f795a] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[600px] flex flex-col rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-50 z-10">
              <h2 className="text-xl font-bold text-gray-700">User Details</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto bg-[#FFF9F2] p-6 space-y-8">
              {saveMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {saveMessage}
                </div>
              )}

              {saveErrorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveErrorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">User ID</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Email</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Joined Date</p>
                  <p className="text-gray-800 text-[15px]">{formatDate(selectedUser.joinedDate)}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Status</p>
                  <select
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full rounded-lg border border-[#E5DED2] bg-white px-3 py-2 text-gray-800 text-[15px] outline-none transition-colors focus:border-[#4f795a]"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#FFF9F2] rounded-xl border border-[#F5EAD9] p-5">
                <h3 className="text-xl text-[#8c9bab] mb-4">Assessment Results</h3>

                <div className="space-y-4">
                  <div className="border-b border-[#EAE0D5] pb-3 last:border-0 last:pb-0">
                    <p className="text-[#9CA3AF] text-sm mb-1">Depression (PHQ-9)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">Not available</span>
                      <span className="text-[#9CA3AF] ml-1 text-xs">(Score: N/A)</span>
                    </p>
                  </div>
                  <div className="border-b border-[#EAE0D5] pb-3 last:border-0 last:pb-0">
                    <p className="text-[#9CA3AF] text-sm mb-1">Anxiety (GAD-7)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">Not available</span>
                      <span className="text-[#9CA3AF] ml-1 text-xs">(Score: N/A)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9CA3AF] text-sm mb-1">Dissociation (DES-II)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">Score: N/A</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl text-[#8c9bab] mb-4 pl-1">Immediate Support Available</h3>

                <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Samaritans (24/7)</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Free emotional support for anyone in distress
                    </p>
                    <p className="text-xs text-gray-800 font-bold mt-1">
                      Call: 116 123{" "}
                      <span className="text-[#9CA3AF] font-normal">(Free from any phone)</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">NHS Crisis Line</p>
                    <p className="text-xs text-gray-500 mt-1">Urgent mental health support</p>
                    <p className="text-xs text-gray-800 font-bold mt-1">
                      Call: 111{" "}
                      <span className="text-[#9CA3AF] font-normal">
                        and select mental health option
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">SHOUT Crisis Text Line</p>
                    <p className="text-xs text-gray-500 mt-1">
                      24/7 text support for anyone in crisis
                    </p>
                    <p className="text-xs text-gray-800 font-normal mt-1">
                      Text &quot;<span className="font-bold">SHOUT</span>&quot; to{" "}
                      <span className="font-bold">85258</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Your GP Surgery</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Contact your GP for an urgent appointment
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      They can provide immediate support and referrals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 flex gap-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-3 bg-[#F9FAFB] text-[#4F7A5B] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveStatus()}
                disabled={isUpdatingStatus || nextStatus === selectedUser.status}
                className="flex-1 py-3 bg-[#4F7A5B] text-white rounded-lg font-bold text-lg hover:bg-[#3E634A] transition-colors shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
