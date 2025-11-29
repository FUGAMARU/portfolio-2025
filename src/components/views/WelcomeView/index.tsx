import { useEffect, useState } from "react"

import { WarnWindow } from "@/components/windows/WarnWindow"
import { WelcomeWindow } from "@/components/windows/WelcomeWindow"

import type { SizeLocationInfo } from "@/types"
import type { Dispatch, SetStateAction } from "react"

/** Props */
type Props = {
  /** メディアのロード中かどうか */
  isMediaLoading: boolean
  /** メディアの読み込みの進捗（0-100%） */
  mediaProgressPercent: number
  /** isWarn の状態（親管理） */
  isWarn: boolean
  /** isWarn の状態を更新する関数（親から受け取る） */
  setIsWarn: Dispatch<SetStateAction<boolean>>
  /** setIsMuted */
  setIsMuted: Dispatch<SetStateAction<boolean | undefined>>
  /** Playボタン押下時に実行（再生開始処理を委譲） */
  onPlayClick?: () => void
  /** Playボタンがスピナー表示かどうか */
  isPlayButtonShowsSpinner?: boolean
}

/** 初期表示ビュー */
export const WelcomeView = ({
  isMediaLoading,
  isPlayButtonShowsSpinner,
  isWarn,
  mediaProgressPercent,
  setIsWarn,
  onPlayClick,
  setIsMuted
}: Props) => {
  const [isChromium] = useState<boolean | undefined>(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return undefined
    }

    const ua = navigator.userAgent.toLowerCase()
    const isEdge = ua.includes("edg/")
    const isChrome = ua.includes("chrome") && !ua.includes("edg/") && !ua.includes("opr/")
    const isOpera = ua.includes("opr/") || ua.includes("opera")

    return isEdge || isChrome || isOpera
  })

  const [viewport, setViewport] = useState<Pick<SizeLocationInfo, "width" | "height"> | undefined>()

  useEffect(() => {
    /** リサイズした時の処理 */
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    if (typeof window === "undefined") {
      return
    }

    // useSyncExternalStoreを使用するとうまくいかなかった
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    handleResize()

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isWarnInitial =
    !(isChromium ?? false) || (viewport?.width ?? 0) < 1280 || (viewport?.height ?? 0) < 720

  useEffect(() => {
    // 親でstateを一括管理しつつブラウザ依存ロジックはWelcomeView内に閉じ込めたい設計のため警告は無視
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-live-state-to-parent
    setIsWarn(isWarnInitial)
  }, [isWarnInitial, setIsWarn])

  return (
    <>
      {isWarn ? (
        <WarnWindow />
      ) : (
        <WelcomeWindow
          isMediaLoading={isMediaLoading}
          isPlayButtonShowsSpinner={isPlayButtonShowsSpinner}
          mediaProgressPercent={mediaProgressPercent}
          onPlayClick={onPlayClick}
          setIsMuted={setIsMuted}
        />
      )}
    </>
  )
}
