import { useEffect, useState } from "react"
import { Cursor, useTypewriter } from "react-simple-typewriter"

import { CheckMarkIcon } from "@/components/widgets/LoadingStatusWidget/CheckMarkIcon"
import styles from "@/components/widgets/LoadingStatusWidget/index.module.css"

const FULL_TEXT = "All content loaded successfully"

/**
 * タイピングアニメーションを行うコンポーネント
 * 表示タイミングを少し遅らせたいので子コンポに切り出してマウントタイミングをコントロールしている
 */
const TypingText = ({
  onTypingAnimationComplete
}: {
  /** タイピングアニメーション完了時の処理 */
  onTypingAnimationComplete: () => void
}) => {
  const [typedText] = useTypewriter({
    typeSpeed: 40,
    words: [FULL_TEXT]
  })

  const hasCompletedTyping = typedText === FULL_TEXT

  useEffect(() => {
    if (hasCompletedTyping) {
      onTypingAnimationComplete?.()
    }
  }, [hasCompletedTyping, onTypingAnimationComplete])

  if (hasCompletedTyping) {
    return <>{FULL_TEXT}</>
  }

  return (
    <>
      {typedText} <Cursor cursorStyle="|" />
    </>
  )
}

/** ローディングステータスウィジェット */
export const LoadingStatusWidget = () => {
  const [isReadyToStart, setIsReadyToStart] = useState(false)
  const [isTypingCompleted, setIsTypingCompleted] = useState(false)

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsReadyToStart(true), 500)
    return () => window.clearTimeout(timerId)
  }, [])

  return (
    <div className={styles.loadingStatusWidget}>
      <span className={styles.text}>
        {isReadyToStart ? (
          <TypingText onTypingAnimationComplete={() => setIsTypingCompleted(true)} />
        ) : null}
      </span>
      {isTypingCompleted && (
        <span className={styles.icon}>
          <CheckMarkIcon />
        </span>
      )}
    </div>
  )
}
