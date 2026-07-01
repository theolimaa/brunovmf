'use client'

import { useEffect } from 'react'

/** Salva utm_source/utm_medium/utm_campaign da URL em cookie, se vierem no link do anúncio. */
export default function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm_source = params.get('utm_source')
    const utm_medium = params.get('utm_medium')
    const utm_campaign = params.get('utm_campaign')

    if (utm_source || utm_medium || utm_campaign) {
      const data = { utm_source, utm_medium, utm_campaign }
      document.cookie = `vmf_utm=${encodeURIComponent(JSON.stringify(data))}; max-age=${60 * 60 * 24 * 30}; path=/`
    }
  }, [])

  return null
}
