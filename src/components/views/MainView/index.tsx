import clsx from "clsx"

import styles from "@/components/views/MainView/index.module.css"
import { InspiredBy } from "@/components/widgets/InspiredByWidget"
import { LoadingStatusWidget } from "@/components/widgets/LoadingStatusWidget"
import { StarWidget } from "@/components/widgets/StarWidget"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"
import { InspiredByWindow } from "@/components/windows/InspiredByWindow"
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
  const {
    basicInfoWindow,
    handleWorkButtonClick,
    handleInspiredByWidgetClick,
    windowActions,
    getVisibleWorkDetailWindows,
    windowManagerState
  } = useWindowManager([
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
          beforeMaximize={basicInfoWindow.beforeMaximize}
          bottom={basicInfoWindow.currentY === undefined ? 48 : undefined}
          isFullScreen={basicInfoWindow.isFullScreen ?? false}
          left={basicInfoWindow.currentX}
          onClearBeforeMaximize={() => windowActions.clearBeforeMaximize("basic-info")}
          onClose={() => windowActions.close("basic-info")}
          onFocus={() => windowActions.focus("basic-info")}
          onMaximize={info => windowActions.maximize("basic-info", info)}
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

      <div className={styles.inspired}>
        <InspiredBy onClick={handleInspiredByWidgetClick} />
      </div>
      {shouldRenderWindows &&
        (() => {
          const win = windowManagerState.find(w => w.id === "inspired-by")
          if (win === undefined || !win.isVisible) {
            return null
          }
          return (
            <InspiredByWindow
              beforeMaximize={win.beforeMaximize}
              inspiredBy={portfolioData.inspiredBy}
              isFullScreen={win.isFullScreen ?? false}
              left={win.currentX}
              onClearBeforeMaximize={() => windowActions.clearBeforeMaximize("inspired-by")}
              onClose={() => windowActions.close("inspired-by")}
              onFocus={() => windowActions.focus("inspired-by")}
              onMaximize={info => windowActions.maximize("inspired-by", info)}
              onMinimize={() => windowActions.minimize("inspired-by")}
              onPositionChange={position => windowActions.updatePosition("inspired-by", position)}
              top={win.currentY ?? WINDOW_POSITION.INITIAL_TOP}
              zIndex={win.zIndex}
            />
          )
        })()}

      {shouldRenderWindows &&
        visibleWorkDetailWindows.map(({ windowState, workData }) => (
          <WorkDetailWindow
            key={windowState.id}
            beforeMaximize={windowState.beforeMaximize}
            isFullScreen={windowState.isFullScreen ?? false}
            left={windowState.currentX}
            onClearBeforeMaximize={() => windowActions.clearBeforeMaximize(workData.id)}
            onClose={() => windowActions.close(workData.id)}
            onFocus={() => windowActions.focus(workData.id)}
            onMaximize={info => windowActions.maximize(workData.id, info)}
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
