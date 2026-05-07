"use client";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import React, { useState, useRef, ChangeEvent, useMemo, useEffect } from 'react';
import { Upload, Eye, Trash2, Play, Music, X, Image as ImageIcon, ChevronDown, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCreateMediaMutation, useDeleteMediaMutation, useGetContentCategoriesQuery, useGetMediaListQuery, useUpdateMediaMutation } from '../redux/features/contentApi';

type ContentType = 'Images' | 'Videos' | 'Audio';

interface ContentItem {
  id: number | string;
  type: ContentType;
  name: string;
  category: string;
  categoryId?: string;
  assignedTo: string;
  status: 'Active' | 'Inactive';
  preview: string;
  uploadDate?: string; // Added for detail view
  size?: string;       // Added for detail view
}

const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string => {
  if (!error) {
    return "Request failed. Please try again.";
  }

  if ("data" in error) {
    const data = error.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;

      if (typeof record.message === "string" && record.message.trim().length > 0) {
        return record.message;
      }
    }
  }

  if ("message" in error && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return "Request failed. Please try again.";
};

const IMAGE_CATEGORY_KEYWORDS = ['img', 'image', 'visual icon', 'icon'];
const AUDIO_CATEGORY_KEYWORDS = ['audio', 'sound'];
const VIDEO_CATEGORY_KEYWORDS = ['video'];

const normalizeLabel = (value?: string) => (value || '').toLowerCase().trim();

const matchesKeyword = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const mapMediaToTab = (
  categoryName?: string,
  categorySlug?: string,
  mediaType?: string,
): ContentType => {
  const normalizedSlug = normalizeLabel(categorySlug);
  const normalizedName = normalizeLabel(categoryName);
  const normalizedMediaType = normalizeLabel(mediaType);
  const categoryLabel = `${normalizedName} ${normalizedSlug}`.trim();

  if (matchesKeyword(categoryLabel, AUDIO_CATEGORY_KEYWORDS)) {
    return 'Audio';
  }

  if (matchesKeyword(categoryLabel, VIDEO_CATEGORY_KEYWORDS)) {
    return 'Videos';
  }

  if (matchesKeyword(categoryLabel, IMAGE_CATEGORY_KEYWORDS)) {
    return 'Images';
  }

  if (normalizedMediaType === 'audio') {
    return 'Audio';
  }

  if (normalizedMediaType === 'video') {
    return 'Videos';
  }

  return 'Images';
};

const getAcceptByTab = (tab: ContentType) =>
  tab === 'Images' ? 'image/*' : tab === 'Videos' ? 'video/*' : 'audio/*';

