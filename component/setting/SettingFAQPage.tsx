"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChevronLeft, Plus, Edit2, Trash2, X, Save } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetAdminFaqsQuery,
  useUpdateFaqMutation,
} from "../redux/features/faqApi";

interface FaqItem {
  id: string;
  displayId: number;
  question: string;
  answer: string;
}

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

export default function SettingFAQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FaqItem | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: faqResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAdminFaqsQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const faqs: FaqItem[] = useMemo(() => {
    const source = faqResponse ?? [];

    return [...source]
      .sort((a, b) => (a.order ?? a.displayId ?? 0) - (b.order ?? b.displayId ?? 0))
      .map((faq, index) => ({
        id: faq._id,
        displayId: faq.displayId ?? faq.order ?? index + 1,
        question: faq.question,
        answer: faq.answer,
      }));
  }, [faqResponse]);

  const isSaving = isCreating || isUpdating;

  const handleOpenAdd = () => {
    setCurrentFaq(null);
    setFormData({ question: "", answer: "" });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setCurrentFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    setStatusMessage(null);

    try {
      const response = await deleteFaq(id).unwrap();
      setStatusMessage(response.message || "FAQ deleted successfully.");
    } catch (deleteError) {
      setStatusMessage(
        getErrorMessage(deleteError as FetchBaseQueryError | SerializedError),
      );
    }
  };

  const handleSave = async () => {
    const question = formData.question.trim();
    const answer = formData.answer.trim();

    if (!question || !answer) {
      setFormError("Please fill in both fields.");
      return;
    }

    setFormError(null);
    setStatusMessage(null);

    try {
      if (currentFaq) {
        await updateFaq({
          id: currentFaq.id,
          question,
          answer,
        }).unwrap();
        setStatusMessage("FAQ updated successfully.");
      } else {
        await createFaq({
          question,
          answer,
        }).unwrap();
        setStatusMessage("FAQ created successfully.");
      }

      setIsModalOpen(false);
      setCurrentFaq(null);
      setFormData({ question: "", answer: "" });
    } catch (saveError) {
      setFormError(
        getErrorMessage(saveError as FetchBaseQueryError | SerializedError),
      );
    }
  };

  return (
    <div className="max-w-6xl ">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-gray-700 transition-colors hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Update FAQ</span>
        </Link>

        <button
          onClick={handleOpenAdd}
          disabled={isSaving || isDeleting}
          className="flex items-center gap-2 rounded-xl bg-[#4f795a] px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      {statusMessage && (
        <p className="mb-4 rounded-md border border-emerald-300 bg-emerald-100/90 px-3 py-2 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}

      {isError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-700">
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

      {/* Table Section */}
      <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-[#f8faf9]">
            <tr>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500  ">
                ID
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500  ">
                Questions
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500  ">
                Answer
              </th>
              <th className="p-5 text-center text-xs font-bold uppercase tracking-wider text-gray-500  ">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Loading FAQs...
                </td>
              </tr>
            ) : faqs.length > 0 ? (
              faqs.map((faq) => (
                <tr key={faq.id} className="transition-colors hover:bg-gray-50">
                  <td className="p-5 text-sm text-gray-400  ">#{faq.displayId}</td>
                  <td className="p-5 text-sm font-medium text-gray-800  ">
                    {faq.question}
                  </td>
                  <td className="max-w-md p-5 text-sm leading-relaxed text-gray-500   ">
                    {faq.answer}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleOpenEdit(faq)}
                        className="rounded-lg p-2 text-gray-400 transition-all hover:bg-[#4f795a]/10 hover:text-[#4f795a]"
                        title="Edit"
                        disabled={isSaving || isDeleting}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => void handleDelete(faq.id)}
                        className="rounded-lg p-2 text-red-300 transition-all hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                        disabled={isDeleting || isSaving}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  No FAQs found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in duration-200 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800   ">
                {currentFaq ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 p-6">
              {formError && (
                <p className="rounded-md border border-red-300 bg-red-100/90 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700  ">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(event) =>
                    setFormData({ ...formData, question: event.target.value })
                  }
                  placeholder="e.g. How do I change my email?"
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none transition-all focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700  ">
                  Answer
                </label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={(event) =>
                    setFormData({ ...formData, answer: event.target.value })
                  }
                  placeholder="Write the answer here..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none transition-all focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-[#4f795a] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
