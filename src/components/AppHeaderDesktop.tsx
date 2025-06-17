import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { AppState } from "~/store/store";
import { setActiveArticle } from "~/store/appSlice";
import Logo from './Logo';
import { ToggleMenuIcon } from "~/components/ToggleMenuIcon";

import {
  setIsMobileNavigationVisible
} from "~/store/appSlice";

import { MenuItem, PrimaryMenuItem, SecundaryMenuItem } from "~/components/MenuItems";
import { VSContactGemeente } from "~/types/contacts";
import { VSArticle } from "~/types/articles";

function AppHeaderDesktop({
  activeMunicipalityInfo,
  primaryMenuItems,
  secundaryMenuItems,
  onStallingAanmelden,
  children
}: {
  activeMunicipalityInfo: VSContactGemeente | undefined,
  primaryMenuItems: VSArticle[] | undefined,
  secundaryMenuItems: VSArticle[] | undefined,
  onStallingAanmelden?: () => void,
  children?: any
}) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathName = usePathname();
  const { data: session } = useSession()

  const [didNavOverflow, setDidNavOverflow] = useState(false);

  // const isAuthenticated = useSelector(
  //   (state: AppState) => state.auth.authState
  // );

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  // 
  const articlemunicipality = useSelector((state: AppState) => state.app.municipality);
  const articlepage = useSelector((state: AppState) => state.app.page);
  
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
    primaryMenuItems,
    secundaryMenuItems
  ]);

  function overflowNavItems(): void {
    // In AppHeaderDesktop, check if nav items overflow
    const headerEl = document.getElementsByClassName('AppHeaderDesktop')[0] as HTMLElement;
    const wrapperEl = document.getElementsByClassName('primaryMenuItems-wrapper')[0] as HTMLElement;
    // Show nav items again after resize
    for (const el of wrapperEl.children) {
      (el as HTMLElement).style.display = 'block';
    }
    // Check if nav items overflow the nav bar
    let navOverflow = false;
    for (const el of wrapperEl.children) {
      if (!(el as HTMLElement).classList.contains('PrimaryMenuItem')) {
        continue;
      }
      const elementTop = (el as HTMLElement).offsetTop;
      const headerHeight = headerEl.offsetHeight;
      if ((elementTop + 12) >= headerHeight) {// 12 = padding-top of header
        (el as HTMLElement).style.display = 'none';
        navOverflow = true;
      } else {
        (el as HTMLElement).style.display = 'block';
      }
    }
    setDidNavOverflow(navOverflow);
  }

  const handleNieuweStallingClick = () => {
    if (onStallingAanmelden) {
      onStallingAanmelden();
    }
  }

  const handleLoginClick = () => {
    if (!session) {
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

  const showMapIcon = articlepage!=='';

  const showStallingAanmaken = session && mapZoom >= 13 && activeMunicipalityInfo;

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
        style={{ height: '64px' }}
      >
        <Link href={`/${activeMunicipalityInfo ? (activeMunicipalityInfo.UrlName !== 'fietsberaad' ? activeMunicipalityInfo.UrlName : '') : ''}`}>
          <Logo
            imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo) ? `${activeMunicipalityInfo.CompanyLogo}` : undefined}
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
            targetmunicipality={articlemunicipality}
            targetpage={articlepage}
            title={''}
            url={'/'}
          />}
          {primaryMenuItems ? primaryMenuItems.map((x: VSArticle, idx: number) => <PrimaryMenuItem
            key={'pmi-h1-' + idx}
            targetmunicipality={x.SiteID}
            targetpage={x.Title}
            title={x.DisplayTitle ? x.DisplayTitle : x.Title}
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
              style={{ height: '40px' }}
              onClick={() => {
                dispatch(setIsMobileNavigationVisible(true))
              }}
            />
          </div>
        </div>
        <div className="flex flex-end">
          {secundaryMenuItems && secundaryMenuItems.map((x: VSArticle, idx: number) => {
            return <SecundaryMenuItem
              key={'pmi-h2-' + idx}
              targetmunicipality={x.SiteID}
              targetpage={x.Title}
              title={x.DisplayTitle}
              url={`/${(mapZoom >= 12 && activeMunicipalityInfo) ? activeMunicipalityInfo.UrlName : 'fietsberaad'}/${x.Title ? x.Title : ''}`}
              onClick={() => {
                dispatch(setActiveArticle({
                  articleTitle: x.Title,
                  municipality: ""
                }));
              }}  
            />
          })}

          {showStallingAanmaken ?
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
              onClick={handleNieuweStallingClick}
            >
              {"Stalling aanmelden"}
            </button> : null
          }

          {session && <a
            href="/beheer"
            onClick={(e) => {
              e.preventDefault();
              push('/beheer');
            }}
            className="
              mx-2
              h-10
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
              flex
              flex-col
              justify-center
            "
            style={{
              backgroundColor: themeColor1,
            }}

            title="Ga naar het beheer"
          >
            Beheer
          </a>}

          <button
            className="
              mx-2
              h-10
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
              whitespace-nowrap
            "
            style={{
              backgroundColor: themeColor2 || themeColor1,
            }}
            onClick={handleLoginClick}
          >
            {session ? "Log uit" : "Log in"}
          </button>

        </div>
      </div>
    </>
  );
}

export default AppHeaderDesktop;
