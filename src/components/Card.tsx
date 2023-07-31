// @ts-nocheck

import React from "react";
import "keen-slider/keen-slider.min.css";
import CardStyles from './Card.module.css';

import ParkingFacilityBlock from './ParkingFacilityBlock';

export interface CardData {
  ID: string;
  title: string;
  description: string;
}

interface Props extends CardData {}

const Card: React.FC<Props> = ({
  parking,
  isActive,
  expandParking,
  clickParking
}) => {
  return (
    <div
      key={"card-" + parking.title}
      className={`
        ${CardStyles.base}
        keen-slider__slide
        flex
        flex-col
        rounded-lg
        bg-white
      `}
    >
      <ParkingFacilityBlock
        parking={parking}
        key={parking.ID}
        compact={true}
        expandParkingHandler={expandParking}
        openParkingHandler={clickParking}
      />
    </div>
  );
};

export default Card;
