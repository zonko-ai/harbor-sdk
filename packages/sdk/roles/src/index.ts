// @hrbr/roles — Workspace role hierarchy and helpers.
import { Schema } from "effect"

export const ROLES = ["owner", "admin", "member", "viewer"] as const
export type Role = (typeof ROLES)[number]

export const Role = Schema.Literals(ROLES)

export const ASSIGNABLE_ROLES = ROLES.filter(
  (role): role is Exclude<Role, "owner"> => role !== "owner",
)
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export const AssignableRole = Schema.Literals(ASSIGNABLE_ROLES)

const RANK: Record<Role, number> = {
  owner: 0,
  admin: 1,
  member: 2,
  viewer: 3,
}
const ROLE_SET: ReadonlySet<string> = new Set(ROLES)

/** True if `actual` role meets the `required` minimum privilege. */
export function hasRole(actual: Role, required: Role): boolean {
  return RANK[actual] <= RANK[required]
}

/** Validate that a string is a known role. */
export function isRole(value: string): value is Role {
  return ROLE_SET.has(value)
}
