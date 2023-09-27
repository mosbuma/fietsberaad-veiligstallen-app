// @ts-nocheck
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation';
import Link from 'next/link'

import Logo from './Logo';
import { ToggleMenuIcon } from "~/components/ToggleMenuIcon";

import {
  setIsMobileNavigationVisible
} from "~/store/appSlice";

import {
  getNavigationItemsForMunicipality,
  filterNavItemsBasedOnMapZoom,
  getPrimary,
  getSecundary,
  getFooter
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
      {props.icon ? <img src={props.icon} style={{height: '30px'}} /> : ''}
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
  const [fietsberaadArticles, setFietsberaadArticles] = useState([]);
  const [didNavOverflow, setDidNavOverflow] = useState(false);

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

  const [forceShowingMobileHeader, setForceShowingMobileHeader] = useState(false);

  // Handler if screen size changes
  useEffect(() => {
    // Run at least once
    overflowNavItems();
    // Set event handler
    window.addEventListener('resize', overflowNavItems);
    return () => {
      window.removeEventListener('resize', overflowNavItems);
    };
  }, [
    articles
  ]);

  const overflowNavItems = () => {
    // In AppHeaderDesktop, check if nav items overflow
    const headerEl = document.getElementsByClassName('AppHeaderDesktop')[0];
    const wrapperEl = document.getElementsByClassName('primaryMenuItems-wrapper')[0];
    // Show nav items again after resize
    for (const el of wrapperEl.children) {
      el.style.display = 'block';
    }
    // Check if nav items overflow the nav bar
    let navOverflow = false;
    for (const el of wrapperEl.children) {
      if(! el.classList.contains('PrimaryMenuItem')) {
        continue;
      }
      const elementTop = el.offsetTop;
      const headerHeight = headerEl.offsetHeight;
      if((elementTop + 12) >= headerHeight) {// 12 = padding-top of header
        el.style.display = 'none';
        navOverflow = true;
      } else {
        el.style.display = 'block';
      }
    }
    setDidNavOverflow(navOverflow);
  };

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

  const showMapIcon = pathName !== '/';

  const allMenuItems = filterNavItemsBasedOnMapZoom(articles, mapZoom)
  const primaryMenuItems = getPrimary(allMenuItems)
  const secundaryMenuItems = getSecundary(allMenuItems);

  return (
    <>
      <div
        className="
          AppHeaderDesktop
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
          primaryMenuItems-wrapper
          flex-1 flex flex-start
          flex-wrap overflow-hidden
          transition-opacity
          duration-500
          ${(primaryMenuItems && primaryMenuItems.length > 0) ? 'opacity-100' : 'opacity-0'}
        `}>
          {showMapIcon && <PrimaryMenuItem
            key={'pmi-h1-map'}
            icon={'/images/icon-map.png'}
            url={'/'}
          />}
          {primaryMenuItems ? primaryMenuItems.map((x,idx) => <PrimaryMenuItem
            key={'pmi-h1-'+idx}
            title={x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
            url={`/${(mapZoom >= 12 && activeMunicipalityInfo) ? activeMunicipalityInfo.UrlName : 'fietsberaad'}/${x.Title ? x.Title : ''}`}
          />) : ''}
          <div className="
          " style={{
            display: didNavOverflow ? 'block' : 'none',
            visibility: didNavOverflow ? 'visible' : 'hidden',
          }}>
            <ToggleMenuIcon className="
              shadow-none
              bg-transparent
              z-10
            "
            style={{height: '40px'}}
            onClick={() => {
              dispatch(setIsMobileNavigationVisible(true))
            }}
            />
          </div>
        </div>
        <div className="flex flex-end">
          {secundaryMenuItems.map((x,idx) => {
            return <SecundaryMenuItem
              key={'pmi-h2-'+idx}
              title={x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
              url={`/${(mapZoom >= 12 && activeMunicipalityInfo) ? activeMunicipalityInfo.UrlName : 'fietsberaad'}/${x.Title ? x.Title : ''}`}
            />
          })}
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
