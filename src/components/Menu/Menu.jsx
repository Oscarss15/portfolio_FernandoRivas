import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import './Menu.css'

const ITEMS = ['Featured Work', 'Photography', 'Information']
const FONT_FAMILY = "'General Sans', system-ui, sans-serif"

// Change to 'letters-color' to switch the entrance animation (kept implemented,
// just not currently used) — see Menu.css for both keyframe sets.
const ANIMATION = 'slide-right'

// Matches when the title + subtitle intro (Home.jsx) finishes, so the menu
// continues that same sequence instead of starting from scratch.
const MENU_START_DELAY_MS = 2600
const STAGGER_ITEM_MS = 200

const LETTER_COLOR_STAGGER_MS = 25
const LETTER_COLOR_DURATION_MS = 1500
const LETTER_COLOR_ITEM_GAP_MS = 0

const REVEAL_VW = 46
const SECONDARY_GROW_PX = 60
const REVEAL_GAP_TOP_PX = 12
const REVEAL_GAP_RIGHT_PX = 70
const REVEAL_GAP_BOTTOM_PX = 24

// The hover-reveal line/panel is a desktop mouse interaction. Below this
// width it's gated off entirely — covers phones (menu eats most of the
// screen, no room for a panel, and REVEAL_VW's absolute-vw math inverts) and
// tablets (a finger tap can't sustain hover at all — the browser fires a
// synthetic `mouseenter` right before the click, so without this gate the
// panel would just flash before navigating, on real devices too, not just
// under devtools' mouse emulation). 1180 matches the top of the tablet
// breakpoint used in Menu.css/Home.css — above it, a real mouse/trackpad is
// assumed (desktop, or a tablet with one attached).
const HOVER_REVEAL_MIN_VIEWPORT_PX = 1180

// Hand-picked 6 of the real Photography-section photos, reused here as the hover preview.
const PHOTOGRAPHY_IMAGES = [
  '/img/photography-4.JPG',
  '/img/photography-5.JPG',
  '/img/photography-8.jpg',
  '/img/photography-13.jpg',
  '/img/photography-14.jpg',
  '/img/photography-16.JPG',
]

// First 3 of the real Featured Work thumbnails, reused here as the hover preview.
const FEATURED_IMAGES = ['/img/featured1.jpg', '/img/featured2.jpg', '/img/featured3.jpg']

// Stack images wait for the panel to finish growing, then appear back-to-front
// (the bottom/rearmost card first, climbing up to the front card last).
const FEATURED_ENTRANCE_BASE_DELAY_MS = 400
const FEATURED_ENTRANCE_STAGGER_MS = 150

// On mouse leave, cards exit front-to-back (the reverse order/direction of the
// entrance); the panel only starts collapsing once all 3 have finished.
const FEATURED_EXIT_STAGGER_MS = 150
const FEATURED_EXIT_DURATION_MS = 350
const FEATURED_EXIT_TOTAL_MS = (FEATURED_IMAGES.length - 1) * FEATURED_EXIT_STAGGER_MS + FEATURED_EXIT_DURATION_MS

// Photos start appearing once the reveal panel has finished growing (matches
// the panel's 0.4s "left" transition), then step in one by one after that.
const PHOTO_ENTRANCE_BASE_DELAY_MS = 400
const PHOTO_ENTRANCE_STAGGER_MS = 90

// On mouse leave, photos step out immediately (top row first) while the panel
// is still fully open; the panel itself only starts collapsing once all of
// them have finished, so they never shrink/clip mid-fade.
const PHOTO_EXIT_STAGGER_MS = 22
const PHOTO_EXIT_DURATION_MS = 220
const PHOTO_EXIT_TOTAL_MS = (PHOTOGRAPHY_IMAGES.length - 1) * PHOTO_EXIT_STAGGER_MS + PHOTO_EXIT_DURATION_MS

// The Information image waits for the panel to finish growing, then pops in
// from zero scaled up from its own center (see .menu__featured-reveal-img).
const INFO_IMAGE_ENTRANCE_DELAY_MS = 400

// On mouse leave, the image pops back out to zero first; the panel only
// starts collapsing once that finishes, so it doesn't shrink/clip mid-pop.
const INFO_IMAGE_EXIT_DURATION_MS = 300

function getLetterColorItemDelays() {
  let cumulative = MENU_START_DELAY_MS
  return ITEMS.map((item) => {
    const lineStart = cumulative
    const duration = (item.length - 1) * LETTER_COLOR_STAGGER_MS + LETTER_COLOR_DURATION_MS
    cumulative = lineStart + duration + LETTER_COLOR_ITEM_GAP_MS
    return lineStart
  })
}

