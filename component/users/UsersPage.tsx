"use client";

import { useState } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';

// Mock Data
const usersData = Array(10).fill({
  id: "USER-1000",
  name: "User1",
  email: "user1@example.com",
  plan: "The Main Plan",
  subPlan: "Rockstar",
  type: "Psychologist",
  progress: 18,
  status: "Active",
  joined: "1/12/2026",
  lastActive: "1/13/2026",
  sessions: 13
});

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section>
        <h1 className="text-2xl font-semibold text-gray-800  ">User Monitoring</h1>
        <p className="text-gray-500 text-sm">View user progress and account details.</p>
      </section>

      {/* Search and Filter Bar */}
      <div className="bg-[#f2f6f3] p-4 rounded-2xl flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by username or email" 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-600 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <button className="bg-[#4f795a] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium hover:bg-[#3d5d45] transition-colors">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="bg-[#76977e] text-white  ">
                <th className="px-6 py-4 font-normal text-left rounded-l-2xl">User Name</th>
                <th className="px-6 py-4 font-normal text-left">Email</th>
                <th className="px-6 py-4 font-normal text-left">Subscription</th>
                <th className="px-6 py-4 font-normal text-left">Roadmap Type</th>
                <th className="px-6 py-4 font-normal text-left">Session Progress</th>
                <th className="px-6 py-4 font-normal text-left">Status</th>
                <th className="px-6 py-4 font-normal text-left rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user, index) => (
                <tr key={index} className="text-[#333]   group">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500  ">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-1 border border-[#4f795a]/20 text-[#2db394] rounded-lg text-sm">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.type}</td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <span className="text-[10px] font-bold   block mb-1">{user.progress}%</span>
                      <div className="w-full bg-[#cbd5cc] h-2 rounded-full">
                        <div className="bg-[#4f795a] h-full rounded-full" style={{ width: `${user.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1 rounded-xl text-xs   border ${
                      index % 2 === 0 ? 'bg-[#f4faf7] text-[#2db394] border-[#2db394]/10' : 'bg-[#fff5f5] text-[#f25c5c] border-[#f25c5c]/10'
                    }`}>
                      {index % 2 === 0 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 text-[#4f795a] hover:opacity-70"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Eye />
                      </div>
                      <span className="  font-medium text-sm">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- USER DETAILS MODAL (Updated Design) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Cream Card */}
            <div className="px-8 pb-8">
              <div className="bg-[#fff9f2] rounded-2xl p-8 space-y-8">
                
                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-8">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">User ID</p>
                    <p className="text-gray-700 font-medium">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-gray-800  ">{selectedUser.email}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Roadmap Type</p>
                    <p className="text-gray-700 font-medium">{selectedUser.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Sessions Completed</p>
                    <p className="text-gray-700 font-medium">{selectedUser.sessions}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Subscription Plan</p>
                    <p className="text-gray-700 font-medium">{selectedUser.plan} ({selectedUser.subPlan})</p>
                  </div>
                  <div>
                    <p className="text-[#eab308]/80 text-sm mb-1">Status</p>
                    <span className={`inline-block px-4 py-1 rounded-lg text-xs font-bold border bg-white ${selectedUser.status === 'Active' ? 'text-[#2db394] border-gray-100' : 'text-red-500 border-red-100'}`}>
                      {selectedUser.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Joined Date</p>
                    <p className="text-gray-700 font-medium">{selectedUser.joined}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Last Active</p>
                    <p className="text-gray-700 font-medium">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div>
                  <p className="  text-gray-800 mb-3">Overall Progress</p>
                  <div className="relative w-full bg-[#dce6e0] h-7 rounded-full overflow-hidden flex items-center px-1">
                    <div 
                      className="bg-[#4f795a] h-5 rounded-full" 
                      style={{ width: `${selectedUser.progress}%` }}
                    ></div>
                    <span className="ml-3 text-xs font-bold text-gray-700 z-10">{selectedUser.progress}%</span>
                  </div>
                </div>

              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="bg-[#347B76] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#2a625e] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}