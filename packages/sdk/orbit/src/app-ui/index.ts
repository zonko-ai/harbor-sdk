export {
  artifact,
  Button,
  Card,
  Form,
  Hero,
  html,
  ItemList,
  Page,
  raw,
  render,
  response,
  Section,
  Stack,
  text,
  TextArea,
  TextField,
} from './primitives'

export {
  defaultTheme,
  themeStyleBlock,
} from './theme'

// Identity helpers used by templates/samples in this examples/ tree.
// In production these come from @hrbr/orbit/apps and @hrbr/orbit/jobs;
// here we provide pass-through identities so render-cli can run.
export const defineOrbitApp = <T>(definition: T): T => definition
export const defineOrbitJob = <T>(definition: T): T => definition

export type {
  ArtifactOptions,
  ArtifactOrbit,
  ButtonProps,
  CardProps,
  FormProps,
  HeroProps,
  ItemListProps,
  OrbitUiChild,
  OrbitUiNode,
  OrbitUiPrimitive,
  OrbitUiRenderable,
  OrbitUiTheme,
  PageProps,
  RawHtml,
  RenderOptions,
  SectionProps,
  StackProps,
  TextAreaProps,
  TextFieldProps,
} from './types'
