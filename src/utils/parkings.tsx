import React from "react";
import { Session } from "next-auth";
import { reverseGeocode } from "~/utils/nomatim";


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
    if (response.status !== 200) {
      console.error("getParkingDetails - request failed with status", response.status);
      return null;
    }
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
  const hoursopen = tmpopen.getHours() - 1;//TODO
  const minutesopen = String(tmpopen.getMinutes()).padStart(2, "0");

  const tmpclose: Date = new Date(parkingdata[getDichtTimeKey(day)]);
  const hoursclose = tmpclose.getHours() - 1;//TODO
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


export const getDefaultLocation = (): string => {
  return '52.09066,5.121317'
}

const determineNewStatus = (session: Session | null): "1" | "aanm" => {
  if (session === null || !session.user || !session.user.OrgUserID) {
    return "aanm";
  } else {
    return "1";
  }
}

export const createNewStalling = async (session: Session | null, currentLatLong: string[]): Promise<string | undefined> => {
  const data = await getNewStallingDefaultRecord(determineNewStatus(session), currentLatLong)
  const result = await fetch(
    "/api/fietsenstallingen",
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

  if (result.status === 201) {
    const newstalling = await result.json();
    return newstalling.ID;
  } else {
    console.error("unable to create new stalling - code ", result.status);
    return undefined;
  }
};


export const getNewStallingDefaultRecord = async (Status: string, latlong?: string[] | undefined): Promise<Partial<fietsenstallingen>> => {
  let Location = "";
  let Postcode = "";
  let Plaats = "";
  let Title = "Nieuwe Stalling"

  if (undefined !== latlong) {
    let address = await reverseGeocode(latlong.toString());
    if (address && address.address) {
      Location = ((address.address.road || "---") + " " + (address.address.house_number || "")).trim();
      Postcode = address.address.postcode || "";
      Plaats = address.address.city || address.address.town || address.address.village || address.address.quarter || "";
      Title = "Nieuwe stalling " + (Location + " " + Plaats).trim();
    }
  }


  const data: Partial<fietsenstallingen> = {
    ID: generateRandomId(''),
    Status,
    Title,
    Location,
    Postcode,
    Plaats,
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
    SiteID: "",
    DateCreated: new Date(),
    DateModified: new Date(),
    ExploitantID: "",
  }

  return data
}

export default generateRandomId;