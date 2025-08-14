import { animate } from "animejs"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import styles from "@/components/parts/button/SoundActionButton/index.module.css"
import { SoundOffIcon } from "@/components/parts/button/SoundActionButton/SoundOffIcon"
import { SoundOnIcon } from "@/components/parts/button/SoundActionButton/SoundOnIcon"

import type { ComponentProps } from "react"

/** スピナー切替時のフェードアニメーションのDuration（ms） */
const FADE_DURATION_MS = 250
/** 上記フェードアニメーションで使用するイージング */
const EASING_EASE_OUT_QUAD = "easeOutQuad"
/** 押下時のスクイーズを最低限維持する時間（ミリ秒） */
const MIN_PRESSED_MS = 140

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
  const pressStartTimeRef = useRef<number>(0)
  const releaseTimerRef = useRef<number | null>(null)
  const [isPressed, setIsPressed] = useState<boolean>(false)

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
      // スピナー終了 -> 通常表示に戻す
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

  /** 押下開始（スクイーズ開始） */
  const handlePressStart = () => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current)
      releaseTimerRef.current = null
    }
    pressStartTimeRef.current = performance.now()
    setIsPressed(true)
  }

  /** 押下終了（最低表示時間を保証してスクイーズ解除） */
  const handlePressEnd = () => {
    const elapsed = performance.now() - pressStartTimeRef.current
    const remaining = Math.max(0, MIN_PRESSED_MS - elapsed)

    if (remaining <= 0) {
      setIsPressed(false)
      return
    }

    releaseTimerRef.current = window.setTimeout(() => {
      setIsPressed(false)
      releaseTimerRef.current = null
    }, remaining)
  }

  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (releaseTimerRef.current !== null) {
        window.clearTimeout(releaseTimerRef.current)
      }
    }
  }, [])

  return (
    <button
      className={clsx(styles.soundActionButton, isPressed && styles.Pressed)}
      onClick={handleClick}
      onPointerCancel={handlePressEnd}
      onPointerDown={handlePressStart}
      onPointerLeave={handlePressEnd}
      onPointerUp={handlePressEnd}
      type="button"
    >
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
