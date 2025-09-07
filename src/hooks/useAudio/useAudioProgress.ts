import { clamp } from "es-toolkit"
import { useSetAtom } from "jotai"
import { useEffect } from "react"

import { playbackProgressAtom } from "@/stores/audioAtoms"

import type { RefObject } from "react"
import type { YouTubePlayer } from "react-youtube"

/** 再生位置の更新頻度（ms） */
const PLAYBACK_PROGRESS_INTERVAL_MS = 100

/** 再生位置の定期取得 */
export const useAudioProgress = (playerRef: RefObject<YouTubePlayer | null>) => {
  const setPlaybackProgress = useSetAtom(playbackProgressAtom)

  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      if (player === null) {
        return
      }

      const [currentTime, duration] = await Promise.all([
        player.getCurrentTime(),
        player.getDuration?.()
      ])

      if (currentTime === undefined || typeof duration !== "number") {
        return
      }

      const progress = duration > 0 ? clamp((currentTime / duration) * 100, 0, 100) : 0
      setPlaybackProgress(progress)
    }, PLAYBACK_PROGRESS_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [setPlaybackProgress, playerRef])
}
