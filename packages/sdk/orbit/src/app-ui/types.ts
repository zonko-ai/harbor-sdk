export type OrbitUiPrimitive = string | number | boolean | null | undefined

export type OrbitUiChild = OrbitUiNode | RawHtml | OrbitUiPrimitive

export type OrbitUiRenderable = OrbitUiNode | OrbitUiChild | readonly OrbitUiChild[]

export interface OrbitUiNode<T extends string = string, P = Record<string, unknown>> {
  readonly $$orbit_ui: true
  readonly type: T
  readonly props: Readonly<P>
  readonly children?: readonly OrbitUiChild[] | undefined
}

export interface RawHtml {
  readonly $$orbit_ui_raw: true
  readonly html: string
}

export interface RenderOptions {
  readonly document?: boolean | undefined
  readonly title?: string | undefined
  readonly description?: string | undefined
  readonly theme?: OrbitUiTheme | undefined
  readonly nonce?: string | undefined
  readonly pretty?: boolean | undefined
}

export interface ArtifactOptions extends RenderOptions {
  readonly contentType?: "text/html" | "text/markdown" | undefined
  readonly publicUrl?: boolean | undefined
}

export interface ArtifactOrbit {
  readonly storage: {
    readonly put: (key: string, body: string, opts?: { content_type?: string }) => Promise<void>
    readonly url?: (key: string) => Promise<string>
  }
}

export interface OrbitUiTheme {
  readonly tokens: {
    readonly background: string
    readonly foreground: string
    readonly foregroundMuted: string
    readonly foregroundSoft: string
    readonly card: string
    readonly border: string
    readonly borderSubtle: string
    readonly primary: string
    readonly primaryForeground: string
    readonly primaryHover: string
    readonly muted: string
    readonly radius: { readonly md: string; readonly lg: string; readonly xl: string }
    readonly fontSans: string
  }
}

export interface PageProps {
  readonly title: string
  readonly description?: string | undefined
  readonly eyebrow?: string | undefined
  readonly maxWidth?: "sm" | "md" | "lg" | "xl" | "full" | undefined
  readonly chrome?: "document" | "fragment" | undefined
}

export interface SectionProps {
  readonly title?: string | undefined
  readonly eyebrow?: string | undefined
  readonly description?: string | undefined
  readonly action?: OrbitUiChild | undefined
}

export interface StackProps {
  readonly gap?: "xs" | "sm" | "md" | "lg" | "xl" | undefined
  readonly align?: "start" | "center" | "end" | "stretch" | undefined
}

export interface CardProps {
  readonly tone?: "default" | "muted" | "danger" | "success" | undefined
  readonly padding?: "sm" | "md" | "lg" | undefined
}

export interface HeroProps {
  readonly eyebrow?: string | undefined
  readonly title: string
  readonly description?: string | undefined
  readonly cta?: { readonly label: string; readonly href: string } | undefined
}

export interface FormProps {
  readonly action: string
  readonly method?: "GET" | "POST" | undefined
  readonly enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | undefined
  readonly submitLabel?: string | undefined
}

export interface TextFieldProps {
  readonly name: string
  readonly label: string
  readonly type?: "text" | "email" | "url" | "search" | "hidden" | undefined
  readonly value?: string | undefined
  readonly placeholder?: string | undefined
  readonly required?: boolean | undefined
  readonly minLength?: number | undefined
  readonly maxLength?: number | undefined
  readonly help?: string | undefined
  readonly error?: string | undefined
}

export interface TextAreaProps {
  readonly name: string
  readonly label: string
  readonly value?: string | undefined
  readonly placeholder?: string | undefined
  readonly required?: boolean | undefined
  readonly minLength?: number | undefined
  readonly maxLength?: number | undefined
  readonly rows?: number | undefined
  readonly help?: string | undefined
  readonly error?: string | undefined
}

export interface ButtonProps {
  readonly type?: "button" | "submit" | "reset" | undefined
  readonly variant?: "primary" | "outline" | "ghost" | "danger" | undefined
  readonly size?: "sm" | "md" | "lg" | undefined
  readonly href?: string | undefined
  readonly name?: string | undefined
  readonly value?: string | undefined
  readonly disabled?: boolean | undefined
}

export interface ItemListProps<T = unknown> {
  readonly items: readonly T[]
  readonly render: (item: T, index: number) => OrbitUiChild
  readonly empty?: OrbitUiChild | undefined
  readonly tag?: "ul" | "ol" | "div" | undefined
  readonly gap?: "sm" | "md" | "lg" | undefined
}
