import '../styles/globals.css'
import "@arco-design/web-react/dist/css/arco.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return <>
    <Head>
      <title>Classy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Component {...pageProps} />
  </>
}
