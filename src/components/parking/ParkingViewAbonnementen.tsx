import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewAbonnementen = ({ parkingdata }: { parkingdata: any }) => {
  return (
    <>
      <SectionBlock heading="Abonnementen">
        <div className="ml-2 grid grid-cols-3">
          <div className="col-span-2">Jaarbonnement fiets</div>
          <div className="text-right sm:text-center">&euro;80,90</div>
          <div className="col-span-2">Jaarabonnement bromfiets</div>
          <div className="text-right sm:text-center">&euro;262.97</div>
        </div>
      </SectionBlock>
      {/*<button>Koop abonnement</button>*/}
      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewAbonnementen;
