// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { mockUser, mockCouncil, mockExploitant } from '../../utils/mock';

import HomeComponent from './home';
import SettingsComponent from './settings';
import ArticlesComponent from './articles';
import FaqComponent from './faq';
import ContactsComponent from './contacts';
import ProductsComponent from './producten';
import ReportComponent from './reports/';
import LogboekComponent from './logboek';
import UsersComponent from './users';
import PermitsComponent from './permits';
import BarcodereeksenComponent from './barcodereeksen';
import ApisComponent from './apis';
// Define interfaces for props
export type newModule = 'articles' | 'faq' | 'contacts' | 'producten' | 'reports' | 'logboek' | 'users' | 'permits' | 'barcodereeksen' | 'apis';

export type newUserRole = 'intern_admin' | 'extern_admin' | 'extern_redacteur' | 'exploitantbeheerder' | 'dataanalist';

export type newUserRight = 'gemeente' | 'website' | 'locaties' | 'fietskluizen' | 'buurtstallingen' | 'abonnementen' | 'documenten' | 'fietsenwin' | 'diashow' | 'accounts' | 'rapportages' | 'externalApis' | 'permits' | 'sleutelhangerreeksen';

export interface User {
  displayName: string;
  role: newUserRole;
  hasRight: (right: newUserRight) => boolean;
  getRole: () => newUserRole;
}

export interface Council {
  hasModule: (moduleName: string) => boolean;
  hasSubscriptionType: () => boolean;
  getID: () => string;
  getCompanyName: () => string;
}

interface LeftMenuProps {
  user: User;
  council: Council;
  siteID?: string;
  exploitant?: { getCompanyName: () => string };
  onSelect: (component: React.ReactNode) => void;
}

export interface Exploitant {
  getCompanyName: () => string;
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

