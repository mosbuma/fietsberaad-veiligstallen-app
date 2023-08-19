// @ts-nocheck
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState } from "~/store/authSlice";
import { AppState } from "~/store/store";

// Import components
import Logo from './Logo';
import PageTitle from "~/components/PageTitle";

const PrimaryMenuItem = (props: any) => {
  return <div className="
    PrimaryMenuItem
    px-5
  ">
    <a href="#" className="flex flex-col justify-center h-full">
      {props.item}
    </a>
  </div>
}

const SecundaryMenuItem = (props: any) => {
  return <div className="
    SecundaryMenuItem
    px-2
  ">
    <a href="#" className="flex flex-col justify-center h-full">
      {props.item}
    </a>
  </div>
}

function AppHeaderMobile({
  title,
  handleCloseClick,
  children
}: {
  title?: string,
  handleCloseClick?: Function,
  children?: any
}) {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: AppState) => state.auth.authState
  );

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const handleLoginClick = () => {
    const authState = isAuthenticated ? false : true;
    dispatch(setAuthState(authState));
  };

  const primaryMenuItems = [
    'ICN',
    'Koop abonnement',
    'Over Utrecht Fietst!',
    'Buurtstallingen',
    'Fietstrommels'
  ];

  const secundaryMenuItems = [
    'FAQ',
    'Tips',
    'Contact'
  ];

  return (
    <>
      <div
        className="
          z-10
          
          w-full
          
          bg-white

          overflow-hidden
          sticky
          top-0

          shadow
        "
      >
        <div className="
          py-3
          px-5
          flex
          justify-between
        ">
          <div className="flex flex-col justify-center">
            <Logo imageUrl={(activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
          </div>
          <div className="mx-3 flex-1 flex flex-col justify-center">
            <PageTitle className="mb-0">{title}</PageTitle>
          </div>
          <a href="#" onClick={handleCloseClick} className="
            overlay-close-button
            flex
            flex-col
            justify-center
            mr-2
          ">
            <img src="/images/icon-close.png" alt="Sluiten" className="w-6" />
          </a>
        </div>
      </div>

      {children}

    </>
  );
}

export default AppHeaderMobile;
