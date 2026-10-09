import Menu from "../componets/menu";

import "../Style/stylE.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Menu />
      <Component {...pageProps} />
    </>
  );
}