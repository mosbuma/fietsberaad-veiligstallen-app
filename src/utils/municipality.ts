export const getMunicipalityBasedOnCbsCode = async (cbsCode: number) => {
  if(! cbsCode) return;

  const response = await fetch(`/api/contacts?cbsCode=${cbsCode}`);
  return response.json();
};

