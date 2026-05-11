// Rendering hint for a vendored plugin icon.
//
//   - 'color': multi-color or brand-color icon. Render as an <img>, no
//     tinting.
//   - 'mono': single-color silhouette (black, white, or unfilled) that
//     should follow the theme. The component renders this via CSS
//     mask-image + background-color: currentColor so the mark flips
//     black in light mode and white in dark mode.
export type LocalIconStyle = 'color' | 'mono'

export interface LocalIconSingle {
  readonly kind: 'single'
  readonly path: string
  readonly style: LocalIconStyle
}

// Brand has two distinct assets — one for light UI, one for dark.
// Component picks by resolvedTheme.
export interface LocalIconThemed {
  readonly kind: 'themed'
  readonly light: string
  readonly dark: string
}

export type LocalIcon = LocalIconSingle | LocalIconThemed
