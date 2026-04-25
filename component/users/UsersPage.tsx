"use client";

import { useDeferredValue, useState } from "react";
import { Eye, Filter, Search, X } from "lucide-react";
import type { AdminUserListItem } from "../redux/features/usersApi";
import {
  useGetAdminUsersQuery,
  useLazyGetAdminUserByIdQuery,
  useUpdateAdminUserStatusMutation,
} from "../redux/features/usersApi";

const USERS_PER_PAGE = 10;
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

const getStatusClasses = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  return normalizedStatus === "active"
    ? "bg-[#f4faf7] text-[#2db394] border-[#2db394]/10"
    : "bg-[#fff5f5] text-[#f25c5c] border-[#f25c5c]/10";
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [nextStatus, setNextStatus] = useState("active");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminUsersQuery({
    page: currentPage,
    limit: USERS_PER_PAGE,
    search: deferredSearchTerm.trim(),
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

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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
      void refetch();
      void fetchUserDetails(selectedUser.id);
    } catch (updateError) {
      setStatusErrorMessage(getErrorMessage(updateError));
    }
  };

  const modalProgress = parseProgress(selectedUserDetails?.overallProgress ?? selectedUser?.sessionProgress ?? "0%");
  const modalStatus = formatStatus(selectedUserDetails?.status ?? selectedUser?.status ?? "");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-gray-800">User Monitoring</h1>
        <p className="text-gray-500 text-sm">View user progress and account details.</p>
      </section>

      <div className="bg-[#f2f6f3] p-4 rounded-2xl flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by username or email"
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-600 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            setCurrentPage(1);
            void refetch();
          }}
          className="bg-[#4f795a] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium hover:bg-[#3d5d45] transition-colors"
        >
          <Filter size={18} /> Reset
        </button>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
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

      <div className="bg-white rounded-[2rem] p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="bg-[#76977e] text-white">
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const progress = parseProgress(user.sessionProgress);
                  const formattedStatus = formatStatus(user.status);

                  return (
                    <tr key={user.id} className="text-[#333] group">
                      <td className="px-6 py-4">{user.userName || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-1 border border-[#4f795a]/20 text-[#2db394] rounded-lg text-sm">
                          {user.subscription || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.roadmapType || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <span className="text-[10px] font-bold block mb-1">
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
                        <span
                          className={`px-4 py-1 rounded-xl text-xs border ${getStatusClasses(user.status)}`}
                        >
                          {formattedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewUser(user)}
                          className="flex items-center gap-2 text-[#4f795a] hover:opacity-70"
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Eye />
                          </div>
                          <span className="font-medium text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {isFetching ? "Refreshing users..." : `Showing page ${pagination?.page ?? currentPage} of ${totalPages}`}
          </p>
          <div className="flex items-center gap-3">
            <span>Total: {pagination?.total ?? 0}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage <= 1 || isFetching}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
              disabled={currentPage >= totalPages || isFetching}
              className="rounded-lg border border-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-8 py-6">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

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
                        <p className="text-gray-800">
                          {selectedUserDetails?.email || selectedUser.email || "N/A"}
                        </p>
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
    </div>
  );
}
