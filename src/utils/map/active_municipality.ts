let controller: AbortController | undefined;

export type Municipality = {
  "municipality": string,
  "name": string,
  "owner": string | null,
  "zone_id": number,
  "zone_type": string
}

export const getMunicipalityBasedOnLatLng = async (latLng: Array<Number | undefined>): Promise<Municipality | undefined> => {
  // Abort active fetch call, if any
  if (controller) {
    controller.abort("operation replaced by new request");
  }

  // Create AbortController
  controller = new AbortController();
  const signal = controller.signal;

  if (!latLng) {
    console.log('No latLng given');
    return undefined;
  }
  if (!latLng[0] || !latLng[1]) {
    console.log('No correct latLng given. Given: ', latLng);
    return undefined;
  }

  try {
    // Get municipality based on request
    let response = await fetch(
      `https://api.dashboarddeelmobiliteit.nl/dashboard-api/public/get_municipality_based_on_latlng?location=${latLng[0]},${latLng[1]}`,
      { signal }
    )
    let json = await response.json();

    if (json && json.message && json.message === 'No municipality found for these coordinates') {
      console.error(json.message);
      return undefined;
    }

    return json;
  } catch (err) {
    // console.error('unable to fetch municiplaity', err)
    return undefined;
  }
}
