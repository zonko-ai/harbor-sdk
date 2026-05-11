// Shared Orbit contract primitives for Harbor's remote execution layer.
import { Schema } from "effect"

export const OrbitWorkspaceId = Schema.String.check(Schema.isUUID())
export type OrbitWorkspaceId = typeof OrbitWorkspaceId.Type
