import React, { useEffect, useState } from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { User, Session } from "next-auth";
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'

import { useRouter } from "next/router";
import LeftMenu from "~/components/beheer/LeftMenu";
import TopBar from "~/components/beheer/TopBar";
import { ReportBikepark } from "~/components/beheer/reports/ReportsFilter";

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
import type { VSContactDataprovider, VSContactExploitant, VSContactGemeente } from "~/types/contacts";
import { gemeenteSelect, exploitantSelect, dataproviderSelect } from "~/types/contacts";
import { securityUserSelect, VSUserGroupValues, VSUserRoleValuesNew, type VSUserWithRoles } from "~/types/users";
import type { VSModule } from "~/types/modules";
import { VSMenuTopic } from "~/types/index";

// import Styles from "~/pages/content.module.css";
import { useSession } from "next-auth/react";
import ExploreLeftMenuComponent from '~/components/ExploreLeftMenuComponent';
import LeftMenuGemeente from '~/components/beheer/LeftMenuGemeente';
import GemeenteEdit from '~/components/contact/GemeenteEdit';
import DatabaseApiTest from '~/components/beheer/test/DatabaseApiTest';
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

  // const userIsAdmin = session?.user?.securityProfile?.roleId === VSUserRoleValuesNew.RootAdmin ||  ? "-1" : session?.user?.securityProfile?.roleId || "-1"));
  // console.log("**** USER IS ADMIN", userIsAdmin);
  const validContactIDs = currentUser?.securityProfile?.managingContactIDs || [];
  const whereCondition = { ID: { in: validContactIDs } };
  // console.log("**** WHERE CONDITION", userIsAdmin, whereCondition);

  const gemeenten: VSContactGemeente[] | undefined = await prisma.contacts.findMany({
    where: {
      ItemType: { in: ['organizations', 'admin'] },
      ...whereCondition
    },
    select: gemeenteSelect,
  });

  // console.log(">>> gemeenten size:", gemeenten?.length);

  const exploitanten: VSContactExploitant[] | undefined = await prisma.contacts.findMany({
    where: { ItemType: 'exploitant', ...whereCondition },
    select: exploitantSelect,
  });

  const dataproviders: VSContactDataprovider[] | undefined = await prisma.contacts.findMany({
    where: { ItemType: 'dataprovider' },
    select: dataproviderSelect,
  });

  let condition: { security_users_sites: { some: { SiteID: { in: string[] } } } } | undefined = {
    security_users_sites: { some: { SiteID: { in: validContactIDs } } }
  };

  if (currentUser?.securityProfile?.roleId === VSUserRoleValuesNew.RootAdmin) {
    condition = undefined;
  }
  const users: VSUserWithRoles[] | undefined = await prisma.security_users.findMany({
    where: condition,
    select: securityUserSelect,
  });

  const modules: VSModule[] | undefined = await prisma.modules.findMany({
    select: {
      ID: true,
      Name: true
    }
  });

  if (users !== undefined && users[0] !== undefined) {
    users.sort((a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || ""));
  }

  const bikeparks: ReportBikepark[] = []; // merge the ids and names for the stallingen in the gemeenten using map reduce
  if (gemeenten !== undefined && gemeenten[0] !== undefined) {
    gemeenten.forEach(gemeente => {
      if (gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts !== undefined) {
        gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts
          .filter(stalling => stalling.StallingsID !== null)
          .forEach(stalling => {
            bikeparks.push({
              id: stalling.ID,
              stallingsID: stalling.StallingsID || "---",
              title: stalling.Title || `Stalling ${stalling.ID}`,
              gemeenteID: gemeente.ID,
              hasData: true,
            });
          });
      }
    });
  }

  bikeparks.sort((a, b) => a.title.localeCompare(b.title));

  if (currentUser) {
    if (currentUser.image === undefined) {
      currentUser.image = "/images/user.png";
    }
  } else {
    console.warn("no current user");
  }
  return { props: { currentUser, gemeenten, exploitanten, dataproviders, bikeparks, users, roles, modules, fietsenstallingtypen } };
};

export type BeheerPageProps = {
  currentUser?: User;
  gemeenten?: VSContactGemeente[];
  exploitanten?: VSContactExploitant[];
  dataproviders?: VSContactDataprovider[];
  bikeparks?: ReportBikepark[];
  selectedGemeenteID?: string;
  users?: VSUserWithRoles[];
  roles?: security_roles[];
  modules?: VSModule[];
  fietsenstallingtypen?: fietsenstallingtypen[];
};

