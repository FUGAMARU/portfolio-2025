import { animate } from "animejs"
import { useState, useEffect, useRef } from "react"
import YouTube from "react-youtube"

import styles from "@/App.module.css"
import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"
import { useAudio } from "@/hooks/useAudio"
import { useDataFetch } from "@/hooks/useDataFetch"

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
  const [showWelcome, setShowWelcome] = useState(true)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // WelcomeViewのフェードアウトアニメーション
  useEffect(() => {
    if (isMuted === undefined || welcomeRef.current === null) {
      return
    }

    animate(welcomeRef.current, {
      opacity: [1, 0],
      duration: 800,
      delay: 300,
      /** アニメーション完了時の処理 */
      onComplete: () => {
        setShowWelcome(false)

        if (isMuted) {
          return
        }

        handlePlayButtonClick()
      }
    })
  }, [isMuted, handlePlayButtonClick])

  // MainViewのフェードインアニメーション
  useEffect(() => {
    if (showWelcome || mainRef.current === null) {
      return
    }

    animate(mainRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    })
  }, [showWelcome])

  if (showWelcome) {
    return (
      <div ref={welcomeRef} className={styles.welcomeViewContainer}>
        <WelcomeView setIsMuted={setIsMuted} />
      </div>
    )
  }

  return (
    <div ref={mainRef} className={styles.mainViewContainer}>
      <MainView apiResponse={apiResponse} isMuted={isMuted ?? false} />

      <div className={styles.youtube}>
        <YouTube
          onEnd={goToNextTrack}
          onReady={handleReady}
          onStateChange={handlePlaybackStateChange}
          opts={{
            playerVars: {
              autoplay: isMuted === true ? 0 : 1
            }
          }}
          videoId={currentYoutubeId}
        />
      </div>
    </div>
  )
}
