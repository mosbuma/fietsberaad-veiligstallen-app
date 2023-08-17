// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardData } from "./Card";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import {
  setSelectedParkingId
} from "~/store/mapSlice";

import { findParkingIndex } from "~/utils/parkings";

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
  const dispatch = useDispatch();

  const [visibleParkings, setVisibleParkings] = useState(fietsenstallingen);

  const mapVisibleFeatures = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  const selectedParkingId = useSelector(
    (state: AppState) => state.map.selectedParkingId
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
    setTimeout(() => {
      slider.current.update(sliderProps, 0)
    }, 10);
  }, [
    fietsenstallingen,
    mapVisibleFeatures,
    mapVisibleFeatures.length
  ])

  // Scroll to selected parking if selected parking changes
  useEffect(() => {
    // Stop if no parking was selected
    if(! selectedParkingId) return;
    if(! slider) return;

    // Find index of selected parking
    const idx = findParkingIndex(visibleParkings, selectedParkingId);
    slider.current.moveToIdx(idx);
  }, [selectedParkingId]);

  const sliderProps = {
    slides: {
      perView: typeof window !== 'undefined' ? (window.innerWidth / 315) : 1.3,// slides are 315px in width
      spacing: 15,
    },
    dragStarted(event) {
    },
    dragEnded(event) {
      const index: number = event.track.details.abs;
      slideChangedHandler(index)
    },
    slideChanged(event) {
    }
  }

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(sliderProps);

  const expandParking = (id: string) => {
    // Set active parking ID
    // dispatch(setSelectedParkingId(id));
  };

  const clickParking = (id: string) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    dispatch(setSelectedParkingId(id));

    onShowStallingDetails && onShowStallingDetails(id);
  };

  const slideChangedHandler = (index: number) => {
    // Find related parking
    const foundParking = fietsenstallingen[index];
    dispatch(setSelectedParkingId(foundParking.ID));
  }

  return (
    <div className="card-list">
      <div ref={sliderRef} className={`card-list__slides keen-slider px-5`}>
        {visibleParkings.map((parking, index) => (
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
