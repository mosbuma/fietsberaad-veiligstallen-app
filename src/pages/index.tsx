import { type NextPage } from "next";
import type { Metadata } from "next";

import { getParkingsFromDatabase } from "~/utils/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import type { fietsenstallingen } from "~/generated/prisma-client";
import { type Session } from "next-auth";
import HomeComponent from "~/components/HomeComponent";

export async function getServerSideProps(context: any) {
  try {
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
      },
    };
  } catch (ex: any) {
    console.error("index.getServerSideProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
        online: false,
        message: ex.message,
      },
    };
  }
}

interface HomeProps {
  fietsenstallingen: fietsenstallingen[],
  online: boolean,
  message: string,
}

const Home: NextPage<HomeProps> = ({ fietsenstallingen, online, message }) => {
  return <HomeComponent fietsenstallingen={fietsenstallingen} online={online} message={message} url_municipality={undefined} url_municipalitypage={undefined} />
};

export const metadata: Metadata = {
  title: "VeiligStallen",
  description: "Nederlandse fietsenstallingen op de kaart",
};

export default Home;
