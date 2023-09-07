import {
  type fietsenstallingen,
} from "@prisma/client";
import { type ParkingDetailsType } from "~/types";

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
