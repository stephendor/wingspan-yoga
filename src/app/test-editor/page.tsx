'use client';

import { useState } from 'react';
import BlogEditor from '@/components/blog/BlogEditor';
import BlogContent from '@/components/blog/BlogContent';

export default function TestEditorPage() {
  const [content, setContent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Blog Editor Test
        </h1>

        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {viewMode === 'editor' ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Editor Mode</h2>
              <BlogEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your blog post. You can add headings, format text, insert images and videos..."
              />
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preview Mode</h2>
              {content ? (
                <div className="border border-gray-200 rounded-lg p-6">
                  <BlogContent content={content} />
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  No content to preview. Switch to editor mode and start writing.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Info */}
        {content && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Debug: Content JSON</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded border overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}