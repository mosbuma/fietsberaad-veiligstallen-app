import React from "react";

import SectionBlock from "~/components/SectionBlock";
import HorizontalDivider from "~/components/HorizontalDivider";

const ParkingViewOpening = ({ parkingdata }: { parkingdata: any }) => {
  const formatOpening = (
    dayidx: number,
    day: string,
    label: string
  ): React.ReactNode => {
    const wkday = new Date().getDay();

    let value = '?';
    if(parkingdata["Open_" + day]) {
      const tmpopen: Date = new Date(Date.parse(parkingdata["Open_" + day]));
    
      // NB: times are stored as UTC times (no timezone offset)
      const hoursopen = tmpopen.getUTCHours();
      const minutesopen = String(tmpopen.getUTCMinutes()).padStart(2, "0");

      const tmpclose: Date = new Date(Date.parse(parkingdata["Dicht_" + day]));
      const hoursclose = tmpclose.getUTCHours();
      const minutesclose = String(tmpclose.getUTCMinutes()).padStart(2, "0");

      value = `${hoursopen}:${minutesopen} - ${hoursclose}:${minutesclose}`;
  
      if(hoursopen===0 && minutesopen==='00' && hoursclose===0 && minutesclose==='00') {
        value= 'gesloten' 
      } else {
        let diff = Math.abs((tmpclose.getTime() - tmpopen.getTime()) / 1000);
        if(diff>=86340 || diff===0) {
          value = '24h'
        }
      }
    }

    return (
      <>
        <div className={wkday + 1 === dayidx ? "font-bold" : ""}>{label}</div>
        <div className={"text-right" + (wkday + 1 === dayidx ? " font-bold" : "")}>
          {value}
        </div>
      </>
    );
  };

  return (
    <>
      <SectionBlock
        heading="Openingstijden"
        contentClasses="grid grid-cols-2"
      >
        {formatOpening(2, "ma", "Maandag")}
        {formatOpening(3, "di", "Dinsdag")}
        {formatOpening(4, "wo", "Woensdag")}
        {formatOpening(5, "do", "Donderdag")}
        {formatOpening(6, "vr", "Vrijdag")}
        {formatOpening(0, "za", "Zaterdag")}
        {formatOpening(1, "zo", "Zondag")}
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
