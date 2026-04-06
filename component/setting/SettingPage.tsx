"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const settingsOptions = [
  { title: "Edit Personal Information", href: "/dashboard/settings/profile" },
  { title: "Change Password", href: "/dashboard/settings/change-password" },
  { title: "Terms & Conditions", href: "/dashboard/settings/terms" },
  { title: "Privacy Policy", href: "/dashboard/settings/privacy-policy" },
  { title: "FAQ", href: "/dashboard/settings/faq" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl   text-gray-800 font-semibold">System Settings</h1>
        <p className="text-gray-500 text-sm italic">Manage your account, platform features, and system configuration</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {settingsOptions.map((item, index) => (
          <Link 
            key={item.title} 
            href={item.href}
            className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
              index !== settingsOptions.length - 1 ? "border-bottom border-gray-100 border-b" : ""
            }`}
          >
            <span className="text-gray-700 font-medium">{item.title}</span>
            <ChevronRight className="text-gray-400" size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
}