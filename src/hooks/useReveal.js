import { useEffect, useRef, useState } from 'react'

// Reusable scroll-reveal hook. Pairs with the `.reveal` / `.reveal--visible`
// CSS in src/styles/tokens.css (fade + translateY, instant for
// prefers-reduced-motion). To adopt in another block:
//   const { ref, visible } = useReveal()
//   <div ref={ref} className={`reveal ${visible ? 'reveal--visible' : ''}`}>
// Pass `{ immediate: true }` for above-the-fold content that should animate
// in on mount instead of waiting for scroll (e.g. the hero).
// Pass `{ delay: 100 }` (ms) to stagger a list of items.
export default function useReveal({ immediate = false, delay = 0 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (immediate) {
      const timer = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timer)
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delay)
          observer.disconnect()
          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [immediate, delay])

  return { ref, visible }
}
