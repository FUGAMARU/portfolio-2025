import { useEffect, useState } from "react"
import { Cursor, useTypewriter } from "react-simple-typewriter"

import { CheckMarkIcon } from "@/components/widgets/LoadingStatusWidget/CheckMarkIcon"
import styles from "@/components/widgets/LoadingStatusWidget/index.module.css"

const FULL_TEXT = "All content loaded successfully"

/** ローディングステータスウィジェット */
export const LoadingStatusWidget = () => {
  const [hasCompletedTyping, setHasCompletedTyping] = useState(false)

  const [typedText] = useTypewriter({
    delaySpeed: 1500,
    deleteSpeed: 50,
    loop: 1,
    typeSpeed: 40,
    words: [FULL_TEXT]
  })

  // 完了後はテキストを固定表示
  const displayText = hasCompletedTyping ? FULL_TEXT : typedText

  useEffect(() => {
    if (hasCompletedTyping || typedText !== FULL_TEXT) {
      return
    }

    setHasCompletedTyping(true)
  }, [typedText, hasCompletedTyping])

  return (
    <div className={styles.loadingStatusWidget}>
      <span className={styles.text}>
        {displayText} {hasCompletedTyping ? null : <Cursor cursorStyle="|" />}
      </span>
      <span className={styles.icon}>
        <CheckMarkIcon />
      </span>
    </div>
  )
}
