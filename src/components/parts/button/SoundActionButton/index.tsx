import { animate } from "animejs"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import styles from "@/components/parts/button/SoundActionButton/index.module.css"
import { SoundOffIcon } from "@/components/parts/button/SoundActionButton/SoundOffIcon"
import { SoundOnIcon } from "@/components/parts/button/SoundActionButton/SoundOnIcon"

import type { ComponentProps } from "react"

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
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const spinnerRef = useRef<HTMLSpanElement | null>(null)

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
        animate(textRef.current, { opacity: [1, 0], duration: 250, easing: "easeOutQuad" })
      }
      if (iconRef.current !== null) {
        animate(iconRef.current, { opacity: [1, 0], duration: 250, easing: "easeOutQuad" })
      }

      const timer = window.setTimeout(() => {
        setIsSpinnerOnly(true)
      }, 250)

      return () => window.clearTimeout(timer)
    }

    if (was && !now) {
      // スピナー終了 -> 通常表示に戻す
      setIsSpinnerOnly(false)
    }
  }, [shouldShowSpinner, displayType])

  // スピナーのみに切替時のフェードイン
  useEffect(() => {
    if (!isSpinnerOnly || displayType !== "on" || spinnerRef.current === null) {
      return
    }
    animate(spinnerRef.current, { opacity: [0, 1], duration: 250, easing: "easeOutQuad" })
  }, [isSpinnerOnly, displayType])

  return (
    <button className={styles.soundActionButton} onClick={handleClick} type="button">
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
    </button>
  )
}
