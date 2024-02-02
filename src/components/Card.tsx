import React from "react";
import "keen-slider/keen-slider.min.css";
import CardStyles from './Card.module.css';
import { type vsFietsenstallingen } from "~/utils/prisma";

import ParkingFacilityBlock from './ParkingFacilityBlock';

export interface CardData {
  ID: string;
  title: string;
  description: string;
  parking: vsFietsenstallingen;
}

interface Props extends CardData {
  compact: true,
  expandParking: (id: string) => void,
  clickParking?: (id: string) => void,
  showButtons?: boolean
}

const Card: React.FC<Props> = ({
  parking,
  compact,
  expandParking,
  clickParking,
  showButtons = false
}) => {
  return (
    <div
      key={"card-" + parking.ID}
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
