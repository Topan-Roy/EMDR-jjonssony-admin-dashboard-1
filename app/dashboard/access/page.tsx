"use client";

import React, { useState } from 'react';
import { ChevronLeft, Eye, X } from 'lucide-react';
import Link from 'next/link';

// --- Types ---
type Status = 'Pending' | 'Approved' | 'Cancelled';

interface UserRequest {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: Status;
  assessment: {
    phq9: { level: string; score: string };
    gad7: { level: string; score: string };
    des2: { score: string };
  };
}

// --- Mock Data ---
const initialUsers: UserRequest[] = [
  {
    id: "User-213",
    name: "Leslie Alexander",
    email: "user1@example.com",
    joinedDate: "Nov 13, 2025",
    status: "Pending",
    assessment: {
      phq9: { level: "Minimal", score: "0/27" },
      gad7: { level: "Minimal", score: "0/21" },
      des2: { score: "0.0%" },
    }
  },
  {
    id: "User-214",
    name: "Ronald Richards",
    email: "ronald@example.com",
    joinedDate: "Nov 14, 2025",
    status: "Approved",
    assessment: {
      phq9: { level: "Moderate", score: "12/27" },
      gad7: { level: "Severe", score: "16/21" },
      des2: { score: "15.0%" },
    }
  },
  {
    id: "User-215",
    name: "Jane Cooper",
    email: "jane@example.com",
    joinedDate: "Nov 15, 2025",
    status: "Cancelled",
    assessment: {
      phq9: { level: "None", score: "0/27" },
      gad7: { level: "None", score: "0/21" },
      des2: { score: "0.0%" },
    }
  },
  {
    id: "User-216",
    name: "Robert Fox",
    email: "robert@example.com",
    joinedDate: "Nov 16, 2025",
    status: "Pending",
    assessment: {
      phq9: { level: "Minimal", score: "3/27" },
      gad7: { level: "Mild", score: "6/21" },
      des2: { score: "2.5%" },
    }
  },
];

export default function AccessPage() {
  const [users, setUsers] = useState<UserRequest[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null);

  // Handle Status Update
  const handleStatusChange = (userId: string, newStatus: Status) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setSelectedUser(null); // Close modal
  };

  return (
    <div className="min-h-screen   md:p-8   text-gray-800">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 text-gray-700">
        <Link href="/dashboard" className="hover:opacity-70 flex items-center gap-2">
          <ChevronLeft size={20} />
          <span className="text-lg font-medium">Access</span>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Table Container for Responsiveness */}
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-8 py-6 border-b border-gray-100 bg-[#fbfbfb] min-w-[600px]">
            <div className="col-span-5 text-sm font-bold text-gray-500 uppercase tracking-wider">User Name</div>
            <div className="col-span-5 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</div>
            <div className="col-span-2 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50 min-w-[600px]">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 px-8 py-6 items-center transition-colors hover:bg-gray-50 ${user.status === 'Approved' ? 'bg-[#f4faf7]/50' : ''}`}
              >
                <div className="col-span-5 font-medium text-gray-700">{user.name}</div>
                <div className="col-span-5">
                  <span className={`text-sm font-medium ${
                    user.status === 'Approved' ? 'text-[#4f795a]' : 
                    user.status === 'Cancelled' ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {user.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="w-8 h-8 rounded-full bg-[#4f795a] text-white flex items-center justify-center hover:bg-[#3d5e46] transition-all shadow-sm"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- NEW UPDATED MODAL (IMAGE DESIGN) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4  ">
          {/* Modal Card */}
          <div className="bg-white w-full max-w-[600px] flex flex-col rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-50 z-10">
              <h2 className="text-xl font-bold text-gray-700">User Details</h2>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content with Cream Background */}
            <div className="overflow-y-auto bg-[#FFF9F2] p-6 space-y-8">
              
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">User ID</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Email</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Joined Date</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.joinedDate}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1 font-medium">Status</p>
                  <p className="text-gray-800 text-[15px]">{selectedUser.status}</p>
                </div>
              </div>

              {/* Assessment Results Section */}
              <div className="bg-[#FFF9F2] rounded-xl border border-[#F5EAD9] p-5">
                <h3 className="text-xl text-[#8c9bab] mb-4">Assessment Results</h3>
                
                <div className="space-y-4">
                  {/* Depression */}
                  <div className="border-b border-[#EAE0D5] pb-3 last:border-0 last:pb-0">
                    <p className="text-[#9CA3AF] text-sm mb-1">Depression (PHQ-9)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">{selectedUser.assessment.phq9.level}</span>
                      <span className="text-[#9CA3AF] ml-1 text-xs">(Score: {selectedUser.assessment.phq9.score})</span>
                    </p>
                  </div>
                  {/* Anxiety */}
                  <div className="border-b border-[#EAE0D5] pb-3 last:border-0 last:pb-0">
                    <p className="text-[#9CA3AF]  text-sm mb-1">Anxiety (GAD-7)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">{selectedUser.assessment.gad7.level}</span>
                      <span className="text-[#9CA3AF] ml-1 text-xs">(Score: {selectedUser.assessment.gad7.score})</span>
                    </p>
                  </div>
                  {/* Dissociation */}
                  <div>
                    <p className="text-[#9CA3AF]  text-sm mb-1">Dissociation (DES-II)</p>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">Score: {selectedUser.assessment.des2.score}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Immediate Support Available Section */}
              <div>
                <h3 className="text-xl text-[#8c9bab] mb-4 pl-1">Immediate Support Available</h3>
                
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
                  {/* Item 1 */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm ">Samaritans (24/7)</p>
                    <p className="text-xs text-gray-500 mt-1">Free emotional support for anyone in distress</p>
                    <p className="text-xs text-gray-800 font-bold mt-1 ">
                      Call: 116 123 <span className="text-[#9CA3AF] font-normal  ">(Free from any phone)</span>
                    </p>
                  </div>
                  {/* Item 2 */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm ">NHS Crisis Line</p>
                    <p className="text-xs text-gray-500 mt-1">Urgent mental health support</p>
                    <p className="text-xs text-gray-800 font-bold mt-1">
                      Call: 111 <span className="text-[#9CA3AF] font-normal  ">and select mental health option</span>
                    </p>
                  </div>
                  {/* Item 3 */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm ">SHOUT Crisis Text Line</p>
                    <p className="text-xs text-gray-500 mt-1">24/7 text support for anyone in crisis</p>
                    <p className="text-xs text-gray-800 font-normal mt-1 ">
                      Text "<span className="font-bold">SHOUT</span>" to <span className="font-bold">85258</span>
                    </p>
                  </div>
                  {/* Item 4 */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm  ">Your GP Surgery</p>
                    <p className="text-xs text-gray-500 mt-1">Contact your GP for an urgent appointment</p>
                    <p className="text-xs text-gray-500 mt-0.5">They can provide immediate support and referrals</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 bg-white border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="flex-1 py-3 bg-[#F9FAFB] text-[#4F7A5B] rounded-lg   font-bold text-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusChange(selectedUser.id, 'Approved')}
                className="flex-1 py-3 bg-[#4F7A5B] text-white rounded-lg   font-bold text-lg hover:bg-[#3E634A] transition-colors shadow-md"
              >
                Approve
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}