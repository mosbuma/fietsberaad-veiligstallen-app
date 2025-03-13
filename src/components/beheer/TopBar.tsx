import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { type User } from "next-auth";
import { useSession, signOut } from "next-auth/react"
import { AppState } from "~/store/store";
import type { VSUserSecurityProfile } from "~/types/";
import type { Session } from "next-auth";
import type { VSContactGemeente } from "~/types/contacts";
import { userHasRight, logSession } from '~/types/utils';


interface TopBarProps {
  title: string;
  currentComponent: string;
  user: User | undefined;
  gemeenten: VSContactGemeente[] | undefined;
  selectedGemeenteID: string | undefined;
  onGemeenteSelect: (gemeenteID: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  currentComponent,
  user,
  gemeenten,
  selectedGemeenteID,
  onGemeenteSelect,
}) => {
  const { push } = useRouter();
  const { data: session } = useSession()

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );


  const themeColor1 = activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
  ? `#${activeMunicipalityInfo.ThemeColor1}`
  : '#15aeef';

const themeColor2 = activeMunicipalityInfo && activeMunicipalityInfo.ThemeColor1
  ? `#${activeMunicipalityInfo.ThemeColor2}`
  : '#15aeef';

  const handleGemeenteChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();
    onGemeenteSelect(event.target.value);
  };

  const handleLoginClick = () => {
    if (!session) {
      push('/login?redirect=/beheer');
    } else {
      // sign out
      signOut();
    }
  };

  const handleDisplaySessionInfo = () => {
    if(process.env.NODE_ENV === 'development') {
      logSession(session as Session | null);
    }
  };

  const profile = session?.user?.securityProfile as VSUserSecurityProfile | undefined;

  const visibleContacts = gemeenten?.sort((a, b) => {
    // If a is the main contact, it should come first
    if (a.ID === (profile?.mainContactId || "")) return -1;
    // If b is the main contact, it should come first
    if (b.ID === (profile?.mainContactId || "")) return 1;
    // Otherwise sort alphabetically
    return (a.CompanyName || '').localeCompare(b.CompanyName || '');
  });

  return (
    <div
      className="
      z-10 flex w-full items-center
      justify-between bg-white px-5 shadow
    "
    >
      <div style={{ flex: 1 }}>
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-16 w-auto bg-white p-2"
        />
      </div>
      <div
        className="
        primaryMenuItems-wrapper

        flex-start
        flex flex-1 flex-wrap
        overflow-hidden text-left
        opacity-100
        transition-opacity
        duration-500
      
      "
        style={{ flex: 4 }}
      >
        <div className="PrimaryMenuItem bock px-5">
          <a
            href="/"
            className="flex h-full flex-col justify-center"
            onClick={e => {
              e.preventDefault();
              push("/");
            }}
          >
            <img src="/images/icon-map.png" style={{ height: "30px" }} />
          </a>
        </div>
        <div className="PrimaryMenuItem px-5">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>
      <div
        className="flex items-center justify-end space-x-4 text-sm"
        style={{ flex: 3 }}
      >
        {session?.user?.name && (
          <div className="text-sm" onClick={handleDisplaySessionInfo}>
            {session?.user?.name || "---"}
          </div>
        )}
        {currentComponent !== "home" && (
          <Link href="/beheer" className="hover:underline">
            Beheer Home
          </Link>
        )}
        {visibleContacts && visibleContacts.length > 0 && (
          <select
            onChange={handleGemeenteChange}
            value={selectedGemeenteID || ""}
            className="rounded bg-gray-700 px-2 py-1 text-white"
          >
            {visibleContacts.map(gemeente => (
              <option
                key={`select-gemeente-option-${gemeente.ID}`}
                value={gemeente.ID}
              >
                {gemeente.CompanyName} {gemeente.ID===profile?.mainContactId ? " (mijn organisatie)" : ""}
              </option>
            ))}
          </select>
        )}

        <a
          href="https://fms.veiligstallen.nl"
          target="_blank"
          className="
              mx-2
              flex
              h-10
              flex-col
              justify-center
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
            "
          style={{
            backgroundColor: "#15aeef",
          }}
          title="Ga naar het oude FMS beheersysteem"
        >
          FMS
        </a>

        <button
            className="
              mx-2
              h-10
              rounded-md
              px-4
              font-bold
              text-white
              shadow-lg
            "
            style={{
              backgroundColor: themeColor2 || themeColor1,
            }}
            onClick={handleLoginClick}
          >
            {session ? "Log uit" : "Log in"}
          </button>
      </div>
    </div>
  );
};

export default TopBar;
