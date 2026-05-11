import {
  Card,
  Form,
  Hero,
  Page,
  Section,
  Stack,
  TextArea,
  TextField,
  response,
} from '../index'

export interface IntakeBoardConfig {
  readonly name: string
  readonly title: string
  readonly description?: string | undefined
  readonly eyebrow?: string | undefined
  readonly fields: readonly {
    readonly name: string
    readonly label: string
    readonly required?: boolean | undefined
    readonly placeholder?: string | undefined
    readonly multiline?: boolean | undefined
    readonly type?: 'text' | 'email' | 'url' | undefined
  }[]
  readonly submitLabel?: string | undefined
  readonly thanksTitle?: string | undefined
  readonly thanksMessage?: string | undefined
}

export interface IntakeBoardRouteContext {
  readonly result?: {
    readonly id?: string | undefined
    readonly item_id?: string | undefined
    readonly request_id?: string | undefined
  } | undefined
}

const defineOrbitApp = <T>(definition: T): T => definition

function slugifyName(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'intake-board'
}

function renderForm(config: IntakeBoardConfig) {
  return response(
    Page(
      {
        title: config.title,
        description: config.description,
        eyebrow: config.eyebrow,
        maxWidth: 'md',
      },
      [
        Hero({
          eyebrow: config.eyebrow ?? 'intake',
          title: config.title,
          description: config.description,
        }),
        Section(
          {
            eyebrow: 'submit',
            title: 'Tell us what you need',
            description: 'Your response is captured as a Harbor job run with an audit trail.',
          },
          [
            Card({ padding: 'lg' }, [
              Form({ action: '/', method: 'POST', submitLabel: config.submitLabel ?? 'Submit' }, [
                Stack({ gap: 'md' }, config.fields.map((field) => {
                  if (field.multiline === true) {
                    return TextArea({
                      name: field.name,
                      label: field.label,
                      placeholder: field.placeholder,
                      required: field.required,
                      rows: 5,
                    })
                  }
                  return TextField({
                    name: field.name,
                    label: field.label,
                    type: field.type ?? 'text',
                    placeholder: field.placeholder,
                    required: field.required,
                  })
                })),
              ]),
            ]),
          ],
        ),
      ],
    ),
    { title: config.title, description: config.description },
  )
}

function renderThanks(config: IntakeBoardConfig, context: IntakeBoardRouteContext = {}) {
  const reference = context.result?.id ?? context.result?.item_id ?? context.result?.request_id

  return response(
    Page(
      {
        title: config.thanksTitle ?? 'Thanks — received',
        description: config.thanksMessage,
        eyebrow: 'received',
        maxWidth: 'md',
      },
      [
        Hero({
          eyebrow: 'received',
          title: config.thanksTitle ?? 'Thanks — received',
          description: config.thanksMessage ?? 'Your response has been captured and routed to the workspace.',
        }),
        Section(
          {
            eyebrow: 'proof',
            title: 'What happens next',
            description: 'The backing job can store, route, enrich, or sync this intake record.',
          },
          [
            Card({ tone: 'success', padding: 'lg' }, [
              Stack({ gap: 'sm' }, [
                'Your request is in the workspace queue.',
                reference ? `Reference: ${reference}` : undefined,
              ]),
            ]),
          ],
        ),
      ],
    ),
    { title: config.thanksTitle ?? 'Thanks — received', description: config.thanksMessage },
  )
}

export function intakeBoardTemplate(opts: { config: IntakeBoardConfig; jobs: { submit: string } }) {
  const appName = slugifyName(opts.config.name)

  return defineOrbitApp({
    name: appName,
    description: opts.config.description ?? `${opts.config.title} intake board`,
    jobs: {
      submit: { name: opts.jobs.submit },
    },
    routes: [
      {
        method: 'GET',
        path: '/',
        title: opts.config.title,
        auth: 'public',
        input: 'none',
        output: 'html',
        render: () => renderForm(opts.config),
      },
      {
        method: 'POST',
        path: '/',
        title: opts.config.submitLabel ?? 'Submit intake',
        auth: 'public',
        input: 'form',
        output: 'html',
        job: 'submit',
        render: (context: IntakeBoardRouteContext) => renderThanks(opts.config, context),
      },
    ],
  })
}
