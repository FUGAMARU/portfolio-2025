import styles from "@/components/views/MainView/index.module.css"
import { useDataFetch } from "@/components/views/MainView/useDataFetch"
import { useWindowManager, WINDOW_POSITION } from "@/components/views/MainView/useWindowManager"
import { LoadingStatusWidget } from "@/components/widgets/LoadingStatusWidget"
import { StarWidget } from "@/components/widgets/StarWidget"
import { WorksWidget } from "@/components/widgets/WorksWidget"
import { BasicInfoWindow } from "@/components/windows/BasicInfoWindow"
import { PlayerWindow } from "@/components/windows/PlayerWindow"
import { WorkDetailWindow } from "@/components/windows/WorkDetailWindow"

import type { ComponentProps } from "react"

const DUMMY_WORKS = [
  {
    id: "project-1",
    buttonImage: "https://placehold.jp/146x146.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["React", "TypeScript", "Vite"],
    description:
      "これはプロジェクト1の説明文です。ReactとTypeScriptを使用したWebアプリケーションです。モダンな開発環境を構築し、効率的な開発を実現しています。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project1" },
      { text: "Live Demo", href: "https://example.com/project1" }
    ]
  },
  {
    id: "project-2",
    buttonImage: "https://placehold.jp/146x146.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Next.js", "Tailwind CSS", "Vercel"],
    description:
      "これはプロジェクト2の説明文です。Next.jsとTailwind CSSを使用したWebサイトです。サーバーサイドレンダリングとスタティック生成を活用しています。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project2" },
      { text: "Vercel", href: "https://vercel.com/example/project2" }
    ]
  },
  {
    id: "project-3",
    buttonImage: "https://placehold.jp/146x146.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Vue.js", "Nuxt.js", "Vuetify"],
    description:
      "これはプロジェクト3の説明文です。Vue.jsとNuxt.jsを使用したSPAです。Vuetifyを使用してマテリアルデザインを実装しています。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project3" },
      { text: "Netlify", href: "https://netlify.com/example/project3" }
    ]
  },
  {
    id: "project-4",
    buttonImage: "https://placehold.jp/146x146.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Angular", "RxJS", "Material UI"],
    description:
      "これはプロジェクト4の説明文です。AngularとRxJSを使用したエンタープライズ向けWebアプリケーションです。リアクティブプログラミングを活用しています。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project4" },
      { text: "Azure", href: "https://azure.com/example/project4" }
    ]
  },
  {
    id: "project-5",
    buttonImage: "https://placehold.jp/146x146.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["React Native", "TypeScript", "Firebase"],
    description:
      "これはプロジェクト5の説明文です。React NativeとFirebaseを使用したモバイルアプリケーションです。リアルタイム通信とプッシュ通知機能を実装しています。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project5" },
      { text: "App Store", href: "https://apps.apple.com/app/example" }
    ]
  }
] as const satisfies Array<
  {
    /** 作品ID */
    id: string
    /** ボタン表示用の画像 */
    buttonImage: string
  } & Pick<
    ComponentProps<typeof WorkDetailWindow>,
    "previewImage" | "logoImage" | "tags" | "description" | "referenceLinks"
  >
>

/** メインビュー */
export const MainView = () => {
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

  const visibleWorkDetailWindows = getVisibleWorkDetailWindows(DUMMY_WORKS)

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
        <WorksWidget onWorkButtonClick={handleWorkButtonClick} worksData={DUMMY_WORKS} />
      </div>

      {visibleWorkDetailWindows.map(({ windowState, workData }) => (
        <WorkDetailWindow
          key={windowState.id}
          description={workData.description}
          left={windowState.currentX}
          logoImage={workData.logoImage}
          onClose={() => windowActions.close(workData.id)}
          onFocus={() => windowActions.focus(workData.id)}
          onMaximize={() => windowActions.maximize(workData.id)}
          onMinimize={() => windowActions.minimize(workData.id)}
          onPositionChange={position => windowActions.updatePosition(workData.id, position)}
          previewImage={workData.previewImage}
          referenceLinks={workData.referenceLinks}
          tags={workData.tags}
          top={windowState.currentY ?? WINDOW_POSITION.INITIAL_TOP}
          zIndex={windowState.zIndex}
        />
      ))}

      {/** プレイヤーの方が上のレイヤーにある */}
      <div className={styles.player}>
        <PlayerWindow />
      </div>
    </div>
  )
}
