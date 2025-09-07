import { useAtom } from "jotai"
import { useCallback, useMemo } from "react"

import { audioTrackIndexAtom } from "@/stores/audioAtoms"

import type { RefObject } from "react"
import type { YouTubePlayer } from "react-youtube"

/** 現在位置から次インデックスを算出（循環） */
const getNextTrackIndex = (currentIndex: number, listLength: number): number =>
  listLength > 0 ? (currentIndex + 1) % listLength : 0

/**
 * トラックインデックスの管理と次トラック遷移
 *
 * @param playerRef - YouTubePlayer参照
 * @param youtubeIdList - 再生候補ID一覧
 * @param prepareImmediatePlaybackVolume - 即時再生用の音量調整関数
 */
export const useAudioTrackNavigation = (
  playerRef: RefObject<YouTubePlayer | null>,
  youtubeIdList: Array<string>,
  prepareImmediatePlaybackVolume: () => void
) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useAtom(audioTrackIndexAtom)

  const currentYoutubeId = useMemo(
    () => youtubeIdList[currentTrackIndex],
    [youtubeIdList, currentTrackIndex]
  )

  /** 次トラックへ移動し再生 */
  const goToNextTrack = useCallback(() => {
    const nextTrackIndex = getNextTrackIndex(currentTrackIndex, youtubeIdList.length)
    setCurrentTrackIndex(nextTrackIndex)

    const player = playerRef.current
    if (player === null) {
      return
    }

    prepareImmediatePlaybackVolume()
    player.loadVideoById(youtubeIdList[nextTrackIndex])
    player.playVideo()
  }, [
    currentTrackIndex,
    youtubeIdList,
    setCurrentTrackIndex,
    playerRef,
    prepareImmediatePlaybackVolume
  ])

  return { currentTrackIndex, currentYoutubeId, goToNextTrack }
}
