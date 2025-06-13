import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { User, Session } from "next-auth";
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'

import { useRouter } from "next/router";
const LeftMenu = dynamic(() => import('~/components/beheer/LeftMenu'), { ssr: false })// TODO Make SSR again
const LeftMenuGemeente = dynamic(() => import('~/components/beheer/LeftMenuGemeente'), { ssr: false })// TODO Make SSR again
const LeftMenuExploitant = dynamic(() => import('~/components/beheer/LeftMenuExploitant'), { ssr: false })// TODO Make SSR again

import TopBar from "~/components/beheer/TopBar";
// import { ReportBikepark } from "~/components/beheer/reports/ReportsFilter";

// import AbonnementenComponent from '~/components/beheer/abonnementen';
import AccountsComponent from '~/components/beheer/accounts';
import ApisComponent from '~/components/beheer/apis';
import ArticlesComponent from '~/components/beheer/articles';
// import BarcodereeksenComponent from '~/components/beheer/barcodereeksen';
import GemeenteComponent from '~/components/beheer/contacts/gemeente';
import ExploitantComponent from '~/components/beheer/contacts/expoitant';
import DataproviderComponent from '~/components/beheer/contacts/dataprovider';
import DocumentsComponent from '~/components/beheer/documenten';
import ExportComponent from '~/components/beheer/exports';
import FaqComponent from '~/components/beheer/faq';
import HomeInfoComponent from '~/components/beheer/home';
import LogboekComponent from '~/components/beheer/logboek';
import FietsenstallingenComponent from '~/components/beheer/fietsenstallingen';
// import PresentationsComponent from '~/components/beheer/presentations';
// import ProductsComponent from '~/components/beheer/producten';
import ReportComponent from '~/components/beheer/reports';
import SettingsComponent from '~/components/beheer/settings';
import UsersComponent from '~/components/beheer/users';
import DatabaseComponent from '~/components/beheer/database';
import ExploreUsersComponent from '~/components/ExploreUsersComponent';
import ExploreGemeenteComponent from '~/components/ExploreGemeenteComponent';
import ExploreExploitant from '~/components/ExploreExploitantComponent';
import ExploreArticlesComponent from '~/components/ExploreArticlesComponent';

import { prisma } from '~/server/db';
import type { security_roles, fietsenstallingtypen } from '@prisma/client';
import { VSMenuTopic } from "~/types/index";

// import Styles from "~/pages/content.module.css";
import { useSession } from "next-auth/react";
// import ExploreLeftMenuComponent from '~/components/ExploreLeftMenuComponent';


import GemeenteEdit from '~/components/contact/GemeenteEdit';
import DatabaseApiTest from '~/components/beheer/test/DatabaseApiTest';
import { useGemeenten, useGemeentenInLijst } from '~/hooks/useGemeenten';
import { useFietsenstallingen } from '~/hooks/useFietsenstallingen';
import { useExploitanten } from '~/hooks/useExploitanten';
import ExploitantEdit from '~/components/contact/ExploitantEdit';
//   .ContentPage_Body h2 {
//     font-size: 1.1em;
//     font-weight: bold;
//   }
//   .ContentPage_Body ul {
//       list-style-type: disc;
//   }
//   .ContentPage_Body ul,
//   .ContentPage_Body ol {
//     margin: 1em 0;
//       padding: 0 0 0 40px;
//       margin-left: 0;
//     padding-left: 1em;
//   }
//   .ContentPage_Body li {
//     display: list-item;
//   }
//   .ContentPage_Body a {
//       text-decoration: underline;
//   }
//   .ContentPage_Body strong {
//       font-weight: bold;
//   }
//   .ContentPage_Body p {
//       margin-top: 5px;
//       margin-bottom: 15px;
//   }


