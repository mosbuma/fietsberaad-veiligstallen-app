import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

const ParkingViewServices = ({ parkingdata }: { parkingdata: any }) => {
  if(parkingdata.ExtraServices===null||parkingdata.ExtraServices===undefined) {
    return null
  } 
  
    return (
      <>
          <SectionBlock heading="Services">
            <div className="flex-1">
              <div>
                { parkingdata.ExtraServices.split(',').map((service: string) => (
                  <p>{service}</p>
                ))}
              </div>
            </div>
          </SectionBlock>

          <HorizontalDivider className="my-4" />
      </>
    )
    ;
};

export default ParkingViewServices;
