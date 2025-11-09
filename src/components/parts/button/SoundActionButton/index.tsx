import { animate } from "animejs"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import styles from "@/components/parts/button/SoundActionButton/index.module.css"
import { SoundOffIcon } from "@/components/parts/button/SoundActionButton/SoundOffIcon"
import { SoundOnIcon } from "@/components/parts/button/SoundActionButton/SoundOnIcon"
import { PushSqueezeButton } from "@/components/parts/PushSqueezeButton"

import type { ComponentProps } from "react"

/** スピナー切替時のフェードアニメーションのDuration（ms） */
const FADE_DURATION_MS = 250
/** 上記フェードアニメーションで使用するイージング */
const EASING_EASE_OUT_QUAD = "easeOutQuad"

/** Props */
type Props = {
  /** 表示タイプ */
  displayType: "on" | "off"
  /** スピナー表示にするかどうか */
  shouldShowSpinner?: boolean
} & Required<Pick<ComponentProps<"button">, "onClick">>

/** サウンドアクションボタン */
export const SoundActionButton = ({
  displayType,
  shouldShowSpinner = false,
  onClick: handleClick
}: Props) => {
  const iconRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const spinnerRef = useRef<HTMLSpanElement>(null)

  const [isSpinnerOnly, setIsSpinnerOnly] = useState<boolean>(
    displayType === "on" && shouldShowSpinner
  )
  const prevShouldShowSpinnerRef = useRef<boolean>(shouldShowSpinner)

  // スピナー表示切替時のフェードアウト
  useEffect(() => {
    const was = prevShouldShowSpinnerRef.current
    const now = shouldShowSpinner
    prevShouldShowSpinnerRef.current = now

    if (displayType !== "on") {
      return
    }

    if (!was && now) {
      if (textRef.current !== null) {
        animate(textRef.current, {
          opacity: [1, 0],
          duration: FADE_DURATION_MS,
          easing: EASING_EASE_OUT_QUAD
        })
      }

      if (iconRef.current !== null) {
        animate(iconRef.current, {
          opacity: [1, 0],
          duration: FADE_DURATION_MS,
          easing: EASING_EASE_OUT_QUAD
        })
      }

      const timer = window.setTimeout(() => {
        setIsSpinnerOnly(true)
      }, FADE_DURATION_MS)

      return () => window.clearTimeout(timer)
    }

    if (was && !now) {
      // スピナー終了 -> 通常表示に戻す (外部状態変化に伴う更新のため許容)
      setIsSpinnerOnly(false)
    }
  }, [shouldShowSpinner, displayType])

  // スピナーのみに切替時のフェードイン
  useEffect(() => {
    if (!isSpinnerOnly || displayType !== "on" || spinnerRef.current === null) {
      return
    }
    animate(spinnerRef.current, {
      opacity: [0, 1],
      duration: FADE_DURATION_MS,
      easing: EASING_EASE_OUT_QUAD
    })
  }, [isSpinnerOnly, displayType])

  return (
    <PushSqueezeButton className={styles.soundActionButton} onClick={handleClick}>
      {isSpinnerOnly ? (
        <span ref={spinnerRef} className={styles.loadingSpinner} />
      ) : (
        <>
          <span ref={iconRef} className={clsx(styles.icon, displayType === "off" && styles.Larger)}>
            {displayType === "on" ? <SoundOnIcon /> : <SoundOffIcon />}
          </span>
          <span ref={textRef} className={styles.text}>
            {displayType === "on" ? "Play" : "Mute"}
          </span>
        </>
      )}
    </PushSqueezeButton>
  )
}
