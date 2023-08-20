import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation'
import { useSelector } from "react-redux";
import useQueryParam from '../hooks/useQueryParam';
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { signIn } from "next-auth/react";
import Head from "next/head";

// Import components
import PageTitle from "~/components/PageTitle";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import AppHeaderMobile from "~/components/AppHeaderMobile";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
import { Button } from "~/components/Button";
import Modal from "src/components/Modal";
import Overlay from "src/components/Overlay";
import Parking from "~/components/Parking";

// import Styles from "./login.module.css";

import { getParkingsFromDatabase } from "~/utils/prisma";

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions)
    const sites = session?.user?.sites || [];
    const fietsenstallingen = await getParkingsFromDatabase(sites);

    return {
      props: {
      	sites: sites,
        fietsenstallingen: fietsenstallingen,
      },
    };
  } catch (ex: any) {
    // console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: {
      	sites: sites,
        fietsenstallingen: [],
      },
    };
  }
}

const Content: NextPage = ({ fietsenstallingen, sites }) => {
  const { push } = useRouter();
  const [currentStallingId, setCurrentStallingId] = useState(undefined);

  const currentStalling = fietsenstallingen.find((stalling: any) => {
    return stalling.ID === currentStallingId;
  });

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;
  const isLg = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <Head>
        <title>
        	{activeMunicipalityInfo
	        	? `${activeMunicipalityInfo.CompanyName} - VeiligStallen`
	        	: 'VeiligStallen'}
      	</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
			<div data-comment="Show only on desktop" className="hidden sm:flex">
			  <AppHeaderDesktop />
			</div>
			<div data-comment="Show only on mobile" className="block sm:hidden">
			  <AppHeaderMobile
			  	handleCloseClick={() => {
			  		history.back();
			  	}}
			  />
			</div>
			<div className={`
				lg:mt-16
				p-4
				sm:pt-20
				container
				mx-auto

			 flex-wrap lg:flex justify-between lg:flex-nowrap
			`}>
				<div className="
					flex-1
					lg:mr-24
				">
					<PageTitle>
						Buurtstallingen
					</PageTitle>
					<div className="
						text-lg
						my-4

					">
						Interesse in een plek in de buurtstalling? Lees dan onderstaande zorgvuldig door!
					</div>
					<div className="
						my-4
						mt-12

					">
						Wij willen u graag attenderen op het feit dat de buurtstallingen niet gemaakt zijn voor fietsen met een ‘breed’ stuur, voor fietsen met een transportrekje met of zonder mandje of kratje voorop, voor fietsen met grote fietstassen achterop en voor fietsen met een kinderzitje voor- en/of achterop. Mocht u een plek bemachtigen in de buurtstalling en mocht u tegenkomen dat uw fiets niet past of hinder zal veroorzaken aan de andere huurders dan kunt u het abonnement kosteloos ontbinden. Wanneer uw het abonnement neemt en u geeft hinder aan de andere huurders door bovenstaande redenen dan hebben wij het recht om uw abonnement te ontbinden.
					</div>
				</div>
				<div className="
					mt-10
					p-4
					max-w-full
				"
				style={{
					width: '414px'
				}}
				>
					<ParkingFacilityBrowser
						customFilter={() => {  }}
            onShowStallingDetails={(id: any) => setCurrentStallingId(id)}
						fietsenstallingen={fietsenstallingen}
					/>
				</div>
			</div>

      {currentStallingId && isSm && (<>
        <Overlay
          title={currentStalling.Title}
          onClose={() => setCurrentStallingId(undefined)}
        >
          <Parking
            key={currentStallingId}
            parkingdata={currentStalling}
          />
        </Overlay>
      </>)}

      {currentStallingId && ! isSm && (<>
        <Modal
          onClose={() => setCurrentStallingId(undefined)}
          clickOutsideClosesDialog={true}
        >
          <Parking
            key={currentStallingId}
            parkingdata={fietsenstallingen.find((stalling: any) => {
              return stalling.ID === currentStallingId;
            })}
          />
        </Modal>
      </>)}


		</>
  );
};

export default Content;
