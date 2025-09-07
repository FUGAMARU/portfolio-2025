import { useAtom } from "jotai"
import { useCallback } from "react"

import { YouTubePlayerState, playbackStateAtom } from "@/stores/audioAtoms"

import type { useAudioFade } from "@/hooks/useAudio/useAudioFade"
import type { RefObject } from "react"
import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

/** 再生/一時停止/状態変化イベントと音量フェード連携 */
export const useAudioPlaybackState = (
  playerRef: RefObject<YouTubePlayer | null>,
  fade: ReturnType<typeof useAudioFade>,
  currentYoutubeId?: string
) => {
  const [playbackState, setPlaybackState] = useAtom(playbackStateAtom)

  /** 再生ボタンを押下した時の処理 */
  const handlePlayButtonClick = useCallback(() => {
    const player = playerRef.current
    if (player === null) {
      return
    }

    setPlaybackState(YouTubePlayerState.PLAYING)
    ;(playbackState === YouTubePlayerState.PAUSED
      ? fade.prepareFadeInForResume
      : fade.prepareImmediatePlaybackVolume)()

    if (playbackState === YouTubePlayerState.ENDED && currentYoutubeId !== undefined) {
      player.loadVideoById(currentYoutubeId)
    }

    player.playVideo()
  }, [playerRef, playbackState, setPlaybackState, fade, currentYoutubeId])

  /** 一時停止ボタンを押下した時の処理 */
  const handlePauseButtonClick = useCallback(() => {
    const player = playerRef.current
    if (player === null) {
      return
    }

    setPlaybackState(YouTubePlayerState.PAUSED)
    fade.pendingFadeInRef.current = false
    fade.isPausingRef.current = true
    const mySeq = ++fade.actionSeqRef.current
    fade.clearFadeTimer()
    fade.fadeTo(0).then(() => {
      if (fade.actionSeqRef.current === mySeq && fade.isPausingRef.current) {
        player.pauseVideo()
      }
    })
  }, [playerRef, setPlaybackState, fade])

  /** 再生状態が変更された時の処理 */
  const handlePlaybackStateChange = useCallback(
    (event: YouTubeEvent) => {
      const state = event.data
      setPlaybackState(state)
      if (state === YouTubePlayerState.PLAYING && fade.pendingFadeInRef.current) {
        fade.pendingFadeInRef.current = false
        fade.fadeTo(fade.INTENDED_VOLUME)
      }
    },
    [setPlaybackState, fade]
  )

  /** 再生準備が完了した時の処理 */
  const handleReady = (event: YouTubeEvent) => {
    event.target.setPlaybackQuality("small")
  }

  return {
    handlePlayButtonClick,
    handlePauseButtonClick,
    handlePlaybackStateChange,
    handleReady
  }
}
