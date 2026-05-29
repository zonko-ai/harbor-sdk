//#region ../runtime-planner/src/identifier.ts
const JS_RESERVED = new Set([
	"abstract",
	"arguments",
	"await",
	"boolean",
	"break",
	"byte",
	"case",
	"catch",
	"char",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"double",
	"else",
	"enum",
	"eval",
	"export",
	"extends",
	"false",
	"final",
	"finally",
	"float",
	"for",
	"function",
	"goto",
	"if",
	"implements",
	"import",
	"in",
	"instanceof",
	"int",
	"interface",
	"let",
	"long",
	"native",
	"new",
	"null",
	"package",
	"private",
	"protected",
	"public",
	"return",
	"short",
	"static",
	"super",
	"switch",
	"synchronized",
	"this",
	"throw",
	"throws",
	"transient",
	"true",
	"try",
	"typeof",
	"undefined",
	"var",
	"void",
	"volatile",
	"while",
	"with",
	"yield"
]);
const JS_IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;
function toSafeIdentifier(name) {
	return `h_${Array.from(name).map((ch) => ch.codePointAt(0).toString(16).padStart(4, "0")).join("_")}`;
}
function toSanitizedIdentifier(name) {
	if (!name) return "_";
	let sanitized = name.replace(/[-.\s]/g, "_");
	sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, "");
	if (!sanitized) return "_";
	if (/^[0-9]/.test(sanitized)) sanitized = `_${sanitized}`;
	if (JS_RESERVED.has(sanitized)) sanitized = `${sanitized}_`;
	return sanitized;
}
function toCamelCase(name) {
	if (!name) return name;
	const sentinel = String.fromCharCode(1);
	const tokens = name.replace(/([a-z0-9])([A-Z])/g, `$1${sentinel}$2`).split(new RegExp(`[-_.\\s${sentinel}]+`)).filter((token) => token.length > 0);
	if (tokens.length === 0) return name;
	return tokens[0].toLowerCase() + tokens.slice(1).map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()).join("");
}
function isLegalJsBinding(name) {
	return name.length > 0 && JS_IDENTIFIER_RE.test(name) && !JS_RESERVED.has(name);
}
function buildNamespaceAliases(namespaces) {
	const sanitizedCounts = /* @__PURE__ */ new Map();
	const camelCounts = /* @__PURE__ */ new Map();
	for (const namespace of namespaces) {
		const sanitized = toSanitizedIdentifier(namespace);
		const camel = toCamelCase(namespace);
		sanitizedCounts.set(sanitized, (sanitizedCounts.get(sanitized) ?? 0) + 1);
		camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1);
	}
	return new Map(namespaces.map((namespace) => {
		const encoded = toSafeIdentifier(namespace);
		const sanitized = toSanitizedIdentifier(namespace);
		const camel = toCamelCase(namespace);
		const aliases = [encoded];
		const seen = new Set([encoded]);
		if (!seen.has(sanitized) && sanitizedCounts.get(sanitized) === 1 && isLegalJsBinding(sanitized)) {
			aliases.push(sanitized);
			seen.add(sanitized);
		}
		if (!seen.has(camel) && camelCounts.get(camel) === 1 && isLegalJsBinding(camel)) {
			aliases.push(camel);
			seen.add(camel);
		}
		return [namespace, aliases];
	}));
}
function buildToolAliases(toolNames) {
	const rawNameSet = new Set(toolNames);
	const camelCounts = /* @__PURE__ */ new Map();
	for (const toolName of toolNames) {
		const camel = toCamelCase(toolName);
		if (camel !== toolName && !rawNameSet.has(camel)) camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1);
	}
	return new Map(toolNames.map((toolName) => {
		const camel = toCamelCase(toolName);
		const aliases = [toolName];
		if (camel !== toolName && !rawNameSet.has(camel) && camelCounts.get(camel) === 1) aliases.push(camel);
		return [toolName, aliases];
	}));
}
function rankNearestMatches(needle, candidates, limit = 3) {
	if (!needle || candidates.length === 0 || limit <= 0) return [];
	const fold = (value) => value.toLowerCase().replace(/[-_.\s]/g, "");
	const target = fold(needle);
	if (!target) return [];
	const targetTokens = needle.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 0);
	const scored = [];
	for (const candidate of candidates) {
		const folded = fold(candidate);
		if (!folded) continue;
		let score = 0;
		if (folded === target) score = 1e4;
		else if (folded.startsWith(target)) score = 5e3 - folded.length;
		else if (folded.includes(target)) score = 2e3 - folded.length;
		else if (target.includes(folded)) score = 1e3 - folded.length;
		else if (targetTokens.length > 0) {
			const overlap = targetTokens.filter((token) => folded.includes(token)).length;
			if (overlap > 0) score = overlap * 100 - folded.length;
		}
		if (score > 0) scored.push({
			name: candidate,
			score
		});
	}
	scored.sort((a, b) => b.score - a.score || a.name.length - b.name.length);
	return scored.slice(0, limit).map((entry) => entry.name);
}
function namespaceToJsVar(namespace) {
	const camel = toCamelCase(namespace);
	if (isLegalJsBinding(camel)) return camel;
	return toSanitizedIdentifier(namespace);
}
//#endregion
export { buildNamespaceAliases, buildToolAliases, namespaceToJsVar, rankNearestMatches, toCamelCase, toSafeIdentifier, toSanitizedIdentifier };

//# sourceMappingURL=identifier.mjs.map