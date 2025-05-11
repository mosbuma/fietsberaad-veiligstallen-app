import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Article = {
  id: string;
  title: string;
  content: string;
  type: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
};

type ArticleEditProps = {
  id: string;
  onClose: (confirmClose?: boolean) => void;
};

const ArticleEdit: React.FC<ArticleEditProps> = ({ id, onClose }) => {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id === 'new') {
        setArticle({
          id: '',
          title: '',
          content: '',
          type: 'article',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    try {
      setIsSaving(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/articles${id === 'new' ? '' : `/${id}`}`, {
        method: id === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      onClose();
    } catch (err) {
      setError('Failed to save article');
      console.error('Error saving article:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!article) return;

    const { name, value } = e.target;
    setArticle(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!article) {
    return <div>No article found</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {id === 'new' ? 'New Article' : 'Edit Article'}
        </h2>
        <button
          onClick={() => onClose(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={article.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={article.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="article">Article</option>
            <option value="page">Page</option>
            <option value="news">News</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={article.content}
            onChange={handleChange}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={article.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => onClose(true)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEdit; 