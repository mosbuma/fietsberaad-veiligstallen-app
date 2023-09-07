import React, {useEffect, useState} from "react";

import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import SectionBlock from "~/components/SectionBlock";

const ParkingViewAbonnementen = ({ parkingdata }: { parkingdata: any }) => {

  
  if(!parkingdata.abonnementsvorm_fietsenstalling || parkingdata.abonnementsvorm_fietsenstalling.length === 0) {
    return null;
  }

  return (
    <>
      <SectionBlock heading="Abonnementen">
        <div className="ml-2 grid grid-cols-3">
          {parkingdata.abonnementsvorm_fietsenstalling.map((x) => {
            return <>
              <div className="col-span-2">{x.abonnementsvormen.naam}</div>
              <div className="text-right sm:text-center">&euro;{x.abonnementsvormen.prijs.toLocaleString('nl-NL')}</div>
            </>
          })}
          <div className="text-right sm:text-center">
            <Button className="mt-4" onClick={() => {
              window.open('https://veiligstallen.nl/utrecht/abonnement', '_blank');
            }}>
              Koop abonnement
            </Button>
          </div>
        </div>
      </SectionBlock>

      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewAbonnementen;
