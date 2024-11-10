// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReportBikeparks } from './reports/ReportsFilter';

import { User, Council, newUserRole, newUserRight } from '../../utils/mock';

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
  | "contacts"
  | "documents"
  | "faq"
  | "home"
  | "logboek"
  | "fietsenstallingen"
  | "fietskluizen"
  | "buurtstallingen"
  | "permits"
  | "presentations"
  | "products"
  | "report"
  | "settings"
  | "trekkingen"
  | "trekkingenprijzen"
  | "users-gebruikersbeheer"
  | "users-exploitanten"
  | "users-beheerders";


interface LeftMenuProps {
  user: User;
  council: Council;
  exploitant?: { getCompanyName: () => string };
  activecomponent: AvailableComponents | undefined;
  onSelect: (component: AvailableComponents) => void;
}

export const isAvailableComponent = (value: string): boolean  => {
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
    "contacts",
    "documents",
    "faq",
    "home",
    "logboek",
    "fietsenstallingen",
    "fietskluizen",
    "buurtstallingen",
    "permits",
    "presentations",
    "products",
    "report",
    "settings",
    "trekkingen",
    "trekkingenprijzen",
    "users-gebruikersbeheer",
    "users-exploitanten",
    "users-beheerders",
  ];
  
  return allcomponents.includes(value);
}

