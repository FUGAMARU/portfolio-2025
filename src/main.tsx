import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "@/App"
import "destyle.css"
import "@fontsource/ibm-plex-sans-jp/400.css"
import "@fontsource/ibm-plex-sans-jp/500.css"
import "@/styles/globals.css"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
