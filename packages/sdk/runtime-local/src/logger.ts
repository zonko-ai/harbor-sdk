export type HarborLocalLogLevel = "debug" | "info" | "warn" | "error"

export interface HarborLocalLogEvent {
  readonly level: HarborLocalLogLevel
  readonly area: "credentials" | "mcp" | "oauth" | "tools" | "exec"
  readonly code: string
  readonly message: string
  readonly sourceId?: string | undefined
  readonly endpoint?: string | undefined
  readonly status?: string | undefined
  readonly toolCount?: number | undefined
  readonly authorizationUrl?: string | undefined
  readonly error?: unknown
}

export type HarborLocalLogger = (event: HarborLocalLogEvent) => void | Promise<void>

export function harborLocalConsoleLogger(input: {
  readonly prefix?: string | undefined
} = {}): HarborLocalLogger {
  const prefix = input.prefix ?? "[harbor]"
  return (event) => {
    const write = event.level === "error" ? console.error : event.level === "warn" ? console.warn : console.log
    write(`${prefix} ${event.message}`)
    if (event.authorizationUrl) write(`Open this URL to connect ${event.sourceId ?? "MCP source"}:\n${event.authorizationUrl}\n`)
  }
}
