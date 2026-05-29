//#region ../runtime-planner/src/source-prep.d.ts
type RuntimeSourceMode = 'exec' | 'preflight' | 'inspect' | 'defineJob' | 'deployApp';
interface PreparedRuntimeSource {
  readonly code: string;
  readonly transformed: boolean;
  readonly mode: RuntimeSourceMode;
  readonly error?: string | undefined;
}
declare function stripRuntimeTypescript(code: string, mode: RuntimeSourceMode): PreparedRuntimeSource;
declare function prepareRuntimeSource(code: string, mode: RuntimeSourceMode): PreparedRuntimeSource;
//#endregion
export { PreparedRuntimeSource, RuntimeSourceMode, prepareRuntimeSource, stripRuntimeTypescript };
//# sourceMappingURL=source-prep.d.mts.map