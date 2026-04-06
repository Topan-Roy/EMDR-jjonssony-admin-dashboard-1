"use client";

import React, { useState } from "react";
import { ChevronLeft, Edit3, Save, Bold, Italic, List, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function SettingAboutUsPage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">About Us</span>
        </Link>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-lg bg-[#4f795a] px-6 py-2 text-white transition-all hover:bg-[#3d5e46]"
        >
          {isEditing ? (
            <>
              <Save size={18} /> Save Changes
            </>
          ) : (
            <>
              <Edit3 size={18} /> Edit About Us
            </>
          )}
        </button>
      </div>

      <div className="min-h-[70vh] rounded-2xl border border-gray-200 bg-white p-10">
        {isEditing && (
          <div className="mb-6 flex gap-4 border-b border-gray-100 pb-4 text-gray-400">
            <Bold size={18} />
            <Italic size={18} />
            <AlignLeft size={18} />
            <List size={18} />
            <span className="ml-auto text-xs italic">Editing Mode Enabled</span>
          </div>
        )}

        <div
          className="space-y-6 text-gray-700"
          contentEditable={isEditing}
          suppressContentEditableWarning
        >
          <h2 className="text-xl font-bold">Who We Are</h2>
          <p>
            UK INKIND is a platform focused on building meaningful social impact through
            transparent partnerships, collaborative initiatives, and community-led support.
          </p>

          <h3 className="text-lg font-semibold">Our Mission</h3>
          <p>
            Our mission is to connect people, organizations, and opportunities in a way
            that creates measurable value for communities and encourages long-term change.
          </p>

          <h3 className="text-lg font-semibold">What We Value</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Accountability in every project and partnership.</li>
            <li>Inclusive collaboration across teams and stakeholders.</li>
            <li>Simple and reliable systems for better decision making.</li>
          </ul>

          <h3 className="text-lg font-semibold">Contact</h3>
          <p>
            For partnership inquiries or questions, please reach us at{" "}
            <strong>support@ukinkind.org</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
