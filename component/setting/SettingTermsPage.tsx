"use client";
import React, { useState } from 'react';
import { ChevronLeft, Edit3, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link as LinkIcon, Image as ImageIcon, Type } from 'lucide-react';
import Link from 'next/link';

export default function SettingTermsAndConditions() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-gray-700 hover:text-black">
          <ChevronLeft size={20} />
          <span className="font-medium">Terms & Conditions</span>
        </Link>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 bg-[#4f795a] text-white px-6 py-2 rounded-lg hover:bg-[#3d5e46] transition-all shadow-sm"
        >
          {isEditing ? <><Save size={18} /> Update</> : <><Edit3 size={18} /> Edit</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 min-h-[70vh]">
        {/* Editor Toolbar (Only visible when editing) */}
        {isEditing && (
          <div className="flex items-center flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1 border-r pr-4">
              <select className="bg-transparent text-sm font-medium focus:outline-none">
                <option>16</option><option>18</option><option>20</option>
              </select>
              <Type size={16} className="text-gray-400" />
            </div>
            <div className="flex gap-3 border-r pr-4 text-gray-500">
              <button className="hover:text-black"><Bold size={18} /></button>
              <button className="hover:text-black"><Italic size={18} /></button>
              <button className="hover:text-black"><Underline size={18} /></button>
            </div>
            <div className="flex gap-3 border-r pr-4 text-gray-500">
              <button className="hover:text-black"><AlignLeft size={18} /></button>
              <button className="hover:text-black"><AlignCenter size={18} /></button>
              <button className="hover:text-black"><AlignRight size={18} /></button>
            </div>
            <div className="flex gap-3 text-gray-500">
              <button className="hover:text-black"><List size={18} /></button>
              <button className="hover:text-black"><ImageIcon size={18} /></button>
              <button className="hover:text-black"><LinkIcon size={18} /></button>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className={`prose prose-sm max-w-none text-gray-700 ${isEditing ? 'outline-none' : ''}`} contentEditable={isEditing}>
          {!isEditing && <p className="text-[#4f795a]   font-bold mb-6">Last Updated: October 2025</p>}
          
          <h3 className="text-lg font-bold mb-2">1. Introduction</h3>
          <p className="mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>

          <h3 className="text-lg font-bold mb-2">2. Eligibility</h3>
          <p className="mb-6">Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.</p>

          <h3 className="text-lg font-bold mb-2">3. User Responsibilities</h3>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</li>
            <li>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</li>
          </ul>

          <h3 className="text-lg font-bold mb-2">4. Prohibited Activities</h3>
          <p className="mb-6">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>

          <h3 className="text-lg font-bold mb-2">Contact Us</h3>
          <p>If you have any questions regarding these Terms & Conditions, please contact us at: <strong>LoremIpsum@example.com</strong></p>
        </div>
      </div>
    </div>
  );
}