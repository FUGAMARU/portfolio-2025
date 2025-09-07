import { useSetAtom } from "jotai"
import { useEffect } from "react"

import { populateArtworkThemeColorsAtom } from "@/stores/audioAtoms"

/**
 * アートワークのテーマカラーの事前計算
 *
 * @param playlist - プレイリスト
 */
export const useAudioArtworkPreload = (
  playlist: Array<{
    /** YouTube動画ID */
    youtubeId: string
  }>
) => {
  const populateArtworkThemeColors = useSetAtom(populateArtworkThemeColorsAtom)

  useEffect(() => {
    if (playlist.length === 0) {
      return
    }
    populateArtworkThemeColors()
  }, [playlist, populateArtworkThemeColors])
}
