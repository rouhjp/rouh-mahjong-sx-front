import '@/styles/reset.min.css'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { TILE_VALUES } from '@/type'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {[...TILE_VALUES, "back"].map((tile) => (
          <link key={tile} rel="preload" as="image" type="image/jpeg" href={`/tiles/${tile}.jpg`} />
        ))}
      </Head>
      <Component {...pageProps} />
    </>
  )
}
