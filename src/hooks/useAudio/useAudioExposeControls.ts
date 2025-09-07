import { useSetAtom } from "jotai"
import { useEffect } from "react"

import { audioControlsAtom } from "@/stores/audioAtoms"

/** プレイヤー操作コールバック */
type Controls = {
  /** 再生 */
  play: () => void
  /** 一時停止 */
  pause: () => void
  /** 次の曲へ */
  next: () => void
}

/** jotai経由でプレイヤー操作関数を公開 */
export const useAudioExposeControls = (controls: Controls) => {
  const setAudioControls = useSetAtom(audioControlsAtom)

  useEffect(() => {
    setAudioControls(controls)
  }, [controls, setAudioControls])
}
