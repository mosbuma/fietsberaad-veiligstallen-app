// @ts-nocheck
import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"
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

        // setArticles(json.filter((x) => x.ShowInNav === "1"));
        let filteredJson = json;
        // Hide items without Title
        // filteredJson.filter((x) => x.Title !== "")
        // // Hide SiteID=1 items we don't want
        // const hideTheseIds = [
        //   '0B629CF2-FD1A-466E-97E11BA0ADA634BD',
        //   '143047C3-D88E-FBC4-D82BA12CFCC645EC',
        //   '1657B38F-D366-26D3-5B4DF36022E43795',
        //   '28042394-C9E0-EB7E-30712AF6492CF8AE',
        //   '385EF518-BF4F-6974-A712E6B2AE25464F',
        //   '387A6195-B727-FCC4-0DB0E25034A85E36',
        //   '394C0A9E-0489-66B3-F2853D8239736114',
        //   '394C0AA0-9F80-E022-6154B5E11DB37CE4',
        //   '5EFAD922-6E47-4A29-9BD401EBDC6E9C9A',
        //   '6C50D3A3-AADD-4819-892084BB08FEB3A6',
        //   '73DC0A2B-0C67-25F0-AA1B389FB9B15F06',
        //   'B4F74452-E882-4CA4-8258356ACC587FD2',
        //   'B9A7955A-306B-4CBF-B711CB2D6D0B974F',
        //   'C3B8CBA5-291E-49B6-837C5469FCA7EADD',
        //   'CE5A5874-9A72-447F-8806E81C3422300B',
        //   'D71457FD-B9A0-950F-492C43E9A1EEC18D',
        //   'E7473EEA-E977-84D5-6595009CFE13AB6E',
        //   'ED145DD3-E403-6B76-E533897744968FFD'
        // ]
        // filteredJson.filter((x) => hideTheseIds.indexOf(x.ID) <= -1)
        setArticles(filteredJson);
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

  const themeColor1 = mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor1}`
    : '#15aeef';

  const themeColor2 = mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
    ? `#${activeMunicipalityInfo.ThemeColor2}`
    : '#15aeef';

  const primaryMenuItems = articles.filter(x => x.Navigation === 'main');

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
        <div className="flex-1 flex flex-start">
          {primaryMenuItems.map((x, xidx) => <PrimaryMenuItem
            key={'pmi-'+xidx}
            title={x.DisplayTitle}
            url={`/${activeMunicipalityInfo ? activeMunicipalityInfo.UrlName : ''}/${x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}`}
          />)}
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