// Each menu item gets its own fully independent instance of this hook, so
// hovering one item never shares mutable state with another — switching
// directly between items can't race/clobber a shared isFixed/isActive pair.
function useHoverReveal(getFeaturedRect, exitDelayMs = 0) {
  const overlayRef = useRef(null)
  const enteringRef = useRef(false)
  const exitTimeoutRef = useRef(null)
  const [isFixed, setIsFixed] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [frozenPos, setFrozenPos] = useState({ top: 0, left: 0 })
  const [featuredPos, setFeaturedPos] = useState({ top: 0, left: 0 })

  const handleEnter = (lineEl) => {
    if (window.innerWidth < HOVER_REVEAL_MIN_VIEWPORT_PX) return
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }
    if (lineEl) {
      const rect = lineEl.getBoundingClientRect()
      setFrozenPos({ top: rect.top, left: rect.left })
    }
    const featuredRect = getFeaturedRect()
    if (featuredRect) {
      setFeaturedPos({ top: featuredRect.top, left: featuredRect.left })
    }
    setIsFixed(true)
    setIsActive(false)
    setIsLeaving(false)
    enteringRef.current = true
  }

  // The panel itself only starts collapsing after exitDelayMs, giving content
  // (e.g. the photo grid) time to finish its own exit animation at full size
  // first — otherwise it shrinks/clips while still trying to fade out.
  const handleLeave = () => {
    setIsLeaving(true)
    if (exitDelayMs > 0) {
      exitTimeoutRef.current = setTimeout(() => {
        setIsActive(false)
        exitTimeoutRef.current = null
      }, exitDelayMs)
    } else {
      setIsActive(false)
    }
  }

  // Filtered to the panel's own `left` transition (not bubbled transitionend
  // events from its photo children, which have their own transitions/animations)
  // so this only fires when the panel itself has actually finished collapsing.
  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'left') {
      return
    }
    if (!isActive) {
      setIsFixed(false)
    }
  }

  // Forces the browser to commit the "frozen" position before flipping to
  // the active target, so the CSS transition actually animates instead of
  // jumping straight to it.
  useLayoutEffect(() => {
    if (!enteringRef.current || !isFixed || isActive) {
      return undefined
    }
    enteringRef.current = false
    if (overlayRef.current) {
      overlayRef.current.getBoundingClientRect()
    }
    const id = requestAnimationFrame(() => setIsActive(true))
    return () => cancelAnimationFrame(id)
  }, [isFixed, isActive, frozenPos])

  useLayoutEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [])

  return {
    isFixed,
    isActive,
    isLeaving,
    frozenPos,
    featuredPos,
    overlayRef,
    handleEnter,
    handleLeave,
    handleTransitionEnd,
  }
}

