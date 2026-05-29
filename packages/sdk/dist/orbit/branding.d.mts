import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitBrandName: Schema.NonEmptyString;
type OrbitBrandName = typeof OrbitBrandName.Type;
type OrbitBrandNameEncoded = typeof OrbitBrandName.Encoded;
declare const OrbitBrandLogoUrl: Schema.NonEmptyString;
type OrbitBrandLogoUrl = typeof OrbitBrandLogoUrl.Type;
type OrbitBrandLogoUrlEncoded = typeof OrbitBrandLogoUrl.Encoded;
declare const OrbitBrandColor: Schema.NonEmptyString;
type OrbitBrandColor = typeof OrbitBrandColor.Type;
type OrbitBrandColorEncoded = typeof OrbitBrandColor.Encoded;
declare const OrbitBrandFontFamily: Schema.NonEmptyString;
type OrbitBrandFontFamily = typeof OrbitBrandFontFamily.Type;
type OrbitBrandFontFamilyEncoded = typeof OrbitBrandFontFamily.Encoded;
declare const WorkspaceBranding: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly brand_name: Schema.optional<Schema.NonEmptyString>;
  readonly brand_logo_url: Schema.optional<Schema.NonEmptyString>;
  readonly primary_color: Schema.optional<Schema.NonEmptyString>;
  readonly accent_color: Schema.optional<Schema.NonEmptyString>;
  readonly font_family: Schema.optional<Schema.NonEmptyString>;
  readonly dark_mode_default: Schema.Boolean;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly updated_by: Schema.optional<Schema.String>;
}>;
type WorkspaceBranding = typeof WorkspaceBranding.Type;
type WorkspaceBrandingEncoded = typeof WorkspaceBranding.Encoded;
//#endregion
export { OrbitBrandColor, type OrbitBrandColorEncoded, OrbitBrandFontFamily, type OrbitBrandFontFamilyEncoded, OrbitBrandLogoUrl, type OrbitBrandLogoUrlEncoded, OrbitBrandName, type OrbitBrandNameEncoded, WorkspaceBranding, type WorkspaceBrandingEncoded };
//# sourceMappingURL=branding.d.mts.map