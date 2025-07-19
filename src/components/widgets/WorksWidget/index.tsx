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
  /** 左端位置 */
  left: number
  /** 上端位置 */
  top: number
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

      // 新しいウィンドウの位置を決定（宣言的に）
      const isFirstWindow = state.length === 0
      const lastWindow = state[state.length - 1]

      const newWindow = {
        id: workId,
        left: isFirstWindow
          ? WINDOW_POSITION.INITIAL_LEFT
          : lastWindow.left + WINDOW_POSITION.OFFSET_STEP,
        top: isFirstWindow
          ? WINDOW_POSITION.INITIAL_TOP
          : lastWindow.top + WINDOW_POSITION.OFFSET_STEP
      } satisfies WindowState

      return [...state, newWindow]
    }

    case "CLOSE_WINDOW":
    case "MINIMIZE_WINDOW": {
      const { workId } = action.payload
      return state.filter(window => window.id !== workId)
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
              left={windowState.left}
              logoImage={workData.logoImage}
              onClose={() => handleWindowClose(workData.id)}
              onMaximize={handleWindowMaximize}
              onMinimize={() => handleWindowMinimize(workData.id)}
              previewImage={workData.previewImage}
              referenceLinks={workData.referenceLinks}
              tags={workData.tags}
              top={windowState.top}
            />
          )
        })}
      </div>
    </div>
  )
}
