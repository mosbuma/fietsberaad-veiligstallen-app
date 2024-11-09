// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReportBikeparks } from './reports/ReportsFilter';

import { User, Council, newUserRole, newUserRight } from '../../utils/mock';

export enum AvailableComponents {
  abonnementen = "abonnementen",
  abonnementsvormen = "abonnementsvormen",
  accounts = "accounts",
  apisgekoppeldelocaties = "apis-gekoppelde-locaties",
  apisoverzicht = "apis-overzicht",
  articlesabonnementen = "articles-abonnementen",
  articlesarticles = "articles-articles",
  articlesbuurtstallingen = "articles-buurtstallingen",
  articlesfietskluizen = "articles-fietskluizen",
  articlespages = "articles-pages",
  barcodereeksenuitgiftebarcodes = "barcodereeksen-uitgifte-barcodes",
  barcodereeksensleutelhangers = "barcodereeksen-sleutelhangers",
  barcodereeksenfietsstickers = "barcodereeksen-fietsstickers",
  contacts = "contacts",
  documents = "documents",
  faq = "faq",
  home = "home",
  logboek = "logboek",
  fietsenstallingen = "fietsenstallingen",
  fietskluizen = "fietskluizen",
  buurtstallingen = "buurtstallingen",
  permits = "permits",
  presentations = "presentations",
  products = "products",
  report = "report",
  settings = "settings",
  trekkingen = "trekkingen",
  trekkingenprijzen = "trekkingenprijzen",
  usersgebruikersbeheer = "users-gebruikersbeheer",
  usersexploitanten = "users-exploitanten",
  usersbeheerders = "users-beheerders"
}

interface LeftMenuProps {
  user: User;
  council: Council;
  exploitant?: { getCompanyName: () => string };
  bikeparks: ReportBikeparks;
  activecomponent: AvailableComponents;
  onSelect: (component: AvailableComponents) => void;
}

