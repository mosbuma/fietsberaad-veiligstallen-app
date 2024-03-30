import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewTarief = ({ parkingdata }: { parkingdata: any }) => {

  const isBetaald = (tariefcode: number): boolean => { return tariefcode === 1; };

  const tariefCode2Text = (tariefcode: number): string => {
    let tariefcodestring: string;

    switch (tariefcode) {
      case 0:
        tariefcodestring = "tariefcode 0";
        break;
      case 1:
        tariefcodestring = "betaald";
        break;
      case 2:
        tariefcodestring = "gratis";
        break;
      case 3:
        tariefcodestring = "weekend gratis";
        break;
      case 4:
        tariefcodestring = "overdag gratis";
        break;
      case 5:
        tariefcodestring = "eerste dag gratis";
        break;
      default:
        tariefcodestring = "";
    }

    return tariefcodestring;
  };

  // console.log("### " + parkingdata.Title + " berekent stallingkosten ###", parkingdata.Tariefcode);

  if (parkingdata.Tariefcode === null) {
    return null;
  }
  return (
    <>
      <SectionBlock heading="Tarief">
        {tariefCode2Text(parkingdata.Tariefcode)}
      </SectionBlock>
      <HorizontalDivider className="my-4" />
    </>
  );

  // <>
  //   <div className="font-bold">Fietsen</div>
  //   <div className="ml-2 grid w-full grid-cols-2">
  //     <div>Eerste 24 uur:</div>
  //     <div className="text-right sm:text-center">gratis</div>
  //     <div>Daarna per 24 uur:</div>
  //     <div className="text-right sm:text-center">&euro;0,60</div>
  //   </div>
  //   <div className="mt-4 font-bold">Bromfietsen</div>
  //   <div className="ml-2 grid w-full grid-cols-2">
  //     <div>Eerste 24 uur:</div>
  //     <div className="text-right sm:text-center">&euro;0,60</div>
  //   </div>
  // </>

};

export default ParkingViewTarief;
