import { useReducer } from "react"

import { WorkButton } from "@/components/parts/button/WorkButton"
import styles from "@/components/widgets/WorksWidget/index.module.css"
import { WorkDetailWindow } from "@/components/windows/WorkDetailWindow"

import type { ComponentProps } from "react"

/** ウィンドウの位置関連の定数 */
const WINDOW_POSITION = {
  /** 初期位置（左端） */
  INITIAL_LEFT: 100,
  /** 初期位置（上端） */
  INITIAL_TOP: 100,
  /** ウィンドウごとの位置オフセット */
  OFFSET_STEP: 50
} as const

/** ウィンドウ状態 */
type WindowState = {
  /** ウィンドウID */
  id: string
  /** 現在のX位置（ドラッグ移動後） */
  currentX: number
  /** 現在のY位置（ドラッグ移動後） */
  currentY: number
  /** z-index（レイヤー順） */
  zIndex: number
}

/** ウィンドウアクションの型定義 */
type WindowAction =
  | {
      /** ウィンドウを開く */
      type: "OPEN_WINDOW"
      /** ペイロード */
      payload: {
        /** 作品ID */
        workId: string
      }
    }
  | {
      /** ウィンドウを閉じる */
      type: "CLOSE_WINDOW"
      /** ペイロード */
      payload: {
        /** 作品ID */
        workId: string
      }
    }
  | {
      /** ウィンドウを最小化 */
      type: "MINIMIZE_WINDOW"
      /** ペイロード */
      payload: {
        /** 作品ID */
        workId: string
      }
    }
  | {
      /** ウィンドウの位置を更新 */
      type: "UPDATE_POSITION"
      /** ペイロード */
      payload: {
        /** 作品ID */
        workId: string
        /** X位置 */
        x: number
        /** Y位置 */
        y: number
      }
    }
  | {
      /** ウィンドウを最前面に移動 */
      type: "BRING_TO_FRONT"
      /** ペイロード */
      payload: {
        /** 作品ID */
        workId: string
      }
    }

/** ウィンドウ状態のreducer */
const windowReducer = (state: Array<WindowState>, action: WindowAction): Array<WindowState> => {
  switch (action.type) {
    case "OPEN_WINDOW": {
      const { workId } = action.payload

      // 既に開いているウィンドウがあるかチェック
      const existingWindow = state.find(window => window.id === workId)

      if (existingWindow !== undefined) {
        // 既に開いている場合は何もしない
        return state
      }

      // 新しいウィンドウの位置を決定（一番上にあるウィンドウの現在位置を基準に）
      const isFirstWindow = state.length === 0

      // 最大のz-indexを取得
      const maxZIndex = state.length === 0 ? 0 : Math.max(...state.map(w => w.zIndex))

      // 一番上にあるウィンドウを取得
      const topWindow = state.find(window => window.zIndex === maxZIndex)

      const newLeft = isFirstWindow
        ? WINDOW_POSITION.INITIAL_LEFT
        : (topWindow?.currentX ?? WINDOW_POSITION.INITIAL_LEFT) + WINDOW_POSITION.OFFSET_STEP
      const newTop = isFirstWindow
        ? WINDOW_POSITION.INITIAL_TOP
        : (topWindow?.currentY ?? WINDOW_POSITION.INITIAL_TOP) + WINDOW_POSITION.OFFSET_STEP

      const newWindow = {
        id: workId,
        currentX: newLeft,
        currentY: newTop,
        zIndex: maxZIndex + 1
      } satisfies WindowState

      return [...state, newWindow]
    }

    case "CLOSE_WINDOW":
    case "MINIMIZE_WINDOW": {
      const { workId } = action.payload
      return state.filter(window => window.id !== workId)
    }

    case "UPDATE_POSITION": {
      const { workId, x, y } = action.payload
      return state.map(window =>
        window.id === workId ? { ...window, currentX: x, currentY: y } : window
      )
    }

    case "BRING_TO_FRONT": {
      const { workId } = action.payload
      const maxZIndex = Math.max(...state.map(w => w.zIndex))
      return state.map(window =>
        window.id === workId ? { ...window, zIndex: maxZIndex + 1 } : window
      )
    }

    default:
      return state
  }
}

