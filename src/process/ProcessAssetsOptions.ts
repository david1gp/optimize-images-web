import type { AssetsOptimizeOptions } from "../AssetsOptimizeOptions.js"

export interface ProcessAssetsOptions extends AssetsOptimizeOptions {
  remoteSource: string
  remoteDestination: string
  remoteSourcePrefix?: string
  remoteDestinationPrefix?: string
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
  sourceImagesFolder?: string
  sourceVideosFolder?: string
  destImagesFolder?: string
  destVideosFolder?: string
  imageCacheControl?: string
  videoCacheControl?: string
}