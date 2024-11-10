import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LeftMenu, { AvailableComponents, isAvailableComponent } from '../../components/beheer/LeftMenu';
import { mockUser, mockCouncil, mockExploitant } from '../../utils/mock';
import { ReportBikeparks } from '../../components/beheer/reports/ReportsFilter';

import AbonnementenComponent from '../../components/beheer/abonnementen';
import AccountsComponent from '../../components/beheer/accounts';
import ApisComponent from '../../components/beheer/apis';
import ArticlesComponent from '../../components/beheer/articles';
import BarcodereeksenComponent from '../../components/beheer/barcodereeksen';
import ContactsComponent from '../../components/beheer/contacts';
import DocumentsComponent from '../../components/beheer/documenten';
import FaqComponent from '../../components/beheer/faq';
import HomeComponent from '../../components/beheer/home';
import LogboekComponent from '../../components/beheer/logboek';
import FietsenstallingenComponent from '../../components/beheer/fietsenstallingen';
import PermitsComponent from '../../components/beheer/permits';
import PresentationsComponent from '../../components/beheer/presentations';
import ProductsComponent from '../../components/beheer/producten';
import ReportComponent from '../../components/beheer/reports';
import SettingsComponent from '../../components/beheer/settings';
import TrekkingenComponent from '../../components/beheer/trekkingen';
import UsersComponent from '../../components/beheer/users';

const mockBikeparks: ReportBikeparks = [
  { StallingsID: "123", Title: "Bikepark 1", hasData: true },
  { StallingsID: "456", Title: "Bikepark 2", hasData: false },
  { StallingsID: "789", Title: "Bikepark 3", hasData: true },
  { StallingsID: "101", Title: "Bikepark 4", hasData: true },
  { StallingsID: "102", Title: "Bikepark 5", hasData: false },
  { StallingsID: "103", Title: "Bikepark 6", hasData: true },
];

const BeheerPage: React.FC = () => {
    const router = useRouter();

    const [bikeparks, setBikeparks] = useState<ReportBikeparks|undefined>(undefined);

    const showAbonnementenRapporten = true;

    const dateFirstTransactions = new Date("2018-03-01");

    let activecomponent: AvailableComponents | undefined = undefined;

    const activeComponentQuery = router.query.activecomponent;
    if (
      activeComponentQuery &&
      typeof activeComponentQuery === 'string' &&
      isAvailableComponent(activeComponentQuery)
    ) {
        activecomponent = activeComponentQuery as AvailableComponents;
    }

  useEffect(() => {
    try {
      setBikeparks(mockBikeparks);
    } catch (error) {
      console.error("Error setting bikeparks:", error);
    }
  }, []);

  const handleSelectComponent = (componentKey: AvailableComponents) => {
    try {
      router.push(`/beheer/${componentKey}`); // this returns a promise!
    } catch (error) {
      console.error("Error in handleSelectComponent:", error);
    }
  };

  const renderComponent = () => {
    try {
      let selectedComponent = undefined;
      switch (activecomponent) {
        case "home":
          selectedComponent = <HomeComponent  />;
          break;
        case "report":
          selectedComponent = <ReportComponent showAbonnementenRapporten={showAbonnementenRapporten} dateFirstTransactions={dateFirstTransactions} bikeparks={bikeparks||[]} />;
          break;
        case "articles-pages":
          selectedComponent = <ArticlesComponent type="pages" />;
          break;
        case "faq":
          selectedComponent = <FaqComponent />;
          break;
        case "documents":
          selectedComponent = <DocumentsComponent />;
          break;
        case "contacts":
          selectedComponent = <ContactsComponent />;
          break;
        case "products":
          selectedComponent = <ProductsComponent />;
          break;
        case "logboek":
          selectedComponent = <LogboekComponent />;
          break;
        case "users-gebruikersbeheer":
          selectedComponent = <UsersComponent type="gebruiker" />;
          break;
        case "users-exploitanten":
          selectedComponent = <UsersComponent type="exploitant" />;
          break;
        case "users-beheerders":
          selectedComponent = <UsersComponent type="beheerder"/>;
          break;
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
        case "permits":
          selectedComponent = <PermitsComponent />;
          break;
        case "presentations":
          selectedComponent = <PresentationsComponent />;
          break;
        case "settings":
          console.log(">>>> settings");
          selectedComponent = <SettingsComponent />;
          break;
        case "trekkingen":
          selectedComponent = <TrekkingenComponent type="trekkingen" />;
          break;
        case "trekkingenprijzen":
          selectedComponent = <TrekkingenComponent type="prijzen" />;
          break;
        case "abonnementen":
          selectedComponent = <AbonnementenComponent type="abonnementen"/>;
          break;
        case "abonnementsvormen":
          selectedComponent = <AbonnementenComponent type="abonnementsvormen"/>;
          break;
        case "accounts":
          selectedComponent = <AccountsComponent />;
          break;
        case "apis-gekoppelde-locaties":
          selectedComponent = <ApisComponent type="gekoppelde-locaties"/>;
          break;
        case "apis-overzicht":
          selectedComponent = <ApisComponent type="overzicht"/>;
          break;
        case "articles-abonnementen":
          selectedComponent = <ArticlesComponent type="abonnementen"/>;
          break;
        case "articles-articles":
          selectedComponent = <ArticlesComponent type="articles"/>;
          break;
        case "articles-buurtstallingen":
          selectedComponent = <ArticlesComponent type="buurtstallingen"/>;
          break;
        case "articles-fietskluizen":
          selectedComponent = <ArticlesComponent type="fietskluizen"/>;
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
    <div className="flex">
      {/* Left Menu */}
      <LeftMenu
        user={mockUser}
        council={mockCouncil}
        exploitant={mockExploitant}
        activecomponent={activecomponent}
        onSelect={(componentKey:AvailableComponents) => handleSelectComponent(componentKey)} // Pass the component key
      />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Veiligstallen Beheer Dashboard</h1>
        {renderComponent()} 
      </div>
    </div>
  );
};

export default BeheerPage;
