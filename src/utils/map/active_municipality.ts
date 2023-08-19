let controller;

export const getMunicipalityBasedOnLatLng = async (latLng: Array) => {
  // Abort active fetch call, if any
  if(controller) controller.abort();

  // Create AbortController
  controller = new AbortController();
  const signal = controller.signal;

  if(! latLng) {
    console.log('No latLng given');
    return;
  }
  if(! latLng[0] || ! latLng[1]) {
    console.log('No correct latLng given. Given: ', latLng);
    return;
  }

  try {
    // Get municipality based on request
    let response = await fetch(
      `https://api.dashboarddeelmobiliteit.nl/dashboard-api/public/get_municipality_based_on_latlng?location=${latLng[0]},${latLng[1]}`,
      { signal }
    )
    let json = await response.json();

    if(json && json.message && json.message === 'No municipality found for these coordinates') {
      console.error(json.message);
      return;
    }

    return json;
  } catch (err) {
    // console.error('err', err)
  }
}
