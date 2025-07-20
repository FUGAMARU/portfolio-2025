import { WorkButton } from "@/components/parts/button/WorkButton"
import styles from "@/components/widgets/WorksWidget/index.module.css"

/** Props */
type Props = {
  /** 作品ボタンを押下したときの処理 */
  onWorkButtonClick: (workId: string) => void
  /** 作品データ */
  worksData: Array<{
    /** 作品ID */
    id: string
    /** ボタン表示用の画像 */
    buttonImage: string
  }>
}

/** 制作物一覧表示用ウィジェット */
export const WorksWidget = ({ onWorkButtonClick: handleWorkButtonClick, worksData }: Props) => {
  return (
    <div className={styles.worksWidget}>
      {worksData.map(work => (
        <div key={work.id} className={styles.item}>
          <WorkButton onClick={() => handleWorkButtonClick(work.id)} src={work.buttonImage} />
        </div>
      ))}
    </div>
  )
}
