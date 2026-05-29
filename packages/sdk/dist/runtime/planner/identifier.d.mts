//#region ../runtime-planner/src/identifier.d.ts
declare function toSafeIdentifier(name: string): string;
declare function toSanitizedIdentifier(name: string): string;
declare function toCamelCase(name: string): string;
declare function buildNamespaceAliases(namespaces: ReadonlyArray<string>): Map<string, ReadonlyArray<string>>;
declare function buildToolAliases(toolNames: ReadonlyArray<string>): Map<string, ReadonlyArray<string>>;
declare function rankNearestMatches(needle: string, candidates: ReadonlyArray<string>, limit?: number): ReadonlyArray<string>;
declare function namespaceToJsVar(namespace: string): string;
//#endregion
export { buildNamespaceAliases, buildToolAliases, namespaceToJsVar, rankNearestMatches, toCamelCase, toSafeIdentifier, toSanitizedIdentifier };
//# sourceMappingURL=identifier.d.mts.map