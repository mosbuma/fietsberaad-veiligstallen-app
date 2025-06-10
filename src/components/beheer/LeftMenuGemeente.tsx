// LeftMenuGemeente.tsx
import React from 'react';
import Link from 'next/link';

import { VSSecurityTopic, VSMenuTopic, VSUserSecurityProfile } from '~/types/index';
import { VSModuleValues } from '~/types/modules';
import { type VSContactDataprovider, VSContactExploitant, type VSContactGemeente } from '~/types/contacts';
import { VSUserRoleValuesNew } from '~/types/users';

import { userHasRight, userHasModule, userHasRole } from '~/types/utils';
interface LeftMenuGemeenteProps {
  securityProfile?: VSUserSecurityProfile;
  activecomponent: VSMenuTopic | undefined;
  onSelect: (component: VSMenuTopic) => void;
}

const LeftMenuGemeente: React.FC<LeftMenuGemeenteProps> = ({
  securityProfile,
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

  const formatLiDevelopment = (component: VSMenuTopic | false, title: string, compact: boolean = false, children?: React.ReactNode) => {
    const isSelected = component === activecomponent;
    const className = `block px-4 py-2 rounded ${isSelected ? "font-bold" : "hover:bg-gray-200"}`;
    const style = isSelected ? { backgroundColor: 'rgba(31, 153, 210, 0.1)' } : {};
    const classNamePassive = `block px-4 py-2 rounded strikethrough`;

    return (
      <li className={compact ? 'mb-2' : 'mb-1'}>
        {component ? (
          <Link href="#" onClick={(e) => { e.preventDefault(); onSelect(component) }} className={className} style={style}>
            <span className="line-through">{title}</span>
          </Link>
        ) : (
          <Link href="#" onClick={(e) => { e.preventDefault() }} className={classNamePassive} style={style}>
            <span className="line-through">{title}</span>
          </Link>
        )}
        {children}
      </li>
    );
  }

  // Do only show reports? Temporary for testing, 2025-05
  const doOnlyShowReports = (): boolean => {
    return !['veiligstallen.work', 'localhost:3000'].includes(window?.location?.host||'');
  }

  const renderUnifiedMenu = () => {
    // Base conditions from user security profile
    const profile = securityProfile;

    // Role-based conditions
    const isAdmin = userHasRole(profile, VSUserRoleValuesNew.RootAdmin) || userHasRole(profile, VSUserRoleValuesNew.Admin);

    const hasSystemRight = userHasRight(profile, VSSecurityTopic.System);
    const hasWebsiteRight = userHasRight(profile, VSSecurityTopic.Website);
    const hasGemeenteRight = userHasRight(profile, VSSecurityTopic.ContactsGemeenten);
    const hasLocatiesRight = userHasRight(profile, VSSecurityTopic.ApisGekoppeldeLocaties);
    const hasBuurtstallingenRight = userHasRight(profile, VSSecurityTopic.Buurtstallingen) && userHasModule(profile, VSModuleValues.Buurtstallingen);
    const hasRegistrantenRight = userHasRight(profile, VSSecurityTopic.Accounts) && userHasModule(profile, VSModuleValues.Fms);
    const hasRapportagesRight = userHasRight(profile, VSSecurityTopic.Report) && userHasModule(profile, VSModuleValues.Fms);
    const hasUsersRight = userHasRight(profile, VSSecurityTopic.UsersGebruikersbeheer) && userHasModule(profile, VSModuleValues.Fms);
    const hasDataprovidersRight = userHasRight(profile, VSSecurityTopic.ContactsDataproviders) && userHasModule(profile, VSModuleValues.Fms);
    const hasExternalApisRight = userHasRight(profile, VSSecurityTopic.ApisOverzicht);
    const hasDevelopmentRight = userHasRight(profile, VSSecurityTopic.Development);

    const hasDatabaseRight = hasSystemRight;
    // const hasInstellingenRight = hasSystemRight;

    {/* TODO: Later terugzetten, nu niet nodig
      // const hasFietskluizenRight = userHasRight(profile, VSSecurityTopic.Fietskluizen);
      // const hasAbonnementenRight = userHasRight(profile, VSSecurityTopic.Abonnementen);
      // const hasDiashowRight = userHasRight(profile, VSSecurityTopic.Presentations);
      // const hasUsersBeheerdersRight = userHasRight(profile, VSSecurityTopic.UsersBeheerders);
      // const hasSleutelhangerreeksenRight = userHasRight(profile, VSSecurityTopic.BarcodereeksenSleutelhangers);
      // const hasDocumentenModule = userHasRight(profile, VSSecurityTopic.Documents);

      {formatLi(VSMenuTopic.Products, 'Opwaardeerproducten')} 

        {hasSystemRight && isAdmin && formatLi(VSMenuTopic.ContactsAdmin, 'Beheerders')}

        { hasSystemRight hasSleutelhangerreeksenRight && (
          formatLi(false, 'Barcodes', false,
            <ul className="ml-4 mt-1">
              {formatLi(VSMenuTopic.BarcodereeksenUitgifteBarcodes, 'Uitgifte Barcodes', true)}
              {formatLi(VSMenuTopic.BarcodereeksenSleutelhangers, 'Sleutelhangers', true)}
              {formatLi(VSMenuTopic.BarcodereeksenFietsstickers, 'Fietsstickers', true)}
            </ul>
          )
        )}

         {!hasSystemRight && (activecontact?.ID === '1' || (hasAbonnementenModule && hasAbonnementenRight)) && (
          formatLi(false, 'Abonnementen', false,
            <ul className="ml-4 mt-1">
              {formatLi(VSMenuTopic.Abonnementsvormen, 'Abonnementsvormen', true)}
              {formatLi(VSMenuTopic.Abonnementen, 'Abonnementen', true)}
            </ul>
          )
        )}

        {!hasSystemRight && hasDocumentenModule && formatLi(VSMenuTopic.Documents, 'Documenten')}

        {!hasSystemRight && hasDiashowRight && formatLi(VSMenuTopic.Presentations, 'Diashow')}  

        {hasFietskluizenModule && hasFietskluizenRight && formatLiDevelopment(VSMenuTopic.Fietskluizen, 'Status chipkluizen')}

    */}

    return (
      <>
        {formatLi(VSMenuTopic.Home, 'Home')}

        {doOnlyShowReports() && <>
          {formatLi(VSMenuTopic.Report, 'Rapportages', true)}
        </>}

        {! doOnlyShowReports() && <>
          { isAdmin && formatLi(VSMenuTopic.SettingsGemeente, 'Instellingen')}

          { isAdmin && formatLi(VSMenuTopic.UsersGebruikersbeheerGemeente, `Gebruikers`)}
          { isAdmin && formatLi(VSMenuTopic.ContactsExploitanten, 'Exploitanten')}
          {/* { isAdmin && formatLi(VSMenuTopic.ContactsDataproviders, 'Dataleveranciers')}
    
          { hasRegistrantenRight && formatLi(VSMenuTopic.Accounts, 'Registranten')} */}
    
          { hasLocatiesRight && formatLi(VSMenuTopic.Fietsenstallingen, 'Fietsenstallingen')}
          { hasBuurtstallingenRight && formatLi(VSMenuTopic.Buurtstallingen, 'Buurtstallingen / Fietstrommels')}

          {hasWebsiteRight && formatLi(VSMenuTopic.ArticlesPages, 'Pagina\'s', true)}

          {hasRapportagesRight && formatLi(VSMenuTopic.Report, 'Rapportage', true)}
          {hasRapportagesRight && formatLi(VSMenuTopic.Export, 'Export', true)}
          {/* {hasRapportagesRight && formatLiDevelopment(VSMenuTopic.Logboek, 'Logboek', true)} */}

          {hasWebsiteRight && formatLi(VSMenuTopic.Faq, 'FAQ', true)}
        </>}
      </>
    )
  }
  
  // for now, only show the temporary production menu in production
  // const isProduction = process.env.NODE_ENV === 'production';
  // if(isProduction) {
  //   return (
  //     <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
  //       {formatLi(VSMenuTopic.Report, 'Rapportages', true)}
  //     </ul>
  //   )
  // }
  
  return (
    <ul id="leftMenu" className="shadow w-64 min-h-screen p-4">
      {renderUnifiedMenu()}
    </ul>
  );
}

export default LeftMenuGemeente;
