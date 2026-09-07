import { useEffect, useRef, useState } from 'react'
import './CustomCursor.css'

const HOVER_SELECTOR = 'a, button, [role="button"], .menu__featured-stack-img, .menu__photo-grid-img, .menu__featured-reveal-img'
const RING_LERP = 0.18

// `theme`: 'light' (cream, for the dark video background on Home) or 'dark'
// (near-black, for the light #e8e6e6 background on Information/Photography)
// — passed down by Home.jsx based on which section is currently showing.
function CustomCursor({ theme = 'light' }) {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)

  const dotRef = useRef(null)
  const ringRef = useRef(null)

  const targetPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  // Only takes over the cursor on devices with a real mouse — leaves touch
  // devices with their native (already-hidden-on-tap) cursor untouched.
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setEnabled(mq.matches)
    const handleChange = (e) => setEnabled(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    document.body.style.cursor = 'none'
    return () => {
      document.body.style.cursor = ''
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined

    const handleMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }

    const handleOver = (e) => {
      const target = e.target.closest(HOVER_SELECTOR)
      setHover(Boolean(target))
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
    }
  }, [enabled])

  // The ring trails the dot with a lag (rather than tracking it exactly) for
  // a deliberate "magnetic" feel — runs off its own rAF loop so it stays
  // smooth even when the mouse isn't currently moving.
  useEffect(() => {
    if (!enabled) return undefined
    let frameId

    const tick = () => {
      ringPos.current.x += (targetPos.current.x - ringPos.current.x) * RING_LERP
      ringPos.current.y += (targetPos.current.y - ringPos.current.y) * RING_LERP
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [enabled])

  if (!enabled) {
    return null
  }

  return (
    <div className={`custom-cursor ${hover ? 'custom-cursor--hover' : ''} ${theme === 'dark' ? 'custom-cursor--dark' : ''}`}>
      <div className="custom-cursor__dot" ref={dotRef} />
      <div className="custom-cursor__ring" ref={ringRef}>
        <span className="custom-cursor__ring-text">VIEW</span>
      </div>
    </div>
  )
}

export default CustomCursor