const DUMMY_WORKS = [
  {
    id: "project-1",
    buttonImage: "https://placehold.jp/150x150.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["React", "TypeScript", "CSS Modules"],
    description:
      "これはプロジェクト1の説明文です。プロジェクトの概要や使用技術、特徴などを記載します。React、TypeScript、CSS Modulesを使用したモダンなWebアプリケーションです。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project1" },
      { text: "デモサイト", href: "https://example.com/demo1" }
    ]
  },
  {
    id: "project-2",
    buttonImage: "https://placehold.jp/149x149.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Vue.js", "JavaScript", "SCSS"],
    description:
      "これはプロジェクト2の説明文です。Vue.jsを使用したレスポンシブなWebアプリケーションで、SCSSを使ったスタイリングが特徴です。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project2" },
      { text: "デモサイト", href: "https://example.com/demo2" }
    ]
  },
  {
    id: "project-3",
    buttonImage: "https://placehold.jp/148x148.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    description:
      "これはプロジェクト3の説明文です。Next.jsとTailwind CSSを使用したフルスタックアプリケーションです。SSRやSSGを活用したパフォーマンスの高いサイトです。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project3" },
      { text: "デモサイト", href: "https://example.com/demo3" }
    ]
  },
  {
    id: "project-4",
    buttonImage: "https://placehold.jp/147x147.png",
    previewImage: "https://placehold.jp/500x300.png",
    logoImage: "https://placehold.jp/150x70.png",
    tags: ["Python", "Django", "PostgreSQL"],
    description:
      "これはプロジェクト4の説明文です。DjangoとPostgreSQLを使用したWebアプリケーションです。RESTful APIの設計とデータベース設計に力を入れました。",
    referenceLinks: [
      { text: "GitHub", href: "https://github.com/example/project4" },
      { text: "API ドキュメント", href: "https://example.com/api-docs" }
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

/** 制作物一覧表示用ウィジェット */
export const WorksWidget = () => {
  const [windowManagerState, dispatch] = useReducer(windowReducer, [])

  /** 作品ボタンを押下した時の処理 */
  const handleButtonClick = (workId: string) => {
    dispatch({ type: "OPEN_WINDOW", payload: { workId } })
  }

  /** ウィンドウを閉じる処理 */
  const handleWindowClose = (workId: string) => {
    dispatch({ type: "CLOSE_WINDOW", payload: { workId } })
  }

  /** ウィンドウを最小化する処理 */
  const handleWindowMinimize = (workId: string) => {
    dispatch({ type: "MINIMIZE_WINDOW", payload: { workId } })
  }

  /** ウィンドウを最大化する処理 */
  const handleWindowMaximize = () => {
    // TODO: 最大化の処理を実装
  }

  /** ウィンドウの位置を更新する処理 */
  const handlePositionChange = (
    workId: string,
    position: {
      /** x */
      x: number
      /** y */
      y: number
    }
  ) => {
    dispatch({ type: "UPDATE_POSITION", payload: { workId, x: position.x, y: position.y } })
  }

  /** ウィンドウを最前面に持ってくる処理 */
  const handleWindowFocus = (workId: string) => {
    dispatch({ type: "BRING_TO_FRONT", payload: { workId } })
  }

  return (
    <div className={styles.worksWidget}>
      {DUMMY_WORKS.map(work => (
        <div key={work.id} className={styles.item}>
          <WorkButton onClick={() => handleButtonClick(work.id)} src={work.buttonImage} />
        </div>
      ))}

      <div className={styles.windows}>
        {windowManagerState.map(windowState => {
          const workData = DUMMY_WORKS.find(work => work.id === windowState.id)
          if (workData === undefined) {
            return null
          }

          return (
            <WorkDetailWindow
              key={windowState.id}
              description={workData.description}
              left={windowState.currentX}
              logoImage={workData.logoImage}
              onClose={() => handleWindowClose(workData.id)}
              onFocus={() => handleWindowFocus(workData.id)}
              onMaximize={handleWindowMaximize}
              onMinimize={() => handleWindowMinimize(workData.id)}
              onPositionChange={position => handlePositionChange(workData.id, position)}
              previewImage={workData.previewImage}
              referenceLinks={workData.referenceLinks}
              tags={workData.tags}
              top={windowState.currentY}
              zIndex={windowState.zIndex}
            />
          )
        })}
      </div>
    </div>
  )
}
