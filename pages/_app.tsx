import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marca como hidratado após o primeiro render no cliente
    setIsHydrated(true)
  }, [])

  return (
    <div className={isHydrated ? '' : 'no-animations'}>
      <Component {...pageProps} />
    </div>
  )
}