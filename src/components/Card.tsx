import React from "react";
import "keen-slider/keen-slider.min.css";

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
      className="keen-slider__slide flex flex-col rounded-lg bg-white p-4"
    >
      <div className="mb-2 text-lg font-bold">{title}</div>
      <p className="card__description">{description}</p>
    </div>
  );
};

export default Card;
