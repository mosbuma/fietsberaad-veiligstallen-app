// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';

import {  } from '../../utils/mock';
import { type User } from "next-auth";
import { userHasRole, userHasRight, userHasModule } from "~/utils/mock";
import { VSContactDataprovider, VSContactExploitant, VSContactGemeente } from '~/types';

export type AvailableComponents =
  | "abonnementen"
  | "abonnementsvormen"
  | "accounts"
  | "apis-gekoppelde-locaties"
  | "apis-overzicht"
  | "articles-abonnementen"
  | "articles-articles"
  | "articles-buurtstallingen"
  | "articles-fietskluizen"
  | "articles-pages"
  | "barcodereeksen-uitgifte-barcodes"
  | "barcodereeksen-sleutelhangers"
  | "barcodereeksen-fietsstickers"
  | "contacts-gemeenten"
  | "contacts-exploitanten"
  | "contacts-dataproviders"
  | "contacts-admin"
  | "explore-users"
  | "explore-gemeenten"
  | "explore-exploitanten"
  | "database"
  | "documents"
  | "export"
  | "faq"
  | "home"
  | "logboek"
  | "fietsenstallingen"
  | "fietskluizen"
  | "buurtstallingen"
  | "presentations"
  | "products"
  | "report"
  | "settings"
  | "stalling-info"
  | "trekkingen"
  | "trekkingenprijzen"
  | "users-gebruikersbeheer"
  | "users-beheerders";


export const isAvailableComponent = (value: string): boolean => {
  const allcomponents = [
    "abonnementen",
    "abonnementsvormen",
    "accounts",
    "apis-gekoppelde-locaties",
    "apis-overzicht",
    "articles-abonnementen",
    "articles-articles",
    "articles-buurtstallingen",
    "articles-fietskluizen",
    "articles-pages",
    "barcodereeksen-uitgifte-barcodes",
    "barcodereeksen-sleutelhangers",
    "barcodereeksen-fietsstickers",
    "contacts-gemeenten",
    "contacts-exploitanten",
    "contacts-dataproviders",
    "explore-users",
    "explore-gemeenten",
    "explore-exploitanten",
    "contacts-admin",
    "database",
    "documents",
    "export",
    "faq",
    "home",
    "logboek",
    "fietsenstallingen",
    "fietskluizen",
    "buurtstallingen",
    "presentations",
    "products",
    "report",
    "settings",
    "trekkingen",
    "trekkingenprijzen",
    "users-gebruikersbeheer",
    "users-beheerders",
  ];

  return allcomponents.includes(value);
}

interface LeftMenuProps {
  user?: User;
  activecontact: VSContactGemeente | VSContactExploitant | VSContactDataprovider | undefined;
  activecomponent: AvailableComponents | undefined;
  onSelect: (component: AvailableComponents) => void;
}

