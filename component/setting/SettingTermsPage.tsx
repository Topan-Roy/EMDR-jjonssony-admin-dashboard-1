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

        {(isLoading || isFetching) && !isError && (
          <p className="mb-6 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Loading Terms & Conditions...
          </p>
        )}

        {isEditing && (
          <div className="mb-6 flex gap-4 border-b border-gray-100 pb-4 text-gray-400">
            <Bold size={18} />
            <Italic size={18} />
            <AlignLeft size={18} />
            <List size={18} />
            <span className="ml-auto text-xs italic">Editing Mode Enabled</span>
          </div>
        )}

        {!activeTerms && !isLoading && !isFetching ? (
          <p className="text-sm text-gray-500">No terms policy found.</p>
        ) : !isEditing ? (
          <div className="space-y-6 text-gray-700">
            {lastUpdated && (
              <p className="mb-2 font-bold text-[#4f795a]">Last Updated: {lastUpdated}</p>
            )}

            {currentSections.map((section, index) => (
              <div key={`${section.order}-${section.title}-${index}`}>
                <h3 className="mb-2 text-lg font-bold">
                  {index + 1}. {section.title || `Section ${index + 1}`}
                </h3>
                <p className="mb-4 whitespace-pre-wrap break-words leading-relaxed">
                  {section.content}
                </p>
                {section.bullets.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={`${section.order}-bullet-${bulletIndex}`}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div>
              <h3 className="mb-2 text-lg font-bold">Contact Us</h3>
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {currentContactName || "Legal Team"}
                {currentContactEmail ? ` (${currentContactEmail})` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-gray-700">
            {draftSections.map((section, index) => (
              <div key={`section-edit-${index + 1}`} className="space-y-1.5">
                <input
                  type="text"
                  value={section.title}
                  onChange={(event) =>
                    handleSectionTitleChange(index, event.target.value)
                  }
                  className="w-full appearance-none border-0 bg-transparent p-0 text-lg font-semibold text-gray-700 outline-none ring-0 focus:outline-none focus:ring-0"
                  placeholder={`Section ${index + 1} title`}
                />
                <textarea
                  rows={2}
                  value={section.content}
                  onChange={(event) =>
                    handleSectionContentChange(index, event.target.value)
                  }
                  className="w-full resize-none border-0 bg-transparent p-0 leading-relaxed text-gray-700 outline-none ring-0 focus:outline-none focus:ring-0"
                />
              </div>
            ))}

            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Changelog</h3>
              <textarea
                rows={2}
                value={draftChangelog}
                onChange={(event) => setDraftChangelog(event.target.value)}
                className="w-full resize-none border-0 bg-transparent p-0 leading-relaxed text-gray-700 outline-none ring-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
