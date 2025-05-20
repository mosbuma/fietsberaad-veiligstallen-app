import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { fietsenstallingen } from "~/generated/prisma-client";
import { AppState } from "~/store/store";
import { type VSArticle } from "~/types/articles";

// Import components
// import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
// import Modal from "src/components/Modal";
// import Overlay from "src/components/Overlay";
// import Parking from "~/components/Parking";
import Faq from "~/components/Faq";
import PageTitle from "~/components/PageTitle";

// import { ParkingDetailsType } from "~/types/parking";
import { setTypes } from "~/store/filterArticlesSlice";

interface ArticleComponentProps {
  isSm: boolean;
  municipality: string;
  page: string;
  fietsenstallingen: fietsenstallingen[]
  onFilterChange?: (filter: string[] | undefined) => void;
}

const ArticleComponent = ({isSm, municipality, page, fietsenstallingen, onFilterChange}: ArticleComponentProps): React.ReactNode => {
    const dispatch = useDispatch();
    // const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [pageContent, setPageContent] = useState<VSArticle | undefined>(undefined);

  // const getStalling = (stallingId: string | undefined) =>fietsenstallingen.find((stalling) => (stalling.ID === stallingId));

  // Get article content based on slug
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `/api/protected/?Title=${page}&SiteID=${municipality}&findFirst=true`
        );
        const json = await response.json();
        if (!json) return;
        // If result is an array with 1 node: Get node only
        const pageContentToSet: VSArticle = json && json.SiteID ? json : json[0];
        setPageContent(pageContentToSet);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [
    municipality,
    page,
  ]);

  if (!pageContent) {
    return (<div className="p-10">
      Geen pagina-inhoud gevonden. <a href="javascript:history.back();" className="underline">Ga terug</a>
    </div>);
  }

  const isFaq = pageContent.Title === 'FAQ';

  // Decide on what parkings to show on this page, if any
  let parkingTypesToFilterOn: string[] | undefined;
  if (pageContent && pageContent.Title === 'Stallingen') {
    parkingTypesToFilterOn = ['bewaakt', 'geautomatiseerd', 'onbewaakt', 'toezicht'];
  }
  else if (pageContent && pageContent.Title === 'Buurtstallingen') {
    parkingTypesToFilterOn = ['buurtstalling'];
  }
  else if (pageContent && (pageContent.Title === 'Fietstrommels' || pageContent.Title === 'fietstrommels')) {
    parkingTypesToFilterOn = ['fietstrommel'];
  }
  else if (pageContent && pageContent.Title === 'Fietskluizen') {
    parkingTypesToFilterOn = ['fietskluizen'];
  } else {
    parkingTypesToFilterOn = ['bewaakt', 'geautomatiseerd', 'onbewaakt', 'toezicht'];
  }

  // dispatch(setTypes(parkingTypesToFilterOn));

