import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewBeheerder = ({ parkingdata }: { parkingdata: any }) => {
  // console.log("### ParkingViewBeheerder", parkingdata, parkingdata.Exploitant, parkingdata.Beheerder, parkingdata.BeheerderContact);
  if (parkingdata.FMS === true) {
    return <SectionBlock heading="Beheerder">FMS</SectionBlock>;
  }  else if(parkingdata?.exploitant) {
    return (
      <SectionBlock heading="Beheerder">
      <a href={'mailto:'+parkingdata.exploitant.Helpdesk}>{parkingdata.exploitant.CompanyName}</a>
      </SectionBlock>
    )
  } else if(parkingdata.BeheerderContact !== null) {
    return (
      <SectionBlock heading="Beheerder">
        <a href={parkingdata.BeheerderContact}>{parkingdata.Beheerder === null ? 'contact' : parkingdata.Beheerder}</a>
      </SectionBlock>
      );
  } else {
    return null
  }
};

export default ParkingViewBeheerder;
