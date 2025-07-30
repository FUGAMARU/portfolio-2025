import { useState, useEffect } from "react"

import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"

/** App */
export const App = () => {
  const [isMuted, setIsMuted] = useState<boolean>()
  const [showWelcome, setShowWelcome] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (isMuted !== undefined && !isTransitioning) {
      // TODO: animejs使うようにする

      setIsTransitioning(true)

      setTimeout(() => {
        setShowWelcome(false)
        setIsTransitioning(false)
      }, 800)
    }
  }, [isMuted, isTransitioning])

  if (showWelcome) {
    return <WelcomeView isTransitioning={isTransitioning} setIsMuted={setIsMuted} />
  }

  return <MainView isMuted={isMuted ?? false} />
}
