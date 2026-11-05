import { useState } from "react"

type ProgressControlProps = {
  value: number
  onChange: (value: number) => void
  className?: string
}

function ProgressControl({
  value,
  onChange,
  className = "",
}: ProgressControlProps) {
  const [typedValue, setTypedValue] = useState<string | null>(null)
  function commitValue(rawValue: string) {
    const parsedValue = Number(rawValue)
    if (!Number.isFinite(parsedValue)) return setTypedValue(null)
    setTypedValue(null)
    onChange(Math.min(100, Math.max(1, Math.round(parsedValue))))
  }
  return (
    <div className={`progress-control ${className}`}>
      <input
        type="range"
        min="1"
        max="100"
        step="1"
        value={Math.max(1, value)}
        onChange={(event) => {
          setTypedValue(null)
          onChange(Number(event.target.value))
        }}
        aria-label="Project progress"
      />
      <div className="progress-number">
        <input
          type="number"
          min="1"
          max="100"
          value={typedValue ?? String(value)}
          onChange={(event) => setTypedValue(event.target.value)}
          onBlur={(event) => commitValue(event.target.value)}
          onFocus={(event) => event.target.select()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
          aria-label="Progress percentage"
        />
        <span>%</span>
      </div>
    </div>
  )
}
export default ProgressControl
