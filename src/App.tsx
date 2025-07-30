import { animate } from "animejs"
import { useState, useEffect, useRef } from "react"

import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"

/** App */
export const App = () => {
  const [isMuted, setIsMuted] = useState<boolean>()
  const [showWelcome, setShowWelcome] = useState(true)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // WelcomeViewのフェードアウトアニメーション
  useEffect(() => {
    if (isMuted === undefined || welcomeRef.current === null) {
      return
    }

    animate(welcomeRef.current, {
      opacity: [1, 0],
      duration: 800,
      /** アニメーション完了時の処理 */
      onComplete: () => {
        setShowWelcome(false)
      }
    })
  }, [isMuted])

  // MainViewのフェードインアニメーション
  useEffect(() => {
    if (showWelcome || mainRef.current === null) {
      return
    }

    animate(mainRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    })
  }, [showWelcome])

  if (showWelcome) {
    return (
      <div ref={welcomeRef} style={{ opacity: 1 }}>
        <WelcomeView setIsMuted={setIsMuted} />
      </div>
    )
  }

  return (
    <div ref={mainRef} style={{ opacity: 0, transform: "translateY(20px)" }}>
      <MainView isMuted={isMuted ?? false} />
    </div>
  )
}
