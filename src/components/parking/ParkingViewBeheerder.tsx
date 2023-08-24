import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewBeheerder = ({ parkingdata }: { parkingdata: any }) => {
  if (parkingdata.FMS === true) {
    return <SectionBlock heading="Beheerder">FMS</SectionBlock>;
  } else {
    if (parkingdata.Beheerder === "") {
      return null;
    } else {
      return (
        <SectionBlock heading="Beheerder">{parkingdata.Beheerder}</SectionBlock>
      );
    }
  }
};

export default ParkingViewBeheerder;
