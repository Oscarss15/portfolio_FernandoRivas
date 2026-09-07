import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import './FeaturedWork.css'

// 5 projects, all now pointing at their real (uncompressed, still huge)
// clips in public/videos/ and their real thumbnail frames in public/img/.
// `video` is a local-file fallback used only until a project's real Mux
// Playback ID is filled into `muxPlaybackId` below — once set, the lightbox
// streams from Mux (via <MuxPlayer>) instead of loading the local file.
// Either way it's only ever loaded on click (the lightbox isn't rendered
// until opened), not preloaded like the Home hero background is, but the
// local featured1-5 files are still 180MB-900MB each — flagged as needing
// compression/Mux migration before shipping, same as showreel.mp4.
const PROJECTS = [
  { id: 1, title: 'A Way of Being', type: 'Documentary', role: 'DP, Editor & Colorist', thumbnail: '/img/featured1.jpg', video: '/videos/featured1.mp4', muxPlaybackId: 'PjyVc2TvuwdwBGgqd3BLTUO7jEoGBe00BwKIAOF01ObtU' },
  { id: 2, title: 'The Secret of Happiness', type: 'Short film', role: 'DP & Colorist', thumbnail: '/img/featured2.jpg', video: '/videos/featured2.mp4', muxPlaybackId: 'bm014XS5RgZJPuuIA00mDds4GjwUn00g6ySuvYzY16OYvc' },
  { id: 3, title: 'The Big Task', type: 'Short film', role: 'DP & Colorist', thumbnail: '/img/featured3.jpg', video: '/videos/featured3.mov', muxPlaybackId: '2iQOs3GimNNRjih9rJ6kzB4401m1Y01IrjZ29LbGKfTEE' },
  { id: 4, title: 'Interviews Workshop', type: 'Interview', role: 'Colorist', thumbnail: '/img/featured4.jpg', video: '/videos/featured4.mov', muxPlaybackId: '5m7Mh3jH43ovbqX5vIuPAKgttQZ6CSvjfYJzhBuDCKM' },
  { id: 5, title: 'Untitled Unmastered', type: 'Extreme Sports Video', role: 'DP, Editor & Colorist', thumbnail: '/img/featured5.png', video: '/videos/featured5.mp4', muxPlaybackId: 'yGLyxtLIsYac1j0002I010001gxW3loUYOq0100DOnL2bhNj00g' },
]

// Kept as a permanent, user-facing layout switcher (not a throwaway dev
// picker like the others in this project) — the client liked being able to
// choose how the section reads, so all 4 layouts stay live.
const LAYOUTS = ['grid', 'stack', 'list', 'carousel']
const LAYOUT_LABELS = {
  grid: 'Grid',
  stack: 'Stacked rows',
  list: 'List + preview',
  carousel: 'Carousel',
}

function PlayIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M1 1 L19 11 L1 21 Z" fill="currentColor" />
    </svg>
  )
}

function ProjectCard({ project, index, onOpen, variant }) {
  return (
    <button
      type="button"
      className={`featured-work__card featured-work__card--${variant}`}
      style={{ animationDelay: `${index * 90}ms` }}
      onClick={() => onOpen(project)}
    >
      <img src={project.thumbnail} alt="" className="featured-work__thumb" />
      <span className="featured-work__overlay">
        <span className="featured-work__play">
          <PlayIcon />
        </span>
      </span>
      <span className="featured-work__meta">
        <span className="featured-work__title">{project.title}</span>
        <span className="featured-work__details">
          {project.type} — {project.role}
        </span>
      </span>
    </button>
  )
}

