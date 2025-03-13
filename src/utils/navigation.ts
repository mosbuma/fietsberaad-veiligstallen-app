import { VSArticle } from "~/types/articles";
export const getNavigationItemsForMunicipality = async (siteId: string | null) => {
  try {
    const response = await fetch(`/api/articles/?SiteID=${siteId}`);
    const articles: VSArticle[] = await response.json();

    let primaryMenuItems = articles;

    // Only keep items for veiligstallen
    primaryMenuItems = primaryMenuItems.filter(x => x.ModuleID === 'veiligstallen');

    return primaryMenuItems;
  } catch (err) {
    console.error(err);
  }
}

export const filterNavItemsBasedOnMapZoom = (items: VSArticle[], mapZoom: number) => {
  if (!items) return items;

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

export const getPrimary = (items: VSArticle[]) => {
  let primaryItems = items;
  if (!primaryItems) return;

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

export const getSecundary = (items: VSArticle[]) => {
  let secundaryItems = items;
  if (!secundaryItems) return [];

  // Only include 'main' items
  secundaryItems = secundaryItems.filter(x => x.Navigation === 'main');

  return secundaryItems.filter((x) => {
    return x.Title === 'Tips' || x.Title === 'Contact';
  });
}

export const getFooter = (items: VSArticle[]) => {
  if (items) {
    return items.filter((x) => {
      return x.Title === 'Over ons' || x.Title === 'Disclaimer' || x.Title === 'Privacy' || x.Title === 'Algemene Voorwaarden';
    });
  } else {
    return null
  }
}
