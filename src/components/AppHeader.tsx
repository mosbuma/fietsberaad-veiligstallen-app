import * as React from "react";
import Input from '@mui/material/TextField';
import SearchBar from "~/components/SearchBar";

function AppHeader() {
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
      <div className="
        bg-white
        rounded-full
        px-5
        py-0
        h-10
        flex-1
        shadow-lg  
      ">
        <SearchBar />
      </div>
    </div>
  );
}

export default AppHeader;
