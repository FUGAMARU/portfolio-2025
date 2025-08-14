import { useEffect, useState } from "react"
import { Cursor, useTypewriter } from "react-simple-typewriter"

import { CheckMarkIcon } from "@/components/widgets/LoadingStatusWidget/CheckMarkIcon"
import styles from "@/components/widgets/LoadingStatusWidget/index.module.css"

const FULL_TEXT = "All content loaded successfully"

/**
 * タイピングアニメーションを行うコンポーネント
 * 表示タイミングを少し遅らせたいので子コンポに切り出してマウントタイミングをコントロールしている
 */
const TypingText = () => {
  const [typedText] = useTypewriter({
    typeSpeed: 40,
    words: [FULL_TEXT]
  })

  const hasCompletedTyping = typedText === FULL_TEXT

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

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsReadyToStart(true), 500)

    return () => window.clearTimeout(timerId)
  }, [])

  return (
    <div className={styles.loadingStatusWidget}>
      <span className={styles.text}>{isReadyToStart ? <TypingText /> : null}</span>
      <span className={styles.icon}>
        <CheckMarkIcon />
      </span>
    </div>
  )
}
