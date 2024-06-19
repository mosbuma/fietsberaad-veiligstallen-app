import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import SectionBlock from "~/components/SectionBlock";
import { ParkingDetailsType } from "~/types";

const ParkingViewAbonnementen = ({ parkingdata }: { parkingdata: ParkingDetailsType }) => {

  // if(!parkingdata.abonnementsvorm_fietsenstalling || parkingdata.abonnementsvorm_fietsenstalling.length === 0) {
  //   return null;
  // }

  const activeMunicipalityInfo = useSelector(
    (state: any) => state.map.activeMunicipalityInfo
  );

  // console.log('activeMunicipalityInfo', activeMunicipalityInfo);
  // parkingdata.abonnementsvorm_fietsenstalling.map(x => console.log('abonnement', x));
  // console.log("abonnementsvormen", JSON.stringify(parkingdata.abonnementsvorm_fietsenstalling, null, 2));

  return (
    <>
      <SectionBlock heading="Abonnementen">
        <div className="ml-2 grid grid-cols-3">
          {(parkingdata.abonnementsvorm_fietsenstalling) ? parkingdata.abonnementsvorm_fietsenstalling.map((x) => {
            // console.log('abonnement', JSON.stringify(x, null, 2));
            return <Fragment key={x.abonnementsvormen.naam}>
              <div className="col-span-2">{x.abonnementsvormen.naam}</div>
              <div className="text-right sm:text-center">&euro;{x.abonnementsvormen.prijs?.toLocaleString('nl-NL') || "---"}</div>
            </Fragment>
          }) : <></>}
          {((parkingdata.abonnementsvorm_fietsenstalling && parkingdata.abonnementsvorm_fietsenstalling.length > 0)) ?
            <div className="text-right sm:text-center">
              <Button className="mt-4" onClick={() => {
                window.open(`https://veiligstallen.nl/${activeMunicipalityInfo ? activeMunicipalityInfo.UrlName : 'utrecht'}/abonnement`, '_blank');
              }}>
                Koop abonnement
              </Button>
            </div >
            :
            <div className="text-start col-span-3">
              Geen abonnementen beschikbaar
            </div>}
        </div>
      </SectionBlock >

      <HorizontalDivider className="my-4" />
    </>
  );
};

export default ParkingViewAbonnementen;
