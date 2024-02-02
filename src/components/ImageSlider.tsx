import React, { useState } from 'react';
import Image from 'next/image';
import "keen-slider/keen-slider.min.css";

const ImageSlider = ({
  images
}: {
  images: Array<string | null>
}) => {
  // const [ref] = useKeenSlider<HTMLDivElement>({
  //   slides: {
  //     perView: 3,
  //     spacing: 15,
  //   },
  // });

  if (!images) {
    return <></>;
  }

  const fixurl = (imgUrl: string): string => {
    let newurl;
    if (imgUrl.includes('http')) {
      newurl = imgUrl;
    } else if (imgUrl.includes('[local]')) {
      newurl = imgUrl.substring(7);
    } else {
      newurl = `https://static.veiligstallen.nl/library/fietsenstallingen/${imgUrl}`
    }
    // console.log('got newurl', newurl);
    return newurl;
  }

  return (
    <div className="card-list">
      {/*<div ref={ref} className="card-list__slides keen-slider">*/}
      <div className="card-list__slides keen-slider">
        {images.map((imgUrl, idx) => {
          if (imgUrl === null) {
            return null;
          }

          const url = fixurl(imgUrl);
          return (
            <Image
              key={'img-' + idx}
              src={url}
              alt={"Image " + idx}
              width={203}
              height={133}
              className="keen-slider__slide mr-3 rounded-lg" />
          )
        }
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