export default function ContentManagerPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('Images');
  const [uploadedContents, setUploadedContents] = useState<ContentItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<Array<number | string>>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ContentItem['status']>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  
  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null); // For View Modal

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const tabs: ContentType[] = ['Images', 'Videos', 'Audio'];
  const { data: mediaList = [], refetch: refetchMediaList } = useGetMediaListQuery({ page: 1, limit: 20 });
  const [deleteMedia] = useDeleteMediaMutation();
  const [updateMedia] = useUpdateMediaMutation();

  const apiContents = useMemo<ContentItem[]>(
    () =>
      mediaList.map((media) => ({
        id: media.id,
        type: mapMediaToTab(media.categoryName, media.categorySlug, media.mediaType),
        name: media.name || media.originalName,
        category: media.categoryName,
        categoryId: media.categoryId,
        assignedTo: 'Uploaded Media',
        status: statusOverrides[media.id] || media.status,
        preview: media.url || '/image/image-1.png',
        uploadDate: media.createdAt
          ? new Date(media.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : undefined,
        size: media.size ? (media.size / (1024 * 1024)).toFixed(1) + ' MB' : undefined,
      })),
    [mediaList, statusOverrides],
  );

  const contents = [...uploadedContents, ...apiContents].filter(
    (item) => !deletedIds.includes(item.id),
  );
  const filteredContent = contents.filter(item => item.type === activeTab);

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const paginatedContent = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContent.slice(start, start + itemsPerPage);
  }, [filteredContent, currentPage]);

  const handleDelete = async (id: number | string) => {
    setActionError(null);

    if (typeof id !== 'string') {
      setDeletedIds(prev => [...prev, id]);
      return;
    }

    setDeletingId(id);

    try {
      await deleteMedia(id).unwrap();
      setDeletedIds(prev => [...prev, id]);

      if (selectedContent?.id === id) {
        setSelectedContent(null);
      }
    } catch (error) {
      setActionError(getErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = (newItem: ContentItem) => {
    setUploadedContents(prev => [newItem, ...prev]);
    setIsUploadModalOpen(false);
  };

  const handleStatusUpdate = async (item: ContentItem, nextStatus: ContentItem['status']) => {
    if (item.status === nextStatus) {
      return;
    }

    if (typeof item.id !== 'string' || !item.categoryId) {
      setUploadedContents((prev) =>
        prev.map((content) =>
          content.id === item.id ? { ...content, status: nextStatus } : content,
        ),
      );
      setSelectedContent((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      return;
    }

    setActionError(null);
    setUpdatingStatusId(item.id);

    try {
      await updateMedia({
        mediaId: item.id,
        categoryId: item.categoryId,
        status: nextStatus,
      }).unwrap();

      setStatusOverrides((prev) => ({
        ...prev,
        [item.id]: nextStatus,
      }));
      setSelectedContent((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      await refetchMediaList();
    } catch (error) {
      setActionError(getErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setUpdatingStatusId(null);
    }
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

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </p>
      )}

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
            {paginatedContent.length > 0 ? (
              paginatedContent.map((item) => (
                <tr key={item.id} className="text-gray-700   hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedContent(item)}
                      className="relative w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer"
                    >
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
                    </button>
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
                        onClick={() => void handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Pagination UI */}
      {filteredContent.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-4">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="text-gray-800">
              {Math.min(currentPage * itemsPerPage, filteredContent.length)}
            </span>{" "}
            of <span className="text-gray-800">{filteredContent.length}</span> results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Logic to show only some page numbers if there are too many
                if (
                  totalPages > 7 &&
                  page !== 1 &&
                  page !== totalPages &&
                  (page < currentPage - 1 || page > currentPage + 1)
                ) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all ${
                      currentPage === page
                        ? "bg-[#6B8E76] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

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
                  <video
                    src={selectedContent.preview}
                    controls
                    autoPlay
                    className="w-full h-full bg-black object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 w-full px-6">
                    <div className="w-16 h-16 rounded-full bg-[#E9ECF5] flex items-center justify-center">
                      <Music size={32} className="text-[#6B8E76]" />
                    </div>
                    <audio
                      src={selectedContent.preview}
                      controls
                      autoPlay
                      className="w-full max-w-md"
                    />
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
                    <div className="relative">
                      <select
                        value={selectedContent.status}
                        onChange={(event) =>
                          void handleStatusUpdate(
                            selectedContent,
                            event.target.value as ContentItem['status'],
                          )
                        }
                        disabled={updatingStatusId === selectedContent.id}
                        className={`appearance-none rounded-[6px] bg-white px-3 py-1 pr-8 text-[11px] font-bold shadow-sm outline-none disabled:opacity-60 ${
                          selectedContent.status === 'Active' ? 'text-[#10B981]' : 'text-gray-400'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                    </div>
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
    name: '',
    categoryId: '',
    assignedTo: 'Session 1',
    status: 'Active' as 'Active' | 'Inactive'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: categoryData = [], isLoading: isCategoryLoading } = useGetContentCategoriesQuery();
  const [createMedia, { isLoading: isSubmitting }] = useCreateMediaMutation();

  const availableCategories = useMemo(
    () => categoryData.filter((category) => category.isActive),
    [categoryData],
  );

  const selectedCategoryRecord =
    availableCategories.find((category) => category.id === formData.categoryId) ||
    availableCategories[0] ||
    null;
  const resolvedCategoryId = selectedCategoryRecord?.id || '';
  const selectedCategory = selectedCategoryRecord?.name || '';

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSubmitError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitError("Please choose a file.");
      return;
    }

    if (!formData.name.trim()) {
      setSubmitError("Please enter a name.");
      return;
    }

    if (!resolvedCategoryId) {
      setSubmitError("Please select a category.");
      return;
    }

    setSubmitError(null);

    try {
      const media = await createMedia({
        image: selectedFile,
        name: formData.name.trim(),
        categoryId: resolvedCategoryId,
        status: formData.status,
      }).unwrap();

      const newItem: ContentItem = {
        id: media.id || ((selectedFile.lastModified || 0) + (selectedFile.size || 0)),
        type: mapMediaToTab(media.categoryName || selectedCategory, media.categorySlug, media.mediaType),
        name: media.name || formData.name || media.originalName,
        category: media.categoryName || selectedCategory,
        categoryId: media.categoryId || resolvedCategoryId,
        assignedTo: formData.assignedTo,
        status: media.status,
        preview: media.url || previewUrl || '/image/image-1.png',
        uploadDate: media.createdAt
          ? new Date(media.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: media.size ? (media.size / (1024*1024)).toFixed(1) + ' MB' : '1.2 MB'
      };

      onUpload(newItem);
    } catch (error) {
      setSubmitError(getErrorMessage(error as FetchBaseQueryError | SerializedError));
    }
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

        {submitError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </p>
        )}

        <div className="flex gap-6 mb-8 items-start">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={getAcceptByTab(activeTab)}
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 bg-[#E9ECF5] rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity overflow-hidden"
          >
            {previewUrl && activeTab === 'Images' ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : previewUrl && activeTab === 'Videos' ? (
              <div className="flex h-full w-full items-center justify-center bg-black">
                <Play size={30} className="text-white fill-white" />
              </div>
            ) : previewUrl && activeTab === 'Audio' ? (
              <div className="flex h-full w-full items-center justify-center bg-white">
                <Music size={30} className="text-[#6B8E76]" />
              </div>
            ) : (
              <ImageIcon size={40} className="text-[#BCC3D7]" strokeWidth={1.5} />
            )}
          </div>

          <div className="pt-2">
            <p className="text-[15px] text-gray-800 mb-4  ">
              {activeTab === 'Images'
                ? 'SVG, PNG or JPG (max. 10MB)'
                : activeTab === 'Videos'
                  ? 'MP4 or supported video file (max. 10MB)'
                  : 'MP3, WAV or supported audio file (max. 10MB)'}
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
              placeholder="Enter content name"
              className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 outline-none focus:border-[#6B8E76] focus:ring-1 focus:ring-[#6B8E76] transition-all  " 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[17px] text-gray-900  ">Category</label>
            <div className="relative">
              <select 
                value={resolvedCategoryId}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }));
                }}
                className="w-full px-4 py-3 bg-[#FCFCFD] border border-gray-100 rounded-lg text-gray-800 appearance-none outline-none focus:border-[#6B8E76]   cursor-pointer"
              >
                {isCategoryLoading ? (
                  <option value="">Loading categories...</option>
                ) : availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="">No categories available for {activeTab}</option>
                )}
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#6B8E76] text-white rounded-lg   text-lg hover:bg-[#5a7a63] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Change'}
          </button>
        </div>

      </div>
    </div>
  );
}