      {hasRole('intern_admin') && 
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
          <li className="mb-2">
            <Link
              href="#"
              onClick={() => onSelect(<HomeComponent />)}
              className="block px-4 py-2 rounded hover:bg-blue-700"
            >
              Home
            </Link>
          </li>

          {/* Gegevens gemeente */}
          {hasRight('gemeente') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/contacts', query: { ...query, itemID: siteID } }}
                className={`block px-4 py-2 rounded ${
                  isSelected('contacts') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Gegevens gemeente
              </Link>
            </li>
          )}

          {/* Website Beheer */}
          {hasRight('website') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/articles', query }}
                className={`block px-4 py-2 rounded ${
                  ['articles', 'faq', 'testimonials'].includes(query.module as string)
                    ? 'bg-blue-500'
                    : 'hover:bg-blue-700'
                }`}
              >
                Website beheer
              </Link>
              <ul className="ml-4 mt-1">
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/articles', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('articles') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    Paginabeheer
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/faq', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('faq') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* Locatie Stallingen */}
          {hasRight('locaties') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/fietsenstallingen', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('fietsenstallingen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Locatie stallingen
              </Link>
            </li>
          )}

          {/* Status Chipkluizen */}
          {council.hasModule('fietskluizen') && hasRight('fietskluizen') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/fietskluizen', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('fietskluizen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Status chipkluizen
              </Link>
            </li>
          )}

          {/* Buurtstallingen / Fietstrommels */}
          {council.hasModule('buurtstallingen') && hasRight('buurtstallingen') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/buurtstallingen', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('buurtstallingen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Buurtstallingen / fietstrommels
              </Link>
            </li>
          )}

          {/* Abonnementen */}
          {(council.getID() === '1' ||
            (council.hasModule('abonnementen') && hasRight('abonnementen'))) && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/abonnementen', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('abonnementen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Abonnementen
              </Link>
              <ul className="ml-4 mt-1">
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/abonnementen', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('abonnementen', undefined, 'abonnementsvormen')
                        ? 'bg-blue-500'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    Abonnementsvormen
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/abonnementen', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('abonnementen', undefined, 'abonnementen')
                        ? 'bg-blue-500'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    Abonnementen
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* Documenten */}
          {council.hasModule('documenten') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/documenten', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('documenten') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Documenten
              </Link>
            </li>
          )}

          {/* Trekkingen & Prijzen */}
          {council.hasModule('fietsenwin') && hasRight('fietsenwin') && (
            <>
              {(user.getRole().includes('root') || user.getRole().includes('admin')) ? (
                <li className="mb-2">
                  <Link
                    href={{ pathname: '/beheer/trekkingen', query }}
                    className={`block px-4 py-2 rounded ${
                      ['trekkingen', 'prijzen'].includes(query.module as string)
                        ? 'bg-blue-500'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    Trekkingen &amp; Prijzen
                  </Link>
                  <ul className="ml-4 mt-1">
                    <li className="mb-1">
                      <Link
                        href={{ pathname: '/beheer/trekkingen', query }}
                        className={`block px-4 py-2 rounded ${
                          isSelected('trekkingen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Trekkingen
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        href={{ pathname: '/beheer/prijzen', query }}
                        className={`block px-4 py-2 rounded ${
                          isSelected('prijzen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Prijzen
                      </Link>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="mb-2">
                  <Link
                    href={{ pathname: '/beheer/prijzen', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('prijzen') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    Prijzen
                  </Link>
                </li>
              )}
            </>
          )}

          {/* Diashow */}
          {user.getRole() !== 'exploitant' && hasRight('diashow') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/presentations', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('presentations') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Diashow
              </Link>
            </li>
          )}

          {/* Registranten */}
          {council.hasModule('fms') && hasRight('registranten') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/accounts', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('accounts') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Registranten
              </Link>
            </li>
          )}

          {/* Rapportages */}
          {council.hasModule('fms') && hasRight('rapportages') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/reports', query }}
                className={`block px-4 py-2 rounded ${
                  ['reports', 'logboek'].includes(query.module as string)
                    ? 'bg-blue-500'
                    : 'hover:bg-blue-700'
                }`}
              >
                Rapportages
              </Link>
              <ul className="ml-4 mt-1">
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/reports', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('reports') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    Rapportage
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href={{ pathname: '/beheer/logboek', query }}
                    className={`block px-4 py-2 rounded ${
                      isSelected('logboek') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    Logboek
                  </Link>
                </li>
              </ul>
            </li>
          )}

          {/* Gebruikersbeheer (Admin Only) */}
          {hasRight('users') && (
            <>
              {user.getRealRole() === 'exploitant' ? (
                <li className="mb-2">
                  <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                    className={`block px-4 py-2 rounded ${
                      isSelected('users', 'exploitant') ? 'bg-blue-500' : 'hover:bg-blue-700'
                    }`}
                  >
                    Gebruikersbeheer
                  </Link>
                  <ul className="ml-4 mt-1">
                    {user.getRole().includes('admin') && (
                      <li className="mb-1">
                        <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                          className={`block px-4 py-2 rounded ${
                            isSelected('users', 'user') ? 'bg-blue-500' : 'hover:bg-blue-700'
                          }`}
                        >
                          Gebruikers {council.getCompanyName()}
                        </Link>
                      </li>
                    )}
                    <li className="mb-1">
                      <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                        className={`block px-4 py-2 rounded ${
                          isSelected('users', 'exploitant') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Gebruikers {exploitant?.getCompanyName()}
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent type="beheerder"/>)}
                        className={`block px-4 py-2 rounded ${
                          isSelected('users', 'beheerder') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Beheerders
                      </Link>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  {(user.getRole().includes('root') || user.getRole().includes('admin')) && (
                    <li className="mb-2">
                      <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                        className={`block px-4 py-2 rounded ${
                          isSelected('users', 'user') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Gebruikersbeheer
                      </Link>
                    </li>
                  )}
                  {user.getRole() === 'exploitant' && (
                    <li className="mb-2">
                      <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                        className={`block px-4 py-2 rounded ${
                          isSelected('users', 'exploitant') ? 'bg-blue-500' : 'hover:bg-blue-700'
                        }`}
                      >
                        Gebruikersbeheer
                      </Link>
                      <ul className="ml-4 mt-1">
                        <li className="mb-1">
                          <Link
                  href="#"
                  onClick={() => onSelect(<UsersComponent />)}
                            className={`block px-4 py-2 rounded ${
                              isSelected('users', 'exploitant') ? 'bg-blue-500' : 'hover:bg-blue-700'
                            }`}
                          >
                            Administrators
                          </Link>
                        </li>
                        <li className="mb-1">
                          <Link
                            href={{ pathname: '/beheer/users', query }}
                            className={`block px-4 py-2 rounded ${
                              isSelected('users', 'beheerder') ? 'bg-blue-500' : 'hover:bg-blue-700'
                            }`}
                          >
                            Beheerders
                          </Link>
                        </li>
                      </ul>
                    </li>
                  )}
                </>
              )}
            </>
          )}

          {/* Toegang FMSservice */}
          {council.hasModule('fms') && hasRight('permits') && (
            <li className="mb-2">
              <Link
                href={{ pathname: '/beheer/permits', query }}
                className={`block px-4 py-2 rounded ${
                  isSelected('permits', 'permissions') ? 'bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                Toegang fmsservice
              </Link>
            </li>
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
