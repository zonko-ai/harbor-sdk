import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitBrandName = Schema.NonEmptyString.check(
  Schema.isMaxLength(128),
)
export type OrbitBrandName = typeof OrbitBrandName.Type
export type OrbitBrandNameEncoded = typeof OrbitBrandName.Encoded

export const OrbitBrandLogoUrl = Schema.NonEmptyString.check(
  Schema.isMaxLength(2048),
)
export type OrbitBrandLogoUrl = typeof OrbitBrandLogoUrl.Type
export type OrbitBrandLogoUrlEncoded = typeof OrbitBrandLogoUrl.Encoded

export const OrbitBrandColor = Schema.NonEmptyString.check(
  Schema.isMaxLength(64),
  Schema.isPattern(/^\d*\.?\d+\s+\d*\.?\d+\s+\d*\.?\d+$/),
)
export type OrbitBrandColor = typeof OrbitBrandColor.Type
export type OrbitBrandColorEncoded = typeof OrbitBrandColor.Encoded

export const OrbitBrandFontFamily = Schema.NonEmptyString.check(
  Schema.isMaxLength(256),
)
export type OrbitBrandFontFamily = typeof OrbitBrandFontFamily.Type
export type OrbitBrandFontFamilyEncoded = typeof OrbitBrandFontFamily.Encoded

export const WorkspaceBranding = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  brand_name: Schema.optional(OrbitBrandName),
  brand_logo_url: Schema.optional(OrbitBrandLogoUrl),
  primary_color: Schema.optional(OrbitBrandColor),
  accent_color: Schema.optional(OrbitBrandColor),
  font_family: Schema.optional(OrbitBrandFontFamily),
  dark_mode_default: Schema.Boolean,
  created_at: Schema.String,
  updated_at: Schema.String,
  updated_by: Schema.optional(Schema.String),
})
export type WorkspaceBranding = typeof WorkspaceBranding.Type
export type WorkspaceBrandingEncoded = typeof WorkspaceBranding.Encoded
