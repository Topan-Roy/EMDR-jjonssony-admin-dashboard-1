"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import Link from "next/link";
import type { SubscriptionAccessRequest } from "@/component/redux/features/subscriptionsApi";
import {
  useGetSubscriptionRequestsQuery,
  useUpdateSubscriptionRequestStatusMutation,
} from "@/component/redux/features/subscriptionsApi";

const ITEMS_PER_PAGE = 10;
const APPROVAL_COMMENT = "Welcome! Your free plan access has been approved.";

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
  const normalizedStatus = status.trim();

  if (!normalizedStatus) {
    return "Unknown";
  }

  return normalizedStatus
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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

const getUserName = (request: SubscriptionAccessRequest) => {
  const fullName = [request.userId.firstName, request.userId.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || request.userId.email || "N/A";
};

const getStatusTextClasses = (status: string) => {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "approved" || normalizedStatus === "active") {
    return "text-[#4f795a]";
  }

  if (normalizedStatus === "pending") {
    return "text-amber-600";
  }

  if (
    normalizedStatus === "rejected" ||
    normalizedStatus === "declined" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "suspended"
  ) {
    return "text-red-500";
  }

  return "text-gray-500";
};

export default function AccessPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionAccessRequest | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const {
    data: subscriptionRequests = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSubscriptionRequestsQuery();
  const [updateSubscriptionRequestStatus, { isLoading: isApproving }] =
    useUpdateSubscriptionRequestStatusMutation();

  const totalPages = Math.max(1, Math.ceil(subscriptionRequests.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  const requests = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;

    return subscriptionRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activePage, subscriptionRequests]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenModal = (request: SubscriptionAccessRequest) => {
    setSelectedRequest(request);
    setSaveMessage(null);
    setSaveErrorMessage(null);
  };

  const handleCloseModal = () => {
    if (isApproving) {
      return;
    }

    setSelectedRequest(null);
    setSaveMessage(null);
    setSaveErrorMessage(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) {
      return;
    }

    setSaveMessage(null);
    setSaveErrorMessage(null);

    try {
      const response = await updateSubscriptionRequestStatus({
        requestId: selectedRequest._id,
        status: "approved",
        comment: APPROVAL_COMMENT,
      }).unwrap();

      setSelectedRequest((currentRequest) =>
        currentRequest
          ? {
              ...currentRequest,
              status: response.status || "approved",
              adminComment: response.adminComment || APPROVAL_COMMENT,
              updatedAt: new Date().toISOString(),
            }
          : currentRequest,
      );
      setSaveMessage(response.message || "Application approved successfully.");
    } catch (approveError) {
      setSaveErrorMessage(getErrorMessage(approveError));
    }
  };

  return (
    <div className="min-h-screen md:p-10 text-gray-800">
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

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[680px]">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-12 px-10 py-7 border-b border-gray-100 bg-[#fbfbfb] min-w-[840px]">
            <div className="col-span-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
              User Name
            </div>
            <div className="col-span-3 text-sm font-bold text-gray-500 uppercase tracking-wider">
              Plan
            </div>
            <div className="col-span-3 text-sm font-bold text-gray-500 uppercase tracking-wider">
              Status
            </div>
            <div className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">
              Action
            </div>
          </div>

          <div className="divide-y divide-gray-50 min-w-[840px]">
            {isLoading ? (
              <div className="px-8 py-12 text-center text-sm text-gray-500">
                Loading subscription requests...
              </div>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request._id || `${request.userId._id}-${request.createdAt}`}
                  className={`grid grid-cols-12 px-10 py-7 items-center transition-colors hover:bg-gray-50 ${
                    request.status.trim().toLowerCase() === "approved" ? "bg-[#f4faf7]/50" : ""
                  }`}
                >
                  <div className="col-span-4 text-base font-medium text-gray-700">
                    {getUserName(request)}
                  </div>
                  <div className="col-span-3 text-base text-gray-600">
                    {request.planId.name || "N/A"}
                  </div>
                  <div className="col-span-3">
                    <span
                      className={`text-base font-medium ${getStatusTextClasses(request.status)}`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(request)}
                      className="w-9 h-9 rounded-full bg-[#4f795a] text-white flex items-center justify-center hover:bg-[#3d5e46] transition-all shadow-sm"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center text-sm text-gray-500">
                {isFetching ? "Refreshing subscription requests..." : "No subscription requests found."}
              </div>
            )}
          </div>
        </div>

        {!isLoading && subscriptionRequests.length > 0 && totalPages > 1 && (
          <div className="px-10 py-7 border-t border-gray-100 bg-[#fbfbfb] flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium text-gray-700">{activePage}</span> of{" "}
              <span className="font-medium text-gray-700">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (activePage <= 3) {
                  pageNum = i + 1;
                } else if (activePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = activePage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                      activePage === pageNum
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
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full max-w-[520px] flex flex-col rounded-lg shadow-2xl max-h-[94vh] overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-5 bg-white z-10">
              <h2 className="text-base font-medium text-gray-800">User Details</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isApproving}
                className="text-gray-700 hover:text-gray-900 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-4 mb-4 overflow-y-auto rounded-xl border border-[#F5EAD9] bg-[#FFF9F2] p-6">
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <p className="text-[#9CA3AF] text-[13px] mb-1">User ID</p>
                  <p className="text-gray-800 text-[13px] break-all">
                    {selectedRequest.userId._id || selectedRequest._id}
                  </p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-[13px] mb-1">Email</p>
                  <p className="text-gray-800 text-[13px] break-all">
                    {selectedRequest.userId.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-[13px] mb-1">Joined&nbsp; Date</p>
                  <p className="text-gray-800 text-[13px]">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-[13px] mb-1">Status</p>
                  <p
                    className={`text-[13px] font-medium ${getStatusTextClasses(
                      selectedRequest.status,
                    )}`}
                  >
                    {formatStatus(selectedRequest.status)}
                  </p>
                </div>
              </div>

              {saveMessage && (
                <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
                  {saveMessage}
                </div>
              )}

              {saveErrorMessage && (
                <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {saveErrorMessage}
                </div>
              )}

              <div className="mt-6 rounded-xl border border-[#F5EAD9] bg-[#FFF9F2] p-5">
                <h3 className="mb-4 text-base text-[#8c9bab]">Assessment Results</h3>

                <div className="space-y-4">
                  <div className="border-b border-[#EAE0D5] pb-3">
                    <p className="text-[#9CA3AF] text-xs mb-1">Depression (PHQ-9)</p>
                    <p className="text-xs text-gray-800">
                      <span className="font-bold">Minimal</span>
                      <span className="text-[#9CA3AF] ml-1">(Score: 0/27)</span>
                    </p>
                  </div>
                  <div className="border-b border-[#EAE0D5] pb-3">
                    <p className="text-[#9CA3AF] text-xs mb-1">Anxiety (GAD-7)</p>
                    <p className="text-xs text-gray-800">
                      <span className="font-bold">Minimal</span>
                      <span className="text-[#9CA3AF] ml-1">(Score: 0/21)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9CA3AF] text-xs mb-1">Dissociation (DES-II)</p>
                    <p className="text-xs text-gray-800">
                      <span className="font-bold">Score: 0.0%</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#F5EAD9] bg-white p-5">
                <h3 className="mb-5 text-base text-[#8c9bab]">Immediate Support Available</h3>

                <div className="rounded-xl bg-[#FFF9F2] p-5 space-y-5">
                  <div>
                    <p className="font-bold text-gray-800 text-xs">Samaritans (24/7)</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Free emotional support for anyone in distress
                    </p>
                    <p className="text-[11px] text-gray-800 font-bold mt-1">
                      Call: 116 123{" "}
                      <span className="text-[#9CA3AF] font-normal">(Free from any phone)</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">NHS Crisis Line</p>
                    <p className="text-[11px] text-gray-500 mt-1">Urgent mental health support</p>
                    <p className="text-[11px] text-gray-800 font-bold mt-1">
                      Call: 111{" "}
                      <span className="text-[#9CA3AF] font-normal">
                        and select mental health option
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">SHOUT Crisis Text Line</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      24/7 text support for anyone in crisis
                    </p>
                    <p className="text-[11px] text-gray-800 font-normal mt-1">
                      Text &quot;<span className="font-bold">SHOUT</span>&quot; to{" "}
                      <span className="font-bold">85258</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">Your GP Surgery</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Contact your GP for an urgent appointment
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      They can provide immediate support and referrals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 pb-4 bg-white">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isApproving}
                className="h-10 rounded-md border border-gray-200 bg-[#F9FAFB] text-sm font-medium text-[#4F7A5B] shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleApproveRequest()}
                disabled={isApproving || selectedRequest.status.trim().toLowerCase() === "approved"}
                className="h-10 rounded-md bg-[#4F7A5B] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3E634A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApproving
                  ? "Approving..."
                  : selectedRequest.status.trim().toLowerCase() === "approved"
                    ? "Approved"
                    : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
