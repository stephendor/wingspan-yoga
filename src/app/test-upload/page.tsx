'use client';

import { useState } from 'react';

interface MediaUploadResponse {
  success: boolean;
  media?: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
  };
  error?: string;
}

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<MediaUploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Media Upload Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Result:
              </h3>
              <pre className="text-sm bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.success && result.media && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                  {result.media.mimeType.startsWith('image/') ? (
                    <img
                      src={result.media.url}
                      alt="Uploaded"
                      className="max-w-xs h-auto rounded border"
                    />
                  ) : (
                    <video
                      src={result.media.url}
                      controls
                      className="max-w-xs h-auto rounded border"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}