// import React from "react";

// // Import utils
// import { getParkingsFromDatabase } from "~/utils/prisma";

// // Import components
// import AppHeaderDesktop from "~/components/AppHeaderDesktop";
// import PageTitle from "~/components/PageTitle";
// import ContentPageWrapper from "~/components/ContentPageWrapper";
// import ImageSlider from "~/components/ImageSlider";
// import HorizontalDivider from "~/components/HorizontalDivider";
// import CloseButton from "~/components/CloseButton";
// import { Button } from "~/components/Button";
// import Parking from "~/components/Parking";

// export async function getStaticProps() {
//   try {
//     // console.log("index.getStaticProps - start");
//     const fietsenstallingen = await getParkingsFromDatabase();
//     // TODO: Don't include: EditorCreated, EditorModified

//     return {
//       props: {
//         fietsenstallingen: fietsenstallingen,
//         online: true,
//       },
//     };
//   } catch (ex: any) {
//     // console.error("index.getStaticProps - error: ", ex.message);
//     return {
//       props: {
//         fietsenstallingen: [],
//         online: false,
//       },
//     };
//   }
// }

// const Stalling: NextPage = ({ fietsenstallingen, online }: any) => {
//   return (
//     <div className="container">
//       <AppHeaderDesktop>
//         <div
//           className="
//           mr-8 flex
//           justify-between
//         "
//         >
//           <PageTitle>Utrecht Laag Catharijne</PageTitle>

//           <CloseButton />
//         </div>
//       </AppHeaderDesktop>
//       <ContentPageWrapper>
//         <Parking parkingdata={fietsenstallingen.find((stalling: any) => {
//           return stalling.ID === "E2C31818-9B25-5299-71B170A5B41BA07F";
//         })} />
//       </ContentPageWrapper>
//     </div>
//   );
// };

// export default Stalling;
