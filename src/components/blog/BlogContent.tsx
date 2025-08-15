'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list';
  content: string;
  level?: number; // for headings
  items?: string[]; // for lists
  alt?: string; // for images
}

interface BlogContentProps {
  content: ContentBlock[] | string | null;
  className?: string;
}

export default function BlogContent({ content, className = '' }: BlogContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-image max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'blog-link text-blue-600 hover:text-blue-800 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Youtube.configure({
        width: 800,
        height: 400,
        HTMLAttributes: {
          class: 'rounded-lg shadow-sm',
        },
      }),
    ],
    content: content || '',
    editable: false,
  });

  if (!editor) {
    return <div className="h-32 bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .blog-image {
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .blog-link {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .blog-link:hover {
          color: #1d4ed8;
        }
        
        .prose h1 {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          color: #374151;
        }
        
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #4b5563;
        }
        
        .prose p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: #374151;
        }
        
        .prose ul, .prose ol {
          margin: 1.25rem 0;
          padding-left: 1.75rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .prose blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #dc2626;
        }
        
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .prose pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      `}</style>
    </div>
  );
}