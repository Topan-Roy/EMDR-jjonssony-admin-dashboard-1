"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, Eye, Trash2, Play, Music, X, Image as ImageIcon, ChevronDown, Calendar, FileText } from 'lucide-react';

type ContentType = 'Images' | 'Videos' | 'Audio';

interface ContentItem {
  id: number;
  type: ContentType;
  name: string;
  category: string;
  assignedTo: string;
  status: 'Active' | 'Inactive';
  preview: string;
  uploadDate?: string; // Added for detail view
  size?: string;       // Added for detail view
}

// --- DEMO DATA ---
const initialData: ContentItem[] = [
  {
    id: 1,
    type: 'Images',
    name: 'Calm Forest Background',
    category: 'Background',
    assignedTo: 'Session 1-3',
    status: 'Active',
    preview: '/image/image-1.png',
    uploadDate: 'Nov 12, 2025',
    size: '2.4 MB'
  },
  {
    id: 2,
    type: 'Videos',
    name: 'Intro Animation',
    category: 'Guide',
    assignedTo: 'Onboarding',
    status: 'Active',
    preview: '/image/image-1.png',
    uploadDate: 'Nov 10, 2025',
    size: '14.5 MB'
  },
  {
    id: 3,
    type: 'Audio',
    name: 'Soothing Rain',
    category: 'Ambience',
    assignedTo: 'Session 4',
    status: 'Active',
    preview: '/image/image-1.png',
    uploadDate: 'Nov 08, 2025',
    size: '4.2 MB'
  },
  {
    id: 4,
    type: 'Images',
    name: 'Mountain View',
    category: 'Thumbnail',
    assignedTo: 'Roadmap 2',
    status: 'Inactive',
    preview: '/image/image-1.png',
    uploadDate: 'Oct 25, 2025',
    size: '1.8 MB'
  }
];

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('Images');
  const [contents, setContents] = useState<ContentItem[]>(initialData);
  
  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null); // For View Modal

  const tabs: ContentType[] = ['Images', 'Videos', 'Audio'];

  const filteredContent = contents.filter(item => item.type === activeTab);

  const handleDelete = (id: number) => {
    setContents(prev => prev.filter(item => item.id !== id));
  };

  const handleUpload = (newItem: ContentItem) => {
    setContents([newItem, ...contents]);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6  ">
      <div className="flex justify-between items-start">
        <section>
          <h1 className="text-2xl   text-gray-800">Content Manager</h1>
          <p className="text-gray-500 text-sm font-light">Upload and manage media assets for sessions and roadmaps.</p>
        </section>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#6B8E76] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium hover:bg-[#5a7a63] transition-colors shadow-sm"
        >
          <Upload size={18} /> Upload Content
        </button>
      </div>

      <div className="flex gap-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-lg   transition-all relative ${
              activeTab === tab ? "text-[#6B8E76] border-b-2 border-[#6B8E76]" : "text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f4f1] text-[#6B8E76]   rounded-xl overflow-hidden text-sm uppercase tracking-wide">
              <th className="px-6 py-4 font-bold rounded-l-xl">Preview</th>
              <th className="px-6 py-4 font-bold">Name</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Assigned To</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-center rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredContent.length > 0 ? (
              filteredContent.map((item) => (
                <tr key={item.id} className="text-gray-700   hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm">
                      {item.type === 'Images' ? (
                         <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                      ) : item.type === 'Videos' ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                           <Play size={18} className="text-white fill-white" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center">
                          <Music size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-gray-500  ">{item.category}</td>
                  <td className="px-6 py-4 text-gray-500  ">{item.assignedTo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold border ${item.status === 'Active' ? 'bg-[#f4faf7] text-[#2db394] border-[#2db394]/10' : 'bg-gray-100 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4 text-[#6B8E76]">
                      {/* EYE ICON CLICK HANDLER */}
                      <button 
                        onClick={() => setSelectedContent(item)}
                        className="hover:opacity-70 bg-[#eef5f0] p-2 rounded-full transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400   italic">
                  No {activeTab.toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- UPLOAD MODAL --- */}
      {isUploadModalOpen && (
        <UploadModal 
          activeTab={activeTab} 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={handleUpload}
        />
      )}

      {/* --- VIEW DETAILS MODAL (New) --- */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4  ">
          <div className="bg-white w-full max-w-[600px] rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Content Details</h2>
              <button 
                onClick={() => setSelectedContent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              
              {/* Preview Section */}
              <div className="w-full h-56 bg-gray-100 rounded-xl mb-6 overflow-hidden border border-gray-200 flex items-center justify-center relative shadow-inner">
                {selectedContent.type === 'Images' ? (
                  <img src={selectedContent.preview} alt="Preview" className="w-full h-full object-contain" />
                ) : selectedContent.type === 'Videos' ? (
                  <div className="relative w-full h-full bg-black flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                       <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                    <p className="text-white/70 text-sm  ">Preview Video</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#E9ECF5] flex items-center justify-center">
                      <Music size={32} className="text-[#6B8E76]" />
                    </div>
                    <div className="h-1 w-48 bg-gray-300 rounded-full overflow-hidden">
                       <div className="h-full w-1/3 bg-[#6B8E76]"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Card (Cream Background) */}
              <div className="bg-[#FFF9F2] rounded-xl p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  
                  <div>
                    <p className="text-[#9CA3AF] text-xs font-normal mb-1.5 flex items-center gap-1">
                      <FileText size={12} /> Name
                    </p>
                    <p className="text-gray-800 font-medium text-[15px]">{selectedContent.name}</p>
                  </div>

                  <div>
                    <p className="text-[#9CA3AF] text-xs font-normal mb-1.5">Category</p>
                    <p className="text-gray-800   text-[15px]">{selectedContent.category}</p>
                  </div>

                  <div>
                    <p className="text-[#9CA3AF] text-xs font-normal mb-1.5">Assigned To</p>
                    <p className="text-gray-800 font-medium text-[15px]">{selectedContent.assignedTo}</p>
                  </div>

                  <div>
                    <p className="text-[#9CA3AF] text-xs font-normal mb-1.5">File Size</p>
                    <p className="text-gray-800 font-medium text-[15px]">{selectedContent.size || '2.4 MB'}</p>
                  </div>

                  <div>
                    <p className="text-[#9CA3AF] text-xs font-normal mb-1.5 flex items-center gap-1">
                       <Calendar size={12} /> Upload Date
                    </p>
                    <p className="text-gray-800 font-medium text-[15px]">{selectedContent.uploadDate || 'Nov 12, 2025'}</p>
                  </div>

                  <div>
                    <p className="text-[#F59E0B] text-xs font-normal mb-1.5">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-[6px] text-[11px] font-bold shadow-sm bg-white ${
                      selectedContent.status === 'Active' ? 'text-[#10B981]' : 'text-gray-400'
                    }`}>
                      {selectedContent.status}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedContent(null)}
                className="bg-[#6B8E76] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#5a7a63] transition-colors shadow-sm tracking-wide"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// --- UPLOAD MODAL COMPONENT (Unchanged) ---
interface UploadModalProps {
  onClose: () => void;
  onUpload: (item: ContentItem) => void;
  activeTab: ContentType;
}

function UploadModal({ onClose, onUpload, activeTab }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: 'The Main Plan',
    category: 'Background',
    assignedTo: 'Session 1',
    status: 'Active' as 'Active' | 'Inactive'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    const newItem: ContentItem = {
      id: Date.now(),
      type: activeTab,
      name: formData.name,
      category: formData.category,
      assignedTo: formData.assignedTo,
      status: formData.status,
      preview: previewUrl || '/image/image-1.png',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: (selectedFile?.size ? (selectedFile.size / (1024*1024)).toFixed(1) + ' MB' : '1.2 MB')
    };

    onUpload(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm  ">
      <div className="bg-white w-full max-w-[650px] rounded-xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Upload New Content</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-6 mb-8 items-start">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={activeTab === 'Images' ? "image/*" : activeTab === 'Videos' ? "video/*" : "audio/*"}
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 bg-[#E9ECF5] rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={40} className="text-[#BCC3D7]" strokeWidth={1.5} />
            )}
          </div>

          <div className="pt-2">
            <p className="text-[15px] text-gray-800 mb-4  ">
              SVG, PNG, JPG, MP4 or MP3 (max. 10MB)
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#6B8E76] text-white px-5 py-2 rounded-md text-[15px] font-medium hover:bg-[#5a7a63] transition-colors shadow-sm"
              >
                Choose File
              </button>
              <span className="text-[15px] text-gray-800  ">
                {selectedFile ? selectedFile.name : "No File Chosen"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-[17px] text-gray-900  ">Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 outline-none focus:border-[#6B8E76] focus:ring-1 focus:ring-[#6B8E76] transition-all  " 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[17px] text-gray-900  ">Category</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 appearance-none outline-none focus:border-[#6B8E76]   cursor-pointer"
              >
                <option>Background</option>
                <option>Thumbnail</option>
                <option>Guide</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[17px] text-gray-900  ">Status</label>
            <div className="relative">
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                className={`w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg appearance-none outline-none focus:border-[#6B8E76]   cursor-pointer ${
                  formData.status === 'Active' ? 'text-[#10B981]' : 'text-gray-500'
                }`}
              >
                <option value="Active" className="text-gray-800">Active</option>
                <option value="Inactive" className="text-gray-800">Inactive</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[17px] text-gray-900  ">Assigned To</label>
            <div className="flex gap-4">
               <div className="relative w-full">
                <select 
                  className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 appearance-none outline-none focus:border-[#6B8E76]   cursor-pointer"
                >
                  <option>Session 1</option>
                  <option>Session 2</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
              <div className="relative w-full">
                <select 
                  className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 appearance-none outline-none focus:border-[#6B8E76]   cursor-pointer"
                >
                  <option>Session 4</option>
                  <option>Session 5</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-[#E9ECF5] text-gray-800 rounded-lg   text-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 py-3 bg-[#6B8E76] text-white rounded-lg   text-lg hover:bg-[#5a7a63] transition-colors shadow-sm"
          >
            Save Change
          </button>
        </div>

      </div>
    </div>
  );
}