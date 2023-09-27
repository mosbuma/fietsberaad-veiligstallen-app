export const ToggleMenuIcon = ({
	className,
	onClick,
	style
}: {
	className?: string
	onClick?: Function,
	style?: any
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
		style={style}
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
