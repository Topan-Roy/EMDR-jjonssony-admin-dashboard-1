"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useMemo, useState } from "react";
import { Check, Edit3, Plus, Trash2, X, ChevronDown } from "lucide-react";
import type { SubscriptionPlan } from "../redux/features/subscriptionsApi";
import {
  useGetSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
} from "../redux/features/subscriptionsApi";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  visible: boolean;
  currency: string;
  spots?: number;
  totalSpots?: number;
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

const normalizePeriod = (interval?: string): string => {
  const value = (interval || "").trim().toLowerCase();

  if (!value) {
    return "/month";
  }

  if (value.includes("year")) {
    return "/year";
  }

  if (value.includes("6") && value.includes("month")) {
    return "/6 months";
  }

  if (value.includes("month")) {
    return "/month";
  }

  return "/month";
};

const toIntervalValue = (period: string): string => {
  if (period === "/year") {
    return "yearly";
  }

  if (period === "/6 months") {
    return "6 months";
  }

  return "monthly";
};

const mapApiPlanToUi = (plan: SubscriptionPlan): Plan => ({
  id: plan._id,
  name: plan.name,
  price: String(plan.price ?? 0),
  period: normalizePeriod(plan.interval),
  tagline: plan.tagline || "",
  features: Array.isArray(plan.features) ? plan.features : [],
  visible: Boolean(plan.isActive),
  currency: plan.currency || "\u00A3",
});

const buildPayloadFromPlan = (plan: Plan, isActive: boolean) => {
  const parsedPrice = Number(plan.price);

  return {
    name: plan.name.trim(),
    tagline: plan.tagline.trim(),
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    interval: toIntervalValue(plan.period),
    features: plan.features
      .map((feature) => feature.trim())
      .filter((feature) => feature.length > 0),
    isActive,
  };
};

