import React, { useRef } from "react";
import Head from "next/head";
import { useRouter } from 'next/navigation'
import useQueryParam from '../hooks/useQueryParam';

// Import components
import PageTitle from "~/components/PageTitle";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import AppHeader from "~/components/AppHeader";
import { Button } from "~/components/Button";
import { signIn } from "next-auth/react";

// Import styles
import Styles from "./login.module.css";
import { NextPage } from "next/types";

const Login: NextPage = () => {
	const emailRef = useRef<HTMLInputElement | null>(null);
	const passwordRef = useRef<HTMLInputElement | null>(null);

	const router = useRouter()
	const error = useQueryParam("error")[0];

	const onSignIn = async (e: any) => {
		e.preventDefault();

		if (
			emailRef.current && emailRef.current.value !== '' &&
			passwordRef.current && passwordRef.current.value !== ''
		) {
			// console.log('signing in with magic link')
			signIn("email", {
				email: emailRef.current.value.trim(),
				// password: passwordRef.current.value,
				// callbackUrl: "/",
			});
			// signIn("credentials", {
			// 	email: emailRef.current.value.trim(),
			// 	password: passwordRef.current.value,
			// 	callbackUrl: "/",
			// });
		} else {
			alert('no email of password given');
		}
	};

	const allowLogin = emailRef.current?.value !== '' && passwordRef.current?.value !== '';

	return (
		<>
			<Head>
				<title>
					Login - VeiligStallen
				</title>
			</Head>
			<div className="flex flex-col justify-between" style={{ height: '100dvh' }}>

				<AppHeader />

				<div className={`${Styles.LoginPage} flex-1`}>
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
								style={{ maxWidth: '350px' }}
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
							<form onSubmit={onSignIn} data-name="Title and login form" className="mb-8">
								<PageTitle className="flex flex-col justify-center hidden sm:block">
									<div>
										<img src="/images/logo-without-text.png" alt="VeiligStallen logo"
											className="inline-block mr-6"
											style={{ height: '60px' }}
										/>
										<b>Log in met je account</b>
									</div>
								</PageTitle>

								<div>
									<FormInput
										innerRef={emailRef}
										type="email"
										placeholder="E-mail"
										required
										className="w-full"
									/>
								</div>

								<div>
									<FormInput
										innerRef={passwordRef}
										type="password"
										placeholder="Wachtwoord"
										required
										className="w-full"
									/>
								</div>

								<div className="flex justify-between">
									<div className="flex flex-col justify-center">
										{/* <FormCheckbox classes="text-gray-500 text-sm">
										Ingelogd blijven
									</FormCheckbox> */}
									</div>
									<div className="flex flex-col justify-center">
										<Button style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} onClick={onSignIn}>
											Inloggen
										</Button>
									</div>
								</div>

								<div className="text-center sm:text-right my-2 text-sm hidden">
									Nog geen account? <a href="/register" className="underline">
										Registreren
									</a>
								</div>
							</form>

							<div data-name="Footer: Password forgotten & Contact helpdesk">
								<div className="text-center">
									{/* <a href="/reset-password" className="underline text-sm mr-5"> */}
									<a href="/reset-password" className="underline text-sm mr-5">
										Wachtwoord vergeten?
									</a>
									<a href="mailto:fietsberaad@crow.nl" className="underline text-sm">
										Contact helpdesk
									</a>
								</div>
							</div>

						</div>
					</div>

				</div>
			</div>
		</>
	);
};

export default Login;
