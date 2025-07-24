import { useState } from "react"

import { MainView } from "@/components/views/MainView"
import { WelcomeView } from "@/components/views/WelcomeView"

/** App */
export const App = () => {
  const [isMuted, setIsMuted] = useState<boolean>()

  if (isMuted === undefined) {
    return <WelcomeView setIsMuted={setIsMuted} />
  }

  return <MainView isMuted={isMuted} />
}