const LeftMenu: React.FC<LeftMenuProps> = ({
  user,
  activecontact,
  activecomponent,
  onSelect,
}) => {
  // const router = useRouter();
  // const { query } = router;

  const formatLi = (component: AvailableComponents | false, title: string, compact: boolean = false, children?: React.ReactNode) => {
    const isSelected = component === activecomponent;
    const className = `block px-4 py-2 rounded ${isSelected ? "font-bold" : "hover:bg-gray-200"}`;
    const style = isSelected ? { backgroundColor: 'rgba(31, 153, 210, 0.1)' } : {};
    const classNamePassive = `block px-4 py-2 rounded`;

    return (
      <li className={compact ? 'mb-2' : 'mb-1'}>
        {component ? (
          <Link href="#" onClick={(e) => { e.preventDefault(); onSelect(component) }} className={className} style={style}>
            {title}
          </Link>
        ) : (
          <Link href="#" onClick={(e) => { e.preventDefault() }} className={classNamePassive} style={style}>
            {title}
          </Link>
        )}
        {children}
      </li>
    );
  }

  // const renderFullMenu = (isInternal: boolean, isExternal: boolean) => {
  //   return (
  //     <>
  //       {isInternal && renderInternalUserMenu()}
  //       {isExternal && renderExternalUserMenu()}
  //     </>
  //   )
  // }

  const renderInternalUserMenu = () => {
    // Base conditions
    const showSiteBeheer = userHasRole(user, 'intern_editor') || userHasRole(user, 'intern_admin') || userHasRole(user, 'root');
    const showAdminOnly = userHasRole(user, 'root') || userHasRole(user, 'admin');
    const showUitgifteBarcodes = userHasRight(user, 'sleutelhangerreeksen');
    const showExterneApis = userHasRight(user, 'externalApis');
    const showDataleveranciers = userHasRight(user, 'contacts-dataproviders');
  
    // Menu item visibility
    const showHome = true;
    const showInstellingen = true;
    const showProducts = true;
    const showReports = true;
    const showExport = true;
    const showLogboek = true;
    const showGebruikersbeheer = showAdminOnly;
    const showExploitanten = showAdminOnly;
    const showDataleveranciersMenu = showAdminOnly && showDataleveranciers;
    const showDatabase = showAdminOnly;
    const showStallingInfo = showAdminOnly;
    const showGemeenten = showAdminOnly;
    const showBeheerders = showAdminOnly;
  
    return (
      <>
        {showHome && formatLi("home", 'Home')}
        {showInstellingen && formatLi("settings", 'Instellingen')}
  
        {showSiteBeheer &&
          formatLi(false, 'Site beheer', false,
            <ul className="ml-4 mt-1">
              {showSiteBeheer && formatLi("articles-pages", 'Paginabeheer', true)}
              {showSiteBeheer && formatLi("faq", 'FAQ', true)}
            </ul>)
        }
  
        {showGemeenten && formatLi("contacts-gemeenten", 'Gemeenten')}
        {showBeheerders && formatLi("contacts-admin", 'Beheerders')}
  
        {showProducts && formatLi("products", 'Opwaardeerproducten')}
        {showReports && formatLi("report", 'Rapportages', true)}
        {showExport && formatLi("export", 'Export', true)}
        {showLogboek && formatLi("logboek", 'Logboek', true)}
        {showGebruikersbeheer && formatLi("users-gebruikersbeheer", 'Gebruikersbeheer', false)}
        {showExploitanten && formatLi("contacts-exploitanten", 'Exploitanten', false)}
        {showDataleveranciersMenu && formatLi("contacts-dataproviders", 'Dataleveranciers', false)}
  
        {showUitgifteBarcodes && (
          formatLi(false, 'Barcodes', false,
            <ul className="ml-4 mt-1">
              {showUitgifteBarcodes && formatLi("barcodereeksen-uitgifte-barcodes", 'Uitgifte Barcodes', true)}
              {showUitgifteBarcodes && formatLi("barcodereeksen-sleutelhangers", 'Sleutelhangers', true)}
              {showUitgifteBarcodes && formatLi("barcodereeksen-fietsstickers", 'Fietsstickers', true)}
            </ul>)
        )}
  
        {showExterneApis && (
          formatLi(false, 'Externe API\'s', false,
            <ul className="ml-4 mt-1">
              {showExterneApis && formatLi("apis-overzicht", 'Overzicht API\'s', true)}
              {showExterneApis && formatLi("apis-gekoppelde-locaties", 'Gekoppelde locaties', true)}
            </ul>
          ))}
  
        {showDatabase && formatLi("database", 'Database', false)}
        {showStallingInfo && formatLi("stalling-info", 'Stalling info', false)}
      </>
    )
  }

  const renderExternalUserMenu = () => {
    // Base conditions
    const showContactsGemeente = userHasRight(user, 'gemeente');
    const showWebsiteBeheer = userHasRight(user, 'website');
    const showLocatieStallingen = userHasRight(user, 'locaties');
    const showStatusChipkluizen = userHasModule(user, 'fietskluizen') && userHasRight(user, 'fietskluizen');
    const showBuurtstallingen = userHasModule(user, 'buurtstallingen') && userHasRight(user, 'buurtstallingen');
    const showAbonnementen = activecontact?.ID === '1' || (userHasModule(user, 'abonnementen') && userHasRight(user, 'abonnementen'));
    const showDocumenten = userHasModule(user, 'documenten');
    const showDiashow = userHasRole(user,'exploitant') && userHasRight(user, 'diashow');
    const showRegistranten = userHasModule(user, 'fms') && userHasRight(user, 'registranten');
    const showRapportages = userHasModule(user, 'fms') && userHasRight(user, 'rapportages');
    const showGebruikersBeheer = userHasRight(user, 'users');
    const showToegangFmsservice = userHasModule(user, 'fms') && userHasRight(user, 'contacts-dataproviders');
    const showGebruikersBeheerUitgebreid = userHasRole(user, 'exploitant');
    
    // Menu item visibility
    const showHome = true;
    const showAbonnementenVormen = showAbonnementen;
    const showAbonnementenBeheer = showAbonnementen;
    const showGebruikersBeheerGemeente = showGebruikersBeheerUitgebreid && userHasRole(user, 'admin');
    const showGebruikersBeheerExploitant = showGebruikersBeheerUitgebreid && userHasRole(user, 'exploitant');
    const showGebruikersBeheerBeheerders = showGebruikersBeheerUitgebreid;

    return (
      <>
        {showHome && formatLi("home", 'Home')}

        {showContactsGemeente && formatLi("contacts-gemeenten", 'Gegevens gemeente', false)}

        {showWebsiteBeheer && formatLi(false, 'Website beheer', false,
          <ul className="ml-4 mt-1">
            {formatLi("articles-pages", 'Paginabeheer', true)}
            {formatLi("faq", 'FAQ', true)}
          </ul>
        )}

        {showLocatieStallingen && formatLi("fietsenstallingen", 'Locatie stallingen', false)}
        {showStatusChipkluizen && formatLi("fietskluizen", 'Status chipkluizen', false)}
        {showBuurtstallingen && formatLi("buurtstallingen", 'Buurtstallingen / fietstrommels', false)}

        {(showAbonnementenVormen||showAbonnementenBeheer) && formatLi(false, 'Abonnementen', false,
          <ul className="ml-4 mt-1">
            {showAbonnementenVormen && formatLi("abonnementsvormen", 'Abonnementsvormen', true)}
            {showAbonnementenBeheer && formatLi("abonnementen", 'Abonnementen', true)}
          </ul>
        )}

        {showDocumenten && formatLi("documents", 'Documenten', false)}

        {showDiashow && formatLi("presentations", 'Diashow', false)}
        {showRegistranten && formatLi("accounts", 'Registranten', false)}

        {showRapportages && formatLi(false, 'Rapportages', false,
          <ul className="ml-4 mt-1">
            { formatLi("report", 'Rapportage', true)}
            { formatLi("export", 'Export', true)}
            { formatLi("logboek", 'Logboek', true)}
          </ul>
        )}

        {showGebruikersBeheer && (
          showGebruikersBeheerUitgebreid ? (
            formatLi(false, 'Gebruikersbeheer', false,
              <ul className="ml-4 mt-1">
                {showGebruikersBeheerGemeente && formatLi("users-gebruikersbeheer", `Gebruikers ${activecontact?.CompanyName}`, true)}
                {showGebruikersBeheerExploitant && formatLi("contacts-exploitanten", `Gebruikers ${activecontact?.CompanyName}`, true)}
                {showGebruikersBeheerBeheerders && formatLi("users-beheerders", 'Beheerders', true)}
              </ul>
            )
          ) : (
            formatLi("users-gebruikersbeheer", 'Gebruikersbeheer', false)
          )
        )}

        {showToegangFmsservice && formatLi("contacts-dataproviders", 'Toegang fmsservice', false)}
      </>
    )
  }

  // for now, only show the temporary production menu in production
  const isProduction = process.env.NODE_ENV === 'production';
  if(isProduction) {
    return (
      <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
        {formatLi("report", 'Rapportages', true)}
      </ul>
    )
  }

  return (
    <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
      {(!userHasRole(user, 'user') || !activecontact) && (
        renderInternalUserMenu()
      )}
      {userHasRole(user, 'user') && activecontact && (
        renderExternalUserMenu()
      )}
    </ul>
  );
};

export default LeftMenu;
