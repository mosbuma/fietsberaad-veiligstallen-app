import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '../common/LoadingSpinner';
import ArticleEdit from './ArticleEdit';
import { useArticles } from '~/hooks/useArticles';
import type { VSArticle } from '~/types/articles';

const ArticlesComponent: React.FC<{ type: "articles" | "pages" | "fietskluizen" | "buurtstallingen" | "abonnementen" }> = ({ type }) => {
  const router = useRouter();
  const { articles, isLoading, error, reloadArticles } = useArticles();
  const [filteredArticles, setFilteredArticles] = useState<VSArticle[]>([]);
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setFilteredArticles(articles);
  }, [articles]);

  const handleEditArticle = (id: string) => {
    setCurrentArticleId(id);
  };

  const handleDeleteArticle = async (id: string) => {
    if(! confirm('Weet je zeker dat je deze pagina wilt verwijderen?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/protected/articles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      setFilteredArticles(filteredArticles.filter(article => article.ID !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const handleCloseEdit = async (confirmClose: boolean = false) => {
    if (confirmClose && (confirm('Wil je het bewerkformulier verlaten?') === false)) {
      return;
    }
    setCurrentArticleId(undefined);
    // Refresh the articles list
    reloadArticles();
  };

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Pagina's</h1>
          <button 
            onClick={() => handleEditArticle('new')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe pagina
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Vind pagina..."
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              setFilteredArticles(
                articles.filter(article =>
                  article.Title?.toLowerCase().includes(searchTerm) ||
                  article.Article?.toLowerCase().includes(searchTerm)
                )
              );
            }}
          />
        </div>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Titel</th>
              {/* <th className="py-2">Type</th> */}
              <th className="py-2">Status</th>
              <th className="py-2">Laatst gewijzigd</th>
              <th className="py-2">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr key={article.ID}>
                <td className="border px-4 py-2">{article.DisplayTitle}</td>
                {/* <td className="border px-4 py-2">{article.Navigation}</td> */}
                <td className="border px-4 py-2">{article.Status === '1' ? 'Actief' : 'Inactief'}</td>
                <td className="border px-4 py-2">{new Date(article.DateModified || '').toLocaleDateString()}</td>
                <td className="border px-4 py-2">
                  <button 
                    onClick={() => handleEditArticle(article.ID)} 
                    className="text-yellow-500 mx-1 disabled:opacity-40"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteArticle(article.ID)} 
                    className="text-red-500 mx-1 disabled:opacity-40"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading articles..." />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {currentArticleId === undefined ? (
        renderOverview()
      ) : (
        <ArticleEdit
          id={currentArticleId}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default ArticlesComponent;
