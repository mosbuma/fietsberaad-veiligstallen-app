import { useEffect, useState } from "react";
import { type VSArticle } from "~/types/articles";
import { type VSContactGemeenteInLijst } from "~/types/contacts";

import { 
    getArticlesForMunicipality,
    getPrimary,
    getSecondary,
    getFooter,
    filterNavItems,
} from "~/utils/navigation";
import ArticlesComponent from '~/components/ArticleComponent';
import { hasContent } from "~/utils/articles";
import Modal from './Modal';

interface ExploreMenuComponent {
    gemeenten: VSContactGemeenteInLijst[];
}

const ExploreArticlesComponent = (props: ExploreMenuComponent) => {   

    const { gemeenten } = props;
    const [ selectedGemeenteID, setSelectedGemeenteID] = useState<string>("1");
    const [ selectedStatus, setSelectedStatus] = useState<"All"|"Yes"|"No">("Yes");
    const [ selectedNavigation, setSelectedNavigation] = useState<"All"|"Main"|"NotMain">("All");
    const [ showArticlesWithoutContent, setShowArticlesWithoutContent] = useState<"All"|"Content"|"NoContent">("Content");

    const [ selectedZoom, setSelectedZoom] = useState<"gemeente"|"fietsberaad">("gemeente");

    const [municipalityArticles, setMunicipalityArticles] = useState<VSArticle[]|undefined>([]);
    const [fietsberaadArticles, setFietsberaadArticles] = useState<VSArticle[]|undefined>([]);

    const [selectedArticleID, setSelectedArticleID] = useState<string>("");

    useEffect(() => {
        void (async () => {
            const articles = await getArticlesForMunicipality(selectedGemeenteID==="" ? null : selectedGemeenteID);
            setMunicipalityArticles(articles);
        })();
    }, [selectedGemeenteID, selectedZoom]);

    useEffect(() => {
        void (async () => {
            const articles = await getArticlesForMunicipality("1");
            setFietsberaadArticles(articles);
        })();
    }, []);

    useEffect(() => {
        setSelectedArticleID("");
    }, [municipalityArticles, fietsberaadArticles, selectedGemeenteID, selectedZoom, selectedStatus, selectedNavigation]);

    const resetFilters = () => {
        setSelectedGemeenteID("1");
        setSelectedZoom("gemeente");
        setSelectedStatus("Yes");
        setSelectedNavigation("All");
        setShowArticlesWithoutContent("All");
    }

    const renderFilter = () => {
        return (
            <div className="">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Filter Paginas</h1>
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
                <form className="space-y-4">
                <div className="flex flex-col">
                        <label htmlFor="gemeente" className="text-sm font-medium text-gray-700">Selecteer Gemeente:</label>
                        <select 
                            id="gemeente" 
                            name="gemeente" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={selectedGemeenteID}
                            onChange={(e) => setSelectedGemeenteID(e.target.value)}
                        >
                            <option value="">Alles</option>
                            {gemeenten.map((gemeente) => (
                                <option value={gemeente.ID} key={gemeente.ID}>{gemeente.CompanyName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">Selecteer Pagina Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as "All"|"Yes"|"No")}
                        >
                            <option value="All">All</option>
                            <option value="Yes">Actief</option>
                            <option value="No">Niet Actief</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="navigation" className="text-sm font-medium text-gray-700">Type</label>
                        <select 
                            id="navigation" 
                            name="navigation" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={selectedNavigation}
                            onChange={(e) => setSelectedNavigation(e.target.value as "All"|"Main"|"NotMain")}
                        >
                            <option value="All">Alle</option>
                            <option value="Main">Navigatie</option>
                            <option value="NotMain">Andere</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">Met/zonder inhoud</label>
                        <select 
                            id="status" 
                            name="status" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={showArticlesWithoutContent}
                            onChange={(e) => setShowArticlesWithoutContent(e.target.value as "All"|"Content"|"NoContent")}
                        >
                            <option value="All">Alle</option>
                            <option value="Content">Alleen met inhoud</option>
                            <option value="NoContent">Alleen zonder inhoud</option>
                        </select>
                    </div>

                </form>
            </div>
        );
    }

    const renderMenuItems = (key: string, title: string, items: VSArticle[]) => { 
        return (
            <>
            <div className="text-xl font-bold mb-2">{title}</div>
            <ul className="list-disc list-inside pl-4">
                {items &&items.map((item, index) => {
                    return (
                        <li key={`${title}-${index}`} onClick={() => setSelectedArticleID(item.ID)}>
                            <span className="text-gray-900">{item.DisplayTitle ? item.DisplayTitle : item.Title}{item.SiteID==="1" ? ` [Fietsberaad]` : ""}</span>
                        </li>
                    );
                })}
            </ul>
        </>
        );
    }

    const renderMenus = () => {
        if (selectedGemeenteID === "") return null;

        const primaryitems = getPrimary(filterNavItems(municipalityArticles), filterNavItems(fietsberaadArticles), selectedZoom === "gemeente");
        const secondaryitems = getSecondary(filterNavItems(municipalityArticles), filterNavItems(fietsberaadArticles), selectedZoom === "gemeente");
        const footeritems = getFooter(filterNavItems(fietsberaadArticles));

        return (
            <div className="w-full h-full">
                <div className="flex items-center mb-4">
                    <label htmlFor="showGemeentenWithoutStallingen" className="text-sm font-medium text-gray-700">Selecteer Zoom: </label>
                    <select 
                        id="zoomlevel" 
                        name="zoomlevel" 
                        value={selectedZoom}
                        onChange={(e) => setSelectedZoom(e.target.value as "fietsberaad"|"gemeente")}
                        className="ml-2 p-2 border border-gray-300 rounded-md"
                    >
                        <option value="fietsberaad">{`Landelijk`}</option>
                        <option value="gemeente">{`Gemeente`}</option>
                    </select>
                </div>
                <div className="mb-2">{renderMenuItems('primary', 'Menu links', primaryitems)}</div>
                <div className="mb-2">{renderMenuItems('secondary', 'Menu rechts', secondaryitems)}</div>
                <div className="mb-2">{ renderMenuItems('footer', 'Menu onder', footeritems) }</div>
            </div>
        );
    }



    const renderSelectedArticle = () => {
        let selectedArticle = municipalityArticles?.find(x => x.ID === selectedArticleID);
        if(!selectedArticle) selectedArticle = fietsberaadArticles?.find(x => x.ID === selectedArticleID);

        return (
            <Modal 
                onClose={() => {
                    setSelectedArticleID("");
                }}
                title={selectedArticle?.DisplayTitle || selectedArticle?.Title}
                modalBodyStyle={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
            >
                <ArticlesComponent 
                    isSm={false}
                    municipality={selectedArticle?.SiteID || ""}
                    page={selectedArticle?.Title || ""}
                    fietsenstallingen={[]}
                    onFilterChange={(_filter: string[] | undefined) => {}} 
                />
            </Modal>
        );
    }

    const renderArticlesList = () => {
        const filteredArticles = municipalityArticles?.filter(
            x => { 
                const articleHasContent = hasContent(x);
                return( (selectedStatus === "All" || x.Status === (selectedStatus === "Yes" ? "1" : "0")) &&
                        (selectedNavigation === "All" || (selectedNavigation === "Main" && x.Navigation === "main") || (selectedNavigation === "NotMain" && x.Navigation !== "main")) &&
                        (showArticlesWithoutContent === "All" || (articleHasContent && showArticlesWithoutContent === "Content") || (!articleHasContent && showArticlesWithoutContent === "NoContent"))); 
            }
        );
        // if (!filteredArticles || filteredArticles.length === 0) return { 
        // }

        const getSiteName = (siteID: string) => {
            const site = gemeenten.find(x => x.ID === siteID);
            return site?.CompanyName;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-md w-full border border-gray-300">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4 text-left">Gemeente</th>
                            <th className="p-4 text-left">Paginakop</th>
                            <th className="p-4 text-left">Paginanaam</th>
                            <th className="p-4 text-left">Inhoud</th>
                            <th className="p-4 text-left">Abstract</th>
                            <th className="p-4 text-left">Sortering</th>
                            <th className="p-4 text-left">Type</th>
                            <th className="p-4 text-left">Actief</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles && filteredArticles.map((article) => (
                            <tr key={article.ID} className={`border-b ${article.ID===selectedArticleID ? "bg-gray-200" : ""}`} onClick={() => {setSelectedArticleID(article.ID);}}>
                                <td className="truncate">{getSiteName(article.SiteID)}</td>
                                <td className="whitespace-normal">{article.DisplayTitle? article.DisplayTitle : article.Title}</td>
                                <td className="whitespace-normal">{article.Title}</td>
                                <td className="text-center">{article.Article!=='' && article.Article!==null ? <input type="checkbox" checked={article.Status === "1"} readOnly /> : null}</td>
                                <td className="text-center">{article.Abstract!=='' && article.Abstract!==null ? <input type="checkbox" checked={article.Status === "1"} readOnly /> : null}</td>
                                <td className="truncate">{article.SortOrder}</td>
                                <td className="truncate">{article.Navigation}</td>
                                <td className="text-center">
                                    <input type="checkbox" checked={article.Status === "1"} readOnly />
                                </td>
                            </tr>
                        ))}
                        { !filteredArticles || filteredArticles.length === 0 && <tr className="border-b"><td colSpan={8} className="py-8 text-center">Geen artikelen gevonden</td></tr> }
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="w-full mx-gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 mb-4">
                <div className="mx-4 p-4 border-2 rounded-xl border-gray-300">
                    {renderFilter()}
                </div>
                <div className="mx-4 p-4 border-2 rounded-xl border-gray-300">
                    { renderMenus() }                    
                </div>
            </div>
            {selectedArticleID && renderSelectedArticle()}
            <div>
                {renderArticlesList()}
            </div>
        </div>
    );
}

export default ExploreArticlesComponent;

