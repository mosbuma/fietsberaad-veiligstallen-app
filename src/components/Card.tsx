// @ts-nocheck

import React from "react";
import "keen-slider/keen-slider.min.css";
import CardStyles from './Card.module.css';

import ParkingFacilityBlock from './ParkingFacilityBlock';
import { type ParkingDetailsType } from "~/types/parking";

export interface CardData {
  ID: string;
  title: string;
  description: string;
}

const Card: React.FC<CardData> = ({
  parking,
  compact = true,
  expandParking,
  clickParking,
  showButtons = false
}: {
  parking: ParkingDetailsType,
  compact: boolean,
  expandParking?: () => void,
  clickParking?: () => void,
  showButtons: boolean
}) => {
  return (
    <div
      key={`card-${parking.ID}`}
      className={`
        ${CardStyles.base}
        keen-slider__slide
        flex
        flex-col
        rounded-lg
      `}
    >
      <ParkingFacilityBlock
        parking={parking}
        key={parking.ID}
        compact={compact}
        showButtons={showButtons}
        expandParkingHandler={expandParking}
        openParkingHandler={clickParking}
      />
    </div>
  );
};

export default Card;
