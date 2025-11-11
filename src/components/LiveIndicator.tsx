import './LiveIndicator.css'

interface LiveIndicatorProps {
  isLive: boolean
}

export function LiveIndicator({ isLive }: LiveIndicatorProps) {
  if (!isLive) {
    return null
  }

  return (
    <span className="live-indicator" aria-label="Live data">
      <span className="live-dot" />
    </span>
  )
}
