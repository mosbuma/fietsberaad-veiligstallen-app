import React from "react";
import { formatOpeningTimes } from "~/utils/parkings";

import SectionBlock from "~/components/SectionBlock";
import HorizontalDivider from "~/components/HorizontalDivider";

const ParkingViewOpening = ({ parkingdata }: { parkingdata: any }) => {
  return (
    <>
      <SectionBlock
        heading="Openingstijden"
        contentClasses="grid grid-cols-2"
      >
        {formatOpeningTimes(parkingdata, 2, "ma", "Maandag")}
        {formatOpeningTimes(parkingdata, 3, "di", "Dinsdag")}
        {formatOpeningTimes(parkingdata, 4, "wo", "Woensdag")}
        {formatOpeningTimes(parkingdata, 5, "do", "Donderdag")}
        {formatOpeningTimes(parkingdata, 6, "vr", "Vrijdag")}
        {formatOpeningTimes(parkingdata, 0, "za", "Zaterdag")}
        {formatOpeningTimes(parkingdata, 1, "zo", "Zondag")}
        {parkingdata.Openingstijden !== "" && (
          <div className="col-span-2">
            <div>
              <br />
              <div dangerouslySetInnerHTML={{__html: parkingdata.Openingstijden}} />
            </div>
          </div>
        )}
      </SectionBlock>
      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewOpening;
