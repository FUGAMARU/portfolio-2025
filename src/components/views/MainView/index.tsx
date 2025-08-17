import clsx from "clsx"

import styles from "@/components/views/MainView/index.module.css"
import { LoadingStatusWidget } from "@/components/widgets/LoadingStatusWidget"
import { StarWidget } from "@/components/widgets/StarWidget"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"
import { PlayerWindow } from "@/components/windows/PlayerWindow"
import { WorkDetailWindow } from "@/components/windows/WorkDetailWindow"
import { useWindowManager, WINDOW_POSITION } from "@/hooks/useWindowManager"

import type { PortfolioData } from "@/hooks/useDataFetch"

/** Props */
type Props = {
  /** ポートフォリオのデータ */
  portfolioData?: PortfolioData
  /** Welcome表示中はウィンドウを描画しない */
  shouldRenderWindows?: boolean
  /** サーバの現在時刻(ISO) */
  currentServerTime?: string
  /** ミュートかどうか */
  isMuted?: boolean
}

/** メインビュー */
export const MainView = ({
  portfolioData,
  shouldRenderWindows = true,
  currentServerTime,
  isMuted = false
}: Props) => {
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

  const visibleWorkDetailWindows = getVisibleWorkDetailWindows(portfolioData?.works ?? [])

  if (portfolioData === undefined) {
    return null
  }

  return (
    <div className={styles.mainView}>
      {shouldRenderWindows && (
        <div className={clsx(styles.status, styles.AppearShown)}>
          <LoadingStatusWidget />
        </div>
      )}

      <div
        className={clsx(
          styles.star,
          shouldRenderWindows ? styles.AppearShown : styles.AppearHidden
        )}
      >
        <StarWidget currentServerTime={currentServerTime} />
      </div>

      {basicInfoWindow !== undefined && basicInfoWindow.isVisible && (
        <BasicInfoWindow
          basicInfo={portfolioData.basicInfo}
          bottom={basicInfoWindow.currentY === undefined ? 48 : undefined}
          isFullScreen={basicInfoWindow.isFullScreen ?? false}
          left={basicInfoWindow.currentX}
          onClose={() => windowActions.close("basic-info")}
          onFocus={() => windowActions.focus("basic-info")}
          onMaximize={() => windowActions.maximize("basic-info")}
          onMinimize={() => windowActions.minimize("basic-info")}
          onPositionChange={position => windowActions.updatePosition("basic-info", position)}
          shouldAppear={shouldRenderWindows}
          top={basicInfoWindow.currentY}
          zIndex={basicInfoWindow.zIndex}
        />
      )}

      <div className={styles.works}>
        <WorksWidget
          onWorkButtonClick={handleWorkButtonClick}
          shouldAppear={shouldRenderWindows}
          worksData={portfolioData.works}
        />
      </div>

      {shouldRenderWindows &&
        visibleWorkDetailWindows.map(({ windowState, workData }) => (
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
      {!isMuted && (
        <div
          className={clsx(
            styles.player,
            shouldRenderWindows ? styles.AppearShown : styles.AppearHidden
          )}
        >
          <PlayerWindow />
        </div>
      )}
    </div>
  )
}
