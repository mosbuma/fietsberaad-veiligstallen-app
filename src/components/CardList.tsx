// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardData } from "./Card";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface Props {
  cards: CardData[];
  cardsPerSlide?: number;
  onShowStallingDetails?: Function;
}

const CardList: React.FC<Props> = ({
  fietsenstallingen,
  cardsPerSlide = 3,
  onShowStallingDetails
}) => {
  const [selectedParkingId, setSelectedParkingId] = useState();
  const [visibleParkings, setVisibleParkings] = useState(fietsenstallingen);

  const mapVisibleFeatures = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  // If mapVisibleFeatures change: Filter parkings
  useEffect(() => {
    if(! fietsenstallingen) return;
    if(! mapVisibleFeatures) return;

    const allParkings = fietsenstallingen;
    const visibleParkingIds = mapVisibleFeatures.map(x => x.id);
    // Only keep parkings that are visible on the map
    const filtered = allParkings.filter((x) => visibleParkingIds.indexOf(x.ID) > -1);
    // Set filtered parkings into a state variable
    setVisibleParkings(filtered);
  }, [
    fietsenstallingen,
    mapVisibleFeatures,
    mapVisibleFeatures.length
  ])

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

  const [ref] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: typeof window !== 'undefined' ? (window.innerWidth / 315) : 1.3,// slides are 315px in width
      spacing: 15,
    },
  });

  return (
    <div className="card-list">
      <div ref={ref} className="card-list__slides keen-slider px-5">
        {fietsenstallingen.map((parking, index) => (
          <Card
            key={"c-" + parking.ID}
            parking={parking}
            isActive={parking.ID === selectedParkingId}
            expandParking={null}
            clickParking={clickParking}
          />
        ))}
      </div>
    </div>
  );
};

export default CardList;
