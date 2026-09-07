import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './Photography.css'

// 10 placeholder slots for the reserved bento layout — swap to
// /img/photography-1.jpg … photography-10.jpg once the client sends real
// photos (same convention as PHOTOGRAPHY_IMAGES in Menu.jsx).
const IMAGES = Array.from({ length: 10 }, () => '/img/cine.jpg')

// Slots for the active "table" layout, paginated 6 at a time so it never
// needs scroll. Currently exactly 3 pages (18) of real client photos — once
// more come in, add them to REAL_TABLE_IMAGES (or pad TABLE_IMAGES with
// placeholder slots again if a page needs to exist before its photos do).
const PAGE_SIZE = 6
const REAL_TABLE_IMAGES = [
  '/img/photography-1.jpg',
  '/img/photography-2.jpg',
  '/img/photography-3.jpg',
  '/img/photography-4.JPG',
  '/img/photography-5.JPG',
  '/img/photography-6.jpg',
  '/img/photography-7.jpg',
  '/img/photography-8.jpg',
  '/img/photography-9.jpg',
  '/img/photography-10.jpg',
  '/img/photography-11.jpg',
  '/img/photography-12.jpg',
  '/img/photography-13.jpg',
  '/img/photography-14.jpg',
  '/img/photography-15.jpg',
  '/img/photography-16.JPG',
  '/img/photography-17.jpg',
  '/img/photography-18.jpg',
]
// Page 4 (19/20/21) is a smaller, portrait-oriented trio — see
// PORTRAIT_PAGE_INDEX below and the .photography__table--portrait rules in
// Photography.css for the aspect-ratio + layout switch this triggers.
const PORTRAIT_IMAGES = ['/img/photography-19.jpg', '/img/photography-20.jpg', '/img/photography-21.jpg']
const TABLE_IMAGES = [...REAL_TABLE_IMAGES, ...PORTRAIT_IMAGES]
const TOTAL_PHOTOS = TABLE_IMAGES.length
const TOTAL_PAGES = Math.ceil(TOTAL_PHOTOS / PAGE_SIZE)
const PORTRAIT_PAGE_INDEX = Math.floor(REAL_TABLE_IMAGES.length / PAGE_SIZE)
const TABLE_STAGGER_MS = 90
const TABLE_EXIT_DURATION_MS = 600
const TABLE_ENTRANCE_DURATION_MS = 850 // matches the 0.85s in photography-table-in
const TABLE_ENTRANCE_TOTAL_MS = (PAGE_SIZE - 1) * TABLE_STAGGER_MS + TABLE_ENTRANCE_DURATION_MS

// Both "leave a page" (paging to the next/previous 6) and "leave the section"
// (back button, unmounting) fly the same PAGE_SIZE photos back up off-screen
// with the same per-index stagger as the entrance, so they share this total.
const TABLE_EXIT_TOTAL_MS = (PAGE_SIZE - 1) * TABLE_STAGGER_MS + TABLE_EXIT_DURATION_MS
const BACK_EXIT_MS = TABLE_EXIT_TOTAL_MS

// Locked to the table layout for now (no header caption either) while it
// gets iterated on further. 'bento' is kept fully implemented in Photography.css
// (see .photography__bento) in case it's picked back up later — change this
// constant to 'bento' to switch back. The filmstrip-grid and accordion options
// that were also tried have been removed entirely, not kept in reserve.
const LAYOUT = 'table'

const EXPANDED_WIDTH_VW = 62
const EXPANDED_HEIGHT_VH = 78

// Mobile/tablet: photos are landscape (3/2), but the desktop box above is
// tall and narrow (62vw x 78vh) — forcing a landscape photo into that with
// object-fit: cover crops it heavily and reads as "vertical". Below this
// width (covers phone and tablet alike), use a near-full-width box sized in
// the photo's own 3/2 ratio instead (height in vw, not vh, so it tracks
// width exactly regardless of viewport height/orientation).
const MOBILE_EXPAND_MIN_VIEWPORT_PX = 1180
const MOBILE_EXPANDED_WIDTH_VW = 92
const MOBILE_EXPANDED_HEIGHT_VW = MOBILE_EXPANDED_WIDTH_VW * (2 / 3)

