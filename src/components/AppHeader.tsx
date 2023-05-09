import * as React from "react";
import Input from '@mui/material/TextField';

function AppHeader({
  children
}) {
  return (
    <div className="
      fixed
      t-0 z-10
      py-10
      px-5
      w-full
      flex
      justify-between
      h-10
    ">
      <img
        src="
          https://huisstijl.utrecht.nl/typo3conf/ext/alternet_sitepackage/Resources/Public/Images/svg/wapen-utrecht-rood.svg
        " 
        className="h-10 mr-2"
        alt="logo Gemeente Utrecht"
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default AppHeader;
