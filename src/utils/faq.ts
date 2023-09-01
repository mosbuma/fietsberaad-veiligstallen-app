export const getFaqSections = async (siteId: string) => {
  try {
    if(! siteId) return;

    const response = await fetch(`/api/faq?siteId=${siteId}`);
    return await response.json();

    return json;
  } catch (err) {
    console.error('err', err)
  }
}
