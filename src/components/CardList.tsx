import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardData } from "./Card";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { AppState } from "~/store/store";

import {
  setSelectedParkingId
} from "~/store/mapSlice";

import { MapGeoJSONFeature } from 'maplibre-gl';
import { vsFietsenstallingen } from "~/utils/prisma";


interface Props {
  fietsenstallingen: CardData[];
  cardsPerSlide?: number;
  onShowStallingDetails?: Function;
}

const CardList: React.FC<Props> = ({
  fietsenstallingen,
  cardsPerSlide = 3,
  onShowStallingDetails
}: Props) => {
  const dispatch = useDispatch();

  const [visibleParkingCards, setVisibleParkingCards] = useState<CardData[]>(fietsenstallingen);
  const [isCardListVisible, setIsCardListVisible] = useState<boolean>(true);

  const mapVisibleFeatures: MapGeoJSONFeature[] = useSelector(
    (state: AppState) => state.map.visibleFeatures
  );

  const selectedParkingId = useSelector(
    (state: AppState) => state.map.selectedParkingId
  );

  const mapExtent = useSelector((state: AppState) => state.map.extent);

  // If mapVisibleFeatures change: Filter parkings
  useEffect(() => {
    if (!fietsenstallingen) return;
    if (!mapVisibleFeatures) return;

    const allParkings = fietsenstallingen;
    const visibleParkingIds = mapVisibleFeatures.map(x => x.id);
    // Only keep parkings that are visible on the map
    const filtered = allParkings.filter((x) => visibleParkingIds.indexOf(x.ID) > -1);
    // Set filtered parkings into a state variable
    setVisibleParkingCards(filtered);
  }, [
    fietsenstallingen,
    mapVisibleFeatures.length
  ])

  // If map extent changes: Move to correct parking slide if needed
  useEffect(() => {
    if (!visibleParkingCards) return;

    // After map update: Is selectedParkingId still visible? If so: Slide to parking card
    let isSelectedParkingStillVisible = false, selectedParkingIndex: number;
    visibleParkingCards.forEach((x, idx) => {
      if (x.ID === selectedParkingId) {
        isSelectedParkingStillVisible = true;
        selectedParkingIndex = idx;
      }
    });

    // Wait 50 ms so that the map flyTo animation is fully done before sliding to the right card
    setTimeout(() => {
      // Check if slider (still) exists
      if (!slider || !slider.current) return;
      // Slide to card
      const cardToSlideTo = isSelectedParkingStillVisible ? selectedParkingIndex : 0;
      slider.current.update(sliderProps, cardToSlideTo);
    }, 50)
  }, [
    mapExtent,
    visibleParkingCards
  ])

  // Scroll to selected parking if selected parking changes
  // useEffect(() => {
  //   // Stop if no parking was selected
  //   if(! selectedParkingId) return;
  //   if(! slider) return;

  //   // Find index of selected parking
  //   // Move to current slide, but wait on the flyTo animation first.
  //   // curve: 1 & speed: 0.2 => 1*0.2 = 0.2s
  //   if(selectedParkingId) {
  //     const idx = findParkingIndex(visibleParkingCards, selectedParkingId);
  //     slider.current.moveToIdx(idx);
  //   }
  // }, [selectedParkingId]);

  const sliderProps = {
    slides: {
      perView: typeof window !== 'undefined' ? (window.innerWidth / 315) : 1.3,// slides are 315px in width
      spacing: 15,
    },
    dragStarted() {
    },
    dragEnded() {
    },
    animationEnded() {
    },
    slideChanged() {
      // We don't use this below, as we navigate to the Parking on first tap
      // const index: number = event.track.details.abs;
      // slideChangedHandler(index)
    }
  }

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(sliderProps);

  const expandParking = (id: string) => {
    // Set active parking ID
    dispatch(setSelectedParkingId(id));
  };

  const clickParking = (id: string) => {
    // Set URL
    // window.history.replaceState(null, document.title, `/stalling/${id}`); // Only change URL
    // push(`/stalling/${id}`);// Redirect

    // Set active parking ID
    dispatch(setSelectedParkingId(id));

    onShowStallingDetails && onShowStallingDetails(id);
  };

  // const slideChangedHandler = (index: number) => {
  //   // Find related parking
  //   const foundParking = fietsenstallingen[index];
  //   if (foundParking) {
  //     dispatch(setSelectedParkingId(foundParking.ID));
  //   }
  // }

  return (
    <div className={`
      card-list
      transition-opacity
      ${isCardListVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      <div ref={sliderRef} className={`card-list__slides keen-slider px-5`}>
        {visibleParkingCards.map((parkingcard, index) => {
          return (
            <Card
              key={"c-" + parkingcard.ID}
              parking={parkingcard.parking}
              compact={true}
              showButtons={selectedParkingId === parkingcard.ID}
              expandParking={expandParking}
              clickParking={clickParking}
              ID={""}
              title={""}
              description={""}
            />
          )
        })}
      </div>
    </div>
  );
};

export default CardList;
