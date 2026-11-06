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
          <strong>Server is waking up…</strong>
          <small>
            This can take up to a minute. Please wait — your demo data will load
            automatically.
          </small>
        </div>
      </div>
    </div>
  )
}

export default WakeBanner
