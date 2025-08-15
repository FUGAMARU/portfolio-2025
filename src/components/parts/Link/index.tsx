import { useAtom, useAtomValue } from "jotai"

import {
  audioControlsAtom,
  isAudioPlayingAtom,
  shouldResumeAfterVisibilityReturnAtom
} from "@/stores/audioAtoms"

import type { ComponentProps, ReactNode, MouseEvent } from "react"

/** Props */
type Props = Omit<ComponentProps<"a">, "rel" | "target"> & {
  /** children */
  children: ReactNode
}

/** リンクコンポーネント */
export const Link = ({ children, onClick, ...props }: Props) => {
  const audioControls = useAtomValue(audioControlsAtom)
  const isPlaying = useAtomValue(isAudioPlayingAtom)
  const [shouldResume, setShouldResume] = useAtom(shouldResumeAfterVisibilityReturnAtom)

  /** リンクを押下した時の処理 */
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick !== undefined) {
      onClick(e)
    }

    if (e.defaultPrevented || !isPlaying) {
      return
    }

    // BGM再生中であれば一時停止し復帰フラグを立てる
    audioControls?.pause()
    if (!shouldResume) {
      setShouldResume(true)
    }
  }

  return (
    <a onClick={handleClick} rel="noopener noreferrer" target="_blank" {...props}>
      {children}
    </a>
  )
}
