// Logo.tsx - Location specific logo
import * as React from "react";
import {
  useDispatch, useSelector
} from "react-redux";
import { AppState } from "~/store/store";

function Logo({
}: {
}) {
  const isAuthenticated = useSelector(
    (state: AppState) => state.map.municipality.code
  );

  const getLogoUrl = (municipalityCode: string) => {
    let image: string;
    switch(municipalityCode) {
      case 'Utrecht':
        image = `https://huisstijl.utrecht.nl/typo3conf/ext/alternet_sitepackage/Resources/Public/Images/svg/wapen-utrecht-rood.svg`
        break;
      default:
        image = `/images/logo.png`
        break;
    }
    return image;
  }

  return (
    <>
  		<img
        src={getLogoUrl('municipality.code')}
        className="mr-2 h-12"
        alt="logo Gemeente Utrecht"
      />
    </>
  );
}

export default Logo;
