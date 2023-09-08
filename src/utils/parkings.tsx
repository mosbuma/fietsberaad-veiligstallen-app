import React from "react";
import {
  type fietsenstallingen,
} from "@prisma/client";
import type { ParkingDetailsType, DayPrefix } from "~/types/";

export const parkingTypes: string[] = [
  "buurtstalling",
  "fietskluizen",
  "bewaakt",
  "fietstrommel",
  "toezicht",
  "onbewaakt",
  "geautomatiseerd",
  "unknown",
];

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
    const response = await fetch(`/api/parking?stallingid=${stallingId}`);
    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error("getParkingDetails - error: ", error.message);
    return null;
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
  label: string
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
  if(diff>=86340) {
    value = '24h'
  }

  return (
    <>
      <div className={wkday + 1 === dayidx ? "font-bold" : ""}>{label}</div>
      <div className="text-right">{value}</div>
    </>
  );
};
