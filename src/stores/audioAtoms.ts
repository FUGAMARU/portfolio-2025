import { atom } from "jotai"

import type { ApiResponse } from "@/hooks/useDataFetch"

export const audioAtom = atom<ApiResponse["bgm"][number]>()