// Page 4's photos (photography-19/20/21) are portrait (2/3), unlike the
// rest of the table's landscape (3/2) photos — the expand box needs its own
// dimensions for these, or the landscape-tuned box above (which ends up
// wider than tall in absolute pixels on most desktop viewports despite its
// 62vw/78vh naming) crops them the same way the unfixed mobile box used to
// crop landscape photos. Both dimensions share one unit (vh on desktop, vw
// on mobile) for the same reason as the mobile fix above: mixing vw width
// with vh height only produces the right ratio at one specific viewport
// aspect ratio.
const PORTRAIT_EXPANDED_HEIGHT_VH = 82
const PORTRAIT_EXPANDED_WIDTH_VH = PORTRAIT_EXPANDED_HEIGHT_VH * (2 / 3)
const MOBILE_PORTRAIT_EXPANDED_WIDTH_VW = 70
const MOBILE_PORTRAIT_EXPANDED_HEIGHT_VW = MOBILE_PORTRAIT_EXPANDED_WIDTH_VW * (3 / 2)

function Photography({ onBack }) {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!isLeaving) return
    const id = setTimeout(() => onBack?.(), BACK_EXIT_MS)
    return () => clearTimeout(id)
  }, [isLeaving, onBack])

  // Pagination through the 5 screens of 6 photos: switching pages plays the
  // same "fly up and out" exit as leaving the whole section (photography-table-out),
  // then swaps in the next 6 and lets them fall in fresh (photography-table-in).
  // `page` only updates once the outgoing photos have finished animating away —
  // changing `page` also bumps the `.photography__table`'s React `key`, which
  // remounts it and replays the entrance.
  const [page, setPage] = useState(0)
  const [pageLeaving, setPageLeaving] = useState(false)

  const goToPage = (nextPage) => {
    if (pageLeaving || isLeaving || nextPage < 0 || nextPage >= TOTAL_PAGES) return
    setPageLeaving(true)
    setTimeout(() => {
      setPage(nextPage)
      setPageLeaving(false)
    }, TABLE_EXIT_TOTAL_MS)
  }

  const pageImages = TABLE_IMAGES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  // The entrance animation uses `animation-fill-mode: both` so the fallen
  // photo holds its landed position — but left attached indefinitely, that
  // still-technically-active animation keeps fighting the hover `transition`
  // on the same `transform` property (the hover scale ends up snapping
  // instantly instead of easing smoothly, since two systems are both trying
  // to drive `transform` every frame). Once the last photo's entrance
  // finishes, `--settled` swaps everything to a plain non-animated resting
  // transform so hover transitions work cleanly afterward.
  const [entranceSettled, setEntranceSettled] = useState(false)

  useEffect(() => {
    setEntranceSettled(false)
    const id = setTimeout(() => setEntranceSettled(true), TABLE_ENTRANCE_TOTAL_MS)
    return () => clearTimeout(id)
  }, [page])

  // Click-to-expand: "focus-pull" — the clicked photo grows from its exact
  // on-table position/rotation to a large centered card, starting blurred
  // and racking into focus as it settles, like a camera lens pulling focus.
  // `expanded` holds the clicked photo's src plus the exact rect/rotation it
  // started at, so the lightbox image can grow from that spot. Same
  // frozen-position-then-forced-reflow-then-active pattern as useHoverReveal
  // in Menu.jsx, so the CSS transition actually animates instead of jumping
  // straight to the target.
  const [expanded, setExpanded] = useState(null)
  const expandEnteringRef = useRef(false)

  const openExpanded = (event, src) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const rotate = getComputedStyle(event.currentTarget).rotate
    setExpanded({
      src,
      start: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        rotate: !rotate || rotate === 'none' ? '0deg' : rotate,
      },
      active: false,
      closing: false,
    })
    expandEnteringRef.current = true
  }

  useLayoutEffect(() => {
    if (!expanded || !expandEnteringRef.current || expanded.active) {
      return undefined
    }
    expandEnteringRef.current = false
    const id = requestAnimationFrame(() => setExpanded((prev) => (prev ? { ...prev, active: true } : prev)))
    return () => cancelAnimationFrame(id)
  }, [expanded])

  const closeExpanded = () => {
    setExpanded((prev) => (prev ? { ...prev, active: false, closing: true } : prev))
  }

  // Filtered to this element's own transition (not a bubbled one) so it only
  // fires once, when the lightbox image has actually finished shrinking back.
  const handleExpandedTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return
    setExpanded((prev) => (prev && prev.closing && !prev.active ? null : prev))
  }

  useEffect(() => {
    if (!expanded) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeExpanded()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expanded])

  const isMobileExpand = typeof window !== 'undefined' && window.innerWidth < MOBILE_EXPAND_MIN_VIEWPORT_PX
  const isPortraitExpand = expanded ? PORTRAIT_IMAGES.includes(expanded.src) : false

  const expandedImgStyle = expanded
    ? {
        top: expanded.active ? '50%' : `${expanded.start.top}px`,
        left: expanded.active ? '50%' : `${expanded.start.left}px`,
        width: expanded.active
          ? isPortraitExpand
            ? `${isMobileExpand ? MOBILE_PORTRAIT_EXPANDED_WIDTH_VW : PORTRAIT_EXPANDED_WIDTH_VH}${isMobileExpand ? 'vw' : 'vh'}`
            : `${isMobileExpand ? MOBILE_EXPANDED_WIDTH_VW : EXPANDED_WIDTH_VW}vw`
          : `${expanded.start.width}px`,
        height: expanded.active
          ? isPortraitExpand
            ? `${isMobileExpand ? MOBILE_PORTRAIT_EXPANDED_HEIGHT_VW : PORTRAIT_EXPANDED_HEIGHT_VH}${isMobileExpand ? 'vw' : 'vh'}`
            : isMobileExpand
              ? `${MOBILE_EXPANDED_HEIGHT_VW}vw`
              : `${EXPANDED_HEIGHT_VH}vh`
          : `${expanded.start.height}px`,
        rotate: expanded.active ? '0deg' : expanded.start.rotate,
        transform: expanded.active ? 'translate(-50%, -50%)' : 'translate(0, 0)',
        // Rack-focus: starts noticeably blurred (like a lens racking focus)
        // and sharpens as it settles.
        filter: expanded.active ? 'blur(0px)' : 'blur(22px)',
      }
    : undefined

  return (
    <div className={`photography ${isLeaving ? 'photography--leaving' : ''}`}>
      <button type="button" className="photography__back" onClick={() => setIsLeaving(true)}>
        <span className="photography__back-arrow" aria-hidden="true">←</span> Back
      </button>

      <div className="photography__gallery-wrap">
        <div className="photography__gallery">
          {LAYOUT === 'bento' && (
            <div className="photography__bento">
              {IMAGES.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt=""
                  className={`photography__bento-img photography__bento-img--${index}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                />
              ))}
            </div>
          )}

          {LAYOUT === 'table' && (
            <div
              className={`photography__table ${pageLeaving ? 'photography__table--leaving' : ''} ${
                entranceSettled ? 'photography__table--settled' : ''
              } ${page === PORTRAIT_PAGE_INDEX ? 'photography__table--portrait' : ''}`}
              key={page}
            >
              {pageImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt=""
                  className={`photography__table-img photography__table-img--${index}`}
                  style={{ animationDelay: `${index * TABLE_STAGGER_MS}ms` }}
                  onClick={(event) => openExpanded(event, src)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {LAYOUT === 'table' && (
        <div className="photography__pager">
          <button
            type="button"
            className="photography__pager-btn"
            onClick={() => goToPage(page - 1)}
            disabled={pageLeaving || page === 0}
            aria-label="Fotos anteriores"
          >
            ‹
          </button>
          <span className="photography__pager-label">{page + 1} / {TOTAL_PAGES}</span>
          <button
            type="button"
            className="photography__pager-btn"
            onClick={() => goToPage(page + 1)}
            disabled={pageLeaving || page === TOTAL_PAGES - 1}
            aria-label="Más fotos"
          >
            ›
          </button>
        </div>
      )}

      {expanded && (
        <div
          className={`photography__lightbox ${expanded.active ? 'photography__lightbox--active' : ''}`}
          onClick={closeExpanded}
        >
          <img
            src={expanded.src}
            alt=""
            className="photography__lightbox-img photography__lightbox-img--focus-pull"
            style={expandedImgStyle}
            onTransitionEnd={handleExpandedTransitionEnd}
          />
        </div>
      )}
    </div>
  )
}

export default Photography
