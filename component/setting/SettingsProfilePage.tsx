"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChevronDown, ChevronLeft, Edit3, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { getStoredTokens } from "../redux/authStorage";
import { useGetAdminProfileQuery, useUpdateAdminProfileMutation } from "../redux/features/adminProfileApi";
import { useAppSelector } from "../redux/hooks";

const fallbackProfileImage = "/image/setting-profile.png";

/* Country list (flag image + code only) */
const countries = [
  { iso: "us", code: "+1" },
  { iso: "bd", code: "+880" },
  { iso: "in", code: "+91" },
  { iso: "gb", code: "+44" },
  { iso: "au", code: "+61" },
] as const;

type Country = (typeof countries)[number];

const fallbackCountry: Country = countries[0];

const formatRole = (role: string): string => {
  if (!role) {
    return "Admin";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const splitPhoneNumber = (
  rawPhoneNumber: string,
): { country: Country; localNumber: string } => {
  const phoneNumber = rawPhoneNumber.replace(/\s+/g, "");
  const sortedCountries = [...countries].sort(
    (a, b) => b.code.length - a.code.length,
  );
  const matchedCountry = sortedCountries.find((country) =>
    phoneNumber.startsWith(country.code),
  );

  if (!matchedCountry) {
    const normalizedLocal = phoneNumber.startsWith("+")
      ? phoneNumber.slice(1)
      : phoneNumber;
    return { country: fallbackCountry, localNumber: normalizedLocal };
  }

  return {
    country: matchedCountry,
    localNumber: phoneNumber.slice(matchedCountry.code.length),
  };
};

const makeFullPhoneNumber = (
  countryCode: string,
  localNumber: string,
): string => `${countryCode}${localNumber.replace(/\s+/g, "")}`;

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

const getString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export default function SettingProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftCountry, setDraftCountry] = useState<Country>(fallbackCountry);
  const [draftProfilePic, setDraftProfilePic] =
    useState<string>(fallbackProfileImage);
  const [draftProfilePicFile, setDraftProfilePicFile] = useState<File | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const authUser = useAppSelector((state) => state.auth.user);
  const authToken = useAppSelector((state) => state.auth.token);
  const hasAuthToken =
    Boolean(authToken) ||
    (typeof window !== "undefined" && Boolean(getStoredTokens().token));

  const {
    data: adminProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch,
  } = useGetAdminProfileQuery(undefined, { skip: !hasAuthToken });

  const [updateAdminProfile, { isLoading: isSaving }] =
    useUpdateAdminProfileMutation();

  const authUserRecord =
    authUser && typeof authUser === "object"
      ? (authUser as Record<string, unknown>)
      : null;
  const fallbackName = [
    getString(authUserRecord?.firstName),
    getString(authUserRecord?.lastName),
  ]
    .filter(Boolean)
    .join(" ");
  const fallbackEmail = getString(authUserRecord?.email);
  const fallbackRole = getString(authUserRecord?.role);
  const fallbackUserProfilePic = getString(authUserRecord?.profilePic);

  const effectiveProfile = {
    name: adminProfile?.name || fallbackName || "Admin",
    email: adminProfile?.email || fallbackEmail,
    phoneNumber: adminProfile?.phoneNumber || "",
    profilePic: adminProfile?.profilePic || fallbackUserProfilePic || fallbackProfileImage,
    role: adminProfile?.role || fallbackRole || "admin",
  };

  const profilePhone = splitPhoneNumber(effectiveProfile.phoneNumber);
  const displayName = isEditing ? draftName : effectiveProfile.name;
  const displayEmail = effectiveProfile.email;
  const displayRole = effectiveProfile.role;
  const displayCountry = isEditing ? draftCountry : profilePhone.country;
  const displayPhone = isEditing ? draftPhone : profilePhone.localNumber;
  const displayProfilePic = isEditing
    ? draftProfilePic || fallbackProfileImage
    : effectiveProfile.profilePic || fallbackProfileImage;
  const isPrimaryActionDisabled =
    isSaving || isImageProcessing || (!isEditing && !adminProfile);

  const handleEditOrSave = async () => {
    if (!isEditing) {
      const parsedPhone = splitPhoneNumber(effectiveProfile.phoneNumber || "");

      setDraftName(effectiveProfile.name || "");
      setDraftPhone(parsedPhone.localNumber);
      setDraftCountry(parsedPhone.country);
      setDraftProfilePic(effectiveProfile.profilePic || fallbackProfileImage);
      setDraftProfilePicFile(null);
      setStatusMessage(null);
      setErrorMessage(null);
      setIsOpen(false);
      setIsEditing(true);
      return;
    }

    if (!draftName.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    if (!draftPhone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await updateAdminProfile({
        name: draftName.trim(),
        phoneNumber: makeFullPhoneNumber(draftCountry.code, draftPhone),
        profilePic: effectiveProfile.profilePic || "",
        profilePicFile: draftProfilePicFile,
      }).unwrap();

      setIsOpen(false);
      setIsEditing(false);
      setDraftProfilePicFile(null);
      setStatusMessage("Profile updated successfully.");
      void refetch();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  };

  const handleProfileImageFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      setErrorMessage("Image size must be under 2MB.");
      event.target.value = "";
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);
    setIsImageProcessing(true);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftProfilePic(reader.result);
        setDraftProfilePicFile(file);
        setStatusMessage("Image selected. Click Save Change to upload.");
      } else {
        setErrorMessage("Could not read selected image.");
      }

      setIsImageProcessing(false);
      event.target.value = "";
    };

    reader.onerror = () => {
      setIsImageProcessing(false);
      setErrorMessage("Could not read selected image.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl ">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Personal Information</span>
        </Link>

        <button
          type="button"
          onClick={() => void handleEditOrSave()}
          disabled={isPrimaryActionDisabled}
          className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-6 py-2 text-white transition-all hover:bg-[#3d5e46] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isEditing ? (
            <>
              <Save size={18} /> {isSaving ? "Saving..." : "Save Change"}
            </>
          ) : (
            <>
              <Edit3 size={18} /> Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Profile Card */}
        <div className="h-fit w-1/3 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative mb-4 h-32 w-32">
              <Image
                src={displayProfilePic}
                alt="Profile"
                fill
                sizes="128px"
                className="rounded-full border-4 border-white object-cover shadow-md"
              />
            </div>
            <p className="mb-1 text-sm text-gray-400">Profile</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {formatRole(displayRole)}
            </h2>

            {isEditing && (
              <div className="mt-4 w-full space-y-2">
                <label className="block text-center text-xs text-gray-500">
                  Change Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageFileChange}
                  className="w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700"
                />
                <p className="text-center text-[11px] text-gray-400">
                  Max file size: 2MB. Select image and save.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-6">
          {isProfileLoading && !adminProfile && (
            <p className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              Loading profile...
            </p>
          )}

          {isProfileError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <p className="mb-2">
                {getErrorMessage(
                  profileError as FetchBaseQueryError | SerializedError,
                )}
              </p>
              {"status" in (profileError as FetchBaseQueryError) &&
                (profileError as FetchBaseQueryError).status === 500 && (
                  <p className="mb-2 text-xs text-red-700/80">
                    Server returned 500 for `/api/admin/profile`. Showing fallback data.
                  </p>
                )}
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-md bg-[#4f795a] px-3 py-1.5 text-xs text-white hover:bg-[#3d5e46]"
              >
                Retry
              </button>
            </div>
          )}

          {statusMessage && (
            <p className="rounded-md border border-emerald-300 bg-emerald-100/90 px-3 py-2 text-sm text-emerald-800">
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <p className="rounded-md border border-red-300 bg-red-100/90 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm text-gray-800">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDraftName(event.target.value)}
              disabled={!isEditing}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-800 focus:ring-2 focus:ring-[#4f795a] disabled:bg-gray-50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={displayEmail}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-800 focus:ring-2 focus:ring-[#4f795a] disabled:bg-gray-50"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm text-gray-800">
              Phone Number
            </label>

            <div className="flex gap-2">
              {/* Country Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="flex min-w-[90px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-gray-800 disabled:bg-gray-50"
                >
                  <Image
                    src={`https://flagcdn.com/w20/${displayCountry.iso}.png`}
                    alt="flag"
                    width={20}
                    height={15}
                    style={{ width: "auto", height: "auto" }}
                  />
                  <span className="text-sm">{displayCountry.code}</span>
                  <ChevronDown size={14} />
                </button>

                {/* Dropdown list */}
                {isOpen && isEditing && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-md">
                    {countries.map((country) => (
                      <div
                        key={country.iso}
                        onClick={() => {
                          setDraftCountry(country);
                          setIsOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100"
                      >
                        <Image
                          src={`https://flagcdn.com/w20/${country.iso}.png`}
                          alt="flag"
                          width={20}
                          height={15}
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="text-sm text-gray-800">
                          {country.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone input */}
              <input
                type="text"
                value={displayPhone}
                onChange={(event) => setDraftPhone(event.target.value)}
                disabled={!isEditing}
                className="flex-1 rounded-lg border border-gray-200 bg-white p-3 text-gray-800 focus:ring-2 focus:ring-[#4f795a] disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
