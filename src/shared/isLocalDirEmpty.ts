import fs from "node:fs/promises"

export async function isLocalDirEmpty(dir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries.filter((e) => e.isFile()).length === 0
  } catch {
    return true
  }
}