import React from "react";
import { Session } from "next-auth";


import {
  type fietsenstallingen,
} from "@prisma/client";
import type { ParkingDetailsType, DayPrefix } from "~/types/";

export const findParkingIndex = (parkings: fietsenstallingen[], parkingId: string) => {
  let index = 0,
    foundIndex;
  parkings.forEach((x) => {
    if (x.ID === parkingId) {
      foundIndex = index;
    }
    index++;
  });
  return foundIndex;
};

export const getParkingDetails = async (stallingId: string): Promise<ParkingDetailsType | null> => {
  try {
    // const response = await fetch(`/api/parking?stallingid=${stallingId}`);
    const response = await fetch(
      "/api/fietsenstallingen?id=" + stallingId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error("getParkingDetails - error: ", error.message);
    return null;
  }
};

export const getAllServices = async (): Promise<any> => {
  try {
    const response = await fetch(
      `/api/services/`
    );
    const json = await response.json();
    if (!json) return;

    return json;
  } catch (err) {
    console.error("get all services error", err);
  }
};

export const getAllFietstypen = async (): Promise<any> => {
  try {
    const response = await fetch(
      `/api/fietstypen`
    );
    const json = await response.json();
    if (!json) return;

    return json;
  } catch (err) {
    console.error("get all fietstypen error", err);
  }
};

const getOpenTimeKey = (day: DayPrefix): keyof ParkingDetailsType => {
  return ('Open_' + day) as keyof ParkingDetailsType;
}

const getDichtTimeKey = (day: DayPrefix): keyof ParkingDetailsType => {
  return ('Dicht_' + day) as keyof ParkingDetailsType;
}

export const formatOpeningTimes = (
  parkingdata: ParkingDetailsType,
  dayidx: number,
  day: DayPrefix,
  label: string,
  isNS: boolean = false
): React.ReactNode => {
  const wkday = new Date().getDay();

  const tmpopen: Date = new Date(parkingdata[getOpenTimeKey(day)]);
  const hoursopen = tmpopen.getHours();
  const minutesopen = String(tmpopen.getMinutes()).padStart(2, "0");

  const tmpclose: Date = new Date(parkingdata[getDichtTimeKey(day)]);
  const hoursclose = tmpclose.getHours();
  const minutesclose = String(tmpclose.getMinutes()).padStart(2, "0");

  let value = `${hoursopen}:${minutesopen} - ${hoursclose}:${minutesclose}`;

  let diff = Math.abs((tmpclose.getTime() - tmpopen.getTime()) / 1000);

  // Exception for NS parkings: If NS parking AND open from 1am to 1am,
  // then the parking is open 24 hours per day.
  // #TODO: Combine functions with /src/components/ParkingFacilityBlock.tsx
  if (hoursopen === 1 && hoursclose === 1 && diff === 0) {
    if (isNS) {
      value = '24h';
    } else {
      value = 'gesloten';
    }
  }
  else if (diff >= 86340) {
    value = '24h'
  }
  else if (diff === 0) {
    value = 'gesloten'
  }

  return (
    <>
      <div className={wkday + 1 === dayidx ? "font-bold" : ""}>{label}</div>
      <div className="text-right">{value}</div>
    </>
  );
};

const generateRandomChar = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return chars[Math.floor(Math.random() * chars.length)];
}

export const generateRandomId = (prefix = '') => {
  while (prefix.length < 8) {
    prefix += generateRandomChar();
  }

  if (prefix.length > 8) {
    prefix = prefix.substring(0, 8);
  }

  let id = `${prefix}-`;

  // Generate the 'AAAA-AAAA-AAAAAAAAAAAAAAAA' portion
  for (let i = 0; i < 23; i++) {
    if (i === 4 || i === 9) id += '-';
    id += generateRandomChar();
  }

  return id;
}


export const newStallingIDForThisUser = (session?: Session): string | false => {
  if (session?.user?.OrgUserID) {
    return 'NW' + session.user.OrgUserID.substring(2);
  } else {
    return false;
  }
}

