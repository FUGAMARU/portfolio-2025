import { shuffle } from "es-toolkit"
import { useAtom } from "jotai"
import { useEffect, useMemo } from "react"

import { playlistAtom } from "@/stores/audioAtoms"

import type { PortfolioData } from "@/hooks/useDataFetch"

/**
 * プレイリスト初期化 + シャッフル済み配列をAtomへ投入
 *
 * @param portfolioBgmData - APIから取得したBGM配列
 */
export const useAudioPlaylist = (portfolioBgmData: PortfolioData["bgm"]) => {
  const shuffledBgmData = useMemo(() => shuffle(portfolioBgmData), [portfolioBgmData])
  const [playlist, setPlaylist] = useAtom(playlistAtom)
  const youtubeIdList = useMemo(() => playlist.map(bgm => bgm.youtubeId), [playlist])

  useEffect(() => {
    if (playlist.length === 0 && shuffledBgmData.length > 0) {
      setPlaylist(shuffledBgmData)
    }
  }, [playlist.length, shuffledBgmData, setPlaylist])

  return { playlist, youtubeIdList }
}
