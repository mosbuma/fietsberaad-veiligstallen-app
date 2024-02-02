export const getFaqSections = async (siteId: string) => {
  try {
    if (!siteId) return;

    const response = await fetch(`/api/faq?siteId=${siteId}`);
    let result = await response.json();
    console.log('**** faq result', result);
    return result;
  } catch (err) {
    console.error('err', err)
  }
}
