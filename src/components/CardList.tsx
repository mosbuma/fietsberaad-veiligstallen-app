import React, { useState } from "react";
import Card, { CardData } from "./Card";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface Props {
  cards: CardData[];
  cardsPerSlide?: number;
}

const CardList: React.FC<Props> = ({ cards, cardsPerSlide = 3 }) => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 3,
      spacing: 15,
    },
  });

  return (
    <div className="card-list">
      <div ref={ref} className="card-list__slides keen-slider">
        {cards.map((card, index) => (
          <Card key={"c-" + card.ID} {...card} />
        ))}
      </div>
    </div>
  );
};

export default CardList;
