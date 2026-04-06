"use client";

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Eye, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import StatsGrid from './StatsGrid';

const chartData = [{ name: 'Jun', value: 60 }, { name: 'Feb', value: 65 }, { name: 'Mar', value: 95 }, { name: 'Apr', value: 30 }, { name: 'May', value: 90 }, { name: 'Jun', value: 25 }];

// Mock data 
const dashboardUsers = [
  {
    id: "User-213",
    name: "User1",
    email: "user1@example.com",
    plan: "Rockstar Plan",
    subPlan: "Rockstar",
    type: "ABCD",
    progress: 80,
    status: "Active",
    joined: "Nov 13, 2025",
    lastActive: "Nov 13, 2025",
    sessions: 12
  },
  {
    id: "User-214",
    name: "User2",
    email: "user2@example.com",
    plan: "Hero Plan",
    subPlan: "Hero",
    type: "EFGH",
    progress: 45,
    status: "Suspended",
    joined: "Oct 10, 2025",
    lastActive: "Jan 10, 2026",
    sessions: 8
  },
  {
    id: "User-215",
    name: "User3",
    email: "user3@example.com",
    plan: "Main Plan",
    subPlan: "Prime",
    type: "IJKL",
    progress: 92,
    status: "Active",
    joined: "Dec 01, 2026",
    lastActive: "Now",
    sessions: 24
  }
];

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl   text-gray-800">System Overview</h1>
        <p className="text-gray-500 text-sm">Real-time monitoring of platform health and user activity</p>
      </section>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <h3 className="text-2xl   mb-1 text-gray-800">Monthly Recurring Revenue</h3>
          <p className="text-gray-500 text-sm mb-6">Revenue trends over the last 6 months</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-bold   text-gray-800">£156,910</span>
            <div className="flex items-center gap-1 text-[#497955]"><TrendingUp size={24} /><span className="text-lg font-bold">15%</span></div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f795a" stopOpacity={0.2} /><stop offset="95%" stopColor="#4f795a" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="value" stroke="#4f795a" strokeWidth={2} fill="url(#g)" dot={{ r: 5, fill: "#fff", stroke: "#4f795a", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          <h3 className="text-2xl   mb-6 text-gray-800">Subscription Distribution</h3>
          <div className="space-y-8">
            {['Rockstar', 'Hero', 'Prime', 'Main', 'Free'].map((plan) => (
              <div key={plan} className="space-y-2">
                <div className="flex justify-between font- "><span className='text-gray-500'>{plan}</span> <p className="text-[14px] font-bold text-gray-500">
                  <span className="text-[14px] font-normal text-gray-800 mr-2">89 User</span>
                  £45/Month
                </p>
                </div>
                <div className="w-full bg-[#dbe4dd] h-3 rounded-full overflow-hidden"><div className="bg-[#4f795a] h-full w-[65%] rounded-full"></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm">
        <div className="flex justify-end mb-4">
          <Link href="/dashboard/users" className="  text-gray-800 underline hover:text-[#4f795a] transition-colors">
            View all
          </Link>
        </div>
        
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
              {dashboardUsers.map((user, i) => (
                <tr key={i} className="text-sm  ">
                  <td className="px-6 py-4 text-gray-500">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500  ">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-4 py-1.5 border border-[#4f795a]/20 text-[#2db394] rounded-lg">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.type}</td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <span className="text-[10px] font-bold   block mb-1 text-gray-800">{user.progress}%</span>
                      <div className="w-full bg-[#cbd5cc] h-2 rounded-full">
                        <div className="bg-[#4f795a] h-full rounded-full" style={{ width: `${user.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-5 py-1 rounded-xl border ${user.status === 'Active' ? 'bg-[#f4faf7] text-[#2db394]' : 'bg-[#fff5f5] text-[#f25c5c]'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 text-[#4f795a] hover:opacity-70"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- USER DETAILS MODAL (New Design) --- */}
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
                    <p className="text-gray-700 font-medium">{selectedUser.plan}</p>
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
    </>
  );
}