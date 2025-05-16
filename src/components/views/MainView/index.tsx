import styles from "@/components/views/MainView/index.module.css"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"

/** メインビュー */
export const MainView = () => {
  return (
    <div className={styles.mainView}>
      <div className={styles.basicinfo}>
        <BasicInfoWindow />
      </div>

      <div className={styles.works}>
        <WorksWidget />
      </div>
    </div>
  )
}
