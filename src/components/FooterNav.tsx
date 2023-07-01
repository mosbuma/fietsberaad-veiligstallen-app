const FooterNavItem = ({
  children,
  className
}: {
  children: any,
  className?: string
}) => {
  return <a href="#" className={`
    ${className}
    mx-2
  `}>
    {children}
  </a>
}

const FooterNav = () => {
  const navItemsPrimary = [
    { title: 'Stalling toevoegen' },
    { title: 'Over Veilig Stallen' },
  ];

  const navItemsSecundary = [
    { title: 'Disclaimer' },
    { title: 'Privacy' },
    { title: 'Algemene voorwaarden' },
  ];

  return (
    <div className="
      fixed
      bottom-0
      right-0
      bg-white
      py-3
      px-2
      rounded-t-xl
      flex
      text-xs
      z-10
    ">
      {navItemsPrimary.map(x => <FooterNavItem
        className="font-bold"
      >
        {x.title}        
      </FooterNavItem>)}

      {navItemsSecundary.map(x => <FooterNavItem
      >
        {x.title}        
      </FooterNavItem>)}
    </div>
  );
}

export default FooterNav;
