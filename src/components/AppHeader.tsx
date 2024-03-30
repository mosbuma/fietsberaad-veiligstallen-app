import React from "react";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import AppHeaderMobile from "~/components/AppHeaderMobile";

function AppHeader({
  onStallingAanmelden
}: {
  onStallingAanmelden?: () => void
}) {

  return (
    <>
      <div
        data-comment="Show only on desktop"
        className={`
          hidden
          sm:flex
        `}
      >
        <AppHeaderDesktop onStallingAanmelden={onStallingAanmelden} />
      </div>

      <div
        data-comment="Show only on mobile OR if nav items don't fit"
        className={`
          block
          sm:hidden
        `}
      >
        <AppHeaderMobile />
      </div>
    </>
  );
}

export default AppHeader;
