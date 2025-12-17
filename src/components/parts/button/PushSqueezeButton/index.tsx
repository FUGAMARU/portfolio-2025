import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import styles from "@/components/parts/button/PushSqueezeButton/index.module.css"

import type { ComponentProps, ReactNode } from "react"

/** 最低押下維持時間(ms) */
const MIN_PRESSED_MS = 150

/** Props */
export type Props = Pick<ComponentProps<"button">, "onClick" | "disabled" | "className"> & {
  /** 子要素 */
  children: ReactNode
}

/** 押下した時にスクイーズするボタン */
export const PushSqueezeButton = ({ onClick, disabled = false, className, children }: Props) => {
  const [isPressed, setIsPressed] = useState(false)
  const pressStartTimeRef = useRef(0)
  const releaseTimerRef = useRef<number>(null)

  /** 押下開始 */
  const handlePressStart = () => {
    if (disabled) {
      return
    }

    if (releaseTimerRef.current !== null) {
      clearTimeout(releaseTimerRef.current)
      releaseTimerRef.current = null
    }

    pressStartTimeRef.current = performance.now()
    setIsPressed(true)
  }

  /** 押下終了 */
  const handlePressEnd = () => {
    if (!isPressed) {
      return
    }

    const elapsed = performance.now() - pressStartTimeRef.current
    const remaining = Math.max(0, MIN_PRESSED_MS - elapsed)
    if (remaining <= 0) {
      setIsPressed(false)
      return
    }

    releaseTimerRef.current = setTimeout(() => {
      setIsPressed(false)
      releaseTimerRef.current = null
    }, remaining)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (releaseTimerRef.current === null) {
        return
      }

      clearTimeout(releaseTimerRef.current)
    }
  }, [])

  return (
    <button
      className={clsx(styles.pushSqueezeButton, className)}
      data-pressed={isPressed ? "true" : "false"}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onPointerCancel={handlePressEnd}
      onPointerDown={handlePressStart}
      onPointerLeave={handlePressEnd}
      onPointerUp={handlePressEnd}
      onTouchEnd={handlePressEnd}
      onTouchStart={handlePressStart}
      type="button"
    >
      {children}
    </button>
  )
}
