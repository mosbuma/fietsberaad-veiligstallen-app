import React, { Fragment, useEffect, useState } from "react";
import { fietsenstallingen } from "@prisma/client";

import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import SectionBlock from "~/components/SectionBlock";
import { ParkingDetailsType } from "~/types";

const ParkingViewAbonnementen = ({ parkingdata }: { parkingdata: ParkingDetailsType }) => {

  if (!parkingdata.abonnementsvorm_fietsenstalling || Object.keys(parkingdata.abonnementsvorm_fietsenstalling).length === 0) {
    return null;
  }

  return (
    <>
      <SectionBlock heading="Abonnementen">
        <div className="ml-2 grid grid-cols-3">
          {parkingdata.abonnementsvorm_fietsenstalling.abonnementsvormen.map((x) => {
            return <Fragment key={x.naam}>
              <div className="col-span-2">{x.naam}</div>
              <div className="text-right sm:text-center">&euro;{x.prijs.toLocaleString('nl-NL')}</div>
            </Fragment>
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