export const isNewStallingID = (stallingID: string): boolean => {
  return stallingID.substring(0, 2) === 'NW' || stallingID.substring(0, 8) === 'VOORSTEL';
}

export const getDefaultLocation = (): string => {
  return '52.09066,5.121317'
}

export const getNewStallingDefaultRecord = (ID: string, latlong?: string[] | undefined): ParkingDetailsType => {
  console.log("getNewStallingDefaultRecord", latlong);

  const data: ParkingDetailsType = {
    ID,
    Title: 'Nieuwe stalling',
    Location: "",
    Postcode: "",
    Plaats: "",
    Type: "bewaakt",
    Image: null,
    Open_ma: new Date(0),
    Dicht_ma: new Date(0),
    Open_di: new Date(0),
    Dicht_di: new Date(0),
    Open_wo: new Date(0),
    Dicht_wo: new Date(0),
    Open_do: new Date(0),
    Dicht_do: new Date(0),
    Open_vr: new Date(0),
    Dicht_vr: new Date(0),
    Open_za: new Date(0),
    Dicht_za: new Date(0),
    Open_zo: new Date(0),
    Dicht_zo: new Date(0),
    Openingstijden: "",
    Capacity: 0,
    Coordinaten: latlong ? latlong.join(',') : getDefaultLocation(),
    FMS: false,
    Beheerder: "",
    BeheerderContact: "",
  }

  return data
}

export const getNewStallingRecord = async (session?: Session): Promise<fietsenstallingen | false> => {
  try {
    if (!session) {
      // when no user is logged in, a default stalling record is created
      console.log("NO USER LOGGED IN")
      return getNewStallingDefaultRecord(generateRandomId('VOORSTEL'));
    } else {
      const voorstelid = generateRandomId();
      // for logged in users, the stalling record is fetched from the database
      const response: Response = await fetch(
        "/api/fietsenstallingen?id=" + voorstelid,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        console.log("new stalling does not exist for this user");
        return false; // new stalling does not exist for this user
      }

      let data = await response.json();
      console.log("getNewStallingRecord: got newStallingData", data);
      return data
    }
  } catch (ex) {
    console.error('getNewStallingForUser', ex);
    return false;
  }
}

// export const removeNewStallingForUser = async (session: Session): Promise<boolean> => {
//   try {
//     const data = await getNewStallingRecord(session);
//     if (false === data) {
//       console.warn('removeNewStallingForUser: no new stalling record found for this user');
//       return false;
//     }

//     console.log('removeNewStallingForUser: remove record with ID', data.ID);
//     const response = await fetch(
//       "/api/fietsenstallingen?id=" + data.ID,
//       {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     console.log("delete response", response);
//     return response.status === 200;
//   } catch (ex) {
//     console.error('removeNewStallingForUser: error ', ex);
//     return false;
//   }
// }

// export const finalizeNewStallingForUser = async (session: Session): Promise<boolean> => {
//   const data = await getNewStallingRecord(session);
//   if (false === data) {
//     console.warn('finalizeNewStallingForUser: no new stalling record found for this user');
//     return false;
//   }

//   console.log('got newstalling data record', data);

//   const tempID = data.ID;
//   data.ID = generateRandomId();

//   let response = await fetch(
//     "/api/fietsenstallingen",
//     {
//       method: "POST",
//       body: JSON.stringify(data),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   if (response.status === 201) {
//     const response = await fetch(
//       "/api/fietsenstallingen?id=" + tempID,
//       {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     if (response.status === 200) {
//       return true;
//     } else {
//       alert(`Er is iets misgegaan bij het opslaan van de nieuwe stalling [code 1-${response.status}]. Probeer het later nog eens.`);
//       return false;
//     }
//   } else {
//     alert(`Er is iets misgegaan bij het opslaan van de nieuwe stalling [code 2-${response.status}]. Probeer het later nog eens.`);
//     return false;
//   }
// }


export default generateRandomId;