import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LeftMenu, { AvailableComponents } from '../../components/beheer/LeftMenu';
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
    const [activecomponent, setActiveComponent] = useState<AvailableComponents>(AvailableComponents.home);
    const [bikeparks, setBikeparks] = useState<ReportBikeparks|undefined>(undefined);

    const showAbonnementenRapporten = true;

    const dateFirstTransactions = new Date("2018-03-01");

    // let activecomponent = AvailableComponents.home;
    // if(router.query.activecomponent && false === Array.isArray(router.query.activecomponent) && router.query.activecomponent in AvailableComponents) {
    //     activecomponent = router.query.activecomponent as AvailableComponents;
    // }
    console.log("============ BeheerPage %s ============");

  useEffect(() => {
    try {
      setBikeparks(mockBikeparks);
    } catch (error) {
      console.error("Error setting bikeparks:", error);
    }
  }, []);

  useEffect(() => {
    try {
        if(undefined===bikeparks) {
            return;
        }
        
      let tmpcomponent = AvailableComponents.home;
      if (router.query.activecomponent && false === Array.isArray(router.query.activecomponent) && router.query.activecomponent in AvailableComponents) {
        console.log(">>>> got activecomponent ", tmpcomponent);
        tmpcomponent = router.query.activecomponent as AvailableComponents;
      }

      if (tmpcomponent !== activecomponent) {
        console.log(">>>> change activecomponent to", tmpcomponent);
        setActiveComponent(tmpcomponent);
      }
    } catch (error) {
      console.error("Error in useEffect for activecomponent:", error);
    }
  }, [router.query.activecomponent]);

  const handleSelectComponent = (componentKey: AvailableComponents) => {
    try {
      const url = `/beheer/${componentKey}`;
      console.log(">>>> push new url", url);
      router.push(url); //  undefined, { shallow: true }
      setActiveComponent(componentKey);
    } catch (error) {
      console.error("Error in handleSelectComponent:", error);
    }
  };

  const renderComponent = () => {
    try {
      console.log("renderComponent %s", activecomponent);
      let selectedComponent = undefined;
      switch (activecomponent) {
        case AvailableComponents.home:
          selectedComponent = <HomeComponent  />;
          break;
        case AvailableComponents.report:
          selectedComponent = <ReportComponent showAbonnementenRapporten={showAbonnementenRapporten} dateFirstTransactions={dateFirstTransactions} bikeparks={bikeparks} />;
          break;
        case AvailableComponents.articlespages:
          selectedComponent = <ArticlesComponent type="pages" />;
          break;
        case AvailableComponents.faq:
          selectedComponent = <FaqComponent />;
          break;
        case AvailableComponents.documents:
          selectedComponent = <DocumentsComponent />;
          break;
        case AvailableComponents.contacts:
          selectedComponent = <ContactsComponent />;
          break;
        case AvailableComponents.products:
          selectedComponent = <ProductsComponent />;
          break;
        case AvailableComponents.logboek:
          selectedComponent = <LogboekComponent />;
          break;
        case AvailableComponents.usersgebruikersbeheer:
          selectedComponent = <UsersComponent type="gebruiker" />;
          break;
        case AvailableComponents.usersexploitanten:
          selectedComponent = <UsersComponent type="exploitant" />;
          break;
        case AvailableComponents.fietsenstallingen:
          selectedComponent = <FietsenstallingenComponent type="fietsenstallingen" />;
          break;
        case AvailableComponents.fietskluizen:
          selectedComponent = <FietsenstallingenComponent type="fietskluizen" />;
          break;
        case AvailableComponents.buurtstallingen:
          selectedComponent = <FietsenstallingenComponent type="buurtstallingen" />;
          break;
        case AvailableComponents.barcodereeksenuitgiftebarcodes:
          selectedComponent = <BarcodereeksenComponent type="uitgifte-barcodes" />;
          break;
        case AvailableComponents.barcodereeksensleutelhangers:
          selectedComponent = <BarcodereeksenComponent type="sleutelhangers" />;
          break;
        case AvailableComponents.barcodereeksenfietsstickers:
          selectedComponent = <BarcodereeksenComponent type="fietsstickers" />;
          break;
        case AvailableComponents.permits:
          selectedComponent = <PermitsComponent />;
          break;
        case AvailableComponents.presentations:
          selectedComponent = <PresentationsComponent />;
          break;
        case AvailableComponents.settings:
          console.log(">>>> settings");
          selectedComponent = <SettingsComponent />;
          break;
        case AvailableComponents.trekkingen:
          selectedComponent = <TrekkingenComponent type="trekkingen" />;
          break;
        case AvailableComponents.trekkingenprijzen:
          selectedComponent = <TrekkingenComponent type="prijzen" />;
          break;
        case AvailableComponents.abonnementen:
          selectedComponent = <AbonnementenComponent type="abonnementen"/>;
          break;
        case AvailableComponents.abonnementsvormen:
          selectedComponent = <AbonnementenComponent type="abonnementsvormen"/>;
          break;
        default:
          selectedComponent = <HomeComponent />;
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
        bikeparks={bikeparks}
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
