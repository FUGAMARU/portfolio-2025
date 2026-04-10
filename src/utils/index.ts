/**
 * @file 汎用関数群
 */

/**
 * リソースの相対パスからURLを生成する
 *
 * @param relativePath - 相対パス
 * @returns URL
 */
export const getResourceUrl = (relativePath: string): string => {
  const processEnvApiOrigin = (
    (globalThis as Record<string, unknown>).process as
      | Record<"env", Record<string, string | undefined>>
      | undefined
  )?.env.VITE_API_ORIGIN
  const apiOrigin = processEnvApiOrigin ?? import.meta.env.VITE_API_ORIGIN
  return new URL(relativePath, apiOrigin).href
}
