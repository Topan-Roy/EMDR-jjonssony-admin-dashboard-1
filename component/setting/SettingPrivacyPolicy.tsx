"use client";
import React, { useState } from 'react';
import { ChevronLeft, Edit3, Save, Bold, Italic, List, AlignLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingPrivacyPolicy() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-gray-700 hover:text-black">
          <ChevronLeft size={20} />
          <span className="font-medium">Privacy Policy</span>
        </Link>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 bg-[#4f795a] text-white px-6 py-2 rounded-lg hover:bg-[#3d5e46] transition-all"
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Policy</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-10 min-h-[70vh]">
        {isEditing && (
           <div className="flex gap-4 mb-6 pb-4 border-b border-gray-100 text-gray-400">
             <Bold size={18} /> <Italic size={18} /> <AlignLeft size={18} /> <List size={18} />
             <span className="text-xs italic ml-auto">Editing Mode Enabled</span>
           </div>
        )}

        <div className="text-gray-700 space-y-6" contentEditable={isEditing}>
          <h2 className="text-xl font-bold  ">Privacy Policy Overview</h2>
          <p>At UK INKIND, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
          
          <h3 className="text-lg font-semibold">1. Data We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
          
          <h3 className="text-lg font-semibold">2. How We Use Data</h3>
          <p>Your data is used to provide, maintain, and improve our services, as well as to protect our users and comply with legal obligations.</p>
          
          <h3 className="text-lg font-semibold">3. Third-Party Sharing</h3>
          <p>We do not sell your personal data. We only share information with third parties when necessary to provide our services or required by law.</p>
        </div>
      </div>
    </div>
  );
}