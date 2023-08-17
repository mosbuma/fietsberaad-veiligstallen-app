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

export const findParkingIndex = (parkings, parkingId) => {
  let index = 0, foundIndex;
  parkings.forEach((x) => {
    if(x.ID === parkingId) {
      foundIndex = index;
    }
    index++;
  });
  return foundIndex;
}
