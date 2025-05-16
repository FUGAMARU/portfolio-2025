import { WorkButton } from "@/components/parts/button/WorkButton"
import styles from "@/components/widgets/WorksWidget/index.module.css"

const DUMMY_WORKS = [
  "https://placehold.jp/150x150.png",
  "https://placehold.jp/149x149.png",
  "https://placehold.jp/148x148.png",
  "https://placehold.jp/147x147.png",
  "https://placehold.jp/146x146.png"
]

/** 制作物一覧表示用ウィジェット */
export const WorksWidget = () => {
  /** 作品ボタンを押下した時の処理 */
  const handleButtonClick = () => {
    console.log("Button clicked")
  }

  return (
    <div className={styles.worksWidget}>
      {DUMMY_WORKS.map(src => (
        <div key={src} className={styles.item}>
          <WorkButton onClick={handleButtonClick} src={src} />
        </div>
      ))}
    </div>
  )
}
