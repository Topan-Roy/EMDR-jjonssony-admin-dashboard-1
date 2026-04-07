"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState } from "react";
import { ChevronLeft, Edit3, Save, Bold, Italic, List, AlignLeft } from "lucide-react";
import Link from "next/link";
import {
  type PrivacySection,
  useGetActivePrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "../redux/features/privacyApi";

const defaultSections: PrivacySection[] = [
  {
    title: "Data We Collect",
    content:
      "We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.",
    bullets: [],
    order: 1,
  },
  {
    title: "How We Use Data",
    content:
      "Your data is used to provide, maintain, and improve our services, as well as to protect our users and comply with legal obligations.",
    bullets: [],
    order: 2,
  },
  {
    title: "Third-Party Sharing",
    content:
      "We do not sell your personal data. We only share information with third parties when necessary to provide our services or required by law.",
    bullets: [],
    order: 3,
  },
];

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

const normalizeSectionsForSave = (sections: PrivacySection[]): PrivacySection[] =>
  sections.map((section, index) => ({
    title: section.title.trim(),
    content: section.content.trim(),
    bullets: Array.isArray(section.bullets)
      ? section.bullets.filter((bullet) => bullet.trim().length > 0)
      : [],
    order: index + 1,
  }));

export default function SettingPrivacyPolicy() {
  const [isEditing, setIsEditing] = useState(false);
  const [draftOverview, setDraftOverview] = useState("");
  const [draftChangelog, setDraftChangelog] = useState("");
  const [draftSections, setDraftSections] = useState<PrivacySection[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const {
    data: activePolicy,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActivePrivacyPolicyQuery();
  const [updatePrivacyPolicy, { isLoading: isSaving }] =
    useUpdatePrivacyPolicyMutation();
  const currentSections =
    activePolicy?.sections && activePolicy.sections.length > 0
      ? [...activePolicy.sections].sort((a, b) => a.order - b.order)
      : defaultSections;
  const currentOverview = activePolicy?.overview || "";
  const currentChangelog = activePolicy?.changelog || "";

  const handleDraftSectionContentChange = (index: number, value: string) => {
    setDraftSections((prev) =>
      prev.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, content: value } : section,
      ),
    );
  };

  const handleDraftSectionTitleChange = (index: number, value: string) => {
    setDraftSections((prev) =>
      prev.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, title: value } : section,
      ),
    );
  };

  const handleEditOrSave = async () => {
    if (!isEditing) {
      setDraftOverview(currentOverview);
      setDraftChangelog(currentChangelog);
      setDraftSections(
        currentSections.map((section, index) => ({
          title: section.title,
          content: section.content,
          bullets: section.bullets ?? [],
          order: section.order || index + 1,
        })),
      );
      setStatusMessage(null);
      setSaveErrorMessage(null);
      setIsEditing(true);
      return;
    }

    if (!activePolicy?._id) {
      setSaveErrorMessage("Privacy policy data not found.");
      return;
    }

    const nextOverview = draftOverview.trim();

    if (!nextOverview) {
      setSaveErrorMessage("Privacy policy overview is required.");
      return;
    }

    setStatusMessage(null);
    setSaveErrorMessage(null);

    try {
      await updatePrivacyPolicy({
        id: activePolicy._id,
        payload: {
          overview: nextOverview,
          changelog: draftChangelog.trim(),
          sections: normalizeSectionsForSave(draftSections),
        },
      }).unwrap();
      setStatusMessage("Privacy policy updated successfully.");
      setIsEditing(false);
    } catch (saveError) {
      setSaveErrorMessage(
        getErrorMessage(saveError as FetchBaseQueryError | SerializedError),
      );
    }
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Privacy Policy</span>
        </Link>

        <button
          onClick={() => void handleEditOrSave()}
          disabled={isLoading || isFetching || isSaving || (!activePolicy && !isEditing)}
          className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-6 py-2 text-white transition-all hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isEditing ? (
            <>
              <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <Edit3 size={18} /> Edit Policy
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

        {!activePolicy && !isLoading && !isFetching ? (
          <p className="text-sm text-gray-500">No privacy policy found.</p>
        ) : !isEditing ? (
          <div className="space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-black border-b pb-2">Privacy Policy Overview</h2>
            <div 
              className="prose max-w-none break-words leading-relaxed text-black prose-p:my-2 prose-ul:list-disc prose-li:ml-4"
              dangerouslySetInnerHTML={{ __html: currentOverview || "No overview found." }}
            />

            {currentSections.map((section, index) => (
              <div key={`${section.order}-${section.title}-${index}`} className="pt-4">
                <h3 className="mb-2 text-lg font-bold text-black underline decoration-orange-200">
                  {index + 1}. {section.title || `Section ${index + 1}`}
                </h3>
                <div 
                  className="prose max-w-none break-words leading-relaxed text-black prose-p:my-2 prose-ul:list-disc prose-li:ml-4"
                  dangerouslySetInnerHTML={{ __html: section.content || "No content." }}
                />
              </div>
            ))}

            {currentChangelog && (
              <div className="mt-10 border-t border-dashed pt-6">
                <h3 className="mb-2 text-lg font-bold text-[#4f795a]">Changelog</h3>
                <div 
                  className="prose max-w-none break-words leading-relaxed text-gray-600 italic border-l-4 border-[#4f795a] pl-4"
                  dangerouslySetInnerHTML={{ __html: currentChangelog }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 text-black">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#4f795a]">Privacy Policy Overview</h2>
              <div
                contentEditable
                onInput={(e) => setDraftOverview(e.currentTarget.innerHTML)}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
                className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-[#fefefe] p-4 text-base leading-relaxed text-black outline-none focus:border-[#4f795a]"
                dangerouslySetInnerHTML={{ __html: draftOverview }}
              />
            </div>

            {draftSections.map((section, index) => (
              <div key={`section-edit-${index + 1}`} className="space-y-3 rounded-2xl border border-gray-100 p-5 bg-[#fafafa]">
                 <input
                  type="text"
                  value={section.title}
                  onChange={(event) =>
                    handleDraftSectionTitleChange(index, event.target.value)
                  }
                  className="w-full border-b border-gray-200 bg-transparent py-2 text-lg font-bold text-black outline-none focus:border-[#4f795a]"
                  placeholder={`Section ${index + 1} Title`}
                />
                <div
                  contentEditable
                  onInput={(e) => handleDraftSectionContentChange(index, e.currentTarget.innerHTML)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                  }}
                  className="min-h-[120px] w-full rounded-lg bg-white p-4 leading-relaxed text-black outline-none border border-gray-50 focus:border-[#4f795a] prose-ul:list-disc"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-[#4f795a]">Changelog</h3>
              <div
                contentEditable
                onInput={(e) => setDraftChangelog(e.currentTarget.innerHTML)}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
                className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-[#fefefe] p-4 text-sm italic text-gray-700 outline-none focus:border-[#4f795a]"
                dangerouslySetInnerHTML={{ __html: draftChangelog }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
