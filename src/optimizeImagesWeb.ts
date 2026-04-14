import fs from "node:fs/promises"
import path from "node:path"
import { buildExpectedImages } from "./buildExpectedImages.js"
import { getProjectName } from "./getProjectName.js"
import { listLocalFiles } from "./listLocalFiles.js"
import { listRemoteFiles } from "./listRemoteFiles.js"
import type { OptimizeImagesWebOptions } from "./OptimizeImagesWebOptions.js"
import type { OptimizeImagesWebResult } from "./OptimizeImagesWebResult.js"
import { printSummary } from "./printSummary.js"
import { runRclone } from "./runRclone.js"

export async function optimizeImagesWeb(options: OptimizeImagesWebOptions = {}): Promise<OptimizeImagesWebResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const projectName = options.projectName ?? (await getProjectName(cwd))
  const originalsDir = path.resolve(cwd, options.originalsDir ?? "public-image-versions")
  const optimizedDir = path.resolve(cwd, options.optimizedDir ?? "public-images")
  const rcloneRemote = options.rcloneRemote ?? "leo"
  const remoteBase = `${rcloneRemote}:${projectName}`
  const remoteOriginals = `${remoteBase}/${options.remoteOriginalsDir ?? "original"}`
  const remoteOptimized = `${remoteBase}/${options.remoteOptimizedDir ?? "optimized"}`
  const cacheControlHeader = options.cacheControlHeader ?? "public,max-age=31536000,immutable"

  const result: OptimizeImagesWebResult = {
    processed: [],
    skippedExisting: [],
    skippedRootFiles: [],
    warnings: [],
    deletedLocal: [],
    uploadedRemote: [],
    deletedRemote: [],
  }

  await fs.mkdir(originalsDir, { recursive: true })
  await fs.mkdir(optimizedDir, { recursive: true })

  await runRclone(["mkdir", remoteOriginals], cwd)
  await runRclone(["mkdir", remoteOptimized], cwd)
  await runRclone(["copy", remoteOriginals, originalsDir], cwd)
  await runRclone(["copy", originalsDir, remoteOriginals], cwd)

  const expectedImages = await buildExpectedImages(originalsDir, optimizedDir, result)
  const expectedFileNames = new Set(expectedImages.map((image) => image.fileName))

  const localOptimizedFiles = await listLocalFiles(optimizedDir)
  for (const localFile of localOptimizedFiles) {
    const relativeFile = path.relative(optimizedDir, localFile)
    if (!expectedFileNames.has(relativeFile) && !relativeFile.startsWith(".")) {
      await fs.rm(localFile, { force: true })
      result.deletedLocal.push(relativeFile)
    }
  }

  const remoteOptimizedFiles = new Set(await listRemoteFiles(remoteOptimized, cwd))
  for (const image of expectedImages) {
    if (!remoteOptimizedFiles.has(image.fileName)) {
      await runRclone(
        [
          "copyto",
          "--header-upload",
          `Cache-Control: ${cacheControlHeader}`,
          image.localPath,
          `${remoteOptimized}/${image.fileName}`,
        ],
        cwd,
      )
      result.uploadedRemote.push(image.fileName)
    }
  }

  for (const remoteFile of remoteOptimizedFiles) {
    if (!expectedFileNames.has(remoteFile)) {
      await runRclone(["deletefile", `${remoteOptimized}/${remoteFile}`], cwd)
      result.deletedRemote.push(remoteFile)
    }
  }

  printSummary(result)
  return result
}
