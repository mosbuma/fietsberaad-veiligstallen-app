// LeftMenu.tsx
import React from 'react';
import Link from 'next/link';

import { type User } from "next-auth";
import { VSContactDataprovider, VSContactExploitant, VSContactGemeente, VSModuleValues, VSSecurityTopic, VSUserRoleValuesNew, VSUserSecurityProfile, VSMenuTopic } from '~/types';
import { userHasRight, userHasModule, userHasRole } from '~/types/utils';
interface LeftMenuProps {
  user?: User;
  activecontact: VSContactGemeente | VSContactExploitant | VSContactDataprovider | undefined;
  activecomponent: VSMenuTopic | undefined;
  onSelect: (component: VSMenuTopic) => void;
}

const LeftMenu: React.FC<LeftMenuProps> = ({
  user,
  activecontact,
  activecomponent,
  onSelect,
}) => {
  // const router = useRouter();
  // const { query } = router;

  const formatLi = (component: VSMenuTopic | false, title: string, compact: boolean = false, children?: React.ReactNode) => {
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

  const renderUnifiedMenu = () => {
    // Base conditions from user security profile
    const profile = user?.securityProfile;

    console.log("### profile", profile);

    const hasFietskluizenModule = userHasModule(profile, VSModuleValues.Fietskluizen);
    const hasAbonnementenModule = userHasModule(profile, VSModuleValues.Abonnementen);

    const hasSystemRight = userHasRight(profile, VSSecurityTopic.System);
    const hasWebsiteRight = userHasRight(profile, VSSecurityTopic.Website);
    const hasGemeenteRight = userHasRight(profile, VSSecurityTopic.ContactsGemeenten);
    const hasLocatiesRight = userHasRight(profile, VSSecurityTopic.ApisGekoppeldeLocaties);
    const hasFietskluizenRight = userHasRight(profile, VSSecurityTopic.Fietskluizen);
    const hasBuurtstallingenModule = userHasModule(profile, VSModuleValues.Buurtstallingen);
    const hasBuurtstallingenRight = userHasRight(profile, VSSecurityTopic.Buurtstallingen);
    const hasAbonnementenRight = userHasRight(profile, VSSecurityTopic.Abonnementen);
    const hasDocumentenModule = userHasRight(profile, VSSecurityTopic.Documents);
    const hasDiashowRight = userHasRight(profile, VSSecurityTopic.Presentations);
    const hasFmsModule = userHasModule(profile, VSModuleValues.Fms);
    const hasRegistrantenRight = userHasRight(profile, VSSecurityTopic.Accounts);
    const hasRapportagesRight = userHasRight(profile, VSSecurityTopic.Report);
    const hasUsersRight = userHasRight(profile, VSSecurityTopic.UsersGebruikersbeheer);
    // const hasUsersBeheerdersRight = userHasRight(profile, VSSecurityTopic.UsersBeheerders);
    const hasDataprovidersRight = userHasRight(profile, VSSecurityTopic.ContactsDataproviders);
    const hasSleutelhangerreeksenRight = userHasRight(profile, VSSecurityTopic.BarcodereeksenSleutelhangers);
    const hasExternalApisRight = userHasRight(profile, VSSecurityTopic.ApisOverzicht);

    const hasDevelopmentRight = userHasRight(profile, VSSecurityTopic.Development);

    // Role-based conditions
    const isAdmin = userHasRole(profile, VSUserRoleValuesNew.RootAdmin) || userHasRole(profile, VSUserRoleValuesNew.Admin);

    // console.log("### hasSystemRight", hasSystemRight);

    return (
      <>
        {/* Always visible */}
        {formatLi(VSMenuTopic.Home, 'Home')}
  
        {/* Internal only */}
        {hasSystemRight && formatLi(VSMenuTopic.Settings, 'Instellingen')}

        { hasDevelopmentRight && (
            formatLi(false, 'Ontwikkeling', false,
              <ul className="ml-4 mt-1">
                {formatLi(VSMenuTopic.ExploreUsers, 'Gebruikersoverzicht', true)}
                {formatLi(VSMenuTopic.ExploreGemeenten, 'Gemeentenoverzicht', true)}
                {formatLi(VSMenuTopic.ExploreExploitanten, 'Exploitantenoverzicht', true)}
              </ul>)
            )
        }
  
        {/* Website beheer - both internal and external */}
        {(hasWebsiteRight) && 
          formatLi(VSMenuTopic.Website, 'Website beheer', false,
            <ul className="ml-4 mt-1">
              {formatLi(VSMenuTopic.ArticlesPages, 'Paginabeheer', true)}
              {formatLi(VSMenuTopic.Faq, 'FAQ', true)}
            </ul>
          )
        }
  
        {/* Gemeente section */}
        {(isAdmin || hasGemeenteRight) && formatLi(VSMenuTopic.ContactsGemeenten, 'Gemeenten')}
        
        {/* Internal admin sections */}
        {hasSystemRight && isAdmin && (
          <>
            {formatLi(VSMenuTopic.ContactsAdmin, 'Beheerders')}
            {formatLi(VSMenuTopic.Products, 'Opwaardeerproducten')}
          </>
        )}
  
        {/* External specific sections */}
        {!hasSystemRight && (
          <>
            {hasLocatiesRight && formatLi(VSMenuTopic.Fietsenstallingen, 'Locatie stallingen')}
            {(hasFietskluizenModule && hasFietskluizenRight) && formatLi(VSMenuTopic.Fietskluizen, 'Status chipkluizen')}
            {(hasBuurtstallingenModule && hasBuurtstallingenRight) && formatLi(VSMenuTopic.Buurtstallingen, 'Buurtstallingen / fietstrommels')}
          </>
        )}
  
        {/* Abonnementen section - external only */}
        {!hasSystemRight && (activecontact?.ID === '1' || (hasAbonnementenModule && hasAbonnementenRight)) && (
          formatLi(false, 'Abonnementen', false,
            <ul className="ml-4 mt-1">
              {formatLi(VSMenuTopic.Abonnementsvormen, 'Abonnementsvormen', true)}
              {formatLi(VSMenuTopic.Abonnementen, 'Abonnementen', true)}
            </ul>
          )
        )}
  
        {/* Documents - external only */}
        {!hasSystemRight && hasDocumentenModule && formatLi(VSMenuTopic.Documents, 'Documenten')}
  
        {/* Diashow - external only */}
        {!hasSystemRight && hasDiashowRight && formatLi(VSMenuTopic.Presentations, 'Diashow')}
  
        {/* Registranten - external only */}
        {!hasSystemRight && hasFmsModule && hasRegistrantenRight && formatLi(VSMenuTopic.Accounts, 'Registranten')}
  
        {/* Rapportages section - both */}
        {(hasSystemRight || (hasFmsModule && hasRapportagesRight)) && (
          formatLi(false, 'Rapportages', false,
            <ul className="ml-4 mt-1">
              {formatLi(VSMenuTopic.Report, 'Rapportage', true)}
              {formatLi(VSMenuTopic.Export, 'Export', true)}
              {formatLi(VSMenuTopic.Logboek, 'Logboek', true)}
            </ul>
          )
        )}
  
        {/* Gebruikersbeheer section */}
        {(isAdmin || hasUsersRight) && (
            formatLi(false, 'Gebruikersbeheer', false,
              <ul className="ml-4 mt-1">
                {userHasRole(profile, VSUserRoleValuesNew.Admin) && formatLi(VSMenuTopic.UsersGebruikersbeheer, `Gebruikers ${activecontact?.CompanyName}`, true)}
                {formatLi(VSMenuTopic.ContactsExploitanten, `Gebruikers ${activecontact?.CompanyName}`, true)}
                {formatLi(VSMenuTopic.UsersBeheerders, 'Beheerders', true)}
              </ul>
            )
        )}
  
        {/* Internal only sections */}
        {hasSystemRight && (
          <>
            {isAdmin && formatLi(VSMenuTopic.ContactsExploitanten, 'Exploitanten')}
            
            {/* Barcodes section */}
            {hasSleutelhangerreeksenRight && (
              formatLi(false, 'Barcodes', false,
                <ul className="ml-4 mt-1">
                  {formatLi(VSMenuTopic.BarcodereeksenUitgifteBarcodes, 'Uitgifte Barcodes', true)}
                  {formatLi(VSMenuTopic.BarcodereeksenSleutelhangers, 'Sleutelhangers', true)}
                  {formatLi(VSMenuTopic.BarcodereeksenFietsstickers, 'Fietsstickers', true)}
                </ul>
              )
            )}
  
            {/* Externe APIs section */}
            {hasExternalApisRight && (
              formatLi(false, 'Externe API\'s', false,
                <ul className="ml-4 mt-1">
                  {formatLi(VSMenuTopic.ApisOverzicht, 'Overzicht API\'s', true)}
                  {formatLi(VSMenuTopic.ApisGekoppeldeLocaties, 'Gekoppelde locaties', true)}
                </ul>
              )
            )}
  
            {/* Admin only sections */}
            {isAdmin && (
              <>
                {formatLi(VSMenuTopic.Database, 'Database')}
                {formatLi(VSMenuTopic.StallingInfo, 'Stalling info')}
              </>
            )}
          </>
        )}
  
        {/* Dataleveranciers - both */}
        {((hasSystemRight && isAdmin && hasDataprovidersRight) || 
          (!hasSystemRight && hasFmsModule && hasDataprovidersRight)) && 
          formatLi(VSMenuTopic.ContactsDataproviders, hasSystemRight ? 'Dataleveranciers' : 'Toegang fmsservice')}
      </>
    )
  }
  
  // for now, only show the temporary production menu in production
  const isProduction = process.env.NODE_ENV === 'production';
  if(isProduction) {
    return (
      <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
        {formatLi(VSMenuTopic.Report, 'Rapportages', true)}
      </ul>
    )
  }
  
  return (
    <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
      {isProduction ? (
        formatLi(VSMenuTopic.Report, 'Rapportages', true)
      ) : (
        renderUnifiedMenu()
      )}
    </ul>
  );
}

export default LeftMenu;
