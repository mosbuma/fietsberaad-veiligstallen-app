import { useDispatch } from "react-redux";
import { setActiveArticle } from "~/store/appSlice";

export interface MenuItem {
    municipality: string;
    page: string;
    title: string;
}

export interface MenuItemProps {
    targetmunicipality: string;
    targetpage: string;
    title?: string;
    icon?: string;
    onClick?: () => void;
}

export const PrimaryMenuItem = ({targetmunicipality, targetpage, title, icon}: MenuItemProps) => {
    const dispatch = useDispatch();

    return <div className={`
        PrimaryMenuItem
        px-5
        `}>
        <a href="" className="flex flex-col justify-center h-full" onClick={(e) => {
        e.preventDefault();

        // console.debug("#### AppHeaderDesktop - PrimaryMenuItem - set active article ", title);
        dispatch(setActiveArticle({municipality: targetmunicipality, articleTitle: targetpage}));
        }}>
        {icon ? <img src={icon} style={{ height: '30px' }} /> : ''}
        {title}
        </a>
    </div>
}

export const SecundaryMenuItem = ({targetmunicipality, targetpage, title, icon}: MenuItemProps) => {
const dispatch = useDispatch();

return <div className="
    SecundaryMenuItem
    px-2
">
    <a href="#" className="flex flex-col justify-center h-full" onClick={(e) => {
    e.preventDefault();

    dispatch(setActiveArticle({municipality: targetmunicipality, articleTitle: targetpage}));
    }}>
    {title}
    </a>
</div>
}