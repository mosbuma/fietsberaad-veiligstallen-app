import React from "react";

// Import utils
// import { getParkingsFromDatabase } from "~/utils/prisma";

// Import components
import PageTitle from "~/components/PageTitle";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import { Button } from "~/components/Button";
// import ImageSlider from "~/components/ImageSlider";
// import HorizontalDivider from "~/components/HorizontalDivider";
// import CloseButton from "~/components/CloseButton";
// import Parking from "~/components/Parking";

import Styles from "./login.module.css";

const Login: NextPage = () => {
  return (
    <>
			<div data-comment="Show only on desktop" className="hidden sm:flex">
			  <AppHeaderDesktop />
			</div>
			<div className={`${Styles.LoginPage}`}>
				<div className={`
					${Styles.LoginBox}
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
						data-name="login-form"
						className="
							flex-1

							flex
							flex-col
							justify-around
						"
					>
						<div data-name="Some spacing" className="h-2">

						</div>
						<div data-name="Title and login form" className="mb-8">
							<PageTitle className="flex flex-col justify-center hidden sm:block">
								<div>
									<img src="/images/logo-without-text.png" alt="VeiligStallen logo"
										className="inline-block mr-6"
										style={{height: '60px'}}
									/>
									<b>Log in met je account</b>
								</div>
							</PageTitle>

							<div>
								<FormInput
									type="email"
									placeholder="E-mail"
									required
									classes="w-full"
								/>
							</div>

							<div>
								<FormInput
									type="password"
									placeholder="Wachtwoord"
									required
									classes="w-full"
								/>
							</div>

							<div className="flex justify-between">
								<div className="flex flex-col justify-center">
									<FormCheckbox classes="text-gray-500 text-sm">
										Ingelogd blijven
									</FormCheckbox>
								</div>
								<div className="flex flex-col justify-center">
									<Button style={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>
										Inloggen
									</Button>
								</div>
							</div>

							<div className="text-center sm:text-right my-2 text-sm">
								Nog geen account? <a href="/register" className="underline">
									Registreren
								</a>
							</div>
						</div>

						<div data-name="Footer: Password forgotten & Contact helpdesk">
							<div className="text-center">
								<a href="/reset-password" className="underline text-sm mr-5">
									Wachtwoord vergeten?
								</a>
								<a href="/contact" className="underline text-sm">
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

export default Login;
