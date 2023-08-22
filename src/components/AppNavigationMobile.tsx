import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  setIsFilterBoxVisible,
  setIsMobileNavigationVisible,
  setIsParkingListVisible
} from "~/store/appSlice";

import {
  getNavigationItemsForMunicipality,
  filterNavItemsBasedOnMapZoom
} from "~/utils/navigation";

import PageTitle from "~/components/PageTitle";

const NavSection = ({
	children
}: {
	children: any
}) => {
	return <div className="
		border-t-2
		border-t-solid
		my-3
		pt-3
		pb-1
	">
		{children}
	</div>
}

// If it has an icon: Show bold text
const NavItem = ({
	title,
	icon,
	onClick
}) => {
	return <a className={`
		flex
		my-1
		text-lg
		cursor-pointer
		${icon ? 'font-bold' : ''}
	`}
	onClick={onClick}
	>
		{icon ? <div className="flex flex-col justify-center">
			<img src={`/images/${icon}`} alt={icon} className="
				w-4 h-4 mr-3
			" />
		</div> : ''}
		{title}
	</a>
}

const AppNavigationMobile = ({
	activeMunicipalityInfo,
	mapZoom
}: {
	activeMunicipalityInfo?: any,
	mapZoom?: number
}) => {
  const { push } = useRouter();
  const dispatch = useDispatch();

  const [articles, setArticles] = useState([]);

  // Get menu items based on active municipality
  useEffect(() => {
    // Get menu items from SiteID 1 OR SiteID of the municipality
    let SiteIdToGetArticlesFrom;
    if(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ID) {
      SiteIdToGetArticlesFrom = activeMunicipalityInfo.ID;
    } else {
      SiteIdToGetArticlesFrom = "1";
    }

    (async () => {
      const response = await getNavigationItemsForMunicipality(SiteIdToGetArticlesFrom);
      setArticles(response);
    })();
   }, [
    activeMunicipalityInfo
  ]);

  const clickItem = (url) => {
  	push(url);
    dispatch(setIsMobileNavigationVisible(false))
    dispatch(setIsParkingListVisible(false))
  }

  const title = (mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyName)
  	? `Welkom in ${activeMunicipalityInfo.CompanyName}`
  	: `Welkom bij VeiligStallen`;

  const primaryMenuItems = filterNavItemsBasedOnMapZoom(articles, mapZoom)

	return (
		<div className="
			py-8
			px-5
		">
			<header>
				<PageTitle className="
					text-2xl text-red-600 mb-2
				"
				 style={{
					maxWidth: '90%'
				}}
				>
					{title}
				</PageTitle>
				<p style={{
					maxWidth: '70%'
				}}>
					De kortste weg naar een veilige plek voor je fiets {mapZoom >= 12 ? 'in Utrecht' : ''}
				</p>
			</header>

			<nav>
				<NavSection>
					<NavItem title="Kaart" icon="icon-map.png" onClick={(e) => {
						e.preventDefault();

						clickItem('/')
					}} />
					<NavItem title="Lijst" icon="icon-list.png" onClick={(e) => {
						e.preventDefault();

				  	push('/');
				    dispatch(setIsMobileNavigationVisible(false))
				    dispatch(setIsParkingListVisible(true))
					}} />
				</NavSection>
				<NavSection>
					{primaryMenuItems.map((x, xidx) => <NavItem
            key={'pmi-'+xidx}
            title={x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
            onClick={(e) => {
            	e.preventDefault();
            	push(`/${(mapZoom >= 12 && activeMunicipalityInfo) ? activeMunicipalityInfo.UrlName : 'fietsberaad'}/${x.Title ? x.Title : ''}`);
            }}
            />
          )}
				</NavSection>
				<NavSection>
					<NavItem title="FAQ" />
					<NavItem title="Tips" />
					<NavItem title="Contact" />
				</NavSection>
				<NavSection>
					<NavItem title="Over VeiligStallen" />
				</NavSection>
			</nav>

		</div>
	);
}

export default AppNavigationMobile;
