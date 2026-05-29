import { Core, Platform, Plugins, Protocol, Runtime } from '@hrbr/sdk'
import { ROUTES } from '@hrbr/sdk/core/control'
import type { TriggerStatus } from '@hrbr/sdk/core/trigger'

export const sdkSnapshot = {
  route: ROUTES.exec,
  openApiTitle: Protocol.harborOpenApiDocument.info.title,
  runtimeMode: Runtime.Core.RuntimeExecutionMode,
  toolSearchMode: Plugins.ToolSearchMode,
  coreRoutes: Core.ROUTES,
  localFrontendPath: Platform.Local.LOCAL_HARBOR_FRONTEND_SCRIPT_PATH,
  triggerStatus: 'active' satisfies TriggerStatus,
}

if (import.meta.main) {
  console.log(JSON.stringify({
    route: sdkSnapshot.route,
    openApiTitle: sdkSnapshot.openApiTitle,
    localFrontendPath: sdkSnapshot.localFrontendPath,
    triggerStatus: sdkSnapshot.triggerStatus,
  }, null, 2))
}
