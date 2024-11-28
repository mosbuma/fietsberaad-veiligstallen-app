import React, { useEffect } from 'react';
import Link from 'next/link';
import { User, Gemeente } from '../../utils/mock';
import router from 'next/router';
interface TopBarProps {
  title: string;
  currentComponent: string;
  user: User | undefined;
  gemeentes: Gemeente[] | undefined;
  selectedGemeenteID: string | undefined;
  onGemeenteSelect: (gemeente: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title, currentComponent, user, gemeentes, selectedGemeenteID, onGemeenteSelect
}) => {
  const handleGemeenteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    onGemeenteSelect(event.target.value);
  };

  return (
    <div className="
      z-10 flex w-full px-5 bg-white shadow
      w-full flex items-center justify-between
    ">
      <div style={{ flex: 1 }}>
        <img src="/images/logo.png" alt="Logo" className="h-16 w-auto p-2 bg-white" />
      </div>
      <div className="
        text-left

        primaryMenuItems-wrapper
        flex-1 flex flex-start
        flex-wrap overflow-hidden
        transition-opacity
        duration-500
        opacity-100
      
      " style={{ flex: 4 }}>
        <div className="PrimaryMenuItem px-5 bock">
          <a href="/" className="flex flex-col justify-center h-full" onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}>
            <img src="/images/icon-map.png" style={{ height: "30px" }} />
          </a>
        </div>
        <div className="PrimaryMenuItem px-5">
          <h1 className="text-lg font-semibold">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex justify-end items-center space-x-4 text-sm" style={{ flex: 3 }}>
        {currentComponent !== "home" && (
          <Link href="/beheer" className="hover:underline">
            Beheer Home
          </Link>
        )}
        {gemeentes && <select onChange={handleGemeenteChange} value={selectedGemeenteID || ""} className="bg-gray-700 text-white rounded px-2 py-1">
          <option key="select-gemeente-placeholder" value="">Selecteer gemeente</option>
          {gemeentes.map((gemeente) => (
            <option key={`select-gemeente-option-${gemeente.id}`} value={gemeente.id}>
              {gemeente.title}
            </option>
          ))}
        </select>}

        <a
          href="https://fms.veiligstallen.nl"
          target="_blank"
          className="
              mx-2
              h-10
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
              flex
              flex-col
              justify-center
            "
          style={{
            backgroundColor: '#15aeef'
          }}

          title="Ga naar het oude FMS beheersysteem"
        >
          FMS
        </a>

        {user !== undefined ? (
          <button className="mx-2 h-10 rounded-md px-4 font-bold text-white shadow-lg" style={{
            backgroundColor: "#15aeef"
          }}>
            Log uit
          </button>
        ) : (
          <button className="mx-2 h-10 rounded-md px-4 font-bold text-white shadow-lg" style={{
            backgroundColor: "#15aeef"
          }}>
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;