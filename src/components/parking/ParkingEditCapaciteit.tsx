import React, {useEffect} from "react";
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

const getAllowedValueForFietstype = (fietstypeName, capacitydata, localChanges) => {
  if(! fietstypeName) return 0;
  if(! capacitydata || ! capacitydata.detailed) return 0;

  // First, check if we have the value in our local changes
  if(localChanges) {
    const foundRelated = localChanges[0].secties_fietstype.filter((x) => {
      return x.fietstype.Name === fietstypeName;
    }).pop();
    if(foundRelated) {
      return foundRelated.Toegestaan;
    }
  }

  // If not, get the original value from the database
  const capacityForFietstype = capacitydata.detailed[fietstypeName];
  if(capacityForFietstype && capacityForFietstype.Toegestaan) {
    return true;
  }

  return false;
}

const toggleActive = (fietsenstalling_secties, fietstypeName, isActive): {
  fietsenstalling_secties: any,
  fietstypeName: String, // 'fietstype'
  isActive: Boolean      // 'Toegestaan'
} => {
  // It's mandatory to have at least 1 section
  if(! fietsenstalling_secties) return fietsenstalling_secties;
  if(! fietsenstalling_secties[0]) return fietsenstalling_secties;
  if(! fietsenstalling_secties[0].secties_fietstype) return fietsenstalling_secties;

  let didUpdateSomething = false;
  // Update the isActive/'Toegestaan' value for the 'fietstype' given
  fietsenstalling_secties[0].secties_fietstype =
    fietsenstalling_secties[0].secties_fietstype.map(x => {
      if(x.fietstype.Name === fietstypeName) {
        didUpdateSomething = true;
      }
      // Update 'Toegestaan' value if needed
      return {
        Capaciteit: x.Capaciteit,
        fietstype: x.fietstype,
        Toegestaan: x.fietstype.Name === fietstypeName
                      ? isActive // Update
                      : x.Toegestaan // Or keep existing value
      }
    });
  
  if(! didUpdateSomething) {
    // If above script didn't update a value, we should add this fietstypeName
    const newObject = {
      Toegestaan: isActive,
      Capaciteit: 0,
      fietstype: {
        Name: fietstypeName
      }
    }
    // Add new object for this fietstype
    fietsenstalling_secties[0].secties_fietstype.push(newObject);
  }

  return fietsenstalling_secties;
}

const ParkingEditCapaciteit = ({
  parkingdata,
  capaciteitChanged,
  update,
}: {
  parkingdata: ParkingDetailsType,
  capaciteitChanged: Function,
  update: any
}) => {
  // Variable to store the 'alle fietstypen' response
  const [allFietstypen, setAllFietstypen ] = React.useState<Fietstype[]>([]);
  // Variable to store changed values in
  const [updated, setUpdated] = React.useState<Fietstype[]>([]); 

  // Set 'allFietstypen' local state
  React.useEffect(() => {
    (async () => {
      const result = await getAllFietstypen();
      setAllFietstypen(result);
    })();
  },[])

  let content = null;

  const capacitydata = calculateCapacityData(parkingdata);
  // console.log("#### update", update);
  // console.log("#### capacitydata", capacitydata, '#### parkingdata', parkingdata);

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
          const isAllowed = getAllowedValueForFietstype(x.Name, capacitydata, update.fietsenstalling_secties);
          return <React.Fragment key={x.ID}>
            <div className="col-span-2 flex flex-col justify-center">
              {x.Name}
            </div>
            <div className="flex flex-col justify-center">
              <FormInput
                type="number"
                value={capacity}
                size="4"
                onChange={() => {}}
                style={{width: '100px'}}
              />
            </div>
            <div className=" flex flex-col justify-center">
              <FormCheckbox
                checked={isAllowed}
                onChange={e => {
                  const newFietsenstallingSecties = toggleActive(parkingdata.fietsenstalling_secties, x.Name, e.target.checked);
                  const getNewCapacity = () => {
                    let newCapacity = parkingdata;
                    newCapacity.fietsenstalling_secties = newFietsenstallingSecties;
                    return newCapacity;
                  };
                  capaciteitChanged(getNewCapacity().fietsenstalling_secties)
                }}
              >
                {isAllowed ? 'Actief' : 'Inactief'}
              </FormCheckbox>
            </div>
          </React.Fragment>
        })}
      </div>
    </>
  );
};

export default ParkingEditCapaciteit;
