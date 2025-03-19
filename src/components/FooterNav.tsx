// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { useDispatch } from "react-redux";
import { setActiveArticle } from "~/store/appSlice";
import { VSArticle } from "~/types/articles";

import {
  // getNavigationItemsForMunicipality,
  getArticlesForMunicipality,
  filterNavItems,
  getFooter
} from "~/utils/navigation";

const FooterNavItemClick = ({
  onClick,
  children,
  className
}: {
  url?: string,
  children: any,
  className?: string,
}) => {
  return <div className={`
    ${className}
    mx-2
  `}
    onClick={onClick}
  >
    {children}
  </div>
}

const FooterNav = ({ onStallingAanmelden, children }: {
  onStallingAanmelden?: () => void,
  children?: any
}) => {
  const { data: session } = useSession()
  const dispatch = useDispatch();
  const [fietsberaadArticles, setFietsberaadArticles] = useState([]);

  // Get menu items for siteId 1 (Fietsberaad)
  useEffect(() => {
    (async () => {
      const response = await getArticlesForMunicipality("1");
      setFietsberaadArticles(filterNavItems(response));
    })();
  }, []);

  const navItemsPrimary = [
    // { title: 'Stalling toevoegen' },
    { displayTitle: 'Over Veilig Stallen',   // text in menu
      municipality: 'fietsberaad',
      Title: 'Copyright' // title in URL
    },
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
      {!session ?
        <FooterNavItemClick
          onClick={() => { onStallingAanmelden && onStallingAanmelden() }}
          className="cursor-pointer font-bold">
          Stalling aanmelden
        </FooterNavItemClick> : null}

      {navItemsPrimary.map(x => <FooterNavItemClick 
        key={x.title}
        onClick={() => {
          dispatch(setActiveArticle({
            articleTitle: x.Title,
            municipality: x.Municipality
          }));
        }}
        className="font-bold"
      >
        {x.displayTitle}
      </FooterNavItemClick>)}

      {footerMenuItems ? footerMenuItems.map((x, idx) => <FooterNavItemClick
        key={'pmi-f-' + idx}
        onClick={() => {
          dispatch(setActiveArticle({
            articleTitle: x.Title,
            municipality: x.Municipality
          }));
        }}
      >
        {x.DisplayTitle ? x.DisplayTitle : (x.Title ? x.Title : '')}
      </FooterNavItemClick>) : ''}
    </div>
  );
}

export default FooterNav;
