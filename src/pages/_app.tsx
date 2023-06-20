import { type AppType } from "next/app";
import { wrapper } from "../store/store";

import { api } from "~/utils/api";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "~/styles/globals.css";

import '~/styles/components/AppHeader.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(wrapper.withRedux(MyApp));
