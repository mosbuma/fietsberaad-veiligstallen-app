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
    let code: string;
    switch(municipalityCode) {
      case 'Utrecht':
      default:
        code = `https://huisstijl.utrecht.nl/typo3conf/ext/alternet_sitepackage/Resources/Public/Images/svg/wapen-utrecht-rood.svg`
        break;
    }
    return code;
  }

  return (
    <>
  		<img
        src={getLogoUrl('municipality.code')}
        className="mr-2 h-10"
        alt="logo Gemeente Utrecht"
      />
    </>
  );
}

export default Logo;
