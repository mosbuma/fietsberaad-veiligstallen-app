import React, { useEffect } from 'react';
import { ReportBikepark } from './ReportsFilter'; // Adjust the import path if necessary

interface BikeparkSelectProps {
  bikeparks: ReportBikepark[];
  selectedBikeparkIDs: string[];
  setSelectedBikeparkIDs: React.Dispatch<React.SetStateAction<string[]>>;
}

const BikeparkSelect: React.FC<BikeparkSelectProps> = ({
  bikeparks,
  selectedBikeparkIDs,
  setSelectedBikeparkIDs,
}) => {

  const isScrollable = bikeparks.length > 10;

  const toggleSelectAll = () => {
    const newSelection = bikeparks.map(park => park.stallingsID).filter(id => !selectedBikeparkIDs.includes(id));
    setSelectedBikeparkIDs(newSelection.length ? newSelection : []);
  };

  return (
    <>
      <div id='all-bikeparks' className="title" style={{ userSelect: 'none' }}>
        Stallingen
        <span
          onClick={toggleSelectAll}
          style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue', userSelect: 'none' }}
          title="Toggle Select All"
        >
          ✔️
        </span>
      </div>
      <div
        style={{
          maxHeight: isScrollable ? '200px' : 'auto', // Fixed height for scrollable content
          overflowY: isScrollable ? 'auto' : 'visible', // Use 'auto' to ensure scrollbar appears when needed
          overflowX: 'hidden', // Prevent horizontal scrolling
        }}
      >
        {bikeparks.map((park) => (
          <div key={park.stallingsID}>
            <label>
              <input
                type="checkbox"
                checked={selectedBikeparkIDs.includes(park.stallingsID)}
                value={park.stallingsID}
                onChange={() =>
                  setSelectedBikeparkIDs((prev) =>
                    prev.includes(park.stallingsID)
                      ? prev.filter((id) => id !== park.stallingsID)
                      : [...prev, park.stallingsID]
                  )
                }
              />
              {park.title}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};

export default BikeparkSelect;
