import * as React from "react";
import {useState} from "react";
import Input from '@mui/material/TextField';
import SearchBar from "~/components/SearchBar";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";

function ParkingFacilityBrowser({
  fietsenstallingen,
  activeParkingId
}: {
  fietsenstallingen: any,
  activeParkingId?: number
}) {
  const [selectedParkingId, setSelectedParkingId] = useState(activeParkingId);

  const clickParking = (id) => {
    // Set URL
    window.history.replaceState(null, document.title, `/stalling/${id}`);// Only change URL
    // push(`/stalling/${id}`);// Redirect
    
    // Set active parking ID
    setSelectedParkingId(id)
  }

  return (
    <div className="
      ParkingFacilityBrowser
      bg-white
      px-5
      py-0
      shadow-lg
      rounded-3xl
    "
    style={{
      width: '414px',
      maxWidth: 'calc(100% - 2.5rem)',
      maxHeight: '60vh',
      height: '100%',
      overflow: 'auto'
    }}
    >
      <SearchBar />

      <div className="
        px-0
      ">
        {fietsenstallingen.map((x: any) => {
          return <ParkingFacilityBlock
            key={x.ID}
            parking={x}
            compact={x.ID !== selectedParkingId}
            onClick={clickParking}
          />
        })}
      </div>

    </div>
  );
}

export default ParkingFacilityBrowser;
