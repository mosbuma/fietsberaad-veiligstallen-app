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

export const parkingType2Text = (type: string): string => {
  let result = "";
  switch (type) {
    case "fietstrommel":
      result = "Fietstrommel";
      break;
    case "fietskluizen":
      result = "Fietskluizen";
      break;
    case "buurtstalling":
      result = "Buurtstalling";
      break;
    case "bewaakt":
      result = "Bewaakt stalling";
      break;
    case "onbewaakt":
      result = "Onbewaakt";
      break;
    case "toezicht":
      result = "Toezicht";
      break;
    case "geautomatiseerd":
      result = "Geautomatiseerd";
      break;
    default:
      result = `onbekend type ${type}`;
  }
  return result;
};
