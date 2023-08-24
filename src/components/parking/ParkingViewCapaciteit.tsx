import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewTarief = ({ parkingdata }: { parkingdata: any }) => {
  return (
    <>
      <SectionBlock heading="Capaciteit">
        <div className="ml-2 grid grid-cols-3">
          <div className="col-span-2">Bromfietsen</div>
          <div className="text-right sm:text-center">32</div>
          <div className="col-span-2">Afwijkende maten</div>
          <div className="text-right sm:text-center">7</div>
          <div className="col-span-2">Elektrische fietsen</div>
          <div className="text-right sm:text-center">19</div>
          <div className="col-span-2">Bakfietsen</div>
          <div className="text-right sm:text-center">12</div>
        </div>
      </SectionBlock>

      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewTarief;
