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
  const apiOrigin = process.env.VITE_API_ORIGIN ?? import.meta.env.VITE_API_ORIGIN
  return new URL(relativePath, apiOrigin).href
}
