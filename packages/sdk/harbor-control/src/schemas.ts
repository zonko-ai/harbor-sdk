// Effect Schema definitions for wire payloads shared across Harbor
// surfaces. Keep this file dependency-light — only `effect` — so both
// worker and node consumers can import.

import { Schema } from "effect";
import { WORKSPACE_ROLES } from "./tools";

// Use a distinct name from the type alias in `./tools.ts` so both can
// be re-exported from the barrel without a TS2308 conflict.
export const WorkspaceRoleSchema = Schema.Literals(WORKSPACE_ROLES);

export const WorkspaceRow = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  role: Schema.optional(Schema.String),
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
});
export type WorkspaceRow = typeof WorkspaceRow.Type;

export const WorkspaceInviteRow = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  role: Schema.String,
  workspace_id: Schema.String,
  invited_by: Schema.optional(Schema.String),
  created_at: Schema.optional(Schema.String),
  expires_at: Schema.optional(Schema.String),
  status: Schema.optional(Schema.String),
});
export type WorkspaceInviteRow = typeof WorkspaceInviteRow.Type;

export const WorkspaceOauthClient = Schema.Struct({
  workspace_id: Schema.String,
  slug: Schema.String,
  client_id: Schema.String,
  // client_secret is intentionally omitted from the wire shape —
  // the API never returns it.
  redirect_uri: Schema.optional(Schema.String),
  scope: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
  created_by: Schema.optional(Schema.String),
});
export type WorkspaceOauthClient = typeof WorkspaceOauthClient.Type;
