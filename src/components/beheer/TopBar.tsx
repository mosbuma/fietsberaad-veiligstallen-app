import React from 'react';
import Link from 'next/link';
import { User, Gemeente } from '../../utils/mock';
interface TopBarProps {
  title: string;
  currentComponent: string;
  user: User | undefined;
  gemeentes: Gemeente[] | undefined;
  selectedGemeenteID: string | undefined;
  onGemeenteSelect: (gemeente: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, currentComponent, user, gemeentes, selectedGemeenteID, onGemeenteSelect }) => {
  const handleGemeenteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    onGemeenteSelect(event.target.value);
  };

  return (
    <div className="bg-gray-800 text-white w-full flex items-center justify-between p-4">
      <div style={{ flex: 1 }}>
        <img src="/images/logo.png" alt="Logo" className="h-16 w-auto p-2 bg-white" />
      </div>
      <div className="text-left" style={{ flex: 4 }}>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex justify-end items-center space-x-4 text-sm" style={{ flex: 3 }}>
        {currentComponent !== "home" && (
          <Link href="/beheer" className="hover:underline">
            Beheer Home
          </Link>
        )}
        {gemeentes && <select onChange={handleGemeenteChange} defaultValue={selectedGemeenteID || ""} className="bg-gray-700 text-white rounded px-2 py-1">
          <option key="select-gemeente-placeholder" value="">Selecteer gemeente</option>
          {gemeentes.map((gemeente) => (<option key={`select-gemeente-option-${gemeente.id}`} value={gemeente.id}>{gemeente.title}</option>))}
        </select>}
        {user !== undefined ? (
          <Link href="#" className="hover:underline">
            Logout
          </Link>
        ) : (
          <Link href="#" className="hover:underline">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopBar;