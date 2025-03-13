import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "~/store/store";

// Components
import Input from "@mui/material/TextField";
import MapboxMap from "~/components/MapComponent";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";
import CardList from "~/components/CardList";
import { CardData } from "~/components/Card";
import FilterBox from "~/components/FilterBox";
import FooterNav from "~/components/FooterNav";

const ParkingFacilities = ({
  fietsenstallingen,
  onStallingAamelden
}: { fietsenstallingen: any, onStallingAamelden?: () => void }) => {
  const [mapmode, setMapmode] = useState(true);
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState<boolean>(false);

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );
  const filterQuery = useSelector(
    (state: AppState) => state.filter.query
  );
  const activeTypes2 = useSelector(
    (state: AppState) => state.filter.activeTypes2
  );

  // const toggleParkingFacilitiesView = () => setMapmode(!mapmode);
  const toggleFilterBox = () => setIsFilterBoxOpen(!isFilterBoxOpen);
  const resetFilter = () => { };

  // let cards: CardData[] = [];
  let filteredFietsenstallingen: any[] = [];

  if (fietsenstallingen) {
    // cards = fietsenstallingen.map((x: any, idx: number) => {
    //   return {
    //     ID: x.ID,
    //     title: x.Title,
    //     location: x.Location,
    //     description: x.Description,
    //   };
    // });
    if (activeTypes2 && activeTypes2.includes("show_submissions")) {
      filteredFietsenstallingen = fietsenstallingen.filter(
        (x: any) => {
          return (x.Status === "new")
        }
      );
    } else {
      filteredFietsenstallingen = fietsenstallingen.filter(
        (x: any) => (x.Status !== "new")
      );
    }
  }

  return (
    <div data-name="parking-facilities">
      <div
        className="
        flex flex-col items-center justify-center
      "
      >
        {mapmode ? (
          <>
            <MapboxMap fietsenstallingen={filteredFietsenstallingen} />
          </>
        ) : (
          <div className="mx-5 pt-24">
            {filteredFietsenstallingen.map((x: any) => {
              return <ParkingFacilityBlock compact={false} key={x.Title} parking={x} />;
            })}
          </div>
        )}
      </div>

      {/*<div style={{ position: "relative" }}>
        <div
          className="l-0 b-20 r-0 h-max-40 absolute"
          style={{
            position: "absolute",
            bottom: "10vh",
            left: 0,
            right: 0,
            maxHeight: "10vh",
          }}
        >
          <CardList cards={cards} />
        </div>
      </div>*/}

      {/*<div
        className="
        fixed
        bottom-5
        right-5
        rounded-full
        bg-white
        p-4
      "
        onClick={toggleParkingFacilitiesView}
      >
        MAPLIST
      </div>
      */}

      <div data-comment="Show only on desktop" className="hidden sm:flex">
        <div
          className="

          absolute
          right-0
          z-10
          p-4
        "
          style={{
            top: "64px",
          }}
        >
          <FilterBox
            isOpen={isFilterBoxOpen}
            onReset={resetFilter}
            onOpen={toggleFilterBox}
            onClose={toggleFilterBox}
          />
        </div>
        <FooterNav onStallingAanmelden={onStallingAamelden} />
      </div>
    </div>
  );
};

export default ParkingFacilities;
