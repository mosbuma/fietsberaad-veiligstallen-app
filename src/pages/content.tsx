import React, { useRef } from "react";
import { useRouter } from 'next/navigation'
import useQueryParam from '../hooks/useQueryParam';

// Import components
import PageTitle from "~/components/PageTitle";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
import { Button } from "~/components/Button";
import { signIn } from "next-auth/react";

// import Styles from "./login.module.css";

import { getParkingsFromDatabase } from "~/utils/prisma";

export async function getStaticProps() {
  try {
    // console.log("index.getStaticProps - start");
    const fietsenstallingen = await getParkingsFromDatabase();
    // TODO: Don't include: EditorCreated, EditorModified

    return {
      props: {
        fietsenstallingen: fietsenstallingen,
      },
    };
  } catch (ex: any) {
    // console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
      },
    };
  }
}


const Content: NextPage = ({ fietsenstallingen }) => {
  const { push } = useRouter();

  return (
    <>
			<div data-comment="Show only on desktop" className="hidden sm:flex">
			  <AppHeaderDesktop />
			</div>
			<div className={`
				mt-16
				p-4
				lg:pt-16
				container
				mx-auto

				flex justify-between flex-wrap lg:flex-nowrap
			`}>
				<div>
					<PageTitle>
						Buurtstallingen
					</PageTitle>
					<div className="
						text-lg
						my-4
						lg:w-2/5
						w-4/5
					">
						Interesse in een plek in de buurtstalling? Lees dan onderstaande zorgvuldig door!
					</div>
					<div className="
						my-4
						mt-12
						lg:w-3/5
					">
						Wij willen u graag attenderen op het feit dat de buurtstallingen niet gemaakt zijn voor fietsen met een ‘breed’ stuur, voor fietsen met een transportrekje met of zonder mandje of kratje voorop, voor fietsen met grote fietstassen achterop en voor fietsen met een kinderzitje voor- en/of achterop. Mocht u een plek bemachtigen in de buurtstalling en mocht u tegenkomen dat uw fiets niet past of hinder zal veroorzaken aan de andere huurders dan kunt u het abonnement kosteloos ontbinden. Wanneer uw het abonnement neemt en u geeft hinder aan de andere huurders door bovenstaande redenen dan hebben wij het recht om uw abonnement te ontbinden.
					</div>
				</div>
				<div className="
					mt-10
					p-4
				">
					<ParkingFacilityBrowser
						customFilter={() => {  }}
            onShowStallingDetails={(id: any) => {
            	const stalling = fietsenstallingen.find(x => x.ID = id);
            	push(`/stalling/${stalling.StallingsID}`);
            }}
						fietsenstallingen={fietsenstallingen}
					/>
				</div>
			</div>
		</>
  );
};

export default Content;
