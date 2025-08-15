 'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
  // Organization fields
  tags?: string[];
  accessLevel?: string;
  directory?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  };
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

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: MediaCategory[];
}

interface CategoriesResponse {
  success: boolean;
  categories?: MediaCategory[];
  error?: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mimeTypeFilter, setMimeTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  // Organization filters
  const [tagFilter, setTagFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [categories, setCategories] = useState<MediaCategory[]>([]);

  const flatCategoryOptions = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const walk = (nodes: MediaCategory[], depth = 0) => {
      for (const n of nodes) {
        list.push({ id: n.id, name: `${'\u00A0'.repeat(depth * 2)}${n.name}` });
        if (n.children && n.children.length) walk(n.children, depth + 1);
      }
    };
    walk(categories);
    return list;
  }, [categories]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/media/categories');
      const data: CategoriesResponse = await res.json();
      if (data.success && data.categories) setCategories(data.categories);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }, []);

  // Load media files
  const loadMedia = useCallback(async (page = 1, search = '', mimeType = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (mimeType !== 'all') params.append('mimeType', mimeType);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (accessFilter) params.append('accessLevel', accessFilter);
      if (tagFilter) params.append('tags', tagFilter);
      if (directoryFilter) params.append('directory', directoryFilter);
  const qs = params.toString();
  const response = await fetch('/api/media?' + qs);
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
  }, [categoryFilter, accessFilter, tagFilter, directoryFilter]);

  // Initial load
  useEffect(() => {
    const run = async () => {
      await loadMedia(currentPage, searchTerm, mimeTypeFilter);
    };
    void run();
  }, [currentPage, searchTerm, mimeTypeFilter, tagFilter, accessFilter, directoryFilter, categoryFilter, loadMedia]);

  // Load categories once
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

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
          const safeName = String(file.name || '').replace(/[\n\r]/g, ' ');
          const safeError = String(data.error || 'Unknown error').replace(/[\n\r]/g, ' ');
          alert('Failed to upload ' + safeName + ': ' + safeError);
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
  const val = Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[Math.max(0, Math.min(i, sizes.length - 1))]}`;
  };

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  // Handle search (non-async to satisfy no-misused-promises)
  const handleSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    void loadMedia(1, searchTerm, mimeTypeFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/media/categories" className="text-sm text-blue-600 hover:text-blue-800 underline" aria-label="Manage categories">
            Manage categories
          </Link>
          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => { if (e.target.files) { void handleFileUpload(e.target.files); } }}
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
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={mimeTypeFilter}
            onChange={(e) => { setMimeTypeFilter(e.target.value as 'all' | 'image' | 'video'); }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by file type"
          >
            <option value="all">All Files</option>
            <option value="image">Images Only</option>
            <option value="video">Videos Only</option>
          </select>

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tagFilter}
            onChange={(e) => { setTagFilter(e.target.value); }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by tags"
          />

          <input
            type="text"
            placeholder="Directory contains..."
            value={directoryFilter}
            onChange={(e) => { setDirectoryFilter(e.target.value); }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by directory"
          />

          <select
            value={accessFilter}
            onChange={(e) => { setAccessFilter(e.target.value); }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by access level"
          >
            <option value="">All Access</option>
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS_ONLY">Members Only</option>
            <option value="PRIVATE">Private</option>
            <option value="RETREATS">Retreats</option>
            <option value="WORKSHOPS">Workshops</option>
            <option value="INSTRUCTORS_ONLY">Instructors Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {flatCategoryOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
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
              onClick={() => { void handleBulkDelete(); }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Selected
            </button>
            <button
              onClick={() => { setSelectedFiles(new Set()); }}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear Selection
            </button>
      {/* Bulk organization tools */}
      <BulkOrganizer
        selectedIds={Array.from(selectedFiles)}
        onDone={() => { void loadMedia(currentPage, searchTerm, mimeTypeFilter); }}
        categories={flatCategoryOptions}
      />
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
                          onClick={() => { setPreviewFile(file); }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { void handleDelete(file.id); }}
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
            onClick={() => { setCurrentPage((prev) => Math.max(1, prev - 1)); }}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} files)
          </span>
          
          <button
            onClick={() => { setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1)); }}
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
                onClick={() => { setPreviewFile(null); }}
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

// --- Bulk Organizer Component ---
function BulkOrganizer({ selectedIds, onDone, categories }: { selectedIds: string[]; onDone: () => void; categories: { id: string; name: string }[] }) {
  const [addTags, setAddTags] = useState('');
  const [removeTags, setRemoveTags] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [directory, setDirectory] = useState('');
  const [busy, setBusy] = useState(false);

  const doApply = async () => {
    setBusy(true);
    try {
      type Body = { ids: string[]; tags?: string[]; addTags?: string[]; removeTags?: string[]; categoryId?: string; accessLevel?: string; directory?: string };
      const body: Body = { ids: selectedIds };
      if (addTags) body.addTags = addTags.split(',').map((t) => t.trim()).filter(Boolean);
      if (removeTags) body.removeTags = removeTags.split(',').map((t) => t.trim()).filter(Boolean);
      if (categoryId) body.categoryId = categoryId;
      if (accessLevel) body.accessLevel = accessLevel;
      if (directory) body.directory = directory;
      const res = await fetch('/api/media/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Bulk update failed');
      } else {
        onDone();
      }
    } catch (e) {
      console.error(e);
      alert('Bulk update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Add tags (comma)"
        value={addTags}
        onChange={(e) => { setAddTags(e.target.value); }}
        className="px-2 py-1 border rounded"
      />
      <input
        type="text"
        placeholder="Remove tags (comma)"
        value={removeTags}
        onChange={(e) => { setRemoveTags(e.target.value); }}
        className="px-2 py-1 border rounded"
      />
      <select
        value={categoryId}
        onChange={(e) => { setCategoryId(e.target.value); }}
        className="px-2 py-1 border rounded"
        aria-label="Bulk set category"
      >
        <option value="">Category</option>
        {categories.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <select
        value={accessLevel}
        onChange={(e) => { setAccessLevel(e.target.value); }}
        className="px-2 py-1 border rounded"
        aria-label="Bulk set access level"
      >
        <option value="">Access</option>
        <option value="PUBLIC">Public</option>
        <option value="MEMBERS_ONLY">Members Only</option>
        <option value="PRIVATE">Private</option>
        <option value="RETREATS">Retreats</option>
        <option value="WORKSHOPS">Workshops</option>
        <option value="INSTRUCTORS_ONLY">Instructors Only</option>
      </select>
      <input
        type="text"
        placeholder="Directory"
        value={directory}
        onChange={(e) => { setDirectory(e.target.value); }}
        className="px-2 py-1 border rounded"
      />
      <button onClick={() => { void doApply(); }} disabled={busy} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
        {busy ? 'Applying…' : 'Apply'}
      </button>
    </div>
  );
}
