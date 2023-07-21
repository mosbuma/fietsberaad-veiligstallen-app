import * as React from "react";
import { useState } from "react";
import Input from "@mui/material/TextField";
import SearchBar from "~/components/SearchBar";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";

function ParkingFacilityBrowser({
  fietsenstallingen,
  activeParkingId,
  onShowStallingDetails
}: {
  fietsenstallingen: any;
  activeParkingId?: any;
  onShowStallingDetails?: (id: number) => void;
}) {
  const [selectedParkingId, setSelectedParkingId] = useState(activeParkingId);

  const clickParking = (id: string) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    setSelectedParkingId(parseInt(id));

    onShowStallingDetails && onShowStallingDetails(parseInt(id));
  };

  return (
    <div
      className="
      ParkingFacilityBrowser
      rounded-3xl
      bg-white
      py-0
      shadow-lg
    "
      style={{
        width: "414px",
        maxWidth: "calc(100% - 2.5rem)",
        maxHeight: "60vh",
        height: "100%",
        overflow: "auto",
      }}
    >
      <SearchBar />

      <div
        className="
        px-0
      "
      >
        {fietsenstallingen.map((x: any) => {
          return (
            <ParkingFacilityBlock
              key={x.ID}
              parking={x}
              compact={x.ID !== selectedParkingId}
              onClick={clickParking}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ParkingFacilityBrowser;
