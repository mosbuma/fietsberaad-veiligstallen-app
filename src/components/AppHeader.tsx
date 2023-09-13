// @ts-nocheck
import React, {useEffect, useState} from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/navigation";
// import { usePathname } from 'next/navigation';
// import Link from 'next/link'

import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import AppHeaderMobile from "~/components/AppHeaderMobile";

function AppHeader({
}: {
}) {
  const [forceShowingMobileHeader, setForceShowingMobileHeader] = useState(false);

  // Handler if screen size changes
  useEffect(() => {
    // Run at least once
    handleWindowSizeChange();
    // Set event handler
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const handleWindowSizeChange = () => {
    // In AppHeaderDesktop, check if nav items overflow
    const wrapperEl = document.getElementsByClassName('primaryMenuItems-wrapper')[0];
    // Check if nav items overflow the nav bar
    console.log('wrapperEl.children', wrapperEl.children)
    for (const el of wrapperEl.children) {
      console.log(el.offsetTop);
    }
    // if(wrapperEl.offsetHeight > 40) {
    //   setForceShowingMobileHeader(true);
    // } else {
    //   setForceShowingMobileHeader(true);
    // }
  };

  return (
    <>
      <div
        data-comment="Show only on desktop"
        className={`
          hidden
          ${forceShowingMobileHeader ? '' : 'sm:flex'}
        `}
      >
        <AppHeaderDesktop />
      </div>

      <div
        data-comment="Show only on mobile OR if nav items don't fit"
        className={`
          block
          ${forceShowingMobileHeader ? '' : 'sm:hidden'}
        `}
      >
        <AppHeaderMobile />
      </div>
    </>
  );
}

export default AppHeader;
