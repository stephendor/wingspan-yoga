'use client';

import { useState, useEffect } from 'react';
import { Trash2, Upload, Search, Filter, Image as ImageIcon, Video, FileText, Eye } from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
  };
}

interface MediaResponse {
  success: boolean;
  media: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mimeTypeFilter, setMimeTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Load media files
  const loadMedia = async (page = 1, search = '', mimeType = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (mimeType !== 'all') params.append('mimeType', mimeType);

      const response = await fetch(`/api/media?${params}`);
      const data: MediaResponse = await response.json();

      if (data.success) {
        setMedia(data.media);
        setPagination(data.pagination);
      } else {
        console.error('Failed to load media:', data.error);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMedia(currentPage, searchTerm, mimeTypeFilter);
  }, [currentPage, searchTerm, mimeTypeFilter]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!data.success) {
          console.error('Upload failed:', data.error);
          alert(`Failed to upload ${file.name}: ${data.error}`);
        }
      }

      // Reload media after uploads
      await loadMedia(currentPage, searchTerm, mimeTypeFilter);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion
  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      const response = await fetch(`/api/media?id=${mediaId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await loadMedia(currentPage, searchTerm, mimeTypeFilter);
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      } else {
        alert(`Failed to delete file: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} selected files?`)) return;

    try {
      const deletePromises = Array.from(selectedFiles).map(id =>
        fetch(`/api/media?id=${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await loadMedia(currentPage, searchTerm, mimeTypeFilter);
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Some files failed to delete. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadMedia(1, searchTerm, mimeTypeFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        
        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
            aria-label="Upload media files"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={mimeTypeFilter}
            onChange={(e) => setMimeTypeFilter(e.target.value as 'all' | 'image' | 'video')}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by file type"
          >
            <option value="all">All Files</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>
          
          <button
            type="submit"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </form>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-4 pt-2 border-t">
            <span className="text-sm text-gray-600">
              {selectedFiles.size} files selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          {media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No media files found</p>
              <p className="text-sm">Upload some files to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {media.map((file) => (
                <div
                  key={file.id}
                  className={`group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                    selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    {file.mimeType.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : file.mimeType.startsWith('video/') ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSet.add(file.id);
                          } else {
                            newSet.delete(file.id);
                          }
                          setSelectedFiles(newSet);
                        }}
                        className="rounded"
                        aria-label={`Select ${file.originalName}`}
                      />
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getFileIcon(file.mimeType)}
                      <h3 className="text-sm font-medium truncate" title={file.originalName}>
                        {file.originalName}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {file.width && file.height && (
                      <p className="text-xs text-gray-500">{file.width} × {file.height}</p>
                    )}
                    {file.uploader && (
                      <p className="text-xs text-gray-500 mt-1">by {file.uploader.name}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} files)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{previewFile.originalName}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {previewFile.mimeType.startsWith('image/') ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewFile.url}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-96 mx-auto"
                  />
                </>
              ) : previewFile.mimeType.startsWith('video/') ? (
                <video
                  src={previewFile.url}
                  controls
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Preview not available for this file type</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p><strong>Size:</strong> {formatFileSize(previewFile.size)}</p>
                {previewFile.width && previewFile.height && (
                  <p><strong>Dimensions:</strong> {previewFile.width} × {previewFile.height}</p>
                )}
                <p><strong>Type:</strong> {previewFile.mimeType}</p>
                <p><strong>Uploaded:</strong> {new Date(previewFile.createdAt).toLocaleString()}</p>
                {previewFile.uploader && (
                  <p><strong>Uploaded by:</strong> {previewFile.uploader.name}</p>
                )}
                <p><strong>URL:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{previewFile.url}</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
