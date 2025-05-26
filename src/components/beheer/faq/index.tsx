import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '../common/LoadingSpinner';
import FaqEdit from './FaqEdit';
import FaqSection from './FaqSection';
import type { VSContactsFAQ, VSFAQ } from '~/types/faq';

const FaqComponent: React.FC = () => {
  const router = useRouter();
  const [faqs, setFaqs] = useState<{sections: VSFAQ[], items: VSFAQ[]}>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredFaqs, setFilteredFaqs] = useState<{sections: VSFAQ[], items: VSFAQ[]}>([]);
  const [currentFaqId, setCurrentFaqId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/protected/faqs');
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        const data = await response.json();
        setFaqs(data.data);
        setFilteredFaqs(data.data);
      } catch (err) {
        setError('Failed to load FAQs');
        console.error('Error loading FAQs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const handleEditFaq = (id: string) => {
    setCurrentFaqId(id);
  };

  const handleDeleteFaq = async (id: string) => {
    if(! confirm('Weet je zeker dat je deze FAQ wilt verwijderen?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/protected/faqs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }
      setFilteredFaqs({
        sections: filteredFaqs.sections,
        items: filteredFaqs.items.filter((faq: VSFAQ) => faq.ID !== id)
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleCloseEdit = async (confirmClose: boolean = false) => {
    if (confirmClose && (confirm('Wil je het bewerkformulier verlaten?') === false)) {
      return;
    }
    setCurrentFaqId(undefined);
    // Refresh the FAQs list
    const response = await fetch('/api/protected/faqs');
    if (response.ok) {
      const data = await response.json();
      setFaqs(data.data);
      setFilteredFaqs(data.data);
    }
  };

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">FAQ's</h1>
          <button 
            onClick={() => handleEditFaq('new')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe FAQ
          </button>
        </div>

        <div className="mb-4">
          <input
            type="search"
            placeholder="Zoek FAQ..."
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              setFilteredFaqs({
                sections: faqs.sections,
                items: faqs.items.filter((faq: VSFAQ) =>
                  faq.Question?.toLowerCase().includes(searchTerm) ||
                  faq.Answer?.toLowerCase().includes(searchTerm)
                )
              });
            }}
          />
        </div>

        {filteredFaqs.sections.map((section: VSFAQ) =>
          <FaqSection
            key={section.ID}
            section={section}
            items={filteredFaqs.items.filter((item: VSFAQ) => item.ParentID === section.ID)}
          />)
        }

      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="FAQ's laden..." />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {currentFaqId === undefined ? (
        renderOverview()
      ) : (
        <FaqEdit
          id={currentFaqId}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default FaqComponent;
