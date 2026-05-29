import { Schema } from "effect";
//#region ../core-effect/src/http.ts
const ApiSuccess = (data) => Schema.Struct({
	success: Schema.Literal(true),
	data
});
const ApiFailure = Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	issues: Schema.optional(Schema.Array(Schema.String))
});
const ApiEnvelope = (data) => Schema.Union([ApiSuccess(data), ApiFailure]);
const PaginatedResponse = (item) => Schema.Struct({
	success: Schema.Literal(true),
	data: Schema.Array(item),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const PaginationParams = Schema.Struct({
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 200
	}))),
	offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0))),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
//#endregion
export { ApiEnvelope, ApiFailure, ApiSuccess, PaginatedResponse, PaginationParams };

//# sourceMappingURL=http.mjs.map