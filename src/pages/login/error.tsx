import React, { useRef } from "react";
import { useRouter } from 'next/navigation'
import useQueryParam from '../../hooks/useQueryParam';

// import bcrypt from 'bcrypt'

// Import utils
// import { getParkingsFromDatabase } from "~/utils/prisma";

// Import components
import PageTitle from "~/components/PageTitle";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import { Button } from "~/components/Button";
import { signIn } from "next-auth/react";



// import ImageSlider from "~/components/ImageSlider";
// import HorizontalDivider from "~/components/HorizontalDivider";
// import CloseButton from "~/components/CloseButton";
// import Parking from "~/components/Parking";

import Styles from "./error.module.css";

const Error: NextPage = () => {
  
  const router = useRouter()
  const theerror = useQueryParam("error")[0];

  const onConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
 	router.push('/')
  };

  return (
    <>
			<div data-comment="Show only on desktop" className="hidden sm:flex">
			  <AppHeaderDesktop />
			</div>
			<div className={`${Styles.ErrorPage}`}>
				<div className={`
					${Styles.ErrorBox}
					bg-white
					rounded-xl
					mx-auto
					px-4
					sm:px-12
					py-8
					shadow-md

					flex
					flex-wrap
				`}
				style={{
					width: '1000px',
					maxWidth: '90%'
				}}>
					<div
						data-name="bicycle-image"
						className="
							px-12
							sm:px-12
							sm:pr-24

							py-2
							sm:py-10
						"
					>
						<img src="/images/bike-blue-green.png"
							width="100%"
							style={{maxWidth: '350px'}}
						/>
					</div>
					<div
						data-name="Error-form"
						className="
							flex-1

							flex
							flex-col
							justify-around
						"
					>
						<div data-name="Some spacing" className="h-2">

						</div>
						<div data-name="Title and Error form" className="mb-8">
							<PageTitle className="flex flex-col justify-center hidden sm:block">
								<div>
									<img src="/images/logo-without-text.png" alt="VeiligStallen logo"
										className="inline-block mr-6"
										style={{height: '60px'}}
									/>
									<b>Er is een fout opgetreden</b>
									<b>{}</b>
								</div>
							</PageTitle>
						</div>
						<div className="flex flex-col justify-center">
							<Button style={{marginTop: '0.5rem', marginBottom: '0.5rem'}} onClick={onConfirm}>
								Terug naar de voorpagina
							</Button>
						</div>

						<div data-name="Footer: Contact helpdesk">
							<div className="text-center">
								<a href="/contact" className="underline text-sm hidden">
									Contact helpdesk
								</a>
							</div>
						</div>

					</div> 
				</div>
		  	
	    </div>
		</>
  );
};

export default Error;
