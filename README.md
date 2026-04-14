# optimize-images-web

Process, hash, sync, and clean image assets for web projects that keep originals outside git and use R2 as the canonical store.

This package is built for a workflow with two local directories:

- `public-image-versions`: original source images, never modified
- `public-images`: generated optimized images, flat output only

It is designed for projects where:

- originals live in R2 and are synced locally
- optimized outputs should be deterministic and aggressively cacheable
- output filenames should change when either the source file or the transform changes
- old optimized files should be removed locally and remotely
- a separate image-list generator should preserve existing alt text

## What It Does

`optimizeImagesWeb()` performs the full asset pipeline:

1. Resolves the project name from `package.json.name`
2. Uses that as the bucket base path on your `rclone` remote
3. Syncs originals between R2 and `public-image-versions`
4. Scans transform folders like `1920x1080_jpg`
5. Processes matching source files with `sharp`
6. Writes flat optimized files into `public-images`
7. Names files as `<basename>_<hash>.<ext>`
8. Skips already-generated files
9. Deletes stale optimized files locally
10. Uploads missing optimized files to R2 with cache headers
11. Deletes stale optimized files from R2
12. Prints a clear summary of what changed

The hash is derived from:

- source file bytes
- normalized transform spec

That means cache keys change when the source image changes or when you change the folder rule, even if the output filename format stays short.

## Folder Convention

Original files belong in transform folders inside `public-image-versions`.

Example:

```text
public-image-versions/
  1920x1080_jpg/
    kitchen.jpg
    living-room.png
  1200x1200_webp/
    kitchen.jpg
```

This produces flat optimized output like:

```text
public-images/
  kitchen_a1b2c3d4.jpg
  living-room_9f8e7d6c.jpg
  kitchen_7c6b5a4d.webp
```

Root-level files directly inside `public-image-versions` are intentionally skipped and warned on every run.

## Transform Folder Format

Folder names must use:

```text
<width>x<height>_<format>
```

Supported formats:

- `jpg`
- `png`
- `webp`
- `avif`

Examples:

- `1920x1080_jpg`
- `1600x900_webp`
- `800x800_avif`

Processing behavior:

- resize fit: `inside`
- `withoutEnlargement: true`
- image auto-rotation is applied
- default quality is `80`

## Defaults

If you call `optimizeImagesWeb()` with no arguments, it uses:

- `cwd`: `process.cwd()`
- `projectName`: `package.json.name`
- `originalsDir`: `./public-image-versions`
- `optimizedDir`: `./public-images`
- `rcloneRemote`: `leo`
- `remoteOriginalsDir`: `original`
- `remoteOptimizedDir`: `optimized`
- `cacheControlHeader`: `public,max-age=31536000,immutable`

So for a project named `moramontage`, the remote paths become:

- `leo:moramontage/original`
- `leo:moramontage/optimized`

## Installation

```bash
bun add @adaptive-ds/optimize-images-web
```

If you also generate a typed image list afterward, install that separately in the consuming app:

```bash
bun add -d @adaptive-ds/generate-image-list
```

## Basic Usage

Keep the package generic and let each app own its own `imageList` import path.

Example project entrypoint:

```ts
import path from "node:path"
import { imageList } from "@/app/images/imageList"
import { generateImageList } from "@adaptive-ds/generate-image-list"
import { optimizeImagesWeb } from "@adaptive-ds/optimize-images-web"

const optimizedDir = path.resolve("public-images")
const outFile = path.resolve("src/app/images/imageList.ts")

await optimizeImagesWeb()
await generateImageList(optimizedDir, outFile, imageList)
```

This preserves existing `alt` text because the previous `imageList` is passed back into `generateImageList`.

## API

```ts
import { optimizeImagesWeb } from "@adaptive-ds/optimize-images-web"

const result = await optimizeImagesWeb(options)
```

### `OptimizeImagesWebOptions`

```ts
interface OptimizeImagesWebOptions {
  cwd?: string
  projectName?: string
  originalsDir?: string
  optimizedDir?: string
  rcloneRemote?: string
  remoteOriginalsDir?: string
  remoteOptimizedDir?: string
  cacheControlHeader?: string
}
```

### `OptimizeImagesWebResult`

```ts
interface OptimizeImagesWebResult {
  processed: string[]
  skippedExisting: string[]
  skippedRootFiles: string[]
  warnings: string[]
  deletedLocal: string[]
  uploadedRemote: string[]
  deletedRemote: string[]
}
```

## Example With Custom Paths

```ts
import { optimizeImagesWeb } from "@adaptive-ds/optimize-images-web"

await optimizeImagesWeb({
  originalsDir: "./assets/originals",
  optimizedDir: "./assets/optimized",
  rcloneRemote: "leo",
  remoteOriginalsDir: "original",
  remoteOptimizedDir: "optimized",
  cacheControlHeader: "public,max-age=31536000,immutable",
})
```

## Requirements

- `bun`
- `rclone`
- an existing `rclone` remote, defaulting to `leo`
- write access to the target bucket/path
- Node/Bun environment capable of running `sharp`

This package assumes the remote bucket/path already exists or can be created by `rclone mkdir`.

## Cleanup Behavior

The package does not use a manifest.

Instead it derives the expected output set from the current originals and current transform folders, then reconciles that against:

- local `public-images`
- remote `optimized` objects

That means:

- files no longer produced by the current source set are deleted
- renaming or removing a source file cleans up stale optimized files
- changing a transform folder causes a different hash and a different output filename

## Recommended Workflow

1. Add or sync originals into `public-image-versions/<transform-folder>/`
2. Run your local image pipeline entrypoint
3. Regenerate your typed image list
4. Reference the generated hashed filenames from app code or derived metadata

## Important Caveat

If your project currently stores source images directly at the root of `public-image-versions`, this package will skip them by design.

Before adopting it fully, move originals into explicit transform folders such as:

```text
public-image-versions/1920x1080_jpg/
```

That contract is what makes the output deterministic and safe to clean automatically.

## Publishing

This package is intended to be published from:

- npm package: `@adaptive-ds/optimize-images-web`
- repository: `david1gp/optimize-images-web`

## License

MIT
