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
  return new URL(relativePath, import.meta.env.VITE_API_ORIGIN).href
}