const LeftMenu: React.FC<LeftMenuProps> = ({
  user,
  council,
  exploitant,
  bikeparks,
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
    return <li className={compact?'mb-2':'mb-1'}>
      <Link href="#" onClick={() => component && onSelect(component)} className={`block px-4 py-2 rounded ${isSelected?"bg-blue-500":"hover:bg-blue-700"}`}>{title}</Link>
      {children}
    </li>
  }  

  const renderInternalUserMenu = () => {
    const showSiteBeheer = hasRole('intern_editor') || hasRole('intern_admin') || hasRole('root');
    const showAdminOnly = user.getRole().includes('root') || user.getRole().includes('admin');
    const showUitgifteBarcodes = hasRight('sleutelhangerreeksen');
    const showExterneApis = hasRight('externalApis');
    const showDataleveranciers = hasRight('permits');

    return (
      <>
        { formatLi(AvailableComponents.home,  'Home') }
        { formatLi(AvailableComponents.settings, 'Instellingen') }

        {showSiteBeheer &&
          formatLi(false, 'Site beheer', false,
            <ul className="ml-4 mt-1">
              { formatLi(AvailableComponents.articlespages, 'Paginabeheer', true) }
              { formatLi(AvailableComponents.faq, 'FAQ', true) }
            </ul>)
        }

        { formatLi(AvailableComponents.contacts, 'Gemeenten', ) }
        { formatLi(AvailableComponents.products, 'Opwaardeerproducten', ) }

        {formatLi(false, 'Rapportages', false,
          <ul className="ml-4 mt-1">
            {formatLi(AvailableComponents.report, 'Rapportage', true)}
            {formatLi(AvailableComponents.logboek, 'Logboek', true)}
          </ul>      
        )}

        {showAdminOnly && (
          <>
            {formatLi(AvailableComponents.usersgebruikersbeheer, 'Gebruikersbeheer', ) }
            {formatLi(AvailableComponents.usersexploitanten, 'Exploitanten', ) }
            {showDataleveranciers && formatLi(AvailableComponents.permits, 'Dataleveranciers', ) }
          </>
        )}

        {showUitgifteBarcodes && (
          formatLi(false, 'Uitgifte barcodes', false,
            <ul className="ml-4 mt-1">
              {formatLi(AvailableComponents.barcodereeksenuitgiftebarcodes, 'Uitgifte Barcodes', true)}
              {formatLi(AvailableComponents.barcodereeksensleutelhangers, 'Sleutelhangers', true)}
              {formatLi(AvailableComponents.barcodereeksenfietsstickers, 'Fietsstickers', true)}
            </ul>)
          )}

        {showExterneApis && (
          formatLi(false, 'Externe API\'s', false,
            <ul className="ml-4 mt-1">
              { formatLi(AvailableComponents.apisoverzicht, 'Overzicht API\'s', true) }
              { formatLi(AvailableComponents.apisgekoppeldelocaties, 'Gekoppelde locaties', true) }
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
        { formatLi(AvailableComponents.home,  'Home') }

        {showGegevensGemeente && (
          formatLi(AvailableComponents.contacts, 'Gegevens gemeente', false)
        )}

        {showWebsiteBeheer && (
          formatLi(AvailableComponents.articlespages, 'Website beheer', false,
            <ul className="ml-4 mt-1">
              { formatLi(AvailableComponents.articlespages, 'Paginabeheer', true)}
              { formatLi(AvailableComponents.faq, 'FAQ', true)}
            </ul>
          )
        )}

        {showLocatieStallingen && (
          formatLi(AvailableComponents.fietsenstallingen, 'Locatie stallingen', false)
        )}

        {showStatusChipkluizen && (
          formatLi(AvailableComponents.fietskluizen, 'Status chipkluizen', false)
        )}

        {showBuurtstallingen && (
          formatLi(AvailableComponents.buurtstallingen, 'Buurtstallingen / fietstrommels', false)
        )}

        {showAbonnementen && (
          formatLi(false, 'Abonnementen', false,
          <ul className="ml-4 mt-1">
            { formatLi(AvailableComponents.abonnementsvormen, 'Abonnementsvormen', true)}
            { formatLi(AvailableComponents.abonnementen, 'Abonnementen', true)}
          </ul>
        ))}

        {showDocumenten && (
          formatLi(AvailableComponents.documents, 'Documenten', false)
        )}

        {showTrekkingenPrijzen && (
          <>
            { showTrekkingenInTrekkingenPrijzen ? (
              formatLi(false, 'Trekkingen &amp; Prijzen', false,
                <ul className="ml-4 mt-1">
                  { formatLi(AvailableComponents.trekkingen, 'Trekkingen', true)}
                  { formatLi(AvailableComponents.trekkingenprijzen, 'Prijzen', true)}
                </ul>
              )
            ) : (
              formatLi(AvailableComponents.trekkingenprijzen, 'Prijzen', false)
            )}
          </>
        )}

        {showDiashow && (
          formatLi(AvailableComponents.presentations, 'Diashow', false)
        )}

        {showRegistranten && (
          formatLi(AvailableComponents.accounts, 'Registranten', false)
        )}

        {showRapporages && (
          formatLi(false, 'Rapportages', false, 
           <ul className="ml-4 mt-1">
            { formatLi(AvailableComponents.report, 'Rapportage', true)}
            { formatLi(AvailableComponents.logboek, 'Logboek', true) }
            </ul>
        ))}

        {showUsers && (
          <>
            {showGebruikersBeheerUitgebreid && (
              formatLi(false, 'Gebruikersbeheer', false,
                <ul className="ml-4 mt-1">
                  { showGebruikersBeheerUitgebreidGemeente && (
                    formatLi(AvailableComponents.usersgebruikersbeheer, `Gebruikers ${council.getCompanyName()}`, true)
                  )}
                  {formatLi(AvailableComponents.usersexploitanten, `Gebruikers ${exploitant?.getCompanyName()}`, true)}
                  {formatLi(AvailableComponents.usersbeheerders, 'Beheerders', true)}
                </ul>)
            )}
            {!showGebruikersBeheerUitgebreid && (
              formatLi(AvailableComponents.usersgebruikersbeheer, 'Gebruikersbeheer', false)
            )}
          </>
        )}

        {showToegangFmsservice && (
          formatLi(AvailableComponents.permits, 'Toegang fmsservice', false)
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
