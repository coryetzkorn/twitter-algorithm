import "normalize.css/normalize.css"
import type { AppProps } from "next/app"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />{" "}
      <style global jsx>{`
        html {
          box-sizing: border-box;
          line-height: 1.4;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }
        :root {
          --white: #ffffff;
          --blue: #55acee;
          --dark-blue: #1da1f2;
          --darkest-blue: #005091;
        }
      `}</style>
    </>
  )
}

export default MyApp
