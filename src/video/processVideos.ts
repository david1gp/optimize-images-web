import { dirExists } from "../shared/dirExists.js"
import { ensureVideoPreviews } from "./ensureVideoPreviews.js"
import type { ProcessVideosOptions } from "./ProcessVideosOptions.js"
import { processLocalVideos } from "./processLocalVideos.js"

export async function processVideos(options: ProcessVideosOptions): Promise<void> {
  const { cwd, logger, result, videoOptimizedDir, videoPreviewQuality, videoOriginalsDir } = options

  if (await dirExists(videoOriginalsDir)) {
    await processLocalVideos(videoOriginalsDir, videoOptimizedDir, cwd, result, logger)
  }

  await ensureVideoPreviews(videoOptimizedDir, videoPreviewQuality, cwd, result, logger)
}
