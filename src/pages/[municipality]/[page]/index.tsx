import { type NextPage } from "next";
import type { Metadata } from "next";

import { getServerSession } from "next-auth/next";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import type { fietsenstallingen } from "~/generated/prisma-client";
import { getParkingsFromDatabase } from "~/utils/prisma";
import { Session } from "next-auth";

// import HomeComponent from "~/components/HomeComponent";
import Content from "../../content";

export const getServerSideProps = async (context: any) => {
    try {
        const { municipality, page } = context.params as { municipality: string[]|string, page: string[]|string };

        const session: Session | null = await getServerSession(
            context.req,
            context.res,
            authOptions,
          );
          const fietsenstallingen: fietsenstallingen[] =
            await getParkingsFromDatabase([], session);
      
          // TODO: Don't include: EditorCreated, EditorModified
      
          return {
            props: {
              fietsenstallingen,
              online: true,
              message: "",
              url_municipality: municipality,
              url_municipalitypage: page,
            },
          };
      
      } catch (ex: any) {
        console.error("index.getServerSideProps - error: ", ex.message);
        return {
          props: {
            fietsenstallingen: [],
            online: false,
            message: ex.message,
            url_municipality: undefined,
            url_municipalitypage: undefined,
          },
        };
      }
  }

  const MunicipalitySlug: NextPage = ( props : any) => {
    console.log(`rendering page ${props.url_municipalitypage} for municipality ${props.url_municipality}`);
    // return <HomeComponent {...props} />;
    return <Content {...props} />;
  }

  export const metadata: Metadata = {
    title: "VeiligStallen",
    description: "Nederlandse fietsenstallingen op de kaart",
  };
  
  export default MunicipalitySlug;