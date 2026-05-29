import { transform } from "sucrase";
//#region ../runtime-planner/src/source-prep.ts
function stripRuntimeTypescript(code, mode) {
	try {
		return {
			code: transform(code, {
				transforms: ["typescript"],
				production: true
			}).code,
			transformed: true,
			mode
		};
	} catch (error) {
		return {
			code,
			transformed: false,
			mode,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
function prepareRuntimeSource(code, mode) {
	return stripRuntimeTypescript(code, mode);
}
//#endregion
export { prepareRuntimeSource, stripRuntimeTypescript };

//# sourceMappingURL=source-prep.mjs.map