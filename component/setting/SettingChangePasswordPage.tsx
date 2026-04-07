"use client";

import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useChangePasswordMutation } from '@/component/redux/features/adminProfileApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

const getErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return "Request failed. Please try again.";
  if ("data" in error) {
    const data = error.data as any;
    return data?.error?.message || data?.message || "Something went wrong.";
  }
  return (error as SerializedError).message || "Something went wrong.";
};

export default function SettingChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user types
    if (errorMessage) setErrorMessage(null);
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    // Basic validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
      await changePassword(formData).unwrap();
      setStatusMessage("Password changed successfully.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMessage(getErrorMessage(err as any));
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex flex-col relative overflow-hidden" style={{ fontFamily: "Georgia, serif" }}>
      
      {/* Back Button */}
      <div className="z-20 mb-6">
        <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Settings</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100 w-full max-w-[500px]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Change Password</h2>
            <p className="text-gray-500 text-sm mt-2">Please create a secure password.</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}> 
            
            {/* Status Messages */}
            {statusMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                {statusMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Current Password */}
            <div className="relative w-full">
              <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-500 z-10">
                Current Password
              </label>
              <div className="relative">
                <input 
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"} 
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="********" 
                  className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a] transition-all bg-transparent" 
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  {showCurrent ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            
            {/* New Password */}
            <div className="relative w-full">
              <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-500 z-10">
                New Password
              </label>
              <div className="relative">
                <input 
                  name="newPassword"
                  type={showNew ? "text" : "password"} 
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="********" 
                  className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a] transition-all bg-transparent" 
                />
                <button 
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative w-full">
              <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-500 z-10">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"} 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="********" 
                  className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#4f795a] focus:ring-1 focus:ring-[#4f795a] transition-all bg-transparent" 
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                >
                  {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#4f795a] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3d5e46] hover:shadow-lg transition-all mt-6"
            >
              {isLoading ? "Updating..." : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}