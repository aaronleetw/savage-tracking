import { type AppType } from "next/app";

import { Noto_Sans } from "next/font/google"

import { api } from "~/utils/api";

import "~/styles/globals.css";

const noto = Noto_Sans({ subsets: ["latin"] })

const MyApp: AppType = ({ Component, pageProps }) => {
  return <main className={noto.className}><Component {...pageProps} /></main>;
};

export default api.withTRPC(MyApp);
