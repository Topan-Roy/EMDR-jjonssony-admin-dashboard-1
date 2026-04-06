"use client";

import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SettingChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-[80vh] w-full flex flex-col relative overflow-hidden">
      
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
            <h2 className="text-3xl   font-bold text-gray-800">Change Password</h2>
            <p className="text-gray-500 text-sm mt-2">Please create a secure password.</p>
          </div>
          
          <form className="space-y-8"> 
            
            {/* Current Password */}
            <div className="relative w-full">
              
              <label className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-gray-500 z-10">
                Current Password
              </label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"} 
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
                  type={showNew ? "text" : "password"} 
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
                  type={showConfirm ? "text" : "password"} 
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

            <button className="w-full bg-[#4f795a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3d5e46] hover:shadow-lg transition-all mt-6">
              Confirm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}