import PageTitle from "~/components/PageTitle";

const NavSection = ({
	children
}: {
	children: any
}) => {
	return <div className="
		border-t-2
		border-t-solid
		my-3
		pt-3
		pb-1
	">
		{children}
	</div>
}

// If it has an icon: Show bold text
const NavItem = ({
	title,
	icon
}) => {
	return <a className={`
		flex
		my-1
		text-lg
		${icon ? 'font-bold' : ''}
	`}>
		{icon && <img src={`/images/${icon}`} alt={icon} className="mr-3" />}
		{title}
	</a>
}

const AppNavigationMobile = () => {
	return (
		<div className="
			py-8
			px-5
		">
			<header>
				<PageTitle className="
					text-2xl text-red-600 mb-2
				">
					Welkom in Utrecht
				</PageTitle>
				<p style={{
					maxWidth: '70%'
				}}>
					De kortste weg naar een veilige plek voor uw fiets in Utrecht
				</p>
			</header>

			<nav>
				<NavSection>
					<NavItem title="Kaart" />
					<NavItem title="Lijst" />
				</NavSection>
				<NavSection>
					<NavItem title="Koop abonnement" />
					<NavItem title="Over Utrecht Fietst!" />
				</NavSection>
				<NavSection>
					<NavItem title="Informatie abonnement" />
					<NavItem title="Informatie fietstrommels" />
				</NavSection>
			</nav>

		</div>
	);
}

export default AppNavigationMobile;
