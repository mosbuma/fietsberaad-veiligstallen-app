import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import { ParkingDetailsType } from '~/types';
  
import {
  getAllFietstypen
} from "~/utils/parkings";

type capacitydata = {
  unknown: boolean;
  total: number;
  detailed: { [key: string]: {
    Toegestaan: boolean;
    Capaciteit: number;
  } };
};

const calculateCapacityData = (parking: ParkingDetailsType): capacitydata | null => {
  try {
    let capacity: capacitydata = {
      unknown: false,
      total: 0,
      detailed: {},
    };

    if (parking === null || parking.Capacity === 0) {
      capacity.unknown = true;
    } else {
      // Get parking section (new: 1 per parking, to make it easy)
      parking.fietsenstalling_secties.forEach((sectie) => {
        // Get capactity per modality for this parking section
        sectie.secties_fietstype.forEach(data => {
          const name = data.fietstype.Name;
          if (name in capacity.detailed === false) {
            capacity.detailed[name] = {
              Toegestaan: false,
              Capaciteit: 0,
            }
          }

          capacity.detailed[name].Toegestaan = capacity.detailed[name].Toegestaan || data.Toegestaan!==null && data.Toegestaan;
          capacity.detailed[name].Capaciteit += data.Capaciteit||0;
          capacity.total += data.Capaciteit||0;
        });
      });
    }

    return capacity;
  } catch (e: any) {
    console.error("getCapacityDataForParking - error:", e.message);
    return null;
  }
};

const getCapacityForFietstype = (fietstypeName, capacitydata) => {
  if(! fietstypeName) return 0;
  if(! capacitydata || ! capacitydata.detailed) return 0;

  const capacityForFietstype = capacitydata.detailed[fietstypeName];
  if(capacityForFietstype && capacityForFietstype.Capaciteit) {
    return capacityForFietstype.Capaciteit;
  }

  return 0;
}

const getAllowedValueForFietstype = (fietstypeName, capacitydata) => {
  if(! fietstypeName) return 0;
  if(! capacitydata || ! capacitydata.detailed) return 0;

  const capacityForFietstype = capacitydata.detailed[fietstypeName];
  if(capacityForFietstype && capacityForFietstype.Toegestaan) {
    return true;
  }

  return false;
}

const ParkingEditCapaciteit = ({ parkingdata }: { parkingdata: ParkingDetailsType }) => {
  const [allFietstypen, setAllFietstypen ] = React.useState<Fietstype[]>([]); 

  // Set 'allServices' variable in local state
  React.useEffect(() => {
    (async () => {
      const result = await getAllFietstypen();
      setAllFietstypen(result);
      console.log('result', result)
    })();
  },[])

  let content = null;

  const capacitydata = calculateCapacityData(parkingdata);
  console.log("#### capacitydata", capacitydata, parkingdata);

  if (capacitydata===null || capacitydata?.unknown) {
    content = "Onbekend";
  } else if (capacitydata.detailed===null || Object.keys(capacitydata.detailed).length === 0) {
    content = (
      <>
        <div className="">{parkingdata.Capacity}</div>
        <div className="text-right"></div>
      </>
    );
  }
  else {
    content = Object.keys(capacitydata.detailed).map(key => {
      const detail = capacitydata.detailed[key];
      if (detail === undefined) {
        return null;
      } else if (detail.Toegestaan === false) {
        return (
          <>
            <div className="">{key}</div>
            <div className="text-right">Niet toegestaan</div>
          </>
        );
      } else if ((detail.Capaciteit || 0) > 0) {
        return (
          <>
            <div className="">{key}</div>
            <div className="text-right">{detail.Capaciteit}</div>
          </>
        );
      } else {
        return null;
      }
    });
  }

  return (
    <>
      <div className="ml-2 grid grid-cols-4">
        {allFietstypen.map(x => {
          const capacity = getCapacityForFietstype(x.Name, capacitydata);
          const isAllowed = getAllowedValueForFietstype(x.Name, capacitydata);
          return <React.Fragment key={x.ID}>
            <div className="col-span-2 flex flex-col justify-center">
              {x.Name}
            </div>
            <div className=" flex flex-col justify-center">
              <FormInput
                type="number"
                value={capacity}
                size="4"
                style={{width: '100px'}}
              />
            </div>
            <div className=" flex flex-col justify-center">
              <FormCheckbox checked={isAllowed}>
                Toegestaan?
              </FormCheckbox>
            </div>
          </React.Fragment>
        })}
      </div>
    </>
  );
};

export default ParkingEditCapaciteit;
