import { useCallback, useReducer } from "react"

import type { SizeLocationInfo } from "@/types"

/** ウィンドウの位置 */
const WINDOW_POSITION = {
  /** 初期位置（左端） */
  INITIAL_LEFT: 100,
  /** 初期位置（上端） */
  INITIAL_TOP: 100,
  /** ウィンドウごとの位置オフセット */
  OFFSET_STEP: 50
} as const

/** 画面外配置チェック用の設定 */
const BOUNDARY_CHECK = {
  /** ウィンドウの想定幅（境界チェック用） */
  ASSUMED_WINDOW_WIDTH: 1000,
  /** ウィンドウの想定高（境界チェック用） */
  ASSUMED_WINDOW_HEIGHT: 400
} as const

/** 座標 */
type Coordinates = Pick<SizeLocationInfo, "x" | "y">

/** ウィンドウ状態 */
type WindowState = {
  /** ウィンドウID */
  id: string
  /** ウィンドウタイプ */
  type: "profile" | "work-detail" | "inspired-by"
  /** 現在のX位置（ドラッグ移動後） */
  currentX: number
  /** 現在のY位置（ドラッグ移動後） - ProfileWindowのみoptional */
  currentY: number | undefined
  /** z-index */
  zIndex: number
  /** 表示状態 */
  isVisible: boolean
  /** フルスクリーンかどうか */
  isFullScreen?: boolean
  /** 最大化前の位置とサイズ（最大化解除時に復元するため） */
  beforeMaximize?: SizeLocationInfo
}

/** ウィンドウアクション一覧 */
type WindowAction =
  | {
      /** ウィンドウを開く */
      type: "OPEN_WINDOW"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
        /** ウィンドウタイプ */
        windowType: "profile" | "work-detail" | "inspired-by"
        /** 初期位置 */
        initialPosition?: Coordinates
      }
    }
  | {
      /** ウィンドウを閉じる */
      type: "CLOSE_WINDOW"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
      }
    }
  | {
      /** ウィンドウを最小化 */
      type: "MINIMIZE_WINDOW"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
      }
    }
  | {
      /** ウィンドウの位置を更新 */
      type: "UPDATE_POSITION"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
      } & Coordinates
    }
  | {
      /** ウィンドウを最前面に移動 */
      type: "BRING_TO_FRONT"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
      }
    }
  | {
      /** フルスクリーン状態を切り替え */
      type: "TOGGLE_FULLSCREEN"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
        /** 最大化前のサイズと位置（最大化する時のみ） */
        beforeMaximize?: SizeLocationInfo
      }
    }
  | {
      /** 最大化前の状態をクリア */
      type: "CLEAR_BEFORE_MAXIMIZE"
      /** ペイロード */
      payload: {
        /** ウィンドウID */
        id: string
      }
    }

/**
 * 新しいウィンドウの位置を計算する
 *
 * @param state - 現在のウィンドウ状態配列
 * @param windowType - ウィンドウのタイプ
 * @param initialPosition - 初期位置
 * @returns 新しいウィンドウの位置
 */
const getNewWindowPosition = (
  state: Array<WindowState>,
  windowType: "profile" | "work-detail" | "inspired-by",
  initialPosition?: Coordinates
): Coordinates => {
  if (initialPosition !== undefined) {
    return initialPosition
  }

  if (windowType === "profile") {
    return { x: WINDOW_POSITION.INITIAL_LEFT, y: WINDOW_POSITION.INITIAL_TOP }
  }

  const visibleWindows = state.filter(window => window.isVisible)

  if (visibleWindows.length === 0) {
    return { x: WINDOW_POSITION.INITIAL_LEFT, y: WINDOW_POSITION.INITIAL_TOP }
  }

  const frontmostWindow = visibleWindows.reduce((topWindow, currentWindow) =>
    currentWindow.zIndex > topWindow.zIndex ? currentWindow : topWindow
  )

  if (frontmostWindow.currentY === undefined) {
    return { x: WINDOW_POSITION.INITIAL_LEFT, y: WINDOW_POSITION.INITIAL_TOP }
  }

  const newLeft = frontmostWindow.currentX + WINDOW_POSITION.OFFSET_STEP
  const newTop = frontmostWindow.currentY + WINDOW_POSITION.OFFSET_STEP

  // 画面外チェック
  const maxLeft = window.innerWidth - BOUNDARY_CHECK.ASSUMED_WINDOW_WIDTH
  const maxTop = window.innerHeight - BOUNDARY_CHECK.ASSUMED_WINDOW_HEIGHT

  if (newLeft > maxLeft || newTop > maxTop) {
    return { x: WINDOW_POSITION.INITIAL_LEFT, y: WINDOW_POSITION.INITIAL_TOP }
  }

  return { x: newLeft, y: newTop }
}

