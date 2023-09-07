import React from "react";
import HorizontalDivider from "~/components/HorizontalDivider";

import SectionBlock from "~/components/SectionBlock";
import { ParkingDetailsType } from '~/types';
  
type capacitydata = {
    unknown: boolean;
    total: number;
    detailed: { [key: string]: {
        Toegestaan: boolean;
        Capaciteit: number;
    } };
};

const calculateCapacityData = (parking: ParkingDetailsType):capacitydata | null => {
    try {
      let capacity: capacitydata = {
        unknown: false,
        total: 0,
        detailed: {},
      };
  
      if (parking === null || parking.Capacity === 0) {
        capacity.unknown = true;
      } else {
        parking.fietsenstalling_secties.forEach((sectie) => {
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
  

const ParkingViewCapaciteit = ({ parkingdata }: { parkingdata: ParkingDetailsType }) => {
    let content = null;

    const capacitydata = calculateCapacityData(parkingdata);

     // console.log("#### capacitydata", capacitydata, parkingdata);

    if (capacitydata===null || capacitydata?.unknown) {
        content = "Onbekend";
    } else if (capacitydata.detailed===null||Object.keys(capacitydata.detailed).length === 0) {
      content = (
            <>
                <div className="">{parkingdata.Capacity}</div>
                <div className="text-right"></div>
            </>
        );
    } else {
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
      <SectionBlock heading="Capaciteit">
        <div className="grid grid-cols-2">
            {content}
        </div>
      </SectionBlock>

      <HorizontalDivider className="my-4" />
    </>
    );
};

export default ParkingViewCapaciteit;
