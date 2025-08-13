import { shuffle } from "es-toolkit"
import { useAtom, useSetAtom } from "jotai"
import { useEffect, useRef, useMemo, useCallback } from "react"

import {
  playbackProgressAtom,
  playbackStateAtom,
  playlistAtom,
  audioTrackIndexAtom,
  audioControlsAtom
} from "@/stores/audioAtoms"
import { populateArtworkThemeColorsAtom } from "@/stores/audioAtoms"

import type { ApiResponse } from "@/hooks/useDataFetch"
import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

/** オーディオ再生用カスタムフック */
export const useAudio = (apiResponseBgmData: ApiResponse["bgm"]) => {
  // APIレスポンスデータ関連
  const shuffledBgmData = useMemo(() => shuffle(apiResponseBgmData), [apiResponseBgmData])
  const [playlist, setPlaylist] = useAtom(playlistAtom)
  const youtubeIdList = useMemo(() => playlist.map(bgm => bgm.youtubeId), [playlist])

  // 再生ステータス関連
  const setPlaybackProgress = useSetAtom(playbackProgressAtom)
  const [currentTrackIndex, setCurrentTrackIndex] = useAtom(audioTrackIndexAtom)
  const currentYoutubeId = useMemo(
    () => youtubeIdList[currentTrackIndex],
    [youtubeIdList, currentTrackIndex]
  )

  // プレイヤー関連
  // currentTrack は導出されるため setter は不要
  const setAudioControls = useSetAtom(audioControlsAtom)
  const [playbackState, setPlaybackState] = useAtom(playbackStateAtom)
  const playerRef = useRef<YouTubePlayer>(null)
  const populateArtworkThemeColors = useSetAtom(populateArtworkThemeColorsAtom)

  /** 再生準備が完了した時の処理 */
  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    event.target.setPlaybackQuality("small") // 音声しか使用しないので
  }

  /** 再生ボタンを押下した時の処理 */
  const handlePlayButtonClick = useCallback(() => {
    const player = playerRef.current

    if (player === null) {
      return
    }

    if (playbackState === 0) {
      if (currentYoutubeId !== undefined) {
        player.loadVideoById(currentYoutubeId)
      } else {
        player.playVideo()
      }
    } else {
      player.playVideo()
    }
  }, [currentYoutubeId, playbackState])

  /** 一時停止ボタンを押下した時の処理 */
  const handlePauseButtonClick = useCallback(() => {
    const player = playerRef.current

    if (player === null) {
      return
    }

    player.pauseVideo()
  }, [])

  /** 次のトラックに遷移する処理 */
  const goToNextTrack = useCallback(() => {
    const nextTrackIndex =
      currentTrackIndex === youtubeIdList.length - 1 ? 0 : currentTrackIndex + 1

    setCurrentTrackIndex(nextTrackIndex)

    const player = playerRef.current
    if (player !== null) {
      player.loadVideoById(youtubeIdList[nextTrackIndex])
      player.playVideo()
    }
  }, [currentTrackIndex, youtubeIdList, setCurrentTrackIndex])

  /** 再生状態が変更された時の処理 */
  const handlePlaybackStateChange = useCallback(
    (event: YouTubeEvent) => {
      setPlaybackState(event.data)
    },
    [setPlaybackState]
  )

  // プレイリストを初期化
  useEffect(() => {
    if (playlist.length === 0 && shuffledBgmData.length > 0) {
      setPlaylist(shuffledBgmData)
    }
  }, [playlist.length, shuffledBgmData, setPlaylist])

  // 再生コントロールを公開
  useEffect(() => {
    setAudioControls({
      play: handlePlayButtonClick,
      pause: handlePauseButtonClick,
      next: goToNextTrack
    })
  }, [setAudioControls, handlePlayButtonClick, handlePauseButtonClick, goToNextTrack])

  // プレイリストが用意できたらテーマカラーを事前計算
  useEffect(() => {
    if (playlist.length === 0) {
      return
    }
    populateArtworkThemeColors()
  }, [playlist, populateArtworkThemeColors])

  // 再生位置を更新
  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      const currentTime = await player?.getCurrentTime()
      const duration = await player?.getDuration?.()

      if (player === null || currentTime === undefined || typeof duration !== "number") {
        return
      }

      const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0
      setPlaybackProgress(progress)
    }, 100)

    return () => clearInterval(interval)
  }, [setPlaybackProgress])

  return {
    handleReady,
    handlePlayButtonClick,
    goToNextTrack,
    handlePlaybackStateChange,
    currentYoutubeId
  }
}
