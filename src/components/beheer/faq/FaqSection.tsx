import type { VSFAQ } from "~/types/faq";

const FaqSection = ({ section, items }: { section: VSFAQ, items: VSFAQ[] }) => {
  // Don't show empty sections
  if(items.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold my-4">{section.Title}</h2>

      <table className="min-w-full bg-white">
        <tbody>
          {items.map((faq) => (
            <tr key={faq.ID}>
              <td className="border px-4 py-2">{faq.Question}</td>
              <td className="border px-4 py-2 whitespace-nowrap">
                <button 
                  onClick={() => handleEditFaq(faq.ID)} 
                  className="text-yellow-500 mx-1 disabled:opacity-40"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteFaq(faq.ID)} 
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

export default FaqSection;