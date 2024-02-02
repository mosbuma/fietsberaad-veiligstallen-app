import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { articles } from "@prisma/client";

import {
  getNavigationItemsForMunicipality,
  getFooter
} from "~/utils/navigation";

const FooterNavItem = ({
  url,
  children,
  className
}: {
  url?: string,
  children: any,
  className?: string,
}) => {
  const { push } = useRouter();

  return <a href={url} className={`
    ${className}
    mx-2
  `}
    onClick={(e) => {
      e.preventDefault();

      console.log("*** onclick FooterNavItem ***");

      if (url) {
        push(url);
      }
    }}
  >
    {children}
  </a>
}

const FooterNav = () => {
  const [fietsberaadArticles, setFietsberaadArticles] = useState<articles[]>([]);

  // Get menu items for siteId 1 (Fietsberaad)
  useEffect(() => {
    (async () => {
      const response = await getNavigationItemsForMunicipality("1");
      setFietsberaadArticles(response);
    })();
  }, []);

  const navItemsPrimary = [
    // { title: 'Stalling toevoegen' },
    { title: 'Over Veilig Stallen', url: '/fietsberaad/Copyright' },
  ];

  const footerMenuItems = getFooter(fietsberaadArticles);

  return (
    <div className="
      fixed
      bottom-0
      right-0
      bg-white
      py-3
      px-2
      rounded-t-xl
      flex
      text-xs
      z-10
    ">
      <FooterNavItem
        url={'/?stallingid=nieuw'}
        className="font-bold">
        Stalling Aanmelden
      </FooterNavItem>

      {navItemsPrimary.map(x => <FooterNavItem
        key={x.title}
        url={x.url}
        className="font-bold"
      >
        {x.title}
      </FooterNavItem>)}

      {footerMenuItems ? footerMenuItems.map((x, idx) => <FooterNavItem
        key={'pmi-f-' + idx}
        url={`/fietsberaad/${x.Title ? x.Title : ''}`}
      >
        {x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
      </FooterNavItem>) : ''}

    </div>
  );
}

export default FooterNav;
