import { parse } from "acorn";
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
//#endregion
//#region ../runtime-planner/src/bindings.ts
const RESOLVE_MEMO_MAX = 200;
const MEMO_MAX_ENTRY_BYTES = 16 * 1024;
const resolveMemo = /* @__PURE__ */ new Map();
function memoSet(memo, key, value, max) {
	if (typeof key === "string" && key.length > MEMO_MAX_ENTRY_BYTES) return;
	if (memo.size >= max) {
		const oldest = memo.keys().next().value;
		if (oldest !== void 0) memo.delete(oldest);
	}
	memo.set(key, value);
}
function resolveMemoKey(code, namespaces, sandNamespaces) {
	return `${code}\u0000${[...namespaces].sort().join(",")}\u0000${[...sandNamespaces].sort().join(",")}`;
}
var ReservedBindingCollisionError = class extends Error {
	names;
	constructor(names) {
		super(`Cannot declare Harbor reserved binding${names.length === 1 ? "" : "s"}: ${names.join(", ")}`);
		this.name = "ReservedBindingCollisionError";
		this.names = names;
	}
};
function isNode(value) {
	return Boolean(value) && typeof value === "object" && typeof value.type === "string";
}
function pushScope(scopes, kind) {
	return [...scopes, {
		kind,
		names: /* @__PURE__ */ new Set()
	}];
}
function currentScope(scopes) {
	return scopes[scopes.length - 1];
}
function nearestFunctionScope(scopes) {
	for (let i = scopes.length - 1; i >= 0; i -= 1) {
		const scope = scopes[i];
		if (scope.kind === "function" || scope.kind === "program") return scope;
	}
	return scopes[0];
}
function declareName(scopes, name, hoisted, reservedNames, conflicts) {
	if (!name) return;
	if (reservedNames.has(name)) conflicts.add(name);
	(hoisted ? nearestFunctionScope(scopes) : currentScope(scopes)).names.add(name);
}
function declarePattern(scopes, pattern, reservedNames, conflicts, hoisted = false) {
	if (!isNode(pattern)) return;
	switch (pattern.type) {
		case "Identifier":
			declareName(scopes, String(pattern.name), hoisted, reservedNames, conflicts);
			return;
		case "RestElement":
			declarePattern(scopes, pattern.argument, reservedNames, conflicts, hoisted);
			return;
		case "AssignmentPattern":
			declarePattern(scopes, pattern.left, reservedNames, conflicts, hoisted);
			return;
		case "ArrayPattern":
			for (const element of pattern.elements) declarePattern(scopes, element, reservedNames, conflicts, hoisted);
			return;
		case "ObjectPattern":
			for (const prop of pattern.properties) {
				if (!isNode(prop)) continue;
				if (prop.type === "RestElement") {
					declarePattern(scopes, prop.argument, reservedNames, conflicts, hoisted);
					continue;
				}
				declarePattern(scopes, prop.value, reservedNames, conflicts, hoisted);
			}
			return;
		default: return;
	}
}
function predeclareStatements(scopes, statements, reservedNames, conflicts) {
	for (const statement of statements) {
		if (!isNode(statement)) continue;
		switch (statement.type) {
			case "VariableDeclaration":
				for (const declaration of statement.declarations) {
					if (!isNode(declaration) || declaration.type !== "VariableDeclarator") continue;
					declarePattern(scopes, declaration.id, reservedNames, conflicts, statement.kind === "var");
				}
				break;
			case "FunctionDeclaration":
				if (statement.id) declarePattern(scopes, statement.id, reservedNames, conflicts);
				break;
			case "ClassDeclaration":
				if (statement.id) declarePattern(scopes, statement.id, reservedNames, conflicts);
				break;
			default: break;
		}
	}
}
function isDeclared(scopes, name) {
	for (let i = scopes.length - 1; i >= 0; i -= 1) if (scopes[i].names.has(name)) return true;
	return false;
}
function visitChildren(node, scopes, visit) {
	for (const [key, value] of Object.entries(node)) {
		if (key === "type" || key === "start" || key === "end" || key === "loc") continue;
		if (Array.isArray(value)) {
			for (const item of value) visit(item, scopes);
			continue;
		}
		visit(value, scopes);
	}
}
function getStaticMemberPropertyName(node) {
	if (node.computed) {
		const property = node.property;
		if (isNode(property) && property.type === "Literal" && typeof property.value === "string") return property.value;
		return null;
	}
	const property = node.property;
	if (isNode(property) && property.type === "Identifier") return String(property.name);
	return null;
}
function getSandMemberPropertyName(node, scopes) {
	const object = node.object;
	if (!isNode(object) || object.type !== "Identifier") return null;
	const objectName = String(object.name);
	if (objectName !== "sand" || isDeclared(scopes, objectName)) return null;
	return getStaticMemberPropertyName(node);
}
function getHrbrMemberPropertyName(node, scopes) {
	const object = node.object;
	if (!isNode(object) || object.type !== "Identifier") return null;
	const objectName = String(object.name);
	if (objectName !== "hrbr" || isDeclared(scopes, objectName)) return null;
	return getStaticMemberPropertyName(node);
}
function isHrbrWorkspacePrimitive(name) {
	return name === null || name === "storage" || name === "cache" || name === "db" || name === "tools" || name === "ai";
}
function resolveBindingUsage(code, namespaces, sandNamespaces = []) {
	const memoKey = resolveMemoKey(code, namespaces, sandNamespaces);
	const memoHit = resolveMemo.get(memoKey);
	if (memoHit) return memoHit;
	const namespaceAliases = buildNamespaceAliases(namespaces);
	const aliasToNamespace = /* @__PURE__ */ new Map();
	for (const [namespace, aliases] of namespaceAliases) for (const alias of aliases) aliasToNamespace.set(alias, namespace);
	const sandNamespaceAliases = buildNamespaceAliases(sandNamespaces);
	const sandAliasToNamespace = /* @__PURE__ */ new Map();
	for (const [namespace, aliases] of sandNamespaceAliases) {
		sandAliasToNamespace.set(namespace, namespace);
		for (const alias of aliases) sandAliasToNamespace.set(alias, namespace);
	}
	const reservedNames = new Set([
		"hrbr",
		"orbit",
		"sand",
		"secrets",
		"jobs",
		"defineJob",
		"deployApp",
		"step",
		...aliasToNamespace.keys()
	]);
	let hrbr = false;
	let orbit = false;
	let secrets = false;
	let sand = false;
	let jobs = false;
	let defineJob = false;
	let deployApp = false;
	let step = false;
	const referencedNamespaces = /* @__PURE__ */ new Set();
	const referencedSandNamespaces = /* @__PURE__ */ new Set();
	const referencedAliasesByNamespace = /* @__PURE__ */ new Map();
	const reservedBindingConflicts = /* @__PURE__ */ new Set();
	let ast;
	try {
		try {
			ast = parse(code, {
				ecmaVersion: "latest",
				sourceType: "script",
				allowAwaitOutsideFunction: true,
				allowReturnOutsideFunction: true
			});
		} catch {
			ast = parse(code, {
				ecmaVersion: "latest",
				sourceType: "module",
				allowAwaitOutsideFunction: true
			});
		}
	} catch {
		return {
			namespaces,
			aliases: new Map(namespaces.map((namespace) => [namespace, namespaceAliases.get(namespace) ?? [namespace]])),
			hrbr: true,
			orbit: true,
			secrets: true,
			sand: true,
			sandNamespaces,
			jobs: true,
			defineJob: true,
			deployApp: true,
			step: true
		};
	}
	const visit = (node, scopes) => {
		if (!isNode(node)) return;
		switch (node.type) {
			case "Program":
				predeclareStatements(scopes, node.body, reservedNames, reservedBindingConflicts);
				for (const statement of node.body) visit(statement, scopes);
				return;
			case "BlockStatement": {
				const blockScopes = pushScope(scopes, "block");
				predeclareStatements(blockScopes, node.body, reservedNames, reservedBindingConflicts);
				for (const statement of node.body) visit(statement, blockScopes);
				return;
			}
			case "VariableDeclaration":
				for (const declaration of node.declarations) {
					if (!isNode(declaration) || declaration.type !== "VariableDeclarator") continue;
					declarePattern(scopes, declaration.id, reservedNames, reservedBindingConflicts, node.kind === "var");
					visit(declaration.init, scopes);
				}
				return;
			case "FunctionDeclaration":
				if (node.id) declarePattern(scopes, node.id, reservedNames, reservedBindingConflicts, true);
				{
					const fnScopes = pushScope(scopes, "function");
					if (node.id) declarePattern(fnScopes, node.id, reservedNames, reservedBindingConflicts);
					for (const param of node.params) declarePattern(fnScopes, param, reservedNames, reservedBindingConflicts);
					visit(node.body, fnScopes);
				}
				return;
			case "FunctionExpression":
			case "ArrowFunctionExpression": {
				const fnScopes = pushScope(scopes, "function");
				if (node.id) declarePattern(fnScopes, node.id, reservedNames, reservedBindingConflicts);
				for (const param of node.params) declarePattern(fnScopes, param, reservedNames, reservedBindingConflicts);
				visit(node.body, fnScopes);
				return;
			}
			case "ClassDeclaration":
				if (node.id) declarePattern(scopes, node.id, reservedNames, reservedBindingConflicts, true);
				visit(node.superClass, scopes);
				visit(node.body, scopes);
				return;
			case "ClassExpression": {
				const classScopes = pushScope(scopes, "block");
				if (node.id) declarePattern(classScopes, node.id, reservedNames, reservedBindingConflicts);
				visit(node.superClass, classScopes);
				visit(node.body, classScopes);
				return;
			}
			case "CatchClause": {
				const catchScopes = pushScope(scopes, "block");
				if (node.param) declarePattern(catchScopes, node.param, reservedNames, reservedBindingConflicts);
				visit(node.body, catchScopes);
				return;
			}
			case "MemberExpression":
			case "OptionalMemberExpression": {
				const hrbrPropertyName = getHrbrMemberPropertyName(node, scopes);
				if (hrbrPropertyName) {
					hrbr = true;
					if (hrbrPropertyName === "jobs") jobs = true;
					if (isHrbrWorkspacePrimitive(hrbrPropertyName)) orbit = true;
				}
				const sandPropertyName = getSandMemberPropertyName(node, scopes);
				if (sandPropertyName) {
					sand = true;
					const namespace = sandAliasToNamespace.get(sandPropertyName);
					if (namespace) referencedSandNamespaces.add(namespace);
				}
				visit(node.object, scopes);
				if (node.computed) visit(node.property, scopes);
				return;
			}
			case "Property":
				if (node.computed) visit(node.key, scopes);
				if (node.shorthand) visit(node.value, scopes);
				else visit(node.value, scopes);
				return;
			case "MethodDefinition":
			case "PropertyDefinition":
				if (node.computed) visit(node.key, scopes);
				visit(node.value, scopes);
				return;
			case "LabeledStatement":
				visit(node.body, scopes);
				return;
			case "BreakStatement":
			case "ContinueStatement":
			case "DebuggerStatement":
			case "EmptyStatement": return;
			case "Identifier": {
				const name = String(node.name);
				if (name === "hrbr" && !isDeclared(scopes, name)) hrbr = true;
				if (name === "orbit" && !isDeclared(scopes, name)) orbit = true;
				if (name === "secrets" && !isDeclared(scopes, name)) secrets = true;
				if (name === "sand" && !isDeclared(scopes, name)) sand = true;
				if (name === "jobs" && !isDeclared(scopes, name)) jobs = true;
				if (name === "defineJob" && !isDeclared(scopes, name)) defineJob = true;
				if (name === "deployApp" && !isDeclared(scopes, name)) deployApp = true;
				if (name === "step" && !isDeclared(scopes, name)) step = true;
				const namespace = aliasToNamespace.get(name);
				if (namespace && !isDeclared(scopes, name)) {
					referencedNamespaces.add(namespace);
					let aliases = referencedAliasesByNamespace.get(namespace);
					if (!aliases) {
						aliases = /* @__PURE__ */ new Set();
						referencedAliasesByNamespace.set(namespace, aliases);
					}
					aliases.add(name);
				}
				return;
			}
			default: visitChildren(node, scopes, visit);
		}
	};
	visit(ast, [{
		kind: "program",
		names: /* @__PURE__ */ new Set()
	}]);
	if (reservedBindingConflicts.size > 0) throw new ReservedBindingCollisionError([...reservedBindingConflicts].sort());
	const usedNamespaces = namespaces.filter((namespace) => referencedNamespaces.has(namespace));
	const usedSandNamespaces = sandNamespaces.filter((namespace) => referencedSandNamespaces.has(namespace));
	const result = {
		namespaces: usedNamespaces,
		aliases: new Map(usedNamespaces.map((namespace) => [namespace, [...referencedAliasesByNamespace.get(namespace) ?? /* @__PURE__ */ new Set()]])),
		hrbr,
		orbit,
		secrets,
		sand: sand || usedSandNamespaces.length > 0,
		sandNamespaces: usedSandNamespaces,
		jobs,
		defineJob,
		deployApp,
		step
	};
	memoSet(resolveMemo, memoKey, result, RESOLVE_MEMO_MAX);
	return result;
}
//#endregion
//#region ../runtime-planner/src/namespace-plan.ts
function planRuntimeNamespaceUsage(userCode, sources) {
	const availableNamespaces = [...new Set(sources.filter((source) => source.kind === "mcp" || source.kind === "api" || source.kind === "cli" && source.has_cli_bindings).map((source) => source.namespace))];
	const availableSandNamespaces = [...new Set(sources.filter((source) => source.kind === "cli" && source.has_cli_bindings).map((source) => source.namespace))];
	const bindingUsage = resolveBindingUsage(userCode, availableNamespaces, availableSandNamespaces);
	const namespaces = [...bindingUsage.namespaces];
	const sandNamespaces = bindingUsage.sand ? [...bindingUsage.sandNamespaces.length > 0 ? bindingUsage.sandNamespaces : availableSandNamespaces] : [];
	return {
		availableNamespaces,
		availableSandNamespaces,
		namespaces,
		sandNamespaces,
		loadNamespaces: [...new Set([...namespaces, ...sandNamespaces])],
		hrbr: bindingUsage.hrbr,
		orbit: bindingUsage.orbit,
		secrets: bindingUsage.secrets,
		jobs: bindingUsage.jobs,
		step: bindingUsage.step,
		aliases: bindingUsage.aliases
	};
}
//#endregion
export { planRuntimeNamespaceUsage };

//# sourceMappingURL=namespace-plan.mjs.map