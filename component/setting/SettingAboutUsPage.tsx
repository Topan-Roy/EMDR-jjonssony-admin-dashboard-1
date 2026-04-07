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

  const editorRef = React.useRef<HTMLDivElement>(null);

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    if (editorRef.current) {
      setDraftOverview(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setDraftOverview(editorRef.current.innerHTML);
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

        {isEditing && (
          <div className="mb-6 flex gap-2 border-b border-gray-100 pb-4">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat("justifyLeft"); }}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
              title="Align Left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyFormat("insertUnorderedList"); }}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
              title="List"
            >
              <List size={18} />
            </button>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-400 self-center">Rich Text Edit Mode</span>
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-6 text-gray-700">
            <div 
              className="prose max-w-none break-words leading-relaxed text-black prose-p:my-2 prose-ul:list-disc prose-li:ml-4"
              dangerouslySetInnerHTML={{ __html: currentOverview || "No About Us content found." }}
            />
            {lastUpdated && (
              <p className="text-xs italic text-gray-500 mt-8">Last updated: {lastUpdated}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-gray-700">
            <label className="block text-sm font-medium text-gray-700">
              About Us Content (Rich Editor)
            </label>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
              }}
              className="min-h-[400px] w-full rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-black outline-none transition-all focus:border-[#4f795a] prose-ul:list-disc focus:ring-1 focus:ring-[#4f795a]"
              dangerouslySetInnerHTML={{ __html: draftOverview }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
