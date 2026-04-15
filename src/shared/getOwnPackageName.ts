import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

export async function getOwnPackageName(moduleUrl: string): Promise<string> {
  let currentDir = path.dirname(fileURLToPath(moduleUrl))

  while (true) {
    const packageJsonPath = path.join(currentDir, "package.json")

    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as { name?: string }
      if (packageJson.name) {
        return packageJson.name
      }
    } catch {}

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      throw new Error(`Could not resolve package name for ${moduleUrl}`)
    }

    currentDir = parentDir
  }
}
