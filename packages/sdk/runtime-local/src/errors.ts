export type HarborLocalErrorCode =
  | "local_credentials_key_required"
  | "local_mcp_source_unknown"
  | "local_mcp_source_unsupported_transport"
  | "local_mcp_oauth_not_configured"
  | "local_mcp_oauth_reconnect_required"
  | "local_mcp_oauth_timeout"
  | "local_mcp_refresh_failed"
  | "local_tool_unknown"
  | "local_tool_call_unconfigured"
  | "local_exec_error"
  | "local_write_confirmation_required"
  | "local_registry_action_invalid"
  | "local_runtime_error"

export interface HarborLocalErrorInput {
  readonly code: HarborLocalErrorCode
  readonly message: string
  readonly cause?: unknown
  readonly details?: Readonly<Record<string, unknown>> | undefined
}

export class HarborLocalError extends Error {
  readonly code: HarborLocalErrorCode
  readonly details?: Readonly<Record<string, unknown>> | undefined

  constructor(input: HarborLocalErrorInput) {
    super(input.message, input.cause === undefined ? undefined : { cause: input.cause })
    this.name = "HarborLocalError"
    this.code = input.code
    this.details = input.details
  }
}

export function isHarborLocalError(error: unknown): error is HarborLocalError {
  return error instanceof HarborLocalError
}

export function toHarborLocalError(
  error: unknown,
  fallback: Omit<HarborLocalErrorInput, "cause">
): HarborLocalError {
  if (error instanceof HarborLocalError) return error
  return new HarborLocalError({
    code: fallback.code,
    message: error instanceof Error && error.message ? error.message : fallback.message,
    details: fallback.details,
    cause: error,
  })
}
