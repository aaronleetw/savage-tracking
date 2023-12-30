import { type AppType } from "next/app";

import { Noto_Sans } from "next/font/google"
import localFont from 'next/font/local'

import { api } from "~/utils/api";

import "~/styles/globals.css";

const noto = Noto_Sans({ subsets: ["latin"] })
const kai = localFont({ src: "./kaiu.ttf", variable: "--font-kai"})

const MyApp: AppType = ({ Component, pageProps }) => {
  return <main className={`${kai.variable} ${noto.className}`}><Component {...pageProps} /></main>;
};

export default api.withTRPC(MyApp);
