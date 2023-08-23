export const ToggleMenuIcon = ({
	className,
	onClick
}: {
	className?: string
	onClick?: Function
}) => {
	return (
		<div className={`
			w-12
			h-12
			${className && className.indexOf('bg-') > -1 ? '' : 'bg-white'}
			${className && className.indexOf('shadow-') > -1 ? '' : 'shadow'}
			rounded-full
			
			text-center
			
			flex
			flex-col
			justify-center

			cursor-pointer

			${className}
		`}
		onClick={onClick}
		>
			<img
				src="/images/icon-hamburger.png"
				alt="Hamburger"
				className="
					inline-block
					mx-auto
					w-6
				"
			/>
		</div>
	);
}
