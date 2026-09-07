import { useState } from 'react'
import VideoBackground from '../../components/VideoBackground/VideoBackground'
import Menu from '../../components/Menu/Menu'
import Information from '../../components/Information/Information'
import Photography from '../../components/Photography/Photography'
import FeaturedWork from '../../components/FeaturedWork/FeaturedWork'
import CustomCursor from '../../components/CustomCursor/CustomCursor'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import './Home.css'

// Set once the showreel is uploaded to Mux (its Playback ID, not the video
// itself) — falls back to the local /videos/showreel.mp4 file until then.
const SHOWREEL_MUX_PLAYBACK_ID = '2ZJbHuZb4UMd7S5o3ms4yEH00RgqXzbjKybjZnszg01rM'

const TITLE_TEXT = 'FERNANDO RIVAS MIRANDA'
const TITLE_FONT_FAMILY = "'Bebas Neue', system-ui, sans-serif"
const SUBTITLE_FONT_FAMILY = "'Fraunces', serif"
const SUBTITLE_DELAY_MS = 1500

// Indexes of Menu's ITEMS array.
const FEATURED_WORK_INDEX = 0
const PHOTOGRAPHY_INDEX = 1
const INFORMATION_INDEX = 2

function Home() {
  // Clicking any menu item fades out the whole screen (title, subtitle, menu)
  // before that section's own content is shown. No routing/content yet — this
  // is just the disappear half of the transition. Each section's own "back"
  // button calls handleBack, which resets isExiting/clickedIndex (unmounting
  // it and revealing Home again) and bumps `homeReplayKey` so the title/
  // subtitle/menu remount and replay their full entrance animation from zero,
  // instead of just snapping back to their held end-state.
  const [isExiting, setIsExiting] = useState(false)
  const [clickedIndex, setClickedIndex] = useState(null)
  const [homeReplayKey, setHomeReplayKey] = useState(0)

  const handleBack = () => {
    setIsExiting(false)
    setClickedIndex(null)
    setHomeReplayKey((key) => key + 1)
  }

  // Featured Work/Information/Photography sit on the shared light
  // #e8e6e6 background, so the cursor needs to flip to its dark variant
  // there instead of the cream one used over Home's dark video.
  const isLightSection =
    isExiting && (clickedIndex === FEATURED_WORK_INDEX || clickedIndex === PHOTOGRAPHY_INDEX || clickedIndex === INFORMATION_INDEX)

  return (
    <main className="home">
      <CustomCursor theme={isLightSection ? 'dark' : 'light'} />
      <ThemeToggle />

      <VideoBackground src="/videos/showreel.mp4" muxPlaybackId={SHOWREEL_MUX_PLAYBACK_ID} isExiting={isExiting}>
        <div className="home__top">
          <h1 className="home__title">
            <svg className="home__title-svg" viewBox="0 0 1000 115" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Fernando Rivas Miranda">
              <text
                key={homeReplayKey}
                x="500"
                y="105"
                textAnchor="middle"
                textLength="950"
                lengthAdjust="spacingAndGlyphs"
                className={`home__title-text--anim ${isExiting ? 'home__title-text--exit' : ''}`}
                style={{ fontFamily: TITLE_FONT_FAMILY }}
              >
                {TITLE_TEXT}
              </text>
            </svg>
          </h1>

          <p
            key={homeReplayKey}
            className={`home__role home__role--below home__role--anim ${isExiting ? 'home__role--exit' : ''}`}
            style={{ fontFamily: SUBTITLE_FONT_FAMILY, animationDelay: isExiting ? '0ms' : `${SUBTITLE_DELAY_MS}ms` }}
          >
            Cinematographer &amp; Colorist
          </p>
        </div>

        <Menu
          key={homeReplayKey}
          isExiting={isExiting}
          onItemClick={(index) => {
            setIsExiting(true)
            setClickedIndex(index)
          }}
        />
      </VideoBackground>

      {isExiting && clickedIndex === FEATURED_WORK_INDEX && <FeaturedWork onBack={handleBack} />}

      {isExiting && clickedIndex === PHOTOGRAPHY_INDEX && <Photography onBack={handleBack} />}

      {isExiting && clickedIndex === INFORMATION_INDEX && <Information onBack={handleBack} />}
    </main>
  )
}

export default Home