function Menu({ isExiting, onItemClick }) {
  const isLettersColor = ANIMATION === 'letters-color'
  const itemStartDelays = isLettersColor
    ? getLetterColorItemDelays()
    : ITEMS.map((_, index) => MENU_START_DELAY_MS + index * STAGGER_ITEM_MS)

  const lineRefs = useRef([])
  const getFeaturedRect = () => lineRefs.current[0]?.getBoundingClientRect()

  // One independent hover instance per item — same count as ITEMS, called
  // unconditionally so hook order stays stable across renders.
  const hover0 = useHoverReveal(getFeaturedRect, FEATURED_EXIT_TOTAL_MS)
  const hover1 = useHoverReveal(getFeaturedRect, PHOTO_EXIT_TOTAL_MS)
  const hover2 = useHoverReveal(getFeaturedRect, INFO_IMAGE_EXIT_DURATION_MS)
  const hovers = [hover0, hover1, hover2]

  return (
    <>
      <nav className={`menu ${isExiting ? 'menu--exiting' : ''}`}>
        <ul className="menu__list">
          {ITEMS.map((item, index) => {
            const hover = hovers[index]
            return (
              <li
                key={item}
                className={`menu__item ${isLettersColor ? '' : 'menu__item--anim-slide-right'}`}
                style={isLettersColor ? undefined : { animationDelay: `${itemStartDelays[index]}ms` }}
                onMouseEnter={() => hover.handleEnter(lineRefs.current[index])}
                onMouseLeave={hover.handleLeave}
              >
                {!isLettersColor && (
                  <span
                    ref={(el) => (lineRefs.current[index] = el)}
                    className="menu__item-line"
                    style={hover.isFixed ? { visibility: 'hidden' } : undefined}
                  />
                )}
                {isLettersColor && (
                  <span className="menu__line-anim" style={{ animationDelay: `${itemStartDelays[index]}ms` }} />
                )}
                <a
                  href="#"
                  className="menu__link"
                  style={{ fontFamily: FONT_FAMILY }}
                  onClick={(e) => {
                    e.preventDefault()
                    onItemClick?.(index)
                  }}
                >
                  {isLettersColor
                    ? item.split('').map((char, charIndex) => (
                        <span
                          key={charIndex}
                          className="menu__letter--anim"
                          style={{
                            animationDelay: `${itemStartDelays[index] + charIndex * LETTER_COLOR_STAGGER_MS}ms`,
                          }}
                        >
                          {char === ' ' ? ' ' : char}
                        </span>
                      ))
                    : item}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {hovers.map((hover, index) => {
        if (!hover.isFixed) {
          return null
        }
        // The line retracts on `isLeaving` (set the instant the mouse leaves),
        // not on `isActive` (which only flips after exitDelayMs, so the panel's
        // content — e.g. the photo grid — has time to finish its own exit
        // animation first). Tying the line to `isActive` too meant it sat
        // fully grown for that whole delay before starting to shrink, which
        // read as a stuck/late line. The panel below still uses `isActive`
        // alone, since it's the one that's supposed to wait.
        const lineGrown = hover.isActive && !hover.isLeaving
        const overlayStyle = {
          position: 'fixed',
          top: `${hover.frozenPos.top}px`,
          right: 0,
          left: lineGrown
            ? index === 0
              ? `${REVEAL_VW}vw`
              : `${hover.frozenPos.left - SECONDARY_GROW_PX}px`
            : `${hover.frozenPos.left}px`,
          transition: 'left 0.4s ease',
        }
        const revealStyle = {
          position: 'fixed',
          top: `${hover.featuredPos.top + REVEAL_GAP_TOP_PX}px`,
          bottom: `${REVEAL_GAP_BOTTOM_PX}px`,
          left: hover.isActive ? `${REVEAL_VW}vw` : `${hover.featuredPos.left}px`,
          right: `calc(100vw - ${hover.featuredPos.left}px + ${REVEAL_GAP_RIGHT_PX}px)`,
          transition: 'left 0.4s ease',
        }
        return (
          <Fragment key={index}>
            <span
              ref={hover.overlayRef}
              className={`menu__item-line menu__item-line--overlay ${isExiting ? 'menu__hover-exit' : ''}`}
              style={overlayStyle}
            />
            <div
              className={`menu__featured-reveal menu__featured-reveal--${index} ${isExiting ? 'menu__hover-exit' : ''}`}
              style={revealStyle}
              onTransitionEnd={hover.handleTransitionEnd}
            >
              {index === 0 && (
                <div className="menu__featured-stack">
                  {FEATURED_IMAGES.map((src, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={src}
                      alt=""
                      className={`menu__featured-stack-img menu__featured-stack-img--${imgIndex} ${
                        hover.isLeaving ? 'menu__featured-stack-img--leaving' : ''
                      }`}
                      style={{
                        animationDelay: hover.isLeaving
                          ? `${imgIndex * FEATURED_EXIT_STAGGER_MS}ms`
                          : `${
                              FEATURED_ENTRANCE_BASE_DELAY_MS +
                              (FEATURED_IMAGES.length - 1 - imgIndex) * FEATURED_ENTRANCE_STAGGER_MS
                            }ms`,
                      }}
                    />
                  ))}
                </div>
              )}
              {index === 1 && (
                <div className="menu__photo-grid">
                  {PHOTOGRAPHY_IMAGES.map((src, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={src}
                      alt=""
                      className={`menu__photo-grid-img ${hover.isLeaving ? 'menu__photo-grid-img--leaving' : ''}`}
                      style={{
                        animationDelay: hover.isLeaving
                          ? `${photoIndex * PHOTO_EXIT_STAGGER_MS}ms`
                          : `${PHOTO_ENTRANCE_BASE_DELAY_MS + photoIndex * PHOTO_ENTRANCE_STAGGER_MS}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
              {index === 2 && (
                <img
                  src="/img/menuphoto/perfilPhoto.jpg"
                  alt=""
                  className={`menu__featured-reveal-img ${hover.isLeaving ? 'menu__featured-reveal-img--leaving' : ''}`}
                  style={{ animationDelay: hover.isLeaving ? '0ms' : `${INFO_IMAGE_ENTRANCE_DELAY_MS}ms` }}
                />
              )}
            </div>
          </Fragment>
        )
      })}
    </>
  )
}

export default Menu
