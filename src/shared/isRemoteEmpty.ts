import * as Bun from "bun"

export async function isRemoteEmpty(remote: string): Promise<boolean> {
  const proc = Bun.spawn({
    cmd: ["rclone", "size", "--json", "--max-depth", "1", remote],
    stdout: "pipe",
    stderr: "pipe",
  })
  const output = await new Response(proc.stdout).text()
  await proc.exited
  const result = JSON.parse(output) as { count: number }
  return result.count === 0
}