export const getMunicipalityBasedOnCbsCode = async (cbsCode: number) => {
  if(! cbsCode) return;

  const response = await fetch(`/api/contacts?cbsCode=${cbsCode}`);
  return response.json();
};

export const getMunicipalityBasedOnUrlName = async (urlName: string) => {
  if(! urlName) {
    console.log('No urlName given');
    return;
  }

  try {
    const response = await fetch(`/api/contacts?urlName=${urlName}`);
    return response.json();

    return json;
  } catch (err) {
    // console.error('err', err)
  }
}
