import { useEffect, useState } from "react"

// The demo API runs on a free plan that sleeps after ~15 minutes without
// traffic; the first request then takes up to a minute. Instead of showing an
// empty CRM, explain the wait once loading takes longer than usual.
const SHOW_AFTER_MS = 2500

type WakeBannerProps = {
  isLoading: boolean
}

function WakeBanner({ isLoading }: WakeBannerProps) {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false)
      return
    }
    const timer = setTimeout(() => setIsSlow(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (!isLoading || !isSlow) return null

  return (
    <div className="wake-banner-wrap">
      <div className="wake-banner" role="status" aria-live="polite">
        <span className="wake-spinner" aria-hidden="true" />
        <div>
          <strong>Waking up the demo server…</strong>
          <small>
            It sleeps when nobody uses it (free hosting). The first load can
            take up to a minute — your demo data will appear automatically.
          </small>
        </div>
      </div>
    </div>
  )
}

export default WakeBanner
