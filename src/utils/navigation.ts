import type { articles } from "@prisma/client";

export const getNavigationItemsForMunicipality = async (siteId: string): Promise<articles[]> => {
  try {
    const response = await fetch(`/api/articles/?SiteID=${siteId}`);
    const articles = await response.json();

    let primaryMenuItems = articles as articles[];

    // Only keep items for veiligstallen
    primaryMenuItems = primaryMenuItems.filter(x => x.ModuleID === 'veiligstallen');

    return primaryMenuItems;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const filterNavItemsBasedOnMapZoom = (items: articles[], mapZoom: number): articles[] => {
  // Only keep items that are unique for this site
  if (mapZoom >= 12) {
    items = items.filter(x => x.SiteID !== '1');
  }
  // Hide 'Stallingen' and 'Fietstrommels' for Fietsberaad site
  if (mapZoom < 12) {
    items = items.filter(x => {
      return x.Title !== 'Stallingen' && x.Title !== 'Buurttrommels';
    });
  }

  return items;
}

export const getPrimary = (items: articles[]): articles[] => {
  let primaryItems = items;
  if (!primaryItems) return [];

  // Only include 'main' items
  primaryItems = primaryItems.filter(x => x.Navigation === 'main');

  // Update title: Home -> Info
  // |-> Niet nodig, want we hebben DisplayTitle
  // primaryItems = primaryItems.map(x => {
  //   if(x.Title === 'Home') {
  //     x.DisplayTitle = 'Info';
  //   }
  //   return x;
  // });

  // Keep everything apart from Tips, Contact and FAQ
  return primaryItems.filter((x) => {
    return x.Title !== 'Tips' && x.Title !== 'Contact' && x.Title !== 'FAQ';
  });
}

export const getSecundary = (items: articles[]): articles[] => {
  let secundaryItems = items;
  if (!secundaryItems) return [];

  // Only include 'main' items
  secundaryItems = secundaryItems.filter(x => x.Navigation === 'main');

  return secundaryItems.filter((x) => {
    return x.Title === 'Tips' || x.Title === 'Contact';
  });
}

export const getFooter = (items: articles[]): articles[] => {
  return items.filter((x) => {
    return x.Title === 'Over ons' || x.Title === 'Disclaimer' || x.Title === 'Privacy' || x.Title === 'Algemene Voorwaarden';
  });
}
