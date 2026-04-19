import { isLocalDirEmpty } from "../../shared/isLocalDirEmpty.js"
import { isRemoteEmpty } from "../../shared/isRemoteEmpty.js"

export async function shouldBisync(localPath: string, remotePath: string): Promise<boolean> {
  return !(await isLocalDirEmpty(localPath)) || !(await isRemoteEmpty(remotePath))
}
