import { useEffect, useRef } from "react"

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const modal = modalRef.current
    const previousElement = document.activeElement
    const focusable = modal?.querySelectorAll<HTMLElement>(focusableSelector)
    focusable?.[0]?.focus()

    function handleTab(event: KeyboardEvent) {
      if (event.key !== "Tab" || !modal) return
      const elements = [
        ...modal.querySelectorAll<HTMLElement>(focusableSelector),
      ]
      if (!elements.length) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleTab)
    return () => {
      document.removeEventListener("keydown", handleTab)
      if (previousElement instanceof HTMLElement) {
        previousElement.focus()
      }
    }
  }, [isOpen])

  return modalRef
}
