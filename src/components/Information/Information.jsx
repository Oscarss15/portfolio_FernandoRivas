import { useEffect, useState } from 'react'
import './Information.css'

// Non-breaking space between the two surnames so mobile's natural text wrap
// (the name doesn't fit on one line at phone widths) breaks after "Fernando"
// instead of after "Rivas" — "Rivas Miranda" wraps together as one unit.
const NAME = 'Fernando Rivas Miranda'
const ROLE = 'Cinematographer & Colorist'

const BIO_PARAGRAPHS = [
  "I've always been drawn to the moments other people scroll past, the pause before someone speaks, the way a room changes just before something happens. That instinct led me from studying Film & TV Production, where I graduated with First Class Honours, into a life behind cameras, edit timelines and deep in color grades, always searching for the mood a story deserves.",
  "My proudest work to date is A Way of Being, an observational documentary I co-directed, filmed, edited, and color graded myself. It follows Tom Beresford, tattooed, obsessed with vintage Harleys, and working as a women's hairstylist, through a life that quietly challenges what we expect an artist to look like. Shot handheld over three days in Leeds, it became the first piece in a documentary series I'm developing.",
  "Today, I work as a freelance cinematographer, video editor, and colorist, helping people and brands turn raw footage into something intentional, cinematic, not just polished. Whether it's a documentary or a brand shoot, my approach stays the same: pay attention, protect what's honest in front of the camera, and shape it with care. If you're looking for that same care on your next project, I'd love to hear from you.",
]

// Same length/index as BIO_PARAGRAPHS so they rotate together — swap in per-paragraph
// photos (e.g. /img/info-1.jpg … info-3.jpg) once more than one real photo exists.
const PHOTOS = ['/img/menuphoto/perfilPhoto.jpg', '/img/menuphoto/perfilPhoto2.JPG', '/img/menuphoto/perfilPhoto.jpg']

// Photo crossfade duration — a bit snappier than the bio text's.
const PHOTO_FADE_MS = 1200

// How long each bio paragraph stays on screen before crossfading to the next.
const BIO_ROTATE_MS = 10000
// Crossfade duration (opacity + slide) — kept in sync with the CSS transition on .information__bio.
const BIO_FADE_MS = 1500
// Blur takes noticeably longer than the fade/slide so it reads as its own slower effect.
const BIO_BLUR_MS = 2800

const SPECIALTIES = ['DaVinci Resolve', 'Adobe Creative Suite', 'Blackmagic Cameras', 'Color Science', 'On-set Lighting']

// Staggered entrance for the specialty pills — starts once the parent .information
// block's own fade-in (1s delay + 0.7s duration) has settled.
const SPECIALTY_ENTRANCE_BASE_DELAY_MS = 1600
const SPECIALTY_ENTRANCE_STAGGER_MS = 80

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="8.2" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8.2 11v6" strokeLinecap="round" />
      <path d="M12 17v-3.5c0-1.4 1-2.5 2.3-2.5s2.1 1 2.1 2.5V17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v1.2" strokeLinecap="round" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SOCIALS = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon, href: 'https://www.instagram.com/mirandalatempestad/' },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon, href: 'https://www.linkedin.com/in/fernando-rivas-miranda-627415216/' },
  { id: 'email', label: 'Email', Icon: EmailIcon, href: 'mailto:fernandorivasmiranda@gmail.com' },
  { id: 'youtube', label: 'YouTube', Icon: YoutubeIcon, href: 'https://www.youtube.com/@rivasmirandafernando' },
]

// The "back" exit fades each piece out individually (blur + slide up, staggered)
// rather than the whole block at once — see .information--leaving in Information.css.
// This total must match last item's delay + its own duration there.
const BACK_EXIT_MS = 1180

function Information({ onBack }) {
  const [bioIndex, setBioIndex] = useState(0)
  const [isBioHovered, setIsBioHovered] = useState(false)

  useEffect(() => {
    if (isBioHovered) return
    const id = setInterval(() => {
      setBioIndex((current) => (current + 1) % BIO_PARAGRAPHS.length)
    }, BIO_ROTATE_MS)
    return () => clearInterval(id)
  }, [isBioHovered])

  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!isLeaving) return
    const id = setTimeout(() => onBack?.(), BACK_EXIT_MS)
    return () => clearTimeout(id)
  }, [isLeaving, onBack])

  return (
    <div className={`information ${isLeaving ? 'information--leaving' : ''}`}>
      <button type="button" className="information__back" onClick={() => setIsLeaving(true)}>
        <span className="information__back-arrow" aria-hidden="true">←</span> Back
      </button>

      <h2 className="information__name">{NAME}</h2>

      <p className="information__role">{ROLE}</p>

      {/* Sits between role and bio in DOM order — on mobile (single-column
          grid) that's exactly the visual order too (name, role, photo+socials,
          bio, specialties); on desktop it's pulled out to its own column via
          grid-column/grid-row, regardless of where it sits in the DOM.
          `.information__side-wrap` is `display: contents` on desktop (so
          `.information__side` itself is the real grid item, at grid-column: 2)
          and becomes a real full-width flex box only on mobile/tablet, so
          `.information__side` can be centered inside it directly instead of
          via `justify-self` on a grid cell shared with the rest of the
          column. */}
      <div className="information__side-wrap">
        <div className="information__side">
          <div className="information__photo-card">
            {PHOTOS.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={NAME}
                className={`information__photo-img ${index === bioIndex ? 'information__photo-img--active' : ''}`}
                style={{ transitionDuration: `${PHOTO_FADE_MS}ms` }}
              />
            ))}
          </div>

          <div className="information__socials">
            {SOCIALS.map(({ id, label, Icon, href }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="information__social-link"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="information__bio-wrapper"
        onMouseEnter={() => setIsBioHovered(true)}
        onMouseLeave={() => setIsBioHovered(false)}
      >
        {BIO_PARAGRAPHS.map((text, index) => (
          <p
            key={index}
            className={`information__bio ${index === bioIndex ? 'information__bio--active' : ''}`}
            style={{ transitionDuration: `${BIO_FADE_MS}ms, ${BIO_FADE_MS}ms, ${BIO_BLUR_MS}ms` }}
          >
            {text}
          </p>
        ))}
      </div>

      <ul className="information__specialties">
        {SPECIALTIES.map((item, index) => (
          <li
            key={item}
            style={{ animationDelay: `${SPECIALTY_ENTRANCE_BASE_DELAY_MS + index * SPECIALTY_ENTRANCE_STAGGER_MS}ms` }}
          >
            <span className="information__specialty-fill" aria-hidden="true" />
            <span className="information__specialty-label">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Information
