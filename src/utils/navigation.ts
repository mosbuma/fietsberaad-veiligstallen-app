
export const getNavigationItemsForMunicipality = async (siteId) => {
    try {
      const response = await fetch(`/api/articles/?SiteID=${siteId}`);
      const articles = await response.json();

      let primaryMenuItems = articles;
      // Only include 'main' items
      primaryMenuItems = primaryMenuItems.filter(x => x.Navigation === 'main');
      // Exclude articles with title: Home
      primaryMenuItems = primaryMenuItems.filter(x => x.Title !== 'Home');
      // Only keep items for veiligstallen
      primaryMenuItems = primaryMenuItems.filter(x => x.ModuleID === 'veiligstallen');

      return primaryMenuItems;
    } catch(err) {
      console.error(err);
    }
}

export const filterNavItemsBasedOnMapZoom = (items, mapZoom) => {
  if(! items) return items;

  // Only keep items that are unique for this site
  if(mapZoom >= 12) {
    items = items.filter(x => x.SiteID !== '1');
  }
  // Hide 'Stallingen' and 'Fietstrommels' for Fietsberaad site
  if(mapZoom < 12) {
    items = items.filter(x => {
      return x.Title !== 'Stallingen' && x.Title !== 'Buurttrommels';
    });
  }

  return items;
}

export const getPrimary = (items) => {
  return items.filter((x) => {
    return x.Title !== 'Tips' && x.Title !== 'Contact' && x.Title !== 'FAQ';
  });
}

export const getSecundary = (items) => {
  return items.filter((x) => {
    return x.Title === 'Tips' || x.Title === 'Contact' || x.Title === 'FAQ';
  });
}

export const getFooter = (items) => {
  return items.filter((x) => {
    return x.Title === 'Over ons' || x.Title === 'Disclaimer' || x.Title === 'Privacy' || x.Title === 'Algemene voorwaarden';
  });
}
