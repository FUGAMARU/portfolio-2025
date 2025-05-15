import styles from "@/components/views/MainView/index.module.css"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"

/** メインビュー */
export const MainView = () => {
  return (
    <div className={styles.mainView}>
      <div className={styles.basicInfo}>
        <BasicInfoWindow />
      </div>
    </div>
  )
}
