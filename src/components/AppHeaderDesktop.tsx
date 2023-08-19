// @ts-nocheck
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"

import Logo from './Logo';

const PrimaryMenuItem = (props: any) => {
  return <div className="
    PrimaryMenuItem
    px-5
  ">
    <a href="#" className="flex flex-col justify-center h-full">
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
  const { data: session } = useSession()
  
  const [articles, setArticles] = useState([]);

  const isAuthenticated = useSelector(
    (state: AppState) => state.auth.authState
  );

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

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
  ]);

  const handleLoginClick = () => {
    if(!session) {
      push('/login');
    } else {
      // sign out
      signOut();
    }
  };

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  const themeColor1 = mapZoom > 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor1}`
    : '#15aeef';

  const themeColor2 = mapZoom > 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor2}`
    : '#15aeef';

  const primaryMenuItems = articles;

  const secundaryMenuItems = [
    'FAQ',
    'Tips',
    'Contact'
  ];

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
        <Logo imageUrl={(activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
        <div className="flex-1 flex flex-start">
          {primaryMenuItems.map(x => <PrimaryMenuItem key={x} title={x.DisplayTitle} />)}
        </div>
        <div className="flex flex-end">
          {secundaryMenuItems.map(x => <SecundaryMenuItem key={x} title={x} />)}
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
            {session ? "Logout" : "Login"}
          </button>
        </div>
      </div>

      {children}

    </>
  );
}

export default AppHeaderDesktop;
