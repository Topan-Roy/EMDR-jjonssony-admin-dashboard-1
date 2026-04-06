"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  CheckCheck, 
  UserPlus, 
  CreditCard, 
  AlertCircle, 
  Clock,
  Trash2
} from 'lucide-react';

// Mock Data
const initialNotifications = [
  {
    id: 1,
    type: 'user',
    title: 'New User Registration',
    message: 'Sarah Johnson has created a new account.',
    time: '2 mins ago',
    read: false,
  },
  {
    id: 2,
    type: 'payment',
    title: 'Subscription Payment Received',
    message: 'Payment of £45 received from Michael Brown (Hero Plan).',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    title: 'System Alert',
    message: 'Server load is high (85%). Please check resources.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'user',
    title: 'Account Suspended',
    message: 'User "User1001" has been automatically suspended due to inactivity.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Failed',
    message: 'Recurring payment failed for User "David Smith".',
    time: 'Yesterday',
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all'); // all, unread

  // Handle Mark All as Read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Handle Delete
  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filter Logic
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  // Helper to get Icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus size={20} className="text-[#4f795a]" />;
      case 'payment': return <CreditCard size={20} className="text-[#2db394]" />;
      case 'alert': return <AlertCircle size={20} className="text-[#f25c5c]" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-[#4f795a] hover:border-[#4f795a] transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl text-gray-800">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated with recent platform activities.</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-[#f2f6f3] p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-[#4f795a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-white text-[#4f795a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unread
          </button>
        </div>

        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 text-[#4f795a] text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <CheckCheck size={18} /> Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 flex gap-4 transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-[#f4faf7]/50' : 'bg-white'}`}
              >
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${!notification.read ? 'bg-white shadow-sm border border-[#4f795a]/10' : 'bg-gray-100'}`}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base   mb-1 ${!notification.read ? 'text-gray-800 font-bold' : 'text-gray-600'}`}>
                      {notification.title}
                    </h4>
                    <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock size={12} /> {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {notification.message}
                  </p>
                </div>

                {/* Individual Actions */}
                <div className="flex flex-col gap-2 items-center justify-center pl-2">
                   {!notification.read && (
                     <div className="w-2.5 h-2.5 rounded-full bg-[#4f795a] mb-2"></div>
                   )}
                   <button 
                    onClick={() => handleDelete(notification.id)}
                    className="text-gray-300 hover:text-[#f25c5c] transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Bell size={48} className="mb-4 opacity-20" />
            <p className="  text-lg">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}