import { useState } from "react"

import { WorkButton } from "@/components/parts/button/WorkButton"
import styles from "@/components/widgets/WorksWidget/index.module.css"
import { WorkDetailWindow } from "@/components/windows/WorkDetailWindow"

const DUMMY_WORKS = [
  "https://placehold.jp/150x150.png",
  "https://placehold.jp/149x149.png",
  "https://placehold.jp/148x148.png",
  "https://placehold.jp/147x147.png",
  "https://placehold.jp/146x146.png"
]

/** 制作物一覧表示用ウィジェット */
export const WorksWidget = () => {
  const [isWindowOpen, setIsWindowOpen] = useState(false) // TODO: 仮あて

  /** 作品ボタンを押下した時の処理 */
  const handleButtonClick = () => {
    setIsWindowOpen(true)
  }

  return (
    <div className={styles.worksWidget}>
      {DUMMY_WORKS.map(src => (
        <div key={src} className={styles.item}>
          <WorkButton onClick={handleButtonClick} src={src} />
        </div>
      ))}

      <div className={styles.windows}>
        {/* TODO: 仮あて */}
        <WorkDetailWindow
          description="これはサンプルプロジェクトの説明文です。プロジェクトの概要や使用技術、特徴などを記載します。これはサンプルプロジェクトの説明文です。プロジェクトの概要や使用技術、特徴などを記載します。これはサンプルプロジェクトの説明文です。プロジェクトの概要や使用技術、特徴などを記載します。これはサンプルプロジェクトの説明文です。プロジェクトの概要や使用技術、特徴などを記載します。"
          isOpen={isWindowOpen}
          left={100}
          logoImage="https://placehold.jp/150x70.png"
          onClose={() => setIsWindowOpen(false)}
          onMaximize={() => {}}
          onMinimize={() => setIsWindowOpen(false)}
          previewImage="https://placehold.jp/500x300.png"
          referenceLinks={[
            { text: "GitHub", href: "https://github.com/example/project" },
            { text: "デモサイト", href: "https://example.com/demo" }
          ]}
          tags={["React", "TypeScript", "CSS Modules"]}
          top={100}
        />
      </div>
    </div>
  )
}
