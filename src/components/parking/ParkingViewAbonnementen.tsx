import React, {useEffect, useState} from "react";

import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import SectionBlock from "~/components/SectionBlock";

const ParkingViewAbonnementen = ({ parkingdata }: { parkingdata: any }) => {
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);

  // Get subscription types for this parking
  useEffect(() => {
    if(! parkingdata || ! parkingdata.ID) return;
    
    (async () => {
      const response = await fetch(`/api/subscription_types_for_parking/?parkingId=${parkingdata.ID}`);
      const subscriptionTypes = await response.json();

      setSubscriptionTypes(subscriptionTypes);
    })();

  }, [parkingdata])

  return (
    <>
      <SectionBlock heading="Abonnementen">
        <div className="ml-2 grid grid-cols-3">
          {subscriptionTypes.map((x) => {
            return <>
              <div className="col-span-2">{x.naam}</div>
              <div className="text-right sm:text-center">&euro;{x.prijs.toLocaleString('nl-NL')}</div>
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
