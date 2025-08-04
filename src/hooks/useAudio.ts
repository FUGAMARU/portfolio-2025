/**
 *
 */
import { useState, useEffect, useRef } from "react"

import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

// export const YOUTUBE_ID_LIST = ["LWzlcOEzLhQ", "Lm4eYNuWcWE", "_dRNvNiPTV4"]

/** オーディオ再生用カスタムフック */
export const useAudio = (youtubeIdList: Array<string>) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
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
    currentTrackIndex,
    currentTime,
    playbackState,
    handleReady,
    handlePlayButtonClick,
    handleTrackEnd,
    handlePlaybackStateChange
  }
}