export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<BeheerPageProps>> => {
  const session = await getServerSession(context.req, context.res, authOptions) as Session;

  // Check if there is no session (user not logged in)
  if (!session) {
    return { redirect: { destination: "/login?redirect=/beheer", permanent: false } };
  }

  const currentUser = session?.user || false;

  const roles = await prisma.security_roles.findMany({});

  const fietsenstallingtypen = await prisma.fietsenstallingtypen.findMany({
    select: {
      id: true,
      name: true,
      sequence: true
    }
  });

  if (currentUser) {
    if (currentUser.image === undefined) {
      currentUser.image = "/images/user.png";
    }
  } else {
    console.warn("no current user");
  }
  return { props: { currentUser, roles, fietsenstallingtypen } };
};

export type BeheerPageProps = {
  currentUser?: User;
  selectedContactID?: string;
  roles?: security_roles[];
  fietsenstallingtypen?: fietsenstallingtypen[];
};

const BeheerPage: React.FC<BeheerPageProps> = ({
  currentUser,
  roles,
  fietsenstallingtypen }) => {
  const queryRouter = useRouter();
  const { data: session, update: updateSession } = useSession();

  const selectedContactID = session?.user?.activeContactId || "";

  const { gemeenten, isLoading: gemeentenLoading, error: gemeentenError, reloadGemeenten } = useGemeentenInLijst();
  const { exploitanten, isLoading: exploitantenLoading, error: exploitantenError, reloadExploitanten } = useExploitanten(selectedContactID);
  const { fietsenstallingen: bikeparks, isLoading: bikeparksLoading, error: bikeparksError, reloadFietsenstallingen } = useFietsenstallingen(selectedContactID);
  const [isSwitchingGemeente, setIsSwitchingGemeente] = useState(false);

  const showAbonnementenRapporten = true;

  const firstDate = new Date("2018-03-01");

  const lastDate = new Date();
  lastDate.setHours(0, 0, 0, 0); // set time to midnight

  let activecomponent: VSMenuTopic | undefined = VSMenuTopic.Home;

  const validTopics = Object.values(VSMenuTopic) as String[];
  const activeComponentQuery = Array.isArray(queryRouter.query.activecomponent) ? queryRouter.query.activecomponent[0] : queryRouter.query.activecomponent;
  if (
    activeComponentQuery &&
    typeof activeComponentQuery === 'string' &&
    validTopics.includes(activeComponentQuery)
  ) {
    activecomponent = activeComponentQuery as VSMenuTopic;
  }

  const handleSelectComponent = (componentKey: VSMenuTopic) => {
    try {
      queryRouter.push(`/beheer/${componentKey}`);
    } catch (error) {
      console.error("Error in handleSelectComponent:", error);
    }
  };

  const handleSelectGemeente = async (gemeenteID: string) => {
    try {
      if (!session) return;

      setIsSwitchingGemeente(true);
      const response = await fetch('/api/security/switch-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactId: gemeenteID })
      });

      if (!response.ok) {
        throw new Error('Failed to switch contact');
      }

      const { user } = await response.json();

      // Update the session with new user data
      const newSession = await updateSession({
        ...session,
        user
      });

      // Replace current page with home page, which will trigger a full reload
      queryRouter.replace('/beheer/home');

    } catch (error) {
      console.error("Error switching contact:", error);
    } finally {
      setIsSwitchingGemeente(false);
    }
  };

  const gemeentenaam = gemeenten?.find(gemeente => gemeente.ID === selectedContactID)?.CompanyName || "";
  const exploitantnaam = exploitanten?.find(exploitant => exploitant.ID === selectedContactID)?.CompanyName || "";

  const renderComponent = () => {
    try {
      let selectedComponent = undefined;
      switch (activecomponent) {
        case VSMenuTopic.Home:
          selectedComponent = <HomeInfoComponent gemeentenaam={gemeentenaam||exploitantnaam} />;
          break;
        case VSMenuTopic.Report:
          {
            selectedContactID !== "" ? (
              selectedComponent = <ReportComponent
                showAbonnementenRapporten={showAbonnementenRapporten}
                firstDate={firstDate}
                lastDate={lastDate}
                bikeparks={bikeparks || []}
                // gemeenten={gemeenten || []}
                // users={users || []}
              />
            ) : (
              selectedComponent = <div className="text-center text-gray-500 mt-10 text-xl" >Selecteer een gemeente om rapportages te bekijken</div>
            )
          }
          break;
        case VSMenuTopic.ArticlesPages:
          selectedComponent = <ArticlesComponent
            type="pages"
          />
          break;
        case VSMenuTopic.Faq:
          selectedComponent = <FaqComponent />;
          break;
        case VSMenuTopic.Database:
          selectedComponent = <DatabaseComponent bikeparks={bikeparks} firstDate={firstDate} lastDate={lastDate} />;
          break;
        case VSMenuTopic.Export:
          selectedComponent = <ExportComponent
            gemeenteID={selectedContactID}
            gemeenteName={gemeentenaam}
            firstDate={firstDate}
            lastDate={lastDate}
            bikeparks={bikeparks || []}
          />;
          break;
        case VSMenuTopic.Documents:
          selectedComponent = <DocumentsComponent />;
          break;
        case VSMenuTopic.ContactsGemeenten:
          selectedComponent = (
            <GemeenteComponent fietsenstallingtypen={fietsenstallingtypen || []}/>
          );
          break;
        case VSMenuTopic.ContactsExploitanten:
          selectedComponent = <ExploitantComponent contactID={selectedContactID} canManageExploitants={selectedContactID==="1"} canAddRemoveExploitants={selectedContactID!=="1"} />;
          break;
        case VSMenuTopic.ContactsDataproviders:
          selectedComponent = <DataproviderComponent />;
          break;
        case VSMenuTopic.ExploreUsers:
          selectedComponent = <ExploreUsersComponent roles={roles || []} />;
          break;
        case VSMenuTopic.ExploreGemeenten:
          selectedComponent = <ExploreGemeenteComponent />;
          break;
        case VSMenuTopic.ExploreExploitanten:
          selectedComponent = <ExploreExploitant />;
          break;
        case VSMenuTopic.ExplorePages:
          selectedComponent = <ExploreArticlesComponent gemeenten={gemeenten || []} />;
          break;
        case VSMenuTopic.ExploreLeftMenu:
          // selectedComponent = <ExploreLeftMenuComponent roles={roles || []} users={users || []} exploitanten={exploitanten || []}
          //   gemeenten={gemeenten || []} dataproviders={dataproviders || []} />;
          break;
        case VSMenuTopic.Logboek:
          selectedComponent = <LogboekComponent />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerFietsberaad:
          selectedComponent = <UsersComponent siteID={null} />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerGemeente:
          selectedComponent = <UsersComponent siteID={selectedContactID}/>;
          break;
        case VSMenuTopic.UsersGebruikersbeheerExploitant:
          selectedComponent = <UsersComponent siteID={selectedContactID}/>;
          break;
        case VSMenuTopic.UsersGebruikersbeheerBeheerder:
          selectedComponent = <UsersComponent siteID={selectedContactID} />;
          break;
        case VSMenuTopic.Fietsenstallingen:
          selectedComponent = <FietsenstallingenComponent type="fietsenstallingen" />;
          break;
        case VSMenuTopic.Fietskluizen:
          selectedComponent = <FietsenstallingenComponent type="fietskluizen" />;
          break;
        case VSMenuTopic.Buurtstallingen:
          selectedComponent = <FietsenstallingenComponent type="buurtstallingen" />;
          break;
        // case VSMenuTopic.BarcodereeksenUitgifteBarcodes:
        //   selectedComponent = <BarcodereeksenComponent type="uitgifte-barcodes" />;
        //   break;
        // case VSMenuTopic.BarcodereeksenSleutelhangers:
        //   selectedComponent = <BarcodereeksenComponent type="sleutelhangers" />;
        //   break;
        // case VSMenuTopic.BarcodereeksenFietsstickers:
        //   selectedComponent = <BarcodereeksenComponent type="fietsstickers" />;
        //   break;
        // case VSMenuTopic.Presentations:
        //   selectedComponent = <PresentationsComponent />;
        //   break;
        case VSMenuTopic.Settings:
          selectedComponent = <SettingsComponent />;
          break;
        case VSMenuTopic.SettingsGemeente:
          selectedComponent =           
            <GemeenteEdit 
              fietsenstallingtypen={fietsenstallingtypen || []}
              id={selectedContactID} 
              onClose={undefined} 
              onEditStalling={(stallingID: string | undefined) => {}}
              onEditUser={(userID: string | undefined) => {}}
              onSendPassword={(userID: string | undefined) => {}}
            />
          break;
        case VSMenuTopic.SettingsExploitant:
          selectedComponent =           
            <ExploitantEdit 
              id={selectedContactID} 
              onClose={undefined} 
            />
          break;
            // case VSMenuTopic.Abonnementen:
        //   selectedComponent = <AbonnementenComponent type="abonnementen" />;
        //   break;
        // case VSMenuTopic.Abonnementsvormen:
        //   selectedComponent = <AbonnementenComponent type="abonnementsvormen" />;
        //   break;
        case VSMenuTopic.Accounts:
          selectedComponent = <AccountsComponent />;
          break;
        case VSMenuTopic.ApisGekoppeldeLocaties:
          selectedComponent = <ApisComponent type="gekoppelde-locaties" />;
          break;
        case VSMenuTopic.ApisOverzicht:
          selectedComponent = <ApisComponent type="overzicht" />;
          break;
        case VSMenuTopic.ArticlesAbonnementen:
          selectedComponent = <ArticlesComponent type="abonnementen" />;
          break;
        case VSMenuTopic.ArticlesArticles:
          selectedComponent = <ArticlesComponent type="articles" />;
          break;
        case VSMenuTopic.ArticlesBuurtstallingen:
          selectedComponent = <ArticlesComponent type="buurtstallingen" />;
          break;
        case VSMenuTopic.ArticlesFietskluizen:
          selectedComponent = <ArticlesComponent type="fietskluizen" />;
          break;
        // case VSMenuTopic.StallingInfo:
        //   selectedComponent = <StallingInfoComponent />;
        //   break;
        case VSMenuTopic.TestDatabaseApi:
          selectedComponent = <DatabaseApiTest />;
          break;
        default:
          console.warn("unknown component", activecomponent);
          selectedComponent = undefined;
          break;
      }

      return selectedComponent;
    } catch (error) {
      console.error("Error rendering component:", error);
      return <div>Error loading component</div>;
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-y-hidden">
      <TopBar
        title="VeiligStallen beheer"
        currentComponent={activecomponent}
        user={currentUser} 
        gemeenten={gemeenten}
        exploitanten={exploitanten}
        selectedGemeenteID={selectedContactID}
        onGemeenteSelect={handleSelectGemeente}
      />
      <div className="flex">
        {selectedContactID === "1" && (
          <LeftMenu
            securityProfile={currentUser?.securityProfile}
            activecomponent={activecomponent}
            onSelect={(componentKey: VSMenuTopic) => handleSelectComponent(componentKey)} // Pass the component key
          />
        )}
        {gemeenten.find(gemeente => gemeente.ID === selectedContactID) && (
          <LeftMenuGemeente
            securityProfile={currentUser?.securityProfile}
            activecomponent={activecomponent}
            onSelect={(componentKey: VSMenuTopic) => handleSelectComponent(componentKey)} // Pass the component key
          />)
        }
        {exploitanten.find(exploitant => exploitant.ID === selectedContactID) && (
          <LeftMenuExploitant
            securityProfile={currentUser?.securityProfile}
            activecomponent={activecomponent}
            onSelect={(componentKey: VSMenuTopic) => handleSelectComponent(componentKey)} // Pass the component key
          />)
        }

        {/* Main Content */}
        {/* ${Styles.ContentPage_Body}`} */}
        <div className={`flex-1 p-4 overflow-auto`} style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default BeheerPage;
