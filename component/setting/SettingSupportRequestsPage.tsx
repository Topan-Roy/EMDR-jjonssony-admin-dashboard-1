"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Send,
  History,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useGetSupportTicketsQuery,
  useUpdateTicketMutation,
  useSendUserNotificationMutation,
  type Ticket,
} from "../redux/features/supportApi";

const formatTimestamp = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

export default function SettingSupportRequestsPage() {
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  const { data, isLoading, isError, refetch } = useGetSupportTicketsQuery({
    page: 1,
    limit: 50,
  });
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [sendNotification] = useSendUserNotificationMutation();

  const tickets = data?.tickets || [];

  const toggleTicket = (id: string) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
    setReplyText(""); // Clear reply text when switching tickets
  };

  const getStatusInfo = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "open") {
      return { bg: "bg-[#ecf5ff]", text: "text-[#409eff]", label: "Open" };
    }
    if (normalized === "resolved") {
      return { bg: "bg-[#f0f9eb]", text: "text-[#67c23a]", label: "Resolved" };
    }
    return { bg: "bg-gray-100", text: "text-gray-500", label: status };
  };

  const handleSendReply = async (ticketId: string, status: "resolved" | "open" = "open") => {
    if (!replyText.trim() && status !== "resolved") return;

    try {
      await updateTicket({
        id: ticketId,
        payload: {
          response: replyText.trim() || "Thank you for reaching out. Your ticket has been marked as resolved.",
          status,
        },
      }).unwrap();

      const ticket = tickets.find((t: Ticket) => t._id === ticketId);
      const userId = ticket?.userId && typeof ticket.userId === "object" ? ticket.userId._id : ticket?.userId;

      if (userId && replyText.trim()) {
        try {
          await sendNotification({
            userId: userId as string,
            title: "Support Request Reply",
            body: replyText.trim(),
            data: {
              type: "support_reply",
              ticketId,
            },
          }).unwrap();
        } catch (notifErr) {
          console.error("Failed to send notification:", notifErr);
        }
      }

      setReplyText("");
      // Optionally auto-collapse or keep open
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl p-8 text-center text-gray-500">
        Loading support requests...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl p-8 text-center">
        <p className="mb-4 text-red-500">Failed to load support requests.</p>
        <button
          onClick={() => void refetch()}
          className="rounded-lg bg-[#4f795a] px-4 py-2 text-sm font-bold text-white hover:bg-[#3d5e46]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl pb-20" style={{ fontFamily: "Georgia, serif" }}>
      <div className="relative z-10 mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-700 transition-colors hover:text-black"
        >
          <ChevronLeft size={24} />
          <span className="text-[20px] font-bold text-[#111111]">Support Requests</span>
        </Link>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-gray-300 bg-white p-12 text-center text-gray-400">
            No support requests found.
          </div>
        )}

        {tickets.map((ticket) => {
          const isExpanded = expandedTicketId === ticket._id;
          const statusStyle = getStatusInfo(ticket.status);
          const user = typeof ticket.userId === "object" ? ticket.userId : null;
          const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown User";

          return (
            <div
              key={ticket._id}
              className={`overflow-hidden rounded-[1.2rem] border border-[#eff1f7] bg-white transition-all ${isExpanded ? "shadow-md scale-[1.01]" : "hover:shadow-sm"
                }`}
            >
              <div
                onClick={() => toggleTicket(ticket._id)}
                className="flex cursor-pointer items-center justify-between p-5"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {/* <span className="text-[14px] font-medium text-gray-500">#{ticket._id.slice(-6).toUpperCase()}</span> */}
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[12px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-500`}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#353381]">{ticket.category}</h3>
                  <div className="flex items-center gap-4 text-[13px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#353381]" />
                      <span>{userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
                      <span>{formatTimestamp(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full bg-[#f0f4f9] px-4 py-1.5 text-[13px] font-medium text-[#353381]">
                    <span>{ticket.adminResponse ? "1 reply" : "0 reply"}</span>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[#f7f8fc] bg-[#fdfdff] p-6 pt-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 mb-6">
                    {/* User's original message */}
                    <div className="rounded-2xl border border-[#eef1f6] bg-white p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00bcd4] text-white text-[14px] font-bold">
                          {userName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-gray-700">{userName}</span>
                          <span className="text-[12px] text-gray-400">{formatTimestamp(ticket.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-[14px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Admin's response if exists */}
                    {ticket.adminResponse && (
                      <div className="rounded-2xl border border-[#fef2dc] bg-[#fff9ef] p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4f795a] text-white text-[14px] font-bold">
                            A
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-700">Admin Support</span>
                            <span className="text-[12px] text-gray-400">
                              {ticket.respondedAt ? formatTimestamp(ticket.respondedAt) : "Recently"}
                            </span>
                          </div>
                        </div>
                        <p className="text-[14px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                          {ticket.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>

                  {ticket.status === "resolved" ? (
                    <div className="flex items-center justify-between rounded-xl bg-[#e3f9eb] p-4 text-[#3eb36a]">
                      <div className="flex items-center gap-3 text-[14px] font-medium">
                        <AlertCircle size={20} />
                        <span>This ticket has been resolved</span>
                      </div>
                      <button
                        onClick={() => handleSendReply(ticket._id, "open")}
                        disabled={isUpdating}
                        className="rounded-xl border border-[#3eb36a] bg-white px-6 py-2 text-[14px] font-bold text-[#3eb36a] hover:bg-[#f0fbf4] disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          disabled={isUpdating}
                          className="min-h-[160px] w-full resize-none rounded-xl border border-[#fef2dc] bg-[#fffcf5] p-5 text-[14px] text-black outline-none placeholder:text-gray-400 focus:border-[#4f795a] disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSendReply(ticket._id, "resolved")}
                          disabled={isUpdating}
                          className="flex items-center gap-2 rounded-[1rem] bg-white border border-[#edeff5] px-6 py-3.5 text-[14px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          <History size={18} />
                          <span>Mark Resolved</span>
                        </button>
                        <button
                          onClick={() => handleSendReply(ticket._id, "open")}
                          disabled={isUpdating || !replyText.trim()}
                          className="flex items-center gap-2 rounded-[1rem] bg-[#4f795a] px-8 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#3d5e46] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={18} />
                          <span>{isUpdating ? "Sending..." : "Send Reply"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