//   .ContentPage_Body h2 {
//     font-size: 1.1em;
//     font-weight: bold;
//   }
//   .ContentPage_Body ul {
//       list-style-type: disc;
//   }
//   .ContentPage_Body ul,
//   .ContentPage_Body ol {
//     margin: 1em 0;
//       padding: 0 0 0 40px;
//       margin-left: 0;
//     padding-left: 1em;
//   }
//   .ContentPage_Body li {
//     display: list-item;
//   }
//   .ContentPage_Body a {
//       text-decoration: underline;
//   }
//   .ContentPage_Body strong {
//       font-weight: bold;
//   }
//   .ContentPage_Body p {
//       margin-top: 5px;
//       margin-bottom: 15px;
//   }

  const renderArticle = () => {
    // const customFilter = (x: ParkingDetailsType) => {
    //     return parkingTypesToFilterOn && parkingTypesToFilterOn.indexOf(x.Type) > -1
    //       && (
    //         // Check if parking municipality == active municipality
    //         (activeMunicipalityInfo.CompanyName && activeMunicipalityInfo.CompanyName.toLowerCase().indexOf(x.Plaats?.toLowerCase()) > -1)
    //         // Hide parkings without municipality, if municipality is set
    //         // This makes sure not all Dutch NS stallingen are shown on a municipality page
    //         && (x.Plaats && x.Plaats.length > 0)
    //       );
    //   }
    // const showParkingFacilities = !!activeMunicipalityInfo;

    return (
      <div className="w-full bg-white border-2 border-black rounded-lg p-2 sm:p-4">
        <div className="flex-1 lg:mr-24">
            {(pageContent.DisplayTitle || pageContent.Title) && 
                <PageTitle>
                    {pageContent.DisplayTitle ? pageContent.DisplayTitle : pageContent.Title}
                </PageTitle> }
            { pageContent.Abstract && <div className="text-lg my-4" dangerouslySetInnerHTML={{ __html: pageContent.Abstract }}/> }
            { pageContent.Article && <div className="my-4 mt-12" dangerouslySetInnerHTML={{ __html: pageContent.Article }}/> }
            { isFaq && <Faq />}
        </div>
        {/* <div className="mt-10 p-4 max-w-full">
          {showParkingFacilities && <ParkingFacilityBrowser
            customFilter={customFilter}
            onShowStallingDetails={(id: any) => { setCurrentStallingId(id);}}
            fietsenstallingen={fietsenstallingen}
          />}
        </div> */}
        </div>)

    // return (<>
    //   <div className={`lg:mt-16 p-4 sm:pt-20 container mx-auto flex-wrap lg:flex justify-between lg:flex-nowraptext-lg font-weight-bold`}>
    //     <div className="flex-1 lg:mr-24">
    //         {(pageContent.DisplayTitle || pageContent.Title) && 
    //             <PageTitle>
    //                 {pageContent.DisplayTitle ? pageContent.DisplayTitle : pageContent.Title}
    //             </PageTitle> }
    //         {pageContent.Abstract && <div className="text-lg my-4" dangerouslySetInnerHTML={{ __html: pageContent.Abstract }}/> }
    //         { pageContent.Article && <div className="my-4 mt-12" dangerouslySetInnerHTML={{ __html: pageContent.Article }}/> }
    //         {isFaq && <Faq />}
    //     </div>
    //     <div className="mt-10 p-4 max-w-full" style={{width: '414px'}}>
    //       {parkingTypesToFilterOn && <ParkingFacilityBrowser
    //         customFilter={(x: ParkingDetailsType) => {
    //           return parkingTypesToFilterOn.indexOf(x.Type) > -1
    //             && (
    //               // Check if parking municipality == active municipality
    //               (activeMunicipalityInfo.CompanyName && activeMunicipalityInfo.CompanyName.toLowerCase().indexOf(x.Plaats?.toLowerCase()) > -1)
    //               // Hide parkings without municipality, if municipality is set
    //               // This makes sure not all Dutch NS stallingen are shown on a municipality page
    //               && (x.Plaats && x.Plaats.length > 0)
    //             );
    //         }}
    //         onShowStallingDetails={(id: any) => {
    //           setCurrentStallingId(id);
    //         }}
    //         fietsenstallingen={fietsenstallingen}
    //       />}
    //     </div>
    //   </div>
    // </>)
  }

//   const renderStalling = () => {
//     return (
//       <>
//         {currentStallingId !== undefined && isSm && (<>
//           <Overlay
//             title={getStalling(currentStallingId)?.Title || ""}
//           onClose={() => setCurrentStallingId(undefined)}
//         >
//           <Parking id={'parking-' + currentStallingId}
//             stallingId={currentStallingId}
//             fietsenstallingen={fietsenstallingen}
//             onStallingIdChanged={setCurrentStallingId}
//             onClose={() => setCurrentStallingId(undefined)}
//           />
//         </Overlay>
//       </>)}

//       {currentStallingId && !isSm && (<>
//         <Modal
//           onClose={() => setCurrentStallingId(undefined)}
//           clickOutsideClosesDialog={false}
//         >
//           <Parking
//             id={'parking-' + currentStallingId}
//             stallingId={currentStallingId}
//             fietsenstallingen={fietsenstallingen}
//             onStallingIdChanged={setCurrentStallingId}
//             onClose={() => setCurrentStallingId(undefined)}
//           />
//         </Modal>
//       </>)}
//     </>)
//   }


//   if(currentStallingId!==undefined) {
//     console.debug("#### ArticleComponent - renderStalling", currentStallingId);
//     return renderStalling();
//   } else {
//     console.debug("#### ArticleComponent - renderArticle");
return renderArticle();
//   }
};

export default ArticleComponent;
