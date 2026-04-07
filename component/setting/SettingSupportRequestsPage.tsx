"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Send,
  History,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAgent: boolean;
  avatarLetter: string;
}

interface Ticket {
  id: string;
  ticketNo: string;
  title: string;
  category: string;
  timestamp: string;
  status: "New" | "In Progress" | "Resolved";
  replies: Message[];
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    ticketNo: "T-001",
    title: "Auto-Approve Bookings",
    category: "Category",
    timestamp: "15 May 2020 8:00 pm",
    status: "New",
    replies: [
      {
        id: "m1",
        sender: "Deja Brady",
        content: "I filled in Section 2 of the AM2 checklist yesterday but when I logged in today it was all blank again. I have tried on Chrome and Firefox.",
        timestamp: "15 May 2020 8:00 pm",
        isAgent: false,
        avatarLetter: "D",
      },
    ],
  },
  {
    id: "2",
    ticketNo: "T-001",
    title: "Auto-Approve Bookings",
    category: "Category",
    timestamp: "15 May 2020 8:00 pm",
    status: "In Progress",
    replies: [
      {
        id: "m2",
        sender: "Deja Brady",
        content: "I filled in Section 2 of the AM2 checklist yesterday but when I logged in today it was all blank again. I have tried on Chrome and Firefox.",
        timestamp: "15 May 2020 8:00 pm",
        isAgent: false,
        avatarLetter: "D",
      },
      {
        id: "m3",
        sender: "Deja Brady",
        content: "Hi James, we are looking into this. Could you try clearing your browser cache and trying again?",
        timestamp: "15 May 2020 8:00 pm",
        isAgent: true,
        avatarLetter: "D",
      },
    ],
  },
  {
    id: "3",
    ticketNo: "T-001",
    title: "Auto-Approve Bookings",
    category: "Category",
    timestamp: "15 May 2020 8:00 pm",
    status: "Resolved",
    replies: [
      {
        id: "m4",
        sender: "Deja Brady",
        content: "I filled in Section 2 of the AM2 checklist yesterday but when I logged in today it was all blank again. I have tried on Chrome and Firefox.",
        timestamp: "15 May 2020 8:00 pm",
        isAgent: false,
        avatarLetter: "D",
      },
      {
        id: "m5",
        sender: "Deja Brady",
        content: "Hi James, we are looking into this. Could you try clearing your browser cache and trying again?",
        timestamp: "15 May 2020 8:00 pm",
        isAgent: true,
        avatarLetter: "D",
      },
    ],
  },
];

export default function SettingSupportRequestsPage() {
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>("2");

  const toggleTicket = (id: string) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  const getStatusInfo = (status: Ticket["status"]) => {
    switch (status) {
      case "New":
        return {
          bg: "bg-[#ecf5ff]",
          text: "text-[#409eff]",
        };
      case "In Progress":
        return {
          bg: "bg-[#fdf6ec]",
          text: "text-[#e6a23c]",
        };
      case "Resolved":
        return {
          bg: "bg-[#f0f9eb]",
          text: "text-[#67c23a]",
        };
      default:
        return { bg: "bg-gray-100", text: "text-gray-500" };
    }
  };

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
        {mockTickets.map((ticket) => {
          const isExpanded = expandedTicketId === ticket.id;
          const statusStyle = getStatusInfo(ticket.status);

          return (
            <div
              key={ticket.id}
              className={`overflow-hidden rounded-[1.2rem] border border-[#eff1f7] bg-white transition-all ${
                isExpanded ? "shadow-sm" : "hover:shadow-sm"
              }`}
            >
              <div
                onClick={() => toggleTicket(ticket.id)}
                className="flex cursor-pointer items-center justify-between p-5"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-gray-500">{ticket.ticketNo}</span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[12px] font-bold ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#353381]">{ticket.title}</h3>
                  <div className="flex items-center gap-4 text-[13px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#353381]" />
                      <span>{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
                      <span>{ticket.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full bg-[#f0f4f9] px-4 py-1.5 text-[13px] font-medium text-[#353381]">
                    <span>{ticket.replies.length} reply</span>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-[#f7f8fc] bg-[#fdfdff] p-6 pt-8">
                  <div className="space-y-4 mb-6">
                    {ticket.replies.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-2xl border p-5 ${
                          msg.isAgent
                            ? "border-[#fef2dc] bg-[#fff9ef]"
                            : "border-[#eef1f6] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00bcd4] text-white text-[14px] font-bold">
                            {msg.avatarLetter}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-700">{msg.sender}</span>
                            <span className="text-[12px] text-gray-400">{msg.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-[14px] leading-relaxed text-gray-600">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {ticket.status === "Resolved" ? (
                    <div className="flex items-center justify-between rounded-xl bg-[#e3f9eb] p-4 text-[#3eb36a]">
                      <div className="flex items-center gap-3 text-[14px] font-medium">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3eb36a] text-white">
                           !
                        </div>
                        <span>This ticket has been resolved</span>
                      </div>
                      <button className="rounded-xl border border-[#3eb36a] bg-white px-6 py-2 text-[14px] font-bold text-[#3eb36a] hover:bg-[#f0fbf4]">
                        Reopen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          placeholder="Type your reply..."
                          className="min-h-[160px] w-full resize-none rounded-xl border border-[#fef2dc] bg-[#fffcf5] p-5 text-[14px] outline-none placeholder:text-gray-400 focus:border-[#4f795a]"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <button className="flex items-center gap-2 rounded-[1rem] bg-white border border-[#edeff5] px-6 py-3.5 text-[14px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                          <History size={18} />
                          <span>Mark Resolved</span>
                        </button>
                        <button className="flex items-center gap-2 rounded-[1rem] bg-[#4f795a] px-8 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#3d5e46]">
                          <Send size={18} />
                          <span>Send Reply</span>
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
