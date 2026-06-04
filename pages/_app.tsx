import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import SeasonalDecorations from '../components/SeasonalDecorations'
import CookieBanner from '../components/CookieBanner'
import ToastProvider from '../components/admin/ToastProvider'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdmin = router.pathname.startsWith('/admin')

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        </Head>
        <Component {...pageProps} />
        {!isAdmin && <SeasonalDecorations />}
        {!isAdmin && <CookieBanner />}
      </ToastProvider>
    </ErrorBoundary>
  )
}
