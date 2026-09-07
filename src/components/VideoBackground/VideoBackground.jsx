import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import './VideoBackground.css'

// Locked to 'fade' (plain crossfade) — was previously driven live by a
// client-facing picker in Home.jsx, now removed. The other 3 effects tried
// ('wipe': curtain sweeps left-to-right, 'desaturate': video drains to
// grayscale/dim while dissolving, 'zoom': video slowly pushes in while
// dissolving) are kept implemented in VideoBackground.css in case one of
// them is picked back up later — pass exitEffect="wipe"/"desaturate"/"zoom"
// to bring one back.
//
// `muxPlaybackId`, when set, streams from Mux instead of the local `src`
// file — Mux serves HLS (an .m3u8 manifest + segmented chunks), which this
// plain <video> element can't play natively in Chrome/Firefox, so hls.js
// attaches here to feed it in via the Media Source Extensions API.
// hls.js is checked (and preferred) first, native canPlayType second — some
// Chromium builds report "maybe" for the HLS MIME type via canPlayType
// without actually having a working adaptive-HLS demuxer, which (when this
// was checked first) silently set `video.src` to the raw .m3u8 URL and
// failed with a MEDIA_ERR_SRC_NOT_SUPPORTED error instead of ever using
// hls.js. Checking Hls.isSupported() first avoids that trap; the native-src
// path is now just the true-Safari fallback. `src` stays as a local-file
// fallback for whichever videos haven't been uploaded to Mux yet.
function VideoBackground({ src, muxPlaybackId, poster, children, isExiting, exitEffect = 'fade' }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!muxPlaybackId) return
    const video = videoRef.current
    const hlsUrl = `https://stream.mux.com/${muxPlaybackId}.m3u8`

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl
    }
  }, [muxPlaybackId])

  return (
    <div
      className={`video-background video-background--effect-${exitEffect} ${
        isExiting ? 'video-background--exiting' : ''
      }`}
    >
      <video
        ref={videoRef}
        className="video-background__media"
        src={muxPlaybackId ? undefined : src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="video-background__overlay" />
      <div className="video-background__solid" />
      {children && <div className="video-background__content">{children}</div>}
    </div>
  )
}

export default VideoBackground
