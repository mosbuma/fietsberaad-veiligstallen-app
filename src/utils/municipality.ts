export const getMunicipalityBasedOnCbsCode = async (cbsCode: number) => {
  if(! cbsCode) return;

  const response = await fetch(`/api/contacts?cbsCode=${cbsCode}`);
  const json = await response.json();
  return json[0];
};

export const getMunicipalityBasedOnUrlName = async (urlName: string) => {
  if(! urlName) {
    console.log('No urlName given');
    return;
  }

  try {
    const response = await fetch(`/api/contacts?urlName=${urlName}`);
    const json = await response.json();
    return json[0];
  } catch (err) {
    // console.error('err', err)
  }
}

export const getMunicipalities = async () => {
  try {
    const response = await fetch(`/api/contacts?itemType=organizations`);
    return await response.json();

    return json;
  } catch (err) {
    console.error('err', err)
  }
}
