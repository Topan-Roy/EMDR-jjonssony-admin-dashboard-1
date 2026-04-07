"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState } from "react";
import {
  ChevronLeft,
  Edit3,
  Save,
  Bold,
  Italic,
  AlignLeft,
  List,
} from "lucide-react";
import Link from "next/link";
import {
  type TermsSection,
  useGetActiveTermsPolicyQuery,
  useUpdateTermsPolicyMutation,
} from "../redux/features/termsApi";

const defaultSections: TermsSection[] = [
  {
    title: "Introduction",
    content:
      "Welcome to our platform. By using our services, you agree to these terms and conditions.",
    bullets: [],
    order: 1,
  },
  {
    title: "Eligibility",
    content: "You must be at least 18 years old to use this service.",
    bullets: [],
    order: 2,
  },
  {
    title: "User Responsibilities",
    content:
      "You are responsible for maintaining the confidentiality of your account.",
    bullets: [
      "Do not share your password with others.",
      "Notify us immediately of any unauthorized access.",
      "Use the service only for lawful purposes.",
    ],
    order: 3,
  },
  {
    title: "Prohibited Activities",
    content: "The following activities are strictly prohibited on our platform.",
    bullets: ["Attempting to hack or disrupt the service.", "Uploading malicious content."],
    order: 4,
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

const normalizeSectionsForSave = (sections: TermsSection[]): TermsSection[] =>
  sections.map((section, index) => ({
    title: section.title.trim(),
    content: section.content.trim(),
    bullets: Array.isArray(section.bullets)
      ? section.bullets.filter((bullet) => bullet.trim().length > 0)
      : [],
    order: index + 1,
  }));

const formatDate = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SettingTermsAndConditions() {
  const [isEditing, setIsEditing] = useState(false);
  const [draftSections, setDraftSections] = useState<TermsSection[]>([]);
  const [draftContactName, setDraftContactName] = useState("");
  const [draftContactEmail, setDraftContactEmail] = useState("");
  const [draftChangelog, setDraftChangelog] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const {
    data: activeTerms,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetActiveTermsPolicyQuery();
  const [updateTermsPolicy, { isLoading: isSaving }] = useUpdateTermsPolicyMutation();

  const currentSections =
    activeTerms?.sections && activeTerms.sections.length > 0
      ? [...activeTerms.sections].sort((a, b) => a.order - b.order)
      : defaultSections;
  const currentContactName = activeTerms?.contactName || "";
  const currentContactEmail = activeTerms?.contactEmail || "";
  const currentChangelog = activeTerms?.changelog || "";
  const lastUpdated =
    formatDate(activeTerms?.updatedAt) ||
    formatDate(activeTerms?.lastUpdated) ||
    formatDate(activeTerms?.createdAt);

  const handleSectionTitleChange = (index: number, value: string) => {
    setDraftSections((prev) =>
      prev.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, title: value } : section,
      ),
    );
  };

  const handleSectionContentChange = (index: number, value: string) => {
    setDraftSections((prev) =>
      prev.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, content: value } : section,
      ),
    );
  };

  const handleEditOrSave = async () => {
    if (!isEditing) {
      setDraftSections(
        currentSections.map((section, index) => ({
          title: section.title,
          content: section.content,
          bullets: section.bullets ?? [],
          order: section.order || index + 1,
        })),
      );
      setDraftContactName(currentContactName);
      setDraftContactEmail(currentContactEmail);
      setDraftChangelog(currentChangelog);
      setStatusMessage(null);
      setSaveErrorMessage(null);
      setIsEditing(true);
      return;
    }

    if (!activeTerms?._id) {
      setSaveErrorMessage("Terms policy data not found.");
      return;
    }

    const normalizedSections = normalizeSectionsForSave(draftSections);

    if (
      normalizedSections.length === 0 ||
      !normalizedSections.some(
        (section) => section.title.length > 0 || section.content.length > 0,
      )
    ) {
      setSaveErrorMessage("At least one section is required.");
      return;
    }

    setStatusMessage(null);
    setSaveErrorMessage(null);

    try {
      await updateTermsPolicy({
        id: activeTerms._id,
        payload: {
          sections: normalizedSections,
          contactName: draftContactName.trim(),
          contactEmail: draftContactEmail.trim(),
          changelog: draftChangelog.trim(),
        },
      }).unwrap();

      setStatusMessage("Terms & Conditions updated successfully.");
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
          <span className="font-medium">Terms & Conditions</span>
        </Link>

        <button
          onClick={() => void handleEditOrSave()}
          disabled={isLoading || isFetching || isSaving || (!activeTerms && !isEditing)}
          className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-6 py-2 text-white shadow-sm transition-all hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isEditing ? (
            <>
              <Save size={18} /> {isSaving ? "Updating..." : "Update"}
            </>
          ) : (
            <>
              <Edit3 size={18} /> Edit
            </>
          )}
        </button>
      </div>

      <div className="min-h-[70vh] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
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

        {!activeTerms && !isLoading && !isFetching ? (
          <p className="text-sm text-gray-500">No terms policy found.</p>
        ) : !isEditing ? (
          <div className="space-y-6 text-gray-700">
            {lastUpdated && (
              <p className="mb-2 font-bold text-[#4f795a] border-b pb-1">Last Updated: {lastUpdated}</p>
            )}

            {currentSections.map((section, index) => (
              <div key={`${section.order}-${section.title}-${index}`} className="pt-4">
                <h3 className="mb-3 text-lg font-bold text-black flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[14px] text-orange-600 border border-orange-100">{index + 1}</span>
                  {section.title || `Section ${index + 1}`}
                </h3>
                <div 
                  className="prose max-w-none break-words leading-relaxed text-black prose-p:my-2 prose-ul:list-disc prose-li:ml-4"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}

            <div className="mt-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="mb-2 text-lg font-bold text-black italic">Contact Us</h3>
              <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-600">
                {currentContactName || "Legal Team"} 
                {currentContactEmail ? <span className="block text-[#4f795a] font-medium">{currentContactEmail}</span> : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-black">
            {draftSections.map((section, index) => (
              <div key={`section-edit-${index + 1}`} className="space-y-4 rounded-3xl border border-gray-100 p-6 bg-[#fcfcfc] shadow-sm">
                 <div className="flex items-center gap-4 border-b border-gray-50 pb-2">
                    <span className="text-xl font-black text-gray-200">{index + 1}</span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(event) =>
                        handleSectionTitleChange(index, event.target.value)
                      }
                      className="w-full bg-transparent text-lg font-bold text-black outline-none placeholder:text-gray-300"
                      placeholder={`Section ${index + 1} Title`}
                    />
                 </div>
                
                <div
                  contentEditable
                  onInput={(e) => handleSectionContentChange(index, e.currentTarget.innerHTML)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                  }}
                  className="min-h-[150px] w-full rounded-xl bg-white p-5 leading-relaxed text-black outline-none border border-gray-50 focus:border-[#4f795a] prose-ul:list-disc transition-all"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}

            <div className="space-y-4 pt-4 border-t border-gray-100">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Person</label>
                    <input 
                      type="text"
                      value={draftContactName}
                      onChange={(e) => setDraftContactName(e.target.value)}
                      className="w-full rounded-xl border border-gray-100 bg-white p-4 text-sm outline-none focus:border-[#4f795a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Email</label>
                    <input 
                       type="text"
                       value={draftContactEmail}
                       onChange={(e) => setDraftContactEmail(e.target.value)}
                       className="w-full rounded-xl border border-gray-100 bg-white p-4 text-sm outline-none focus:border-[#4f795a]"
                    />
                  </div>
               </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#4f795a]">Changelog</h3>
                <div
                  contentEditable
                  onInput={(e) => setDraftChangelog(e.currentTarget.innerHTML)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                  }}
                  className="min-h-[100px] w-full rounded-xl border border-gray-100 bg-[#fefefe] p-5 text-sm italic text-gray-700 outline-none focus:border-[#4f795a] transition-all"
                  dangerouslySetInnerHTML={{ __html: draftChangelog }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