export default function SubscriptionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [pendingToggleIds, setPendingToggleIds] = useState<string[]>([]);

  const {
    data: subscriptionPlans,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSubscriptionPlansQuery();
  const [updateSubscriptionPlan, { isLoading: isSaving }] =
    useUpdateSubscriptionPlanMutation();

  const plans = useMemo(
    () => (subscriptionPlans ?? []).map((plan) => mapApiPlanToUi(plan)),
    [subscriptionPlans],
  );

  const handleToggleVisibility = async (plan: Plan) => {
    if (pendingToggleIds.includes(plan.id)) {
      return;
    }

    setSaveErrorMessage(null);
    setPendingToggleIds((prev) => [...prev, plan.id]);

    try {
      await updateSubscriptionPlan({
        id: plan.id,
        payload: buildPayloadFromPlan(plan, !plan.visible),
      }).unwrap();
    } catch (saveError) {
      setSaveErrorMessage(
        getErrorMessage(saveError as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setPendingToggleIds((prev) => prev.filter((id) => id !== plan.id));
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setSaveErrorMessage(null);
    setStatusMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (updatedPlan: Plan) => {
    if (!updatedPlan.id) {
      setSaveErrorMessage("Invalid subscription plan.");
      return;
    }

    if (!updatedPlan.name.trim()) {
      setSaveErrorMessage("Plan name is required.");
      return;
    }

    const parsedPrice = Number(updatedPlan.price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setSaveErrorMessage("Plan price must be a valid number.");
      return;
    }

    setStatusMessage(null);
    setSaveErrorMessage(null);

    try {
      await updateSubscriptionPlan({
        id: updatedPlan.id,
        payload: buildPayloadFromPlan(updatedPlan, updatedPlan.visible),
      }).unwrap();

      setStatusMessage(`${updatedPlan.name} updated successfully.`);
      setIsModalOpen(false);
      setSelectedPlan(null);
    } catch (saveError) {
      setSaveErrorMessage(
        getErrorMessage(saveError as FetchBaseQueryError | SerializedError),
      );
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "Georgia, serif" }}>
      <section>
        <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
        <p className="text-sm text-gray-500">
          Manage pricing tiers, features, and availability.
        </p>
      </section>

      {statusMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-100/90 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}

      {saveErrorMessage && (
        <p className="rounded-md border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-700">
          {saveErrorMessage}
        </p>
      )}

      {isError && (
        <div className="rounded-md border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-700">
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

      {isLoading && !isError && (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Loading subscription plans...
        </p>
      )}

      {!isLoading && !isError && plans.length === 0 && (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          No subscription plans found.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex min-h-[550px] flex-col rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex-1">
              <span
                className={`mb-4 inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
                  plan.visible
                    ? "border-[#2db394]/10 bg-[#f4faf7] text-[#2db394]"
                    : "border-gray-200 bg-gray-100 text-gray-500"
                }`}
              >
                {plan.visible ? "Active" : "Inactive"}
              </span>

              <h3 className="mb-2 text-[16px] font-bold text-gray-800">{plan.name}</h3>

              <div className="mb-3 flex items-baseline">
                <span className="text-[32px] font-bold text-gray-800">
                  {plan.currency}
                  {plan.price}
                </span>
                <span className="ml-1 text-[12px] text-gray-400">{plan.period}</span>
              </div>

              <p className="mb-6 text-[14px] italic leading-relaxed text-[#4f795a]">
                {plan.tagline}
              </p>

              {plan.spots !== undefined && (
                <div className="mb-6 rounded-xl border border-gray-50 bg-[#f9f9f9] p-4">
                  <div className="mb-2 flex justify-between text-[12px] font-bold text-gray-400">
                    <span>Available Spots</span>
                    <span>{plan.totalSpots}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-[25%] rounded-full bg-[#4f795a] opacity-80" />
                  </div>
                </div>
              )}

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li
                    key={`${plan.id}-feature-${idx + 1}`}
                    className="flex gap-3 text-[14px] leading-tight text-gray-600"
                  >
                    <Check size={14} className="mt-1 flex-shrink-0 text-[#4f795a]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-bold text-gray-800">Plan Status</p>
                  <p className="text-[14px] text-gray-400">
                    {plan.visible ? "Visible to users" : "Hidden from users"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleToggleVisibility(plan)}
                  disabled={pendingToggleIds.includes(plan.id)}
                  className={`relative h-5 w-10 rounded-full transition-colors duration-300 ${
                    plan.visible ? "bg-[#4f795a]" : "bg-gray-300"
                  } ${
                    pendingToggleIds.includes(plan.id)
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all duration-300 ${
                      plan.visible ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => handleEdit(plan)}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-100 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Edit3 size={16} /> Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          isSaving={isSaving}
          onSave={handleSaveChanges}
          onClose={() => {
            if (!isSaving) {
              setIsModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}

interface EditPlanModalProps {
  plan: Plan;
  isSaving: boolean;
  onSave: (updatedPlan: Plan) => void;
  onClose: () => void;
}

function EditPlanModal({ plan, isSaving, onSave, onClose }: EditPlanModalProps) {
  const [formData, setFormData] = useState<Plan>({ ...plan });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const nextFeatures = [...formData.features];
    nextFeatures[index] = value;

    setFormData((prev) => ({ ...prev, features: nextFeatures }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const handleDeleteFeature = (index: number) => {
    const nextFeatures = formData.features.filter((_, featureIndex) => featureIndex !== index);
    setFormData((prev) => ({ ...prev, features: nextFeatures }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-[580px] flex-col rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-6 top-6 z-10 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <h2 className="mb-8 flex-shrink-0 text-xl font-bold text-gray-800">
          Edit {plan.name}
        </h2>

        <div className="custom-scrollbar space-y-6 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 text-gray-800">
            <div className="space-y-2">
              <label className="text-sm">Plan Name</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm outline-none focus:border-[#4f795a]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Tagline</label>
              <input
                name="tagline"
                type="text"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm outline-none focus:border-[#4f795a]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Plan Price ({formData.currency || "\u00A3"})</label>
              <input
                name="price"
                type="text"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm outline-none focus:border-[#4f795a]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Period</label>
              <div className="relative">
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl border border-gray-100 bg-white p-3 pr-10 text-sm outline-none focus:border-[#4f795a]"
                >
                  <option value="/month">/month</option>
                  <option value="/year">/year</option>
                  <option value="/6 months">/6 months</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-3 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-gray-800">Features</h3>
              <button
                onClick={handleAddFeature}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus size={16} /> Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div
                  key={`feature-${index + 1}`}
                  className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300"
                >
                  <input
                    type="text"
                    value={feature}
                    onChange={(event) => handleFeatureChange(index, event.target.value)}
                    className="flex-1 rounded-xl border border-gray-100 bg-[#f9fbfa] p-3 text-sm text-gray-700 outline-none focus:border-[#4f795a]"
                  />
                  <button
                    onClick={() => handleDeleteFeature(index)}
                    disabled={isSaving}
                    className="p-2 text-red-300 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-50 bg-white pt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl bg-[#e9edf5] py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isSaving}
            className="rounded-xl bg-[#4f795a] py-3 font-bold text-white transition-colors hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save Change"}
          </button>
        </div>
      </div>
    </div>
  );
}
