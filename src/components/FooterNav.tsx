// @ts-nocheck
import { useRouter } from "next/navigation";

const FooterNavItem = ({
  url,
  children,
  className
}: {
  url?: string,
  children: any,
  className?: string
}) => {
  const { push } = useRouter();

  return <a href={url} className={`
    ${className}
    mx-2
  `}
  onClick={(e) => {
    e.preventDefault();

    push(url);
  }}
  >
    {children}
  </a>
}

const FooterNav = () => {
  const navItemsPrimary = [
    // { title: 'Stalling toevoegen' },
    { title: 'Over Veilig Stallen', url: '/fietsberaad/Copyright' },
  ];

  const navItemsSecundary = [
    { title: 'Disclaimer', url: '/fietsberaad/Disclaimer' },
    { title: 'Privacy', url: '/fietsberaad/Privacy' },
    { title: 'Algemene voorwaarden', url: '/fietsberaad/Algemene_voorwaarden' },
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
        key={x.title}
        url={x.url}
        className="font-bold"
      >
        {x.title}        
      </FooterNavItem>)}

      {navItemsSecundary.map(x => <FooterNavItem
        key={x.title}
        url={x.url}
      >
        {x.title}        
      </FooterNavItem>)}
    </div>
  );
}

export default FooterNav;