/** ウィンドウ状態のreducer */
const windowReducer = (state: Array<WindowState>, action: WindowAction): Array<WindowState> => {
  switch (action.type) {
    case "OPEN_WINDOW": {
      const { id, windowType, initialPosition } = action.payload

      // 既に開いているウィンドウがあるかチェック
      const existingWindow = state.find(window => window.id === id)

      if (existingWindow !== undefined) {
        // 既に開いている場合は最前面に移動
        const maxZIndex = Math.max(...state.map(w => w.zIndex))
        return state.map(window =>
          window.id === id ? { ...window, isVisible: true, zIndex: maxZIndex + 1 } : window
        )
      }

      // 新しいウィンドウの位置を決定
      const maxZIndex = state.length === 0 ? 1 : Math.max(...state.map(w => w.zIndex))
      const { x: newLeft, y: newTop } = getNewWindowPosition(state, windowType, initialPosition)

      const newWindow: WindowState = {
        id,
        type: windowType,
        currentX: newLeft,
        currentY: windowType === "profile" ? undefined : newTop,
        zIndex: maxZIndex + 1,
        isVisible: true,
        isFullScreen: false
      }

      return [...state, newWindow]
    }

    case "CLOSE_WINDOW":
      return state.filter(window => window.id !== action.payload.id)

    case "MINIMIZE_WINDOW":
      return state.map(window =>
        window.id === action.payload.id ? { ...window, isVisible: false } : window
      )

    case "UPDATE_POSITION": {
      const { id, x, y } = action.payload
      return state.map(window =>
        window.id === id ? { ...window, currentX: x, currentY: y } : window
      )
    }

    case "BRING_TO_FRONT": {
      const maxZIndex = Math.max(...state.map(w => w.zIndex))
      return state.map(window =>
        window.id === action.payload.id ? { ...window, zIndex: maxZIndex + 1 } : window
      )
    }

    case "TOGGLE_FULLSCREEN": {
      const { id, beforeMaximize } = action.payload
      const maxZIndex = state.length === 0 ? 0 : Math.max(...state.map(w => w.zIndex))
      return state.map(window => {
        if (window.id !== id) {
          return window
        }

        const isCurrentlyFullScreen = window.isFullScreen ?? false

        // 最大化する場合: 現在の状態を保存
        if (!isCurrentlyFullScreen && beforeMaximize !== undefined) {
          return {
            ...window,
            isFullScreen: true,
            beforeMaximize,
            zIndex: maxZIndex + 1
          }
        }

        // 最大化解除する場合: 保存された状態に復元
        if (isCurrentlyFullScreen && window.beforeMaximize !== undefined) {
          const restoredState = window.beforeMaximize
          return {
            ...window,
            isFullScreen: false,
            currentX: restoredState.x,
            currentY: restoredState.y,
            // beforeMaximizeを残したまま復元（WindowContainerで使用するため）
            beforeMaximize: restoredState
          }
        }

        // フォールバック: 単純にトグル
        const nextIsFullScreen = !isCurrentlyFullScreen
        return {
          ...window,
          isFullScreen: nextIsFullScreen,
          ...(nextIsFullScreen ? { zIndex: maxZIndex + 1 } : {})
        }
      })
    }

    case "CLEAR_BEFORE_MAXIMIZE":
      return state.map(window =>
        window.id === action.payload.id ? { ...window, beforeMaximize: undefined } : window
      )

    default:
      return state
  }
}

/** ウィンドウ管理用カスタムフック */
export const useWindowManager = (initialState: Array<WindowState> = []) => {
  const [windowManagerState, dispatch] = useReducer(windowReducer, initialState)

  /** 作品ボタンを押下した時の処理 */
  const handleWorkButtonClick = useCallback((workId: string) => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: workId,
        windowType: "work-detail"
      }
    })
  }, [])

  /** InspiredByウィジェット押下時の処理 */
  const handleInspiredByWidgetClick = useCallback(() => {
    dispatch({
      type: "OPEN_WINDOW",
      payload: {
        id: "inspired-by",
        windowType: "inspired-by"
      }
    })
  }, [])

  const windowActions = {
    close: useCallback((windowId: string) => {
      dispatch({ type: "CLOSE_WINDOW", payload: { id: windowId } })
    }, []),

    minimize: useCallback((windowId: string) => {
      dispatch({ type: "MINIMIZE_WINDOW", payload: { id: windowId } })
    }, []),

    maximize: useCallback((windowId: string, beforeMaximize?: SizeLocationInfo) => {
      dispatch({ type: "TOGGLE_FULLSCREEN", payload: { id: windowId, beforeMaximize } })
    }, []),

    updatePosition: useCallback((windowId: string, position: Coordinates) => {
      dispatch({
        type: "UPDATE_POSITION",
        payload: { id: windowId, x: position.x, y: position.y }
      })
    }, []),

    focus: useCallback((windowId: string) => {
      dispatch({ type: "BRING_TO_FRONT", payload: { id: windowId } })
    }, []),

    clearBeforeMaximize: useCallback((windowId: string) => {
      dispatch({ type: "CLEAR_BEFORE_MAXIMIZE", payload: { id: windowId } })
    }, [])
  }

  // ProfileWindowの状態
  const profileWindow = windowManagerState.find(window => window.id === "profile")

  /** 表示中のWorkDetailWindowsを取得 */
  const getVisibleWorkDetailWindows = useCallback(
    <
      T extends {
        /** id */
        id: string
      }
    >(
      worksData: Array<T>
    ) => {
      return windowManagerState
        .filter(window => window.type === "work-detail" && window.isVisible)
        .map(windowState => {
          const workData = worksData.find(work => work.id === windowState.id)
          return workData !== undefined ? { windowState, workData } : null
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    },
    [windowManagerState]
  )

  return {
    windowManagerState,
    profileWindow,
    handleWorkButtonClick,
    handleInspiredByWidgetClick,
    windowActions,
    getVisibleWorkDetailWindows
  }
}

export { WINDOW_POSITION, BOUNDARY_CHECK }
