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

const Card: React.FC<Props> = ({ title, description, ID }) => {
  return (
    <div
      key={"card-" + title}
      className={`
        ${CardStyles.base}
        keen-slider__slide
        flex
        flex-col
        rounded-lg
        bg-white
        p-4
      `}
    >
      <ParkingFacilityBlock
        parking={{
          ID: ID,
          Title: title,
          Plaats: description,
          Status: '24 uur geopend'
        }}
      />
    </div>
  );
};

export default Card;
