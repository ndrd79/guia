import type { AppProps } from 'next/app'
import '../styles/globals.css'
import SeasonalDecorations from '../components/SeasonalDecorations'
import CookieBanner from '../components/CookieBanner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <SeasonalDecorations />
      <CookieBanner />
    </>
  )
}
