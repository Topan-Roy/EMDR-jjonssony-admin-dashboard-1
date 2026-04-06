import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  percentage: string;
  subText: string;
}

const StatCard = ({ title, value, percentage, subText }: StatCardProps) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[210px] border border-gray-50">
      <h3 className="text-[#8e8e8e]   text-xl font-light mb-2">
        {title}
      </h3>

      <div className="flex-1 flex items-center">
        <h4 className="text-black text-5xl font-bold   tracking-tight">
          {value}
        </h4>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-[#4f795a]">
          <TrendingUp size={24} strokeWidth={2.5} />
          <span className="text-lg font-bold  ">{percentage}</span>
        </div>
        <p className="text-[#444444] text-sm font-light   whitespace-nowrap">
          {subText}
        </p>
      </div>
    </div>
  );
};

export default function StatsGrid() {
  return (
    <div className="bg-transparent py-2  ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <StatCard 
          title="Total Users" 
          value="1,247" 
          percentage="15%" 
          subText="823 Active / 424 Inactive" 
        />
        <StatCard 
          title="Active Subscriptions" 
          value="892" 
          percentage="15%" 
          subText="71.5% conversion rate" 
        />
        <StatCard 
          title="Roadmaps Created" 
          value="3,402" 
          percentage="15%" 
          subText="2,655 AI / 747 Psychologist" 
        />
        <StatCard 
          title="Session Completion" 
          value="68%" 
          percentage="15%" 
          subText="Average completion rate" 
        />
      </div>
    </div>
  );
}