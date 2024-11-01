import React, { useState } from 'react';
import LeftMenu from '../../components/beheer/LeftMenu';
import { mockUser, mockCouncil, mockExploitant } from '../../utils/mock';

// Define the components you want to render
const HomeComponent = () => <div>Home Content</div>;
const SettingsComponent = () => <div>Settings Content</div>;
// Add other components as needed...

const VeiligstallenBeheerPage: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<React.ReactNode>(<HomeComponent />); // State for selected component

  return (
    <div className="flex">
      {/* Left Menu */}
      <LeftMenu
        user={mockUser}
        council={mockCouncil}
        siteID="123"
        exploitant={mockExploitant}
        onSelect={setSelectedComponent} // Pass the setSelectedComponent function
      />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Veiligstallen Beheer Dashboard</h1>
        <p>Welkom op het Veiligstallen Beheer Dashboard. Hier kunt u de veiligstallen omgeving en gegevens beheren.</p>
        {selectedComponent} {/* Render the selected component */}
      </div>
    </div>
  );
};

export default VeiligstallenBeheerPage;
