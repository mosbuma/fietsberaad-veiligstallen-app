import React, { useEffect } from "react";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import { ParkingDetailsType, ParkingSections } from '~/types';
import { ParkingEditUpdateStructure } from './ParkingEdit';

import {
  getAllFietstypen
} from "~/utils/parkings";
import { fietstypen } from "@prisma/client";

export type CapaciteitType = { ID: string, Name: string };

export type capacitydata = {
  unknown: boolean;
  total: number;
  detailed: {
    [key: string]: { // fietstype
      Toegestaan: boolean;
      Capaciteit: number;
    }
  };
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

          const item = capacity.detailed[name];
          if (item) {
            item.Toegestaan = item.Toegestaan || data.Toegestaan !== null && data.Toegestaan;
            item.Capaciteit += data.Capaciteit || 0;
            capacity.total += data.Capaciteit || 0;
          }
        });
      });
    }

    return capacity;
  } catch (e: any) {
    console.error("getCapacityDataForParking - error:", e.message);
    return null;
  }
};

const getCapacityForFietstype = (fietstypeName: string, capacitydata: capacitydata | null, localChanges: ParkingSections | undefined) => {
  if (!capacitydata) return 0;

  // console.log("**** GC", JSON.stringify(localChanges, null, 2));

  // First, check if we have the value in our local changes
  if (localChanges) {
    let foundRelated = undefined;
    if (localChanges.length > 0 && localChanges[0] !== undefined) {
      foundRelated = localChanges[0].secties_fietstype.filter((x) => {
        return x.fietstype.Name === fietstypeName;
      }).pop();
      if (foundRelated) {
        return Number(foundRelated.Capaciteit);
      }
    }
  }

  // If not, get the original value from the database
  const capacityForFietstype = capacitydata.detailed[fietstypeName];
  if (capacityForFietstype && capacityForFietstype.Capaciteit) {
    return Number(capacityForFietstype.Capaciteit);
  }

  return 0;
}

const getAllowedValueForFietstype = (fietstypeName: string, capacitydata: capacitydata | null, localChanges: ParkingSections | undefined): boolean => {
  if (!capacitydata) return false;

  // First, check if we have the value in our local changes
  if (localChanges && localChanges[0]) {
    const foundRelated = localChanges[0].secties_fietstype.filter((x) => {
      return x.fietstype.Name === fietstypeName;
    }).pop();
    if (foundRelated) {
      return foundRelated.Toegestaan || false;
    }
  }

  // If not, get the original value from the database
  const capacityForFietstype = capacitydata.detailed[fietstypeName];
  if (capacityForFietstype && capacityForFietstype.Toegestaan) {
    return true;
  }

  return false;
}

const toggleActive = (fietsenstalling_secties: ParkingSections, fietstypeName: string, isActive: boolean): ParkingSections => {
  // It's mandatory to have at least 1 section
  if (!fietsenstalling_secties[0]) return fietsenstalling_secties;
  if (!fietsenstalling_secties[0].secties_fietstype) return fietsenstalling_secties;

  let didUpdateSomething = false;
  // Update the isActive/'Toegestaan' value for the 'fietstype' given
  fietsenstalling_secties[0].secties_fietstype =
    fietsenstalling_secties[0].secties_fietstype.map(x => {
      if (x.fietstype.Name === fietstypeName) {
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

  if (!didUpdateSomething) {
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

const handleCapacityChange = (fietsenstalling_secties: ParkingSections, fietstypeName: any, amountstr: string): ParkingSections => {
  // It's mandatory to have at least 1 section
  if (!fietsenstalling_secties) return fietsenstalling_secties;
  if (!fietsenstalling_secties[0]) return fietsenstalling_secties;
  if (!fietsenstalling_secties[0].secties_fietstype) return fietsenstalling_secties;

  // check for valid amount
  let amount = 0
  try {
    amount = parseInt(amountstr);
  } catch (e) {
    console.error("handleCapacityChange - amount is not a number");
    return fietsenstalling_secties;
  }

  let didUpdateSomething = false;
  // Update the isActive/'Toegestaan' value for the 'fietstype' given
  fietsenstalling_secties[0].secties_fietstype =
    fietsenstalling_secties[0].secties_fietstype.map(x => {
      if (x.fietstype.Name === fietstypeName) {
        didUpdateSomething = true;
      }
      // Update 'Toegestaan' value if needed
      return {
        Capaciteit: x.fietstype.Name === fietstypeName ? amount : x.Capaciteit,
        fietstype: x.fietstype,
        Toegestaan: x.Toegestaan
      }
    });

  if (!didUpdateSomething) {
    // If above script didn't update a value, we should add this fietstypeName
    const newObject = {
      Toegestaan: false,
      Capaciteit: amount,
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
  update: ParkingEditUpdateStructure
}) => {
  // Variable to store the 'alle fietstypen' response
  const [allFietstypen, setAllFietstypen] = React.useState<fietstypen[]>([]);

  // Set 'allFietstypen' local state
  React.useEffect(() => {
    (async () => {
      const result = await getAllFietstypen();
      setAllFietstypen(result);
    })();
  }, [])


  const capacitydata = calculateCapacityData(parkingdata);

  let content = null;
  if (capacitydata === null || capacitydata?.unknown) {
    content = "Onbekend";
  } else if (capacitydata.detailed === null || Object.keys(capacitydata.detailed).length === 0) {
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
          if (x.Name === null) {
            console.warn('Fietstype has no name', x);
            return null;
          }

          const capacity = getCapacityForFietstype(x.Name, capacitydata, update.fietsenstalling_secties);
          const isAllowed = getAllowedValueForFietstype(x.Name, capacitydata, update.fietsenstalling_secties);
          return <React.Fragment key={x.ID}>
            <div className="col-span-2 flex flex-col justify-center">
              {x.Name}
            </div>
            <div className="flex flex-col justify-center">
              <FormInput
                type="number"
                defaultValue={capacity}
                size={4}
                onChange={(e) => {
                  console.log("**** PDFS", JSON.stringify(parkingdata.fietsenstalling_secties, null, 2));
                  const newFietsenstallingSecties = handleCapacityChange(parkingdata.fietsenstalling_secties, x.Name, e.target.value);
                  const getNewCapacity = () => {
                    let newCapacity = parkingdata;
                    newCapacity.fietsenstalling_secties = newFietsenstallingSecties;
                    return newCapacity;
                  };
                  capaciteitChanged(getNewCapacity().fietsenstalling_secties)
                }}
                style={{ width: '100px' }}
              />
            </div>
            <div className=" flex flex-col justify-center">
              <FormCheckbox
                defaultChecked={isAllowed}
                onChange={(e) => {
                  if (null === parkingdata.fietsenstalling_secties) return;
                  if (null === x.Name) return;

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
