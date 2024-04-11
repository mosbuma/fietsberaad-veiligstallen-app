import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";

import {
  getAllServices
} from "~/utils/parkings";

export type ServiceType = { ID: string, Name: string };

const ParkingViewServices = ({ parkingdata }: { parkingdata: any }) => {
  const [allServices, setAllServices] = React.useState<ServiceType[]>([]);

  // Set 'allServices' variable in local state
  React.useEffect(() => {
    (async () => {
      const result = await getAllServices();
      setAllServices(result);
    })();
  }, [])

  const serviceIsActive = (ID: string): boolean => {
    for (const x of parkingdata.fietsenstallingen_services) {
      if (x.services.ID === ID) {
        return true;
      }
    }

    return false;
  }

  if (parkingdata.fietsenstallingen_services === null || parkingdata.fietsenstallingen_services === undefined) {
    return null
  }

  const activeServices = allServices && allServices.filter((service: any) => serviceIsActive(service.ID)) || [];
  if (activeServices.length === 0) {
    // dont show services header if there are none
    return null;
  }


  return <>
    <SectionBlock heading="Services">
      <div className="flex-1" key={'services' + parkingdata.ID}>
        {allServices && allServices.map(service => {
          if (!serviceIsActive(service.ID)) return null;
          return (
            <div key={service.ID}>
              {service.Name}
            </div>
          );
        })}
      </div>
    </SectionBlock>
    <HorizontalDivider className="my-4" />
  </>
};

export default ParkingViewServices;
