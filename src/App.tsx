import { useAtomValue } from "jotai"
import { useAtom } from "jotai"
import { useState, useEffect, useCallback, useRef } from "react"
import YouTube from "react-youtube"

import styles from "@/App.module.css"
import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"
import { useAudio } from "@/hooks/useAudio/index.hook"
import { useDataFetch } from "@/hooks/useDataFetch"
import { useViewSwitch } from "@/hooks/useViewSwitch"
import {
  isAudioPlayingAtom,
  playbackProgressAtom,
  shouldResumeAfterVisibilityReturnAtom
} from "@/stores/audioAtoms"

/** リソース読み込み完了後SoundActionButtonへの表示切り替えまでの待機時間(ms) */
const POST_LOAD_DELAY_MS = 1000

/** App */
export const App = () => {
  const { portfolioData, currentServerTime, mediaDownload } = useDataFetch()
  const {
    handleReady,
    handlePlayButtonClick,
    goToNextTrack,
    handlePlaybackStateChange,
    currentYoutubeId
  } = useAudio(portfolioData?.bgm ?? [])

  // リソース読み込み完了後に一定時間待ってからSoundActionButtonを表示するようにするための処理
  const [shouldPostLoadDelayExpired, setShouldPostLoadDelayExpired] = useState(false)
  const completedAtRef = useRef<number>(null)
  useEffect(() => {
    if (!(mediaDownload.isComplete && completedAtRef.current === null)) {
      return
    }

    completedAtRef.current = Date.now()
    const id = setTimeout(() => setShouldPostLoadDelayExpired(true), POST_LOAD_DELAY_MS)

    return () => clearTimeout(id)
  }, [mediaDownload.isComplete])

  const [youtubeAutoplay, setYoutubeAutoplay] = useState<0 | 1>(0)
  const [youtubeKey, setYoutubeKey] = useState<number>(0)
  const [didAutoplayRemount, setDidAutoplayRemount] = useState<boolean>(false)
  const [autoplayKickNeeded, setAutoplayKickNeeded] = useState<boolean>(false)

  const [isMuted, setIsMuted] = useState<boolean>()
  const progressPercent = useAtomValue(playbackProgressAtom)
  const isPlaying = useAtomValue(isAudioPlayingAtom)
  const { showWelcome, isPlayButtonShowsSpinner, welcomeRef, mainRef, onPlayClick } = useViewSwitch(
    {
      isMuted,
      setIsMuted,
      startPlayback: useCallback(() => {
        // 初回のみ再マウントする
        if (!didAutoplayRemount) {
          setYoutubeAutoplay(1)
          setYoutubeKey(prev => prev + 1) // key変更で再マウント
          setDidAutoplayRemount(true)
          setAutoplayKickNeeded(true) // onReady後に再生をキック
          return
        }
        // 2回目以降は従来どおり
        handlePlayButtonClick()
      }, [didAutoplayRemount, handlePlayButtonClick]) as () => void,
      progressPercent,
      isPlaying,
      canFadeOutWelcome: portfolioData !== undefined
    }
  )

  const shouldShowWelcomeView = showWelcome || portfolioData === undefined
  // WelcomeView完全終了後のみMainを出現させる
  const shouldStartAppear = !shouldShowWelcomeView

  // 外部リンク遷移後にタブへ戻ったらBGMの再生を再開する
  const [shouldResumeAfterVisibilityReturn, setShouldResumeAfterVisibilityReturn] = useAtom(
    shouldResumeAfterVisibilityReturnAtom
  )
  useEffect(() => {
    /** タブ復帰した時の処理 */
    const handleVisibility = () => {
      if (document.visibilityState !== "visible" || !shouldResumeAfterVisibilityReturn) {
        return
      }

      handlePlayButtonClick()
      setShouldResumeAfterVisibilityReturn(false)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [
    shouldResumeAfterVisibilityReturn,
    handlePlayButtonClick,
    setShouldResumeAfterVisibilityReturn
  ])

  return (
    <>
      {shouldShowWelcomeView && (
        <div ref={welcomeRef} className={styles.welcomeViewContainer}>
          <WelcomeView
            isMediaLoading={!mediaDownload.isComplete || !shouldPostLoadDelayExpired}
            isPlayButtonShowsSpinner={isPlayButtonShowsSpinner}
            mediaProgressPercent={mediaDownload.progress * 100}
            onPlayClick={onPlayClick}
            setIsMuted={setIsMuted}
          />
        </div>
      )}

      <div ref={mainRef} style={{ visibility: shouldStartAppear ? "visible" : "hidden" }}>
        <MainView
          currentServerTime={currentServerTime}
          isMuted={isMuted}
          portfolioData={portfolioData}
          shouldRenderWindows={shouldStartAppear}
        />
      </div>

      <div className={styles.youtube}>
        <YouTube
          key={youtubeKey}
          onEnd={goToNextTrack}
          onReady={e => {
            handleReady(e)
            // 初回の再マウント後、必要なら再生をキック（videoId未設定ケースの補助）
            if (autoplayKickNeeded) {
              handlePlayButtonClick()
              setAutoplayKickNeeded(false)
            }
          }}
          onStateChange={handlePlaybackStateChange}
          opts={{
            playerVars: {
              autoplay: youtubeAutoplay
            }
          }}
          videoId={currentYoutubeId}
        />
      </div>
    </>
  )
}
