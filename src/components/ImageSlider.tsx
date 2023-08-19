// @ts-nocheck

import React, { useState } from 'react';
import Image from 'next/image';
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const ImageSlider = ({
  images
}, {
  images: Array
}) => {
  // const [ref] = useKeenSlider<HTMLDivElement>({
  //   slides: {
  //     perView: 3,
  //     spacing: 15,
  //   },
  // });

  if(!images) {
    return <></>;
  }

  return (
    <div className="card-list">
      {/*<div ref={ref} className="card-list__slides keen-slider">*/}
      <div className="card-list__slides keen-slider">
        {images.map((imgUrl) => <Image
          src={`https://static.veiligstallen.nl/library/fietsenstallingen/${imgUrl}`}
          alt="Image 1"
          width={203}
          height={133}
          className="keen-slider__slide mr-3 rounded-lg"
        />)}
      </div>
    </div>
  );
};

export default ImageSlider;
