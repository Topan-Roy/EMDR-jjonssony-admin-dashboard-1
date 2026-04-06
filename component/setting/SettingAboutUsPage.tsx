"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState } from "react";
import { ChevronLeft, Edit3, Save, Bold, Italic, List, AlignLeft } from "lucide-react";
import Link from "next/link";
import { useGetAboutUsQuery, useUpdateAboutUsMutation } from "../redux/features/aboutApi";

const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string => {
  if (!error) {
    return "Request failed. Please try again.";
  }

  if ("data" in error) {
    const data = error.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;

      if (
        typeof record.message === "string" &&
        record.message.trim().length > 0
      ) {
        return record.message;
      }

      if (record.data && typeof record.data === "object") {
        const nestedData = record.data as Record<string, unknown>;

        if (
          typeof nestedData.message === "string" &&
          nestedData.message.trim().length > 0
        ) {
          return nestedData.message;
        }
      }
    }
  }

  if (
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "Request failed. Please try again.";
};

export default function SettingAboutUsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [draftOverview, setDraftOverview] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const {
    data: aboutData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAboutUsQuery();
  const [updateAboutUs, { isLoading: isSaving }] = useUpdateAboutUsMutation();

  const currentOverview = aboutData?.overview || aboutData?.aboutUs || "";

  let lastUpdated: string | null = null;

  if (aboutData?.updatedAt) {
    const date = new Date(aboutData.updatedAt);

    if (!Number.isNaN(date.getTime())) {
      lastUpdated = date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  const handleEditOrSave = async () => {
    if (!isEditing) {
      setDraftOverview(currentOverview);
      setStatusMessage(null);
      setSaveErrorMessage(null);
      setIsEditing(true);
      return;
    }

    const nextOverview = draftOverview.trim();

    if (!nextOverview) {
      setSaveErrorMessage("Overview is required.");
      return;
    }

    setStatusMessage(null);
    setSaveErrorMessage(null);

    try {
      await updateAboutUs({
        overview: nextOverview,
        sections: aboutData?.sections ?? [],
      }).unwrap();
      setStatusMessage("About Us updated successfully.");
      setIsEditing(false);
    } catch (saveError) {
      setSaveErrorMessage(
        getErrorMessage(saveError as FetchBaseQueryError | SerializedError),
      );
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">About Us</span>
        </Link>

        <button
          onClick={() => void handleEditOrSave()}
          className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-6 py-2 text-white transition-all hover:bg-[#3d5e46]"
          disabled={isLoading || isFetching || isSaving}
        >
          {isEditing ? (
            <>
              <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <Edit3 size={18} /> Edit About Us
            </>
          )}
        </button>
      </div>

      <div className="min-h-[70vh] rounded-2xl border border-gray-200 bg-white p-10">
        {statusMessage && (
          <p className="mb-6 rounded-md border border-emerald-300 bg-emerald-100/90 px-4 py-3 text-sm text-emerald-800">
            {statusMessage}
          </p>
        )}

        {saveErrorMessage && (
          <p className="mb-6 rounded-md border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-700">
            {saveErrorMessage}
          </p>
        )}

        {isError && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-700">
            <p className="mb-3">
              {getErrorMessage(error as FetchBaseQueryError | SerializedError)}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-md bg-[#4f795a] px-3 py-1.5 text-xs text-white hover:bg-[#3d5e46]"
            >
              Retry
            </button>
          </div>
        )}

        {/* {(isLoading || isFetching) && !isError && (
          <p className="mb-6 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Loading About Us...
          </p>
        )} */}

        {isEditing && (
          <div className="mb-6 flex gap-4 border-b border-gray-100 pb-4 text-gray-400">
            <Bold size={18} />
            <Italic size={18} />
            <AlignLeft size={18} />
            <List size={18} />
            <span className="ml-auto text-xs italic">Editing Mode Enabled</span>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-6 text-gray-700">
            {/* <h2 className="text-xl font-bold">Who We Are</h2> */}
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {currentOverview || "No About Us content found."}
            </p>
            {lastUpdated && (
              <p className="text-xs italic text-gray-500">Last updated: {lastUpdated}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-gray-700">
            <label className="block text-sm font-medium text-gray-700">
              About Us Content
            </label>
            <textarea
              rows={14}
              value={draftOverview}
              onChange={(event) => setDraftOverview(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-800 outline-none transition-all focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a]"
              placeholder="Write About Us content..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
