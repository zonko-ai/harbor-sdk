import { Core, Inspect, Platform, Plugins, Protocol, Runtime } from '@hrbr/sdk'
import { ROUTES } from '@hrbr/sdk/core/control'
import { INSPECT_RESULT_KIND } from '@hrbr/sdk/inspect'
import type { TriggerStatus } from '@hrbr/sdk/core/trigger'

export const sdkSnapshot = {
  route: ROUTES.exec,
  openApiTitle: Protocol.harborOpenApiDocument.info.title,
  runtimeMode: Runtime.Core.RuntimeExecutionMode,
  toolSearchMode: Plugins.ToolSearchMode,
  inspectResultKind: Inspect.INSPECT_RESULT_KIND,
  inspectSubpathResultKind: INSPECT_RESULT_KIND,
  wrappedInspectCode: Inspect.wrapInspectUserCode('return defineJob({ name: "Example" })'),
  coreRoutes: Core.ROUTES,
  localFrontendPath: Platform.Local.LOCAL_HARBOR_FRONTEND_SCRIPT_PATH,
  triggerStatus: 'active' satisfies TriggerStatus,
}

if (import.meta.main) {
  console.log(JSON.stringify({
    route: sdkSnapshot.route,
    openApiTitle: sdkSnapshot.openApiTitle,
    inspectResultKind: sdkSnapshot.inspectResultKind,
    localFrontendPath: sdkSnapshot.localFrontendPath,
    triggerStatus: sdkSnapshot.triggerStatus,
  }, null, 2))
}
