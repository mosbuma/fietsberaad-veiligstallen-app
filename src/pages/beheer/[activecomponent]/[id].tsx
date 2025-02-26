import React, { useState } from 'react';
import { GetServerSidePropsContext,GetServerSidePropsResult } from 'next';
import type { User, Session } from "next-auth";
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'

import { useRouter } from "next/router";
import LeftMenu, {
  AvailableComponents,
  isAvailableComponent,
} from "~/components/beheer/LeftMenu";
import TopBar from "~/components/beheer/TopBar";
import { ReportBikepark } from "~/components/beheer/reports/ReportsFilter";

import AbonnementenComponent from '~/components/beheer/abonnementen';
import AccountsComponent from '~/components/beheer/accounts';
import ApisComponent from '~/components/beheer/apis';
import ArticlesComponent from '~/components/beheer/articles';
import BarcodereeksenComponent from '~/components/beheer/barcodereeksen';
import GemeenteComponent from '~/components/beheer/contacts/gemeente';
import ExploitantComponent from '~/components/beheer/contacts/expoitant';
import DataproviderComponent from '~/components/beheer/contacts/dataprovider';
import DocumentsComponent from '~/components/beheer/documenten';
import ExportComponent from '~/components/beheer/exports';
import FaqComponent from '~/components/beheer/faq';
import HomeComponent from '~/components/beheer/home';
import LogboekComponent from '~/components/beheer/logboek';
import FietsenstallingenComponent from '~/components/beheer/fietsenstallingen';
import PresentationsComponent from '~/components/beheer/presentations';
import ProductsComponent from '~/components/beheer/producten';
import ReportComponent from '~/components/beheer/reports';
import SettingsComponent from '~/components/beheer/settings';
import TrekkingenComponent from '~/components/beheer/trekkingen';
import UsersComponent from '~/components/beheer/users';
import DatabaseComponent from '~/components/beheer/database';
import ExploreUsersComponent from '~/components/ExploreUsersComponent';
import ExploreGemeenteComponent from '~/components/ExploreGemeenteComponent';
import ExploreExploitant from '~/components/ExploreExploitantComponent';

import { prisma } from '~/server/db';
import type { security_roles, fietsenstallingtypen } from '@prisma/client';
import type { VSContactDataprovider, VSContactExploitant, VSContactGemeente, VSModule, VSUserWithRoles } from "~/types/";
import { gemeenteSelect, exploitantSelect, securityUserSelect, dataproviderSelect, VSUserRoleValuesNew } from "~/types/";

