import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppState } from "~/store/store";
import Link from 'next/link'
import Image from 'next/image'

// Import components
import Modal from "src/components/Modal";
import AppNavigationMobile from "~/components/AppNavigationMobile";

import {
  setIsMobileNavigationVisible
} from "~/store/appSlice";

// Import components
import Logo from './Logo';
import PageTitle from "~/components/PageTitle";

function AppHeaderMobile({
  title,
  handleCloseClick,
  children
}: {
  title?: string,
  handleCloseClick?: () => void,
  children?: React.ReactNode
}) {
  const dispatch = useDispatch();

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const isMobileNavigationVisible = useSelector(
    (state: AppState) => state.app.isMobileNavigationVisible
  );

  const mapZoom = useSelector((state: AppState) => state.map.zoom) || 12;

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
            <Link href={`/${activeMunicipalityInfo && activeMunicipalityInfo.UrlName ? (activeMunicipalityInfo.UrlName !== 'fietsberaad' ? activeMunicipalityInfo.UrlName : '') : ''}`}>
              <Logo imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
            </Link>
          </div>
          <div className="mx-3 flex-1 flex flex-col justify-center">
            <PageTitle className="mb-0">{title}</PageTitle>
          </div>
          <a href="#" onClick={() => {
            // Custom set action
            if (handleCloseClick) handleCloseClick();
            // Or default action
            else dispatch(setIsMobileNavigationVisible(true));
          }} className="
            overlay-close-button
            mt-4
            mr-2
          "
          >
            <Image
              src={(handleCloseClick) ? `/images/icon-close.png` : `/images/icon-hamburger.png`}
              alt={(handleCloseClick) ? `Sluiten` : 'Open menu'} 
              width={24}
              height={24}
              className="w-6" />
          </a>
        </div>
      </div>

      {children}

      {isMobileNavigationVisible && (<>
        <Modal
          onClose={() => {
            dispatch(setIsMobileNavigationVisible(false))
          }}
          clickOutsideClosesDialog={false}
        >
          <AppNavigationMobile
            mapZoom={mapZoom}
            activeMunicipalityInfo={activeMunicipalityInfo}
          />
        </Modal>
      </>)}

    </>
  );
}

export default AppHeaderMobile;
