import { parse } from "acorn";
//#region ../runtime-planner/src/execution-inputs.ts
function rewriteExecutionInputImports(code) {
	let ast;
	try {
		ast = parse(code, {
			ecmaVersion: "latest",
			sourceType: "module",
			allowReturnOutsideFunction: true,
			allowAwaitOutsideFunction: true
		});
	} catch {
		return code;
	}
	const replacements = [];
	for (const node of ast.body ?? []) {
		if (node.type !== "ImportDeclaration" || typeof node.start !== "number" || typeof node.end !== "number") continue;
		const source = node.source?.value;
		if (typeof source !== "string" || ![
			"fs",
			"node:fs",
			"fs/promises",
			"node:fs/promises"
		].includes(source)) continue;
		const specifiers = node.specifiers ?? [];
		if (specifiers.length === 1 && specifiers[0]?.type === "ImportNamespaceSpecifier") {
			const local = specifiers[0].local?.name;
			if (typeof local === "string") replacements.push({
				start: node.start,
				end: node.end,
				text: "const " + local + " = __hrbr_execution_fs;"
			});
			continue;
		}
		if (!specifiers.every((specifier) => specifier.type === "ImportSpecifier")) continue;
		const renamedSpecifiers = specifiers.map((specifier) => {
			const imported = specifier.imported?.name;
			const local = specifier.local?.name;
			if (typeof imported !== "string" || typeof local !== "string") return null;
			if (imported !== "readFile" && imported !== "readFileSync") return null;
			return imported === local ? imported : imported + ": " + local;
		}).filter((value) => Boolean(value));
		if (renamedSpecifiers.length === 0 || renamedSpecifiers.length !== specifiers.length) continue;
		replacements.push({
			start: node.start,
			end: node.end,
			text: "const { " + renamedSpecifiers.join(", ") + " } = __hrbr_execution_fs;"
		});
	}
	if (replacements.length === 0) return code;
	replacements.sort((a, b) => b.start - a.start);
	let rewritten = code;
	for (const replacement of replacements) rewritten = rewritten.slice(0, replacement.start) + replacement.text + rewritten.slice(replacement.end);
	return rewritten;
}
//#endregion
export { rewriteExecutionInputImports };

//# sourceMappingURL=execution-inputs.mjs.map