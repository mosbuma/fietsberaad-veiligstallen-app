import { type AppType } from "next/app";
import { wrapper } from "../store/store";
import Head from "next/head";

import { api } from "~/utils/api";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "~/styles/globals.css";

import '~/styles/components/AppHeader.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <>
    <Head>
      <meta
        name='viewport'
        content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
      />
    </Head>
    <Component {...pageProps} />
  </>
};

export default api.withTRPC(wrapper.withRedux(MyApp));
