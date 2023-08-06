import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Input from "@mui/material/TextField";
import SearchBar from "~/components/SearchBar";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";

function ParkingFacilityBrowser({
  fietsenstallingen,
  activeParkingId,
  onShowStallingDetails,
}: {
  fietsenstallingen: any;
  activeParkingId?: any;
  onShowStallingDetails?: (id: number) => void;
}) {
  const [selectedParkingId, setSelectedParkingId] = useState(activeParkingId);
  const [visibleParkings, setVisibleParkings] = useState(fietsenstallingen);
  const [filterQuery, setFilterQuery] = useState("");

  const mapVisibleFeatures = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  // If mapVisibleFeatures change: Filter parkings
  useEffect(() => {
    if (!fietsenstallingen) return;
    if (!mapVisibleFeatures) return;

    const allParkings = fietsenstallingen;
    const visibleParkingIds = mapVisibleFeatures.map((x) => x.id);
    // Only keep parkings that are visible on the map
    const filtered = allParkings.filter((p) => {
      const inFilter =
        filterQuery === "" ||
        p.Title?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1 ||
        p.Location?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1 ||
        p.Plaats?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1;
      activeParkingId ? p.ID === activeParkingId : true;
      const showParking = visibleParkingIds.indexOf(p.ID) > -1 && inFilter;
      return showParking;
    });
    // Set filtered parkings into a state variable
    setVisibleParkings(filtered);
  }, [
    fietsenstallingen,
    mapVisibleFeatures,
    mapVisibleFeatures.length,
    filterQuery,
  ]);

  const expandParking = (id: string) => {
    // Set active parking ID
    setSelectedParkingId(id);
  };

  const clickParking = (id: string) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    setSelectedParkingId(id);

    onShowStallingDetails && onShowStallingDetails(id);
  };

  const updateFilter = (query: string) => {
    setFilterQuery(query);
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
        maxWidth: "calc(100%)",
        maxHeight: "60vh",
        height: "100%",
        overflow: "auto",
      }}
    >
      <SearchBar filterChanged={updateFilter} />

      <div className="px-0">
        {visibleParkings.map((x: any) => {
          return (
            <div className="mb-0 ml-0 mr-0">
              <ParkingFacilityBlock
                key={x.ID}
                parking={x}
                compact={x.ID !== selectedParkingId}
                expandParkingHandler={expandParking}
                openParkingHandler={clickParking}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParkingFacilityBrowser;
