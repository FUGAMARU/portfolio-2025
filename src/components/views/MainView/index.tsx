import styles from "@/components/views/MainView/index.module.css"
import { LoadingStatusWidget } from "@/components/widgets/LoadingStatusWidget"
import { StarWidget } from "@/components/widgets/StarWidget"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"
import { PlayerWindow } from "@/components/windows/PlayerWindow"

/** メインビュー */
export const MainView = () => {
  return (
    <div className={styles.mainView}>
      <div className={styles.status}>
        <LoadingStatusWidget />
      </div>

      <div className={styles.star}>
        <StarWidget />
      </div>

      <div className={styles.basicinfo}>
        <BasicInfoWindow />
      </div>

      <div className={styles.works}>
        <WorksWidget />
      </div>

      <div className={styles.player}>
        <PlayerWindow />
      </div>
    </div>
  )
}
