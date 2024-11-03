// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { mockUser, mockCouncil, mockExploitant, User, Council, Exploitant,newUserRole, newUserRight, newModule } from '../../utils/mock';

import AbonnementenComponent from './abonnementen';
import AccountsComponent from './accounts';
import ApisComponent from './apis';
import ArticlesComponent from './articles';
import BarcodereeksenComponent from './barcodereeksen';
import ContactsComponent from './contacts';
import DocumentsComponent from './documenten';
import FaqComponent from './faq';
import HomeComponent from './home';
import LogboekComponent from './logboek';
import ParkingComponent from './fietsenstallingen';
import PermitsComponent from './permits';
import PresentationsComponent from './presentations';
import ProductsComponent from './producten';
import ReportComponent from './reports/';
import SettingsComponent from './settings';
import TrekkingenComponent from './trekkingen';
import UsersComponent from './users';

/* Prompts 

can you create a table that lists the meny entries  and subentries in both renderXXXUserMenu functions, followed by columns "used in internal menu", "used in external menu", "for roles", "for rights"

can you check if all entries in this coldfusion menu are present in the converted menu in leftmenu?

*/

interface LeftMenuProps {
  user: User;
  council: Council;
  siteID?: string;
  exploitant?: { getCompanyName: () => string };
  onSelect: (component: React.ReactNode) => void;
}

