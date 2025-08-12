import { useAtomValue } from "jotai"
import { useState } from "react"
import YouTube from "react-youtube"

import styles from "@/App.module.css"
import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"
import { useAudio } from "@/hooks/useAudio"
import { useDataFetch } from "@/hooks/useDataFetch"
import { useViewSwitch } from "@/hooks/useViewSwitch"
import { audioIsPlayingAtom, playbackProgressAtom } from "@/stores/audioAtoms"

/** App */
export const App = () => {
  const { apiResponse } = useDataFetch()
  const {
    handleReady,
    handlePlayButtonClick,
    goToNextTrack,
    handlePlaybackStateChange,
    currentYoutubeId
  } = useAudio(apiResponse?.bgm ?? [])

  const [isMuted, setIsMuted] = useState<boolean>()
  const progressPercent = useAtomValue(playbackProgressAtom)
  const isPlaying = useAtomValue(audioIsPlayingAtom)
  const { showWelcome, isPlayButtonShowsSpinner, welcomeRef, mainRef, onPlayClick } = useViewSwitch(
    {
      isMuted,
      setIsMuted,
      startPlayback: handlePlayButtonClick,
      progressPercent,
      isPlaying
    }
  )

  if (showWelcome) {
    return (
      <>
        <div ref={welcomeRef} className={styles.welcomeViewContainer}>
          <WelcomeView
            isPlayButtonShowsSpinner={isPlayButtonShowsSpinner}
            onPlayClick={onPlayClick}
            setIsMuted={setIsMuted}
          />
        </div>
        <div className={styles.youtube}>
          <YouTube
            onEnd={goToNextTrack}
            onReady={handleReady}
            onStateChange={handlePlaybackStateChange}
            opts={{
              playerVars: {
                autoplay: 0
              }
            }}
            videoId={currentYoutubeId}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div ref={mainRef} className={styles.mainViewContainer}>
        <MainView apiResponse={apiResponse} isMuted={isMuted ?? false} />
      </div>
      <div className={styles.youtube}>
        <YouTube
          onEnd={goToNextTrack}
          onReady={handleReady}
          onStateChange={handlePlaybackStateChange}
          opts={{
            playerVars: {
              autoplay: 0
            }
          }}
          videoId={currentYoutubeId}
        />
      </div>
    </>
  )
}
