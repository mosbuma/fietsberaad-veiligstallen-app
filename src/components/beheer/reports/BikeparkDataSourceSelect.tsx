import React, { useState, useEffect, useRef } from 'react';
import { ReportBikepark } from './ReportsFilter';

// Define a new type for bikepark with data source selection
export type BikeparkWithDataSource = {
  stallingsID: string;
  title: string;
  source: 'FMS' | 'Lumiguide';
};

interface BikeparkDataSourceSelectProps {
  bikeparks: ReportBikepark[];
  onSelectionChange: (selectedBikeparks: BikeparkWithDataSource[]) => void;
}

const BikeparkDataSourceSelect: React.FC<BikeparkDataSourceSelectProps> = ({
  bikeparks,
  onSelectionChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const isScrollable = bikeparks.length > 20;

  const selectClasses = "min-w-56 border-2 border-gray-300 rounded-md w-full cursor-pointer relative h-10 leading-10 px-2";
  const buttonClasses = "w-16 h-8 text-sm border-2 border-gray-300 rounded-md";

  // Initialize state with all bikeparks set to FMS by default
  const [selectedBikeparks, setSelectedBikeparks] = useState<BikeparkWithDataSource[]>(
    bikeparks.map(park => ({
      stallingsID: park.stallingsID,
      title: park.title,
      source: 'FMS'
    }))
  );

  // Update state when bikeparks prop changes
  useEffect(() => {
    // Keep previous source selections when possible, default to FMS for new parks
    setSelectedBikeparks(bikeparks.map(park => {
      const existing = selectedBikeparks.find(p => p.stallingsID === park.stallingsID);
      return {
        stallingsID: park.stallingsID,
        title: park.title,
        source: existing ? existing.source : 'FMS'
      };
    }));
  }, [bikeparks]);

  // Notify parent component when selections change
  useEffect(() => {
    onSelectionChange(selectedBikeparks);
  }, [selectedBikeparks, onSelectionChange]);

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && divRef.current.contains(event.target as Node)) {
      return;
    }
    if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
      return;
    }
    setIsDropdownOpen(false);
  };

  const handleSourceChange = (stallingsID: string, source: 'FMS' | 'Lumiguide') => {
    setSelectedBikeparks(prev =>
      prev.map(park =>
        park.stallingsID === stallingsID
          ? { ...park, source }
          : park
      )
    );
  };

  return (
    <>
      <div
        ref={divRef}
        className={selectClasses}
        style={{ userSelect: 'none', backgroundColor: 'rgb(239, 239, 239)' }}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        Kies databron
        <button
          className={buttonClasses}
          style={{
            width: '100px',
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            backgroundColor: 'white'
          }}
        >
          Selecteer
        </button>
      </div>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className={selectClasses}
          style={{
            width: 'auto',
            height: 'auto',
            maxHeight: isScrollable ? '200px' : 'auto',
            overflowY: isScrollable ? 'auto' : 'visible',
            overflowX: 'hidden',
            border: '1px solid #ccc',
            position: 'absolute',
            backgroundColor: 'white',
            zIndex: 1000,
          }}
        >
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Gegevensbron per stalling</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
              {bikeparks.map(park => (
                <div key={park.stallingsID} className="flex justify-flex-start p-2 border-b">
                  <div className="flex space-x-4 text-left">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`source-${park.stallingsID}`}
                        checked={selectedBikeparks.find(p => p.stallingsID === park.stallingsID)?.source === 'FMS'}
                        onChange={() => handleSourceChange(park.stallingsID, 'FMS')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">FMS</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name={`source-${park.stallingsID}`}
                        checked={selectedBikeparks.find(p => p.stallingsID === park.stallingsID)?.source === 'Lumiguide'}
                        onChange={() => handleSourceChange(park.stallingsID, 'Lumiguide')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Lumiguide</span>
                    </label>
                    <div className="flex-1 font-medium">{park.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BikeparkDataSourceSelect;
