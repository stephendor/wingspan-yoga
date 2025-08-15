'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { useState, useCallback } from 'react';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  alt?: string; // for images
}

interface BlogEditorProps {
  content?: ContentBlock[] | null;
  onChange?: (content: ContentBlock[]) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function BlogEditor({
  content,
  onChange,
  placeholder = 'Start writing your blog post...',
  editable = true,
}: BlogEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to convert Tiptap JSON to ContentBlock format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertToContentBlocks = (json: any): ContentBlock[] => {
    if (!json || !json.content) return [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.content.map((node: any): ContentBlock => {
      switch (node.type) {
        case 'heading':
          return {
            type: 'heading',
            content: node.content?.[0]?.text || '',
            level: node.attrs?.level || 1,
          };
        case 'paragraph':
          return {
            type: 'paragraph',
            content: node.content?.[0]?.text || '',
          };
        case 'image':
          return {
            type: 'image',
            content: node.attrs?.src || '',
            alt: node.attrs?.alt || '',
          };
        case 'blockquote':
          return {
            type: 'quote',
            content: node.content?.[0]?.content?.[0]?.text || '',
          };
        case 'bulletList':
        case 'orderedList':
          return {
            type: 'list',
            content: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: node.content?.map((item: any) => 
              item.content?.[0]?.content?.[0]?.text || ''
            ) || [],
          };
        default:
          return {
            type: 'paragraph',
            content: node.content?.[0]?.text || '',
          };
      }
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        width: 800,
        height: 400,
      }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        // Convert to content blocks format
        const json = editor.getJSON();
        const contentBlocks = convertToContentBlocks(json);
        onChange(contentBlocks);
      }
    },
  });

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success && data.media) {
          editor?.chain().focus().setImage({ src: data.media.url, alt: file.name }).run();
        } else {
          alert('Failed to upload image: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const handleVideoUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success && data.media) {
          // Insert video as HTML
          const videoHtml = `<video controls style="max-width: 100%; height: auto;">
            <source src="${data.media.url}" type="${data.media.mimeType}">
            Your browser does not support the video tag.
          </video>`;
          
          editor?.chain().focus().insertContent(videoHtml).run();
        } else {
          alert('Failed to upload video: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Video upload error:', error);
        alert('Failed to upload video');
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const addYouTubeVideo = useCallback(() => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      editor?.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2">
          {/* Text Formatting */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('bold')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('italic')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('strike')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Strike
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              H3
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('bulletList')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Bullet List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('orderedList')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Numbered List
            </button>
          </div>

          {/* Media */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={handleImageUpload}
              disabled={isUploading}
              className="px-3 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Image'}
            </button>
            <button
              onClick={handleVideoUpload}
              disabled={isUploading}
              className="px-3 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Video
            </button>
            <button
              onClick={addYouTubeVideo}
              className="px-3 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-50"
            >
              YouTube
            </button>
          </div>

          {/* Link */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={setLink}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive('link')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Link
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive({ textAlign: 'left' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Left
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive({ textAlign: 'center' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Center
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`px-3 py-1 text-sm rounded ${
                editor.isActive({ textAlign: 'right' })
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Right
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="prose prose-lg max-w-none p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}