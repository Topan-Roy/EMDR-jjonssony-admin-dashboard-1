"use client";

import React, { FormEvent, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const supportTopics = [
  "ABCDE",
  "Billing & Subscription",
  "Technical Issue",
  "Account Problem",
  "General Feedback",
];

export default function SettingSupportRequestsPage() {
  const [topic, setTopic] = useState(supportTopics[0]);
  const [complaint, setComplaint] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint.trim()) {
      setStatusMessage("Please write your complaint before sending.");
      return;
    }

    setStatusMessage("Support request sent to admin (demo).");
    setComplaint("");
  };

  return (
    <div className="max-w-6xl">
      <div className="relative z-20 mb-6">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-700 transition-colors hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="text-[#111111]
          ">Support Requests</span>
        </Link>
      </div>

      <div className="  ">
      
        <div className="pointer-events-none absolute inset-0 bg-[#f7f1de]/70" />

        <div className="relative z-10 flex min-h-[72vh] items-center justify-center p-4 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-3xl border border-white/50 bg-white/60 p-6 shadow-xl backdrop-blur-sm sm:p-8"
          >
            <div className="mb-6 flex justify-center">
              <Image
                src="/image/logo.png"
                alt="UK INKIND logo"
                width={200}
                height={120}
                className="h-auto w-[170px] sm:w-[200px]"
              />
            </div>

            <p className="mb-4 text-center text-lg text-[#262424]">
              If you face any kind of problem with our service feel free to contact us.
            </p>

            <label className="mb-2 block text-sm font-medium text-[#2f2d2d]">
              Topic
            </label>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mb-4 w-full rounded-xl border border-[#d7c89f] bg-[#efe4c8]/90 p-4 text-base text-[#2f2d2d] outline-none transition-all focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a]"
            >
              {supportTopics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-medium text-[#2f2d2d]">
              Complaint
            </label>
            <textarea
              rows={6}
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              placeholder="Write your complain here"
              className="mb-5 w-full resize-none rounded-2xl border border-[#ded4bd] bg-white/75 p-4 text-base text-[#2f2d2d] outline-none transition-all placeholder:text-[#5d5b5b] focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a]"
            />

            {statusMessage && (
              <p className="mb-4 rounded-md border border-[#c6d7cb] bg-[#edf6ef]/90 px-3 py-2 text-sm text-[#356141]">
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#4f795a] py-3 text-lg font-medium text-white transition-colors hover:bg-[#3d5e46]"
            >
              Send to admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