import Styles from "~/pages/content.module.css";
import { useSession } from "next-auth/react";

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<BeheerPageProps>> => {
  const session = await getServerSession(context.req, context.res, authOptions) as Session;

  console.log(">>> SERVERSESSION ACID", session?.user?.activeContactId);
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

  const exploitanten: VSContactExploitant[] | undefined = await prisma.contacts.findMany({
    where: { ItemType: 'exploitant', ...whereCondition },
    select: exploitantSelect,
  });

  const dataproviders: VSContactDataprovider [] | undefined = await prisma.contacts.findMany({
    where: { ItemType: 'dataprovider', ...whereCondition },
    select: dataproviderSelect,
  });

  let condition: { security_users_sites: { some: { SiteID: { in: string[] } } } } | undefined = {
    security_users_sites: { some: { SiteID: { in: validContactIDs } } }
  };

  if(currentUser?.securityProfile?.roleId === VSUserRoleValuesNew.RootAdmin) {
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

  if(users !== undefined && users[0] !== undefined) {
    users.sort((a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || ""));
  }

  const bikeparks: ReportBikepark[] = []; // merge the ids and names for the stallingen in the gemeenten using map reduce
  if(gemeenten !== undefined && gemeenten[0]!== undefined) {
    gemeenten.forEach(gemeente => {
      if(gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts !== undefined) { 
        gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts
          .filter(stalling => stalling.StallingsID !== null)
          .forEach(stalling => {
            bikeparks.push({
              id: stalling.ID,
              stallingsID: stalling.StallingsID || "---",
              title: stalling.Title || `Stalling ${stalling.ID}`,
              gemeenteID: gemeente.ID,
              ZipID: gemeente.ZipID || "---",
              hasData: true,
          });
        });
      }
    });
  }

  bikeparks.sort((a, b) => a.title.localeCompare(b.title));

  if(currentUser) {
  if(currentUser.image === undefined) {
    currentUser.image = "/images/user.png";
    }
  }else {
    console.log("no current user");
  }
  return { props: { currentUser, gemeenten: gemeenten, exploitanten, dataproviders, bikeparks, users, roles, modules, fietsenstallingtypen } };
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

  let activecomponent: AvailableComponents | undefined = "home";

  // useEffect(() => {
  //   if (selectedGemeenteID === "" && gemeenten && gemeenten.length > 0 && gemeenten[0] !== undefined) {
  //     setSelectedGemeenteID(gemeenten[0].ID);
  //   }
  // }, [gemeenten, selectedGemeenteID]);

  const activeComponentQuery = router.query.activecomponent;
  if (
    activeComponentQuery &&
    typeof activeComponentQuery === 'string' &&
    isAvailableComponent(activeComponentQuery)
  ) {
    activecomponent = activeComponentQuery as AvailableComponents;
  }

  const activeIDQuery = router.query.id;
  const activeId = typeof activeIDQuery === 'string' ? router.query.id as string : undefined;


  const handleSelectComponent = (componentKey: AvailableComponents) => {
    try {
      router.push(`/beheer/${componentKey}`); // this returns a promise!
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

        console.log(">>> new user activeContactId", user.activeContactId);
        
        // Update the session with new user data
        const newSession = await updateSession({
            ...session,
            user
        });

        console.log(">>> new session activeContactId", newSession);
    } catch (error) {
        console.error("Error switching contact:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const selectedGemeenteID = session?.user?.activeContactId || "";
  const filteredBikeparks = bikeparks?.filter((bikepark) => (selectedGemeenteID !== "") && (bikepark.gemeenteID === selectedGemeenteID));

  // const filteredUsers = users?.filter((user) => (selectedGemeenteID !== "") && (user.security_users_sites.some(site => site.SiteID === selectedGemeenteID)));

  const renderComponent = () => {
    try {
      let selectedComponent = undefined;
      switch (activecomponent) {
        case "home":
          selectedComponent = <HomeComponent />;
          break;
        case "report":
          { selectedGemeenteID!=="" ? (
            selectedComponent = <ReportComponent
              showAbonnementenRapporten={showAbonnementenRapporten}
              firstDate={firstDate}
              lastDate={lastDate}
              bikeparks={filteredBikeparks || []}
            />
          ) : (
            selectedComponent = <div className="text-center text-gray-500 mt-10 text-xl" >Selecteer een gemeente om rapportages te bekijken</div>
          )}
          break;
        case "articles-pages":
          selectedComponent = <ArticlesComponent type="pages" />;
          break;
        case "faq":
          selectedComponent = <FaqComponent />;
          break;
        case "database":
          selectedComponent = <DatabaseComponent bikeparks={bikeparks} firstDate={firstDate} lastDate={lastDate} />;
          break;
        case "export":
          selectedComponent = <ExportComponent
              gemeenteID={selectedGemeenteID}
              gemeenteName={gemeenten?.find(gemeente => gemeente.ID === selectedGemeenteID)?.CompanyName || ""}
              firstDate={firstDate}
              lastDate={lastDate}
              bikeparks={filteredBikeparks || []}
          />; 
          break;
        case "documents":
          selectedComponent = <DocumentsComponent />;
          break;
        case "contacts-gemeenten":
          selectedComponent = (
            <GemeenteComponent
              gemeenten={gemeenten || []}
              users={users || []}
              roles={roles || []}
              fietsenstallingtypen={fietsenstallingtypen || []}
            />
          );
          break;
        case "contacts-exploitanten":
          selectedComponent = <ExploitantComponent
            users={users || []} 
            roles={roles || []} 
            exploitanten={exploitanten || []} 
            gemeenten={gemeenten || []}
            fietsenstallingtypen={fietsenstallingtypen || []} 
          />;
          break;
        case "contacts-dataproviders":
          selectedComponent = <DataproviderComponent dataproviders={dataproviders || []} />;
          break;
        case "explore-users":
          selectedComponent = <ExploreUsersComponent roles={roles || []} users={users || []} exploitanten={exploitanten || []} 
          gemeenten={gemeenten || []} dataproviders={dataproviders || []} />;
          break;
        case "explore-gemeenten":
          selectedComponent = <ExploreGemeenteComponent gemeenten={gemeenten || []} exploitanten={exploitanten || []} dataproviders={dataproviders || []} stallingen={bikeparks || []} users={users || []} />;
          break;
        case "explore-exploitanten":
          selectedComponent = <ExploreExploitant exploitanten={exploitanten || []} gemeenten={gemeenten || []} dataproviders={dataproviders || []} stallingen={bikeparks || []} users={users || []} />;
          break;
        case "products":
          selectedComponent = <ProductsComponent />;
          break;
        case "logboek":
          selectedComponent = <LogboekComponent />;
          break;
        case "users-gebruikersbeheer":
          selectedComponent = <UsersComponent type="interne-gebruiker" users={users || []} roles={roles || []} />;
          break;
        // case "users-beheerders":
        //   selectedComponent = <GemeenteComponent type="admins" users={users || []} roles={roles || []} contacts={dataproviders || []} modules={modules || []} fietsenstallingtypen={fietsenstallingtypen || []} />;
        //   break;
        case "fietsenstallingen":
          selectedComponent = <FietsenstallingenComponent type="fietsenstallingen" />;
          break;
        case "fietskluizen":
          selectedComponent = <FietsenstallingenComponent type="fietskluizen" />;
          break;
        case "buurtstallingen":
          selectedComponent = <FietsenstallingenComponent type="buurtstallingen" />;
          break;
        case "barcodereeksen-uitgifte-barcodes":
          selectedComponent = <BarcodereeksenComponent type="uitgifte-barcodes" />;
          break;
        case "barcodereeksen-sleutelhangers":
          selectedComponent = <BarcodereeksenComponent type="sleutelhangers" />;
          break;
        case "barcodereeksen-fietsstickers":
          selectedComponent = <BarcodereeksenComponent type="fietsstickers" />;
          break;
        case "presentations":
          selectedComponent = <PresentationsComponent />;
          break;
        case "settings":
          selectedComponent = <SettingsComponent />;
          break;
        case "trekkingen":
          selectedComponent = <TrekkingenComponent type="trekkingen" />;
          break;
        case "trekkingenprijzen":
          selectedComponent = <TrekkingenComponent type="prijzen" />;
          break;
        case "abonnementen":
          selectedComponent = <AbonnementenComponent type="abonnementen" />;
          break;
        case "abonnementsvormen":
          selectedComponent = <AbonnementenComponent type="abonnementsvormen" />;
          break;
        case "accounts":
          selectedComponent = <AccountsComponent />;
          break;
        case "apis-gekoppelde-locaties":
          selectedComponent = <ApisComponent type="gekoppelde-locaties" />;
          break;
        case "apis-overzicht":
          selectedComponent = <ApisComponent type="overzicht" />;
          break;
        case "articles-abonnementen":
          selectedComponent = <ArticlesComponent type="abonnementen" />;
          break;
        case "articles-articles":
          selectedComponent = <ArticlesComponent type="articles" />;
          break;
        case "articles-buurtstallingen":
          selectedComponent = <ArticlesComponent type="buurtstallingen" />;
          break;
        case "articles-fietskluizen":
          selectedComponent = <ArticlesComponent type="fietskluizen" />;
          break;
        // case "stalling-info":
        //   selectedComponent = <StallingInfoComponent />;
        //   break;
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

  console.log(">>> session", session);

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="Veiligstallen Beheer Dashboard"
        currentComponent={activecomponent || "home"}
        user={currentUser} gemeenten={sortedGemeenten}
        selectedGemeenteID={selectedGemeenteID}
        onGemeenteSelect={handleSelectGemeente}
      />
        <div className="flex">
        <LeftMenu
          user={currentUser}
          activecontact={getActiveContact()}
          activecomponent={activecomponent}
          onSelect={(componentKey: AvailableComponents) => handleSelectComponent(componentKey)} // Pass the component key
        />

        {/* Main Content */}
        <div className={`flex-1 p-4 overflow-auto ${Styles.ContentPage_Body}`} style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default BeheerPage;
