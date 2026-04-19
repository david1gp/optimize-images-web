import type { AssetsOptimizeOptions } from "../AssetsOptimizeOptions.js"

export interface ProcessAssetsOptions extends AssetsOptimizeOptions {
  sourceImagesRemotePath: string
  sourceVideosRemotePath: string
  destImagesRemotePath: string
  destVideosRemotePath: string
  cwd?: string
  resync?: boolean
  processImages?: boolean
  processVideos?: boolean
  imageOriginalsDir?: string
  imageOptimizedDir?: string
  videoOriginalsDir?: string
  videoOptimizedDir?: string
  imageListOutputPath?: string
  videoListOutputPath?: string
  assetsOptimizeLocallyFn?: () => Promise<void>
  imageCacheControl?: string
  videoCacheControl?: string
}