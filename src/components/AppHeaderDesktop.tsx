// @ts-nocheck
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation';
import Link from 'next/link'

import Logo from './Logo';

import {
  getNavigationItemsForMunicipality,
  filterNavItemsBasedOnMapZoom
} from "~/utils/navigation";

const PrimaryMenuItem = (props: any) => {
  const { push } = useRouter();

  return <div className="
    PrimaryMenuItem
    px-5
  ">
    <a href={props.url} className="flex flex-col justify-center h-full" onClick={(e) => {
      e.preventDefault();

      push(props.url);
    }}>
      {props.title}
    </a>
  </div>
}

const SecundaryMenuItem = (props: any) => {
  const { push } = useRouter();

  return <div className="
    SecundaryMenuItem
    px-2
  ">
    <a href="#" className="flex flex-col justify-center h-full" onClick={(e) => {
      e.preventDefault();

      push(props.url);
    }}>
      {props.title}
    </a>
  </div>
}

function AppHeaderDesktop({
  children
}: {
  children?: any
}) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathName = usePathname();
  const { data: session } = useSession()
  
  const [articles, setArticles] = useState([]);

  const isAuthenticated = useSelector(
    (state: AppState) => state.auth.authState
  );

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

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
    activeMunicipalityInfo,
    pathName
  ]);

  const handleLoginClick = () => {
    if(!session) {
      push('/login');
    } else {
      // sign out
      signOut();
    }
  };

  const themeColor1 = mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor1}`
    : '#15aeef';

  const themeColor2 = mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor2}`
    : '#15aeef';

  const primaryMenuItems = filterNavItemsBasedOnMapZoom(articles, mapZoom)

  const secundaryMenuItems = [
    'FAQ',
    'Tips',
    'Contact'
  ];// SiteID = 1

  return (
    <>
      <div
        className="
          t-0
          fixed z-10
          flex
          w-full
          justify-between
          px-5
          py-3
          bg-white

          overflow-hidden
        "
        style={{height: '64px'}}
      >
        <Link href={`/${activeMunicipalityInfo ? (activeMunicipalityInfo.UrlName !== 'fietsberaad' ? activeMunicipalityInfo.UrlName : '') : ''}`}>
          <Logo
            imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined}
            className={`
              transition-opacity
              duration-500
              ${(activeMunicipalityInfo) ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </Link>
        <div className={`
          flex-1 flex flex-start
          flex-wrap overflow-hidden
          transition-opacity
          duration-500
          ${(primaryMenuItems && primaryMenuItems.length > 0) ? 'opacity-100' : 'opacity-0'}
        `}>
          {primaryMenuItems ? primaryMenuItems.map((x, xidx) => <PrimaryMenuItem
            key={'pmi-'+xidx}
            title={x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
            url={`/${(mapZoom >= 12 && activeMunicipalityInfo) ? activeMunicipalityInfo.UrlName : 'fietsberaad'}/${x.Title ? x.Title : ''}`}
          />) : ''}
        </div>
        <div className="flex flex-end">
          {/*{secundaryMenuItems.map(x => <SecundaryMenuItem key={x} title={x} />)}*/}
          <button
            className="
              mx-2
              h-10
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
            "
            style={{
              backgroundColor: themeColor1,
            }}
            onClick={handleLoginClick}
          >
            {session ? "Log uit" : "Log in"}
          </button>
        </div>
      </div>

      {children}

    </>
  );
}

export default AppHeaderDesktop;