const LeftMenu: React.FC<LeftMenuProps> = ({
  user,
  council,
  siteID,
  exploitant,
  onSelect,
}) => {
  const router = useRouter();
  const { query } = router;

  // Utility functions
  const hasRole = (role: newUserRole) => user.getRole() === role;
  const hasRight = (right: newUserRight) => user.hasRight(right)||true; /* TODO: remove - for testing, all users have all rights */
  const isSelected = (module: string, processEntity?: string, view?: string) => {
    if (query.module !== module) return false;
    if (processEntity && query.processEntity !== processEntity) return false;
    if (view && query.view !== view) return false;
    return true;
  };

  const formatLi = (component: React.ReactNode, title: string, isSelected: boolean = false, compact: boolean = false, children?: React.ReactNode) => {
    return <li className={compact?'mb-2':'mb-1'}>
      <Link href="#" onClick={() => onSelect(component)} className={`block px-4 py-2 rounded ${isSelected?"bg-blue-500":"hover:bg-blue-700"}`}>{title}</Link>
      {children}
    </li>
  }  

  const renderInternalUserMenu = () => {
    return (
      <>
      { formatLi(<HomeComponent />, 'Home') }
      { formatLi(<SettingsComponent />, 'Instellingen') }

      {(hasRole('intern_editor') || hasRole('intern_admin') || hasRole('root')) &&
        formatLi(<ArticlesComponent type="articles" />, 'Site beheer', true, false,
          <ul className="ml-4 mt-1">
            { formatLi(<ArticlesComponent type="pages" />, 'Paginabeheer', isSelected('articles'), true) }
            { formatLi(<FaqComponent />, 'FAQ', isSelected('faq'), true) }
          </ul>)
      }

      { formatLi(<ContactsComponent />, 'Gemeenten', isSelected('contacts')) }
      { formatLi(<ProductsComponent />, 'Opwaardeerproducten', isSelected('producten')) }

      {formatLi(<ReportComponent siteID={1} council={mockCouncil} report="fietskluizen" subscriptionTypes={[]} dateFirstTransactions={new Date()} limitSelectDate={new Date()} jaar={2024} maanden={[]} bikeparks={[]} onSubmit={() => {}} />, 'Rapportages', ['reports', 'logboek'].includes(query.module as string), false,
        <ul className="ml-4 mt-1">
          {formatLi(<ReportComponent siteID={1} council={mockCouncil} report="fietskluizen" subscriptionTypes={[]} dateFirstTransactions={new Date()} limitSelectDate={new Date()} jaar={2024} maanden={[]} bikeparks={[]} onSubmit={() => {}} />, 'Rapportage', isSelected('reports'), true)}
          {formatLi(<LogboekComponent />, 'Logboek', isSelected('logboek'), true)}
      </ul>      
    )}

      {/* Gebruikersbeheer (Admin Only) */}
      {(user.getRole().includes('root') || user.getRole().includes('admin')) && (
        <>
          {formatLi(<UsersComponent />, 'Gebruikersbeheer', isSelected('users', 'user')) }
          {formatLi(<UsersComponent />, 'Exploitanten', isSelected('users', 'exploitant')) }
          {hasRight('permits') && formatLi(<PermitsComponent />, 'Dataleveranciers', isSelected('permits')) }
        </>
      )}

      {/* Uitgifte Barcodes */}
      {hasRight('sleutelhangerreeksen') && (
        formatLi(<BarcodereeksenComponent type="uitgifte-barcodes" />, 'Uitgifte barcodes', isSelected('barcodereeksen', 'uitgifte-barcodes'), false,
          <ul className="ml-4 mt-1">
            {formatLi(<BarcodereeksenComponent type="sleutelhangers" />, 'Sleutelhangers', isSelected('barcodereeksen', 'sleutelhangers'), true)}
            {formatLi(<BarcodereeksenComponent type="fietsstickers" />, 'Fietsstickers', isSelected('barcodereeksen', 'stickers'), true)}
          </ul>)
        )}

      {/* Externe APIs */}
      {hasRight('externalApis') && (
        formatLi(<ApisComponent />, 'Externe API\'s', isSelected('apis'), false,
          <ul className="ml-4 mt-1">
            { formatLi(<ApisComponent />, 'Overzicht API\'s', isSelected('apis', 'apis'), true) }
            { formatLi(<ApisComponent />, 'Gekoppelde locaties', isSelected('apis', 'locations'), true) }
          </ul>
      ))}
    </>)
  }

  /* TODO: convert to formatLi */
  const renderExternalUserMenu = () => {
    return (
<>
          {/* Home */}
          { formatLi(<HomeComponent />, 'Home') }

          {/* Gegevens gemeente */}
          {hasRight('gemeente') && (
            formatLi(<ContactsComponent />, 'Gegevens gemeente', isSelected('contacts'), false)
          )}

          {/* Website Beheer */}
          {hasRight('website') && (
            formatLi(<ArticlesComponent  type="pages"/>, 'Website beheer', ['articles', 'faq', 'testimonials'].includes(query.module as string), false,
              <ul className="ml-4 mt-1">
                { formatLi(<ArticlesComponent type="pages" />, 'Paginabeheer', isSelected('articles'), true)}
                { formatLi(<FaqComponent />, 'FAQ', isSelected('faq'), true)}
              </ul>
            )
          )}

          {/* Locatie Stallingen */}
          {hasRight('locaties') && (
            formatLi(<ParkingComponent type="fietsenstallingen"/>, 'Locatie stallingen', isSelected('fietsenstallingen'), false)
          )}

          {/* Status Chipkluizen */}
          {council.hasModule('fietskluizen') && hasRight('fietskluizen') && (
            formatLi(<ParkingComponent type="fietskluizen"/>, 'Status chipkluizen', isSelected('fietskluizen'), false)
          )}

          {/* Buurtstallingen / Fietstrommels */}
          {council.hasModule('buurtstallingen') && hasRight('buurtstallingen') && (
            formatLi(<ParkingComponent type="buurtstallingen"/>, 'Buurtstallingen / fietstrommels', isSelected('buurtstallingen'), false)
          )}

          {/* Abonnementen */}
          {(council.getID() === '1' ||
            (council.hasModule('abonnementen') && hasRight('abonnementen'))) && (
              formatLi(<AbonnementenComponent type="abonnementen"/>, 'Abonnementen', isSelected('abonnementen'), false,
              <ul className="ml-4 mt-1">
                { formatLi(<AbonnementenComponent type="abonnementsvormen"/>, 'Abonnementsvormen', isSelected('abonnementen', undefined, 'abonnementsvormen'), true)}
                { formatLi(<AbonnementenComponent type="abonnementen"/>, 'Abonnementen', isSelected('abonnementen', undefined, 'abonnementen'), true)}
              </ul>
          ))}

          {/* Documenten */}
          {council.hasModule('documenten') && (
            formatLi(<DocumentsComponent />, 'Documenten', isSelected('documenten'), false)
          )}

          {/* Trekkingen & Prijzen */}
          {council.hasModule('fietsenwin') && hasRight('fietsenwin') && (
            <>
              {(user.getRole().includes('root') || user.getRole().includes('admin')) ? (
                formatLi(<TrekkingenComponent type="trekkingen" />, 'Trekkingen &amp; Prijzen', ['trekkingen', 'prijzen'].includes(query.module as string), false,
                  <ul className="ml-4 mt-1">
                    { formatLi(<TrekkingenComponent type="trekkingen" />, 'Trekkingen', isSelected('trekkingen'), true)}
                    { formatLi(<TrekkingenComponent type="prijzen" />, 'Prijzen', isSelected('prijzen'), true)}
                  </ul>
                )
              ) : (
                formatLi(<TrekkingenComponent type="prijzen" />, 'Prijzen', isSelected('prijzen'), false)
              )}
            </>
          )}

          {user.getRole() !== 'exploitant' && hasRight('diashow') && (
            formatLi(<PresentationsComponent />, 'Diashow', isSelected('presentations'), false)
          )}

          {council.hasModule('fms') && hasRight('registranten') && (
            formatLi(<AccountsComponent />, 'Registranten', isSelected('accounts'), false)
          )}

          {council.hasModule('fms') && hasRight('rapportages') && (
            formatLi(<ReportComponent siteID={1} council={mockCouncil} report="fietskluizen" subscriptionTypes={[]} dateFirstTransactions={new Date()} limitSelectDate={new Date()} jaar={2024} maanden={[]} bikeparks={[]} onSubmit={() => {}} />, 'Rapportages', ['reports', 'logboek'].includes(query.module as string), false,
             <ul className="ml-4 mt-1">
              { formatLi(<ReportComponent siteID={1} council={mockCouncil} report="fietskluizen" subscriptionTypes={[]} dateFirstTransactions={new Date()} limitSelectDate={new Date()} jaar={2024} maanden={[]} bikeparks={[]} onSubmit={() => {}} />, 'Rapportage', isSelected('reports'), true)}
                formatLi(<LogboekComponent />, 'Logboek', isSelected('logboek'), true)
              </ul>
          ))}

          {hasRight('users') && (
            <>
              {user.getRole() === 'exploitant' ? (
                formatLi(<UsersComponent />, 'Gebruikersbeheer', isSelected('users', 'exploitant'), false,
                  <ul className="ml-4 mt-1">
                    {user.getRole().includes('admin') && (
                      formatLi(<UsersComponent />, 'Gebruikers {council.getCompanyName()}', isSelected('users', 'user'), true)
                    )}
                    {formatLi(<UsersComponent />, `Gebruikers ${exploitant?.getCompanyName()}`, isSelected('users', 'exploitant'), true)}
                    {formatLi(<UsersComponent type="beheerder"/>, 'Beheerders', isSelected('users', 'beheerder'), true)}
                  </ul>)
              ) : (
                <>
                  {(user.getRole().includes('root') || user.getRole().includes('admin')) && (
                    formatLi(<UsersComponent />, 'Gebruikersbeheer', isSelected('users', 'user'), false)
                  )}
                  {user.getRole() === 'exploitant' && (
                    formatLi(<UsersComponent />, 'Gebruikersbeheer', isSelected('users', 'exploitant'), false,
                      <ul className="ml-4 mt-1">
                      { formatLi(<UsersComponent />, 'Administrators', isSelected('users', 'exploitant'), true) }
                      { formatLi(<UsersComponent type="beheerder"/>, 'Beheerders', isSelected('users', 'beheerder'), true) }
                      </ul>
                  ))}
                </>
              )}
            </>
          )}

          {council.hasModule('fms') && hasRight('permits') && (
            formatLi(<PermitsComponent />, 'Toegang fmsservice', isSelected('permits', 'permissions'), false)
          )}
        </>)
  }
  
  // Get current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

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