function FeaturedWork({ onBack }) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [openProject, setOpenProject] = useState(null)
  const [layout, setLayout] = useState(LAYOUTS[0])
  const [hoveredId, setHoveredId] = useState(PROJECTS[0].id)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleBack = () => {
    setIsLeaving(true)
    setTimeout(() => onBack?.(), 600)
  }

  const previewProject = PROJECTS.find((p) => p.id === hoveredId) ?? PROJECTS[0]
  const activeSlide = PROJECTS[carouselIndex]

  const goToSlide = (index) => {
    setCarouselIndex((index + PROJECTS.length) % PROJECTS.length)
  }

  return (
    <div className={`featured-work ${isLeaving ? 'featured-work--leaving' : ''}`}>
      <div className="featured-work__topbar">
        <button type="button" className="featured-work__back" onClick={handleBack}>
          <span className="featured-work__back-arrow" aria-hidden="true">←</span> Back
        </button>

        <div className="featured-work__layout-switcher">
          {LAYOUTS.map((l) => (
            <button
              key={l}
              type="button"
              className={`featured-work__layout-btn ${layout === l ? 'featured-work__layout-btn--active' : ''}`}
              onClick={() => setLayout(l)}
            >
              {LAYOUT_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      {layout === 'grid' && (
        <div className="featured-work__grid">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onOpen={setOpenProject} variant="grid" />
          ))}
        </div>
      )}

      {layout === 'carousel' && (
        <div className="featured-work__carousel">
          <button
            type="button"
            className="featured-work__carousel-nav featured-work__carousel-nav--prev"
            onClick={() => goToSlide(carouselIndex - 1)}
            aria-label="Previous project"
          >
            ‹
          </button>

          <button
            type="button"
            className="featured-work__carousel-slide"
            onClick={() => setOpenProject(activeSlide)}
          >
            <img key={activeSlide.id} src={activeSlide.thumbnail} alt="" className="featured-work__thumb featured-work__carousel-img" />
            <span className="featured-work__overlay">
              <span className="featured-work__play">
                <PlayIcon />
              </span>
            </span>
            <span className="featured-work__meta">
              <span className="featured-work__title">{activeSlide.title}</span>
              <span className="featured-work__details">
                {activeSlide.type} — {activeSlide.role}
              </span>
            </span>
          </button>

          <button
            type="button"
            className="featured-work__carousel-nav featured-work__carousel-nav--next"
            onClick={() => goToSlide(carouselIndex + 1)}
            aria-label="Next project"
          >
            ›
          </button>

          <div className="featured-work__carousel-dots">
            {PROJECTS.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`featured-work__carousel-dot ${index === carouselIndex ? 'featured-work__carousel-dot--active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to ${project.title}`}
              />
            ))}
          </div>
        </div>
      )}

      {layout === 'stack' && (
        <div className="featured-work__stack">
          {PROJECTS.map((project, index) => (
            <div key={project.id} className="featured-work__stack-row" style={{ animationDelay: `${index * 120}ms` }}>
              <button type="button" className="featured-work__stack-media" onClick={() => setOpenProject(project)}>
                <img src={project.thumbnail} alt="" className="featured-work__thumb" />
                <span className="featured-work__overlay">
                  <span className="featured-work__play">
                    <PlayIcon />
                  </span>
                </span>
              </button>
              <div className="featured-work__stack-info">
                <span className="featured-work__stack-index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="featured-work__stack-title">{project.title}</h3>
                <p className="featured-work__stack-details">
                  {project.type} — {project.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="featured-work__list-preview">
          <div className="featured-work__list">
            {PROJECTS.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`featured-work__list-item ${hoveredId === project.id ? 'featured-work__list-item--active' : ''}`}
                style={{ animationDelay: `${index * 90}ms` }}
                onMouseEnter={() => setHoveredId(project.id)}
                onClick={() => setOpenProject(project)}
              >
                <span className="featured-work__list-title">{project.title}</span>
                <span className="featured-work__list-details">
                  {project.type} — {project.role}
                </span>
              </button>
            ))}
          </div>
          <div className="featured-work__preview-panel">
            <img key={previewProject.id} src={previewProject.thumbnail} alt="" className="featured-work__preview-img" />
          </div>
        </div>
      )}

      {openProject && (
        <div className="featured-work__lightbox" onClick={() => setOpenProject(null)}>
          <div className="featured-work__lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {openProject.muxPlaybackId ? (
              <MuxPlayer
                className="featured-work__lightbox-video"
                playbackId={openProject.muxPlaybackId}
                autoPlay
                playsInline
              />
            ) : (
              <video
                className="featured-work__lightbox-video"
                src={openProject.video}
                controls
                autoPlay
                playsInline
              />
            )}
            <div className="featured-work__lightbox-caption">
              <span className="featured-work__title">{openProject.title}</span>
              <span className="featured-work__details">
                {openProject.type} — {openProject.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeaturedWork
