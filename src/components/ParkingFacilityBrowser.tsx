import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedParkingId, setInitialLatLng } from "~/store/mapSlice";
import { AppState } from "~/store/store";
import { setQuery } from "~/store/filterSlice";
import { setMunicipalities } from "~/store/geoSlice";
import { type vsFietsenstallingen } from "~/utils/prisma";

import { convertCoordinatenToCoords } from "~/utils/map/index";

import {
  getMunicipalities
} from "~/utils/municipality";

import ParkingFacilityBrowserStyles from './ParkingFacilityBrowser.module.css';

import SearchBar from "~/components/SearchBar";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";

const MunicipalityBlock = ({
  title,
  onClick
}: {
  title: string, onClick: React.MouseEventHandler<HTMLDivElement>
}) => {
  return (
    <div
      className={`
        ParkingFacilityBlock
        relative
        flex w-full
        justify-between
        border-b
        border-solid
        border-gray-300
        px-5 pb-5
        pt-5
        cursor-pointer
      `}
      onClick={onClick}
    >
      <b className="text-base">
        {title}
      </b>
    </div>
  )
}

function ParkingFacilityBrowser({
  fietsenstallingen,
  onShowStallingDetails,
  showSearchBar,
  customFilter,
}: {
  fietsenstallingen: vsFietsenstallingen[];
  onShowStallingDetails?: (id: number) => void;
  showSearchBar?: boolean;
  customFilter?: Function
}) {
  const dispatch = useDispatch();

  const [visibleParkings, setVisibleParkings] = useState<vsFietsenstallingen[]>(fietsenstallingen);
  const [visibleMunicipalities, setVisibleMunicipalities] = useState([]);

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const mapVisibleFeatures = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  const selectedParkingId = useSelector(
    (state: AppState) => state.map.selectedParkingId
  );

  const filterQuery = useSelector(
    (state: AppState) => state.filter.query
  );

  const municipalities = useSelector(
    (state: AppState) => state.geo.municipalities
  );

  // If mapVisibleFeatures change: Filter parkings
  useEffect(() => {
    // Don't show results if no parkings were found
    if (!fietsenstallingen) return;
    // Don't show results if no search query was given
    if (!filterQuery && !mapVisibleFeatures) return;

    // Create variable that represents all parkings
    const allParkings = fietsenstallingen;
    // Create variable that will have the filtered parkings
    let filtered = allParkings;

    // If custom filter is given: Only apply custom filter
    if (customFilter) {
      filtered = filtered.filter((x) => {
        return customFilter(x)
      });
    }
    // Default filter:
    // - If no active municipality: Search through everything
    // - If active municipality: Search only through parkings of this municipality
    else {
      // If active municipality:
      if (mapZoom && mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ID) {
        // Only keep parkings for this municipality
        const parkingsInThisMunicipality = allParkings.filter((p) => {
          return p.SiteID === activeMunicipalityInfo.ID
            || p.Plaats === activeMunicipalityInfo.CompanyName;// Also show NS stallingen that have an other SiteID
        });
        // Put the visible parkings on top
        const visibleParkingIds = mapVisibleFeatures.map((x) => x.id);
        filtered = parkingsInThisMunicipality.filter((p) => {
          return visibleParkingIds.indexOf(p.ID) > -1;
        });
        parkingsInThisMunicipality.forEach((p) => {
          if (visibleParkingIds.indexOf(p.ID) <= -1) {
            filtered.push(p);
          }
        });
      }

      // Only keep parkings with the searchQuery
      if (
        mapZoom >= 12 ||
        (filterQuery && filterQuery.length > 0)
      ) {
        filtered = filtered.filter((p) => {
          const inFilter =
            p.SiteID && (
              filterQuery === "" ||
              p.Title?.toLowerCase().indexOf(filterQuery.toLowerCase()) || -1 > -1 ||
              p.Location?.toLowerCase().indexOf(filterQuery.toLowerCase()) || -1 > -1 ||
              p.Plaats?.toLowerCase().indexOf(filterQuery.toLowerCase()) || -1 > -1
            );

          // Decide if we want to show the parking
          let showParking = inFilter;

          return showParking;
        });
      }
      else {
        filtered = [];
      }
    }
    // Set filtered parkings into a state variable
    setVisibleParkings(filtered);
  }, [
    fietsenstallingen,
    activeMunicipalityInfo,
    mapVisibleFeatures,
    mapVisibleFeatures.length,
    filterQuery,
    customFilter
  ]);

  useEffect(() => {
    // Don't ask the API if we have all municipalities already
    if (municipalities && municipalities.length > 0) {
      return;
    }
    (async () => {
      const response = await getMunicipalities();
      dispatch(setMunicipalities(response));
    })();
  }, []);

  // Scroll to selected parking if selected parking changes
  useEffect(() => {
    // Stop if no parking was selected
    if (!selectedParkingId) return;
    const container = document.getElementsByClassName('ParkingFacilityBrowser')[0];
    const elToScrollTo = document.getElementById('parking-facility-block-' + selectedParkingId);
    // Stop if no parking element was found
    if (!elToScrollTo) return;
    container?.scrollTo({
      top: elToScrollTo.offsetTop - 250,
      behavior: "smooth"
    });
  }, [selectedParkingId]);

  // Filter municipalities based on search query
  useEffect(() => {
    const filteredMunicipalities = municipalities.filter((x) => {
      if (!x.CompanyName) return false;
      if (filterQuery.length <= 1) return false;
      if (x.CompanyName === 'FIETSBERAAD') return false;
      return x.CompanyName.toLowerCase().indexOf(filterQuery.toLowerCase()) > -1;
    });
    setVisibleMunicipalities(filteredMunicipalities.slice(0, 3));
  }, [
    municipalities,
    filterQuery
  ]);

  const expandParking = (id: string) => {
    // Set active parking ID
    dispatch(setSelectedParkingId(id));
  };

  const clickParking = (id: number) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    expandParking(id);

    onShowStallingDetails && onShowStallingDetails(id);
  };

  return (
    <div
      className={`
        ${ParkingFacilityBrowserStyles.ParkingFacilityBrowser}
        ParkingFacilityBrowser
        rounded-3xl
        bg-white
        py-0
        text-left
        shadow-lg
      `}
      style={{
        maxWidth: "100%",
        // height: "100%",
        overflow: "auto",
      }}
    >
      {showSearchBar ? <SearchBar
        value={filterQuery}
        filterChanged={(e) => {
          dispatch(setQuery(e.target.value))
        }}
      /> : ''}

      <div className="px-0">
        {visibleMunicipalities.map((x: any) => {
          return (
            <MunicipalityBlock
              key={x.ID}
              title={x.CompanyName}
              onClick={() => {
                // Fly to municipality
                const initialLatLng = convertCoordinatenToCoords(x.Coordinaten);
                dispatch(setInitialLatLng(initialLatLng))
                // Reset filterQuery
                dispatch(setQuery(''));
              }}
            />
          )
        })}
        {visibleParkings.map((x: any) => {
          return (
            <div className="mb-0 ml-0 mr-0" key={x.ID}>
              <ParkingFacilityBlock
                id={'parking-facility-block-' + x.ID}
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
