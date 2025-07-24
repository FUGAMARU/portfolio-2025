import styles from "@/components/views/MainView/index.module.css"
import { useDataFetch } from "@/components/views/MainView/useDataFetch"
import { useWindowManager, WINDOW_POSITION } from "@/components/views/MainView/useWindowManager"
import { LoadingStatusWidget } from "@/components/widgets/LoadingStatusWidget"
import { StarWidget } from "@/components/widgets/StarWidget"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"
import { PlayerWindow } from "@/components/windows/PlayerWindow"
import { WorkDetailWindow } from "@/components/windows/WorkDetailWindow"

/** Props */
type Props = {
  /** ミュートしているかどうか */
  isMuted: boolean
}

/** メインビュー */
export const MainView = ({ isMuted }: Props) => {
  console.log(isMuted)

  const { data } = useDataFetch()

  const { basicInfoWindow, handleWorkButtonClick, windowActions, getVisibleWorkDetailWindows } =
    useWindowManager([
      // BasicInfoWindowを初期状態で開いておく
      {
        id: "basic-info",
        type: "basic-info",
        currentX: 48,
        currentY: undefined, // bottomで位置指定するためundefinedにする
        zIndex: 1,
        isVisible: true,
        isFullScreen: false
      }
    ])

  const visibleWorkDetailWindows = getVisibleWorkDetailWindows(data?.works ?? [])

  if (data === undefined) {
    return null
  }

  return (
    <div className={styles.mainView}>
      <div className={styles.status}>
        <LoadingStatusWidget />
      </div>

      <div className={styles.star}>
        <StarWidget />
      </div>

      {basicInfoWindow !== undefined && basicInfoWindow.isVisible && (
        <BasicInfoWindow
          basicInfo={data.basicInfo}
          bottom={basicInfoWindow.currentY === undefined ? 48 : undefined}
          isFullScreen={basicInfoWindow.isFullScreen ?? false}
          left={basicInfoWindow.currentX}
          onClose={() => windowActions.close("basic-info")}
          onFocus={() => windowActions.focus("basic-info")}
          onMaximize={() => windowActions.maximize("basic-info")}
          onMinimize={() => windowActions.minimize("basic-info")}
          onPositionChange={position => windowActions.updatePosition("basic-info", position)}
          top={basicInfoWindow.currentY}
          zIndex={basicInfoWindow.zIndex}
        />
      )}

      <div className={styles.works}>
        <WorksWidget onWorkButtonClick={handleWorkButtonClick} worksData={data.works} />
      </div>

      {visibleWorkDetailWindows.map(({ windowState, workData }) => (
        <WorkDetailWindow
          key={windowState.id}
          left={windowState.currentX}
          onClose={() => windowActions.close(workData.id)}
          onFocus={() => windowActions.focus(workData.id)}
          onMaximize={() => windowActions.maximize(workData.id)}
          onMinimize={() => windowActions.minimize(workData.id)}
          onPositionChange={position => windowActions.updatePosition(workData.id, position)}
          top={windowState.currentY ?? WINDOW_POSITION.INITIAL_TOP}
          zIndex={windowState.zIndex}
          {...workData}
        />
      ))}

      {/** プレイヤーの方が上のレイヤーにある */}
      <div className={styles.player}>
        <PlayerWindow />
      </div>
    </div>
  )
}
