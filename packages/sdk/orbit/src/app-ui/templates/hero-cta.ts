import { Button, Card, Hero, Page, Section, Stack, response } from '../index'

const defineOrbitApp = <T extends Record<string, unknown>>(definition: T): T => definition

export type Action = {
  readonly label: string
  readonly href: string
  readonly variant?: 'primary' | 'outline' | 'ghost' | undefined
}

export type HeroSection = {
  readonly eyebrow?: string | undefined
  readonly title: string
  readonly body: string
  readonly action?: Action | undefined
}

export type HeroCtaTemplateConfig = {
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly title: string
  readonly eyebrow?: string | undefined
  readonly body?: string | undefined
  readonly cta?: Action | undefined
  readonly sections?: readonly HeroSection[] | undefined
}

export function renderHeroCta(config: HeroCtaTemplateConfig) {
  const description = config.description ?? config.body

  return response(
    Page({ title: config.title, description, eyebrow: config.eyebrow, maxWidth: 'lg' }, [
      Stack({ gap: 'xl' }, [
        Hero({
          eyebrow: config.eyebrow,
          title: config.title,
          description: config.body ?? description,
          cta: config.cta ? { label: config.cta.label, href: config.cta.href } : undefined,
        }),
        ...(config.sections ?? []).map(renderSection),
      ]),
    ]),
    { title: config.title, description },
  )
}

export function heroCtaTemplate(config: HeroCtaTemplateConfig) {
  const rendered = renderHeroCta(config)

  return defineOrbitApp({
    name: config.name ?? 'hero-cta',
    description: config.description ?? 'Static landing page with hero, CTA, and prose sections.',
    jobs: {},
    routes: [
      {
        method: 'GET',
        path: '/',
        title: config.name ?? config.title,
        auth: 'public',
        input: 'none',
        output: 'html',
        static_html: rendered.html,
      },
    ],
  })
}

function renderSection(section: HeroSection) {
  return Section(
    {
      eyebrow: section.eyebrow,
      title: section.title,
      action: section.action
        ? Button(
            {
              href: section.action.href,
              variant: section.action.variant ?? 'outline',
              size: 'md',
            },
            [section.action.label],
          )
        : undefined,
    },
    [Card({ padding: 'lg' }, [section.body])],
  )
}
