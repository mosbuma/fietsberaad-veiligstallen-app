import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedParkingId } from "~/store/mapSlice";
import { setQuery } from "~/store/filterSlice";

import Input from "@mui/material/TextField";
import SearchBar from "~/components/SearchBar";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";

function ParkingFacilityBrowser({
  fietsenstallingen,
  activeParkingId,
  onShowStallingDetails,
  showSearchBar,
  customFilter,
}: {
  fietsenstallingen: any;
  activeParkingId?: any;
  onShowStallingDetails?: (id: number) => void;
  showSearchBar?: false
  customFilter?: Function
}) {
  const dispatch = useDispatch();

  const [visibleParkings, setVisibleParkings] = useState(fietsenstallingen);
  // const [filterQuery, setFilterQuery] = useState("");

  const mapVisibleFeatures = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  const selectedParkingId = useSelector(
    (state: AppState) => state.map.selectedParkingId
  );

  const filterQuery = useSelector(
    (state: AppState) => state.filter.query
  );

  // If mapVisibleFeatures change: Filter parkings
  useEffect(() => {
    if (!fietsenstallingen) return;
    if (!mapVisibleFeatures) return;
    const allParkings = fietsenstallingen;
    let filtered = fietsenstallingen;

    if(customFilter) {
      filtered = filtered.filter((x) => {
        // console.log('Going to filter x', x)
        return customFilter(x)
      });
    }
    // Default filter:
    else {
      const visibleParkingIds = mapVisibleFeatures.map((x) => x.id);
      // Only keep parkings that are visible on the map
      filtered = allParkings.filter((p) => {
        const inFilter =
          filterQuery === "" ||
          p.Title?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1 ||
          p.Location?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1 ||
          p.Plaats?.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1;
        activeParkingId ? p.ID === activeParkingId : true;
        const showParking = visibleParkingIds.indexOf(p.ID) > -1 && inFilter;
        return showParking;
      });
    }
    // Set filtered parkings into a state variable
    setVisibleParkings(filtered);
  }, [
    fietsenstallingen,
    mapVisibleFeatures,
    mapVisibleFeatures.length,
    filterQuery,
    customFilter
  ]);

  // Scroll to selected parking if selected parking changes
  useEffect(() => {
    // Stop if no parking was selected
    if(! selectedParkingId) return;
    const container = document.getElementsByClassName('ParkingFacilityBrowser')[0];
    const elToScrollTo = document.getElementById('parking-facility-block-'+selectedParkingId);
    // Stop if no parking element was found
    if(! elToScrollTo) return;
    container.scrollTo({
      top: elToScrollTo.offsetTop - 250,
      behavior: "smooth"
    });
  }, [selectedParkingId]);

  const expandParking = (id: string) => {
    // Set active parking ID
    dispatch(setSelectedParkingId(id));
  };

  const clickParking = (id: string) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    expandParking(id);

    onShowStallingDetails && onShowStallingDetails(id);
  };

  console.log('filterQuery', filterQuery);

  return (
    <div
      className="
        ParkingFacilityBrowser
        rounded-3xl
        bg-white
        py-0
        text-left
        shadow-lg
      "
      style={{
        maxWidth: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {showSearchBar ? <SearchBar filterChanged={(e) => dispatch(setQuery(e.target.value))} /> : ''}

      <div className="px-0">
        {visibleParkings.map((x: any) => {
          return (
            <div className="mb-0 ml-0 mr-0" key={x.ID}>
              <ParkingFacilityBlock
                id={'parking-facility-block-'+x.ID}
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
