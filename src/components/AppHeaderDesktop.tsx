// @ts-nocheck
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation';
import Link from 'next/link'

import Logo from './Logo';

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
  return <div className="
    SecundaryMenuItem
    px-2
  ">
    <a href="#" className="flex flex-col justify-center h-full">
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
    if(! activeMunicipalityInfo || ! activeMunicipalityInfo.ID) return;

    (async () => {
      try {
        const response = await fetch(`/api/articles/?SiteID=${activeMunicipalityInfo.ID}`);
        const json = await response.json();

        setArticles(json);
      } catch(err) {
        console.error(err);
      }
    })();
  }, [
    activeMunicipalityInfo,
    pathName
  ]);

  console.log('activeMunicipalityInfo', activeMunicipalityInfo)

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

  let primaryMenuItems = articles;
  // Only include 'main' items
  primaryMenuItems = primaryMenuItems.filter(x => x.Navigation === 'main');
  // Exclude articles with title: Home
  primaryMenuItems = primaryMenuItems.filter(x => x.Title !== 'Home');
  // Only keep items for veiligstallen
  primaryMenuItems = primaryMenuItems.filter(x => x.ModuleID === 'veiligstallen');
  // Only keep items that are unique for this site
  primaryMenuItems = primaryMenuItems.filter(x => x.SiteID !== '1');

  console.log('primaryMenuItems', primaryMenuItems)

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
        <Link href="/">
          <Logo imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
        </Link>
        {mapZoom >= 12 && <div className="
          flex-1 flex flex-start
          flex-wrap overflow-hidden
        ">
          {primaryMenuItems.map((x, xidx) => <PrimaryMenuItem
            key={'pmi-'+xidx}
            title={x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
            url={`/${activeMunicipalityInfo ? activeMunicipalityInfo.UrlName : ''}/${x.Title ? x.Title : ''}`}
          />)}
        </div>}
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
