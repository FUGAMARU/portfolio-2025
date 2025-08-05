/**
 *
 */
import { shuffle } from "es-toolkit"
import { useSetAtom } from "jotai"
import { useState, useEffect, useRef, useMemo } from "react"

import { audioAtom } from "@/stores/audioAtoms"

import type { ApiResponse } from "@/hooks/useDataFetch"
import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

/** オーディオ再生用カスタムフック */
export const useAudio = (apiResponseBgmData: ApiResponse["bgm"]) => {
  // APIレスポンスデーター関連
  const shuffledBgmData = useMemo(() => shuffle(apiResponseBgmData), [apiResponseBgmData])
  const youtubeIdList = useMemo(() => shuffledBgmData.map(bgm => bgm.youtubeId), [shuffledBgmData])

  // 再生ステータス関連
  const [currentTime, setCurrentTime] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const currentYoutubeId = useMemo(
    () => youtubeIdList[currentTrackIndex],
    [youtubeIdList, currentTrackIndex]
  )

  // プレイヤー関連
  const setAudio = useSetAtom(audioAtom)
  const [playbackState, setPlaybackState] = useState(-1)
  const playbackHistoryRef = useRef<Array<number>>([])
  const playerRef = useRef<YouTubePlayer>(null)

  /** 再生準備が完了した時の処理 */
  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    event.target.setPlaybackQuality("small") // 音声しか使用しないので
  }

  /** 再生ボタンを押下した時の処理 */
  const handlePlayButtonClick = () => {
    const player = playerRef.current

    if (player === null) {
      return
    }

    player.playVideo()
  }

  /** 再生終了した時の処理 */
  const handleTrackEnd = () => {
    const nextTrackIndex =
      currentTrackIndex === youtubeIdList.length - 1 ? 0 : currentTrackIndex + 1

    setCurrentTrackIndex(nextTrackIndex)

    const player = playerRef.current

    if (player === null) {
      return
    }

    player.loadVideoById(youtubeIdList[nextTrackIndex])
    player.playVideo()
  }

  /** 再生状態が変更された時の処理 */
  const handlePlaybackStateChange = (event: YouTubeEvent) => {
    playbackHistoryRef.current = [playbackState, ...playbackHistoryRef.current.slice(0, 1)]

    if (
      (playbackHistoryRef.current[0] === -1 || playbackHistoryRef.current[1] === -1) &&
      event.data === 1
    ) {
      setAudio(shuffledBgmData[currentTrackIndex])
    }

    setPlaybackState(event.data)
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      const currentTime = await player?.getCurrentTime()

      if (player === null || currentTime === undefined) {
        return
      }

      setCurrentTime(currentTime) // TypeScript的にはnumberになっているがundefinedが返ってくることがある
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return {
    handleReady,
    handlePlayButtonClick,
    handleTrackEnd,
    handlePlaybackStateChange,
    currentYoutubeId
  }
}
