export async function runRclone(args: string[], cwd = process.cwd()): Promise<void> {
  const command = ["rclone", ...args]
  console.log(command.join(" "))

  const proc = Bun.spawn(command, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  })

  const exitCode = await proc.exited
  if (exitCode !== 0) {
    throw new Error(`rclone ${args.join(" ")} failed with exit code ${exitCode}`)
  }
}