const BeheerPage: React.FC<BeheerPageProps> = ({
  currentUser,
  gemeenten,
  exploitanten,
  dataproviders,
  bikeparks,
  users,
  roles,
  modules,
  fietsenstallingtypen }) => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [isLoading, setIsLoading] = useState(false);

  const showAbonnementenRapporten = true;

  const firstDate = new Date("2018-03-01");

  const lastDate = new Date();
  lastDate.setHours(0, 0, 0, 0); // set time to midnight

  let activecomponent: VSMenuTopic | undefined = VSMenuTopic.Home;

  // useEffect(() => {
  //   if (selectedGemeenteID === "" && gemeenten && gemeenten.length > 0 && gemeenten[0] !== undefined) {
  //     setSelectedGemeenteID(gemeenten[0].ID);
  //   }
  // }, [gemeenten, selectedGemeenteID]);

  const validTopics = Object.values(VSMenuTopic) as String[];
  const activeComponentQuery = Array.isArray(router.query.activecomponent) ? router.query.activecomponent[0] : router.query.activecomponent;
  if (
    activeComponentQuery &&
    typeof activeComponentQuery === 'string' &&
    validTopics.includes(activeComponentQuery)
  ) {
    activecomponent = activeComponentQuery as VSMenuTopic;
  }

  // const activeIDQuery = router.query.id;
  // const activeId = typeof activeIDQuery === 'string' ? router.query.id as string : undefined;

  const handleSelectComponent = (componentKey: VSMenuTopic) => {
    try {
      router.push(`/beheer/${componentKey}`);
    } catch (error) {
      console.error("Error in handleSelectComponent:", error);
    }
  };

  const handleSelectGemeente = async (gemeenteID: string) => {
    try {
      if (!session) return;

      setIsLoading(true);
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

      // console.log(">>> new user activeContactId", user.activeContactId);

      // Update the session with new user data
      const newSession = await updateSession({
        ...session,
        user
      });

      // console.log(">>> new session activeContactId", newSession);
    } catch (error) {
      console.error("Error switching contact:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGemeenteID = session?.user?.activeContactId || "";
  const filteredBikeparks = bikeparks?.filter((bikepark) => (selectedGemeenteID !== "") && (bikepark.gemeenteID === selectedGemeenteID));


  // useEffect(() => {
  //   // Skip redirect if we're in the middle of a hot reload
  //   if (typeof window !== 'undefined' && window.__NEXT_DATA__?.props?.pageProps?.isHotReload) {
  //     return;
  //   }

  //   // Only redirect if we have no selected gemeente and we're not already on the home page
  //   if (!selectedGemeenteID && router.query.activecomponent !== VSMenuTopic.Home) {
  //     router.push(`/beheer/${VSMenuTopic.Home}`);
  //   }
  // }, [selectedGemeenteID]);

  // const filteredUsers = users?.filter((user) => (selectedGemeenteID !== "") && (user.security_users_sites.some(site => site.SiteID === selectedGemeenteID)));

  const renderComponent = () => {
    try {
      let selectedComponent = undefined;
      switch (activecomponent) {
        case VSMenuTopic.Home:
          selectedComponent = <HomeInfoComponent gemeente={gemeenten?.find(gemeente => gemeente.ID === selectedGemeenteID)} />;
          break;
        case VSMenuTopic.Report:
          {
            selectedGemeenteID !== "" ? (
              selectedComponent = <ReportComponent
                showAbonnementenRapporten={showAbonnementenRapporten}
                firstDate={firstDate}
                lastDate={lastDate}
                bikeparks={filteredBikeparks || []}
                gemeenten={gemeenten || []}
                users={users || []}
              />
            ) : (
              selectedComponent = <div className="text-center text-gray-500 mt-10 text-xl" >Selecteer een gemeente om rapportages te bekijken</div>
            )
          }
          break;
        case VSMenuTopic.ArticlesPages:
          selectedComponent = <ExploreArticlesComponent gemeenten={gemeenten || []} />;
          break;
        case VSMenuTopic.Faq:
          selectedComponent = <FaqComponent />;
          break;
        case VSMenuTopic.Database:
          selectedComponent = <DatabaseComponent bikeparks={bikeparks} firstDate={firstDate} lastDate={lastDate} />;
          break;
        case VSMenuTopic.Export:
          selectedComponent = <ExportComponent
            gemeenteID={selectedGemeenteID}
            gemeenteName={gemeenten?.find(gemeente => gemeente.ID === selectedGemeenteID)?.CompanyName || ""}
            firstDate={firstDate}
            lastDate={lastDate}
            bikeparks={filteredBikeparks || []}
          />;
          break;
        case VSMenuTopic.Documents:
          selectedComponent = <DocumentsComponent />;
          break;
        case VSMenuTopic.ContactsGemeenten:
          selectedComponent = (
            <GemeenteComponent
              users={users || []}
              roles={roles || []}
              fietsenstallingtypen={fietsenstallingtypen || []}
            />
          );
          break;
        case VSMenuTopic.ContactsExploitanten:
          selectedComponent = <ExploitantComponent
            users={users || []}
            roles={roles || []}
            gemeenten={gemeenten || []}
            fietsenstallingtypen={fietsenstallingtypen || []}
            isAdmin={currentUser?.securityProfile?.roleId === VSUserRoleValuesNew.RootAdmin}
          />;
          break;
        case VSMenuTopic.ContactsDataproviders:
          selectedComponent = <DataproviderComponent dataproviders={dataproviders || []} />;
          break;
        case VSMenuTopic.ExploreUsers:
          selectedComponent = <ExploreUsersComponent roles={roles || []} users={users || []} exploitanten={exploitanten || []}
            gemeenten={gemeenten || []} dataproviders={dataproviders || []} />;
          break;
        case VSMenuTopic.ExploreGemeenten:
          selectedComponent = <ExploreGemeenteComponent gemeenten={gemeenten || []} exploitanten={exploitanten || []} dataproviders={dataproviders || []} stallingen={bikeparks || []} users={users || []} />;
          break;
        case VSMenuTopic.ExploreExploitanten:
          selectedComponent = <ExploreExploitant exploitanten={exploitanten || []} gemeenten={gemeenten || []} dataproviders={dataproviders || []} stallingen={bikeparks || []} users={users || []} />;
          break;
        case VSMenuTopic.ExploreLeftMenu:
          selectedComponent = <ExploreLeftMenuComponent roles={roles || []} users={users || []} exploitanten={exploitanten || []}
            gemeenten={gemeenten || []} dataproviders={dataproviders || []} />;
          break;
        // case VSMenuTopic.Products:
        //   selectedComponent = <ProductsComponent />;
        //   break;
        case VSMenuTopic.Logboek:
          selectedComponent = <LogboekComponent />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerFietsberaad:
          selectedComponent = <UsersComponent groupid={VSUserGroupValues.Intern} users={users || []} roles={roles || []} />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerGemeente:
          selectedComponent = <UsersComponent groupid={VSUserGroupValues.Extern} users={users || []} roles={roles || []} />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerExploitant:
          selectedComponent = <UsersComponent groupid={VSUserGroupValues.Exploitant} users={users || []} roles={roles || []} />;
          break;
        case VSMenuTopic.UsersGebruikersbeheerBeheerder:
          selectedComponent = <UsersComponent groupid={VSUserGroupValues.Beheerder} users={users || []} roles={roles || []} />;
          break;
        // case VSMenuTopic.users-beheerders:
        //   selectedComponent = <GemeenteComponent type="admins" users={users || []} roles={roles || []} contacts={dataproviders || []} modules={modules || []} fietsenstallingtypen={fietsenstallingtypen || []} />;
        //   break;
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
              gemeenten={gemeenten || []} 
              users={users || []}
              fietsenstallingtypen={fietsenstallingtypen || []}
              id={selectedGemeenteID} 
              onClose={undefined} 
              onEditStalling={(stallingID: string | undefined) => {}}
              onEditUser={(userID: string | undefined) => {}}
              onSendPassword={(userID: string | undefined) => {}}
              hidden={false}
              allowEdit={true}
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

  const getActiveContact = () => {
    return (
      gemeenten?.find(gemeente => gemeente.ID === selectedGemeenteID) ||
      exploitanten?.find(exploitant => exploitant.ID === selectedGemeenteID) ||
      dataproviders?.find(dataprovider => dataprovider.ID === selectedGemeenteID)
    );
  }

  const sortedGemeenten = gemeenten?.sort((a, b) => {
    // If a is the main contact, it should come first
    if (a.ID === currentUser?.securityProfile?.mainContactId) return -1;
    // If b is the main contact, it should come first
    if (b.ID === currentUser?.securityProfile?.mainContactId) return 1;
    // Otherwise sort alphabetically
    return (a.CompanyName || '').localeCompare(b.CompanyName || '');
  });

  return (
    <div className="flex flex-col h-screen overflow-y-hidden">
      <TopBar
        title="Veiligstallen Beheer Dashboard"
        currentComponent={activecomponent}
        user={currentUser} gemeenten={sortedGemeenten}
        selectedGemeenteID={selectedGemeenteID}
        onGemeenteSelect={handleSelectGemeente}
      />
      <div className="flex">
        {selectedGemeenteID !== "1" ? (
          <LeftMenuGemeente
            securityProfile={currentUser?.securityProfile}
            activecontact={getActiveContact()}
            activecomponent={activecomponent}
            onSelect={(componentKey: VSMenuTopic) => handleSelectComponent(componentKey)} // Pass the component key
          />
        ) : (
          <LeftMenu
            securityProfile={currentUser?.securityProfile}
            activecontact={getActiveContact()}
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
