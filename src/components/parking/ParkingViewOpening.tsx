import React from "react";
import { formatOpeningTimes } from "~/utils/parkings";

import SectionBlock from "~/components/SectionBlock";
import HorizontalDivider from "~/components/HorizontalDivider";

const ParkingViewOpening = ({ parkingdata }: { parkingdata: any }) => {
  if (parkingdata.Openingstijden !== null && parkingdata.Openingstijden.indexOf("\n") > -1) {
    parkingdata.Openingstijden = parkingdata.Openingstijden.replace("\n", "<br />");
  }

  const isNS = parkingdata.EditorCreated === "NS-connector";

  return (
    <>
      <SectionBlock
        heading="Openingstijden"
        contentClasses="grid grid-cols-2"
      >
        {formatOpeningTimes(parkingdata, 2, "ma", "Maandag", isNS)}
        {formatOpeningTimes(parkingdata, 3, "di", "Dinsdag", isNS)}
        {formatOpeningTimes(parkingdata, 4, "wo", "Woensdag", isNS)}
        {formatOpeningTimes(parkingdata, 5, "do", "Donderdag", isNS)}
        {formatOpeningTimes(parkingdata, 6, "vr", "Vrijdag", isNS)}
        {formatOpeningTimes(parkingdata, 0, "za", "Zaterdag", isNS)}
        {formatOpeningTimes(parkingdata, 1, "zo", "Zondag", isNS)}
        {parkingdata.Openingstijden !== "" && (
          <div className="col-span-2">
            <div>
              <br />
              <div dangerouslySetInnerHTML={{ __html: parkingdata.Openingstijden }} />
            </div>
          </div>
        )}
      </SectionBlock>
      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewOpening;
