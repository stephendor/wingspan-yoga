'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '@/components/blog/BlogEditor';
import { BlogPostAccessLevel } from '@prisma/client';

interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  contentBlocks: object;
  metaDescription: string;
  featuredImage: string;
  category: string;
  published: boolean;
  accessLevel: BlogPostAccessLevel;
  tags: string[];
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CreateBlogPostData>>({
    title: '',
    slug: '',
    excerpt: '',
    contentBlocks: null,
    metaDescription: '',
    featuredImage: '',
    category: '',
    published: false,
    accessLevel: 'PUBLIC',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof CreateBlogPostData, value: string | boolean | object | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (data.success && data.media) {
        handleInputChange('featuredImage', data.media.url);
      } else {
        alert('Failed to upload image: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        published: asDraft ? false : formData.published,
      };

      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Failed to create blog post');
      }
    } catch (err) {
      setError('Failed to create blog post');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/admin/blog');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        <button
          onClick={handleCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter blog post title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="post-url-slug"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Excerpt and Meta Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief description of the post"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              placeholder="Meta description for search engines"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={formData.featuredImage}
              onChange={(e) => handleInputChange('featuredImage', e.target.value)}
              placeholder="Image URL or upload below"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="featured-image-upload"
            />
            <label
              htmlFor="featured-image-upload"
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              Upload
            </label>
          </div>
          {formData.featuredImage && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.featuredImage}
                alt="Featured image preview"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
        </div>

        {/* Category and Access Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="yoga">Yoga</option>
              <option value="wellness">Wellness</option>
              <option value="retreats">Retreats</option>
              <option value="meditation">Meditation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level
            </label>
            <select
              value={formData.accessLevel}
              onChange={(e) => handleInputChange('accessLevel', e.target.value as BlogPostAccessLevel)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="PREMIUM_ONLY">Premium Only</option>
              <option value="RETREAT_ATTENDEES_ONLY">Retreat Attendees Only</option>
              <option value="MAILCHIMP_SUBSCRIBERS_ONLY">Mailchimp Subscribers Only</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="border border-gray-300 rounded-md p-2 min-h-[80px]">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tags and press Enter or comma"
              className="w-full border-none outline-none"
            />
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <BlogEditor
            content={formData.contentBlocks}
            onChange={(content) => handleInputChange('contentBlocks', content)}
            placeholder="Write your blog post content here..."
          />
        </div>

        {/* Publish Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => handleInputChange('published', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="published" className="text-sm text-gray-700">
            Publish immediately
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Publishing...' : formData.published ? 'Publish' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}