const LeftMenu: React.FC<LeftMenuProps> = ({
  user,
  council,
  exploitant,
  activecomponent,
  onSelect,
}) => {
  // const router = useRouter();
  // const { query } = router;

  // Get current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });


  // Utility functions
  const hasRole = (role: newUserRole) => user.getRole() === role;
  const hasRight = (right: newUserRight) => user.hasRight(right)||true; /* TODO: remove - for testing, all users have all rights */

  const formatLi = (component: AvailableComponents | false, title: string, compact: boolean = false, children?: React.ReactNode) => {
    const isSelected = component === activecomponent;
    const className = `block px-4 py-2 rounded ${isSelected ? "bg-blue-500" : "hover:bg-blue-700"}`;
    const classNamePassive = `block px-4 py-2 rounded`;

    return (
      <li className={compact ? 'mb-2' : 'mb-1'}>
        {component ? (
          <Link href="#" onClick={(e) => { e.preventDefault(); onSelect(component) }} className={className}>
            {title}
          </Link>
        ) : (
          <Link href="#" onClick={(e) => { e.preventDefault() }} className={classNamePassive}>
            {title}
          </Link>
        )}
        {children}
      </li>
    );
  }  

  const renderInternalUserMenu = () => {
    const showSiteBeheer = hasRole('intern_editor') || hasRole('intern_admin') || hasRole('root');
    const showAdminOnly = user.getRole().includes('root') || user.getRole().includes('admin');
    const showUitgifteBarcodes = hasRight('sleutelhangerreeksen');
    const showExterneApis = hasRight('externalApis');
    const showDataleveranciers = hasRight('permits');

    return (
      <>
        { formatLi("home",  'Home') }
        { formatLi("settings", 'Instellingen') }

        {showSiteBeheer &&
          formatLi(false, 'Site beheer', false,
            <ul className="ml-4 mt-1">
              { formatLi("articles-pages", 'Paginabeheer', true) }
              { formatLi("faq", 'FAQ', true) }
            </ul>)
        }

        { formatLi("contacts", 'Gemeenten', ) }
        { formatLi("products", 'Opwaardeerproducten', ) }

        {formatLi(false, 'Rapportages', false,
          <ul className="ml-4 mt-1">
            {formatLi("report", 'Rapportage', true)}
            {formatLi("logboek", 'Logboek', true)}
          </ul>      
        )}

        {showAdminOnly && (
          <>
            {formatLi("users-gebruikersbeheer", 'Gebruikersbeheer', false) }
            {formatLi("users-exploitanten", 'Exploitanten', false) }
            {showDataleveranciers && formatLi("permits", 'Dataleveranciers', false) }
          </>
        )}

        {showUitgifteBarcodes && (
          formatLi(false, 'Barcodes', false,
            <ul className="ml-4 mt-1">
              {formatLi("barcodereeksen-uitgifte-barcodes", 'Uitgifte Barcodes', true)}
              {formatLi("barcodereeksen-sleutelhangers", 'Sleutelhangers', true)}
              {formatLi("barcodereeksen-fietsstickers", 'Fietsstickers', true)}
            </ul>)
          )}

        {showExterneApis && (
          formatLi(false, 'Externe API\'s', false,
            <ul className="ml-4 mt-1">
              { formatLi("apis-overzicht", 'Overzicht API\'s', true) }
              { formatLi("apis-gekoppelde-locaties", 'Gekoppelde locaties', true) }
            </ul>
        ))}
      </>)
  }

  const renderExternalUserMenu = () => {
    const showGegevensGemeente = hasRight('gemeente');
    const showWebsiteBeheer = hasRight('website');
    const showLocatieStallingen = hasRight('locaties');
    const showStatusChipkluizen = council.hasModule('fietskluizen') && hasRight('fietskluizen');
    const showBuurtstallingen = council.hasModule('buurtstallingen') && hasRight('buurtstallingen');
    const showAbonnementen = council.getID() === '1' || (council.hasModule('abonnementen') && hasRight('abonnementen'));
    const showDocumenten = council.hasModule('documenten');
    const showTrekkingenPrijzen = council.hasModule('fietsenwin') && hasRight('fietsenwin');
    const showTrekkingenInTrekkingenPrijzen = (user.getRole().includes('root') || user.getRole().includes('admin'))
    const showDiashow = user.getRole() !== 'exploitant' && hasRight('diashow');
    const showRegistranten = council.hasModule('fms') && hasRight('registranten');
    const showRapporages = council.hasModule('fms') && hasRight('rapportages');
    const showUsers = hasRight('users');
    const showToegangFmsservice = council.hasModule('fms') && hasRight('permits');
    const showGebruikersBeheerUitgebreid = user.getRole() === 'exploitant'
    const showGebruikersBeheerUitgebreidGemeente = user.getRole().includes('admin');
    const showAbonnementenRapporten = true;

    return (
      <>
        { formatLi("home",  'Home') }

        {showGegevensGemeente && (
          formatLi("contacts", 'Gegevens gemeente', false)
        )}

        {showWebsiteBeheer && (
          formatLi("articles-pages", 'Website beheer', false,
            <ul className="ml-4 mt-1">
              { formatLi("articles-pages", 'Paginabeheer', true)}
              { formatLi("faq", 'FAQ', true)}
            </ul>
          )
        )}

        {showLocatieStallingen && (
          formatLi("fietsenstallingen", 'Locatie stallingen', false)
        )}

        {showStatusChipkluizen && (
          formatLi("fietskluizen", 'Status chipkluizen', false)
        )}

        {showBuurtstallingen && (
          formatLi("buurtstallingen", 'Buurtstallingen / fietstrommels', false)
        )}

        {showAbonnementen && (
          formatLi(false, 'Abonnementen', false,
          <ul className="ml-4 mt-1">
            { formatLi("abonnementsvormen", 'Abonnementsvormen', true)}
            { formatLi("abonnementen", 'Abonnementen', true)}
          </ul>
        ))}

        {showDocumenten && (
          formatLi("documents", 'Documenten', false)
        )}

        {showTrekkingenPrijzen && (
          <>
            { showTrekkingenInTrekkingenPrijzen ? (
              formatLi(false, 'Trekkingen &amp; Prijzen', false,
                <ul className="ml-4 mt-1">
                  { formatLi("trekkingen", 'Trekkingen', true)}
                  { formatLi("trekkingenprijzen", 'Prijzen', true)}
                </ul>
              )
            ) : (
              formatLi("trekkingenprijzen", 'Prijzen', false)
            )}
          </>
        )}

        {showDiashow && (
          formatLi("presentations", 'Diashow', false)
        )}

        {showRegistranten && (
          formatLi("accounts", 'Registranten', false)
        )}

        {showRapporages && (
          formatLi(false, 'Rapportages', false, 
           <ul className="ml-4 mt-1">
            { formatLi("report", 'Rapportage', true)}
            { formatLi("logboek", 'Logboek', true) }
            </ul>
        ))}

        {showUsers && (
          <>
            {showGebruikersBeheerUitgebreid && (
              formatLi(false, 'Gebruikersbeheer', false,
                <ul className="ml-4 mt-1">
                  { showGebruikersBeheerUitgebreidGemeente && (
                    formatLi("users-gebruikersbeheer", `Gebruikers ${council.getCompanyName()}`, true)
                  )}
                  {formatLi("users-exploitanten", `Gebruikers ${exploitant?.getCompanyName()}`, true)}
                  {formatLi("users-beheerders", 'Beheerders', true)}
                </ul>)
            )}
            {!showGebruikersBeheerUitgebreid && (
              formatLi("users-gebruikersbeheer", 'Gebruikersbeheer', false)
            )}
          </>
        )}

        {showToegangFmsservice && (
          formatLi("permits", 'Toegang fmsservice', false)
        )}
      </>
    )
  }
  
  return (
    <ul id="leftMenu" className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <li id="userinfo" className="mb-6">
        <div className="font-semibold">{user.displayName}</div>
        <div className="text-sm">
          {formattedDate} {formattedTime}
        </div>
      </li>

      {(!hasRole('user') || !council) && (
        renderInternalUserMenu()
      )}
      {hasRole('user') && council && (
        renderExternalUserMenu()
      )}
    </ul>
  );
};

export default LeftMenu;
