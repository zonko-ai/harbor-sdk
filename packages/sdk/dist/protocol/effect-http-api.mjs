import { Schema } from "effect";
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Pipeable.js
/**
* @since 2.0.0
*/
/**
* @since 2.0.0
* @category utilities
* @example
* ```ts
* import { Pipeable } from "effect"
*
* // pipeArguments is used internally to implement efficient piping
* function customPipe<A>(self: A, ...fns: Array<(a: any) => any>): unknown {
*   return Pipeable.pipeArguments(self, arguments as any)
* }
*
* // Example usage
* const add = (x: number) => (y: number) => x + y
* const multiply = (x: number) => (y: number) => x * y
*
* const result = customPipe(5, add(2), multiply(3))
* console.log(result) // 21
* ```
*/
const pipeArguments = (self, args) => {
	switch (args.length) {
		case 0: return self;
		case 1: return args[0](self);
		case 2: return args[1](args[0](self));
		case 3: return args[2](args[1](args[0](self)));
		case 4: return args[3](args[2](args[1](args[0](self))));
		case 5: return args[4](args[3](args[2](args[1](args[0](self)))));
		case 6: return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
		case 7: return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
		case 8: return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
		case 9: return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
		default: {
			let ret = self;
			for (let i = 0, len = args.length; i < len; i++) ret = args[i](ret);
			return ret;
		}
	}
};
/**
* @since 4.0.0
*/
const Prototype$1 = { pipe() {
	return pipeArguments(this, arguments);
} };
/**
* @since 4.0.0
* @category constructors
*/
const Class$2 = /* @__PURE__ */ function() {
	function PipeableBase() {}
	PipeableBase.prototype = Prototype$1;
	return PipeableBase;
}();
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Function.js
/**
* Creates a function that can be used in a data-last (aka `pipe`able) or
* data-first style.
*
* The first parameter to `dual` is either the arity of the uncurried function
* or a predicate that determines if the function is being used in a data-first
* or data-last style.
*
* Using the arity is the most common use case, but there are some cases where
* you may want to use a predicate. For example, if you have a function that
* takes an optional argument, you can use a predicate to determine if the
* function is being used in a data-first or data-last style.
*
* You can pass either the arity of the uncurried function or a predicate
* which determines if the function is being used in a data-first or
* data-last style.
*
* @example
* ```ts
* import { dual, pipe } from "effect/Function"
*
* // Using arity to determine data-first or data-last style
* const sum = dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(2, (self, that) => self + that)
*
* console.log(sum(2, 3)) // 5 (data-first)
* console.log(pipe(2, sum(3))) // 5 (data-last)
* ```
*
* **Example** (Using arity to determine data-first or data-last style)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum = dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(2, (self, that) => self + that)
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* **Example** (Using call signatures to define the overloads)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum: {
*   (that: number): (self: number) => number
*   (self: number, that: number): number
* } = dual(2, (self: number, that: number): number => self + that)
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* **Example** (Using a predicate to determine data-first or data-last style)
*
* ```ts
* import { dual, pipe } from "effect/Function"
*
* const sum = dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(
*   (args) => args.length === 2,
*   (self, that) => self + that
* )
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* @category combinators
* @since 2.0.0
*/
const dual = function(arity, body) {
	if (typeof arity === "function") return function() {
		return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
	};
	switch (arity) {
		case 0:
		case 1: throw new RangeError(`Invalid arity ${arity}`);
		case 2: return function(a, b) {
			if (arguments.length >= 2) return body(a, b);
			return function(self) {
				return body(self, a);
			};
		};
		case 3: return function(a, b, c) {
			if (arguments.length >= 3) return body(a, b, c);
			return function(self) {
				return body(self, a, b);
			};
		};
		default: return function() {
			if (arguments.length >= arity) return body.apply(this, arguments);
			const args = arguments;
			return function(self) {
				return body(self, ...args);
			};
		};
	}
};
/**
* The identity function, i.e. A function that returns its input argument.
*
* @example
* ```ts
* import { identity } from "effect/Function"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(identity(5), 5)
* ```
*
* @category combinators
* @since 2.0.0
*/
const identity = (a) => a;
/**
* Creates a constant value that never changes.
*
* This is useful when you want to pass a value to a higher-order function (a function that takes another function as its argument)
* and want that inner function to always use the same value, no matter how many times it is called.
*
* @example
* ```ts
* import { constant } from "effect/Function"
* import * as assert from "node:assert"
*
* const constNull = constant(null)
*
* assert.deepStrictEqual(constNull(), null)
* assert.deepStrictEqual(constNull(), null)
* ```
*
* @category constructors
* @since 2.0.0
*/
const constant = (value) => () => value;
/**
* A thunk that returns always `false`.
*
* @example
* ```ts
* import { constFalse } from "effect/Function"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(constFalse(), false)
* ```
*
* @category constants
* @since 2.0.0
*/
const constFalse = /* @__PURE__ */ constant(false);
/**
* A thunk that returns always `undefined`.
*
* @example
* ```ts
* import { constUndefined } from "effect/Function"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(constUndefined(), undefined)
* ```
*
* @category constants
* @since 2.0.0
*/
const constUndefined = /* @__PURE__ */ constant(void 0);
/**
* A thunk that returns always `void`.
*
* @example
* ```ts
* import { constVoid } from "effect/Function"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(constVoid(), undefined)
* ```
*
* @category constants
* @since 2.0.0
*/
const constVoid = constUndefined;
function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
	switch (arguments.length) {
		case 1: return ab;
		case 2: return function() {
			return bc(ab.apply(this, arguments));
		};
		case 3: return function() {
			return cd(bc(ab.apply(this, arguments)));
		};
		case 4: return function() {
			return de(cd(bc(ab.apply(this, arguments))));
		};
		case 5: return function() {
			return ef(de(cd(bc(ab.apply(this, arguments)))));
		};
		case 6: return function() {
			return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
		};
		case 7: return function() {
			return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
		};
		case 8: return function() {
			return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
		};
		case 9: return function() {
			return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
		};
	}
}
/**
* @since 4.0.0
*/
function memoize(f) {
	const cache = /* @__PURE__ */ new WeakMap();
	return (a) => {
		if (cache.has(a)) return cache.get(a);
		const result = f(a);
		cache.set(a, result);
		return result;
	};
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/equal.js
/** @internal */
const getAllObjectKeys = (obj) => {
	const keys = new Set(Reflect.ownKeys(obj));
	if (obj.constructor === Object) return keys;
	if (obj instanceof Error) keys.delete("stack");
	const proto = Object.getPrototypeOf(obj);
	let current = proto;
	while (current !== null && current !== Object.prototype) {
		const ownKeys = Reflect.ownKeys(current);
		for (let i = 0; i < ownKeys.length; i++) keys.add(ownKeys[i]);
		current = Object.getPrototypeOf(current);
	}
	if (keys.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) keys.delete("constructor");
	return keys;
};
/** @internal */
const byReferenceInstances = /* @__PURE__ */ new WeakSet();
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Predicate.js
/**
* Predicate and Refinement helpers for runtime checks, filtering, and type narrowing.
* This module provides small, pure functions you can combine to decide whether a
* value matches a condition and, when using refinements, narrow TypeScript types.
*
* Mental model:
* - A `Predicate<A>` is just `(a: A) => boolean`.
* - A `Refinement<A, B>` is a predicate that narrows `A` to `B` when true.
* - Guards like `isString` are predicates/refinements for common runtime types.
* - Combinators like `and`/`or` build new predicates from existing ones.
* - `Tuple` and `Struct` lift element/property predicates to compound values.
*
* Common tasks:
* - Reuse an existing predicate on a different input shape -> {@link mapInput}
* - Combine checks -> {@link and}, {@link or}, {@link not}, {@link xor}
* - Build tuple/object checks -> {@link Tuple}, {@link Struct}
* - Narrow `unknown` to a concrete type -> {@link Refinement}, {@link compose}
* - Check runtime types -> {@link isString}, {@link isNumber}, {@link isObject}
*
* Gotchas:
* - `isTruthy` uses JavaScript truthiness; `0`, "", and `false` are false.
* - `isObject` excludes arrays; use {@link isObjectOrArray} for both.
* - `isIterable` treats strings as iterable.
* - `isPromise`/`isPromiseLike` are structural checks (then/catch), not `instanceof`.
* - `isTupleOf` and `isTupleOfAtLeast` only check length, not element types.
*
* **Example** (Filter by a predicate)
*
* ```ts
* import * as Predicate from "effect/Predicate"
*
* const isPositive = (n: number) => n > 0
* const data = [2, -1, 3]
*
* console.log(data.filter(isPositive))
* ```
*
* See also: {@link Predicate}, {@link Refinement}, {@link and}, {@link or}, {@link mapInput}
*
* @since 2.0.0
*/
/**
* Checks whether a value is a `string`.
*
* When to use:
* - You need to guard an `unknown` value as a string.
* - You want to narrow in `if` statements.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `typeof input === "string"`.
*
* **Example** (Guard string)
*
* ```ts
* import { Predicate } from "effect"
*
* const data: unknown = "hi"
*
* if (Predicate.isString(data)) {
*   console.log(data.toUpperCase())
* }
* ```
*
* See also: {@link isNumber}, {@link isBoolean}, {@link Refinement}
*
* @category guards
* @since 2.0.0
*/
function isString(input) {
	return typeof input === "string";
}
/**
* Checks whether a value is a `number`.
*
* When to use:
* - You need to guard an `unknown` value as a number.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `typeof input === "number"`.
* - Does not exclude `NaN` or `Infinity`.
*
* **Example** (Guard number)
*
* ```ts
* import { Predicate } from "effect"
*
* const data: unknown = 42
*
* if (Predicate.isNumber(data)) {
*   console.log(data + 1)
* }
* ```
*
* See also: {@link isBigInt}, {@link isString}
*
* @category guards
* @since 2.0.0
*/
function isNumber(input) {
	return typeof input === "number";
}
/**
* Checks whether a value is a `symbol`.
*
* When to use:
* - You need to guard an `unknown` value as a symbol.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `typeof input === "symbol"`.
*
* **Example** (Guard symbol)
*
* ```ts
* import { Predicate } from "effect"
*
* const data: unknown = Symbol.for("id")
*
* if (Predicate.isSymbol(data)) {
*   console.log(data.description)
* }
* ```
*
* See also: {@link isPropertyKey}
*
* @category guards
* @since 2.0.0
*/
function isSymbol(input) {
	return typeof input === "symbol";
}
/**
* Checks whether a value is a valid `PropertyKey` (string, number, or symbol).
*
* When to use:
* - You need to guard unknown keys before indexing.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses {@link isString}, {@link isNumber}, and {@link isSymbol}.
*
* **Example** (Guard property key)
*
* ```ts
* import { Predicate } from "effect"
*
* const key: unknown = "name"
* const obj: Record<PropertyKey, unknown> = { name: "Ada" }
*
* if (Predicate.isPropertyKey(key) && key in obj) {
*   console.log(obj[key])
* }
* ```
*
* See also: {@link isString}, {@link isNumber}, {@link isSymbol}
*
* @category guards
* @since 4.0.0
*/
function isPropertyKey(u) {
	return isString(u) || isNumber(u) || isSymbol(u);
}
/**
* Checks whether a value is a `function`.
*
* When to use:
* - You need to guard an `unknown` value as callable.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `typeof input === "function"`.
*
* **Example** (Guard function)
*
* ```ts
* import { Predicate } from "effect"
*
* const data: unknown = () => 1
*
* if (Predicate.isFunction(data)) {
*   console.log(data())
* }
* ```
*
* See also: {@link isObjectKeyword}
*
* @category guards
* @since 2.0.0
*/
function isFunction(input) {
	return typeof input === "function";
}
/**
* Checks whether a value is not `undefined`.
*
* When to use:
* - You want to filter out `undefined` while preserving other falsy values.
*
* Behavior:
* - Pure; does not mutate input.
* - Returns a refinement that excludes `undefined`.
*
* **Example** (Filter undefined)
*
* ```ts
* import { Predicate } from "effect"
*
* const values = [1, undefined, 2]
* const defined = values.filter(Predicate.isNotUndefined)
*
* console.log(defined)
* ```
*
* See also: {@link isUndefined}, {@link isNotNullish}
*
* @category guards
* @since 2.0.0
*/
function isNotUndefined(input) {
	return input !== void 0;
}
/**
* Checks whether a value is not `null` and not `undefined`.
*
* When to use:
* - You want to filter out nullish values but keep other falsy ones.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `input != null`.
*
* **Example** (Filter non-nullish)
*
* ```ts
* import { Predicate } from "effect"
*
* const values = [0, null, "", undefined]
* const present = values.filter(Predicate.isNotNullish)
*
* console.log(present)
* ```
*
* See also: {@link isNullish}, {@link isNotNull}, {@link isNotUndefined}
*
* @category guards
* @since 4.0.0
*/
function isNotNullish(input) {
	return input != null;
}
/**
* A guard that always returns `true`.
*
* When to use:
* - You need a predicate that always accepts, e.g. as a placeholder.
*
* Behavior:
* - Pure; does not mutate input.
* - Always returns `true`.
*
* **Example** (Always matches)
*
* ```ts
* import { Predicate } from "effect"
*
* console.log(Predicate.isUnknown(123))
* ```
*
* See also: {@link isNever}
*
* @category guards
* @since 2.0.0
*/
function isUnknown(_) {
	return true;
}
/**
* Checks whether a value is a plain object (not an array, not `null`).
*
* When to use:
* - You need to accept objects but exclude arrays.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses `typeof input === "object" && input !== null && !Array.isArray(input)`.
*
* **Example** (Guard object)
*
* ```ts
* import { Predicate } from "effect"
*
* console.log(Predicate.isObject({ a: 1 }))
* console.log(Predicate.isObject([1, 2]))
* ```
*
* See also: {@link isObjectOrArray}, {@link isReadonlyObject}
*
* @category guards
* @since 4.0.0
*/
function isObject(input) {
	return typeof input === "object" && input !== null && !Array.isArray(input);
}
/**
* Checks whether a value is an `object` in the JavaScript sense (objects, arrays, functions).
*
* When to use:
* - You want to accept arrays and functions as well as objects.
*
* Behavior:
* - Pure; does not mutate input.
* - Returns `true` for arrays and functions, `false` for `null`.
*
* **Example** (Object keyword)
*
* ```ts
* import { Predicate } from "effect"
*
* console.log(Predicate.isObjectKeyword(() => 1))
* console.log(Predicate.isObjectKeyword(null))
* ```
*
* See also: {@link isObject}, {@link isObjectOrArray}
*
* @category guards
* @since 2.0.0
*/
function isObjectKeyword(input) {
	return typeof input === "object" && input !== null || isFunction(input);
}
/**
* Checks whether a value has a given property key.
*
* When to use:
* - You need to guard property access on `unknown` values.
* - You want a simple structural guard for objects.
*
* Behavior:
* - Pure; does not mutate input.
* - Uses the `in` operator and {@link isObjectKeyword}.
* - Does not check property value types.
*
* **Example** (Guard property)
*
* ```ts
* import { Predicate } from "effect"
*
* const hasName = Predicate.hasProperty("name")
* const data: unknown = { name: "Ada" }
*
* if (hasName(data)) {
*   console.log(data.name)
* }
* ```
*
* See also: {@link isTagged}, {@link isObjectKeyword}
*
* @category guards
* @since 2.0.0
*/
const hasProperty = /* @__PURE__ */ dual(2, (self, property) => isObjectKeyword(self) && property in self);
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Hash.js
/**
* This module provides utilities for hashing values in TypeScript.
*
* Hashing is the process of converting data into a fixed-size numeric value,
* typically used for data structures like hash tables, equality comparisons,
* and efficient data storage.
*
* @since 2.0.0
*/
/**
* The unique identifier used to identify objects that implement the Hash interface.
*
* @since 2.0.0
*/
const symbol$3 = "~effect/interfaces/Hash";
/**
* Computes a hash value for any given value.
*
* This function can hash primitives (numbers, strings, booleans, etc.) as well as
* objects, arrays, and other complex data structures. It automatically handles
* different types and provides a consistent hash value for equivalent inputs.
*
* **⚠️ CRITICAL IMMUTABILITY REQUIREMENT**: Objects being hashed must be treated as
* immutable after their first hash computation. Hash results are cached, so mutating
* an object after hashing will lead to stale cached values and broken hash-based
* operations. For mutable objects, use referential equality by implementing custom
* `Hash` interface that hashes the object reference, not its content.
*
* **FORBIDDEN**: Modifying objects after `Hash.hash()` has been called on them
* **ALLOWED**: Using immutable objects, or mutable objects with custom `Hash` interface
* that uses referential equality (hashes the object reference, not content)
*
* @example
* ```ts
* import { Hash } from "effect"
*
* // Hash primitive values
* console.log(Hash.hash(42)) // numeric hash
* console.log(Hash.hash("hello")) // string hash
* console.log(Hash.hash(true)) // boolean hash
*
* // Hash objects and arrays
* console.log(Hash.hash({ name: "John", age: 30 }))
* console.log(Hash.hash([1, 2, 3]))
* console.log(Hash.hash(new Date("2023-01-01")))
* ```
*
* @category hashing
* @since 2.0.0
*/
const hash = (self) => {
	switch (typeof self) {
		case "number": return number$1(self);
		case "bigint": return string$1(self.toString(10));
		case "boolean": return string$1(String(self));
		case "symbol": return string$1(String(self));
		case "string": return string$1(self);
		case "undefined": return string$1("undefined");
		case "function":
		case "object": if (self === null) return string$1("null");
		else if (self instanceof Date) return string$1(self.toISOString());
		else if (self instanceof RegExp) return string$1(self.toString());
		else {
			if (byReferenceInstances.has(self)) return random(self);
			if (hashCache.has(self)) return hashCache.get(self);
			const h = withVisitedTracking$1(self, () => {
				if (isHash(self)) return self[symbol$3]();
				else if (typeof self === "function") return random(self);
				else if (Array.isArray(self) || ArrayBuffer.isView(self)) return array(self);
				else if (self instanceof Map) return hashMap(self);
				else if (self instanceof Set) return hashSet(self);
				return structure(self);
			});
			hashCache.set(self, h);
			return h;
		}
		default: throw new Error(`BUG: unhandled typeof ${typeof self} - please report an issue at https://github.com/Effect-TS/effect/issues`);
	}
};
/**
* Generates a random hash value for an object and caches it.
*
* This function creates a random hash value for objects that don't have their own
* hash implementation. The hash value is cached using a WeakMap, so the same object
* will always return the same hash value during its lifetime.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* const obj1 = { a: 1 }
* const obj2 = { a: 1 }
*
* // Same object always returns the same hash
* console.log(Hash.random(obj1) === Hash.random(obj1)) // true
*
* // Different objects get different hashes
* console.log(Hash.random(obj1) === Hash.random(obj2)) // false
* ```
*
* @category hashing
* @since 2.0.0
*/
const random = (self) => {
	if (!randomHashCache.has(self)) randomHashCache.set(self, number$1(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
	return randomHashCache.get(self);
};
/**
* Combines two hash values into a single hash value.
*
* This function takes two hash values and combines them using a mathematical
* operation to produce a new hash value. It's useful for creating hash values
* of composite structures.
*
* @example
* ```ts
* import { Hash } from "effect" // combined hash value
*
* // Can also be used with pipe
* import { pipe } from "effect"
*
* const hash1 = Hash.hash("hello")
* const hash2 = Hash.hash("world")
*
* // Combine two hash values
* const combined = Hash.combine(hash2)(hash1)
* console.log(combined)
* const result = pipe(hash1, Hash.combine(hash2))
* ```
*
* @category hashing
* @since 2.0.0
*/
const combine = /* @__PURE__ */ dual(2, (self, b) => self * 53 ^ b);
/**
* Optimizes a hash value by applying bit manipulation techniques.
*
* This function takes a hash value and applies bitwise operations to improve
* the distribution of hash values, reducing the likelihood of collisions.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* const rawHash = 1234567890
* const optimizedHash = Hash.optimize(rawHash)
* console.log(optimizedHash) // optimized hash value
*
* // Often used internally by other hash functions
* const stringHash = Hash.optimize(Hash.string("hello"))
* ```
*
* @category hashing
* @since 2.0.0
*/
const optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
/**
* Checks if a value implements the Hash interface.
*
* This function determines whether a given value has the Hash symbol property,
* indicating that it can provide its own hash value implementation.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* class MyHashable implements Hash.Hash {
*   [Hash.symbol]() {
*     return 42
*   }
* }
*
* const obj = new MyHashable()
* console.log(Hash.isHash(obj)) // true
* console.log(Hash.isHash({})) // false
* console.log(Hash.isHash("string")) // false
* ```
*
* @category guards
* @since 2.0.0
*/
const isHash = (u) => hasProperty(u, symbol$3);
/**
* Computes a hash value for a number.
*
* This function creates a hash value for numeric inputs, handling special cases
* like NaN, Infinity, and -Infinity with distinct hash values. It uses bitwise operations to ensure good distribution
* of hash values across different numeric inputs.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* console.log(Hash.number(42)) // hash of 42
* console.log(Hash.number(3.14)) // hash of 3.14
* console.log(Hash.number(NaN)) // hash of "NaN"
* console.log(Hash.number(Infinity)) // 0 (special case)
*
* // Same numbers produce the same hash
* console.log(Hash.number(100) === Hash.number(100)) // true
* ```
*
* @category hashing
* @since 2.0.0
*/
const number$1 = (n) => {
	if (n !== n) return string$1("NaN");
	if (n === Infinity) return string$1("Infinity");
	if (n === -Infinity) return string$1("-Infinity");
	let h = n | 0;
	if (h !== n) h ^= n * 4294967295;
	while (n > 4294967295) h ^= n /= 4294967295;
	return optimize(h);
};
/**
* Computes a hash value for a string using the djb2 algorithm.
*
* This function implements a variation of the djb2 hash algorithm, which is
* known for its good distribution properties and speed. It processes each
* character of the string to produce a consistent hash value.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* console.log(Hash.string("hello")) // hash of "hello"
* console.log(Hash.string("world")) // hash of "world"
* console.log(Hash.string("")) // hash of empty string
*
* // Same strings produce the same hash
* console.log(Hash.string("test") === Hash.string("test")) // true
* ```
*
* @category hashing
* @since 2.0.0
*/
const string$1 = (str) => {
	let h = 5381, i = str.length;
	while (i) h = h * 33 ^ str.charCodeAt(--i);
	return optimize(h);
};
/**
* Computes a hash value for an object using only the specified keys.
*
* This function allows you to hash an object by considering only specific keys,
* which is useful when you want to create a hash based on a subset of an object's
* properties.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* const person = { name: "John", age: 30, city: "New York" }
*
* // Hash only specific keys
* const hash1 = Hash.structureKeys(person, ["name", "age"])
* const hash2 = Hash.structureKeys(person, ["name", "city"])
*
* console.log(hash1) // hash based on name and age
* console.log(hash2) // hash based on name and city
*
* // Same keys produce the same hash
* const person2 = { name: "John", age: 30, city: "Boston" }
* const hash3 = Hash.structureKeys(person2, ["name", "age"])
* console.log(hash1 === hash3) // true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structureKeys = (o, keys) => {
	let h = 12289;
	for (const key of keys) h ^= combine(hash(key), hash(o[key]));
	return optimize(h);
};
/**
* Computes a hash value for an object using all of its enumerable keys.
*
* This function creates a hash value based on all enumerable properties of an object.
* It's a convenient way to hash an entire object structure when you want to consider
* all its properties.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* const obj1 = { name: "John", age: 30 }
* const obj2 = { name: "Jane", age: 25 }
* const obj3 = { name: "John", age: 30 }
*
* console.log(Hash.structure(obj1)) // hash of obj1
* console.log(Hash.structure(obj2)) // different hash
* console.log(Hash.structure(obj3)) // same as obj1
*
* // Objects with same properties produce same hash
* console.log(Hash.structure(obj1) === Hash.structure(obj3)) // true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structure = (o) => structureKeys(o, getAllObjectKeys(o));
const iterableWith = (seed, f) => (iter) => {
	let h = seed;
	for (const element of iter) h ^= f(element);
	return optimize(h);
};
/**
* Computes a hash value for an array by hashing all of its elements.
*
* This function creates a hash value based on all elements in the array.
* The order of elements matters, so arrays with the same elements in different
* orders will produce different hash values.
*
* @example
* ```ts
* import { Hash } from "effect"
*
* const arr1 = [1, 2, 3]
* const arr2 = [1, 2, 3]
* const arr3 = [3, 2, 1]
*
* console.log(Hash.array(arr1)) // hash of [1, 2, 3]
* console.log(Hash.array(arr2)) // same hash as arr1
* console.log(Hash.array(arr3)) // different hash (different order)
*
* // Arrays with same elements in same order produce same hash
* console.log(Hash.array(arr1) === Hash.array(arr2)) // true
* console.log(Hash.array(arr1) === Hash.array(arr3)) // false
* ```
*
* @category hashing
* @since 2.0.0
*/
const array = /* @__PURE__ */ iterableWith(6151, hash);
const hashMap = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string$1("Map"), ([k, v]) => combine(hash(k), hash(v)));
const hashSet = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string$1("Set"), hash);
const randomHashCache = /* @__PURE__ */ new WeakMap();
const hashCache = /* @__PURE__ */ new WeakMap();
const visitedObjects = /* @__PURE__ */ new WeakSet();
function withVisitedTracking$1(obj, fn) {
	if (visitedObjects.has(obj)) return string$1("[Circular]");
	visitedObjects.add(obj);
	const result = fn();
	visitedObjects.delete(obj);
	return result;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Equal.js
/**
* The unique string identifier for the {@link Equal} interface.
*
* Use this as a computed property key when implementing custom equality on a
* class or object literal.
*
* When to use:
* - As the method name when implementing the {@link Equal} interface.
* - To check manually whether an object carries an equality method (prefer
*   {@link isEqual} instead).
*
* Behavior:
* - Pure constant — no allocation or side effects.
*
* **Example** (implementing Equal on a class)
*
* ```ts
* import { Equal, Hash } from "effect"
*
* class UserId implements Equal.Equal {
*   constructor(readonly id: string) {}
*
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof UserId && this.id === that.id
*   }
*
*   [Hash.symbol](): number {
*     return Hash.string(this.id)
*   }
* }
* ```
*
* @see {@link Equal} — the interface that uses this symbol
* @see {@link isEqual} — type guard for `Equal` implementors
*
* @since 2.0.0
*/
const symbol$2 = "~effect/interfaces/Equal";
function equals$2() {
	if (arguments.length === 1) return (self) => compareBoth(self, arguments[0]);
	return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
	if (self === that) return true;
	if (self == null || that == null) return false;
	const selfType = typeof self;
	if (selfType !== typeof that) return false;
	if (selfType === "number" && self !== self && that !== that) return true;
	if (selfType !== "object" && selfType !== "function") return false;
	if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) return false;
	return withCache(self, that, compareObjects);
}
/** Helper to run comparison with proper visited tracking */
function withVisitedTracking(self, that, fn) {
	const hasLeft = visitedLeft.has(self);
	const hasRight = visitedRight.has(that);
	if (hasLeft && hasRight) return true;
	if (hasLeft || hasRight) return false;
	visitedLeft.add(self);
	visitedRight.add(that);
	const result = fn();
	visitedLeft.delete(self);
	visitedRight.delete(that);
	return result;
}
const visitedLeft = /* @__PURE__ */ new WeakSet();
const visitedRight = /* @__PURE__ */ new WeakSet();
/** Helper to perform cached object comparison */
function compareObjects(self, that) {
	if (hash(self) !== hash(that)) return false;
	else if (self instanceof Date) {
		if (!(that instanceof Date)) return false;
		return self.toISOString() === that.toISOString();
	} else if (self instanceof RegExp) {
		if (!(that instanceof RegExp)) return false;
		return self.toString() === that.toString();
	}
	const selfIsEqual = isEqual(self);
	const thatIsEqual = isEqual(that);
	if (selfIsEqual !== thatIsEqual) return false;
	const bothEquals = selfIsEqual && thatIsEqual;
	if (typeof self === "function" && !bothEquals) return false;
	return withVisitedTracking(self, that, () => {
		if (bothEquals) return self[symbol$2](that);
		else if (Array.isArray(self)) {
			if (!Array.isArray(that) || self.length !== that.length) return false;
			return compareArrays(self, that);
		} else if (ArrayBuffer.isView(self)) {
			if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength) return false;
			return compareTypedArrays(self, that);
		} else if (self instanceof Map) {
			if (!(that instanceof Map) || self.size !== that.size) return false;
			return compareMaps(self, that);
		} else if (self instanceof Set) {
			if (!(that instanceof Set) || self.size !== that.size) return false;
			return compareSets(self, that);
		}
		return compareRecords(self, that);
	});
}
function withCache(self, that, f) {
	let selfMap = equalityCache.get(self);
	if (!selfMap) {
		selfMap = /* @__PURE__ */ new WeakMap();
		equalityCache.set(self, selfMap);
	} else if (selfMap.has(that)) return selfMap.get(that);
	const result = f(self, that);
	selfMap.set(that, result);
	let thatMap = equalityCache.get(that);
	if (!thatMap) {
		thatMap = /* @__PURE__ */ new WeakMap();
		equalityCache.set(that, thatMap);
	}
	thatMap.set(self, result);
	return result;
}
const equalityCache = /* @__PURE__ */ new WeakMap();
function compareArrays(self, that) {
	for (let i = 0; i < self.length; i++) if (!compareBoth(self[i], that[i])) return false;
	return true;
}
function compareTypedArrays(self, that) {
	if (self.length !== that.length) return false;
	for (let i = 0; i < self.length; i++) if (self[i] !== that[i]) return false;
	return true;
}
function compareRecords(self, that) {
	const selfKeys = getAllObjectKeys(self);
	const thatKeys = getAllObjectKeys(that);
	if (selfKeys.size !== thatKeys.size) return false;
	for (const key of selfKeys) if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) return false;
	return true;
}
/** @internal */
function makeCompareMap(keyEquivalence, valueEquivalence) {
	return function compareMaps(self, that) {
		for (const [selfKey, selfValue] of self) {
			let found = false;
			for (const [thatKey, thatValue] of that) if (keyEquivalence(selfKey, thatKey) && valueEquivalence(selfValue, thatValue)) {
				found = true;
				break;
			}
			if (!found) return false;
		}
		return true;
	};
}
const compareMaps = /* @__PURE__ */ makeCompareMap(compareBoth, compareBoth);
/** @internal */
function makeCompareSet(equivalence) {
	return function compareSets(self, that) {
		for (const selfValue of self) {
			let found = false;
			for (const thatValue of that) if (equivalence(selfValue, thatValue)) {
				found = true;
				break;
			}
			if (!found) return false;
		}
		return true;
	};
}
const compareSets = /* @__PURE__ */ makeCompareSet(compareBoth);
/**
* Checks whether a value implements the {@link Equal} interface.
*
* When to use:
* - To branch on whether a value supports custom equality before calling
*   its `[Equal.symbol]` method directly.
* - In generic utility code that needs to distinguish `Equal` implementors
*   from plain values.
*
* Behavior:
* - Pure function, no side effects.
* - Returns `true` if and only if `u` has a property keyed by
*   {@link symbol}.
* - Acts as a TypeScript type guard, narrowing the input to {@link Equal}.
*
* **Example** (type guard)
*
* ```ts
* import { Equal, Hash } from "effect"
*
* class Token implements Equal.Equal {
*   constructor(readonly value: string) {}
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof Token && this.value === that.value
*   }
*   [Hash.symbol](): number {
*     return Hash.string(this.value)
*   }
* }
*
* console.log(Equal.isEqual(new Token("abc"))) // true
* console.log(Equal.isEqual({ x: 1 }))         // false
* console.log(Equal.isEqual(42))                // false
* ```
*
* @see {@link Equal} — the interface being checked
* @see {@link symbol} — the property key that signals `Equal` support
*
* @category guards
* @since 2.0.0
*/
const isEqual = (u) => hasProperty(u, symbol$2);
/**
* Wraps {@link equals} as an `Equivalence<A>`.
*
* When to use:
* - When an API (e.g. `Array.dedupeWith`, `Equivalence.mapInput`) requires an
*   `Equivalence` and you want to reuse `Equal.equals`.
*
* Behavior:
* - Returns a function `(a: A, b: A) => boolean` that delegates to
*   {@link equals}.
* - Pure; allocates a thin wrapper on each call.
*
* **Example** (deduplicating with Equal semantics)
*
* ```ts
* import { Array, Equal } from "effect"
*
* const eq = Equal.asEquivalence<number>()
* const result = Array.dedupeWith([1, 2, 2, 3, 1], eq)
* console.log(result) // [1, 2, 3]
* ```
*
* @see {@link equals} — the underlying comparison function
*
* @category instances
* @since 2.0.0
*/
const asEquivalence = () => equals$2;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Redactable.js
/**
* Symbol used to identify objects that implement the {@link Redactable}
* protocol.
*
* Add a method under this key to make an object redactable. The method
* receives the current `Context` and must return the replacement value.
*
* - Use this symbol as the property key when implementing {@link Redactable}.
* - Registered globally via `Symbol.for("~effect/Redactable")`,
*   so it is identical across multiple copies of the library at runtime.
*
* **Example** (Masking an API key)
*
* ```ts
* import { Context, Redactable } from "effect"
*
* class ApiKey {
*   constructor(readonly raw: string) {}
*
*   [Redactable.symbolRedactable](_ctx: Context.Context<never>) {
*     return this.raw.slice(0, 4) + "..."
*   }
* }
* ```
*
* See also:
* - {@link Redactable} - the interface this symbol belongs to
* - {@link isRedactable} - check whether a value has this symbol
*
* @since 4.0.0
* @category symbol
*/
const symbolRedactable = /* @__PURE__ */ Symbol.for("~effect/Redactable");
/**
* Type guard that checks whether a value implements the {@link Redactable}
* interface.
*
* See also:
* - {@link Redactable} - the interface being checked
* - {@link redact} - applies redaction if the value is redactable
*
* @since 4.0.0
* @category guards
*/
const isRedactable = (u) => hasProperty(u, symbolRedactable);
/**
* Redacts a value if it implements {@link Redactable}, otherwise returns it
* unchanged.
*
* - Use this as the general-purpose entry point for redaction: it is safe to
*   call on any value.
* - Internally calls {@link isRedactable} and, if `true`, delegates to
*   {@link getRedacted}.
* - Not recursive: nested redactable values inside the returned object are not
*   automatically redacted.
* - Pure with respect to its argument (does not mutate the input).
*
* See also:
* - {@link isRedactable} - check before redacting
* - {@link getRedacted} - lower-level variant for known redactables
*
* @since 4.0.0
*/
function redact$1(u) {
	if (isRedactable(u)) return getRedacted(u);
	return u;
}
/**
* Calls `[symbolRedactable]` on a value that is already known to be
* {@link Redactable} and returns the result.
*
* - Use this when you have already verified the value is `Redactable` (e.g.,
*   via {@link isRedactable}) and want to avoid a second check.
* - Reads the current fiber's `Context` from the global fiber reference. If
*   no fiber is active, an empty `Context` is passed to the redaction
*   method.
* - Does not mutate the input.
*
* See also:
* - {@link redact} - higher-level variant that handles non-redactable values
* - {@link isRedactable} - type guard to verify before calling this
*
* @since 4.0.0
*/
function getRedacted(redactable) {
	return redactable[symbolRedactable](globalThis["~effect/Fiber/currentFiber"]?.context ?? emptyContext$1);
}
/** @internal */
const currentFiberTypeId = "~effect/Fiber/currentFiber";
const emptyContext$1 = {
	"~effect/Context": {},
	mapUnsafe: /* @__PURE__ */ new Map(),
	pipe() {
		return pipeArguments(this, arguments);
	}
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Formatter.js
/**
* Utilities for converting arbitrary JavaScript values into human-readable
* strings, with support for circular references, redaction, and common JS
* types that `JSON.stringify` handles poorly.
*
* Mental model:
* - A `Formatter<Value, Format>` is a callable `(value: Value) => Format`.
* - {@link format} is the general-purpose pretty-printer: it handles
*   primitives, arrays, objects, `BigInt`, `Symbol`, `Date`, `RegExp`,
*   `Set`, `Map`, class instances, and circular references.
* - {@link formatJson} is a safe `JSON.stringify` wrapper that silently
*   drops circular references and applies redaction.
* - Both functions accept a `space` option for indentation control.
*
* Common tasks:
* - Pretty-print any value for debugging / logging -> {@link format}
* - Serialize to JSON safely (no circular throws) -> {@link formatJson}
* - Format a single object property key -> {@link formatPropertyKey}
* - Format a property path like `["a"]["b"]` -> {@link formatPath}
* - Format a `Date` to ISO string safely -> {@link formatDate}
*
* Gotchas:
* - {@link format} output is **not** valid JSON; use {@link formatJson} when
*   you need parseable JSON.
* - {@link format} calls `toString()` on objects by default; pass
*   `ignoreToString: true` to disable.
* - {@link formatJson} silently omits circular references (the key is
*   dropped from the output).
* - Values implementing the `Redactable` protocol are automatically
*   redacted by both {@link format} and {@link formatJson}.
*
* **Example** (Pretty-print a value)
*
* ```ts
* import { Formatter } from "effect"
*
* const obj = { name: "Alice", scores: [100, 97] }
* console.log(Formatter.format(obj))
* // {"name":"Alice","scores":[100,97]}
*
* console.log(Formatter.format(obj, { space: 2 }))
* // {
* //   "name": "Alice",
* //   "scores": [
* //     100,
* //     97
* //   ]
* // }
* ```
*
* See also: {@link Formatter}, {@link format}, {@link formatJson}
*
* @since 4.0.0
*/
/**
* Converts any JavaScript value into a human-readable string.
*
* When to use:
* - Pretty-printing values for debugging, logging, or error messages.
* - You need to handle `BigInt`, `Symbol`, `Set`, `Map`, `Date`, `RegExp`,
*   or class instances that `JSON.stringify` cannot represent.
* - You want circular references shown as `"[Circular]"` instead of
*   throwing.
*
* Behavior:
* - Does not mutate input.
* - Output is **not** valid JSON; use {@link formatJson} when you need
*   parseable JSON.
* - Primitives: stringified naturally (`null`, `undefined`, `123`, `true`).
*   Strings are JSON-quoted.
* - Objects with a custom `toString` (not `Object.prototype.toString`):
*   `toString()` is called unless `ignoreToString` is `true`.
* - Errors with a `cause`: formatted as `"<message> (cause: <cause>)"`.
* - Iterables (`Set`, `Map`, etc.): formatted as
*   `ClassName([...elements])`.
* - Class instances: wrapped as `ClassName({...})`.
* - `Redactable` values are automatically redacted.
* - Arrays/objects with 0–1 entries are inline; larger ones are
*   pretty-printed when `space` is set.
* - Circular references are replaced with `"[Circular]"`.
*
* Options:
* - `space` — indentation unit (number of spaces, or a string like
*   `"\t"`). Defaults to `0` (compact).
* - `ignoreToString` — skip calling `toString()`. Defaults to `false`.
*
* **Example** (Compact output)
*
* ```ts
* import { Formatter } from "effect"
*
* console.log(Formatter.format({ a: 1, b: [2, 3] }))
* // {"a":1,"b":[2,3]}
* ```
*
* **Example** (Pretty-printed output)
*
* ```ts
* import { Formatter } from "effect"
*
* console.log(Formatter.format({ a: 1, b: [2, 3] }, { space: 2 }))
* // {
* //   "a": 1,
* //   "b": [
* //     2,
* //     3
* //   ]
* // }
* ```
*
* **Example** (Circular reference handling)
*
* ```ts
* import { Formatter } from "effect"
*
* const obj: any = { name: "loop" }
* obj.self = obj
* console.log(Formatter.format(obj))
* // {"name":"loop","self":[Circular]}
* ```
*
* See also: {@link formatJson}, {@link Formatter}
*
* @since 4.0.0
*/
function format$1(input, options) {
	const space = options?.space ?? 0;
	const seen = /* @__PURE__ */ new WeakSet();
	const gap = !space ? "" : typeof space === "number" ? " ".repeat(space) : space;
	const ind = (d) => gap.repeat(d);
	const wrap = (v, body) => {
		const ctor = v?.constructor;
		return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
	};
	const ownKeys = (o) => {
		try {
			return Reflect.ownKeys(o);
		} catch {
			return ["[ownKeys threw]"];
		}
	};
	function recur(v, d = 0) {
		if (Array.isArray(v)) {
			if (seen.has(v)) return CIRCULAR;
			seen.add(v);
			if (!gap || v.length <= 1) return `[${v.map((x) => recur(x, d)).join(",")}]`;
			const inner = v.map((x) => recur(x, d + 1)).join(",\n" + ind(d + 1));
			return `[\n${ind(d + 1)}${inner}\n${ind(d)}]`;
		}
		if (v instanceof Date) return formatDate(v);
		if (!options?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
			const s = safeToString(v);
			if (v instanceof Error && v.cause) return `${s} (cause: ${recur(v.cause, d)})`;
			return s;
		}
		if (typeof v === "string") return JSON.stringify(v);
		if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol") return String(v);
		if (typeof v === "bigint") return String(v) + "n";
		if (typeof v === "object" || typeof v === "function") {
			if (seen.has(v)) return CIRCULAR;
			seen.add(v);
			if (symbolRedactable in v) return format$1(getRedacted(v));
			if (Symbol.iterator in v) return `${v.constructor.name}(${recur(Array.from(v), d)})`;
			const keys = ownKeys(v);
			if (!gap || keys.length <= 1) return wrap(v, `{${keys.map((k) => `${formatPropertyKey(k)}:${recur(v[k], d)}`).join(",")}}`);
			return wrap(v, `{\n${keys.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur(v[k], d + 1)}`).join(",\n")}\n${ind(d)}}`);
		}
		return String(v);
	}
	return recur(input, 0);
}
const CIRCULAR = "[Circular]";
/**
* Formats a single property key for display.
*
* When to use:
* - You are building a custom formatter that needs to render object keys.
*
* Behavior:
* - String keys are JSON-quoted (e.g. `"foo"`).
* - Symbol and number keys are converted with `String()`.
* - Pure function; does not mutate input.
*
* **Example** (Format property keys)
*
* ```ts
* import { Formatter } from "effect"
*
* console.log(Formatter.formatPropertyKey("name"))
* // "name"
*
* console.log(Formatter.formatPropertyKey(Symbol.for("id")))
* // Symbol(id)
* ```
*
* See also: {@link formatPath}, {@link format}
*
* @internal
*/
function formatPropertyKey(name) {
	return typeof name === "string" ? JSON.stringify(name) : String(name);
}
/**
* Formats an array of property keys as a bracket-notation path string.
*
* When to use:
* - You need to display a path through a nested object (e.g. in error
*   messages or schema validation output).
*
* Behavior:
* - Each key is wrapped in brackets and formatted via
*   {@link formatPropertyKey}.
* - Returns an empty string for an empty path.
* - Pure function; does not mutate input.
*
* **Example** (Render a property path)
*
* ```ts
* import { Formatter } from "effect"
*
* console.log(Formatter.formatPath(["users", 0, "name"]))
* // ["users"][0]["name"]
* ```
*
* See also: {@link formatPropertyKey}, {@link format}
*
* @internal
*/
function formatPath(path) {
	return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
/**
* Formats a `Date` as an ISO 8601 string, returning `"Invalid Date"` for
* invalid dates instead of throwing.
*
* When to use:
* - You want a safe `toISOString()` that never throws.
*
* Behavior:
* - Returns `date.toISOString()` on success.
* - Returns `"Invalid Date"` if `toISOString()` throws (e.g. for
*   `new Date(NaN)`).
* - Pure function; does not mutate input.
*
* **Example** (Safe date formatting)
*
* ```ts
* import { Formatter } from "effect"
*
* console.log(Formatter.formatDate(new Date("2024-01-15T10:30:00Z")))
* // 2024-01-15T10:30:00.000Z
*
* console.log(Formatter.formatDate(new Date("invalid")))
* // Invalid Date
* ```
*
* See also: {@link format}
*
* @internal
*/
function formatDate(date) {
	try {
		return date.toISOString();
	} catch {
		return "Invalid Date";
	}
}
function safeToString(input) {
	try {
		const s = input.toString();
		return typeof s === "string" ? s : String(s);
	} catch {
		return "[toString threw]";
	}
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Inspectable.js
/**
* This module provides utilities for making values inspectable and debuggable in TypeScript.
*
* The Inspectable interface provides a standard way to implement custom string representations
* for objects, making them easier to debug and inspect. It includes support for JSON
* serialization, Node.js inspection, and safe circular reference handling.
*
* The module also includes redaction capabilities for sensitive data, allowing objects
* to provide different representations based on the current execution context.
*
* @example
* ```ts
* import { Inspectable } from "effect"
* import { format } from "effect/Formatter"
*
* class User extends Inspectable.Class {
*   constructor(
*     public readonly name: string,
*     public readonly email: string
*   ) {
*     super()
*   }
*
*   toJSON() {
*     return {
*       _tag: "User",
*       name: this.name,
*       email: this.email
*     }
*   }
* }
*
* const user = new User("Alice", "alice@example.com")
* console.log(user.toString()) // Pretty printed JSON
* console.log(format(user)) // Same as toString()
* ```
*
* @since 2.0.0
*/
/**
* Symbol used by Node.js for custom object inspection.
*
* This symbol is recognized by Node.js's `util.inspect()` function and the REPL
* for custom object representation. When an object has a method with this symbol,
* it will be called to determine how the object should be displayed.
*
* @example
* ```ts
* import { Inspectable } from "effect"
*
* class CustomObject {
*   constructor(private value: string) {}
*
*   [Inspectable.NodeInspectSymbol]() {
*     return `CustomObject(${this.value})`
*   }
* }
*
* const obj = new CustomObject("hello")
* console.log(obj) // Displays: CustomObject(hello)
* ```
*
* @since 2.0.0
* @category symbols
*/
const NodeInspectSymbol = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
/**
* Safely converts a value to a JSON-serializable representation, useful for
* implementing the `toJSON` method of the {@link Inspectable} interface.
*
* This function attempts to extract JSON data from objects that implement the
* `toJSON` method, recursively processes arrays, and handles errors gracefully.
* For objects that don't have a `toJSON` method, it applies redaction to
* protect sensitive information.
*
* @since 2.0.0
*/
const toJson = (input) => {
	try {
		if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) return input.toJSON();
		else if (Array.isArray(input)) return input.map(toJson);
	} catch {
		return "[toJSON threw]";
	}
	return redact$1(input);
};
/**
* A base prototype object that implements the {@link Inspectable} interface.
*
* This object provides default implementations for the {@link Inspectable} methods.
* It can be used as a prototype for objects that want to be inspectable,
* or as a mixin to add inspection capabilities to existing objects.
*
* @example
* ```ts
* import { Inspectable } from "effect"
*
* // Use as prototype
* const myObject = Object.create(Inspectable.BaseProto)
* myObject.name = "example"
* myObject.value = 42
*
* console.log(myObject.toString()) // Pretty printed representation
*
* // Or extend in a constructor
* function MyClass(this: any, name: string) {
*   this.name = name
* }
* MyClass.prototype = Object.create(Inspectable.BaseProto)
* MyClass.prototype.constructor = MyClass
* ```
*
* @since 2.0.0
*/
const BaseProto = {
	toJSON() {
		return toJson(this);
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	toString() {
		return format$1(this.toJSON());
	}
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Utils.js
/**
* An `IterableIterator` that yields its wrapped value exactly once.
*
* When to use:
*
* - Implement `[Symbol.iterator]()` on Effect-like types so they can be
*   `yield*`-ed inside generator functions (e.g. `Effect.gen`, `Option.gen`).
* - You almost never construct this directly — it is created internally by
*   yieldable types.
*
* Behavior:
*
* - The first call to `next()` returns `{ value: self, done: false }`.
* - Every subsequent call returns `{ value: a, done: true }` where `a` is
*   the argument passed to `next()`.
* - `[Symbol.iterator]()` returns a **new** `SingleShotGen` wrapping the same
*   value, so the outer type can be iterated multiple times.
* - Does not mutate the wrapped value.
*
* **Example** (Yielding a wrapped value in a generator)
*
* ```ts
* import { Utils } from "effect"
*
* const gen = new Utils.SingleShotGen<string, number>("hello")
*
* // First call yields the wrapped value
* console.log(gen.next(0))
* // { value: "hello", done: false }
*
* // Second call signals completion with the provided value
* console.log(gen.next(42))
* // { value: 42, done: true }
* ```
*
* @see {@link Gen} — the type-level signature that relies on `SingleShotGen`
*
* @category constructors
* @since 2.0.0
*/
var SingleShotGen = class SingleShotGen {
	called = false;
	self;
	constructor(self) {
		this.self = self;
	}
	/**
	* @since 2.0.0
	*/
	next(a) {
		return this.called ? {
			value: a,
			done: true
		} : (this.called = true, {
			value: this.self,
			done: false
		});
	}
	/**
	* @since 2.0.0
	*/
	[Symbol.iterator]() {
		return new SingleShotGen(this.self);
	}
};
const InternalTypeId = "~effect/Utils/internal";
const standard = { [InternalTypeId]: (body) => {
	return body();
} };
const forced = { [InternalTypeId]: (body) => {
	try {
		return body();
	} finally {}
} };
/** @internal */
const internalCall = /* @__PURE__ */ standard[InternalTypeId](() => (/* @__PURE__ */ new Error()).stack)?.includes(InternalTypeId) === true ? standard[InternalTypeId] : forced[InternalTypeId];
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/core.js
/** @internal */
const EffectTypeId = `~effect/Effect`;
/** @internal */
const ExitTypeId = `~effect/Exit`;
const effectVariance = {
	_A: identity,
	_E: identity,
	_R: identity
};
/** @internal */
const identifier = `${EffectTypeId}/identifier`;
/** @internal */
const args = `${EffectTypeId}/args`;
/** @internal */
const evaluate = `${EffectTypeId}/evaluate`;
/** @internal */
const contA = `${EffectTypeId}/successCont`;
/** @internal */
const contE = `${EffectTypeId}/failureCont`;
/** @internal */
const contAll = `${EffectTypeId}/ensureCont`;
/** @internal */
const Yield = /* @__PURE__ */ Symbol.for("effect/Effect/Yield");
/** @internal */
const PipeInspectableProto = {
	pipe() {
		return pipeArguments(this, arguments);
	},
	toJSON() {
		return { ...this };
	},
	toString() {
		return format$1(this.toJSON(), {
			ignoreToString: true,
			space: 2
		});
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
};
/** @internal */
const EffectProto = {
	[EffectTypeId]: effectVariance,
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	},
	toJSON() {
		return {
			_id: "Effect",
			op: this[identifier],
			...args in this ? { args: this[args] } : void 0
		};
	}
};
/** @internal */
const isEffect$1 = (u) => hasProperty(u, EffectTypeId);
/** @internal */
const isExit = (u) => hasProperty(u, ExitTypeId);
/** @internal */
const CauseTypeId = "~effect/Cause";
/** @internal */
const CauseReasonTypeId = "~effect/Cause/Reason";
/** @internal */
const isCause = (self) => hasProperty(self, CauseTypeId);
/** @internal */
var CauseImpl = class {
	[CauseTypeId];
	reasons;
	constructor(failures) {
		this[CauseTypeId] = CauseTypeId;
		this.reasons = failures;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	toJSON() {
		return {
			_id: "Cause",
			failures: this.reasons.map((f) => f.toJSON())
		};
	}
	toString() {
		return `Cause(${format$1(this.reasons)})`;
	}
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	[symbol$2](that) {
		return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals$2(e, that.reasons[i]));
	}
	[symbol$3]() {
		return array(this.reasons);
	}
};
const annotationsMap = /* @__PURE__ */ new WeakMap();
/** @internal */
var ReasonBase = class {
	[CauseReasonTypeId];
	annotations;
	_tag;
	constructor(_tag, annotations, originalError) {
		this[CauseReasonTypeId] = CauseReasonTypeId;
		this._tag = _tag;
		if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
			const prevAnnotations = annotationsMap.get(originalError);
			if (prevAnnotations) annotations = new Map([...prevAnnotations, ...annotations]);
			annotationsMap.set(originalError, annotations);
		}
		this.annotations = annotations;
	}
	annotate(annotations, options) {
		if (annotations.mapUnsafe.size === 0) return this;
		const newAnnotations = new Map(this.annotations);
		annotations.mapUnsafe.forEach((value, key) => {
			if (options?.overwrite !== true && newAnnotations.has(key)) return;
			newAnnotations.set(key, value);
		});
		const self = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		self.annotations = newAnnotations;
		return self;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	toString() {
		return format$1(this);
	}
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
/** @internal */
const constEmptyAnnotations = /* @__PURE__ */ new Map();
/** @internal */
var Fail = class extends ReasonBase {
	error;
	constructor(error, annotations = constEmptyAnnotations) {
		super("Fail", annotations, error);
		this.error = error;
	}
	toString() {
		return `Fail(${format$1(this.error)})`;
	}
	toJSON() {
		return {
			_tag: "Fail",
			error: this.error
		};
	}
	[symbol$2](that) {
		return isFailReason(that) && equals$2(this.error, that.error) && equals$2(this.annotations, that.annotations);
	}
	[symbol$3]() {
		return combine(string$1(this._tag))(combine(hash(this.error))(hash(this.annotations)));
	}
};
/** @internal */
const causeFromReasons = (reasons) => new CauseImpl(reasons);
/** @internal */
const causeFail = (error) => new CauseImpl([new Fail(error)]);
/** @internal */
var Die = class extends ReasonBase {
	defect;
	constructor(defect, annotations = constEmptyAnnotations) {
		super("Die", annotations, defect);
		this.defect = defect;
	}
	toString() {
		return `Die(${format$1(this.defect)})`;
	}
	toJSON() {
		return {
			_tag: "Die",
			defect: this.defect
		};
	}
	[symbol$2](that) {
		return isDieReason(that) && equals$2(this.defect, that.defect) && equals$2(this.annotations, that.annotations);
	}
	[symbol$3]() {
		return combine(string$1(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
	}
};
/** @internal */
const causeDie = (defect) => new CauseImpl([new Die(defect)]);
/** @internal */
const causeAnnotate = /* @__PURE__ */ dual((args) => isCause(args[0]), (self, annotations, options) => {
	if (annotations.mapUnsafe.size === 0) return self;
	return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options)));
});
/** @internal */
const isFailReason = (self) => self._tag === "Fail";
/** @internal */
const isDieReason = (self) => self._tag === "Die";
/** @internal */
const isInterruptReason = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
	return exitDie(`Effect.evaluate: Not implemented`);
}
/** @internal */
const makePrimitiveProto = (options) => ({
	...EffectProto,
	[identifier]: options.op,
	[evaluate]: options[evaluate] ?? defaultEvaluate,
	[contA]: options[contA],
	[contE]: options[contE],
	[contAll]: options[contAll]
});
/** @internal */
const makePrimitive = (options) => {
	const Proto = makePrimitiveProto(options);
	return function() {
		const self = Object.create(Proto);
		self[args] = options.single === false ? arguments : arguments[0];
		return self;
	};
};
/** @internal */
const makeExit = (options) => {
	const Proto = {
		...makePrimitiveProto(options),
		[ExitTypeId]: ExitTypeId,
		_tag: options.op,
		get [options.prop]() {
			return this[args];
		},
		toString() {
			return `${options.op}(${format$1(this[args])})`;
		},
		toJSON() {
			return {
				_id: "Exit",
				_tag: options.op,
				[options.prop]: this[args]
			};
		},
		[symbol$2](that) {
			return isExit(that) && that._tag === this._tag && equals$2(this[args], that[args]);
		},
		[symbol$3]() {
			return combine(string$1(options.op), hash(this[args]));
		}
	};
	return function(value) {
		const self = Object.create(Proto);
		self[args] = value;
		return self;
	};
};
/** @internal */
const exitSucceed = /* @__PURE__ */ makeExit({
	op: "Success",
	prop: "value",
	[evaluate](fiber) {
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](this[args], fiber, this) : fiber.yieldWith(this);
	}
});
/** @internal */
const StackTraceKey = { key: "effect/Cause/StackTrace" };
/** @internal */
const exitFailCause = /* @__PURE__ */ makeExit({
	op: "Failure",
	prop: "cause",
	[evaluate](fiber) {
		let cause = this[args];
		let annotated = false;
		if (fiber.currentStackFrame) {
			cause = causeAnnotate(cause, { mapUnsafe: new Map([[StackTraceKey.key, fiber.currentStackFrame]]) });
			annotated = true;
		}
		let cont = fiber.getCont(contE);
		while (fiber.interruptible && fiber._interruptedCause && cont) cont = fiber.getCont(contE);
		return cont ? cont[contE](cause, fiber, annotated ? void 0 : this) : fiber.yieldWith(annotated ? this : exitFailCause(cause));
	}
});
/** @internal */
const exitFail = (e) => exitFailCause(causeFail(e));
/** @internal */
const exitDie = (defect) => exitFailCause(causeDie(defect));
/** @internal */
const withFiber$1 = /* @__PURE__ */ makePrimitive({
	op: "WithFiber",
	[evaluate](fiber) {
		return this[args](fiber);
	}
});
/** @internal */
const YieldableError = /* @__PURE__ */ function() {
	class YieldableError extends globalThis.Error {}
	const proto = /* @__PURE__ */ makePrimitiveProto({
		op: "YieldableError",
		[evaluate]() {
			return exitFail(this);
		}
	});
	delete proto.toString;
	Object.assign(YieldableError.prototype, proto);
	return YieldableError;
}();
/** @internal */
const Error$3 = /* @__PURE__ */ function() {
	const plainArgsSymbol = /* @__PURE__ */ Symbol.for("effect/Data/Error/plainArgs");
	return class Base extends YieldableError {
		constructor(args) {
			super(args?.message, args?.cause ? { cause: args.cause } : void 0);
			if (args) {
				Object.assign(this, args);
				Object.defineProperty(this, plainArgsSymbol, {
					value: args,
					enumerable: false
				});
			}
		}
		toJSON() {
			return {
				...this[plainArgsSymbol],
				...this
			};
		}
	};
}();
/** @internal */
const TaggedError$1 = (tag) => {
	class Base extends Error$3 {
		_tag = tag;
	}
	Base.prototype.name = tag;
	return Base;
};
TaggedError$1("NoSuchElementError");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Effectable.js
/**
* Create a low-level `Effect` prototype.
*
* When the effect is evaluated, it will call `evaluate` with the current fiber.
*
* @since 4.0.0
* @category Prototypes
*/
const Prototype = (options) => makePrimitiveProto({
	op: options.label,
	[evaluate]: options.evaluate
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Equivalence.js
/**
* Creates a custom equivalence relation with an optimized reference equality check.
*
* When to use this:
* - When you need a custom equivalence that isn't just strict equality
* - When creating equivalences for complex types with custom comparison logic
* - When you want the performance benefit of reference equality optimization
*
* Behavior:
* - Does not mutate inputs
* - First checks reference equality (`===`) for performance; if values are identical, returns `true` without calling the function
* - Falls back to the provided equivalence function if values are not the same reference
* - The provided function must satisfy reflexive, symmetric, and transitive properties
*
* **Example** (Case-insensitive string equivalence)
*
* ```ts
* import { Equivalence } from "effect"
*
* const caseInsensitive = Equivalence.make<string>((a, b) =>
*   a.toLowerCase() === b.toLowerCase()
* )
*
* console.log(caseInsensitive("Hello", "HELLO")) // true
* console.log(caseInsensitive("foo", "bar")) // false
*
* // Same reference optimization
* const str = "test"
* console.log(caseInsensitive(str, str)) // true (fast path)
* ```
*
* **Example** (Numeric tolerance equivalence)
*
* ```ts
* import { Equivalence } from "effect"
*
* const tolerance = Equivalence.make<number>((a, b) => Math.abs(a - b) < 0.0001)
*
* console.log(tolerance(1.0, 1.0001)) // false
* console.log(tolerance(1.0, 1.00001)) // true
* ```
*
* See also: {@link strictEqual}, {@link mapInput}
*
* @category constructors
* @since 2.0.0
*/
const make$20 = (isEquivalent) => (self, that) => self === that || isEquivalent(self, that);
const isStrictEquivalent = (x, y) => x === y;
/**
* Creates an equivalence relation that uses strict equality (`===`) to compare values.
*
* When to use this:
* - For primitive types (numbers, strings, booleans) where `===` is appropriate
* - When you need reference equality for objects (same object instance)
* - As a building block for more complex equivalences via {@link mapInput} or {@link combine}
* - When performance is critical and you don't need structural equality
*
* Behavior:
* - Does not mutate inputs
* - Uses JavaScript's strict equality operator (`===`)
* - For primitives: compares values directly
* - For objects: compares by reference (same object instance)
* - Note: `NaN !== NaN`, so `NaN` values are never considered equivalent
*
* **Example** (Primitive types)
*
* ```ts
* import { Equivalence } from "effect"
*
* const strictEq = Equivalence.strictEqual<number>()
*
* console.log(strictEq(1, 1)) // true
* console.log(strictEq(1, 2)) // false
* console.log(strictEq(NaN, NaN)) // false (NaN !== NaN)
* ```
*
* **Example** (Reference equality for objects)
*
* ```ts
* import { Equivalence } from "effect"
*
* const obj = { value: 42 }
* const strictObjEq = Equivalence.strictEqual<typeof obj>()
*
* console.log(strictObjEq(obj, obj)) // true
* console.log(strictObjEq(obj, { value: 42 })) // false (different references)
* ```
*
* See also: {@link make}, {@link Equal} (for structural equality)
*
* @category constructors
* @since 4.0.0
*/
const strictEqual = () => isStrictEquivalent;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/option.js
/**
* @since 2.0.0
*/
const TypeId$30 = "~effect/data/Option";
const CommonProto$1 = {
	[TypeId$30]: { _A: (_) => _ },
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SomeProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto$1), {
	_tag: "Some",
	_op: "Some",
	[symbol$2](that) {
		return isOption(that) && isSome$1(that) && equals$2(this.value, that.value);
	},
	[symbol$3]() {
		return combine(hash(this._tag))(hash(this.value));
	},
	toString() {
		return `some(${format$1(this.value)})`;
	},
	toJSON() {
		return {
			_id: "Option",
			_tag: this._tag,
			value: toJson(this.value)
		};
	}
});
Object.defineProperty(SomeProto, "valueOrUndefined", { get() {
	return this.value;
} });
const NoneHash = /* @__PURE__ */ hash("None");
const NoneProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto$1), {
	_tag: "None",
	_op: "None",
	valueOrUndefined: void 0,
	[symbol$2](that) {
		return isOption(that) && isNone$1(that);
	},
	[symbol$3]() {
		return NoneHash;
	},
	toString() {
		return `none()`;
	},
	toJSON() {
		return {
			_id: "Option",
			_tag: this._tag
		};
	}
});
/** @internal */
const isOption = (input) => hasProperty(input, TypeId$30);
/** @internal */
const isNone$1 = (fa) => fa._tag === "None";
/** @internal */
const isSome$1 = (fa) => fa._tag === "Some";
/** @internal */
const none$1 = /* @__PURE__ */ Object.create(NoneProto);
/** @internal */
const some$1 = (value) => {
	const a = Object.create(SomeProto);
	a.value = value;
	return a;
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/result.js
const TypeId$29 = "~effect/data/Result";
const CommonProto = {
	[TypeId$29]: {
		/* v8 ignore next 2 */
		_A: (_) => _,
		_E: (_) => _
	},
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SuccessProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
	_tag: "Success",
	_op: "Success",
	[symbol$2](that) {
		return isResult(that) && isSuccess(that) && equals$2(this.success, that.success);
	},
	[symbol$3]() {
		return combine(hash(this._tag))(hash(this.success));
	},
	toString() {
		return `success(${format$1(this.success)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			value: toJson(this.success)
		};
	}
});
const FailureProto = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(CommonProto), {
	_tag: "Failure",
	_op: "Failure",
	[symbol$2](that) {
		return isResult(that) && isFailure$1(that) && equals$2(this.failure, that.failure);
	},
	[symbol$3]() {
		return combine(hash(this._tag))(hash(this.failure));
	},
	toString() {
		return `failure(${format$1(this.failure)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			failure: toJson(this.failure)
		};
	}
});
/** @internal */
const isResult = (input) => hasProperty(input, TypeId$29);
/** @internal */
const isFailure$1 = (result) => result._tag === "Failure";
/** @internal */
const isSuccess = (result) => result._tag === "Success";
/** @internal */
const fail$6 = (failure) => {
	const a = Object.create(FailureProto);
	a.failure = failure;
	return a;
};
/** @internal */
const succeed$5 = (success) => {
	const a = Object.create(SuccessProto);
	a.success = success;
	return a;
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Option.js
/**
* Creates an `Option` representing the absence of a value.
*
* **When to use**
*
* - Representing a missing or uninitialized value
* - Returning "no result" from a function
*
* **Behavior**
*
* - Returns `Option<never>`, which is a subtype of `Option<A>` for any `A`
* - Always returns the same singleton instance
*
* **Example** (Creating an empty Option)
*
* ```ts
* import { Option } from "effect"
*
* //      ┌─── Option<never>
* //      ▼
* const noValue = Option.none()
*
* console.log(noValue)
* // Output: { _id: 'Option', _tag: 'None' }
* ```
*
* @see {@link some} for the opposite operation.
*
* @category Constructors
* @since 2.0.0
*/
const none = () => none$1;
/**
* Wraps the given value into an `Option` to represent its presence.
*
* **When to use**
*
* - Wrapping a known-present value as `Option`
* - Returning a successful result from a partial function
*
* **Behavior**
*
* - Always returns `Some<A>`
* - Does not filter `null` or `undefined`; use {@link fromNullishOr} for that
*
* **Example** (Wrapping a value)
*
* ```ts
* import { Option } from "effect"
*
* //      ┌─── Option<number>
* //      ▼
* const value = Option.some(1)
*
* console.log(value)
* // Output: { _id: 'Option', _tag: 'Some', value: 1 }
* ```
*
* @see {@link none} for the opposite operation.
*
* @category Constructors
* @since 2.0.0
*/
const some = some$1;
/**
* Checks whether an `Option` is `None` (absent).
*
* **When to use**
*
* - Branching on absence before accessing `.value`
*
* **Behavior**
*
* - Acts as a type guard, narrowing to `None<A>`
*
* **Example** (Checking for None)
*
* ```ts
* import { Option } from "effect"
*
* console.log(Option.isNone(Option.some(1)))
* // Output: false
*
* console.log(Option.isNone(Option.none()))
* // Output: true
* ```
*
* @see {@link isSome} for the opposite check.
*
* @category Guards
* @since 2.0.0
*/
const isNone = isNone$1;
/**
* Checks whether an `Option` contains a value (`Some`).
*
* **When to use**
*
* - Branching on presence before accessing `.value`
*
* **Behavior**
*
* - Acts as a type guard, narrowing to `Some<A>`
*
* **Example** (Checking for Some)
*
* ```ts
* import { Option } from "effect"
*
* console.log(Option.isSome(Option.some(1)))
* // Output: true
*
* console.log(Option.isSome(Option.none()))
* // Output: false
* ```
*
* @see {@link isNone} for the opposite check.
*
* @category Guards
* @since 2.0.0
*/
const isSome = isSome$1;
/**
* Extracts the value from a `Some`, or returns `undefined` for `None`.
*
* **When to use**
*
* - Interoping with APIs that use `undefined` for missing values
*
* **Behavior**
*
* - `Some` → the inner value
* - `None` → `undefined`
*
* **Example** (Unwrapping to undefined)
*
* ```ts
* import { Option } from "effect"
*
* console.log(Option.getOrUndefined(Option.some(1)))
* // Output: 1
*
* console.log(Option.getOrUndefined(Option.none()))
* // Output: undefined
* ```
*
* @see {@link getOrNull} to return `null` instead
* @see {@link getOrElse} for a custom fallback
*
* @category Getters
* @since 2.0.0
*/
const getOrUndefined = /* @__PURE__ */ (/* @__PURE__ */ dual(2, (self, onNone) => isNone(self) ? onNone() : self.value))(constUndefined);
/**
* Transforms the value inside a `Some` using the provided function, leaving
* `None` unchanged.
*
* **When to use**
*
* - Applying a pure transformation to an optional value
* - Chaining transformations in a pipeline
*
* **Behavior**
*
* - `Some` → applies `f` and wraps the result in a new `Some`
* - `None` → returns `None` unchanged
* - Does not mutate the input
*
* **Example** (Mapping over an Option)
*
* ```ts
* import { Option } from "effect"
*
* console.log(Option.map(Option.some(2), (n) => n * 2))
* // Output: { _id: 'Option', _tag: 'Some', value: 4 }
*
* console.log(Option.map(Option.none(), (n: number) => n * 2))
* // Output: { _id: 'Option', _tag: 'None' }
* ```
*
* @see {@link flatMap} when `f` returns an `Option`
* @see {@link as} to replace the value with a constant
*
* @category Mapping
* @since 2.0.0
*/
const map$5 = /* @__PURE__ */ dual(2, (self, f) => isNone(self) ? none() : some(f(self.value)));
/**
* Filters an `Option` using a predicate. Returns `None` if the predicate is
* not satisfied or the input is `None`.
*
* **When to use**
*
* - Discarding values that don't meet a condition
* - Narrowing the type via a refinement predicate
*
* **Behavior**
*
* - `None` → `None`
* - `Some` where `predicate(value)` is `true` → `Some(value)`
* - `Some` where `predicate(value)` is `false` → `None`
* - Supports refinements for type narrowing
*
* **Example** (Filtering with a predicate)
*
* ```ts
* import { Option } from "effect"
*
* const removeEmpty = (input: Option.Option<string>) =>
*   Option.filter(input, (value) => value !== "")
*
* console.log(removeEmpty(Option.some("hello")))
* // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
*
* console.log(removeEmpty(Option.some("")))
* // Output: { _id: 'Option', _tag: 'None' }
*
* console.log(removeEmpty(Option.none()))
* // Output: { _id: 'Option', _tag: 'None' }
* ```
*
* @see {@link filterMap} to transform and filter simultaneously
* @see {@link exists} to test without filtering
*
* @category Filtering
* @since 2.0.0
*/
const filter$1 = /* @__PURE__ */ dual(2, (self, predicate) => isNone(self) ? none() : predicate(self.value) ? some(self.value) : none());
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Context.js
/**
* @since 4.0.0
* @category Type Identifiers
*/
const ServiceTypeId = "~effect/Context/Service";
/**
* @example
* ```ts
* import { Context } from "effect"
*
* // Create a simple service
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* // Create a service class
* class Config extends Context.Service<Config, {
*   port: number
* }>()("Config") {}
*
* // Use the services to create contexts
* const db = Context.make(Database, {
*   query: (sql) => `Result: ${sql}`
* })
* const config = Context.make(Config, { port: 8080 })
* ```
*
* @since 4.0.0
* @category Constructors
*/
const Service = function() {
	const prevLimit = Error.stackTraceLimit;
	Error.stackTraceLimit = 2;
	const err = /* @__PURE__ */ new Error();
	Error.stackTraceLimit = prevLimit;
	function KeyClass() {}
	const self = KeyClass;
	Object.setPrototypeOf(self, ServiceProto);
	Object.defineProperty(self, "stack", { get() {
		return err.stack;
	} });
	if (arguments.length > 0) {
		self.key = arguments[0];
		if (arguments[1]?.defaultValue) {
			self[ReferenceTypeId] = ReferenceTypeId;
			self.defaultValue = arguments[1].defaultValue;
		}
		return self;
	}
	return function(key, options) {
		self.key = key;
		if (options?.make) self.make = options.make;
		return self;
	};
};
const ServiceProto = {
	[ServiceTypeId]: ServiceTypeId,
	.../* @__PURE__ */ Prototype({
		label: "Service",
		evaluate(fiber) {
			return exitSucceed(get$1(fiber.context, this));
		}
	}),
	toJSON() {
		return {
			_id: "Service",
			key: this.key,
			stack: this.stack
		};
	},
	of(self) {
		return self;
	},
	context(self) {
		return make$18(this, self);
	},
	use(f) {
		return withFiber$1((fiber) => f(get$1(fiber.context, this)));
	},
	useSync(f) {
		return withFiber$1((fiber) => exitSucceed(f(get$1(fiber.context, this))));
	}
};
const ReferenceTypeId = "~effect/Context/Reference";
const TypeId$28 = "~effect/Context";
/**
* @example
* ```ts
* import { Context } from "effect"
*
* // Create a context from a Map (unsafe)
* const map = new Map([
*   ["Logger", { log: (msg: string) => console.log(msg) }]
* ])
*
* const context = Context.makeUnsafe(map)
* ```
*
* @since 4.0.0
* @category Constructors
*/
const makeUnsafe$5 = (mapUnsafe) => {
	const self = Object.create(Proto$10);
	self.mapUnsafe = mapUnsafe;
	self.mutable = false;
	return self;
};
const Proto$10 = {
	...PipeInspectableProto,
	[TypeId$28]: { _Services: (_) => _ },
	toJSON() {
		return {
			_id: "Context",
			services: Array.from(this.mapUnsafe).map(([key, value]) => ({
				key,
				value
			}))
		};
	},
	[symbol$2](that) {
		if (!isContext(that) || this.mapUnsafe.size !== that.mapUnsafe.size) return false;
		for (const k of this.mapUnsafe.keys()) if (!that.mapUnsafe.has(k) || !equals$2(this.mapUnsafe.get(k), that.mapUnsafe.get(k))) return false;
		return true;
	},
	[symbol$3]() {
		return number$1(this.mapUnsafe.size);
	}
};
/**
* Checks if the provided argument is a `Context`.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* assert.strictEqual(Context.isContext(Context.empty()), true)
* ```
*
* @since 4.0.0
* @category Guards
*/
const isContext = (u) => hasProperty(u, TypeId$28);
/**
* Checks if the provided argument is a `Reference`.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
* })
*
* assert.strictEqual(Context.isReference(LoggerRef), true)
* assert.strictEqual(Context.isReference(Context.Service("Key")), false)
* ```
*
* @since 4.0.0
* @category Guards
*/
const isReference = (u) => hasProperty(u, ReferenceTypeId);
/**
* Returns an empty `Context`.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* assert.strictEqual(Context.isContext(Context.empty()), true)
* ```
*
* @since 4.0.0
* @category Constructors
*/
const empty$8 = () => emptyContext;
const emptyContext = /* @__PURE__ */ makeUnsafe$5(/* @__PURE__ */ new Map());
/**
* Creates a new `Context` with a single service associated to the key.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
* ```
*
* @since 4.0.0
* @category Constructors
*/
const make$18 = (key, service) => makeUnsafe$5(new Map([[key.key, service]]));
/**
* Adds a service to a given `Context`.
*
* @example
* ```ts
* import { pipe, Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const someContext = Context.make(Port, { PORT: 8080 })
*
* const context = pipe(
*   someContext,
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
* assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
* ```
*
* @since 4.0.0
* @category Adders
*/
const add = /* @__PURE__ */ dual(3, (self, key, service) => withMapUnsafe(self, (map) => {
	map.set(key.key, service);
}));
/**
* Get a service from the context that corresponds to the given key, or
* use the fallback value.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const Logger = Context.Service<{ log: (msg: string) => void }>("Logger")
* const Database = Context.Service<{ query: (sql: string) => string }>(
*   "Database"
* )
*
* const context = Context.make(Logger, {
*   log: (msg: string) => console.log(msg)
* })
*
* const logger = Context.getOrElse(context, Logger, () => ({ log: () => {} }))
* const database = Context.getOrElse(
*   context,
*   Database,
*   () => ({ query: () => "fallback" })
* )
*
* assert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })
* assert.deepStrictEqual(database, { query: () => "fallback" })
* ```
*
* @since 4.0.0
* @category Getters
*/
const getOrElse = /* @__PURE__ */ dual(3, (self, key, orElse) => {
	if (self.mapUnsafe.has(key.key)) return self.mapUnsafe.get(key.key);
	return isReference(key) ? getDefaultValue(key) : orElse();
});
/**
* Get a service from the context that corresponds to the given key.
*
* This function is unsafe because if the key is not present in the context, a
* runtime error will be thrown.
*
* For a safer version see {@link getOption}.
*
* @param self - The `Context` to search for the service.
* @param service - The `Service` of the service to retrieve.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* assert.deepStrictEqual(Context.getUnsafe(context, Port), { PORT: 8080 })
* assert.throws(() => Context.getUnsafe(context, Timeout))
* ```
*
* @since 4.0.0
* @category unsafe
*/
const getUnsafe$1 = /* @__PURE__ */ dual(2, (self, service) => {
	if (!self.mapUnsafe.has(service.key)) {
		if (ReferenceTypeId in service) return getDefaultValue(service);
		throw serviceNotFoundError(service);
	}
	return self.mapUnsafe.get(service.key);
});
/**
* Get a service from the context that corresponds to the given key.
*
* @param self - The `Context` to search for the service.
* @param service - The `Service` of the service to retrieve.
*
* @example
* ```ts
* import { pipe, Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = pipe(
*   Context.make(Port, { PORT: 8080 }),
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
* ```
*
* @since 4.0.0
* @category Getters
*/
const get$1 = getUnsafe$1;
/**
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
* })
*
* const context = Context.empty()
* const logger = Context.getReferenceUnsafe(context, LoggerRef)
*
* assert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })
* ```
*
* @since 4.0.0
* @category unsafe
*/
const getReferenceUnsafe = (self, service) => {
	if (!self.mapUnsafe.has(service.key)) return getDefaultValue(service);
	return self.mapUnsafe.get(service.key);
};
const defaultValueCacheKey = "~effect/Context/defaultValue";
const getDefaultValue = (ref) => {
	if (defaultValueCacheKey in ref) return ref[defaultValueCacheKey];
	return ref[defaultValueCacheKey] = ref.defaultValue();
};
const serviceNotFoundError = (service) => {
	const error = /* @__PURE__ */ new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
	if (service.stack) {
		const lines = service.stack.split("\n");
		if (lines.length > 2) {
			const afterAt = lines[2].match(/at (.*)/);
			if (afterAt) error.message = error.message + ` (defined at ${afterAt[1]})`;
		}
	}
	if (error.stack) {
		const lines = error.stack.split("\n");
		lines.splice(1, 3);
		error.stack = lines.join("\n");
	}
	return error;
};
/**
* Get the value associated with the specified key from the context wrapped in
* an `Option` object. If the key is not found, the `Option` object will be
* `None`.
*
* @param self - The `Context` to search for the service.
* @param service - The `Service` of the service to retrieve.
*
* @example
* ```ts
* import { Option, Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* assert.deepStrictEqual(
*   Context.getOption(context, Port),
*   Option.some({ PORT: 8080 })
* )
* assert.deepStrictEqual(Context.getOption(context, Timeout), Option.none())
* ```
*
* @since 4.0.0
* @category Getters
*/
const getOption = /* @__PURE__ */ dual(2, (self, service) => {
	if (self.mapUnsafe.has(service.key)) return some(self.mapUnsafe.get(service.key));
	return isReference(service) ? some(getDefaultValue(service)) : none();
});
/**
* Merges two `Context`s, returning a new `Context` containing the services of both.
*
* @param self - The first `Context` to merge.
* @param that - The second `Context` to merge.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const firstContext = Context.make(Port, { PORT: 8080 })
* const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
*
* const context = Context.merge(firstContext, secondContext)
*
* assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
* assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
* ```
*
* @since 4.0.0
* @category Utils
*/
const merge$1 = /* @__PURE__ */ dual(2, (self, that) => {
	if (self.mapUnsafe.size === 0) return that;
	if (that.mapUnsafe.size === 0) return self;
	return withMapUnsafe(self, (map) => {
		that.mapUnsafe.forEach((value, key) => map.set(key, value));
	});
});
/**
* Merges any number of `Context`s, returning a new `Context` containing the services of all.
*
* @example
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
* const Host = Context.Service<{ HOST: string }>("Host")
*
* const firstContext = Context.make(Port, { PORT: 8080 })
* const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
* const thirdContext = Context.make(Host, { HOST: "localhost" })
*
* const context = Context.mergeAll(
*   firstContext,
*   secondContext,
*   thirdContext
* )
*
* assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
* assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
* assert.deepStrictEqual(Context.get(context, Host), { HOST: "localhost" })
* ```
*
* @since 3.12.0
*/
const mergeAll = (...ctxs) => {
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i < ctxs.length; i++) ctxs[i].mapUnsafe.forEach((value, key) => {
		map.set(key, value);
	});
	return makeUnsafe$5(map);
};
const withMapUnsafe = (self, f) => {
	if (self.mutable) {
		f(self.mapUnsafe);
		return self;
	}
	const map = new Map(self.mapUnsafe);
	f(map);
	return makeUnsafe$5(map);
};
/**
* Creates a context key with a default value.
*
* **Details**
*
* `Context.Reference` allows you to create a key that can hold a value. You
* can provide a default value for the service, which will automatically be used
* when the context is accessed, or override it with a custom implementation
* when needed.
*
* @example
* ```ts
* import { Context } from "effect"
*
* // Create a reference with a default value
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
* })
*
* // The reference provides the default value when accessed from an empty context
* const context = Context.empty()
* const logger = Context.get(context, LoggerRef)
*
* // You can also override the default value
* const customContext = Context.make(LoggerRef, {
*   log: (msg: string) => `Custom: ${msg}`
* })
* const customLogger = Context.get(customContext, LoggerRef)
* ```
*
* @since 4.0.0
* @category References
*/
const Reference = Service;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Result.js
/**
* Creates a `Result` holding a `Success` value.
*
* - Use when you have a value and want to lift it into the `Result` type
* - The error type `E` defaults to `never`
* - Does not mutate input; allocates a new `Success` wrapper
*
* **Previously Known As**
*
* This API replaces the following from Effect 3.x:
*
* - `Either.right`
*
* **Example** (Wrapping a value)
*
* ```ts
* import { Result } from "effect"
*
* const result = Result.succeed(42)
*
* console.log(Result.isSuccess(result))
* // Output: true
* ```
*
* @see {@link fail} to create a Failure
* @see {@link void} for a pre-built `Success<void>`
*
* @category Constructors
* @since 4.0.0
*/
const succeed$4 = succeed$5;
/**
* Creates a `Result` holding a `Failure` value.
*
* - Use when you want to represent a failed computation
* - The success type `A` defaults to `never`
* - Does not mutate input; allocates a new `Failure` wrapper
*
* **Previously Known As**
*
* This API replaces the following from Effect 3.x:
*
* - `Either.left`
*
* **Example** (Creating a failure)
*
* ```ts
* import { Result } from "effect"
*
* const result = Result.fail("Something went wrong")
*
* console.log(Result.isFailure(result))
* // Output: true
* ```
*
* @see {@link succeed} to create a Success
* @see {@link mapError} to transform the error
*
* @category Constructors
* @since 4.0.0
*/
const fail$5 = fail$6;
/**
* Checks whether a `Result` is a `Failure`.
*
* - Acts as a TypeScript type guard, narrowing to `Failure<A, E>`
* - After narrowing, you can access `.failure` to read the error value
*
* **Example** (Narrowing to Failure)
*
* ```ts
* import { Result } from "effect"
*
* const result = Result.fail("oops")
*
* if (Result.isFailure(result)) {
*   console.log(result.failure)
*   // Output: "oops"
* }
* ```
*
* @see {@link isSuccess} for the opposite check
* @see {@link isResult} to check if a value is any Result
*
* @category Type Guards
* @since 4.0.0
*/
const isFailure = isFailure$1;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Record.js
/**
* Creates a new, empty record.
*
* @example
* ```ts
* import { Record } from "effect"
*
* // Create an empty record
* const emptyRecord = Record.empty<string, number>()
* console.log(emptyRecord) // {}
*
* // The type ensures type safety for future operations
* const withValue = Record.set(emptyRecord, "count", 42)
* console.log(withValue) // { count: 42 }
* ```
*
* @category constructors
* @since 2.0.0
*/
const empty$7 = () => ({});
/**
* Determine if a record is empty.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(Record.isEmptyRecord({}), true)
* assert.deepStrictEqual(Record.isEmptyRecord({ a: 3 }), false)
* ```
*
* @category guards
* @since 2.0.0
*/
const isEmptyRecord = (self) => Object.keys(self).length === 0;
/**
* Check if a given `key` exists in a record.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(Record.has({ a: 1, b: 2 }, "a"), true)
* assert.deepStrictEqual(Record.has(Record.empty<string>(), "c"), false)
* ```
*
* @category guards
* @since 2.0.0
*/
const has = /* @__PURE__ */ dual(2, (self, key) => Object.hasOwn(self, key));
/**
* Maps a record into another record by applying a transformation function to each of its values.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* const f = (n: number) => `-${n}`
*
* assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, f), { a: "-3", b: "-5" })
*
* const g = (n: number, key: string) => `${key.toUpperCase()}-${n}`
*
* assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, g), { a: "A-3", b: "B-5" })
* ```
*
* @category mapping
* @since 2.0.0
*/
const map$4 = /* @__PURE__ */ dual(2, (self, f) => {
	const out = { ...self };
	for (const key of keys(self)) out[key] = f(self[key], key);
	return out;
});
/**
* Maps entries of a `ReadonlyRecord` using the provided function, allowing modification of both keys and corresponding values.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(
*   Record.mapEntries({ a: 3, b: 5 }, (a, key) => [key.toUpperCase(), a + 1]),
*   { A: 4, B: 6 }
* )
* ```
*
* @category mapping
* @since 2.0.0
*/
const mapEntries = /* @__PURE__ */ dual(2, (self, f) => {
	const out = {};
	for (const key of keys(self)) {
		const [k, b] = f(self[key], key);
		out[k] = b;
	}
	return out;
});
/**
* Selects properties from a record whose values match the given predicate.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* const x = { a: 1, b: 2, c: 3, d: 4 }
* assert.deepStrictEqual(Record.filter(x, (n) => n > 2), { c: 3, d: 4 })
* ```
*
* @category filtering
* @since 2.0.0
*/
const filter = /* @__PURE__ */ dual(2, (self, predicate) => {
	const out = empty$7();
	for (const key of keys(self)) if (predicate(self[key], key)) out[key] = self[key];
	return out;
});
/**
* Retrieve the keys of a given record as an array.
*
* @example
* ```ts
* import { Record } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(Record.keys({ a: 1, b: 2, c: 3 }), ["a", "b", "c"])
* ```
*
* @category getters
* @since 2.0.0
*/
const keys = (self) => Object.keys(self);
/**
* Check if all the keys and values in one record are also found in another record.
* Uses the provided equivalence function to compare values.
*
* @example
* ```ts
* import { Equal, Record } from "effect"
* import * as assert from "node:assert"
*
* const isSubrecord = Record.isSubrecordBy(Equal.asEquivalence<number>())
*
* assert.deepStrictEqual(
*   Record.isSubrecord({ a: 1 } as Record<string, number>, { a: 1, b: 2 }),
*   true
* )
* assert.deepStrictEqual(
*   Record.isSubrecord({ a: 1, b: 2 }, { a: 1 } as Record<string, number>),
*   false
* )
* ```
*
* @category predicates
* @since 2.0.0
*/
const isSubrecordBy = (equivalence) => dual(2, (self, that) => {
	for (const key of keys(self)) if (!has(that, key) || !equivalence(self[key], that[key])) return false;
	return true;
});
/**
* Create an `Equivalence` for records using the provided `Equivalence` for values.
* Two records are considered equivalent if they have the same keys and their corresponding values are equivalent.
*
* @example
* ```ts
* import { Equal, Record } from "effect"
* import * as assert from "node:assert"
*
* const recordEquivalence = Record.makeEquivalence(Equal.asEquivalence<number>())
*
* assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
* assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
* ```
*
* @category instances
* @since 2.0.0
*/
const makeEquivalence$2 = (equivalence) => {
	const is = isSubrecordBy(equivalence);
	return (self, that) => is(self, that) && is(that, self);
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/array.js
/**
* @since 2.0.0
*/
/** @internal */
const isArrayNonEmpty$1 = (self) => self.length > 0;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Array.js
/**
* Utilities for working with immutable arrays (and non-empty arrays) in a
* functional style. All functions treat arrays as immutable — they return new
* arrays rather than mutating the input.
*
* ## Mental model
*
* - **`Array<A>`** is a standard JS array. All functions in this module return
*   new arrays; the input is never mutated.
* - **`NonEmptyReadonlyArray<A>`** (`readonly [A, ...Array<A>]`) is a readonly
*   array guaranteed to have at least one element. Many functions preserve or
*   require this guarantee at the type level.
* - **`NonEmptyArray<A>`** is the mutable counterpart: `[A, ...Array<A>]`.
* - Most functions are **dual** — they can be called either as
*   `Array.fn(array, arg)` (data-first) or piped as
*   `pipe(array, Array.fn(arg))` (data-last).
* - Functions that access elements by index return `Option<A>` for safety; use
*   the `*NonEmpty` variants (e.g. {@link headNonEmpty}) when you already know
*   the array is non-empty.
* - Set-like operations ({@link union}, {@link intersection},
*   {@link difference}) use `Equal.equivalence()` by default; use the `*With`
*   variants for custom equality.
*
* ## Common tasks
*
* - **Create** an array: {@link make}, {@link of}, {@link empty},
*   {@link fromIterable}, {@link range}, {@link makeBy}, {@link replicate},
*   {@link unfold}
* - **Access** elements: {@link head}, {@link last}, {@link get}, {@link tail},
*   {@link init}
* - **Transform**: {@link map}, {@link flatMap}, {@link flatten}
* - **Filter**: {@link filter}, {@link partition}, {@link dedupe}
* - **Combine**: {@link append}, {@link prepend}, {@link appendAll},
*   {@link prependAll}, {@link zip}, {@link cartesian}
* - **Split**: {@link splitAt}, {@link chunksOf}, {@link span}, {@link window}
* - **Search**: {@link findFirst}, {@link findLast}, {@link contains}
* - **Sort**: {@link sort}, {@link sortBy}, {@link sortWith}
* - **Fold**: {@link reduce}, {@link scan}, {@link join}
* - **Group**: {@link groupBy}, {@link group}, {@link groupWith}
* - **Set operations**: {@link union}, {@link intersection},
*   {@link difference}
* - **Match** on empty vs non-empty: {@link match}, {@link matchLeft},
*   {@link matchRight}
* - **Check** properties: {@link isArray}, {@link isArrayNonEmpty},
*   {@link every}, {@link some}
*
* ## Gotchas
*
* - {@link fromIterable} returns the original array reference when given an
*   array; if you need a copy, use {@link copy}.
* - `sort`, `reverse`, etc. always allocate a new array — the input is never
*   mutated.
* - {@link makeBy} and {@link replicate} normalize `n` to an integer >= 1 —
*   they never produce an empty array.
* - {@link range}`(start, end)` is inclusive on both ends. If `start > end` it
*   returns `[start]`.
* - Functions returning `Option` (e.g. {@link head}, {@link findFirst}) return
*   `Option.none()` for empty inputs — they never throw.
*
* ## Quickstart
*
* **Example** (Basic array operations)
*
* ```ts
* import { Array } from "effect"
*
* const numbers = Array.make(1, 2, 3, 4, 5)
*
* const doubled = Array.map(numbers, (n) => n * 2)
* console.log(doubled) // [2, 4, 6, 8, 10]
*
* const evens = Array.filter(numbers, (n) => n % 2 === 0)
* console.log(evens) // [2, 4]
*
* const sum = Array.reduce(numbers, 0, (acc, n) => acc + n)
* console.log(sum) // 15
* ```
*
* @see {@link make} — create a non-empty array from elements
* @see {@link map} — transform each element
* @see {@link filter} — keep elements matching a predicate
* @see {@link reduce} — fold an array to a single value
*
* @since 2.0.0
*/
/**
* Reference to the global `Array` constructor.
*
* Use this when you need the native `Array` constructor while the `Array`
* namespace is in scope (e.g. `Array.Array.isArray`, `Array.Array.from`).
*
* **Example** (Using the Array constructor)
*
* ```ts
* import { Array } from "effect"
*
* const arr = new Array.Array(3)
* console.log(arr) // [undefined, undefined, undefined]
* ```
*
* @category constructors
* @since 4.0.0
*/
const Array$1 = globalThis.Array;
/**
* Converts an `Iterable` to an `Array`.
*
* - If the input is already an array, returns it **by reference** (no copy).
* - Otherwise, creates a new array from the iterable.
* - Use {@link copy} if you need a fresh array even when the input is already
*   an array.
*
* **Example** (Converting a Set to an array)
*
* ```ts
* import { Array } from "effect"
*
* const result = Array.fromIterable(new Set([1, 2, 3]))
* console.log(result) // [1, 2, 3]
* ```
*
* @see {@link ensure} — wrap a single value or return an existing array
* @see {@link copy} — create a shallow copy of an array
*
* @category constructors
* @since 2.0.0
*/
const fromIterable$2 = (collection) => Array$1.isArray(collection) ? collection : Array$1.from(collection);
/**
* Normalizes a value that is either a single element or an array into an array.
*
* - If the input is already an array, returns it by reference.
* - If the input is a single value, wraps it in a one-element array.
* - Useful for APIs that accept `A | Array<A>`.
*
* **Example** (Normalizing input)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.ensure("a")) // ["a"]
* console.log(Array.ensure(["a", "b", "c"])) // ["a", "b", "c"]
* ```
*
* @see {@link of} — always wrap in a single-element array
* @see {@link fromIterable} — convert any iterable
*
* @category constructors
* @since 3.3.0
*/
const ensure = (self) => Array$1.isArray(self) ? self : [self];
/**
* Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
*
* - Always returns a non-empty array.
* - Does not mutate the input.
*
* **Example** (Appending an element)
*
* ```ts
* import { Array } from "effect"
*
* const result = Array.append([1, 2, 3], 4)
* console.log(result) // [1, 2, 3, 4]
* ```
*
* @see {@link prepend} — add to the front
* @see {@link appendAll} — append multiple elements
*
* @category concatenating
* @since 2.0.0
*/
const append = /* @__PURE__ */ dual(2, (self, last) => [...self, last]);
/**
* Concatenates two iterables into a single array.
*
* - If either input is non-empty, the result is a `NonEmptyArray`.
* - Does not mutate the inputs.
*
* **Example** (Concatenating arrays)
*
* ```ts
* import { Array } from "effect"
*
* const result = Array.appendAll([1, 2], [3, 4])
* console.log(result) // [1, 2, 3, 4]
* ```
*
* @see {@link append} — add a single element to the end
* @see {@link prependAll} — add elements to the front
*
* @category concatenating
* @since 2.0.0
*/
const appendAll = /* @__PURE__ */ dual(2, (self, that) => fromIterable$2(self).concat(fromIterable$2(that)));
Array$1.isArray;
/**
* Tests whether a mutable `Array` is non-empty, narrowing the type to
* `NonEmptyArray`.
*
* **Example** (Checking for a non-empty array)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.isArrayNonEmpty([])) // false
* console.log(Array.isArrayNonEmpty([1, 2, 3])) // true
* ```
*
* @see {@link isReadonlyArrayNonEmpty} — readonly variant
* @see {@link isArrayEmpty} — opposite check
*
* @category guards
* @since 2.0.0
*/
const isArrayNonEmpty = isArrayNonEmpty$1;
/**
* Tests whether a `ReadonlyArray` is non-empty, narrowing the type to
* `NonEmptyReadonlyArray`.
*
* **Example** (Checking for a non-empty readonly array)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.isReadonlyArrayNonEmpty([])) // false
* console.log(Array.isReadonlyArrayNonEmpty([1, 2, 3])) // true
* ```
*
* @see {@link isArrayNonEmpty} — mutable variant
* @see {@link isReadonlyArrayEmpty} — opposite check
*
* @category guards
* @since 2.0.0
*/
const isReadonlyArrayNonEmpty = isArrayNonEmpty$1;
/** @internal */
function isOutOfBounds(i, as) {
	return i < 0 || i >= as.length;
}
/**
* Returns the first element of a `NonEmptyReadonlyArray` directly (no `Option`
* wrapper).
*
* **Example** (Getting the head of a non-empty array)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.headNonEmpty([1, 2, 3, 4])) // 1
* ```
*
* @see {@link head} — safe version for possibly-empty arrays
*
* @category getters
* @since 2.0.0
*/
const headNonEmpty = /* @__PURE__ */ (/* @__PURE__ */ dual(2, (self, index) => {
	const i = Math.floor(index);
	if (isOutOfBounds(i, self)) throw new Error(`Index out of bounds: ${i}`);
	return self[i];
}))(0);
/**
* Returns all elements except the first of a `NonEmptyReadonlyArray`.
*
* **Example** (Getting the tail of a non-empty array)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.tailNonEmpty([1, 2, 3, 4])) // [2, 3, 4]
* ```
*
* @see {@link tail} — safe version for possibly-empty arrays
* @see {@link initNonEmpty} — all elements except the last
*
* @category getters
* @since 2.0.0
*/
const tailNonEmpty = (self) => self.slice(1);
/**
* Computes the union of two arrays using a custom equivalence, removing
* duplicates.
*
* **Example** (Union with custom equality)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
* ```
*
* @see {@link union} — uses default equality
* @see {@link intersection} — elements in both arrays
* @see {@link difference} — elements only in the first array
*
* @category elements
* @since 2.0.0
*/
const unionWith = /* @__PURE__ */ dual(3, (self, that, isEquivalent) => {
	const a = fromIterable$2(self);
	const b = fromIterable$2(that);
	if (isReadonlyArrayNonEmpty(a)) {
		if (isReadonlyArrayNonEmpty(b)) return dedupeWith(isEquivalent)(appendAll(a, b));
		return a;
	}
	return b;
});
/**
* Computes the union of two arrays, removing duplicates using
* `Equal.equivalence()`.
*
* **Example** (Array union)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
* ```
*
* @see {@link unionWith} — use custom equality
* @see {@link intersection} — elements in both arrays
* @see {@link difference} — elements only in the first array
*
* @category elements
* @since 2.0.0
*/
const union$1 = /* @__PURE__ */ dual(2, (self, that) => unionWith(self, that, asEquivalence()));
/**
* Creates an empty array.
*
* **Example** (Creating an empty array)
*
* ```ts
* import { Array } from "effect"
*
* const result = Array.empty<number>()
* console.log(result) // []
* ```
*
* @see {@link of} — create a single-element array
* @see {@link make} — create from multiple values
*
* @category constructors
* @since 2.0.0
*/
const empty$6 = () => [];
/**
* Transforms each element using a function, returning a new array.
*
* - The function receives `(element, index)`.
* - Preserves `NonEmptyArray` in the return type.
*
* **Example** (Doubling values)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]
* ```
*
* @see {@link flatMap} — map and flatten
*
* @category mapping
* @since 2.0.0
*/
const map$3 = /* @__PURE__ */ dual(2, (self, f) => self.map(f));
/**
* Removes duplicates using a custom equivalence, preserving the order of the
* first occurrence.
*
* **Example** (Deduplicating with custom equality)
*
* ```ts
* import { Array } from "effect"
*
* console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
* ```
*
* @see {@link dedupe} — uses default equality
* @see {@link dedupeAdjacentWith} — only dedupes consecutive elements
*
* @category elements
* @since 2.0.0
*/
const dedupeWith = /* @__PURE__ */ dual(2, (self, isEquivalent) => {
	const input = fromIterable$2(self);
	if (isReadonlyArrayNonEmpty(input)) {
		const out = [headNonEmpty(input)];
		const rest = tailNonEmpty(input);
		for (const r of rest) if (out.every((a) => !isEquivalent(r, a))) out.push(r);
		return out;
	}
	return [];
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/BigDecimal.js
/**
* This module provides utility functions and type class instances for working with the `BigDecimal` type in TypeScript.
* It includes functions for basic arithmetic operations.
*
* A `BigDecimal` allows storing any real number to arbitrary precision; which avoids common floating point errors
* (such as 0.1 + 0.2 ≠ 0.3) at the cost of complexity.
*
* Internally, `BigDecimal` uses a `BigInt` object, paired with a 64-bit integer which determines the position of the
* decimal point. Therefore, the precision *is not* actually arbitrary, but limited to 2<sup>63</sup> decimal places.
*
* It is not recommended to convert a floating point number to a decimal directly, as the floating point representation
* may be unexpected.
*
* @since 2.0.0
*/
const TypeId$27 = "~effect/BigDecimal";
const BigDecimalProto = {
	[TypeId$27]: TypeId$27,
	[symbol$3]() {
		const normalized = normalize(this);
		return combine(hash(normalized.value), number$1(normalized.scale));
	},
	[symbol$2](that) {
		return isBigDecimal(that) && equals$1(this, that);
	},
	toString() {
		return `BigDecimal(${format(this)})`;
	},
	toJSON() {
		return {
			_id: "BigDecimal",
			value: String(this.value),
			scale: this.scale
		};
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Checks if a given value is a `BigDecimal`.
*
* @example
* ```ts
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.fromNumber(123.45)
* console.log(BigDecimal.isBigDecimal(decimal)) // true
* console.log(BigDecimal.isBigDecimal(123.45)) // false
* console.log(BigDecimal.isBigDecimal("123.45")) // false
* ```
*
* @since 2.0.0
* @category guards
*/
const isBigDecimal = (u) => hasProperty(u, TypeId$27);
/**
* Creates a `BigDecimal` from a `bigint` value and a scale.
*
* @example
* ```ts
* import { BigDecimal } from "effect"
*
* // Create 123.45 (12345 with scale 2)
* const decimal = BigDecimal.make(12345n, 2)
* console.log(BigDecimal.format(decimal)) // "123.45"
*
* // Create 42 (42 with scale 0)
* const integer = BigDecimal.make(42n, 0)
* console.log(BigDecimal.format(integer)) // "42"
* ```
*
* @since 2.0.0
* @category constructors
*/
const make$17 = (value, scale) => {
	const o = Object.create(BigDecimalProto);
	o.value = value;
	o.scale = scale;
	return o;
};
/**
* Internal function used to create pre-normalized `BigDecimal`s.
*
* @internal
*/
const makeNormalizedUnsafe = (value, scale) => {
	if (value !== bigint0$1 && value % bigint10 === bigint0$1) throw new RangeError("Value must be normalized");
	const o = make$17(value, scale);
	o.normalized = o;
	return o;
};
const bigint0$1 = /* @__PURE__ */ BigInt(0);
const bigint10 = /* @__PURE__ */ BigInt(10);
const zero$1 = /* @__PURE__ */ makeNormalizedUnsafe(bigint0$1, 0);
/**
* Normalizes a given `BigDecimal` by removing trailing zeros.
*
* @example
* ```ts
* import { fromStringUnsafe, make, normalize } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(
*   normalize(fromStringUnsafe("123.00000")),
*   normalize(make(123n, 0))
* )
* assert.deepStrictEqual(
*   normalize(fromStringUnsafe("12300000")),
*   normalize(make(123n, -5))
* )
* ```
*
* @since 2.0.0
* @category scaling
*/
const normalize = (self) => {
	if (self.normalized === void 0) if (self.value === bigint0$1) self.normalized = zero$1;
	else {
		const digits = `${self.value}`;
		let trail = 0;
		for (let i = digits.length - 1; i >= 0; i--) if (digits[i] === "0") trail++;
		else break;
		if (trail === 0) self.normalized = self;
		self.normalized = makeNormalizedUnsafe(BigInt(digits.substring(0, digits.length - trail)), self.scale - trail);
	}
	return self.normalized;
};
/**
* Scales a given `BigDecimal` to the specified scale.
*
* If the given scale is smaller than the current scale, the value will be rounded down to
* the nearest integer.
*
* @example
* ```ts
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.fromNumberUnsafe(123.45)
*
* // Increase scale (add more precision)
* const scaled = BigDecimal.scale(decimal, 4)
* console.log(BigDecimal.format(scaled)) // "123.4500"
*
* // Decrease scale (reduce precision, rounds down)
* const reduced = BigDecimal.scale(decimal, 1)
* console.log(BigDecimal.format(reduced)) // "123.4"
* ```
*
* @since 2.0.0
* @category scaling
*/
const scale = /* @__PURE__ */ dual(2, (self, scale) => {
	if (scale > self.scale) return make$17(self.value * bigint10 ** BigInt(scale - self.scale), scale);
	if (scale < self.scale) return make$17(self.value / bigint10 ** BigInt(self.scale - scale), scale);
	return self;
});
/**
* Determines the absolute value of a given `BigDecimal`.
*
* @example
* ```ts
* import { abs, fromStringUnsafe } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(abs(fromStringUnsafe("-5")), fromStringUnsafe("5"))
* assert.deepStrictEqual(abs(fromStringUnsafe("0")), fromStringUnsafe("0"))
* assert.deepStrictEqual(abs(fromStringUnsafe("5")), fromStringUnsafe("5"))
* ```
*
* @since 2.0.0
* @category math
*/
const abs = (n) => n.value < bigint0$1 ? make$17(-n.value, n.scale) : n;
/**
* Provides an `Equivalence` instance for `BigDecimal` that determines equality between BigDecimal values.
*
* @example
* ```ts
* import { BigDecimal } from "effect"
*
* const a = BigDecimal.fromNumberUnsafe(1.50)
* const b = BigDecimal.fromNumberUnsafe(1.5)
* const c = BigDecimal.fromNumberUnsafe(2.0)
*
* console.log(BigDecimal.Equivalence(a, b)) // true (1.50 === 1.5)
* console.log(BigDecimal.Equivalence(a, c)) // false (1.50 !== 2.0)
* ```
*
* @category instances
* @since 2.0.0
*/
const Equivalence$5 = /* @__PURE__ */ make$20((self, that) => {
	if (self.scale > that.scale) return scale(that, self.scale).value === self.value;
	if (self.scale < that.scale) return scale(self, that.scale).value === that.value;
	return self.value === that.value;
});
/**
* Checks if two `BigDecimal`s are equal.
*
* @example
* ```ts
* import { BigDecimal } from "effect"
*
* const a = BigDecimal.fromNumberUnsafe(1.5)
* const b = BigDecimal.fromNumberUnsafe(1.50)
* const c = BigDecimal.fromNumberUnsafe(2.0)
*
* console.log(BigDecimal.equals(a, b)) // true
* console.log(BigDecimal.equals(a, c)) // false
* ```
*
* @since 2.0.0
* @category predicates
*/
const equals$1 = /* @__PURE__ */ dual(2, (self, that) => Equivalence$5(self, that));
/**
* Formats a given `BigDecimal` as a `string`.
*
* If the scale of the `BigDecimal` is greater than or equal to 16, the `BigDecimal` will
* be formatted in scientific notation.
*
* @example
* ```ts
* import { format, fromStringUnsafe } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(format(fromStringUnsafe("-5")), "-5")
* assert.deepStrictEqual(format(fromStringUnsafe("123.456")), "123.456")
* assert.deepStrictEqual(format(fromStringUnsafe("-0.00000123")), "-0.00000123")
* ```
*
* @since 2.0.0
* @category conversions
*/
const format = (n) => {
	const normalized = normalize(n);
	if (Math.abs(normalized.scale) >= 16) return toExponential(normalized);
	const negative = normalized.value < bigint0$1;
	const absolute = negative ? `${normalized.value}`.substring(1) : `${normalized.value}`;
	let before;
	let after;
	if (normalized.scale >= absolute.length) {
		before = "0";
		after = "0".repeat(normalized.scale - absolute.length) + absolute;
	} else {
		const location = absolute.length - normalized.scale;
		if (location > absolute.length) {
			const zeros = location - absolute.length;
			before = `${absolute}${"0".repeat(zeros)}`;
			after = "";
		} else {
			after = absolute.slice(location);
			before = absolute.slice(0, location);
		}
	}
	const complete = after === "" ? before : `${before}.${after}`;
	return negative ? `-${complete}` : complete;
};
/**
* Formats a given `BigDecimal` as a `string` in scientific notation.
*
* @example
* ```ts
* import { make, toExponential } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(toExponential(make(123456n, -5)), "1.23456e+10")
* ```
*
* @since 4.0.0
* @category conversions
*/
const toExponential = (n) => {
	if (isZero(n)) return "0e+0";
	const normalized = normalize(n);
	const digits = `${abs(normalized).value}`;
	const head = digits.slice(0, 1);
	const tail = digits.slice(1);
	let output = `${isNegative(normalized) ? "-" : ""}${head}`;
	if (tail !== "") output += `.${tail}`;
	const exp = tail.length - normalized.scale;
	return `${output}e${exp >= 0 ? "+" : ""}${exp}`;
};
/**
* Checks if a given `BigDecimal` is `0`.
*
* @example
* ```ts
* import { fromStringUnsafe, isZero } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(isZero(fromStringUnsafe("0")), true)
* assert.deepStrictEqual(isZero(fromStringUnsafe("1")), false)
* ```
*
* @since 2.0.0
* @category predicates
*/
const isZero = (n) => n.value === bigint0$1;
/**
* Checks if a given `BigDecimal` is negative.
*
* @example
* ```ts
* import { fromStringUnsafe, isNegative } from "effect/BigDecimal"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(isNegative(fromStringUnsafe("-1")), true)
* assert.deepStrictEqual(isNegative(fromStringUnsafe("0")), false)
* assert.deepStrictEqual(isNegative(fromStringUnsafe("1")), false)
* ```
*
* @since 2.0.0
* @category predicates
*/
const isNegative = (n) => n.value < bigint0$1;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Duration.js
const TypeId$26 = "~effect/time/Duration";
const bigint0 = /* @__PURE__ */ BigInt(0);
const bigint1e3 = /* @__PURE__ */ BigInt(1e3);
const bigint1e6 = /* @__PURE__ */ BigInt(1e6);
const DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
/**
* Decodes a `Duration.Input` into a `Duration`.
*
* If the input is not a valid `Duration.Input`, it throws an error.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration1 = Duration.fromInputUnsafe(1000) // 1000 milliseconds
* const duration2 = Duration.fromInputUnsafe("5 seconds")
* const duration3 = Duration.fromInputUnsafe("Infinity")
* const duration4 = Duration.fromInputUnsafe([2, 500_000_000]) // 2 seconds and 500ms
* ```
*
* @since 2.0.0
* @category constructors
*/
const fromInputUnsafe = (input) => {
	switch (typeof input) {
		case "number": return millis(input);
		case "bigint": return nanos(input);
		case "string": {
			if (input === "Infinity") return infinity;
			if (input === "-Infinity") return negativeInfinity;
			const match = DURATION_REGEXP.exec(input);
			if (!match) break;
			const [_, valueStr, unit] = match;
			const value = Number(valueStr);
			switch (unit) {
				case "nano":
				case "nanos": return nanos(BigInt(valueStr));
				case "micro":
				case "micros": return micros(BigInt(valueStr));
				case "milli":
				case "millis": return millis(value);
				case "second":
				case "seconds": return seconds(value);
				case "minute":
				case "minutes": return minutes(value);
				case "hour":
				case "hours": return hours(value);
				case "day":
				case "days": return days(value);
				case "week":
				case "weeks": return weeks(value);
			}
			break;
		}
		case "object": {
			if (input === null) break;
			if (TypeId$26 in input) return input;
			if (Array.isArray(input)) {
				if (input.length !== 2 || !input.every(isNumber)) return invalid(input);
				if (Number.isNaN(input[0]) || Number.isNaN(input[1])) return zero;
				if (input[0] === -Infinity || input[1] === -Infinity) return negativeInfinity;
				if (input[0] === Infinity || input[1] === Infinity) return infinity;
				return make$16(BigInt(Math.round(input[0] * 1e9)) + BigInt(Math.round(input[1])));
			}
			const obj = input;
			let millis = 0;
			if (obj.weeks) millis += obj.weeks * 6048e5;
			if (obj.days) millis += obj.days * 864e5;
			if (obj.hours) millis += obj.hours * 36e5;
			if (obj.minutes) millis += obj.minutes * 6e4;
			if (obj.seconds) millis += obj.seconds * 1e3;
			if (obj.milliseconds) millis += obj.milliseconds;
			if (!obj.microseconds && !obj.nanoseconds) return make$16(millis);
			let nanos = BigInt(millis) * bigint1e6;
			if (obj.microseconds) nanos += BigInt(obj.microseconds) * bigint1e3;
			if (obj.nanoseconds) nanos += BigInt(obj.nanoseconds);
			return make$16(nanos);
		}
	}
	return invalid(input);
};
const invalid = (input) => {
	throw new Error(`Invalid Input: ${input}`);
};
const zeroDurationValue = {
	_tag: "Millis",
	millis: 0
};
const infinityDurationValue = { _tag: "Infinity" };
const negativeInfinityDurationValue = { _tag: "NegativeInfinity" };
const DurationProto = {
	[TypeId$26]: TypeId$26,
	[symbol$3]() {
		return structure(this.value);
	},
	[symbol$2](that) {
		return isDuration(that) && equals(this, that);
	},
	toString() {
		switch (this.value._tag) {
			case "Infinity": return "Infinity";
			case "NegativeInfinity": return "-Infinity";
			case "Nanos": return `${this.value.nanos} nanos`;
			case "Millis": return `${this.value.millis} millis`;
		}
	},
	toJSON() {
		switch (this.value._tag) {
			case "Millis": return {
				_id: "Duration",
				_tag: "Millis",
				millis: this.value.millis
			};
			case "Nanos": return {
				_id: "Duration",
				_tag: "Nanos",
				nanos: String(this.value.nanos)
			};
			case "Infinity": return {
				_id: "Duration",
				_tag: "Infinity"
			};
			case "NegativeInfinity": return {
				_id: "Duration",
				_tag: "NegativeInfinity"
			};
		}
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const make$16 = (input) => {
	const duration = Object.create(DurationProto);
	if (typeof input === "number") if (isNaN(input) || input === 0 || Object.is(input, -0)) duration.value = zeroDurationValue;
	else if (!Number.isFinite(input)) duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
	else if (!Number.isInteger(input)) duration.value = {
		_tag: "Nanos",
		nanos: BigInt(Math.round(input * 1e6))
	};
	else duration.value = {
		_tag: "Millis",
		millis: input
	};
	else if (input === bigint0) duration.value = zeroDurationValue;
	else duration.value = {
		_tag: "Nanos",
		nanos: input
	};
	return duration;
};
/**
* Checks if a value is a Duration.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* console.log(Duration.isDuration(Duration.seconds(1))) // true
* console.log(Duration.isDuration(1000)) // false
* ```
*
* @since 2.0.0
* @category guards
*/
const isDuration = (u) => hasProperty(u, TypeId$26);
/**
* A Duration representing zero time.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* console.log(Duration.toMillis(Duration.zero)) // 0
* ```
*
* @since 2.0.0
* @category constructors
*/
const zero = /* @__PURE__ */ make$16(0);
/**
* A Duration representing infinite time.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* console.log(Duration.toMillis(Duration.infinity)) // Infinity
* ```
*
* @since 2.0.0
* @category constructors
*/
const infinity = /* @__PURE__ */ make$16(Infinity);
/**
* A Duration representing negative infinite time.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* console.log(Duration.toMillis(Duration.negativeInfinity)) // -Infinity
* ```
*
* @since 4.0.0
* @category constructors
*/
const negativeInfinity = /* @__PURE__ */ make$16(-Infinity);
/**
* Creates a Duration from nanoseconds.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.nanos(BigInt(500_000_000))
* console.log(Duration.toMillis(duration)) // 500
* ```
*
* @since 2.0.0
* @category constructors
*/
const nanos = (nanos) => make$16(nanos);
/**
* Creates a Duration from microseconds.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.micros(BigInt(500_000))
* console.log(Duration.toMillis(duration)) // 500
* ```
*
* @since 2.0.0
* @category constructors
*/
const micros = (micros) => make$16(micros * bigint1e3);
/**
* Creates a Duration from milliseconds.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.millis(1000)
* console.log(Duration.toMillis(duration)) // 1000
* ```
*
* @since 2.0.0
* @category constructors
*/
const millis = (millis) => make$16(millis);
/**
* Creates a Duration from seconds.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.seconds(30)
* console.log(Duration.toMillis(duration)) // 30000
* ```
*
* @since 2.0.0
* @category constructors
*/
const seconds = (seconds) => make$16(seconds * 1e3);
/**
* Creates a Duration from minutes.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.minutes(5)
* console.log(Duration.toMillis(duration)) // 300000
* ```
*
* @since 2.0.0
* @category constructors
*/
const minutes = (minutes) => make$16(minutes * 6e4);
/**
* Creates a Duration from hours.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.hours(2)
* console.log(Duration.toMillis(duration)) // 7200000
* ```
*
* @since 2.0.0
* @category constructors
*/
const hours = (hours) => make$16(hours * 36e5);
/**
* Creates a Duration from days.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.days(1)
* console.log(Duration.toMillis(duration)) // 86400000
* ```
*
* @since 2.0.0
* @category constructors
*/
const days = (days) => make$16(days * 864e5);
/**
* Creates a Duration from weeks.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.weeks(1)
* console.log(Duration.toMillis(duration)) // 604800000
* ```
*
* @since 2.0.0
* @category constructors
*/
const weeks = (weeks) => make$16(weeks * 6048e5);
/**
* Get the duration in nanoseconds as a bigint.
*
* If the duration is infinite, it throws an error.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const duration = Duration.seconds(2)
* const nanos = Duration.toNanosUnsafe(duration)
* console.log(nanos) // 2000000000n
*
* // This will throw an error
* try {
*   Duration.toNanosUnsafe(Duration.infinity)
* } catch (error) {
*   console.log((error as Error).message) // "Cannot convert infinite duration to nanos"
* }
* ```
*
* @since 2.0.0
* @category getters
*/
const toNanosUnsafe = (input) => {
	const self = fromInputUnsafe(input);
	switch (self.value._tag) {
		case "Infinity":
		case "NegativeInfinity": throw new Error("Cannot convert infinite duration to nanos");
		case "Nanos": return self.value.nanos;
		case "Millis": return BigInt(Math.round(self.value.millis * 1e6));
	}
};
/**
* Pattern matches on two `Duration`s, providing handlers that receive both values.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
*   onMillis: (a, b) => a + b,
*   onNanos: (a, b) => Number(a + b),
*   onInfinity: () => Infinity
* })
* console.log(sum) // 5000
* ```
*
* @since 2.0.0
* @category pattern matching
*/
const matchPair = /* @__PURE__ */ dual(3, (self, that, options) => {
	if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity") return options.onInfinity(self, that);
	if (self.value._tag === "Millis") return that.value._tag === "Millis" ? options.onMillis(self.value.millis, that.value.millis) : options.onNanos(toNanosUnsafe(self), that.value.nanos);
	else return options.onNanos(self.value.nanos, toNanosUnsafe(that));
});
/**
* Equivalence instance for `Duration`, allowing equality comparisons.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const isEqual = Duration.Equivalence(Duration.seconds(5), Duration.millis(5000))
* console.log(isEqual) // true
* ```
*
* @category instances
* @since 2.0.0
*/
const Equivalence$4 = (self, that) => matchPair(self, that, {
	onMillis: (self, that) => self === that,
	onNanos: (self, that) => self === that,
	onInfinity: (self, that) => self.value._tag === that.value._tag
});
/**
* Checks if two Durations are equal.
*
* @example
* ```ts
* import { Duration } from "effect"
*
* const isEqual = Duration.equals(Duration.seconds(5), Duration.millis(5000))
* console.log(isEqual) // true
* ```
*
* @since 2.0.0
* @category predicates
*/
const equals = /* @__PURE__ */ dual(2, (self, that) => Equivalence$4(self, that));
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Scheduler.js
/**
* @since 2.0.0
*/
/**
* @since 4.0.0
* @category references
*/
const Scheduler = /* @__PURE__ */ Reference("effect/Scheduler", { defaultValue: () => new MixedScheduler() });
const setImmediate = "setImmediate" in globalThis ? (f) => {
	const timer = globalThis.setImmediate(f);
	return () => globalThis.clearImmediate(timer);
} : (f) => {
	const timer = setTimeout(f, 0);
	return () => clearTimeout(timer);
};
var PriorityBuckets = class {
	buckets = [];
	scheduleTask(task, priority) {
		const buckets = this.buckets;
		const len = buckets.length;
		let bucket;
		let index = 0;
		for (; index < len; index++) {
			if (buckets[index][0] > priority) break;
			bucket = buckets[index];
		}
		if (bucket && bucket[0] === priority) bucket[1].push(task);
		else if (index === len) buckets.push([priority, [task]]);
		else buckets.splice(index, 0, [priority, [task]]);
	}
	drain() {
		const buckets = this.buckets;
		this.buckets = [];
		return buckets;
	}
};
/**
* A scheduler implementation that provides efficient task scheduling
* with support for both synchronous and asynchronous execution modes.
*
* Features:
* - Batches tasks for efficient execution
* - Supports priority-based task scheduling
* - Configurable execution mode (sync/async)
* - Automatic yielding based on operation count
* - Optimized for high-throughput scenarios
*
* @since 2.0.0
* @category schedulers
*/
var MixedScheduler = class {
	executionMode;
	setImmediate;
	constructor(executionMode = "async", setImmediateFn = setImmediate) {
		this.executionMode = executionMode;
		this.setImmediate = setImmediateFn;
	}
	/**
	* @since 2.0.0
	*/
	shouldYield(fiber) {
		return fiber.currentOpCount >= fiber.maxOpsBeforeYield;
	}
	/**
	* @since 2.0.0
	*/
	makeDispatcher() {
		return new MixedSchedulerDispatcher(this.setImmediate);
	}
};
var MixedSchedulerDispatcher = class {
	tasks = /* @__PURE__ */ new PriorityBuckets();
	running = void 0;
	setImmediate;
	constructor(setImmediateFn = setImmediate) {
		this.setImmediate = setImmediateFn;
	}
	/**
	* @since 2.0.0
	*/
	scheduleTask(task, priority) {
		this.tasks.scheduleTask(task, priority);
		if (this.running === void 0) this.running = this.setImmediate(this.afterScheduled);
	}
	/**
	* @since 2.0.0
	*/
	afterScheduled = () => {
		this.running = void 0;
		this.runTasks();
	};
	/**
	* @since 2.0.0
	*/
	runTasks() {
		const buckets = this.tasks.drain();
		for (let i = 0; i < buckets.length; i++) {
			const toRun = buckets[i][1];
			for (let j = 0; j < toRun.length; j++) toRun[j]();
		}
	}
	/**
	* @since 2.0.0
	*/
	flush() {
		while (this.tasks.buckets.length > 0) {
			if (this.running !== void 0) {
				this.running();
				this.running = void 0;
			}
			this.runTasks();
		}
	}
};
/**
* A service reference that controls the maximum number of operations a fiber
* can perform before yielding control back to the scheduler. This helps
* prevent long-running fibers from monopolizing the execution thread.
*
* The default value is 2048 operations, which provides a good balance between
* performance and fairness in concurrent execution.
*
* @since 4.0.0
* @category references
*/
const MaxOpsBeforeYield = /* @__PURE__ */ Reference("effect/Scheduler/MaxOpsBeforeYield", { defaultValue: () => 2048 });
/**
* A service reference that controls whether the runtime should bypass scheduler
* yield checks. When set to `true`, the fiber run loop won't call
* `Scheduler.shouldYield`.
*
* @since 4.0.0
* @category references
*/
const PreventSchedulerYield = /* @__PURE__ */ Reference("effect/Scheduler/PreventSchedulerYield", { defaultValue: () => false });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Tracer.js
/**
* @since 2.0.0
*/
/**
* @since 2.0.0
* @category tags
* @example
* ```ts
* import { Tracer } from "effect"
*
* // The key used to identify parent spans in the context
* console.log(Tracer.ParentSpanKey) // "effect/Tracer/ParentSpan"
* ```
*/
const ParentSpanKey = "effect/Tracer/ParentSpan";
Service()(ParentSpanKey);
/**
* @since 4.0.0
* @category references
*/
const TracerKey = "effect/Tracer";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/metric.js
/** @internal */
const FiberRuntimeMetricsKey = "effect/observability/Metric/FiberRuntimeMetricsKey";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/references.js
/** @internal */
const CurrentConcurrency = /* @__PURE__ */ Reference("effect/References/CurrentConcurrency", { defaultValue: () => "unbounded" });
/** @internal */
const CurrentStackFrame = /* @__PURE__ */ Reference("effect/References/CurrentStackFrame", { defaultValue: constUndefined });
/** @internal */
const CurrentLogLevel = /* @__PURE__ */ Reference("effect/References/CurrentLogLevel", { defaultValue: () => "Info" });
/** @internal */
const MinimumLogLevel = /* @__PURE__ */ Reference("effect/References/MinimumLogLevel", { defaultValue: () => "Info" });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/effect.js
/** @internal */
var Interrupt = class extends ReasonBase {
	fiberId;
	constructor(fiberId, annotations = constEmptyAnnotations) {
		super("Interrupt", annotations, "Interrupted");
		this.fiberId = fiberId;
	}
	toString() {
		return `Interrupt(${this.fiberId})`;
	}
	toJSON() {
		return {
			_tag: "Interrupt",
			fiberId: this.fiberId
		};
	}
	[symbol$2](that) {
		return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
	}
	[symbol$3]() {
		return combine(string$1(`${this._tag}:${this.fiberId}`))(random(this.annotations));
	}
};
/** @internal */
const causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
/** @internal */
const findError$1 = (self) => {
	for (let i = 0; i < self.reasons.length; i++) {
		const reason = self.reasons[i];
		if (reason._tag === "Fail") return succeed$4(reason.error);
	}
	return fail$5(self);
};
/** @internal */
const hasInterrupts = (self) => self.reasons.some(isInterruptReason);
/** @internal */
const causeCombine = /* @__PURE__ */ dual(2, (self, that) => {
	if (self.reasons.length === 0) return that;
	else if (that.reasons.length === 0) return self;
	const newCause = new CauseImpl(union$1(self.reasons, that.reasons));
	return equals$2(self, newCause) ? self : newCause;
});
/** @internal */
const causePartition = (self) => {
	const obj = {
		Fail: [],
		Die: [],
		Interrupt: []
	};
	for (let i = 0; i < self.reasons.length; i++) obj[self.reasons[i]._tag].push(self.reasons[i]);
	return obj;
};
/** @internal */
const causeSquash = (self) => {
	const partitioned = causePartition(self);
	if (partitioned.Fail.length > 0) return partitioned.Fail[0].error;
	else if (partitioned.Die.length > 0) return partitioned.Die[0].defect;
	else if (partitioned.Interrupt.length > 0) return new globalThis.Error("All fibers interrupted without error");
	return new globalThis.Error("Empty cause");
};
/** @internal */
const FiberTypeId = `~effect/Fiber/dev`;
const fiberVariance = {
	_A: identity,
	_E: identity
};
const fiberIdStore = { id: 0 };
/** @internal */
const getCurrentFiber = () => globalThis[currentFiberTypeId];
/** @internal */
var FiberImpl = class {
	constructor(context, interruptible = true) {
		this[FiberTypeId] = fiberVariance;
		this.setContext(context);
		this.id = ++fiberIdStore.id;
		this.currentOpCount = 0;
		this.currentLoopCount = 0;
		this.interruptible = interruptible;
		this._stack = [];
		this._observers = [];
		this._exit = void 0;
		this._children = void 0;
		this._interruptedCause = void 0;
		this._yielded = void 0;
		this.runtimeMetrics?.recordFiberStart(this.context);
	}
	[FiberTypeId];
	id;
	interruptible;
	currentOpCount;
	currentLoopCount;
	_stack;
	_observers;
	_exit;
	_currentExit;
	_children;
	_interruptedCause;
	_yielded;
	context;
	currentScheduler;
	currentTracerContext;
	currentSpan;
	currentLogLevel;
	minimumLogLevel;
	currentStackFrame;
	runtimeMetrics;
	maxOpsBeforeYield;
	currentPreventYield;
	_dispatcher = void 0;
	get currentDispatcher() {
		return this._dispatcher ??= this.currentScheduler.makeDispatcher();
	}
	getRef(ref) {
		return getReferenceUnsafe(this.context, ref);
	}
	addObserver(cb) {
		if (this._exit) {
			cb(this._exit);
			return constVoid;
		}
		this._observers.push(cb);
		return () => {
			const index = this._observers.indexOf(cb);
			if (index >= 0) this._observers.splice(index, 1);
		};
	}
	interruptUnsafe(fiberId, annotations) {
		if (this._exit) return;
		let cause = causeInterrupt(fiberId);
		if (this.currentStackFrame) cause = causeAnnotate(cause, make$18(StackTraceKey, this.currentStackFrame));
		if (annotations) cause = causeAnnotate(cause, annotations);
		this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
		if (this.interruptible) this.evaluate(failCause$3(this._interruptedCause));
	}
	pollUnsafe() {
		return this._exit;
	}
	evaluate(effect) {
		if (this._exit) return;
		else if (this._yielded !== void 0) {
			const yielded = this._yielded;
			this._yielded = void 0;
			yielded();
		}
		const exit = this.runLoop(effect);
		if (exit === Yield) return;
		const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
		if (interruptChildren !== void 0) return this.evaluate(flatMap$1(interruptChildren, () => exit));
		this._exit = exit;
		this.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
		for (let i = 0; i < this._observers.length; i++) this._observers[i](exit);
		this._observers.length = 0;
	}
	runLoop(effect) {
		const prevFiber = globalThis[currentFiberTypeId];
		globalThis[currentFiberTypeId] = this;
		let yielding = false;
		let current = effect;
		this.currentOpCount = 0;
		const currentLoop = ++this.currentLoopCount;
		try {
			while (true) {
				this.currentOpCount++;
				if (!yielding && !this.currentPreventYield && this.currentScheduler.shouldYield(this)) {
					yielding = true;
					const prev = current;
					current = flatMap$1(yieldNow, () => prev);
				}
				current = this.currentTracerContext ? this.currentTracerContext(current, this) : current[evaluate](this);
				if (currentLoop !== this.currentLoopCount) return Yield;
				else if (current === Yield) {
					const yielded = this._yielded;
					if (ExitTypeId in yielded) {
						this._yielded = void 0;
						return yielded;
					}
					return Yield;
				}
			}
		} catch (error) {
			if (!hasProperty(current, evaluate)) return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
			return this.runLoop(exitDie(error));
		} finally {
			globalThis[currentFiberTypeId] = prevFiber;
		}
	}
	getCont(symbol) {
		while (true) {
			const op = this._stack.pop();
			if (!op) return void 0;
			const cont = op[contAll] && op[contAll](this);
			if (cont) {
				cont[symbol] = cont;
				return cont;
			}
			if (op[symbol]) return op;
		}
	}
	yieldWith(value) {
		this._yielded = value;
		return Yield;
	}
	children() {
		return this._children ??= /* @__PURE__ */ new Set();
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	setContext(context) {
		this.context = context;
		const scheduler = this.getRef(Scheduler);
		if (scheduler !== this.currentScheduler) {
			this.currentScheduler = scheduler;
			this._dispatcher = void 0;
		}
		this.currentSpan = context.mapUnsafe.get(ParentSpanKey);
		this.currentLogLevel = this.getRef(CurrentLogLevel);
		this.minimumLogLevel = this.getRef(MinimumLogLevel);
		this.currentStackFrame = context.mapUnsafe.get(CurrentStackFrame.key);
		this.maxOpsBeforeYield = this.getRef(MaxOpsBeforeYield);
		this.currentPreventYield = this.getRef(PreventSchedulerYield);
		this.runtimeMetrics = context.mapUnsafe.get(FiberRuntimeMetricsKey);
		const currentTracer = context.mapUnsafe.get(TracerKey);
		this.currentTracerContext = currentTracer ? currentTracer["context"] : void 0;
	}
	get currentSpanLocal() {
		return this.currentSpan?._tag === "Span" ? this.currentSpan : void 0;
	}
};
const fiberMiddleware = { interruptChildren: void 0 };
const fiberStackAnnotations = (fiber) => {
	if (!fiber.currentStackFrame) return void 0;
	const annotations = /* @__PURE__ */ new Map();
	annotations.set(StackTraceKey.key, fiber.currentStackFrame);
	return makeUnsafe$5(annotations);
};
/** @internal */
const fiberAwaitAll = (self) => callback((resume) => {
	const iter = self[Symbol.iterator]();
	const exits = [];
	let cancel = void 0;
	function loop() {
		let result = iter.next();
		while (!result.done) {
			if (result.value._exit) {
				exits.push(result.value._exit);
				result = iter.next();
				continue;
			}
			cancel = result.value.addObserver((exit) => {
				exits.push(exit);
				loop();
			});
			return;
		}
		resume(succeed$3(exits));
	}
	loop();
	return sync$1(() => cancel?.());
});
/** @internal */
const fiberInterruptAll = (fibers) => withFiber$1((parent) => {
	const annotations = fiberStackAnnotations(parent);
	for (const fiber of fibers) fiber.interruptUnsafe(parent.id, annotations);
	return asVoid$1(fiberAwaitAll(fibers));
});
/** @internal */
const succeed$3 = exitSucceed;
/** @internal */
const failCause$3 = exitFailCause;
/** @internal */
const fail$4 = exitFail;
/** @internal */
const sync$1 = /* @__PURE__ */ makePrimitive({
	op: "Sync",
	[evaluate](fiber) {
		const value = this[args]();
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
	}
});
/** @internal */
const suspend$2 = /* @__PURE__ */ makePrimitive({
	op: "Suspend",
	[evaluate](_fiber) {
		return this[args]();
	}
});
/** @internal */
const yieldNow = /* @__PURE__ */ (/* @__PURE__ */ makePrimitive({
	op: "Yield",
	[evaluate](fiber) {
		let resumed = false;
		fiber.currentDispatcher.scheduleTask(() => {
			if (resumed) return;
			fiber.evaluate(exitVoid);
		}, this[args] ?? 0);
		return fiber.yieldWith(() => {
			resumed = true;
		});
	}
}))(0);
/** @internal */
const succeedSome$1 = (a) => succeed$3(some(a));
/** @internal */
const succeedNone$1 = /* @__PURE__ */ succeed$3(/* @__PURE__ */ none());
/** @internal */
const die = (defect) => exitDie(defect);
/** @internal */
const failSync = (error) => suspend$2(() => fail$4(internalCall(error)));
/** @internal */
const void_$3 = /* @__PURE__ */ succeed$3(void 0);
const callbackOptions = /* @__PURE__ */ makePrimitive({
	op: "Async",
	single: false,
	[evaluate](fiber) {
		const register = internalCall(() => this[args][0].bind(fiber.currentScheduler));
		let resumed = false;
		let yielded = false;
		const controller = this[args][1] ? new AbortController() : void 0;
		const onCancel = register((effect) => {
			if (resumed) return;
			resumed = true;
			if (yielded) fiber.evaluate(effect);
			else yielded = effect;
		}, controller?.signal);
		if (yielded !== false) return yielded;
		yielded = true;
		fiber._yielded = () => {
			resumed = true;
		};
		if (controller === void 0 && onCancel === void 0) return Yield;
		fiber._stack.push(asyncFinalizer(() => {
			resumed = true;
			controller?.abort();
			return onCancel ?? exitVoid;
		}));
		return Yield;
	}
});
const asyncFinalizer = /* @__PURE__ */ makePrimitive({
	op: "AsyncFinalizer",
	[contAll](fiber) {
		if (fiber.interruptible) {
			fiber.interruptible = false;
			fiber._stack.push(setInterruptibleTrue);
		}
	},
	[contE](cause, _fiber) {
		return hasInterrupts(cause) ? flatMap$1(this[args](), () => failCause$3(cause)) : failCause$3(cause);
	}
});
/** @internal */
const callback = (register) => callbackOptions(register, register.length >= 2);
/** @internal */
const gen$1 = (...args) => suspend$2(() => fromIteratorUnsafe(args.length === 1 ? args[0]() : args[1].call(args[0].self)));
/** @internal */
const fnUntraced$1 = (body, ...pipeables) => {
	const fn = pipeables.length === 0 ? function() {
		return suspend$2(() => fromIteratorUnsafe(body.apply(this, arguments)));
	} : function() {
		let effect = suspend$2(() => fromIteratorUnsafe(body.apply(this, arguments)));
		for (let i = 0; i < pipeables.length; i++) effect = pipeables[i](effect, ...arguments);
		return effect;
	};
	return defineFunctionLength(body.length, fn);
};
const defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
	value: length,
	configurable: true
});
/** @internal */
const fnUntracedEager$1 = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
	return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
	let effect = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
	for (const pipeable of pipeables) effect = pipeable(effect);
	return effect;
});
const fromIteratorEagerUnsafe = (evaluate) => {
	try {
		const iterator = evaluate();
		let value = void 0;
		while (true) {
			const state = iterator.next(value);
			if (state.done) return succeed$3(state.value);
			const primitive = state.value;
			if (primitive && primitive._tag === "Success") {
				value = primitive.value;
				continue;
			} else if (primitive && primitive._tag === "Failure") return state.value;
			else {
				let isFirstExecution = true;
				return suspend$2(() => {
					if (isFirstExecution) {
						isFirstExecution = false;
						return flatMap$1(state.value, (value) => fromIteratorUnsafe(iterator, value));
					} else return suspend$2(() => fromIteratorUnsafe(evaluate()));
				});
			}
		}
	} catch (error) {
		return die(error);
	}
};
const fromIteratorUnsafe = /* @__PURE__ */ makePrimitive({
	op: "Iterator",
	single: false,
	[contA](value, fiber) {
		const iter = this[args][0];
		while (true) {
			const state = iter.next(value);
			if (state.done) return succeed$3(state.value);
			if (!effectIsExit(state.value)) {
				fiber._stack.push(this);
				return state.value;
			} else if (state.value._tag === "Failure") return state.value;
			value = state.value.value;
		}
	},
	[evaluate](fiber) {
		return this[contA](this[args][1], fiber);
	}
});
/** @internal */
const as = /* @__PURE__ */ dual(2, (self, value) => {
	const b = succeed$3(value);
	return flatMap$1(self, (_) => b);
});
/** @internal */
const andThen$1 = /* @__PURE__ */ dual(2, (self, f) => flatMap$1(self, (a) => isEffect$1(f) ? f : internalCall(() => f(a))));
/** @internal */
const asVoid$1 = (self) => flatMap$1(self, (_) => exitVoid);
/** @internal */
const flatMap$1 = /* @__PURE__ */ dual(2, (self, f) => {
	const onSuccess = Object.create(OnSuccessProto);
	onSuccess[args] = self;
	onSuccess[contA] = f.length !== 1 ? (a) => f(a) : f;
	return onSuccess;
});
const OnSuccessProto = /* @__PURE__ */ makePrimitiveProto({
	op: "OnSuccess",
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args];
	}
});
/** @internal */
const effectIsExit = (effect) => ExitTypeId in effect;
/** @internal */
const flatMapEager$1 = /* @__PURE__ */ dual(2, (self, f) => {
	if (effectIsExit(self)) return self._tag === "Success" ? f(self.value) : self;
	return flatMap$1(self, f);
});
/** @internal */
const map$2 = /* @__PURE__ */ dual(2, (self, f) => flatMap$1(self, (a) => succeed$3(internalCall(() => f(a)))));
/** @internal */
const mapEager$1 = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map$2(self, f));
/** @internal */
const mapErrorEager$1 = /* @__PURE__ */ dual(2, (self, f) => effectIsExit(self) ? exitMapError(self, f) : mapError$3(self, f));
/** @internal */
const catchEager$1 = /* @__PURE__ */ dual(2, (self, f) => {
	if (effectIsExit(self)) {
		if (self._tag === "Success") return self;
		const error = findError$1(self.cause);
		if (isFailure(error)) return self;
		return f(error.success);
	}
	return catch_$1(self, f);
});
/** @internal */
const exitIsSuccess = (self) => self._tag === "Success";
/** @internal */
const exitVoid = /* @__PURE__ */ exitSucceed(void 0);
/** @internal */
const exitMap = /* @__PURE__ */ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
/** @internal */
const exitMapError = /* @__PURE__ */ dual(2, (self, f) => {
	if (self._tag === "Success") return self;
	const error = findError$1(self.cause);
	if (isFailure(error)) return self;
	return exitFail(f(error.success));
});
/** @internal */
const exitAsVoidAll = (exits) => {
	const failures = [];
	for (const exit of exits) if (exit._tag === "Failure") failures.push(...exit.cause.reasons);
	return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
/** @internal */
const exitGetSuccess = (self) => exitIsSuccess(self) ? some(self.value) : none();
/** @internal */
const updateContext = /* @__PURE__ */ dual(2, (self, f) => withFiber$1((fiber) => {
	const prevContext = fiber.context;
	const nextContext = f(prevContext);
	if (prevContext === nextContext) return self;
	fiber.setContext(nextContext);
	return onExitPrimitive(self, () => {
		fiber.setContext(prevContext);
	});
}));
/** @internal */
const context$1 = () => getContext;
const getContext = /* @__PURE__ */ withFiber$1((fiber) => succeed$3(fiber.context));
/** @internal */
const provideContext$1 = /* @__PURE__ */ dual(2, (self, context) => {
	if (effectIsExit(self)) return self;
	return updateContext(self, merge$1(context));
});
/** @internal */
const provideService = function() {
	if (arguments.length === 1) return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
	return dual(3, (self, service, impl) => provideServiceImpl(self, service, impl)).apply(this, arguments);
};
const provideServiceImpl = (self, service, implementation) => updateContext(self, (s) => {
	if (s.mapUnsafe.get(service.key) === implementation) return s;
	return add(s, service, implementation);
});
/** @internal */
const catchCause$2 = /* @__PURE__ */ dual(2, (self, f) => {
	const onFailure = Object.create(OnFailureProto);
	onFailure[args] = self;
	onFailure[contE] = f.length !== 1 ? (cause) => f(cause) : f;
	return onFailure;
});
const OnFailureProto = /* @__PURE__ */ makePrimitiveProto({
	op: "OnFailure",
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args];
	}
});
/** @internal */
const catchCauseFilter$1 = /* @__PURE__ */ dual(3, (self, filter, f) => catchCause$2(self, (cause) => {
	const eb = filter(cause);
	return isFailure(eb) ? failCause$3(eb.failure) : internalCall(() => f(eb.success, cause));
}));
/** @internal */
const catch_$1 = /* @__PURE__ */ dual(2, (self, f) => catchCauseFilter$1(self, findError$1, (e) => f(e)));
/** @internal */
const mapError$3 = /* @__PURE__ */ dual(2, (self, f) => catch_$1(self, (error) => failSync(() => f(error))));
/** @internal */
const exit$1 = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
const exitPrimitive = /* @__PURE__ */ makePrimitive({
	op: "Exit",
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args];
	},
	[contA](value, _, exit) {
		return succeed$3(exit ?? exitSucceed(value));
	},
	[contE](cause, _, exit) {
		return succeed$3(exit ?? exitFailCause(cause));
	}
});
/** @internal */
const ScopeTypeId = "~effect/Scope";
/** @internal */
const ScopeCloseableTypeId = "~effect/Scope/Closeable";
/** @internal */
const scopeTag = /* @__PURE__ */ Service("effect/Scope");
/** @internal */
const scopeClose = (self, exit_) => suspend$2(() => scopeCloseUnsafe(self, exit_) ?? void_$3);
/** @internal */
const scopeCloseUnsafe = (self, exit_) => {
	if (self.state._tag === "Closed") return;
	const closed = {
		_tag: "Closed",
		exit: exit_
	};
	if (self.state._tag === "Empty") {
		self.state = closed;
		return;
	}
	const { finalizers } = self.state;
	self.state = closed;
	if (finalizers.size === 0) return;
	else if (finalizers.size === 1) return finalizers.values().next().value(exit_);
	return scopeCloseFinalizers(self, finalizers, exit_);
};
const scopeCloseFinalizers = /* @__PURE__ */ fnUntraced$1(function* (self, finalizers, exit_) {
	let exits = [];
	const fibers = [];
	const arr = Array.from(finalizers.values());
	const parent = getCurrentFiber();
	for (let i = arr.length - 1; i >= 0; i--) {
		const finalizer = arr[i];
		if (self.strategy === "sequential") exits.push(yield* exit$1(finalizer(exit_)));
		else fibers.push(forkUnsafe$1(parent, finalizer(exit_), true, true, "inherit"));
	}
	if (fibers.length > 0) exits = yield* fiberAwaitAll(fibers);
	return yield* exitAsVoidAll(exits);
});
/** @internal */
const scopeForkUnsafe = (scope, finalizerStrategy) => {
	const newScope = scopeMakeUnsafe(finalizerStrategy);
	if (scope.state._tag === "Closed") {
		newScope.state = scope.state;
		return newScope;
	}
	const key = {};
	scopeAddFinalizerUnsafe(scope, key, (exit) => scopeClose(newScope, exit));
	scopeAddFinalizerUnsafe(newScope, key, (_) => sync$1(() => scopeRemoveFinalizerUnsafe(scope, key)));
	return newScope;
};
/** @internal */
const scopeAddFinalizerExit = (scope, finalizer) => {
	return suspend$2(() => {
		if (scope.state._tag === "Closed") return finalizer(scope.state.exit);
		scopeAddFinalizerUnsafe(scope, {}, finalizer);
		return void_$3;
	});
};
/** @internal */
const scopeAddFinalizerUnsafe = (scope, key, finalizer) => {
	if (scope.state._tag === "Empty") scope.state = {
		_tag: "Open",
		finalizers: new Map([[key, finalizer]])
	};
	else if (scope.state._tag === "Open") scope.state.finalizers.set(key, finalizer);
};
/** @internal */
const scopeRemoveFinalizerUnsafe = (scope, key) => {
	if (scope.state._tag === "Open") scope.state.finalizers.delete(key);
};
/** @internal */
const scopeMakeUnsafe = (finalizerStrategy = "sequential") => ({
	[ScopeCloseableTypeId]: ScopeCloseableTypeId,
	[ScopeTypeId]: ScopeTypeId,
	strategy: finalizerStrategy,
	state: constScopeEmpty
});
const constScopeEmpty = { _tag: "Empty" };
/** @internal */
const provideScope = /* @__PURE__ */ provideService(scopeTag);
/** @internal */
const onExitPrimitive = /* @__PURE__ */ makePrimitive({
	op: "OnExit",
	single: false,
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args][0];
	},
	[contAll](fiber) {
		if (fiber.interruptible && this[args][2] !== true) {
			fiber._stack.push(setInterruptibleTrue);
			fiber.interruptible = false;
		}
	},
	[contA](value, _, exit) {
		exit ??= exitSucceed(value);
		const eff = this[args][1](exit);
		return eff ? flatMap$1(eff, (_) => exit) : exit;
	},
	[contE](cause, _, exit) {
		exit ??= exitFailCause(cause);
		const eff = this[args][1](exit);
		return eff ? flatMap$1(eff, (_) => exit) : exit;
	}
});
/** @internal */
const onExit$1 = /* @__PURE__ */ dual(2, onExitPrimitive);
const setInterruptibleTrue = /* @__PURE__ */ (/* @__PURE__ */ makePrimitive({
	op: "SetInterruptible",
	[contAll](fiber) {
		fiber.interruptible = this[args];
		if (fiber._interruptedCause && fiber.interruptible) return () => failCause$3(fiber._interruptedCause);
	}
}))(true);
/** @internal */
const whileLoop$1 = /* @__PURE__ */ makePrimitive({
	op: "While",
	[contA](value, fiber) {
		this[args].step(value);
		if (this[args].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	},
	[evaluate](fiber) {
		if (this[args].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	}
});
/** @internal */
const forEach = /* @__PURE__ */ dual((args) => typeof args[1] === "function", (iterable, f, options) => withFiber$1((parent) => {
	const concurrencyOption = options?.concurrency === "inherit" ? parent.getRef(CurrentConcurrency) : options?.concurrency ?? 1;
	const concurrency = concurrencyOption === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrencyOption);
	if (concurrency === 1) return forEachSequential(iterable, f, options);
	const items = fromIterable$2(iterable);
	let length = items.length;
	if (length === 0) return options?.discard ? void_$3 : succeed$3([]);
	const out = options?.discard ? void 0 : new Array(length);
	const eff = forEachConcurrent({
		f,
		out
	}, items, { concurrency });
	return eff ? as(eff, out) : succeed$3(out);
}));
const forEachSequential = (iterable, f, options) => suspend$2(() => {
	const out = options?.discard ? void 0 : [];
	const iterator = iterable[Symbol.iterator]();
	let state = iterator.next();
	let index = 0;
	return as(whileLoop$1({
		while: () => !state.done,
		body: () => f(state.value, index++),
		step: (b) => {
			if (out) out.push(b);
			state = iterator.next();
		}
	}), out);
});
const iterateEagerImpl = (options) => {
	const onItem = options.onItem;
	const step = options.step;
	return (state, items, opts) => {
		let index = opts?.start ?? 0;
		const end = opts?.end ?? items.length;
		const concurrency = opts?.concurrency ?? 1;
		let done = false;
		let parentFiber;
		let fibers;
		let resume;
		let interrupted = false;
		let terminal;
		let effect;
		const go = () => {
			let paused = false;
			for (; !terminal && index < end; index++) {
				const item = items[index];
				const eff = effect ?? onItem(state, item, index);
				if (effectIsExit(eff)) {
					terminal = step(state, item, eff, index);
					if (terminal) break;
				} else if (concurrency === 1) return flatMap$1(exit$1(eff), (exit) => {
					terminal = step(state, item, exit, index);
					index++;
					return terminal ?? go() ?? void_$3;
				});
				else if (!parentFiber) return callback((cb) => {
					parentFiber = getCurrentFiber();
					effect = eff;
					resume = cb;
					const result = go();
					if (result) return cb(result);
					return suspend$2(() => {
						terminal = exitVoid;
						interrupted = true;
						return fibers ? fiberInterruptAll(fibers) : void_$3;
					});
				});
				else {
					effect = void 0;
					const fiber = forkUnsafe$1(parentFiber, eff, true, true, "inherit");
					if (fiber._exit) {
						terminal = step(state, item, fiber._exit, index);
						if (terminal) break;
						continue;
					}
					if (fibers) fibers.add(fiber);
					else fibers = new Set([fiber]);
					const currentIndex = index;
					fiber.addObserver((exit) => {
						fibers.delete(fiber);
						if (terminal) {
							if (!interrupted && exit._tag === "Failure") for (const reason of exit.cause.reasons) if (reason._tag === "Interrupt") continue;
							else if (terminal._tag === "Failure") terminal.cause.reasons.push(reason);
							else terminal = exitFailCause(causeFromReasons([reason]));
						} else {
							const result = step(state, item, exit, currentIndex);
							if (result) {
								terminal = result._tag === "Failure" ? exitFailCause(causeFromReasons(result.cause.reasons.slice())) : result;
								go();
							}
						}
						if (paused) {
							const eff = go();
							if (eff) resume(eff);
						} else if (done && fibers.size === 0) resume(terminal ?? void_$3);
					});
					if (fibers.size < concurrency) continue;
					paused = true;
					index++;
					return;
				}
			}
			done = true;
			if (terminal) {
				if (fibers && fibers.size > 0) {
					const annotations = fiberStackAnnotations(parentFiber);
					fibers.forEach((f) => f.interruptUnsafe(parentFiber.id, annotations));
					return;
				}
				if (resume || terminal._tag === "Failure") return terminal;
			} else if (resume) {
				if (!fibers) return exitVoid;
				else if (fibers.size === 0) resume(void_$3);
			}
		};
		return go();
	};
};
/** @internal */
const iterateEager = () => iterateEagerImpl;
const forEachConcurrent = /* @__PURE__ */ iterateEagerImpl({
	onItem(state, item, index) {
		return state.f(item, index);
	},
	step(state, _, exit, index) {
		if (exit._tag === "Failure") return exit;
		else if (state.out) state.out[index] = exit.value;
	}
});
/** @internal */
const forkUnsafe$1 = (parent, effect, immediate = false, daemon = false, uninterruptible = false) => {
	const interruptible = uninterruptible === "inherit" ? parent.interruptible : !uninterruptible;
	const child = new FiberImpl(parent.context, interruptible);
	if (immediate) child.evaluate(effect);
	else parent.currentDispatcher.scheduleTask(() => child.evaluate(effect), 0);
	if (!daemon && !child._exit) {
		parent.children().add(child);
		child.addObserver(() => parent._children.delete(child));
	}
	return child;
};
/** @internal */
const runForkWith = (context) => (effect, options) => {
	const fiber = new FiberImpl(options?.scheduler ? add(context, Scheduler, options.scheduler) : context, options?.uninterruptible !== true);
	fiber.evaluate(effect);
	if (fiber._exit) return fiber;
	if (options?.signal) if (options.signal.aborted) fiber.interruptUnsafe();
	else {
		const abort = () => fiber.interruptUnsafe();
		options.signal.addEventListener("abort", abort, { once: true });
		fiber.addObserver(() => options.signal.removeEventListener("abort", abort));
	}
	if (options?.onFiberStart) options.onFiberStart(fiber);
	return fiber;
};
/** @internal */
const runSyncExitWith = (context) => {
	const runFork = runForkWith(context);
	return (effect) => {
		if (effectIsExit(effect)) return effect;
		const fiber = runFork(effect, { scheduler: new MixedScheduler("sync") });
		fiber.currentDispatcher?.flush();
		return fiber._exit ?? exitDie(new AsyncFiberError(fiber));
	};
};
/** @internal */
const runSyncExit$1 = /* @__PURE__ */ runSyncExitWith(/* @__PURE__ */ empty$8());
/** @internal */
const runSyncWith = (context) => {
	const runSyncExit = runSyncExitWith(context);
	return (effect) => {
		const exit = runSyncExit(effect);
		if (exit._tag === "Failure") throw causeSquash(exit.cause);
		return exit.value;
	};
};
/** @internal */
const runSync$1 = /* @__PURE__ */ runSyncWith(/* @__PURE__ */ empty$8());
TaggedError$1("TimeoutError");
TaggedError$1("IllegalArgumentError");
TaggedError$1("ExceededCapacityError");
/** @internal */
const AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
/** @internal */
var AsyncFiberError = class extends TaggedError$1("AsyncFiberError") {
	[AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
	constructor(fiber) {
		super({
			message: "An asynchronous Effect was executed with Effect.runSync",
			fiber
		});
	}
};
TaggedError$1("UnknownError");
const colors = {
	bold: "1",
	red: "31",
	green: "32",
	yellow: "33",
	blue: "34",
	cyan: "36",
	white: "37",
	gray: "90",
	black: "30",
	bgBrightRed: "101"
};
colors.gray, colors.blue, colors.green, colors.yellow, colors.red, colors.bgBrightRed, colors.black;
const hasProcessStdout = typeof process === "object" && process !== null && typeof process.stdout === "object" && process.stdout !== null;
hasProcessStdout && process.stdout.isTTY;
hasProcessStdout || "Deno" in globalThis;
/**
* Returns the first typed error value `E` from a cause.
* Returns `Filter.fail` with the remaining cause when no `Fail` is found.
*
* Use {@link findFail} if you need the full {@link Fail} reason (including
* annotations). Use {@link findErrorOption} if you prefer an `Option`.
*
* **Example** (extracting the first error value)
*
* ```ts
* import { Cause, Result } from "effect"
*
* const result = Cause.findError(Cause.fail("error"))
* if (!Result.isFailure(result)) {
*   console.log(result.success) // "error"
* }
* ```
*
* @see {@link findFail} — extract the full `Fail` reason
* @see {@link findErrorOption} — `Option`-based variant
*
* @category filters
* @since 4.0.0
*/
const findError = findError$1;
Service()("effect/Cause/StackTrace");
Service()("effect/Cause/InterruptorStackTrace");
/**
* Creates a tagged error class with a `_tag` discriminator.
*
* Like {@link Error}, but instances also carry a `readonly _tag` property,
* enabling `Effect.catchTag` and `Effect.catchTags` for tag-based recovery.
* The `_tag` is excluded from the constructor argument.
*
* - Use for domain errors in Effect applications where you want
*   discriminated-union error handling.
* - Yielding an instance inside `Effect.gen` fails the effect with this error.
*
* **Example** (tag-based error recovery)
*
* ```ts
* import { Data, Effect } from "effect"
*
* class NotFound extends Data.TaggedError("NotFound")<{
*   readonly resource: string
* }> {}
*
* class Forbidden extends Data.TaggedError("Forbidden")<{
*   readonly reason: string
* }> {}
*
* const program = Effect.gen(function*() {
*   return yield* new NotFound({ resource: "/users/42" })
* })
*
* const recovered = program.pipe(
*   Effect.catchTag("NotFound", (e) =>
*     Effect.succeed(`missing: ${e.resource}`))
* )
* ```
*
* @see {@link Error} — without a `_tag`
* @see {@link TaggedClass} — tagged class that is not an error
*
* @category constructors
* @since 2.0.0
*/
const TaggedError = TaggedError$1;
/**
* Creates a failed Exit from a typed error value.
*
* - Use for expected, recoverable failures
* - The error is wrapped in a `Cause.Fail` internally
*
* Returns a `Failure<never, E>`.
*
* **Example** (Creating a failed Exit)
*
* ```ts
* import { Exit } from "effect"
*
* const exit = Exit.fail("Something went wrong")
* console.log(Exit.isFailure(exit)) // true
* ```
*
* @see {@link succeed} to create a successful Exit
* @see {@link die} to create a Failure from an unexpected defect
* @see {@link failCause} to create a Failure from a full Cause
*
* @category constructors
* @since 2.0.0
*/
const fail$3 = exitFail;
const void_$2 = exitVoid;
/**
* Returns the success value of an Exit as an Option.
*
* - Use when you want to optionally extract the value without pattern matching
* - Returns `Option.some(value)` for a Success, `Option.none()` for a Failure
*
* **Example** (Getting the success value)
*
* ```ts
* import { Exit } from "effect"
*
* console.log(Exit.getSuccess(Exit.succeed(42))) // { _tag: "Some", value: 42 }
* console.log(Exit.getSuccess(Exit.fail("err"))) // { _tag: "None" }
* ```
*
* @see {@link getCause} to extract the Cause of a failure
* @see {@link filterValue} for filter-pipeline usage
*
* @category Accessors
* @since 4.0.0
*/
const getSuccess = exitGetSuccess;
const DeferredProto = {
	["~effect/Deferred"]: {
		_A: identity,
		_E: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Unsafely creates a new `Deferred`
*
* @example
* ```ts
* import { Deferred } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* console.log(deferred)
* ```
*
* @since 2.0.0
* @category unsafe
*/
const makeUnsafe$4 = () => {
	const self = Object.create(DeferredProto);
	self.resumes = void 0;
	self.effect = void 0;
	return self;
};
const _await = (self) => callback((resume) => {
	if (self.effect) return resume(self.effect);
	self.resumes ??= [];
	self.resumes.push(resume);
	return sync$1(() => {
		const index = self.resumes.indexOf(resume);
		self.resumes.splice(index, 1);
	});
});
/**
* Exits the `Deferred` with the specified `Exit` value, which will be
* propagated to all fibers waiting on the value of the `Deferred`.
*
* @example
* ```ts
* import { Deferred, Effect, Exit } from "effect"
*
* const program = Effect.gen(function*() {
*   const deferred = yield* Deferred.make<number>()
*   yield* Deferred.done(deferred, Exit.succeed(42))
*
*   const value = yield* Deferred.await(deferred)
*   console.log(value) // 42
* })
* ```
*
* @since 2.0.0
* @category utils
*/
const done = /* @__PURE__ */ dual(2, (self, effect) => sync$1(() => doneUnsafe(self, effect)));
/**
* Unsafely exits the `Deferred` with the specified `Exit` value, which will be
* propagated to all fibers waiting on the value of the `Deferred`.
*
* @example
* ```ts
* import { Deferred, Effect } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* const success = Deferred.doneUnsafe(deferred, Effect.succeed(42))
* console.log(success) // true
* ```
*
* @since 2.0.0
* @category unsafe
*/
const doneUnsafe = (self, effect) => {
	if (self.effect) return false;
	self.effect = effect;
	if (self.resumes) {
		for (let i = 0; i < self.resumes.length; i++) self.resumes[i](effect);
		self.resumes = void 0;
	}
	return true;
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Scope.js
/**
* The `Scope` module provides functionality for managing resource lifecycles
* and cleanup operations in a functional and composable manner.
*
* A `Scope` represents a context where resources can be acquired and automatically
* cleaned up when the scope is closed. This is essential for managing resources
* like file handles, database connections, or any other resources that need
* proper cleanup.
*
* Scopes support both sequential and parallel finalization strategies:
* - Sequential: Finalizers run one after another in reverse order of registration
* - Parallel: Finalizers run concurrently for better performance
*
* @since 2.0.0
*/
/**
* The service tag for `Scope`, used for dependency injection in the Effect system.
*
* @example
* ```ts
* import { Effect, Scope } from "effect"
*
* const program = Effect.gen(function*() {
*   // Access the scope from the context
*   const scope = yield* Scope.Scope
*
*   // Use the scope for resource management
*   yield* Scope.addFinalizer(scope, Effect.log("Cleanup"))
* })
*
* // Provide a scope to the program
* const scoped = Effect.scoped(program)
* ```
*
* @since 2.0.0
* @category tags
*/
const Scope = scopeTag;
/**
* Creates a new `Scope` synchronously without wrapping it in an `Effect`.
* This is useful when you need a scope immediately but should be used with caution
* as it doesn't provide the same safety guarantees as the `Effect`-wrapped version.
*
* @example
* ```ts
* import { Console, Effect, Exit, Scope } from "effect"
*
* // Create a scope immediately
* const scope = Scope.makeUnsafe("sequential")
*
* // Use it in an Effect program
* const program = Effect.gen(function*() {
*   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
*   yield* Scope.close(scope, Exit.void)
* })
* ```
*
* @since 4.0.0
* @category constructors
*/
const makeUnsafe$3 = scopeMakeUnsafe;
/**
* Provides a `Scope` to an `Effect`, removing the `Scope` requirement from its context.
* This allows you to run effects that require a scope by explicitly providing one.
*
* **Previously Known As**
*
* This API replaces the following from Effect 3.x:
*
* - `Scope.extend`
*
* @example
* ```ts
* import { Console, Effect, Scope } from "effect"
*
* // An effect that requires a Scope
* const program = Effect.gen(function*() {
*   const scope = yield* Scope.Scope
*   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
*   yield* Console.log("Working...")
* })
*
* // Provide a scope to the program
* const withScope = Effect.gen(function*() {
*   const scope = yield* Scope.make()
*   yield* Scope.provide(scope)(program)
* })
* ```
*
* @since 4.0.0
* @category combinators
*/
const provide$1 = provideScope;
/**
* Creates a child scope from a parent scope synchronously without wrapping it in an `Effect`.
* The child scope inherits the parent's finalization strategy unless overridden.
*
* @example
* ```ts
* import { Console, Effect, Exit, Scope } from "effect"
*
* const program = Effect.gen(function*() {
*   const parentScope = Scope.makeUnsafe("sequential")
*   const childScope = Scope.forkUnsafe(parentScope, "parallel")
*
*   // Add finalizers to both scopes
*   yield* Scope.addFinalizer(parentScope, Console.log("Parent cleanup"))
*   yield* Scope.addFinalizer(childScope, Console.log("Child cleanup"))
*
*   // Close child first, then parent
*   yield* Scope.close(childScope, Exit.void)
*   yield* Scope.close(parentScope, Exit.void)
* })
* ```
*
* @since 4.0.0
* @category combinators
*/
const forkUnsafe = scopeForkUnsafe;
/**
* Closes a scope, running all registered finalizers in the appropriate order.
* The exit value is passed to each finalizer.
*
* @example
* ```ts
* import { Console, Effect, Exit, Scope } from "effect"
*
* const resourceManagement = Effect.gen(function*() {
*   const scope = yield* Scope.make("sequential")
*
*   // Add multiple finalizers
*   yield* Scope.addFinalizer(scope, Console.log("Close database connection"))
*   yield* Scope.addFinalizer(scope, Console.log("Close file handle"))
*   yield* Scope.addFinalizer(scope, Console.log("Release memory"))
*
*   // Do some work...
*   yield* Console.log("Performing operations...")
*
*   // Close scope - finalizers run in reverse order of registration
*   yield* Scope.close(scope, Exit.succeed("Success!"))
*   // Output: "Release memory", "Close file handle", "Close database connection"
* })
* ```
*
* @category combinators
* @since 4.0.0
*/
const close = scopeClose;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Layer.js
const TypeId$24 = "~effect/Layer";
const MemoMapTypeId = "~effect/Layer/MemoMap";
const LayerProto = {
	[TypeId$24]: {
		_ROut: identity,
		_E: identity,
		_RIn: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const fromBuildUnsafe = (build) => {
	const self = Object.create(LayerProto);
	self.build = build;
	return self;
};
/**
* Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer.
*
* The function receives a `MemoMap` for memoization and a `Scope` for resource management.
* A child scope is created, and if the build fails, the child scope is closed.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const databaseLayer = Layer.fromBuild(() =>
*   Effect.sync(() =>
*     Context.make(Database, {
*       query: (sql: string) => Effect.succeed("result")
*     })
*   )
* )
* ```
*
* @since 4.0.0
* @category constructors
*/
const fromBuild = (build) => fromBuildUnsafe((memoMap, scope) => {
	const layerScope = forkUnsafe(scope);
	return onExit$1(build(memoMap, layerScope), (exit) => exit._tag === "Failure" ? close(layerScope, exit) : void_$3);
});
/**
* Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer,
* with automatic memoization.
*
* This is similar to `fromBuild` but provides automatic memoization of the layer construction.
* The layer will be memoized based on the provided `MemoMap`.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const databaseLayer = Layer.fromBuildMemo(() =>
*   Effect.sync(() =>
*     Context.make(Database, {
*       query: (sql: string) => Effect.succeed("result")
*     })
*   )
* )
* ```
*
* @since 4.0.0
* @category constructors
*/
const fromBuildMemo = (build) => {
	const self = fromBuild((memoMap, scope) => memoMap.getOrElseMemoize(self, scope, build));
	return self;
};
var MemoMapImpl = class {
	get [MemoMapTypeId]() {
		return MemoMapTypeId;
	}
	map = /* @__PURE__ */ new Map();
	getOrElseMemoize(layer, scope, build) {
		if (this.map.has(layer)) {
			const entry = this.map.get(layer);
			entry.observers++;
			return andThen$1(scopeAddFinalizerExit(scope, (exit) => entry.finalizer(exit)), entry.effect);
		}
		const layerScope = makeUnsafe$3();
		const deferred = makeUnsafe$4();
		const entry = {
			observers: 1,
			effect: _await(deferred),
			finalizer: (exit) => suspend$2(() => {
				entry.observers--;
				if (entry.observers === 0) {
					this.map.delete(layer);
					return close(layerScope, exit);
				}
				return void_$3;
			})
		};
		this.map.set(layer, entry);
		return scopeAddFinalizerExit(scope, entry.finalizer).pipe(flatMap$1(() => build(this, layerScope)), onExit$1((exit) => {
			entry.effect = exit;
			return done(deferred, exit);
		}));
	}
};
/**
* Constructs a `MemoMap` that can be used to build additional layers.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* // Create a memo map for manual layer building
* const program = Effect.gen(function*() {
*   const memoMap = Layer.makeMemoMapUnsafe()
*   const scope = yield* Effect.scope
*
*   const dbLayer = Layer.succeed(Database)({
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*   const context = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
*
*   return Context.get(context, Database)
* })
* ```
*
* @since 4.0.0
* @category memo map
*/
const makeMemoMapUnsafe = () => new MemoMapImpl();
/**
* A service reference for the current `MemoMap` used in layer construction.
*
* This service provides access to the current memoization map during layer building,
* allowing layers to share memoized results.
*
* @since 3.13.0
* @category models
*/
var CurrentMemoMap = class extends Service()("effect/Layer/CurrentMemoMap") {
	static getOrCreate = /* @__PURE__ */ getOrElse(this, makeMemoMapUnsafe);
};
/**
* Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize
* the layer construction.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* // Build layers with explicit memoization control
* const program = Effect.gen(function*() {
*   const memoMap = yield* Layer.makeMemoMap
*   const scope = yield* Effect.scope
*
*   // Build database layer with memoization
*   const dbLayer = Layer.succeed(Database)({
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*   const dbContext = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
*
*   // Build logger layer with same memoization (reuses memo if same layer)
*   const loggerLayer = Layer.succeed(Logger)({
*     log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
*   })
*   const loggerContext = yield* Layer.buildWithMemoMap(
*     loggerLayer,
*     memoMap,
*     scope
*   )
*
*   return {
*     database: Context.get(dbContext, Database),
*     logger: Context.get(loggerContext, Logger)
*   }
* })
* ```
*
* @since 2.0.0
* @category memo map
*/
const buildWithMemoMap = /* @__PURE__ */ dual(3, (self, memoMap, scope) => provideService(map$2(self.build(memoMap, scope), add(CurrentMemoMap, memoMap)), CurrentMemoMap, memoMap));
/**
* Constructs a layer from the specified value, which must return one or more
* services.
*
* This is a more general version of `succeed` that allows you to provide multiple
* services at once through a `Context`.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* const context = Context.make(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
* }).pipe(
*   Context.add(Logger, {
*     log: (msg: string) => Effect.sync(() => console.log(msg))
*   })
* )
*
* const layer = Layer.succeedContext(context)
* ```
*
* @since 2.0.0
* @category constructors
*/
const succeedContext = (context) => fromBuildUnsafe(constant(succeed$3(context)));
/**
* Constructs a layer from the specified scoped effect, which must return one
* or more services.
*
* This allows you to create a Layer from an effectful computation that returns
* multiple services. The Effect is executed in the scope of the layer.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<
*   Database,
*   { readonly query: (sql: string) => Effect.Effect<string> }
* >()("Database") {}
*
* const layer = Layer.effectContext(
*   Effect.succeed(Context.make(Database, {
*     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
*   }))
* )
* ```
*
* @since 2.0.0
* @category constructors
*/
const effectContext = (effect) => fromBuildMemo((_, scope) => provide$1(effect, scope));
/**
* Constructs a layer from the specified scoped effect.
*
* This is useful when you want to run an Effect for its side effects during
* layer construction, but don't need to provide any services.
*
* **Previously Known As**
*
* This API replaces the following from Effect 3.x:
*
* - `Layer.scopedDiscard`
*
* @example
* ```ts
* import { Effect, Layer } from "effect"
*
* const initLayer = Layer.effectDiscard(
*   Effect.sync(() => {
*     console.log("Initializing application...")
*   })
* )
* ```
*
* @since 2.0.0
* @category constructors
*/
const effectDiscard = (effect) => effectContext(as(effect, empty$8()));
const mergeAllEffect = (layers, memoMap, scope) => {
	const parentScope = forkUnsafe(scope, "parallel");
	return forEach(layers, (layer) => layer.build(memoMap, forkUnsafe(parentScope, "sequential")), { concurrency: layers.length }).pipe(map$2((context) => mergeAll(...context)));
};
const provideWith = (self, that, f) => fromBuild((memoMap, scope) => flatMap$1(Array.isArray(that) ? mergeAllEffect(that, memoMap, scope) : that.build(memoMap, scope), (context) => self.build(memoMap, scope).pipe(provideContext$1(context), map$2((merged) => f(merged, context)))));
/**
* Feeds the output services of this builder into the input of the specified
* builder, resulting in a new builder with the inputs of this builder as
* well as any leftover inputs, and the outputs of the specified builder.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class UserService extends Context.Service<UserService, {
*   readonly getUser: (id: string) => Effect.Effect<{
*     id: string
*     name: string
*   }>
* }>()("UserService") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* // Create dependency layers
* const databaseLayer = Layer.succeed(Database)({
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
* })
*
* const loggerLayer = Layer.succeed(Logger)({
*   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`)))
* })
*
* // UserService depends on Database and Logger
* const userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {
*   const database = yield* Database
*   const logger = yield* Logger
*
*   return {
*     getUser: Effect.fn("UserService.getUser")(function*(id: string) {
*         yield* logger.log(`Looking up user ${id}`)
*         const result = yield* database.query(
*           `SELECT * FROM users WHERE id = ${id}`
*         )
*         return { id, name: result }
*       })
*   }
* }))
*
* // Provide dependencies to UserService layer
* const userServiceWithDependencies = userServiceLayer.pipe(
*   Layer.provide(Layer.mergeAll(databaseLayer, loggerLayer))
* )
*
* // Now UserService layer has no dependencies
* const program = Effect.gen(function*() {
*   const userService = yield* UserService
*   return yield* userService.getUser("123")
* }).pipe(
*   Effect.provide(userServiceWithDependencies)
* )
* ```
*
* @since 2.0.0
* @category utils
*/
const provide = /* @__PURE__ */ dual(2, (self, that) => provideWith(self, that, identity));
/**
* Feeds the output services of this layer into the input of the specified
* layer, resulting in a new layer with the inputs of this layer, and the
* outputs of both layers.
*
* @example
* ```ts
* import { Effect, Layer, Context } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* class UserService extends Context.Service<UserService, {
*   readonly getUser: (id: string) => Effect.Effect<{
*     id: string
*     name: string
*   }>
* }>()("UserService") {}
*
* // Create dependency layers
* const databaseLayer = Layer.succeed(Database)({
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
* })
*
* const loggerLayer = Layer.succeed(Logger)({
*   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`)))
* })
*
* // UserService depends on Database and Logger
* const userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {
*   const database = yield* Database
*   const logger = yield* Logger
*
*   return {
*     getUser: Effect.fn("UserService.getUser")(function*(id: string) {
*         yield* logger.log(`Looking up user ${id}`)
*         const result = yield* database.query(
*           `SELECT * FROM users WHERE id = ${id}`
*         )
*         return { id, name: result }
*       })
*   }
* }))
*
* // Provide dependencies and merge all services together
* const allServicesLayer = userServiceLayer.pipe(
*   Layer.provideMerge(Layer.mergeAll(databaseLayer, loggerLayer))
* )
*
* // Now the resulting layer provides UserService, Database, AND Logger
* const program = Effect.gen(function*() {
*   const userService = yield* UserService
*   const logger = yield* Logger // Still available!
*   const database = yield* Database // Still available!
*
*   const user = yield* userService.getUser("123")
*   yield* logger.log(`Found user: ${user.name}`)
*
*   return user
* }).pipe(
*   Effect.provide(allServicesLayer)
* )
* ```
*
* @since 2.0.0
* @category utils
*/
const provideMerge = /* @__PURE__ */ dual(2, (self, that) => provideWith(self, that, (self, that) => merge$1(that, self)));
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/dateTime.js
/** @internal */
const TypeId$23 = "~effect/time/DateTime";
/** @internal */
const TimeZoneTypeId = "~effect/time/DateTime/TimeZone";
const Proto$9 = {
	[TypeId$23]: TypeId$23,
	pipe() {
		return pipeArguments(this, arguments);
	},
	[NodeInspectSymbol]() {
		return this.toString();
	},
	toJSON() {
		return toDateUtc$1(this).toJSON();
	}
};
({ ...Proto$9 });
({ ...Proto$9 });
const ProtoTimeZone = {
	[TimeZoneTypeId]: TimeZoneTypeId,
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
({ ...ProtoTimeZone });
({ ...ProtoTimeZone });
/** @internal */
const toDateUtc$1 = (self) => new Date(self.epochMilliseconds);
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Effect.js
/**
* Tests if a value is an `Effect`.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* console.log(Effect.isEffect(Effect.succeed(1))) // true
* console.log(Effect.isEffect("hello")) // false
* ```
*
* @since 2.0.0
* @category Guards
*/
const isEffect = isEffect$1;
/**
* Creates an `Effect` that always succeeds with a given value.
*
* **When to Use**
*
* Use this function when you need an effect that completes successfully with a
* specific value without any errors or external dependencies.
*
* @see {@link fail} to create an effect that represents a failure.
*
* @example
* ```ts
* // Title: Creating a Successful Effect
* import { Effect } from "effect"
*
* // Creating an effect that represents a successful scenario
* //
* //      ┌─── Effect<number, never, never>
* //      ▼
* const success = Effect.succeed(42)
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const succeed$2 = succeed$3;
/**
* Returns an effect which succeeds with `None`.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* const program = Effect.succeedNone
*
* Effect.runPromise(program).then(console.log)
* // Output: { _id: 'Option', _tag: 'None' }
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const succeedNone = succeedNone$1;
/**
* Returns an effect which succeeds with the value wrapped in a `Some`.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* const program = Effect.succeedSome(42)
*
* Effect.runPromise(program).then(console.log)
* // Output: { _id: 'Option', _tag: 'Some', value: 42 }
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const succeedSome = succeedSome$1;
/**
* Provides a way to write effectful code using generator functions, simplifying
* control flow and error handling.
*
* **When to Use**
*
* `gen` allows you to write code that looks and behaves like synchronous
* code, but it can handle asynchronous tasks, errors, and complex control flow
* (like loops and conditions). It helps make asynchronous code more readable
* and easier to manage.
*
* The generator functions work similarly to `async/await` but with more
* explicit control over the execution of effects. You can `yield*` values from
* effects and return the final result at the end.
*
* @example
* ```ts
* import { Data, Effect } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const fetchDiscountRate = Effect.promise(() => Promise.resolve(5))
*
* export const program = Effect.gen(function*() {
*   const transactionAmount = yield* fetchTransactionAmount
*   const discountRate = yield* fetchDiscountRate
*   const discountedAmount = yield* applyDiscount(
*     transactionAmount,
*     discountRate
*   )
*   const finalAmount = addServiceCharge(discountedAmount)
*   return `Final amount to charge: ${finalAmount}`
* })
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const gen = gen$1;
/**
* Creates an `Effect` that represents a recoverable error.
*
* **When to Use**
*
* Use this function to explicitly signal an error in an `Effect`. The error
* will keep propagating unless it is handled. You can handle the error with
* functions like {@link catchAll} or {@link catchTag}.
*
* @see {@link succeed} to create an effect that represents a successful value.
*
* @example
* ```ts
* // Title: Creating a Failed Effect
* import { Data, Effect } from "effect"
*
* class OperationFailedError extends Data.TaggedError("OperationFailedError")<{}> {}
*
* //      ┌─── Effect<never, OperationFailedError, never>
* //      ▼
* const failure = Effect.fail(
*   new OperationFailedError()
* )
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const fail$2 = fail$4;
/**
* Provides access to the current fiber within an effect computation.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* const program = Effect.withFiber((fiber) =>
*   Effect.succeed(`Fiber ID: ${fiber.id}`)
* )
*
* Effect.runPromise(program).then(console.log)
* // Output: Fiber ID: 1
* ```
*
* @since 2.0.0
* @category Creating Effects
*/
const withFiber = withFiber$1;
/**
* Chains effects to produce new `Effect` instances, useful for combining
* operations that depend on previous results.
*
* **Syntax**
*
* ```ts skip-type-checking
* const flatMappedEffect = pipe(myEffect, Effect.flatMap(transformation))
* // or
* const flatMappedEffect = Effect.flatMap(myEffect, transformation)
* // or
* const flatMappedEffect = myEffect.pipe(Effect.flatMap(transformation))
* ```
*
* **Details**
*
* `flatMap` lets you sequence effects so that the result of one effect can be
* used in the next step. It is similar to `flatMap` used with arrays but works
* specifically with `Effect` instances, allowing you to avoid deeply nested
* effect structures.
*
* Since effects are immutable, `flatMap` always returns a new effect instead of
* changing the original one.
*
* **When to Use**
*
* Use `flatMap` when you need to chain multiple effects, ensuring that each
* step produces a new `Effect` while flattening any nested effects that may
* occur.
*
* @example
* ```ts
* import { Data, Effect, pipe } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* // Chaining the fetch and discount application using `flatMap`
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* Effect.runPromise(finalAmount).then(console.log)
* // Output: 95
* ```
*
* @see {@link tap} for a version that ignores the result of the effect.
*
* @since 2.0.0
* @category Sequencing
*/
const flatMap = flatMap$1;
/**
* Transforms an effect to encapsulate both failure and success using the `Exit`
* data type.
*
* **Details**
*
* `exit` wraps an effect's success or failure inside an `Exit` type, allowing
* you to handle both cases explicitly.
*
* The resulting effect cannot fail because the failure is encapsulated within
* the `Exit.Failure` type. The error type is set to `never`, indicating that
* the effect is structured to never fail directly.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* const success = Effect.succeed(42)
* const failure = Effect.fail("Something went wrong")
*
* const program1 = Effect.exit(success)
* const program2 = Effect.exit(failure)
*
* Effect.runPromise(program1).then(console.log)
* // { _id: 'Exit', _tag: 'Success', value: 42 }
*
* Effect.runPromise(program2).then(console.log)
* // { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong' } }
* ```
*
* @see {@link option} for a version that uses `Option` instead.
* @see {@link result} for a version that uses `Result` instead.
*
* @since 2.0.0
* @category Outcome Encapsulation
*/
const exit = exit$1;
/**
* Transforms the value inside an effect by applying a function to it.
*
* **Syntax**
*
* ```ts skip-type-checking
* const mappedEffect = pipe(myEffect, Effect.map(transformation))
* // or
* const mappedEffect = Effect.map(myEffect, transformation)
* // or
* const mappedEffect = myEffect.pipe(Effect.map(transformation))
* ```
*
* **Details**
*
* `map` takes a function and applies it to the value contained within an
* effect, creating a new effect with the transformed value.
*
* It's important to note that effects are immutable, meaning that the original
* effect is not modified. Instead, a new effect is returned with the updated
* value.
*
* @example Adding a Service Charge
* ```ts
* import { Effect, pipe } from "effect"
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.map(addServiceCharge)
* )
*
* Effect.runPromise(finalAmount).then(console.log)
* // Output: 101
* ```
*
* @see {@link mapError} for a version that operates on the error channel.
* @see {@link mapBoth} for a version that operates on both channels.
* @see {@link flatMap} or {@link andThen} for a version that can return a new effect.
*
* @since 2.0.0
* @category Mapping
*/
const map$1 = map$2;
/**
* Returns the complete context.
*
* This function allows you to access all services that are currently available
* in the effect's environment. This can be useful for debugging, introspection,
* or when you need to pass the entire context to another function.
*
* @example
* ```ts
* import { Console, Effect, Option, Context } from "effect"
*
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* const program = Effect.gen(function*() {
*   const allServices = yield* Effect.context()
*
*   // Check if specific services are available
*   const loggerOption = Context.getOption(allServices, Logger)
*   const databaseOption = Context.getOption(allServices, Database)
*
*   yield* Console.log(`Logger available: ${Option.isSome(loggerOption)}`)
*   yield* Console.log(`Database available: ${Option.isSome(databaseOption)}`)
* })
*
* const context = Context.make(Logger, { log: console.log })
*   .pipe(Context.add(Database, { query: () => "result" }))
*
* const provided = Effect.provideContext(program, context)
* ```
*
* @since 2.0.0
* @category Environment
*/
const context = context$1;
/**
* Executes an effect synchronously, running it immediately and returning the
* result.
*
* **When to Use**
*
* Use `runSync` to run an effect that does not fail and does not include
* any asynchronous operations.
*
* If the effect fails or involves asynchronous work, it will throw an error,
* and execution will stop where the failure or async operation occurs.
*
* @see {@link runSyncExit} for a version that returns an `Exit` type instead of
* throwing an error.
*
* @example
* ```ts
* // Title: Synchronous Logging
* import { Effect } from "effect"
*
* const program = Effect.sync(() => {
*   console.log("Hello, World!")
*   return 1
* })
*
* const result = Effect.runSync(program)
* // Output: Hello, World!
*
* console.log(result)
* // Output: 1
* ```
*
* @example
* // Title: Incorrect Usage with Failing or Async Effects
* import { Effect } from "effect"
*
* try {
*   // Attempt to run an effect that fails
*   Effect.runSync(Effect.fail("my error"))
* } catch (e) {
*   console.error(e)
* }
* // Output:
* // (FiberFailure) Error: my error
*
* try {
*   // Attempt to run an effect that involves async work
*   Effect.runSync(Effect.promise(() => Promise.resolve(1)))
* } catch (e) {
*   console.error(e)
* }
* // Output:
* // (FiberFailure) AsyncFiberException: Fiber #0 cannot be resolved synchronously. This is caused by using runSync on an effect that performs async work
*
* @since 2.0.0
* @category Running Effects
*/
const runSync = runSync$1;
/**
* Runs an effect synchronously and returns the result as an `Exit` type, which
* represents the outcome (success or failure) of the effect.
*
* **When to Use**
*
* Use `runSyncExit` to find out whether an effect succeeded or failed,
* including any defects, without dealing with asynchronous operations.
*
* **Details**
*
* The `Exit` type represents the result of the effect:
* - If the effect succeeds, the result is wrapped in a `Success`.
* - If it fails, the failure information is provided as a `Failure` containing
*   a `Cause` type.
*
* If the effect contains asynchronous operations, `runSyncExit` will
* return an `Failure` with a `Die` cause, indicating that the effect cannot be
* resolved synchronously.
*
* @example
* ```ts
* // Title: Handling Results as Exit
* import { Effect } from "effect"
*
* console.log(Effect.runSyncExit(Effect.succeed(1)))
* // Output:
* // {
* //   _id: "Exit",
* //   _tag: "Success",
* //   value: 1
* // }
*
* console.log(Effect.runSyncExit(Effect.fail("my error")))
* // Output:
* // {
* //   _id: "Exit",
* //   _tag: "Failure",
* //   cause: {
* //     _id: "Cause",
* //     _tag: "Fail",
* //     failure: "my error"
* //   }
* // }
* ```
*
* @example
* // Title: Asynchronous Operation Resulting in Die
* import { Effect } from "effect"
*
* console.log(Effect.runSyncExit(Effect.promise(() => Promise.resolve(1))))
* // Output:
* // {
* //   _id: 'Exit',
* //   _tag: 'Failure',
* //   cause: {
* //     _id: 'Cause',
* //     _tag: 'Die',
* //     defect: [Fiber #0 cannot be resolved synchronously. This is caused by using runSync on an effect that performs async work] {
* //       fiber: [FiberRuntime],
* //       _tag: 'AsyncFiberException',
* //       name: 'AsyncFiberException'
* //     }
* //   }
* // }
*
* @since 2.0.0
* @category Running Effects
*/
const runSyncExit = runSyncExit$1;
Service()("effect/Effect/Transaction");
/**
* An optimized version of `map` that checks if an effect is already resolved
* and applies the mapping function eagerly when possible.
*
* **When to Use**
*
* `mapEager` provides better performance for effects that are already resolved
* by applying the transformation immediately instead of deferring it through
* the effect pipeline.
*
* **Behavior**
*
* - For **Success effects**: Applies the mapping function immediately to the value
* - For **Failure effects**: Returns the failure as-is without applying the mapping
* - For **Pending effects**: Falls back to the regular `map` behavior
*
* @example
* ```ts
* import { Effect } from "effect"
*
* // For resolved effects, the mapping is applied immediately
* const resolved = Effect.succeed(5)
* const mapped = Effect.mapEager(resolved, (n) => n * 2) // Applied eagerly
*
* // For pending effects, behaves like regular map
* const pending = Effect.delay(Effect.succeed(5), "100 millis")
* const mappedPending = Effect.mapEager(pending, (n) => n * 2) // Uses regular map
* ```
*
* @since 4.0.0
* @category Eager
*/
const mapEager = mapEager$1;
/**
* An optimized version of `mapError` that checks if an effect is already resolved
* and applies the error mapping function eagerly when possible.
*
* **When to Use**
*
* `mapErrorEager` provides better performance for effects that are already resolved
* by applying the error transformation immediately instead of deferring it through
* the effect pipeline.
*
* **Behavior**
*
* - For **Success effects**: Returns the success as-is (no error to transform)
* - For **Failure effects**: Applies the mapping function immediately to the error
* - For **Pending effects**: Falls back to the regular `mapError` behavior
*
* @example
* ```ts
* import { Effect } from "effect"
*
* // For resolved failure effects, the error mapping is applied immediately
* const failed = Effect.fail("original error")
* const mapped = Effect.mapErrorEager(failed, (err: string) => `mapped: ${err}`) // Applied eagerly
*
* // For pending effects, behaves like regular mapError
* const pending = Effect.delay(Effect.fail("error"), "100 millis")
* const mappedPending = Effect.mapErrorEager(
*   pending,
*   (err: string) => `mapped: ${err}`
* ) // Uses regular mapError
* ```
*
* @since 4.0.0
* @category Eager
*/
const mapErrorEager = mapErrorEager$1;
/**
* An optimized version of `flatMap` that checks if an effect is already resolved
* and applies the flatMap function eagerly when possible.
*
* **When to Use**
*
* `flatMapEager` provides better performance for effects that are already resolved
* by applying the transformation immediately instead of deferring it through
* the effect pipeline.
*
* **Behavior**
*
* - For **Success effects**: Applies the flatMap function immediately to the value
* - For **Failure effects**: Returns the failure as-is without applying the flatMap
* - For **Pending effects**: Falls back to the regular `flatMap` behavior
*
* @example
* ```ts
* import { Effect } from "effect"
*
* // For resolved effects, the flatMap is applied immediately
* const resolved = Effect.succeed(5)
* const flatMapped = Effect.flatMapEager(resolved, (n) => Effect.succeed(n * 2)) // Applied eagerly
*
* // For pending effects, behaves like regular flatMap
* const pending = Effect.delay(Effect.succeed(5), "100 millis")
* const flatMappedPending = Effect.flatMapEager(
*   pending,
*   (n) => Effect.succeed(n * 2)
* ) // Uses regular flatMap
* ```
*
* @since 4.0.0
* @category Eager
*/
const flatMapEager = flatMapEager$1;
/**
* An optimized version of `catch` that checks if an effect is already resolved
* and applies the catch function eagerly when possible.
*
* **When to Use**
*
* `catchEager` provides better performance for effects that are already resolved
* by applying the error recovery immediately instead of deferring it through
* the effect pipeline.
*
* **Behavior**
*
* - For **Success effects**: Returns the success as-is (no error to catch)
* - For **Failure effects**: Applies the catch function immediately to the error
* - For **Pending effects**: Falls back to the regular `catch` behavior
*
* @example
* ```ts
* import { Effect } from "effect"
*
* // For resolved failure effects, the catch function is applied immediately
* const failed = Effect.fail("original error")
* const recovered = Effect.catchEager(
*   failed,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Applied eagerly
*
* // For success effects, returns success as-is
* const success = Effect.succeed(42)
* const unchanged = Effect.catchEager(
*   success,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Returns success as-is
*
* // For pending effects, behaves like regular catch
* const pending = Effect.delay(Effect.fail("error"), "100 millis")
* const recoveredPending = Effect.catchEager(
*   pending,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Uses regular catch
* ```
*
* @since 4.0.0
* @category Eager
*/
const catchEager = catchEager$1;
/**
* Creates untraced function effects with eager evaluation optimization.
*
* Executes generator functions eagerly when all yielded effects are synchronous,
* stopping at the first async effect and deferring to normal execution.
*
* @example
* ```ts
* import { Effect } from "effect"
*
* const computation = Effect.fnUntracedEager(function*() {
*   yield* Effect.succeed(1)
*   yield* Effect.succeed(2)
*   return "computed eagerly"
* })
*
* const effect = computation() // Executed immediately if all effects are sync
* ```
*
* @since 4.0.0
* @category Eager
*/
const fnUntracedEager = fnUntracedEager$1;
Service()("effect/DateTime/CurrentTimeZone");
TaggedError("EncodingError");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/schema/annotations.js
/** @internal */
function resolve(ast) {
	return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
/** @internal */
function resolveAt$1(key) {
	return (ast) => resolve(ast)?.[key];
}
/** @internal */
const resolveIdentifier$1 = /* @__PURE__ */ resolveAt$1("identifier");
/** @internal */
const resolveDescription$1 = /* @__PURE__ */ resolveAt$1("description");
/** @internal */
const getExpected = /* @__PURE__ */ memoize((ast) => {
	const identifier = resolveIdentifier$1(ast);
	if (typeof identifier === "string") return identifier;
	return ast.getExpected(getExpected);
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/record.js
/**
* @since 4.0.0
*/
/** @internal */
function set(self, key, value) {
	if (key === "__proto__") Object.defineProperty(self, key, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
	else self[key] = value;
	return self;
}
globalThis.RegExp;
/**
* Escapes special characters in a regular expression pattern.
*
* @example
* ```ts
* import { RegExp } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(RegExp.escape("a*b"), "a\\*b")
* ```
*
* @category utilities
* @since 2.0.0
*/
const escape = (string) => string.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/redacted.js
/** @internal */
const redactedRegistry = /* @__PURE__ */ new WeakMap();
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Redacted.js
/**
* The Redacted module provides functionality for handling sensitive information
* securely within your application. By using the `Redacted` data type, you can
* ensure that sensitive values are not accidentally exposed in logs or error
* messages.
*
* @since 3.3.0
*/
const TypeId$22 = "~effect/data/Redacted";
/**
* @example
* ```ts
* import { Redacted } from "effect"
*
* const secret = Redacted.make("my-secret")
* const plainString = "not-secret"
*
* console.log(Redacted.isRedacted(secret)) // true
* console.log(Redacted.isRedacted(plainString)) // false
* ```
*
* @since 3.3.0
* @category refinements
*/
const isRedacted = (u) => hasProperty(u, TypeId$22);
/**
* This function creates a `Redacted<A>` instance from a given value `A`,
* securely hiding its content.
*
* @example
* ```ts
* import { Redacted } from "effect"
*
* const API_KEY = Redacted.make("1234567890")
* ```
*
* @since 3.3.0
* @category constructors
*/
const make$13 = (value, options) => {
	const self = Object.create(Proto$8);
	if (options?.label) self.label = options.label;
	redactedRegistry.set(self, value);
	return self;
};
const Proto$8 = {
	[TypeId$22]: { _A: (_) => _ },
	label: void 0,
	...PipeInspectableProto,
	toJSON() {
		return this.toString();
	},
	toString() {
		return `<redacted${isString(this.label) ? ":" + this.label : ""}>`;
	},
	[symbol$3]() {
		return hash(redactedRegistry.get(this));
	},
	[symbol$2](that) {
		return isRedacted(that) && equals$2(redactedRegistry.get(this), redactedRegistry.get(that));
	}
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaIssue.js
const TypeId$21 = "~effect/SchemaIssue/Issue";
/**
* Returns `true` if the given value is an {@link Issue}.
*
* When to use:
*
* - Narrowing an `unknown` value to `Issue` in error-handling code.
* - Distinguishing an `Issue` from other error types in a catch-all handler.
*
* Behaviour:
*
* - Pure; does not mutate input.
* - Checks for the internal `TypeId` brand on the value.
*
* **Example** (Type-guarding an unknown error)
*
* ```ts
* import { SchemaIssue } from "effect"
*
* const issue = new SchemaIssue.MissingKey(undefined)
* console.log(SchemaIssue.isIssue(issue))
* // true
* console.log(SchemaIssue.isIssue("not an issue"))
* // false
* ```
*
* @see {@link Issue}
*
* @since 4.0.0
*/
function isIssue(u) {
	return hasProperty(u, TypeId$21);
}
var Base$1 = class {
	[TypeId$21] = TypeId$21;
	toString() {
		return defaultFormatter(this);
	}
};
/**
* Issue produced when a schema filter (refinement check) fails.
*
* When to use:
*
* - Inspect which filter rejected the value.
* - Walk the inner `issue` for the specific validation failure.
*
* Behaviour:
*
* - `actual` is the raw input value that was tested (plain `unknown`, not
*   wrapped in `Option`).
* - `filter` is the AST filter node that produced this issue.
* - `issue` is the inner issue describing the failure reason.
*
* **Example** (Matching a Filter issue)
*
* ```ts
* import { SchemaIssue } from "effect"
*
* function describe(issue: SchemaIssue.Issue): string {
*   if (issue._tag === "Filter") {
*     return `Filter failed on: ${JSON.stringify(issue.actual)}`
*   }
*   return String(issue)
* }
* ```
*
* @see {@link Leaf} — terminal issue types that commonly appear as the inner `issue`
* @see {@link CheckHook} — formatter hook for `Filter` issues
*
* @category model
* @since 4.0.0
*/
var Filter$1 = class extends Base$1 {
	_tag = "Filter";
	/**
	* The input value that caused the issue.
	*/
	actual;
	/**
	* The filter that failed.
	*/
	filter;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(actual, filter, issue) {
		super();
		this.actual = actual;
		this.filter = filter;
		this.issue = issue;
	}
};
/**
* Issue produced when a schema transformation (encode/decode step) fails.
*
* When to use:
*
* - Inspect failures from `Schema.decodeTo` / `Schema.encodeTo`
*   transformations.
* - Walk the inner `issue` for the root cause of the transformation failure.
*
* Behaviour:
*
* - `ast` is the AST node for the transformation that failed.
* - `actual` is `Option.some(value)` when the input was present, or
*   `Option.none()` when it was absent.
* - `issue` is the inner issue describing the failure.
*
* @see {@link Filter} — failure from a refinement check (not a transformation)
* @see {@link Composite} — multiple issues from a single schema node
*
* @category model
* @since 4.0.0
*/
var Encoding = class extends Base$1 {
	_tag = "Encoding";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(ast, actual, issue) {
		super();
		this.ast = ast;
		this.actual = actual;
		this.issue = issue;
	}
};
/**
* Wraps an inner {@link Issue} with a property-key path, indicating *where* in
* a nested structure the error occurred.
*
* When to use:
*
* - Walk the issue tree to accumulate path segments for error reporting.
* - Match on `_tag === "Pointer"` when flattening nested issues.
*
* Behaviour:
*
* - `path` is an array of property keys (strings, numbers, or symbols).
* - Has no `actual` value — {@link getActual} returns `Option.none()`.
* - Formatters concatenate nested `Pointer` paths into a single path like
*   `["a"]["b"][0]`.
*
* @see {@link getActual} — returns `Option.none()` for `Pointer`
* @see {@link Composite} — groups multiple issues under one schema node
*
* @category model
* @since 4.0.0
*/
var Pointer = class extends Base$1 {
	_tag = "Pointer";
	/**
	* The path to the location in the input that caused the issue.
	*/
	path;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(path, issue) {
		super();
		this.path = path;
		this.issue = issue;
	}
};
/**
* Issue produced when a required key or tuple index is missing from the input.
*
* When to use:
*
* - Detect absent fields in struct/tuple validation.
* - Typically found inside a {@link Pointer} that indicates which key is
*   missing.
*
* Behaviour:
*
* - Has no `actual` value — {@link getActual} returns `Option.none()`.
* - `annotations` may contain a custom `messageMissingKey` for formatting.
*
* @see {@link Pointer} — wraps this issue with the missing key's path
* @see {@link UnexpectedKey} — the opposite case (extra key present)
*
* @category model
* @since 4.0.0
*/
var MissingKey = class extends Base$1 {
	_tag = "MissingKey";
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(annotations) {
		super();
		this.annotations = annotations;
	}
};
/**
* Issue produced when an input object or tuple contains a key/index not
* declared by the schema.
*
* When to use:
*
* - Detect excess properties during strict struct/tuple validation.
* - Typically found inside a {@link Pointer} that indicates which key was
*   unexpected.
*
* Behaviour:
*
* - `actual` is the raw value at the unexpected key (plain `unknown`).
* - `ast` is the schema that was being validated against.
* - `annotations` on `ast` may contain a custom `messageUnexpectedKey`.
*
* @see {@link MissingKey} — the opposite case (required key absent)
* @see {@link Pointer} — wraps this issue with the unexpected key's path
*
* @category model
* @since 4.0.0
*/
var UnexpectedKey = class extends Base$1 {
	_tag = "UnexpectedKey";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	constructor(ast, actual) {
		super();
		this.ast = ast;
		this.actual = actual;
	}
};
/**
* Issue that groups multiple child issues under a single schema node.
*
* When to use:
*
* - Walk the issue tree for struct/tuple schemas that collect all field errors
*   rather than failing on the first.
* - Match on `_tag === "Composite"` to iterate over `issues`.
*
* Behaviour:
*
* - `issues` is a non-empty readonly array (at least one child).
* - `actual` is `Option.some(value)` when the input was present, or
*   `Option.none()` when absent.
* - Formatters flatten `Composite` by recursing into each child.
*
* @see {@link AnyOf} — used for union no-match errors (similar but different semantics)
* @see {@link Pointer} — adds path context to individual issues
*
* @category model
* @since 4.0.0
*/
var Composite = class extends Base$1 {
	_tag = "Composite";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, actual, issues) {
		super();
		this.ast = ast;
		this.actual = actual;
		this.issues = issues;
	}
};
/**
* Issue produced when the runtime type of the input does not match the type
* expected by the schema (e.g. got `null` when `string` was expected).
*
* When to use:
*
* - Detect basic type mismatches (wrong primitive, null where object expected,
*   etc.).
* - The most common leaf issue in typical validation failures.
*
* Behaviour:
*
* - `ast` is the schema node that expected a different type.
* - `actual` is `Option.some(value)` when the input was present, or
*   `Option.none()` when no value was provided.
* - The default formatter renders this as `"Expected <type>, got <actual>"`.
*
* **Example** (Formatted output)
*
* ```ts
* import { Schema } from "effect"
*
* try {
*   Schema.decodeUnknownSync(Schema.String)(42)
* } catch (e) {
*   if (Schema.isSchemaError(e)) {
*     console.log(String(e.issue))
*     // "Expected string, got 42"
*   }
* }
* ```
*
* @see {@link InvalidValue} — the input has the right type but fails a value constraint
*
* @category model
* @since 4.0.0
*/
var InvalidType = class extends Base$1 {
	_tag = "InvalidType";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	constructor(ast, actual) {
		super();
		this.ast = ast;
		this.actual = actual;
	}
};
/**
* Issue produced when the input has the correct type but its value violates a
* constraint (e.g. a string that is too short, a number out of range).
*
* When to use:
*
* - Detect constraint violations from `Schema.filter`, `Schema.minLength`,
*   `Schema.greaterThan`, etc.
* - Create custom validation errors in `Schema.makeFilter` callbacks.
*
* Behaviour:
*
* - `actual` is `Option.some(value)` when the failing value is known, or
*   `Option.none()` when absent.
* - `annotations` optionally carries a `message` string for formatting.
* - The default formatter renders this as `"Invalid data <actual>"` unless a
*   custom `message` annotation is provided.
*
* **Example** (Custom filter returning InvalidValue)
*
* ```ts
* import { Option, SchemaIssue } from "effect"
*
* const issue = new SchemaIssue.InvalidValue(
*   Option.some(""),
*   { message: "must not be empty" }
* )
* console.log(String(issue))
* // "must not be empty"
* ```
*
* @see {@link InvalidType} — the input has the wrong type entirely
* @see {@link Filter} — composite wrapper when a schema filter produces this issue
*
* @category model
* @since 4.0.0
*/
var InvalidValue = class extends Base$1 {
	_tag = "InvalidValue";
	/**
	* The value that caused the issue.
	*/
	actual;
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(actual, annotations) {
		super();
		this.actual = actual;
		this.annotations = annotations;
	}
};
/**
* Issue produced when a value does not match *any* member of a union schema.
*
* When to use:
*
* - Inspect which union members were attempted and why each failed.
* - `issues` may be empty when the union has no members or when the input does
*   not pass the initial type guard.
*
* Behaviour:
*
* - `ast` is the `Union` AST node.
* - `actual` is the raw input value (plain `unknown`).
* - `issues` contains per-member failures. When empty, the formatter falls
*   back to the union's `expected` annotation.
*
* @see {@link OneOf} — the opposite: *too many* members matched
* @see {@link Composite} — groups multiple issues under a non-union schema
*
* @category model
* @since 4.0.0
*/
var AnyOf = class extends Base$1 {
	_tag = "AnyOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, actual, issues) {
		super();
		this.ast = ast;
		this.actual = actual;
		this.issues = issues;
	}
};
/**
* Issue produced when a value matches *multiple* members of a union that is
* configured to allow exactly one match (oneOf mode).
*
* When to use:
*
* - Detect ambiguous union matches when `oneOf` validation is enabled.
* - Inspect `successes` to see which members matched.
*
* Behaviour:
*
* - `ast` is the `Union` AST node.
* - `actual` is the raw input value (plain `unknown`).
* - `successes` lists the AST nodes of each member that accepted the input.
* - The default formatter renders this as
*   `"Expected exactly one member to match the input <actual>"`.
*
* @see {@link AnyOf} — the opposite: *no* members matched
*
* @category model
* @since 4.0.0
*/
var OneOf = class extends Base$1 {
	_tag = "OneOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The input value that caused the issue.
	*/
	actual;
	/**
	* The schemas that were successful.
	*/
	successes;
	constructor(ast, actual, successes) {
		super();
		this.ast = ast;
		this.actual = actual;
		this.successes = successes;
	}
};
function makeFilterIssue(input, entry) {
	if (isIssue(entry)) return entry;
	if (typeof entry === "string") return new InvalidValue(some(input), { message: entry });
	const inner = typeof entry.issue === "string" ? new InvalidValue(some(input), { message: entry.issue }) : entry.issue;
	return new Pointer(entry.path, inner);
}
/** @internal */
function makeSingle(input, out) {
	if (out === void 0) return;
	if (typeof out === "boolean") return out ? void 0 : new InvalidValue(some(input));
	return makeFilterIssue(input, out);
}
/** @internal */
function make$12(input, ast, out) {
	if (Array.isArray(out)) {
		if (isReadonlyArrayNonEmpty(out)) {
			if (out.length === 1) return makeFilterIssue(input, out[0]);
			return new Composite(ast, some(input), map$3(out, (entry) => makeFilterIssue(input, entry)));
		}
		return;
	}
	return makeSingle(input, out);
}
/**
* The built-in {@link LeafHook} used by default formatters.
*
* When to use:
*
* - Use as-is when you only need to customise the {@link CheckHook} but want
*   the default leaf rendering.
* - Reference as a starting point for custom `LeafHook` implementations.
*
* Behaviour:
*
* - Checks for a `message` annotation first; returns it if present.
* - Otherwise generates a default message per `_tag`:
*   - `InvalidType` → `"Expected <type>, got <actual>"`
*   - `InvalidValue` → `"Invalid data <actual>"`
*   - `MissingKey` → `"Missing key"`
*   - `UnexpectedKey` → `"Unexpected key with value <actual>"`
*   - `Forbidden` → `"Forbidden operation"`
*   - `OneOf` → `"Expected exactly one member to match the input <actual>"`
*
* **Example** (Using defaultLeafHook with Standard Schema formatter)
*
* ```ts
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterStandardSchemaV1({
*   leafHook: SchemaIssue.defaultLeafHook
* })
* ```
*
* @see {@link LeafHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category Formatter
* @since 4.0.0
*/
const defaultLeafHook = (issue) => {
	const message = findMessage(issue);
	if (message !== void 0) return message;
	switch (issue._tag) {
		case "InvalidType": return getExpectedMessage(getExpected(issue.ast), formatOption(issue.actual));
		case "InvalidValue": return `Invalid data ${formatOption(issue.actual)}`;
		case "MissingKey": return "Missing key";
		case "UnexpectedKey": return `Unexpected key with value ${format$1(issue.actual)}`;
		case "Forbidden": return "Forbidden operation";
		case "OneOf": return `Expected exactly one member to match the input ${format$1(issue.actual)}`;
	}
};
/**
* The built-in {@link CheckHook} used by default formatters.
*
* When to use:
*
* - Use as-is when you only need to customise the {@link LeafHook} but want
*   the default filter rendering.
*
* Behaviour:
*
* - Looks for a `message` annotation on the inner issue first, then on the
*   filter itself.
* - Returns `undefined` when no annotation is found, causing the formatter to
*   fall back to `"Expected <filter>, got <actual>"`.
*
* @see {@link CheckHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category Formatter
* @since 4.0.0
*/
const defaultCheckHook = (issue) => {
	return findMessage(issue.issue) ?? findMessage(issue);
};
function getExpectedMessage(expected, actual) {
	return `Expected ${expected}, got ${actual}`;
}
function toDefaultIssues(issue, path, leafHook, checkHook) {
	switch (issue._tag) {
		case "Filter": {
			const message = checkHook(issue);
			if (message !== void 0) return [{
				path,
				message
			}];
			switch (issue.issue._tag) {
				case "InvalidValue": return [{
					path,
					message: getExpectedMessage(formatCheck(issue.filter), format$1(issue.actual))
				}];
				default: return toDefaultIssues(issue.issue, path, leafHook, checkHook);
			}
		}
		case "Encoding": return toDefaultIssues(issue.issue, path, leafHook, checkHook);
		case "Pointer": return toDefaultIssues(issue.issue, [...path, ...issue.path], leafHook, checkHook);
		case "Composite": return issue.issues.flatMap((issue) => toDefaultIssues(issue, path, leafHook, checkHook));
		case "AnyOf": {
			const message = findMessage(issue);
			if (issue.issues.length === 0) {
				if (message !== void 0) return [{
					path,
					message
				}];
				return [{
					path,
					message: getExpectedMessage(getExpected(issue.ast), format$1(issue.actual))
				}];
			}
			return issue.issues.flatMap((issue) => toDefaultIssues(issue, path, leafHook, checkHook));
		}
		default: return [{
			path,
			message: leafHook(issue)
		}];
	}
}
function formatCheck(check) {
	const expected = check.annotations?.expected;
	if (typeof expected === "string") return expected;
	switch (check._tag) {
		case "Filter": return "<filter>";
		case "FilterGroup": return check.checks.map((check) => formatCheck(check)).join(" & ");
	}
}
/**
* Creates a {@link Formatter} that converts an {@link Issue} into a
* human-readable multi-line string.
*
* When to use:
*
* - Produce error messages for logging, CLI output, or developer-facing
*   diagnostics.
* - This is the default formatter used by `Issue.toString()`.
*
* Behaviour:
*
* - Flattens the issue tree into `{ message, path }` entries using
*   {@link defaultLeafHook} and {@link defaultCheckHook}.
* - Each entry is rendered as `"<message>"` or `"<message>\n  at <path>"`.
* - Multiple entries are joined with newlines.
*
* **Example** (Formatting an issue as a string)
*
* ```ts
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterDefault()
* ```
*
* @see {@link makeFormatterStandardSchemaV1} — produces Standard Schema V1 format instead
* @see {@link Formatter}
*
* @category Formatter
* @since 4.0.0
*/
function makeFormatterDefault() {
	return (issue) => toDefaultIssues(issue, [], defaultLeafHook, defaultCheckHook).map(formatDefaultIssue).join("\n");
}
/** @internal */
const defaultFormatter = /* @__PURE__ */ makeFormatterDefault();
function formatDefaultIssue(issue) {
	let out = issue.message;
	if (issue.path && issue.path.length > 0) {
		const path = formatPath(issue.path);
		out += `\n  at ${path}`;
	}
	return out;
}
function findMessage(issue) {
	switch (issue._tag) {
		case "InvalidType":
		case "OneOf":
		case "Composite":
		case "AnyOf": return getMessageAnnotation(issue.ast.annotations);
		case "InvalidValue":
		case "Forbidden": return getMessageAnnotation(issue.annotations);
		case "MissingKey": return getMessageAnnotation(issue.annotations, "messageMissingKey");
		case "UnexpectedKey": return getMessageAnnotation(issue.ast.annotations, "messageUnexpectedKey");
		case "Filter": return getMessageAnnotation(issue.filter.annotations);
		case "Encoding": return findMessage(issue.issue);
	}
}
function getMessageAnnotation(annotations, type = "message") {
	const message = annotations?.[type];
	if (typeof message === "string") return message;
}
function formatOption(actual) {
	if (isNone(actual)) return "no value provided";
	return format$1(actual.value);
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaGetter.js
/**
* Composable transformation primitives for the Effect Schema system.
*
* A `Getter<T, E, R>` represents a single-direction transformation from an
* encoded type `E` to a decoded type `T`. Getters are the building blocks
* that `Schema.decodeTo` and `Schema.decode` use to define how values are
* transformed during encoding and decoding. They handle optionality
* (`Option<E>` in, `Option<T>` out), can fail with `Issue`, and can require
* Effect services via `R`.
*
* ## Mental model
*
* - **Getter**: A function `Option<E> -> Effect<Option<T>, Issue, R>`. It
*   transforms an optional encoded value into an optional decoded value,
*   possibly failing or requiring services.
* - **Passthrough**: The identity getter — returns the input unchanged. Used
*   when no transformation is needed. Optimized away during composition.
* - **Option-awareness**: Getters receive and return `Option` to handle
*   missing keys in structs. `Option.None` means the key is absent.
* - **Composition**: Getters compose left-to-right via `.compose()`. A
*   passthrough on either side is a no-op (identity optimization).
* - **Issue**: The error type for all getter failures (see `SchemaIssue`).
*
* ## Common tasks
*
* - Pass a value through unchanged → {@link passthrough}
* - Transform a value purely → {@link transform}
* - Transform a value with possible failure → {@link transformOrFail}
* - Transform with full Option control → {@link transformOptional}
* - Handle missing keys → {@link onNone}, {@link required}, {@link withDefault}
* - Handle present values → {@link onSome}
* - Validate a value with an effectful check → {@link checkEffect}
* - Produce a constant value → {@link succeed}
* - Always fail → {@link fail}, {@link forbidden}
* - Omit a value from output → {@link omit}
* - Coerce to a primitive type → {@link String}, {@link Number}, {@link Boolean}, {@link BigInt}, {@link Date}
* - Transform strings → {@link trim}, {@link capitalize}, {@link toLowerCase}, {@link toUpperCase}, {@link split}, {@link splitKeyValue}, {@link joinKeyValue}
* - Parse/stringify JSON → {@link parseJson}, {@link stringifyJson}
* - Encode/decode Base64 → {@link encodeBase64}, {@link decodeBase64}, {@link decodeBase64String}
* - Encode/decode Hex → {@link encodeHex}, {@link decodeHex}, {@link decodeHexString}
* - Encode/decode URI components → {@link encodeUriComponent}, {@link decodeUriComponent}
* - Parse DateTime → {@link dateTimeUtcFromInput}
* - Decode/encode FormData → {@link decodeFormData}, {@link encodeFormData}
* - Decode/encode URLSearchParams → {@link decodeURLSearchParams}, {@link encodeURLSearchParams}
* - Build nested tree from bracket paths → {@link makeTreeRecord}
* - Flatten nested tree to bracket paths → {@link collectBracketPathEntries}
*
* ## Gotchas
*
* - Getters are not bidirectional. To define a full encode/decode pair, supply
*   both a `decode` and an `encode` getter to `Schema.decodeTo`.
* - `passthrough` requires `T === E` by default. Use `{ strict: false }` to
*   bypass the type constraint, or use {@link passthroughSupertype} / {@link passthroughSubtype}.
* - `transform` skips `None` inputs (missing keys) — the function is only
*   called when a value is present. Use `transformOptional` if you need to
*   handle missing values.
* - `parseJson` without a `reviver` returns `Schema.MutableJson`. With a
*   reviver, the return type widens to `unknown`.
* - `split` treats an empty string as an empty array, not `[""]`.
*
* ## Quickstart
*
* **Example** (Using SchemaGetter with Schema.decodeTo)
*
* ```ts
* import { Schema, SchemaGetter } from "effect"
*
* const NumberFromString = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, {
*     decode: SchemaGetter.transform((s) => Number(s)),
*     encode: SchemaGetter.transform((n) => String(n))
*   })
* )
*
* const result = Schema.decodeUnknownSync(NumberFromString)("42")
* // result: 42
* ```
*
* ## See also
*
* - {@link Getter} — the core class
* - {@link transform} — most common constructor
* - {@link passthrough} — identity getter
* - {@link transformOrFail} — fallible transformation
*
* @since 4.0.0
*/
/**
* A composable transformation from an encoded type `E` to a decoded type `T`.
*
* A Getter wraps a function `Option<E> -> Effect<Option<T>, Issue, R>`:
* - Receives `Option.None` when the encoded key is absent (e.g. missing struct field).
* - Returns `Option.None` to omit the value from the decoded output.
* - Fails with `Issue` on invalid input.
* - May require Effect services via `R`.
*
* Use this when:
* - Building custom schema transformations with `Schema.decodeTo` or `Schema.decode`.
* - Composing multiple transformation steps into a single getter.
*
* Behavior:
* - Immutable — constructing or composing getters does not mutate existing instances.
* - `.map(f)` applies `f` to the decoded value (inside the `Some`), leaving `None` unchanged.
* - `.compose(other)` chains two getters: the output of `this` feeds into `other`.
*   Passthrough getters on either side are optimized away.
*
* **Example** (Creating and composing getters)
*
* ```ts
* import { SchemaGetter } from "effect"
*
* const parseNumber = SchemaGetter.transform<number, string>((s) => Number(s))
* const double = SchemaGetter.transform<number, number>((n) => n * 2)
* const composed = parseNumber.compose(double)
* // composed: Getter<number, string> — parses then doubles
* ```
*
* See also:
* - {@link transform} — create a getter from a pure function
* - {@link passthrough} — identity getter
* - {@link transformOrFail} — fallible transformation
*
* @category model
* @since 4.0.0
*/
var Getter = class Getter extends Class$2 {
	run;
	constructor(run) {
		super();
		this.run = run;
	}
	map(f) {
		return new Getter((oe, options) => this.run(oe, options).pipe(mapEager(map$5(f))));
	}
	compose(other) {
		if (isPassthrough(this)) return other;
		if (isPassthrough(other)) return this;
		return new Getter((oe, options) => this.run(oe, options).pipe(flatMapEager((ot) => other.run(ot, options))));
	}
};
const passthrough_$1 = /* @__PURE__ */ new Getter(succeed$2);
function isPassthrough(getter) {
	return getter.run === passthrough_$1.run;
}
function passthrough$1() {
	return passthrough_$1;
}
/**
* Creates a getter that applies a pure function to present values.
*
* This is the most commonly used constructor. It transforms `Some(e)` to
* `Some(f(e))` and leaves `None` unchanged.
*
* Use this when:
* - You have a pure, infallible transformation between types.
* - Building encode/decode pairs for `Schema.decodeTo`.
*
* Behavior:
* - Pure, does not mutate input.
* - Skips `None` inputs — only called when a value is present.
* - Never fails.
*
* **Example** (String to number transformation pair)
*
* ```ts
* import { Schema, SchemaGetter } from "effect"
*
* const NumberFromString = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, {
*     decode: SchemaGetter.transform((s) => Number(s)),
*     encode: SchemaGetter.transform((n) => String(n))
*   })
* )
* ```
*
* See also:
* - {@link transformOrFail} — when the transformation can fail
* - {@link transformOptional} — when you need to handle `None` inputs
* - {@link passthrough} — when no transformation is needed
*
* @category Constructors
* @since 4.0.0
*/
function transform$1(f) {
	return transformOptional(map$5(f));
}
/**
* Creates a getter that transforms the full `Option` — both present and absent values.
*
* Use this when:
* - You need to handle both `Some` and `None` cases.
* - You want to turn a present value into absent, or vice versa.
*
* Behavior:
* - Pure, never fails.
* - Receives the full `Option<E>` and must return `Option<T>`.
*
* **Example** (Filter out empty strings)
*
* ```ts
* import { SchemaGetter, Option } from "effect"
*
* const skipEmpty = SchemaGetter.transformOptional<string, string>((o) =>
*   Option.filter(o, (s) => s.length > 0)
* )
* ```
*
* See also:
* - {@link transform} — simpler, only handles present values
* - {@link omit} — always returns `None`
*
* @category Constructors
* @since 4.0.0
*/
function transformOptional(f) {
	return new Getter((oe) => succeed$2(f(oe)));
}
/**
* Creates a getter that replaces `undefined` values with a default.
*
* Use this when:
* - A field may be `undefined` in the encoded input and should have a fallback.
*
* Behavior:
* - If the input is `Some(undefined)` or `None`, produces `Some(T)`.
* - If the input is `Some(value)` where value is not `undefined`, passes it through.
* - `defaultValue` is an `Effect` that will be executed each time a default is needed.
*
* **Example** (Default value for optional field)
*
* ```ts
* import { Effect, SchemaGetter } from "effect"
*
* const withZero = SchemaGetter.withDefault(Effect.succeed(0))
* // Getter<number, number | undefined>
* ```
*
* See also:
* - {@link onNone} — handle only absent keys (not `undefined` values)
* - {@link required} — fail instead of providing a default
*
* @category Constructors
* @since 4.0.0
*/
function withDefault(defaultValue) {
	return new Getter((o) => {
		const filtered = filter$1(o, isNotUndefined);
		return isSome(filtered) ? succeed$2(filtered) : map$1(defaultValue, some);
	});
}
/**
* Coerces any value to a `string` using the global `String()` constructor.
*
* Use this when:
* - You need a string representation of an arbitrary encoded value.
*
* Behavior:
* - Pure, never fails.
* - Delegates to `globalThis.String`.
*
* **Example** (Coerce to string)
*
* ```ts
* import { SchemaGetter } from "effect"
*
* const toString = SchemaGetter.String<number>()
* // Getter<string, number>
* ```
*
* See also:
* - {@link transform} — for custom string conversions
*
* @category Coercions
* @since 4.0.0
*/
function String$3() {
	return transform$1(globalThis.String);
}
/**
* Coerces any value to a `number` using the global `Number()` constructor.
*
* Use this when:
* - You need numeric coercion of an encoded value.
*
* Behavior:
* - Pure, never fails (may produce `NaN` for non-numeric inputs).
* - Delegates to `globalThis.Number`.
*
* **Example** (Coerce to number)
*
* ```ts
* import { SchemaGetter } from "effect"
*
* const toNumber = SchemaGetter.Number<string>()
* // Getter<number, string>
* ```
*
* See also:
* - {@link transformOrFail} — for validated number parsing
*
* @category Coercions
* @since 4.0.0
*/
function Number$3() {
	return transform$1(globalThis.Number);
}
/**
* Splits a string into an array of strings by a separator.
*
* Use this when:
* - An encoded string is a delimited list (e.g. CSV values).
*
* Behavior:
* - Splits by `separator` (default `,`).
* - An empty string produces an empty array (not `[""]`).
* - Pure, never fails.
*
* **Example** (Split comma-separated string)
*
* ```ts
* import { SchemaGetter } from "effect"
*
* const splitComma = SchemaGetter.split<string>()
* // "a,b,c" -> ["a", "b", "c"]
* // "" -> []
* ```
*
* See also:
* - {@link splitKeyValue} — when values are key-value pairs
*
* @category string
* @since 4.0.0
*/
function split(options) {
	const separator = options?.separator ?? ",";
	return transform$1((input) => input === "" ? [] : input.split(separator));
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaTransformation.js
const TypeId$20 = "~effect/SchemaTransformation/Transformation";
/**
* A bidirectional transformation between a decoded type `T` and an encoded
* type `E`, built from a pair of `Getter`s.
*
* This is the primary building block for `Schema.decodeTo`, `Schema.encodeTo`,
* `Schema.decode`, `Schema.encode`, and `Schema.link`. Each direction is a
* `SchemaGetter.Getter` that handles optionality, failure, and Effect services.
*
* When to use this:
* - You need to define how a schema converts between two representations.
* - You want to compose multiple transformations into a pipeline.
* - You want to flip a transformation to swap decode/encode.
*
* Behavior:
* - Immutable — `flip()` and `compose()` return new instances.
* - `flip()` swaps the decode and encode getters.
* - `compose(other)` chains: `this.decode` then `other.decode` for decoding,
*   `other.encode` then `this.encode` for encoding.
*
* **Example** (Composing two transformations)
*
* ```ts
* import { SchemaTransformation } from "effect"
*
* const trimAndLower = SchemaTransformation.trim().compose(
*   SchemaTransformation.toLowerCase()
* )
* // decode: trim then lowercase
* // encode: passthrough (both directions)
* ```
*
* See also:
* - {@link make} — construct from `{ decode, encode }` getters
* - {@link transform} — construct from pure functions
* - {@link transformOrFail} — construct from effectful functions
* - {@link Middleware} — effect-pipeline-level alternative
*
* @category model
* @since 4.0.0
*/
var Transformation = class Transformation {
	[TypeId$20] = TypeId$20;
	_tag = "Transformation";
	decode;
	encode;
	constructor(decode, encode) {
		this.decode = decode;
		this.encode = encode;
	}
	flip() {
		return new Transformation(this.encode, this.decode);
	}
	compose(other) {
		return new Transformation(this.decode.compose(other.decode), other.encode.compose(this.encode));
	}
};
/**
* Returns `true` if `u` is a `Transformation` instance.
*
* When to use this:
* - Checking whether a value is already a Transformation before wrapping it.
*
* Behavior:
* - Pure predicate, no side effects.
* - Acts as a TypeScript type guard.
*
* **Example** (Checking a value)
*
* ```ts
* import { SchemaTransformation } from "effect"
*
* SchemaTransformation.isTransformation(SchemaTransformation.trim())
* // true
*
* SchemaTransformation.isTransformation({ decode: null, encode: null })
* // false
* ```
*
* See also:
* - {@link Transformation}
* - {@link make}
*
* @since 4.0.0
*/
function isTransformation(u) {
	return hasProperty(u, TypeId$20);
}
/**
* Constructs a `Transformation` from an object with `decode` and `encode`
* `Getter`s. If the input is already a `Transformation`, returns it as-is.
*
* When to use this:
* - You already have `Getter` instances and want to pair them.
* - You want idempotent wrapping (won't double-wrap).
*
* Behavior:
* - Does not mutate the input.
* - Returns the input unchanged if it is already a `Transformation`.
*
* **Example** (Wrapping existing getters)
*
* ```ts
* import { SchemaGetter, SchemaTransformation } from "effect"
*
* const t = SchemaTransformation.make({
*   decode: SchemaGetter.transform<number, string>((s) => Number(s)),
*   encode: SchemaGetter.transform<string, number>((n) => String(n))
* })
* ```
*
* See also:
* - {@link transform} — simpler constructor from pure functions
* - {@link transformOrFail} — constructor from effectful functions
* - {@link Transformation}
*
* @since 4.0.0
*/
const make$11 = (options) => {
	if (isTransformation(options)) return options;
	return new Transformation(options.decode, options.encode);
};
/**
* Creates a `Transformation` from pure (sync, infallible) decode and encode
* functions.
*
* When to use this:
* - The conversion cannot fail.
* - No Effect services are needed.
*
* Behavior:
* - Each function receives the input and returns the output directly.
* - Skips `None` inputs (missing keys) — functions are only called on present values.
* - Does not allocate Effects internally; uses optimized sync path.
*
* **Example** (Converting between cents and dollars)
*
* ```ts
* import { Schema, SchemaTransformation } from "effect"
*
* const CentsFromDollars = Schema.Number.pipe(
*   Schema.decodeTo(
*     Schema.Number,
*     SchemaTransformation.transform({
*       decode: (dollars) => dollars * 100,
*       encode: (cents) => cents / 100
*     })
*   )
* )
* ```
*
* See also:
* - {@link transformOrFail} — for fallible or effectful transformations
* - {@link transformOptional} — for transformations that handle missing keys
* - {@link passthrough} — when no conversion is needed
*
* @since 4.0.0
*/
function transform(options) {
	return new Transformation(transform$1(options.decode), transform$1(options.encode));
}
const passthrough_ = /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough$1(), /* @__PURE__ */ passthrough$1());
function passthrough() {
	return passthrough_;
}
/**
* Decodes a `string` into a `number` and encodes a `number` back to a
* `string`.
*
* When to use this:
* - Parsing numeric strings from APIs, form data, or URL parameters.
*
* Behavior:
* - Decode: coerces the string to a number (like `Number(s)`).
* - Encode: coerces the number to a string (like `String(n)`).
* - Does not validate that the result is finite — combine with
*   `Schema.Finite` or `Schema.Int` for stricter checks.
*
* **Example** (Number from string)
*
* ```ts
* import { Schema, SchemaTransformation } from "effect"
*
* const schema = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, SchemaTransformation.numberFromString)
* )
* ```
*
* See also:
* - {@link bigintFromString}
* - {@link transform}
*
* @category Coercions
* @since 4.0.0
*/
const numberFromString = /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number$3(), /* @__PURE__ */ String$3());
/** @internal */
const errorFromErrorJsonEncoded = (options) => transform({
	decode: (i) => {
		const err = new Error(i.message);
		if (typeof i.name === "string" && i.name !== "Error") err.name = i.name;
		if (typeof i.stack === "string") err.stack = i.stack;
		return err;
	},
	encode: (a) => {
		const e = {
			name: a.name,
			message: a.message
		};
		if (options?.includeStack && typeof a.stack === "string") e.stack = a.stack;
		return e;
	}
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaAST.js
/**
* Abstract Syntax Tree (AST) representation for Effect schemas.
*
* This module defines the runtime data structures that represent schemas.
* Most users work with the `Schema` module directly; use `SchemaAST` when you
* need to inspect, traverse, or programmatically transform schema definitions.
*
* ## Mental model
*
* - **{@link AST}** — discriminated union (`_tag`) of all schema node types
*   (e.g. `String`, `Objects`, `Union`, `Suspend`)
* - **{@link Base}** — abstract base class shared by every node; carries
*   annotations, checks, encoding chain, and context
* - **{@link Encoding}** — a non-empty chain of {@link Link} values describing
*   how to transform between the decoded (type) and encoded (wire) form
* - **{@link Check}** — a validation filter ({@link Filter} or
*   {@link FilterGroup}) attached to an AST node
* - **{@link Context}** — per-property metadata: optionality, mutability,
*   default values, key annotations
* - **Guards** — type-narrowing predicates for each AST variant (e.g.
*   {@link isString}, {@link isObjects})
*
* ## Common tasks
*
* - Inspect what kind of schema you have → guard functions ({@link isString},
*   {@link isObjects}, {@link isUnion}, etc.)
* - Get the decoded (type-level) AST → {@link toType}
* - Get the encoded (wire-format) AST → {@link toEncoded}
* - Swap decode/encode directions → {@link flip}
* - Read annotations → {@link resolve}, {@link resolveAt},
*   {@link resolveIdentifier}
* - Build a transformation between schemas → {@link decodeTo}
* - Add regex validation → {@link isPattern}
*
* ## Gotchas
*
* - AST nodes are structurally immutable; modification helpers return new
*   objects via `Object.create`.
* - {@link Arrays} represents both tuples and arrays; {@link Objects}
*   represents both structs and records.
* - {@link toType} and {@link toEncoded} are memoized — same input yields
*   same output reference.
* - {@link Suspend} lazily resolves its inner AST via a thunk; the thunk is
*   memoized on first call.
*
* ## Quickstart
*
* **Example** (Inspecting a schema's AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.Struct({ name: Schema.String, age: Schema.Number })
* const ast = schema.ast
*
* if (SchemaAST.isObjects(ast)) {
*   console.log(ast.propertySignatures.map(ps => ps.name))
*   // ["name", "age"]
* }
*
* const encoded = SchemaAST.toEncoded(ast)
* console.log(SchemaAST.isObjects(encoded)) // true
* ```
*
* ## See also
*
* - {@link AST}
* - {@link toType}
* - {@link toEncoded}
* - {@link flip}
* - {@link resolve}
*
* @since 4.0.0
*/
function makeGuard(tag) {
	return (ast) => ast._tag === tag;
}
/**
* Returns `true` if the value is an {@link AST} node (any variant).
*
* Uses the internal `TypeId` brand to distinguish AST nodes from arbitrary
* objects.
*
* @see {@link AST}
*
* @category Guard
* @since 4.0.0
*/
function isAST(u) {
	return hasProperty(u, TypeId$19) && u[TypeId$19] === TypeId$19;
}
/**
* Narrows an {@link AST} to {@link Declaration}.
*
* @category Guard
* @since 4.0.0
*/
const isDeclaration = /* @__PURE__ */ makeGuard("Declaration");
/**
* Narrows an {@link AST} to {@link Void}.
*
* @category Guard
* @since 4.0.0
*/
const isVoid = /* @__PURE__ */ makeGuard("Void");
/**
* Narrows an {@link AST} to {@link Never}.
*
* @category Guard
* @since 4.0.0
*/
const isNever = /* @__PURE__ */ makeGuard("Never");
/**
* Narrows an {@link AST} to {@link Literal}.
*
* @category Guard
* @since 4.0.0
*/
const isLiteral = /* @__PURE__ */ makeGuard("Literal");
/**
* Narrows an {@link AST} to {@link UniqueSymbol}.
*
* @category Guard
* @since 4.0.0
*/
const isUniqueSymbol = /* @__PURE__ */ makeGuard("UniqueSymbol");
/**
* Narrows an {@link AST} to {@link Arrays}.
*
* @category Guard
* @since 4.0.0
*/
const isArrays = /* @__PURE__ */ makeGuard("Arrays");
/**
* Narrows an {@link AST} to {@link Objects}.
*
* @category Guard
* @since 4.0.0
*/
const isObjects = /* @__PURE__ */ makeGuard("Objects");
/**
* Narrows an {@link AST} to {@link Union}.
*
* @category Guard
* @since 4.0.0
*/
const isUnion = /* @__PURE__ */ makeGuard("Union");
/**
* A single step in an {@link Encoding} chain, pairing a target {@link AST}
* with a `Transformation` or `Middleware` that converts values between the
* current node and the target.
*
* - `to` — the AST node on the other side of this transformation step.
* - `transformation` — the bidirectional conversion logic (decode/encode).
*
* Links are composed into a non-empty array ({@link Encoding}) attached to
* AST nodes that have a different encoded representation.
*
* @see {@link Encoding}
* @see {@link decodeTo}
*
* @category model
* @since 4.0.0
*/
var Link = class {
	to;
	transformation;
	constructor(to, transformation) {
		this.to = to;
		this.transformation = transformation;
	}
};
/** @internal */
const defaultParseOptions = {};
/**
* Per-property metadata attached to AST nodes via {@link Base.context}.
*
* Tracks whether a property key is optional, mutable, has a constructor
* default, or carries key-level annotations. Typically set by helpers like
* {@link optionalKey} and `Schema.mutableKey`.
*
* - `isOptional` — the property key may be absent from the input.
* - `isMutable` — the property is `readonly` when `false`.
* - `defaultValue` — an {@link Encoding} applied during construction to
*   supply missing values.
* - `annotations` — key-level annotations (e.g. description of the key
*   itself).
*
* @see {@link optionalKey}
* @see {@link isOptional}
*
* @category model
* @since 4.0.0
*/
var Context = class {
	isOptional;
	isMutable;
	/** Used for constructor default values (e.g. `withConstructorDefault` API) */
	defaultValue;
	annotations;
	constructor(isOptional, isMutable, defaultValue = void 0, annotations = void 0) {
		this.isOptional = isOptional;
		this.isMutable = isMutable;
		this.defaultValue = defaultValue;
		this.annotations = annotations;
	}
};
const TypeId$19 = "~effect/Schema";
/**
* Abstract base class for all {@link AST} node variants.
*
* Every AST node extends `Base` and inherits these fields:
*
* - `annotations` — user-supplied metadata (identifier, title, description,
*   arbitrary keys).
* - `checks` — optional {@link Checks} for post-type-match validation.
* - `encoding` — optional {@link Encoding} chain for type ↔ wire
*   transformations.
* - `context` — optional {@link Context} for per-property metadata.
*
* Subclasses add a `_tag` discriminant and variant-specific data.
*
* @see {@link AST}
*
* @category model
* @since 4.0.0
*/
var Base = class {
	[TypeId$19] = TypeId$19;
	annotations;
	checks;
	encoding;
	context;
	constructor(annotations = void 0, checks = void 0, encoding = void 0, context = void 0) {
		this.annotations = annotations;
		this.checks = checks;
		this.encoding = encoding;
		this.context = context;
	}
	toString() {
		return `<${this._tag}>`;
	}
};
/**
* AST node for user-defined opaque types with custom parsing logic.
*
* Use when none of the built-in AST nodes fit. The `run` function receives
* `typeParameters` and returns a parser that validates/transforms raw input.
*
* - `typeParameters` — inner schemas this declaration is parameterized over
*   (e.g. the element type for a custom collection).
* - `run` — factory producing the actual parse function.
*
* @see {@link isDeclaration}
*
* @category model
* @since 4.0.0
*/
var Declaration = class Declaration extends Base {
	_tag = "Declaration";
	typeParameters;
	run;
	constructor(typeParameters, run, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		this.typeParameters = typeParameters;
		this.run = run;
	}
	/** @internal */
	getParser() {
		const run = this.run(this.typeParameters);
		return (oinput, options) => {
			if (isNone(oinput)) return succeedNone;
			return mapEager(run(oinput.value, this, options), some);
		};
	}
	/** @internal */
	recur(recur) {
		const tps = mapOrSame(this.typeParameters, recur);
		return tps === this.typeParameters ? this : new Declaration(tps, this.run, this.annotations, this.checks, void 0, this.context);
	}
	/** @internal */
	getExpected() {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		return "<Declaration>";
	}
};
/**
* AST node matching the `null` literal value.
*
* Parsing succeeds only when the input is exactly `null`.
*
* @see {@link null}
* @see {@link isNull}
*
* @category model
* @since 4.0.0
*/
var Null$1 = class extends Base {
	_tag = "Null";
	/** @internal */
	getParser() {
		return fromConst(this, null);
	}
	/** @internal */
	getExpected() {
		return "null";
	}
};
const null_ = /* @__PURE__ */ new Null$1();
/**
* AST node matching the `undefined` value.
*
* Parsing succeeds only when the input is exactly `undefined`.
*
* @see {@link undefined}
* @see {@link isUndefined}
*
* @category model
* @since 4.0.0
*/
var Undefined$1 = class extends Base {
	_tag = "Undefined";
	/** @internal */
	getParser() {
		return fromConst(this, void 0);
	}
	/** @internal */
	toCodecJson() {
		return replaceEncoding(this, [undefinedToNull]);
	}
	/** @internal */
	getExpected() {
		return "undefined";
	}
};
const undefinedToNull = /* @__PURE__ */ new Link(null_, /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform$1(() => void 0), /* @__PURE__ */ transform$1(() => null)));
const undefined_ = /* @__PURE__ */ new Undefined$1();
/**
* AST node matching the `void` type (accepts `undefined` at runtime).
*
* Behaves like {@link Undefined} for parsing but represents the TypeScript
* `void` type semantically.
*
* @see {@link void}
* @see {@link isVoid}
*
* @category model
* @since 4.0.0
*/
var Void$1 = class extends Base {
	_tag = "Void";
	/** @internal */
	getParser() {
		return fromConst(this, void 0);
	}
	/** @internal */
	toCodecJson() {
		return replaceEncoding(this, [undefinedToNull]);
	}
	/** @internal */
	getExpected() {
		return "void";
	}
};
const void_ = /* @__PURE__ */ new Void$1();
/**
* AST node representing the `any` type — every value matches.
*
* @see {@link any}
* @see {@link isAny}
*
* @category model
* @since 4.0.0
*/
var Any$1 = class extends Base {
	_tag = "Any";
	/** @internal */
	getParser() {
		return fromRefinement(this, isUnknown);
	}
	/** @internal */
	getExpected() {
		return "any";
	}
};
/**
* Singleton {@link Any} AST instance.
*
* @since 4.0.0
*/
const any = /* @__PURE__ */ new Any$1();
/**
* AST node representing the `unknown` type — every value matches.
*
* Unlike {@link Any}, this is type-safe: the parsed result is typed as
* `unknown` rather than `any`.
*
* @see {@link unknown}
* @see {@link isUnknown}
*
* @category model
* @since 4.0.0
*/
var Unknown$1 = class extends Base {
	_tag = "Unknown";
	/** @internal */
	getParser() {
		return fromRefinement(this, isUnknown);
	}
	/** @internal */
	getExpected() {
		return "unknown";
	}
};
/**
* Singleton {@link Unknown} AST instance.
*
* @since 4.0.0
*/
const unknown = /* @__PURE__ */ new Unknown$1();
/**
* AST node matching an exact primitive value (string, number, boolean, or
* bigint).
*
* Parsing succeeds only when the input is strictly equal (`===`) to the
* stored `literal`. Numeric literals must be finite — `Infinity`, `-Infinity`,
* and `NaN` are rejected at construction time.
*
* **Example** (Creating a literal AST)
*
* ```ts
* import { SchemaAST } from "effect"
*
* const ast = new SchemaAST.Literal("active")
* console.log(ast.literal) // "active"
* ```
*
* @see {@link LiteralValue}
* @see {@link isLiteral}
*
* @category model
* @since 4.0.0
*/
var Literal$1 = class extends Base {
	_tag = "Literal";
	literal;
	constructor(literal, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) throw new Error(`A numeric literal must be finite, got ${format$1(literal)}`);
		this.literal = literal;
	}
	/** @internal */
	getParser() {
		return fromConst(this, this.literal);
	}
	/** @internal */
	toCodecJson() {
		return typeof this.literal === "bigint" ? literalToString(this) : this;
	}
	/** @internal */
	toCodecStringTree() {
		return typeof this.literal === "string" ? this : literalToString(this);
	}
	/** @internal */
	getExpected() {
		return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
	}
};
function literalToString(ast) {
	const literalAsString = globalThis.String(ast.literal);
	return replaceEncoding(ast, [new Link(new Literal$1(literalAsString), new Transformation(transform$1(() => ast.literal), transform$1(() => literalAsString)))]);
}
/**
* AST node matching any `string` value.
*
* @see {@link string}
* @see {@link isString}
*
* @category model
* @since 4.0.0
*/
var String$2 = class extends Base {
	_tag = "String";
	/** @internal */
	getParser() {
		return fromRefinement(this, isString);
	}
	/** @internal */
	getExpected() {
		return "string";
	}
};
/**
* Singleton {@link String} AST instance.
*
* @since 4.0.0
*/
const string = /* @__PURE__ */ new String$2();
/**
* AST node matching any `number` value (including `NaN`, `Infinity`,
* `-Infinity`).
*
* Default JSON serialization:
* - Finite numbers are serialized as JSON numbers.
* - `Infinity`, `-Infinity`, and `NaN` are serialized as JSON strings.
*
* If the node has an `isFinite` or `isInt` check, the string fallback is
* skipped since non-finite values cannot occur.
*
* @see {@link number}
* @see {@link isNumber}
*
* @category model
* @since 4.0.0
*/
var Number$2 = class extends Base {
	_tag = "Number";
	/** @internal */
	getParser() {
		return fromRefinement(this, isNumber);
	}
	/** @internal */
	toCodecJson() {
		if (this.checks && (hasCheck$1(this.checks, "isFinite") || hasCheck$1(this.checks, "isInt"))) return this;
		return replaceEncoding(this, [numberToJson]);
	}
	/** @internal */
	toCodecStringTree() {
		if (this.checks && (hasCheck$1(this.checks, "isFinite") || hasCheck$1(this.checks, "isInt"))) return replaceEncoding(this, [finiteToString]);
		return replaceEncoding(this, [numberToString]);
	}
	/** @internal */
	getExpected() {
		return "number";
	}
};
function hasCheck$1(checks, tag) {
	return checks.some((c) => {
		switch (c._tag) {
			case "Filter": return c.annotations?.meta?._tag === tag;
			case "FilterGroup": return hasCheck$1(c.checks, tag);
		}
	});
}
/**
* Singleton {@link Number} AST instance.
*
* @since 4.0.0
*/
const number = /* @__PURE__ */ new Number$2();
/**
* AST node for array-like types — both tuples and arrays.
*
* - `elements` — positional element types (tuple elements). An element is
*   optional if its {@link Context.isOptional} is `true`.
* - `rest` — the rest/variadic element types. When non-empty, the first
*   entry is the "spread" type (e.g. `...Array<string>`), and subsequent
*   entries are trailing positional elements after the spread.
* - `isMutable` — whether the resulting array is `readonly` (`false`) or
*   mutable (`true`).
*
* Construction enforces TypeScript ordering rules: a required element
* cannot follow an optional one, and an optional element cannot follow a
* rest element.
*
* **Example** (Inspecting a tuple AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.Tuple([Schema.String, Schema.Number])
* const ast = schema.ast
*
* if (SchemaAST.isArrays(ast)) {
*   console.log(ast.elements.length) // 2
*   console.log(ast.rest.length)     // 0
* }
* ```
*
* @see {@link isArrays}
* @see {@link Objects}
*
* @category model
* @since 4.0.0
*/
var Arrays = class Arrays extends Base {
	_tag = "Arrays";
	isMutable;
	elements;
	rest;
	constructor(isMutable, elements, rest, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		this.isMutable = isMutable;
		this.elements = elements;
		this.rest = rest;
		const i = elements.findIndex(isOptional);
		if (i !== -1 && (elements.slice(i + 1).some((e) => !isOptional(e)) || rest.length > 1)) throw new Error("A required element cannot follow an optional element. ts(1257)");
		if (rest.length > 1 && rest.slice(1).some(isOptional)) throw new Error("An optional element cannot follow a rest element. ts(1266)");
	}
	/** @internal */
	getParser(recur) {
		const ast = this;
		const elements = ast.elements.map((ast) => ({
			ast,
			parser: recur(ast)
		}));
		const rest = ast.rest.map((ast) => ({
			ast,
			parser: recur(ast)
		}));
		const elementLen = elements.length;
		const [head, ...tail] = rest;
		const tailLen = tail.length;
		function getParser(tailThreshold, index) {
			if (index < elementLen) return elements[index];
			else if (index >= tailThreshold) return tail[index - tailThreshold];
			return head;
		}
		return fnUntracedEager(function* (oinput, options) {
			if (oinput._tag === "None") return oinput;
			const input = oinput.value;
			if (!Array.isArray(input)) return yield* fail$2(new InvalidType(ast, oinput));
			const len = input.length;
			const state = {
				ast,
				getParser,
				oinput,
				len,
				tailThreshold: resolveTailThreshold(len, elementLen, tailLen),
				output: new globalThis.Array(len),
				issues: void 0,
				options
			};
			const eff = parseArray(state, input, {
				concurrency: resolveConcurrency(options?.concurrency)?.concurrency,
				end: ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen)
			});
			if (eff) yield* eff;
			if (ast.rest.length === 0 && len > elementLen) for (let i = elementLen; i <= len - 1; i++) {
				const issue = new Pointer([i], new UnexpectedKey(ast, input[i]));
				if (options.errors === "all") if (state.issues) state.issues.push(issue);
				else state.issues = [issue];
				else return yield* fail$2(new Composite(ast, oinput, [issue]));
			}
			if (state.issues) return yield* fail$2(new Composite(ast, oinput, state.issues));
			return some(state.output);
		});
	}
	/** @internal */
	recur(recur) {
		const elements = mapOrSame(this.elements, recur);
		const rest = mapOrSame(this.rest, recur);
		return elements === this.elements && rest === this.rest ? this : new Arrays(this.isMutable, elements, rest, this.annotations, this.checks, void 0, this.context);
	}
	/** @internal */
	getExpected() {
		return "array";
	}
};
const parseArray = /* @__PURE__ */ iterateEager()({
	onItem(s, item, i) {
		const value = i < s.len ? some(item) : none();
		return s.getParser(s.tailThreshold, i).parser(value, s.options);
	},
	step(s, _, exit, i) {
		if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, i, exit);
		else if (exit.value._tag === "Some") s.output[i] = exit.value.value;
		else {
			const p = s.getParser(s.tailThreshold, i);
			if (isOptional(p.ast)) return;
			const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
			if (s.options.errors === "all") if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
			else return fail$3(new Composite(s.ast, s.oinput, [issue]));
		}
	}
});
function resolveTailThreshold(inputLen, elementLen, tailLen) {
	return Math.max(elementLen, inputLen - tailLen);
}
const resolveConcurrency = (value) => {
	value = value === "unbounded" ? Infinity : value ?? 1;
	return value > 1 ? { concurrency: value } : void 0;
};
const wrapPropertyKeyIssue = (s, ast, key, exit) => {
	const issueResult = findError(exit.cause);
	if (isFailure(issueResult)) return exit;
	const issue = new Pointer([key], issueResult.success);
	if (s.options.errors === "all") if (s.issues) s.issues.push(issue);
	else s.issues = [issue];
	else return fail$3(new Composite(ast, s.oinput, [issue]));
};
/**
* floating point or integer, with optional exponent
* @internal
*/
const FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
const isNumberStringRegExp = /* @__PURE__ */ new globalThis.RegExp(`(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)`);
/**
* Returns the object keys that match the index signature parameter schema.
* @internal
*/
function getIndexSignatureKeys(input, parameter) {
	const encoded = toEncoded(parameter);
	switch (encoded._tag) {
		case "String": return Object.keys(input);
		case "TemplateLiteral": {
			const regExp = getTemplateLiteralRegExp(encoded);
			return Object.keys(input).filter((k) => regExp.test(k));
		}
		case "Symbol": return Object.getOwnPropertySymbols(input);
		case "Number": return Object.keys(input).filter((k) => isNumberStringRegExp.test(k));
		case "Union": return [...new Set(encoded.types.flatMap((t) => getIndexSignatureKeys(input, t)))];
		default: return [];
	}
}
/**
* A named property within an {@link Objects} node.
*
* Pairs a `name` (any `PropertyKey`) with a `type` ({@link AST}). The
* property's optionality and mutability are determined by the `type`'s
* {@link Context}.
*
* @see {@link Objects}
*
* @category model
* @since 4.0.0
*/
var PropertySignature = class {
	name;
	type;
	constructor(name, type) {
		this.name = name;
		this.type = type;
	}
};
/**
* An index signature entry within an {@link Objects} node.
*
* - `parameter` — the key type AST (e.g. {@link String} for `string` keys,
*   {@link TemplateLiteral} for patterned keys).
* - `type` — the value type AST.
* - `merge` — optional {@link KeyValueCombiner} for handling duplicate keys.
*
* Using `Schema.optionalKey` on the value type is not allowed for index
* signatures (throws at construction); use `Schema.optional` instead.
*
* @see {@link Objects}
* @see {@link PropertySignature}
*
* @category model
* @since 4.0.0
*/
var IndexSignature = class {
	parameter;
	type;
	merge;
	constructor(parameter, type, merge) {
		this.parameter = parameter;
		this.type = type;
		this.merge = merge;
		if (isOptional(type) && !containsUndefined(type)) throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
	}
};
/**
* AST node for object-like types — both structs and records.
*
* - `propertySignatures` — named properties with their types (struct fields).
* - `indexSignatures` — index signature entries (record patterns), each with
*   a `parameter` AST (the key type) and a `type` AST (the value type).
*
* An `Objects` with no properties and no index signatures acts as a bare
* `object | array` type check (accepts any non-nullish value).
*
* Duplicate property names throw at construction time.
*
* **Example** (Inspecting a struct AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.Struct({ name: Schema.String })
* const ast = schema.ast
*
* if (SchemaAST.isObjects(ast)) {
*   for (const ps of ast.propertySignatures) {
*     console.log(ps.name, ps.type._tag)
*   }
*   // "name" "String"
* }
* ```
*
* @see {@link isObjects}
* @see {@link PropertySignature}
* @see {@link IndexSignature}
* @see {@link Arrays}
*
* @category model
* @since 4.0.0
*/
var Objects = class Objects extends Base {
	_tag = "Objects";
	propertySignatures;
	indexSignatures;
	constructor(propertySignatures, indexSignatures, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		this.propertySignatures = propertySignatures;
		this.indexSignatures = indexSignatures;
		const duplicates = propertySignatures.map((ps) => ps.name).filter((name, i, arr) => arr.indexOf(name) !== i);
		if (duplicates.length > 0) throw new Error(`Duplicate identifiers: ${JSON.stringify(duplicates)}. ts(2300)`);
	}
	/** @internal */
	getParser(recur) {
		const ast = this;
		const expectedKeys = [];
		const expectedKeysSet = /* @__PURE__ */ new Set();
		const properties = [];
		for (const ps of ast.propertySignatures) {
			expectedKeys.push(ps.name);
			expectedKeysSet.add(ps.name);
			properties.push({
				ps,
				parser: recur(ps.type),
				name: ps.name,
				type: ps.type
			});
		}
		const indexCount = ast.indexSignatures.length;
		if (ast.propertySignatures.length === 0 && ast.indexSignatures.length === 0) return fromRefinement(ast, isNotNullish);
		const parseIndexes = indexCount > 0 ? iterateEager()({
			onItem: fnUntracedEager(function* (s, [key, is]) {
				const effKey = recur(indexSignatureParameterFromString(is.parameter))(some(key), s.options);
				const exitKey = effectIsExit(effKey) ? effKey : yield* exit(effKey);
				if (exitKey._tag === "Failure") {
					const eff = wrapPropertyKeyIssue(s, ast, key, exitKey);
					if (eff) yield* eff;
					return;
				}
				const value = some(s.input[key]);
				const effValue = recur(is.type)(value, s.options);
				const exitValue = effectIsExit(effValue) ? effValue : yield* exit(effValue);
				if (exitValue._tag === "Failure") {
					const eff = wrapPropertyKeyIssue(s, ast, key, exitValue);
					if (eff) yield* eff;
					return;
				} else if (exitKey.value._tag === "Some" && exitValue.value._tag === "Some") {
					const k2 = exitKey.value.value;
					const v2 = exitValue.value.value;
					if (is.merge && is.merge.decode && Object.hasOwn(s.out, k2)) {
						const [k, v] = is.merge.decode.combine([k2, s.out[k2]], [k2, v2]);
						set(s.out, k, v);
					} else set(s.out, k2, v2);
				}
			}),
			step: (_s, _, exit) => exit._tag === "Failure" ? exit : void 0
		}) : void 0;
		return fnUntracedEager(function* (oinput, options) {
			if (oinput._tag === "None") return oinput;
			const input = oinput.value;
			if (!(typeof input === "object" && input !== null && !Array.isArray(input))) return yield* fail$2(new InvalidType(ast, oinput));
			const out = {};
			const state = {
				ast,
				oinput,
				input,
				out,
				issues: void 0,
				options
			};
			const errorsAllOption = options.errors === "all";
			const onExcessPropertyError = options.onExcessProperty === "error";
			const onExcessPropertyPreserve = options.onExcessProperty === "preserve";
			let inputKeys;
			if (ast.indexSignatures.length === 0 && (onExcessPropertyError || onExcessPropertyPreserve)) {
				inputKeys = Reflect.ownKeys(input);
				for (let i = 0; i < inputKeys.length; i++) {
					const key = inputKeys[i];
					if (!expectedKeysSet.has(key)) if (onExcessPropertyError) {
						const issue = new Pointer([key], new UnexpectedKey(ast, input[key]));
						if (errorsAllOption) {
							if (state.issues) state.issues.push(issue);
							else state.issues = [issue];
							continue;
						} else return yield* fail$2(new Composite(ast, oinput, [issue]));
					} else set(out, key, input[key]);
				}
			}
			const concurrency = resolveConcurrency(options?.concurrency);
			const eff = parseProperties(state, properties, concurrency);
			if (eff) yield* eff;
			if (parseIndexes) {
				const keyPairs = empty$6();
				for (let i = 0; i < indexCount; i++) {
					const is = ast.indexSignatures[i];
					const keys = getIndexSignatureKeys(input, is.parameter);
					for (let j = 0; j < keys.length; j++) {
						const key = keys[j];
						keyPairs.push([key, is]);
					}
				}
				const eff = parseIndexes(state, keyPairs, concurrency);
				if (eff) yield* eff;
			}
			if (state.issues) return yield* fail$2(new Composite(ast, oinput, state.issues));
			if (options.propertyOrder === "original") {
				const keys = (inputKeys ?? Reflect.ownKeys(input)).concat(expectedKeys);
				const preserved = {};
				for (const key of keys) if (Object.hasOwn(out, key)) set(preserved, key, out[key]);
				return some(preserved);
			}
			return some(out);
		});
	}
	rebuild(recur, flipMerge) {
		const props = mapOrSame(this.propertySignatures, (ps) => {
			const t = recur(ps.type);
			return t === ps.type ? ps : new PropertySignature(ps.name, t);
		});
		const indexes = mapOrSame(this.indexSignatures, (is) => {
			const p = recur(is.parameter);
			const t = recur(is.type);
			const merge = flipMerge ? is.merge?.flip() : is.merge;
			return p === is.parameter && t === is.type && merge === is.merge ? is : new IndexSignature(p, t, merge);
		});
		return props === this.propertySignatures && indexes === this.indexSignatures ? this : new Objects(props, indexes, this.annotations, this.checks, void 0, this.context);
	}
	/** @internal */
	flip(recur) {
		return this.rebuild(recur, true);
	}
	/** @internal */
	recur(recur) {
		return this.rebuild(recur, false);
	}
	/** @internal */
	getExpected() {
		if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0) return "object | array";
		return "object";
	}
};
const parseProperties = /* @__PURE__ */ iterateEager()({
	onItem(s, p) {
		const value = Object.hasOwn(s.input, p.name) ? some(s.input[p.name]) : none();
		return p.parser(value, s.options);
	},
	step(s, p, exit) {
		if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, p.name, exit);
		else if (exit.value._tag === "Some") set(s.out, p.name, exit.value.value);
		else if (!isOptional(p.type)) {
			const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
			if (s.options.errors === "all") {
				if (s.issues) s.issues.push(issue);
				else s.issues = [issue];
				return;
			} else return fail$3(new Composite(s.ast, s.oinput, [issue]));
		}
	}
});
/** @internal */
function struct(fields, checks, annotations) {
	return new Objects(Reflect.ownKeys(fields).map((key) => {
		return new PropertySignature(key, fields[key].ast);
	}), [], annotations, checks);
}
/** @internal */
function getAST(self) {
	return self.ast;
}
/** @internal */
function tuple(elements, checks = void 0) {
	return new Arrays(false, elements.map((e) => e.ast), [], void 0, checks);
}
/** @internal */
function union(members, mode, checks) {
	return new Union$1(members.map(getAST), mode, void 0, checks);
}
function getCandidateTypes(ast) {
	switch (ast._tag) {
		case "Null": return ["null"];
		case "Undefined":
		case "Void": return ["undefined"];
		case "String":
		case "TemplateLiteral": return ["string"];
		case "Number": return ["number"];
		case "Boolean": return ["boolean"];
		case "Symbol":
		case "UniqueSymbol": return ["symbol"];
		case "BigInt": return ["bigint"];
		case "Arrays": return ["array"];
		case "ObjectKeyword": return [
			"object",
			"array",
			"function"
		];
		case "Objects": return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : ["object", "array"];
		case "Enum": return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
		case "Literal": return [typeof ast.literal];
		case "Union": return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
		default: return [
			"null",
			"undefined",
			"string",
			"number",
			"boolean",
			"symbol",
			"bigint",
			"object",
			"array",
			"function"
		];
	}
}
/** @internal */
function collectSentinels(ast) {
	switch (ast._tag) {
		default: return [];
		case "Declaration": {
			const s = ast.annotations?.["~sentinels"];
			return Array.isArray(s) ? s : [];
		}
		case "Objects": return ast.propertySignatures.flatMap((ps) => {
			const type = ps.type;
			if (!isOptional(type)) {
				if (isLiteral(type)) return [{
					key: ps.name,
					literal: type.literal
				}];
				if (isUniqueSymbol(type)) return [{
					key: ps.name,
					literal: type.symbol
				}];
			}
			return [];
		});
		case "Arrays": return ast.elements.flatMap((e, i) => {
			return isLiteral(e) && !isOptional(e) ? [{
				key: i,
				literal: e.literal
			}] : [];
		});
		case "Suspend": return collectSentinels(ast.thunk());
	}
}
const candidateIndexCache = /* @__PURE__ */ new WeakMap();
function getIndex(types) {
	let idx = candidateIndexCache.get(types);
	if (idx) return idx;
	idx = {};
	for (const a of types) {
		const encoded = toEncoded(a);
		if (isNever(encoded)) continue;
		const types = getCandidateTypes(encoded);
		const sentinels = collectSentinels(encoded);
		idx.byType ??= {};
		for (const t of types) (idx.byType[t] ??= []).push(a);
		if (sentinels.length > 0) {
			idx.bySentinel ??= /* @__PURE__ */ new Map();
			for (const { key, literal } of sentinels) {
				let m = idx.bySentinel.get(key);
				if (!m) idx.bySentinel.set(key, m = /* @__PURE__ */ new Map());
				let arr = m.get(literal);
				if (!arr) m.set(literal, arr = []);
				arr.push(a);
			}
		} else {
			idx.otherwise ??= {};
			for (const t of types) (idx.otherwise[t] ??= []).push(a);
		}
	}
	candidateIndexCache.set(types, idx);
	return idx;
}
function filterLiterals(input) {
	return (ast) => {
		const encoded = toEncoded(ast);
		return encoded._tag === "Literal" ? encoded.literal === input : encoded._tag === "UniqueSymbol" ? encoded.symbol === input : true;
	};
}
/**
* The goal is to reduce the number of a union members that will be checked.
* This is useful to reduce the number of issues that will be returned.
*
* @internal
*/
function getCandidates(input, types) {
	const idx = getIndex(types);
	const runtimeType = input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
	if (idx.bySentinel) {
		const base = idx.otherwise?.[runtimeType] ?? [];
		if (runtimeType === "object" || runtimeType === "array") {
			for (const [k, m] of idx.bySentinel) if (Object.hasOwn(input, k)) {
				const match = m.get(input[k]);
				if (match) return [...match, ...base].filter(filterLiterals(input));
			}
		}
		return base;
	}
	return (idx.byType?.[runtimeType] ?? []).filter(filterLiterals(input));
}
/**
* AST node representing a union of schemas.
*
* - `types` — the member AST nodes.
* - `mode` — `"anyOf"` succeeds on the first match (like TypeScript unions);
*   `"oneOf"` requires exactly one member to match (fails if multiple do).
*
* During parsing, members are tried in order. An internal candidate index
* narrows which members to try based on the runtime type of the input and
* discriminant ("sentinel") fields, making large unions efficient.
*
* **Example** (Inspecting a union AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.Union([Schema.String, Schema.Number])
* const ast = schema.ast
*
* if (SchemaAST.isUnion(ast)) {
*   console.log(ast.types.length) // 2
*   console.log(ast.mode)         // "anyOf"
* }
* ```
*
* @see {@link isUnion}
*
* @category model
* @since 4.0.0
*/
var Union$1 = class Union$1 extends Base {
	_tag = "Union";
	types;
	mode;
	constructor(types, mode, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		this.types = types;
		this.mode = mode;
	}
	/** @internal */
	getParser(recur) {
		const ast = this;
		return (oinput, options) => {
			if (oinput._tag === "None") return succeed$2(oinput);
			const input = oinput.value;
			const candidates = getCandidates(input, ast.types);
			const state = {
				ast,
				recur,
				oinput,
				input,
				out: void 0,
				successes: [],
				issues: void 0,
				options
			};
			const eff = parseUnion(state, candidates, resolveConcurrency(options?.concurrency));
			if (!eff) return state.out ? succeed$2(state.out) : fail$2(new AnyOf(ast, input, state.issues ?? []));
			return flatMap(eff, (_) => {
				return state.out ? succeed$2(state.out) : fail$2(new AnyOf(ast, input, state.issues ?? []));
			});
		};
	}
	/** @internal */
	recur(recur) {
		const types = mapOrSame(this.types, recur);
		return types === this.types ? this : new Union$1(types, this.mode, this.annotations, this.checks, void 0, this.context);
	}
	/** @internal */
	getExpected(getExpected) {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		if (this.types.length === 0) return "never";
		const types = this.types.map((type) => {
			const encoded = toEncoded(type);
			switch (encoded._tag) {
				case "Arrays": {
					const literals = encoded.elements.filter(isLiteral);
					if (literals.length > 0) return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
					break;
				}
				case "Objects": {
					const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
					if (literals.length > 0) return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected(ps.type)}`).join(", ")}, ... }`;
					break;
				}
			}
			return getExpected(encoded);
		});
		return Array.from(new Set(types)).join(" | ");
	}
};
const parseUnion = /* @__PURE__ */ iterateEager()({
	onItem(s, ast) {
		return s.recur(ast)(s.oinput, s.options);
	},
	step(s, candidate, exit) {
		if (exit._tag === "Failure") {
			const issueResult = findError(exit.cause);
			if (isFailure(issueResult)) return exit;
			if (s.issues) s.issues.push(issueResult.success);
			else s.issues = [issueResult.success];
		} else {
			if (s.out && s.ast.mode === "oneOf") {
				s.successes.push(candidate);
				return fail$3(new OneOf(s.ast, s.input, s.successes));
			}
			s.out = exit.value;
			s.successes.push(candidate);
			if (s.ast.mode === "anyOf") return void_$2;
		}
	}
});
const nonFiniteLiterals = /* @__PURE__ */ new Union$1([
	/* @__PURE__ */ new Literal$1("Infinity"),
	/* @__PURE__ */ new Literal$1("-Infinity"),
	/* @__PURE__ */ new Literal$1("NaN")
], "anyOf");
const numberToJson = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union$1([number, nonFiniteLiterals], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ Number$3(), /* @__PURE__ */ transform$1((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
function formatIsMutable(isMutable) {
	return isMutable ? "" : "readonly ";
}
function formatIsOptional(isOptional) {
	return isOptional ? "?" : "";
}
/**
* A single validation check attached to an AST node.
*
* - `run` — the validation function. Returns `undefined` on success, or an
*   `Issue` on failure.
* - `annotations` — optional filter-level metadata (expected message, meta
*   tags, arbitrary constraint hints).
* - `aborted` — when `true`, parsing stops immediately after this filter
*   fails (no further checks run).
*
* Use `.annotate()` to add metadata and `.abort()` to mark as aborting.
* Combine with another check via `.and()` to form a {@link FilterGroup}.
*
* @see {@link FilterGroup}
* @see {@link Check}
* @see {@link isPattern}
*
* @category model
* @since 4.0.0
*/
var Filter = class Filter extends Class$2 {
	_tag = "Filter";
	run;
	annotations;
	/**
	* Whether the parsing process should be aborted after this check has failed.
	*/
	aborted;
	constructor(run, annotations = void 0, aborted = false) {
		super();
		this.run = run;
		this.annotations = annotations;
		this.aborted = aborted;
	}
	annotate(annotations) {
		return new Filter(this.run, {
			...this.annotations,
			...annotations
		}, this.aborted);
	}
	abort() {
		return new Filter(this.run, this.annotations, true);
	}
	and(other, annotations) {
		return new FilterGroup([this, other], annotations);
	}
};
/**
* A composite validation check grouping multiple {@link Check} values.
*
* Created by calling `.and()` on a {@link Filter} or another `FilterGroup`.
* All inner checks are run; failures from aborted filters still stop
* evaluation.
*
* @see {@link Filter}
* @see {@link Check}
*
* @category model
* @since 4.0.0
*/
var FilterGroup = class FilterGroup extends Class$2 {
	_tag = "FilterGroup";
	checks;
	annotations;
	constructor(checks, annotations = void 0) {
		super();
		this.checks = checks;
		this.annotations = annotations;
	}
	annotate(annotations) {
		return new FilterGroup(this.checks, {
			...this.annotations,
			...annotations
		});
	}
	and(other, annotations) {
		return new FilterGroup([this, other], annotations);
	}
};
/** @internal */
function makeFilter$1(filter, annotations, aborted = false) {
	return new Filter((input, ast, options) => make$12(input, ast, filter(input, ast, options)), annotations, aborted);
}
/**
* Creates a {@link Filter} that validates strings against a regular expression.
*
* - Returns a `Filter<string>` suitable for use with `Schema.filter` or
*   attached directly to a `String` AST node via checks.
* - The regex `source` is stored in annotations for serialization and
*   arbitrary generation.
*
* **Example** (Validating an email pattern)
*
* ```ts
* import { SchemaAST } from "effect"
*
* const emailFilter = SchemaAST.isPattern(/^[^@]+@[^@]+$/)
* ```
*
* @see {@link Filter}
*
* @since 4.0.0
*/
function isPattern$1(regExp, annotations) {
	const source = regExp.source;
	return makeFilter$1((s) => regExp.test(s), {
		expected: `a string matching the RegExp ${source}`,
		meta: {
			_tag: "isPattern",
			regExp
		},
		toArbitraryConstraint: { string: { patterns: [regExp.source] } },
		...annotations
	});
}
function modifyOwnPropertyDescriptors(ast, f) {
	const d = Object.getOwnPropertyDescriptors(ast);
	f(d);
	return Object.create(Object.getPrototypeOf(ast), d);
}
/** @internal */
function replaceEncoding(ast, encoding) {
	if (ast.encoding === encoding) return ast;
	return modifyOwnPropertyDescriptors(ast, (d) => {
		d.encoding.value = encoding;
	});
}
/** @internal */
function replaceContext(ast, context) {
	if (ast.context === context) return ast;
	return modifyOwnPropertyDescriptors(ast, (d) => {
		d.context.value = context;
	});
}
/** @internal */
function getLastEncoding(ast) {
	return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
/** @internal */
function annotate(ast, annotations) {
	if (ast.checks) {
		const last = ast.checks[ast.checks.length - 1];
		return replaceChecks(ast, append(ast.checks.slice(0, -1), last.annotate(annotations)));
	}
	return modifyOwnPropertyDescriptors(ast, (d) => {
		d.annotations.value = {
			...d.annotations.value,
			...annotations
		};
	});
}
/** @internal */
function replaceChecks(ast, checks) {
	if (ast.checks === checks) return ast;
	return modifyOwnPropertyDescriptors(ast, (d) => {
		d.checks.value = checks;
	});
}
/** @internal */
function appendChecks(ast, checks) {
	return replaceChecks(ast, ast.checks ? [...ast.checks, ...checks] : checks);
}
function updateLastLink(encoding, f) {
	const links = encoding;
	const last = links[links.length - 1];
	const to = f(last.to);
	if (to !== last.to) return append(encoding.slice(0, encoding.length - 1), new Link(to, last.transformation));
	return encoding;
}
/** @internal */
function applyToLastLink(f) {
	return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
function appendTransformation(from, transformation, to) {
	const link = new Link(from, transformation);
	return replaceEncoding(to, to.encoding ? [...to.encoding, link] : [link]);
}
function mapOrSame(as, f) {
	let changed = false;
	const out = new Array(as.length);
	for (let i = 0; i < as.length; i++) {
		const a = as[i];
		const fa = f(a);
		if (fa !== a) changed = true;
		out[i] = fa;
	}
	return changed ? out : as;
}
/** @internal */
function annotateKey(ast, annotations) {
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.defaultValue, {
		...ast.context.annotations,
		...annotations
	}) : new Context(false, false, void 0, annotations));
}
/** @internal */
const optionalKeyLastLink = /* @__PURE__ */ applyToLastLink(optionalKey$1);
/**
* Marks an AST node's property key as optional by setting
* {@link Context.isOptional} to `true`.
*
* Also propagates the optional flag through the last link of the encoding
* chain if present.
*
* @see {@link isOptional}
* @see {@link Context}
*
* @since 4.0.0
*/
function optionalKey$1(ast) {
	return optionalKeyLastLink(replaceContext(ast, ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.defaultValue, ast.context.annotations) : ast.context : new Context(true, false)));
}
/** @internal */
function withConstructorDefault$1(ast, defaultValue) {
	const encoding = [new Link(unknown, new Transformation(withDefault(defaultValue), passthrough$1()))];
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, encoding, ast.context.annotations) : new Context(false, false, encoding));
}
/**
* Attaches a `Transformation` to the `to` AST, making it decode from the
* `from` AST and encode back to it.
*
* This is the low-level primitive behind `Schema.transform` and
* `Schema.transformOrFail`. It appends a {@link Link} to the `to` node's
* encoding chain.
*
* - Does not mutate either input.
* - Returns a new AST with the same type as `to`.
*
* @see {@link Link}
* @see {@link Encoding}
* @see {@link flip}
*
* @since 4.0.0
*/
function decodeTo$1(from, to, transformation) {
	return appendTransformation(from, transformation, to);
}
function parseParameter(ast) {
	switch (ast._tag) {
		case "Literal": return {
			literals: isPropertyKey(ast.literal) ? [ast.literal] : [],
			parameters: []
		};
		case "UniqueSymbol": return {
			literals: [ast.symbol],
			parameters: []
		};
		case "String":
		case "Number":
		case "Symbol":
		case "TemplateLiteral": return {
			literals: [],
			parameters: [ast]
		};
		case "Union": {
			const out = {
				literals: [],
				parameters: []
			};
			for (let i = 0; i < ast.types.length; i++) {
				const parsed = parseParameter(ast.types[i]);
				out.literals = out.literals.concat(parsed.literals);
				out.parameters = out.parameters.concat(parsed.parameters);
			}
			return out;
		}
	}
	return {
		literals: [],
		parameters: []
	};
}
/**
* Returns `true` if the AST node represents an optional property.
*
* Checks `ast.context?.isOptional`. Defaults to `false` when no
* {@link Context} is set.
*
* @see {@link optionalKey}
* @see {@link Context}
*
* @since 4.0.0
*/
function isOptional(ast) {
	return ast.context?.isOptional ?? false;
}
/** @internal */
function isMutable(ast) {
	return ast.context?.isMutable ?? false;
}
/**
* Strips all encoding transformations from an AST, returning the decoded
* (type-level) representation.
*
* - Memoized: same input reference → same output reference.
* - Recursively walks into composite nodes ({@link Arrays}, {@link Objects},
*   {@link Union}, {@link Suspend}).
* - Does not mutate the input.
*
* **Example** (Getting the type AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const typeAst = SchemaAST.toType(schema.ast)
* console.log(typeAst._tag) // "Number"
* ```
*
* @see {@link toEncoded}
* @see {@link flip}
*
* @since 4.0.0
*/
const toType = /* @__PURE__ */ memoize((ast) => {
	if (ast.encoding) return toType(replaceEncoding(ast, void 0));
	const out = ast;
	return out.recur?.(toType) ?? out;
});
/**
* Returns the encoded (wire-format) AST by flipping and then stripping
* encodings.
*
* Equivalent to `toType(flip(ast))`. This gives you the AST that describes
* the shape of the serialized/encoded data.
*
* - Memoized: same input reference → same output reference.
* - Does not mutate the input.
*
* **Example** (Getting the encoded AST)
*
* ```ts
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const encodedAst = SchemaAST.toEncoded(schema.ast)
* console.log(encodedAst._tag) // "String"
* ```
*
* @see {@link toType}
* @see {@link flip}
*
* @since 4.0.0
*/
const toEncoded = /* @__PURE__ */ memoize((ast) => {
	return toType(flip(ast));
});
function flipEncoding(ast, encoding) {
	const links = encoding;
	const len = links.length;
	const last = links[len - 1];
	const ls = [new Link(flip(replaceEncoding(ast, void 0)), links[0].transformation.flip())];
	for (let i = 1; i < len; i++) ls.unshift(new Link(flip(links[i - 1].to), links[i].transformation.flip()));
	const to = flip(last.to);
	if (to.encoding) return replaceEncoding(to, [...to.encoding, ...ls]);
	else return replaceEncoding(to, ls);
}
/**
* Swaps the decode and encode directions of an AST's {@link Encoding} chain.
*
* After flipping, what was decoding becomes encoding and vice versa. This is
* the core operation behind `Schema.encode` — encoding a value is decoding
* with a flipped AST.
*
* - Memoized: same input reference → same output reference.
* - Recursively walks composite nodes.
* - Does not mutate the input.
*
* @see {@link toType}
* @see {@link toEncoded}
*
* @since 4.0.0
*/
const flip = /* @__PURE__ */ memoize((ast) => {
	if (ast.encoding) return flipEncoding(ast, ast.encoding);
	const out = ast;
	return out.flip?.(flip) ?? out.recur?.(flip) ?? out;
});
/** @internal */
function containsUndefined(ast) {
	switch (ast._tag) {
		case "Undefined": return true;
		case "Union": return ast.types.some(containsUndefined);
		default: return false;
	}
}
function getTemplateLiteralSource(ast, top) {
	return ast.encodedParts.map((part) => handleTemplateLiteralASTPartParens(part, getTemplateLiteralASTPartPattern(part), top)).join("");
}
/** @internal */
const getTemplateLiteralRegExp = /* @__PURE__ */ memoize((ast) => {
	return new globalThis.RegExp(`^${getTemplateLiteralSource(ast, true)}$`);
});
function getTemplateLiteralASTPartPattern(part) {
	switch (part._tag) {
		case "Literal": return escape(globalThis.String(part.literal));
		case "String": return STRING_PATTERN;
		case "Number": return FINITE_PATTERN;
		case "BigInt": return BIGINT_PATTERN;
		case "TemplateLiteral": return getTemplateLiteralSource(part, false);
		case "Union": return part.types.map(getTemplateLiteralASTPartPattern).join("|");
	}
}
function handleTemplateLiteralASTPartParens(part, s, top) {
	if (isUnion(part)) {
		if (!top) return `(?:${s})`;
	} else if (!top) return s;
	return `(${s})`;
}
function fromConst(ast, value) {
	const succeed = succeedSome(value);
	return (oinput) => {
		if (oinput._tag === "None") return succeedNone;
		return oinput.value === value ? succeed : fail$2(new InvalidType(ast, oinput));
	};
}
function fromRefinement(ast, refinement) {
	return (oinput) => {
		if (oinput._tag === "None") return succeedNone;
		return refinement(oinput.value) ? succeed$2(oinput) : fail$2(new InvalidType(ast, oinput));
	};
}
/** @internal */
function toCodec(f) {
	function out(ast) {
		return ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, out)) : f(ast);
	}
	return memoize(out);
}
const indexSignatureParameterFromString = /* @__PURE__ */ toCodec((ast) => {
	switch (ast._tag) {
		default: return ast;
		case "Number": return ast.toCodecStringTree();
		case "Union": return ast.recur(indexSignatureParameterFromString);
	}
});
/**
* any string, including newlines
* @internal
*/
const STRING_PATTERN = "[\\s\\S]*?";
const isStringFiniteRegExp = /* @__PURE__ */ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
/** @internal */
function isStringFinite(annotations) {
	return isPattern$1(isStringFiniteRegExp, {
		expected: "a string representing a finite number",
		meta: {
			_tag: "isStringFinite",
			regExp: isStringFiniteRegExp
		},
		...annotations
	});
}
const finiteString = /* @__PURE__ */ appendChecks(string, [/* @__PURE__ */ isStringFinite()]);
const finiteToString = /* @__PURE__ */ new Link(finiteString, numberFromString);
const numberToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union$1([finiteString, nonFiniteLiterals], "anyOf"), numberFromString);
/**
* signed integer only (no leading "+" because TypeScript doesn't support it)
*/
const BIGINT_PATTERN = "-?\\d+";
`${BIGINT_PATTERN}`;
/** @internal */
function collectIssues(checks, value, issues, ast, options) {
	for (let i = 0; i < checks.length; i++) {
		const check = checks[i];
		if (check._tag === "FilterGroup") collectIssues(check.checks, value, issues, ast, options);
		else {
			const issue = check.run(value, ast, options);
			if (issue) {
				issues.push(new Filter$1(value, check, issue));
				if (check.aborted || options?.errors !== "all") return;
			}
		}
	}
}
/** @internal */
const ClassTypeId = "~effect/Schema/Class";
/** @internal */
const STRUCTURAL_ANNOTATION_KEY = "~structural";
/**
* Returns a single annotation value by key from the AST node.
*
* Like {@link resolve}, reads from the last check's annotations when checks
* are present. Returns `undefined` if the key is not found.
*
* @see {@link resolve}
*
* @since 4.0.0
*/
const resolveAt = resolveAt$1;
/**
* Returns the `identifier` annotation from the AST node, if set.
*
* The identifier is typically set by `Schema.annotations({ identifier: "..." })`
* and is used for error messages and schema identification.
*
* @see {@link resolve}
* @see {@link resolveTitle}
*
* @since 4.0.0
*/
const resolveIdentifier = resolveIdentifier$1;
/**
* Returns the `description` annotation from the AST node, if set.
*
* @see {@link resolve}
* @see {@link resolveTitle}
* @see {@link resolveIdentifier}
*
* @since 4.0.0
*/
const resolveDescription = resolveDescription$1;
/**
* Returns true if the value is a JSON value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isJson(u) {
	const onPath = /* @__PURE__ */ new Set();
	const validated = /* @__PURE__ */ new Set();
	return recur(u);
	function recur(u) {
		if (u === null || typeof u === "string" || typeof u === "boolean") return true;
		if (typeof u === "number") return globalThis.Number.isFinite(u);
		if (typeof u !== "object" || u === void 0) return false;
		if (onPath.has(u)) return false;
		if (validated.has(u)) return true;
		onPath.add(u);
		const ok = Array.isArray(u) ? u.every(recur) : Object.keys(u).every((key) => recur(u[key]));
		onPath.delete(u);
		if (ok) validated.add(u);
		return ok;
	}
}
/** @internal */
const Json = /* @__PURE__ */ new Declaration([], () => (input, ast) => isJson(input) ? succeed$2(input) : fail$2(new InvalidType(ast, some(input))), {
	typeConstructor: { _tag: "effect/Json" },
	generation: {
		runtime: `Schema.Json`,
		Type: `Schema.Json`
	},
	expected: "JSON value",
	toCodecJson: () => new Link(unknown, passthrough())
});
/** @internal */
const unknownToNull = /* @__PURE__ */ new Link(null_, /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough$1(), /* @__PURE__ */ transform$1(() => null)));
/** @internal */
const unknownToJson = /* @__PURE__ */ new Link(Json, /* @__PURE__ */ passthrough());
/**
* Returns true if the value is a StringTree value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isStringTree(u) {
	const seen = /* @__PURE__ */ new Set();
	return recur(u);
	function recur(u) {
		if (u === void 0 || typeof u === "string") return true;
		if (typeof u !== "object" || u === null) return false;
		if (seen.has(u)) return false;
		seen.add(u);
		if (Array.isArray(u)) return u.every(recur);
		return Object.keys(u).every((key) => recur(u[key]));
	}
}
/** @internal */
const unknownToStringTree = /* @__PURE__ */ new Link(/* @__PURE__ */ new Declaration([], () => (input, ast) => isStringTree(input) ? succeed$2(input) : fail$2(new InvalidType(ast, some(input))), {
	expected: "StringTree",
	toCodecStringTree: () => new Link(unknown, passthrough())
}), /* @__PURE__ */ passthrough());
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Struct.js
/**
* Wraps a plain function as a {@link Lambda} value so it can be used with
* {@link map}, {@link mapPick}, and {@link mapOmit}.
*
* - The type parameter `L` encodes both the input and output types at the type
*   level, allowing the compiler to track how struct value types change.
* - At runtime, the returned value is the same function — `lambda` only
*   adjusts the type.
*
* **Example** (Wrapping values in arrays)
*
* ```ts
* import { pipe, Struct } from "effect"
*
* interface AsArray extends Struct.Lambda {
*   <A>(self: A): Array<A>
*   readonly "~lambda.out": Array<this["~lambda.in"]>
* }
*
* const asArray = Struct.lambda<AsArray>((a) => [a])
* const result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))
* console.log(result) // { x: [1], y: ["hello"] }
* ```
*
* @see {@link Lambda} – the type-level interface
* @see {@link map} – apply a lambda to all struct values
*
* @category Lambda
* @since 4.0.0
*/
const lambda = (f) => f;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaParser.js
/**
* @since 4.0.0
*/
const recurDefaults = /* @__PURE__ */ memoize((ast) => {
	switch (ast._tag) {
		case "Declaration": {
			const getLink = ast.annotations?.[ClassTypeId];
			if (isFunction(getLink)) {
				const link = getLink(ast.typeParameters);
				const to = recurDefaults(link.to);
				return replaceEncoding(ast, to === link.to ? [link] : [new Link(to, link.transformation)]);
			}
			return ast;
		}
		case "Objects":
		case "Arrays": return ast.recur((ast) => {
			const defaultValue = ast.context?.defaultValue;
			if (defaultValue) return replaceEncoding(recurDefaults(ast), defaultValue);
			return recurDefaults(ast);
		});
		case "Suspend": return ast.recur(recurDefaults);
		default: return ast;
	}
});
/**
* @category Constructing
* @since 4.0.0
*/
function makeEffect(schema) {
	const parser = run$1(recurDefaults(toType(schema.ast)));
	return (input, options) => {
		return parser(input, options?.disableChecks ? options?.parseOptions ? {
			...options.parseOptions,
			disableChecks: true
		} : { disableChecks: true } : options?.parseOptions);
	};
}
/**
* @category Constructing
* @since 4.0.0
*/
function makeOption(schema) {
	const parser = makeEffect(schema);
	return (input, options) => {
		return getSuccess(runSyncExit(parser(input, options)));
	};
}
/**
* @category Constructing
* @since 4.0.0
*/
function makeUnsafe$1(schema) {
	const parser = makeEffect(schema);
	return (input, options) => {
		return runSync(mapErrorEager(parser(input, options), (issue) => new Error(issue.toString(), { cause: issue })));
	};
}
/** @internal */
function run$1(ast) {
	const parser = recur(ast);
	return (input, options) => flatMapEager(parser(some(input), options ?? defaultParseOptions), (oa) => {
		if (oa._tag === "None") return fail$2(new InvalidValue(oa));
		return succeed$2(oa.value);
	});
}
const recur = /* @__PURE__ */ memoize((ast) => {
	let parser;
	const astOptions = resolve(ast)?.["parseOptions"];
	if (!ast.context && !ast.encoding && !ast.checks) return (ou, options) => {
		parser ??= ast.getParser(recur);
		if (astOptions) options = {
			...options,
			...astOptions
		};
		return parser(ou, options);
	};
	const isStructural = isArrays(ast) || isObjects(ast) || isDeclaration(ast) && ast.typeParameters.length > 0;
	return (ou, options) => {
		if (astOptions) options = {
			...options,
			...astOptions
		};
		const encoding = ast.encoding;
		let srou;
		if (encoding) {
			const links = encoding;
			const len = links.length;
			for (let i = len - 1; i >= 0; i--) {
				const link = links[i];
				const to = link.to;
				const parser = recur(to);
				srou = srou ? flatMapEager(srou, (ou) => parser(ou, options)) : parser(ou, options);
				if (link.transformation._tag === "Transformation") {
					const getter = link.transformation.decode;
					srou = flatMapEager(srou, (ou) => getter.run(ou, options));
				} else srou = link.transformation.decode(srou, options);
			}
			srou = mapErrorEager(srou, (issue) => new Encoding(ast, ou, issue));
		}
		parser ??= ast.getParser(recur);
		let sroa = srou ? flatMapEager(srou, (ou) => parser(ou, options)) : parser(ou, options);
		if (ast.checks && !options?.disableChecks) {
			const checks = ast.checks;
			if (options?.errors === "all" && isStructural && isSome(ou)) sroa = catchEager(sroa, (issue) => {
				const issues = [];
				collectIssues(checks.filter((check) => check.annotations?.[STRUCTURAL_ANNOTATION_KEY]), ou.value, issues, ast, options);
				return fail$2(isArrayNonEmpty(issues) ? issue._tag === "Composite" && issue.ast === ast ? new Composite(ast, issue.actual, [...issue.issues, ...issues]) : new Composite(ast, ou, [issue, ...issues]) : issue);
			});
			sroa = flatMapEager(sroa, (oa) => {
				if (isSome(oa)) {
					const value = oa.value;
					const issues = [];
					collectIssues(checks, value, issues, ast, options);
					if (isArrayNonEmpty(issues)) return fail$2(new Composite(ast, oa, issues));
				}
				return succeed$2(oa);
			});
		}
		return sroa;
	};
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/JsonPointer.js
/**
* Utilities for escaping and unescaping JSON Pointer reference tokens according to RFC 6901.
*
* JSON Pointer (RFC 6901) defines a string syntax for identifying a specific value within a JSON document.
* A JSON Pointer is a sequence of reference tokens separated by forward slashes (`/`). Each reference token
* must be escaped when it contains special characters (`~` or `/`).
*
* ## Mental model
*
* - **Reference token**: A single segment of a JSON Pointer path (e.g., `"foo"`, `"bar/baz"`, `"key~with~tilde"`)
* - **Escaping**: Encoding special characters in a token so it can be safely used in a JSON Pointer (`~` → `~0`, `/` → `~1`)
* - **Unescaping**: Decoding escaped characters back to their original form (`~0` → `~`, `~1` → `/`)
* - **RFC 6901 compliance**: These functions implement the standard escaping rules for JSON Pointer reference tokens
* - **Pure functions**: Both operations are pure, immutable, and have no side effects
*
* ## Common tasks
*
* - Building JSON Pointers from path segments → {@link escapeToken}
* - Parsing JSON Pointers to extract original token values → {@link unescapeToken}
* - Escaping object keys or path segments before constructing JSON Pointers → {@link escapeToken}
* - Extracting unescaped identifiers from JSON Pointer strings → {@link unescapeToken}
*
* ## Gotchas
*
* - These functions operate on **reference tokens**, not full JSON Pointers. A full JSON Pointer like `/foo/bar` must be split into tokens (`["foo", "bar"]`) before escaping/unescaping
* - The order of replacement operations matters: `escapeToken` replaces `~` before `/` to avoid double-escaping
* - Empty strings are valid tokens and are returned unchanged
* - These functions do not validate JSON Pointer syntax; they only handle token-level escaping
*
* ## Quickstart
*
* **Example** (Building and parsing a JSON Pointer)
*
* ```ts
* import { escapeToken, unescapeToken } from "effect/JsonPointer"
*
* // Build a JSON Pointer from path segments
* const segments = ["users", "name/alias", "value"]
* const pointer = "/" + segments.map(escapeToken).join("/")
* // "/users/name~1alias/value"
*
* // Parse a JSON Pointer back to segments
* const tokens = pointer.split("/").slice(1).map(unescapeToken)
* // ["users", "name/alias", "value"]
* ```
*
* ## See also
*
* - {@link JsonPatch} - Uses these utilities for JSON Patch operations
* - {@link JsonSchema} - Uses these utilities for schema reference resolution
*
* @since 4.0.0
*/
/**
* Escapes a JSON Pointer reference token according to RFC 6901.
*
* Encodes special characters in a reference token so it can be safely used as a segment in a JSON Pointer.
*
* ## When to use this
*
* - Building JSON Pointers from object keys or path segments that may contain special characters
* - Escaping tokens before joining them with `/` to form a complete JSON Pointer
* - Preparing reference tokens for use in JSON Patch operations or schema references
*
* ## Behavior
*
* - Does not mutate the input string; returns a new escaped string
* - Replaces `~` (tilde) with `~0` and `/` (forward slash) with `~1`
* - Replacement order matters: `~` is replaced before `/` to prevent double-escaping
* - Returns the input unchanged if it contains no special characters
* - Empty strings are valid and returned unchanged
*
* **Example** (Escaping special characters)
*
* ```ts
* import { escapeToken } from "effect/JsonPointer"
*
* escapeToken("a/b") // "a~1b"
* escapeToken("c~d") // "c~0d"
* escapeToken("path/to~key") // "path~1to~0key"
* ```
*
* ## See also
*
* - {@link unescapeToken} - The inverse operation for decoding escaped tokens
*
* @since 4.0.0
*/
function escapeToken(token) {
	return token.replace(/~/g, "~0").replace(/\//g, "~1");
}
/**
* Unescapes a JSON Pointer reference token according to RFC 6901.
*
* Decodes escaped characters in a reference token to recover the original token value.
*
* ## When to use this
*
* - Parsing JSON Pointers to extract the original token values from escaped segments
* - Converting escaped tokens back to their original form for use as object keys or identifiers
* - Resolving schema references or JSON Patch paths that use escaped tokens
*
* ## Behavior
*
* - Does not mutate the input string; returns a new unescaped string
* - Replaces `~1` with `/` (forward slash) and `~0` with `~` (tilde)
* - Replacement order matters: `~1` is replaced before `~0` to prevent incorrect decoding
* - Returns the input unchanged if it contains no escaped sequences
* - Empty strings are valid and returned unchanged
*
* **Example** (Unescaping special characters)
*
* ```ts
* import { unescapeToken } from "effect/JsonPointer"
*
* unescapeToken("a~1b") // "a/b"
* unescapeToken("c~0d") // "c~d"
* unescapeToken("path~1to~0key") // "path/to~key"
* ```
*
* ## See also
*
* - {@link escapeToken} - The inverse operation for encoding tokens
*
* @since 4.0.0
*/
function unescapeToken(token) {
	return token.replace(/~1/g, "/").replace(/~0/g, "~");
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/schema/schema.js
/** @internal */
const TypeId$18 = "~effect/Schema/Schema";
const SchemaProto = {
	[TypeId$18]: TypeId$18,
	pipe() {
		return pipeArguments(this, arguments);
	},
	annotate(annotations) {
		return this.rebuild(annotate(this.ast, annotations));
	},
	annotateKey(annotations) {
		return this.rebuild(annotateKey(this.ast, annotations));
	},
	check(...checks) {
		return this.rebuild(appendChecks(this.ast, checks));
	}
};
/** @internal */
function make$10(ast, options) {
	const self = Object.create(SchemaProto);
	if (options) Object.assign(self, options);
	self.ast = ast;
	self.rebuild = (ast) => make$10(ast, options);
	self.makeEffect = flow(makeEffect(self), mapErrorEager((issue) => new SchemaError(issue)));
	self.make = makeUnsafe$1(self);
	self.makeOption = makeOption(self);
	return self;
}
/** @internal */
const SchemaErrorTypeId = "~effect/Schema/SchemaError";
var SchemaError = class {
	[SchemaErrorTypeId] = SchemaErrorTypeId;
	_tag = "SchemaError";
	name = "SchemaError";
	issue;
	constructor(issue) {
		this.issue = issue;
	}
	get message() {
		return this.issue.toString();
	}
	toString() {
		return `SchemaError(${this.message})`;
	}
};
/** @internal */
const jsonReorder = /* @__PURE__ */ makeReorder(getJsonPriority);
function getJsonPriority(ast) {
	switch (ast._tag) {
		case "BigInt":
		case "Symbol":
		case "UniqueSymbol": return 0;
		default: return 1;
	}
}
/** @internal */
function makeReorder(getPriority) {
	return (types) => {
		const indexMap = /* @__PURE__ */ new Map();
		for (let i = 0; i < types.length; i++) indexMap.set(toEncoded(types[i]), i);
		const sortedTypes = [...types].sort((a, b) => {
			a = toEncoded(a);
			b = toEncoded(b);
			const pa = getPriority(a);
			const pb = getPriority(b);
			if (pa !== pb) return pa - pb;
			return indexMap.get(a) - indexMap.get(b);
		});
		if (!sortedTypes.some((ast, index) => ast !== types[index])) return types;
		return sortedTypes;
	};
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/internal/schema/representation.js
/** @internal */
function fromASTs$1(asts) {
	const references = {};
	const referenceMap = /* @__PURE__ */ new Map();
	const uniqueReferences = /* @__PURE__ */ new Set();
	const visiting = /* @__PURE__ */ new Set();
	return {
		representations: map$3(asts, (ast) => recur(ast)),
		references
	};
	function gen(prefix) {
		let candidate = prefix;
		let suffix = 0;
		while (uniqueReferences.has(candidate)) candidate = `${prefix}${++suffix}`;
		uniqueReferences.add(candidate);
		return candidate;
	}
	function recur(ast, prefix) {
		const found = referenceMap.get(ast);
		if (found !== void 0) return {
			_tag: "Reference",
			$ref: found
		};
		const last = getLastEncoding(ast);
		const identifier = resolveIdentifier$1(ast) ?? prefix;
		if (ast !== last) return recur(last, identifier);
		if (identifier !== void 0) {
			const reference = gen(identifier);
			referenceMap.set(ast, reference);
			const out = on(ast);
			const found = references[identifier];
			if (found !== void 0 && equals$2(out, found)) {
				referenceMap.set(ast, identifier);
				return {
					_tag: "Reference",
					$ref: identifier
				};
			}
			references[reference] = out;
			return {
				_tag: "Reference",
				$ref: reference
			};
		}
		if (visiting.has(ast)) {
			const reference = gen(`${ast._tag}_`);
			referenceMap.set(ast, reference);
			return {
				_tag: "Reference",
				$ref: reference
			};
		}
		visiting.add(ast);
		const out = on(ast);
		visiting.delete(ast);
		const ref = referenceMap.get(ast);
		if (ref !== void 0) {
			references[ref] = out;
			return {
				_tag: "Reference",
				$ref: ref
			};
		}
		return out;
	}
	function getEncodedSchema(last) {
		const getLink = last.annotations?.toCodecJson ?? last.annotations?.toCodec;
		if (isFunction(getLink)) return replaceEncoding(last, [getLink(last.typeParameters.map((tp) => make$10(toEncoded(tp))))]);
		return null_;
	}
	function on(last) {
		const annotations = fromASTAnnotations(last.annotations);
		switch (last._tag) {
			case "Declaration": {
				const encodedSchema = recur(getEncodedSchema(last));
				return {
					_tag: "Declaration",
					typeParameters: last.typeParameters.map((ast) => recur(ast)),
					encodedSchema,
					checks: fromASTChecks(last.checks),
					...annotations
				};
			}
			case "Null":
			case "Undefined":
			case "Void":
			case "Never":
			case "Unknown":
			case "Any":
			case "Boolean":
			case "Symbol": return {
				_tag: last._tag,
				...annotations
			};
			case "String": {
				const contentMediaType = last.annotations?.contentMediaType;
				const contentSchema = last.annotations?.contentSchema;
				return {
					_tag: last._tag,
					checks: fromASTChecks(last.checks),
					...annotations,
					...typeof contentMediaType === "string" && isAST(contentSchema) ? { contentSchema: recur(contentSchema) } : void 0
				};
			}
			case "Number":
			case "BigInt": return {
				_tag: last._tag,
				checks: fromASTChecks(last.checks),
				...annotations
			};
			case "Literal": return {
				_tag: last._tag,
				literal: last.literal,
				...annotations
			};
			case "UniqueSymbol": return {
				_tag: last._tag,
				symbol: last.symbol,
				...annotations
			};
			case "ObjectKeyword": return {
				_tag: last._tag,
				...annotations
			};
			case "Enum": return {
				_tag: last._tag,
				enums: last.enums,
				...annotations
			};
			case "TemplateLiteral": return {
				_tag: last._tag,
				parts: last.parts.map((ast) => recur(ast)),
				...annotations
			};
			case "Arrays": return {
				_tag: last._tag,
				elements: last.elements.map((e) => {
					const last = getLastEncoding(e);
					return {
						isOptional: isOptional(last),
						type: recur(e),
						...fromASTAnnotations(last.context?.annotations)
					};
				}),
				rest: last.rest.map((ast) => recur(ast)),
				checks: fromASTChecks(last.checks),
				...annotations
			};
			case "Objects": return {
				_tag: last._tag,
				propertySignatures: last.propertySignatures.map((ps) => {
					const last = getLastEncoding(ps.type);
					return {
						name: ps.name,
						type: recur(ps.type),
						isOptional: isOptional(last),
						isMutable: isMutable(last),
						...fromASTAnnotations(last.context?.annotations)
					};
				}),
				indexSignatures: last.indexSignatures.map((is) => ({
					parameter: recur(is.parameter),
					type: recur(is.type)
				})),
				checks: fromASTChecks(last.checks),
				...annotations
			};
			case "Union": {
				const types = jsonReorder(last.types);
				return {
					_tag: last._tag,
					types: types.map((ast) => recur(ast)),
					mode: last.mode,
					...annotations
				};
			}
			case "Suspend": return {
				_tag: "Suspend",
				checks: [],
				thunk: recur(last.thunk()),
				...annotations
			};
		}
	}
	function fromASTChecks(checks) {
		if (!checks) return [];
		return checks.map(getCheck).filter((c) => c !== void 0);
		function getCheck(c) {
			switch (c._tag) {
				case "Filter": {
					const meta = c.annotations?.meta;
					if (meta) return {
						_tag: "Filter",
						meta: meta._tag === "isPropertyNames" ? {
							_tag: "isPropertyNames",
							propertyNames: recur(meta.propertyNames)
						} : meta,
						...fromASTAnnotations(c.annotations)
					};
					return;
				}
				case "FilterGroup": {
					const checks = fromASTChecks(c.checks);
					if (isArrayNonEmpty(checks)) return {
						_tag: "FilterGroup",
						checks,
						...fromASTAnnotations(c.annotations)
					};
				}
			}
		}
	}
}
/** @internal */
const fromASTBlacklist = /* @__PURE__ */ new Set([
	"~structural",
	"~sentinels",
	"meta",
	"toArbitrary",
	"toArbitraryConstraint",
	"toEquivalence",
	"toFormatter",
	"toCodec",
	"toCodecJson",
	"toCodecIso",
	ClassTypeId
]);
function fromASTAnnotations(annotations) {
	if (annotations !== void 0) {
		const filtered = filter(annotations, (_, k) => !fromASTBlacklist.has(k));
		if (!isEmptyRecord(filtered)) return { annotations: filtered };
	}
}
/** @internal */
function toJsonSchemaMultiDocument$1(multiDocument, options) {
	const generateDescriptions = options?.generateDescriptions ?? false;
	const additionalProperties = options?.additionalProperties ?? false;
	const definitions = map$4(multiDocument.references, (d) => recur(d));
	return {
		dialect: "draft-2020-12",
		schemas: map$3(multiDocument.representations, (s) => recur(s)),
		definitions
	};
	function recur(s) {
		let js = on(s);
		if ("annotations" in s) {
			const a = collectJsonSchemaAnnotations(s.annotations);
			if (a) js = {
				...js,
				...a
			};
		}
		if ("checks" in s) {
			const checks = collectJsonSchemaChecks(s.checks, js.type);
			for (const check of checks) js = appendJsonSchema(js, check);
		}
		return js;
	}
	function on(schema) {
		switch (schema._tag) {
			case "Any":
			case "Unknown":
			case "ObjectKeyword": return {};
			case "Void":
			case "Undefined": return { type: "null" };
			case "BigInt": return {
				"type": "string",
				"allOf": [{ "pattern": "^-?\\d+$" }]
			};
			case "Symbol":
			case "UniqueSymbol": return {
				"type": "string",
				"allOf": [{ "pattern": "^Symbol\\((.*)\\)$" }]
			};
			case "Declaration": return recur(schema.encodedSchema);
			case "Suspend": return recur(schema.thunk);
			case "Reference": return { $ref: `#/$defs/${escapeToken(schema.$ref)}` };
			case "Null": return { type: "null" };
			case "Never": return { not: {} };
			case "String": {
				const out = { type: "string" };
				if (schema.contentMediaType !== void 0) out.contentMediaType = schema.contentMediaType;
				if (schema.contentSchema !== void 0) out.contentSchema = recur(schema.contentSchema);
				return out;
			}
			case "Number": return hasCheck(schema.checks, "isInt") ? { type: "integer" } : hasCheck(schema.checks, "isFinite") ? { type: "number" } : { "anyOf": [
				{ type: "number" },
				{
					type: "string",
					enum: ["NaN"]
				},
				{
					type: "string",
					enum: ["Infinity"]
				},
				{
					type: "string",
					enum: ["-Infinity"]
				}
			] };
			case "Boolean": return { type: "boolean" };
			case "Literal": {
				const literal = schema.literal;
				if (typeof literal === "string") return {
					type: "string",
					enum: [literal]
				};
				if (typeof literal === "number") return {
					type: "number",
					enum: [literal]
				};
				if (typeof literal === "boolean") return {
					type: "boolean",
					enum: [literal]
				};
				return {
					type: "string",
					enum: [String(literal)]
				};
			}
			case "Enum": return recur({
				_tag: "Union",
				types: schema.enums.map(([title, value]) => ({
					_tag: "Literal",
					literal: value,
					annotations: { title }
				})),
				mode: "anyOf",
				annotations: schema.annotations
			});
			case "TemplateLiteral": return {
				type: "string",
				pattern: `^${schema.parts.map(getPartPattern).join("")}$`
			};
			case "Arrays": {
				if (schema.rest.length > 1) throw new globalThis.Error("Generating a JSON Schema for post-rest elements is not supported");
				const out = { type: "array" };
				let minItems = schema.elements.length;
				const prefixItems = schema.elements.map((e) => {
					if (e.isOptional) minItems--;
					const v = recur(e.type);
					const a = collectJsonSchemaAnnotations(e.annotations);
					return a ? appendJsonSchema(v, a) : v;
				});
				if (prefixItems.length > 0) {
					out.prefixItems = prefixItems;
					out.maxItems = schema.elements.length;
					if (minItems > 0) out.minItems = minItems;
				} else out.items = false;
				if (schema.rest.length > 0) {
					delete out.maxItems;
					const rest = recur(schema.rest[0]);
					if (Object.keys(rest).length > 0) out.items = rest;
					else delete out.items;
				}
				return out;
			}
			case "Objects": {
				if (schema.propertySignatures.length === 0 && schema.indexSignatures.length === 0) return { anyOf: [{ type: "object" }, { type: "array" }] };
				const out = { type: "object" };
				const properties = {};
				const required = [];
				for (const ps of schema.propertySignatures) {
					const name = ps.name;
					if (typeof name !== "string") throw new globalThis.Error(`Unsupported property signature name: ${format$1(name)}`);
					const v = recur(ps.type);
					const a = collectJsonSchemaAnnotations(ps.annotations);
					properties[name] = a ? appendJsonSchema(v, a) : v;
					if (!ps.isOptional) required.push(name);
				}
				if (Object.keys(properties).length > 0) out.properties = properties;
				if (required.length > 0) out.required = required;
				out.additionalProperties = additionalProperties;
				const patternProperties = {};
				for (const is of schema.indexSignatures) {
					let type = recur(is.type);
					if (Object.keys(type).length === 1 && "not" in type) type = false;
					const patterns = getParameterPatterns(is.parameter);
					if (patterns.length > 0) for (const pattern of patterns) patternProperties[pattern] = type;
					else out.additionalProperties = type;
				}
				if (Object.keys(patternProperties).length > 0) {
					out.patternProperties = patternProperties;
					delete out.additionalProperties;
				}
				if (isObject(out.additionalProperties) && isEmptyRecord(out.additionalProperties)) delete out.additionalProperties;
				return out;
			}
			case "Union": {
				const types = schema.types.map(recur);
				if (types.length === 0) return { not: {} };
				if (types.length > 1) {
					const compacted = compactEnums(types);
					if (compacted) return compacted;
				}
				return schema.mode === "anyOf" ? { anyOf: types } : { oneOf: types };
			}
		}
	}
	function compactEnums(types) {
		let sharedType;
		const values = [];
		for (const t of types) {
			if (Object.keys(t).length !== 2 || t.type === void 0 || !Array.isArray(t.enum) || t.enum.length === 0) return;
			if (sharedType === void 0) sharedType = t.type;
			else if (t.type !== sharedType) return;
			for (const v of t.enum) values.push(v);
		}
		return {
			type: sharedType,
			enum: values
		};
	}
	function collectJsonSchemaAnnotations(annotations) {
		if (annotations) {
			const out = {};
			if (typeof annotations.title === "string") out.title = annotations.title;
			if (typeof annotations.description === "string") out.description = annotations.description;
			else if (generateDescriptions && typeof annotations.expected === "string") out.description = annotations.expected;
			if (annotations.default !== void 0) out.default = annotations.default;
			if (Array.isArray(annotations.examples)) out.examples = annotations.examples;
			if (typeof annotations.readOnly === "boolean") out.readOnly = annotations.readOnly;
			if (typeof annotations.writeOnly === "boolean") out.writeOnly = annotations.writeOnly;
			if (typeof annotations.format === "string") out.format = annotations.format;
			if (typeof annotations.contentEncoding === "string") out.contentEncoding = annotations.contentEncoding;
			if (typeof annotations.contentMediaType === "string") out.contentMediaType = annotations.contentMediaType;
			if (Object.keys(out).length > 0) return out;
		}
	}
	function collectJsonSchemaChecks(checks, type) {
		return checks.map(collectJsonSchemaCheck).filter((c) => c !== void 0);
		function collectJsonSchemaCheck(check) {
			switch (check._tag) {
				case "Filter": return filterToJsonSchema(check, type);
				case "FilterGroup": {
					const checks = check.checks.map(collectJsonSchemaCheck).filter((c) => c !== void 0);
					if (checks.length === 0) return void 0;
					let out = { allOf: checks };
					const a = collectJsonSchemaAnnotations(check.annotations);
					if (a) out = {
						...out,
						...a
					};
					return out;
				}
			}
		}
	}
	function filterToJsonSchema(filter, type) {
		const meta = filter.meta;
		if (!meta) return void 0;
		let out = on(meta);
		const a = collectJsonSchemaAnnotations(filter.annotations);
		if (a) out = {
			...out,
			...a
		};
		return out;
		function on(meta) {
			switch (meta._tag) {
				case "isMinLength": return type === "array" ? { minItems: meta.minLength } : { minLength: meta.minLength };
				case "isMaxLength": return type === "array" ? { maxItems: meta.maxLength } : { maxLength: meta.maxLength };
				case "isLengthBetween": return type === "array" ? { allOf: [{ minItems: meta.minimum }, { maxItems: meta.maximum }] } : { allOf: [{ minLength: meta.minimum }, { maxLength: meta.maximum }] };
				case "isPattern":
				case "isULID":
				case "isBase64":
				case "isBase64Url":
				case "isStartsWith":
				case "isEndsWith":
				case "isIncludes":
				case "isUppercased":
				case "isLowercased":
				case "isCapitalized":
				case "isUncapitalized":
				case "isTrimmed":
				case "isStringFinite":
				case "isStringBigInt":
				case "isStringSymbol": return { pattern: meta.regExp.source };
				case "isUUID": return {
					pattern: meta.regExp.source,
					format: "uuid"
				};
				case "isFinite":
				case "isInt": return;
				case "isMultipleOf": return { multipleOf: meta.divisor };
				case "isGreaterThanOrEqualTo": return { minimum: meta.minimum };
				case "isLessThanOrEqualTo": return { maximum: meta.maximum };
				case "isGreaterThan": return { exclusiveMinimum: meta.exclusiveMinimum };
				case "isLessThan": return { exclusiveMaximum: meta.exclusiveMaximum };
				case "isBetween": return {
					[meta.exclusiveMinimum ? "exclusiveMinimum" : "minimum"]: meta.minimum,
					[meta.exclusiveMaximum ? "exclusiveMaximum" : "maximum"]: meta.maximum
				};
				case "isUnique": return { uniqueItems: true };
				case "isMinProperties": return { minProperties: meta.minProperties };
				case "isMaxProperties": return { maxProperties: meta.maxProperties };
				case "isPropertiesLengthBetween": return {
					minProperties: meta.minimum,
					maxProperties: meta.maximum
				};
				case "isPropertyNames": return { propertyNames: recur(meta.propertyNames) };
				case "isDateValid": return { format: "date-time" };
			}
		}
	}
	function getParameterPatterns(parameter) {
		switch (parameter._tag) {
			default: throw new globalThis.Error(`Unsupported index signature parameter: ${parameter._tag}`);
			case "Reference": return getParameterPatterns(multiDocument.references[parameter.$ref]);
			case "String": return getPatterns(parameter);
			case "TemplateLiteral": return [`^${parameter.parts.map(getPartPattern).join("")}$`];
			case "Union": return parameter.types.flatMap(getParameterPatterns);
		}
	}
}
function getPatterns(s) {
	return recur(s.checks);
	function recur(checks) {
		return checks.flatMap((c) => {
			switch (c._tag) {
				case "Filter":
					if ("regExp" in c.meta) return [c.meta.regExp.source];
					return [];
				case "FilterGroup": return recur(c.checks);
			}
		});
	}
}
function hasCheck(checks, tag) {
	return checks.some((c) => {
		switch (c._tag) {
			case "Filter": return c.meta._tag === tag;
			case "FilterGroup": return hasCheck(c.checks, tag);
		}
	});
}
function appendJsonSchema(a, b) {
	if (Object.keys(a).length === 0) return b;
	const len = Object.keys(b).length;
	if (len === 0) return a;
	const members = Array.isArray(b.allOf) && len === 1 ? b.allOf : [b];
	if (Array.isArray(a.allOf)) return {
		...a,
		allOf: [...a.allOf, ...members]
	};
	if (typeof a.$ref === "string") return { allOf: [a, ...members] };
	return {
		...a,
		allOf: members
	};
}
function getPartPattern(part) {
	switch (part._tag) {
		case "Literal": return escape(globalThis.String(part.literal));
		case "String": return STRING_PATTERN;
		case "Number": return FINITE_PATTERN;
		case "TemplateLiteral": return part.parts.map(getPartPattern).join("");
		case "Union": return part.types.map(getPartPattern).join("|");
		default: throw new globalThis.Error("Unsupported part", { cause: part });
	}
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/JsonPatch.js
/**
* JSON Patch operations for transforming JSON documents.
*
* This module implements a subset of RFC 6902, providing operations that can be applied deterministically without additional context. It supports computing structural diffs between JSON values and applying patches to transform documents.
*
* ## Mental model
*
* - **JSON Patch**: An ordered sequence of operations that transform a document from one state to another
* - **JSON Pointer**: Path syntax for targeting specific locations in a JSON document (e.g., `/users/0/name`)
* - **Operations**: Three types - `add` (insert value), `remove` (delete value), `replace` (update value)
* - **Immutable transformations**: All operations return new values; inputs are never mutated
* - **Sequential application**: Operations are applied in order, with later operations observing changes from earlier ones
* - **Structural diff**: The `get` function computes differences by comparing structure, not content semantics
*
* ## Common tasks
*
* - Computing diffs between JSON values → {@link get}
* - Applying patches to transform documents → {@link apply}
* - Creating patches manually → {@link JsonPatchOperation}
* - Storing and validating patch documents → {@link JsonPatch}
*
* ## Gotchas
*
* - Array removals are emitted from highest index to lowest to avoid index shifting during application
* - Root operations use an empty string path `""` to target the entire document
* - Array append operations use `-` as the last token in the path (e.g., `/items/-`)
* - Generated patches are deterministic but not guaranteed to be minimal
* - Empty patches return the original document reference (no allocation)
* - Invalid paths or operations throw errors rather than returning a result type
*
* ## Quickstart
*
* **Example** (Computing and applying a patch)
*
* ```ts
* import * as JsonPatch from "effect/JsonPatch"
*
* const oldValue = { name: "Alice", age: 30 }
* const newValue = { name: "Alice", age: 31, city: "NYC" }
*
* const patch = JsonPatch.get(oldValue, newValue)
* // [{ op: "replace", path: "/age", value: 31 }, { op: "add", path: "/city", value: "NYC" }]
*
* const result = JsonPatch.apply(patch, oldValue)
* // { name: "Alice", age: 31, city: "NYC" }
* ```
*
* ## See also
*
* - {@link JsonPointer} - Utilities for working with JSON Pointer paths
* - {@link Schema.Json} - The JSON value type used by this module
*
* @since 4.0.0
*/
/**
* Apply a JSON Patch to a document.
*
* Executes a sequence of patch operations on a JSON document, returning a new document with all transformations applied.
*
* ## When to use this
*
* - Applying patches generated by {@link get}
* - Transforming documents with manually constructed patches
* - Implementing patch-based update mechanisms
* - Processing patch operations from external sources
*
* ## Behavior
*
* - Never mutates the input document; returns a new value
* - Returns the original reference if patch is empty (no allocation)
* - Operations applied sequentially; later operations see earlier changes
* - Root replace (`path: ""`) returns the provided value directly
* - Throws errors for invalid paths, missing properties, or out-of-bounds array indices
* - Array operations preserve immutability by copying affected arrays
* - Object operations preserve immutability by copying affected objects
*
* **Example** (Applying a patch)
*
* ```ts
* import * as JsonPatch from "effect/JsonPatch"
*
* const document = { items: [1, 2, 3], total: 6 }
* const patch: JsonPatch.JsonPatch = [
*   { op: "add", path: "/items/-", value: 4 },
*   { op: "replace", path: "/total", value: 10 }
* ]
*
* const result = JsonPatch.apply(patch, document)
* // { items: [1, 2, 3, 4], total: 10 }
* ```
*
* ## See also
*
* - {@link get} - Generates patches from value differences
* - {@link JsonPatchOperation} - The operation types being applied
*
* @since 4.0.0
*/
function apply(patch, oldValue) {
	let doc = oldValue;
	for (const op of patch) switch (op.op) {
		case "replace":
			doc = op.path === "" ? op.value : setAt(doc, op.path, op.value, "replace");
			break;
		case "add":
			doc = addAt(doc, op.path, op.value);
			break;
		case "remove":
			doc = setAt(doc, op.path, void 0, "remove");
			break;
	}
	return doc;
}
function isJsonObject(value) {
	return isObject(value);
}
/**
* Tokenize a JSON Pointer into unescaped reference tokens.
*
* - `""` (empty pointer) refers to the root and returns `[]`
* - Non-empty pointers must start with `/`
*/
function tokenize(pointer) {
	if (pointer === "") return [];
	if (pointer.charCodeAt(0) !== 47) throw new Error(`Invalid JSON Pointer, it must start with "/": ${format$1(pointer)}`);
	return pointer.split("/").slice(1).map(unescapeToken);
}
/** Convert a reference token to a non-negative array index (rejects `-` and negatives). */
function toIndex(token) {
	if (!/^(0|[1-9]\d*)$/.test(token)) throw new Error(`Invalid array index: "${token}"`);
	return Number(token);
}
function addAt(doc, pointer, val) {
	if (pointer === "") return val;
	const resolved = resolveParent(doc, pointer);
	if (resolved === null) throw new Error(`Cannot add at "${pointer}" (parent not found or not a container).`);
	const { lastToken, parent, stack } = resolved;
	if (Array.isArray(parent)) {
		const idx = lastToken === "-" ? parent.length : toIndex(lastToken);
		if (idx < 0 || idx > parent.length) throw new Error(`Array index out of bounds at "${pointer}".`);
		const updated = parent.slice();
		updated.splice(idx, 0, val);
		return rebuildFromStack(stack, updated);
	}
	if (isJsonObject(parent)) {
		const updated = { ...parent };
		updated[lastToken] = val;
		return rebuildFromStack(stack, updated);
	}
	throw new Error(`Cannot add at "${pointer}" (parent not found or not a container).`);
}
function setAt(doc, pointer, val, mode) {
	if (pointer === "") {
		if (mode === "remove" || val === void 0) throw new Error("Unsupported operation at the root");
		return val;
	}
	const resolved = resolveParent(doc, pointer);
	if (resolved === null) throw new Error(`Cannot ${mode} at "${pointer}" (parent not found or not a container).`);
	const { lastToken, parent, stack } = resolved;
	if (Array.isArray(parent)) {
		if (lastToken === "-") throw new Error(`"-" is not valid for ${mode} at "${pointer}".`);
		const idx = toIndex(lastToken);
		if (idx < 0 || idx >= parent.length) throw new Error(`Array index out of bounds at "${pointer}".`);
		const updated = parent.slice();
		if (mode === "remove") updated.splice(idx, 1);
		else updated[idx] = val;
		return rebuildFromStack(stack, updated);
	}
	if (isJsonObject(parent)) {
		if (!Object.hasOwn(parent, lastToken)) throw new Error(`Property "${lastToken}" does not exist at "${pointer}".`);
		const updated = { ...parent };
		if (mode === "remove") delete updated[lastToken];
		else updated[lastToken] = val;
		return rebuildFromStack(stack, updated);
	}
	throw new Error(`Cannot ${mode} at "${pointer}" (parent not found or not a container).`);
}
function resolveParent(doc, pointer) {
	const tokens = tokenize(pointer);
	if (tokens.length === 0) return null;
	const lastToken = tokens[tokens.length - 1];
	const stack = [];
	let cur = doc;
	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		if (cur == null) return null;
		if (Array.isArray(cur)) {
			const idx = toIndex(token);
			if (idx < 0 || idx >= cur.length) return null;
			stack.push({
				container: cur,
				token: idx
			});
			cur = cur[idx];
			continue;
		}
		if (cur && typeof cur === "object") {
			if (!Object.hasOwn(cur, token)) return null;
			stack.push({
				container: cur,
				token
			});
			cur = cur[token];
			continue;
		}
		return null;
	}
	return {
		stack,
		parent: cur,
		lastToken
	};
}
function rebuildFromStack(stack, newParent) {
	let acc = newParent;
	for (let i = stack.length - 1; i >= 0; i--) {
		const { container, token } = stack[i];
		if (Array.isArray(container)) {
			const copy = container.slice();
			copy[token] = acc;
			acc = copy;
		} else {
			const copy = { ...container };
			copy[token] = acc;
			acc = copy;
		}
	}
	return acc;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/JsonSchema.js
/**
* Convert JSON Schema documents between dialects (Draft-07, Draft-2020-12,
* OpenAPI 3.0, OpenAPI 3.1). All dialects are normalized to an internal
* `Document<"draft-2020-12">` representation before optional conversion to
* an output dialect.
*
* ## Mental model
*
* - **JsonSchema** — a plain object with string keys; represents any single
*   JSON Schema node.
* - **Dialect** — one of `"draft-07"`, `"draft-2020-12"`, `"openapi-3.1"`,
*   or `"openapi-3.0"`.
* - **Document** — a structured container holding a root `schema`, its
*   companion `definitions`, and the target `dialect`. Definitions are
*   stored separately from the root schema so they can be relocated when
*   converting between dialects.
* - **MultiDocument** — same as `Document` but carries multiple root
*   schemas (at least one). Useful when generating several schemas that
*   share a single definitions pool.
* - **Definitions** — a `Record<string, JsonSchema>` keyed by definition
*   name. The ref pointer prefix depends on the dialect.
* - **`from*` functions** — parse a raw JSON Schema object into the
*   canonical `Document<"draft-2020-12">`.
* - **`to*` functions** — convert from the canonical representation to a
*   specific output dialect.
*
* ## Common tasks
*
* - Parse a Draft-07 schema → {@link fromSchemaDraft07}
* - Parse a Draft-2020-12 schema → {@link fromSchemaDraft2020_12}
* - Parse an OpenAPI 3.1 schema → {@link fromSchemaOpenApi3_1}
* - Parse an OpenAPI 3.0 schema → {@link fromSchemaOpenApi3_0}
* - Convert to Draft-07 output → {@link toDocumentDraft07}
* - Convert to OpenAPI 3.1 output → {@link toMultiDocumentOpenApi3_1}
* - Resolve a `$ref` against definitions → {@link resolve$ref}
* - Inline the root `$ref` of a document → {@link resolveTopLevel$ref}
*
* ## Gotchas
*
* - All `from*` functions normalize to `Document<"draft-2020-12">`
*   regardless of the input dialect.
* - Unsupported or unrecognized JSON Schema keywords are silently dropped
*   during conversion.
* - Draft-07 tuple syntax (`items` as array + `additionalItems`) is
*   converted to 2020-12 form (`prefixItems` + `items`), and vice-versa.
* - OpenAPI 3.0 `nullable: true` is expanded into `type` arrays or
*   `anyOf` unions. The `nullable` keyword is removed.
* - OpenAPI 3.0 singular `example` is converted to `examples` (array).
* - {@link resolve$ref} only looks up the last segment of the ref path in
*   the definitions map; it does not follow arbitrary JSON Pointer paths.
*
* ## Quickstart
*
* **Example** (Parse a Draft-07 schema and convert to Draft-07 output)
*
* ```ts
* import { JsonSchema } from "effect"
*
* const raw: JsonSchema.JsonSchema = {
*   type: "object",
*   properties: {
*     name: { type: "string" }
*   },
*   required: ["name"]
* }
*
* // Parse into canonical form
* const doc = JsonSchema.fromSchemaDraft07(raw)
*
* // Convert back to Draft-07
* const draft07 = JsonSchema.toDocumentDraft07(doc)
*
* console.log(draft07.dialect) // "draft-07"
* console.log(draft07.schema) // { type: "object", properties: { name: { type: "string" } }, required: ["name"] }
* ```
*
* ## See also
*
* - {@link Document}
* - {@link MultiDocument}
* - {@link fromSchemaDraft07}
* - {@link toDocumentDraft07}
* - {@link resolve$ref}
*
* @since 4.0.0
*/
const RE_DEFS = /^#\/\$defs(?=\/|$)/;
/**
* Converts a `MultiDocument<"draft-2020-12">` to a
* `MultiDocument<"openapi-3.1">`.
*
* - Use when generating an OpenAPI 3.1 specification from internal schemas.
* - Rewrites `#/$defs/...` refs to `#/components/schemas/...`.
* - Sanitizes definition keys to match the OpenAPI component key pattern
*   (`^[a-zA-Z0-9.\-_]+$`), replacing invalid characters with `_`.
* - Updates all `$ref` pointers to use the sanitized keys.
* - Converts all schemas and definitions in the multi-document.
* - Does not mutate the input. Allocates a new `MultiDocument`.
*
* **Example** (Converting to OpenAPI 3.1)
*
* ```ts
* import { JsonSchema } from "effect"
*
* const multi: JsonSchema.MultiDocument<"draft-2020-12"> = {
*   dialect: "draft-2020-12",
*   schemas: [{ $ref: "#/$defs/User" }],
*   definitions: {
*     User: { type: "object", properties: { name: { type: "string" } } }
*   }
* }
*
* const openapi = JsonSchema.toMultiDocumentOpenApi3_1(multi)
* console.log(openapi.dialect) // "openapi-3.1"
* console.log(openapi.schemas[0]) // { $ref: "#/components/schemas/User" }
* ```
*
* @see {@link toDocumentDraft07}
* @see {@link MultiDocument}
*
* @since 4.0.0
*/
function toMultiDocumentOpenApi3_1(multiDocument) {
	const keyMap = /* @__PURE__ */ new Map();
	for (const key of Object.keys(multiDocument.definitions)) {
		const sanitized = sanitizeOpenApiComponentsSchemasKey(key);
		if (sanitized !== key) keyMap.set(key, sanitized);
	}
	function rewrite(schema) {
		return rewrite_refs(schema, ($ref) => {
			const tokens = $ref.split("/");
			if (tokens.length > 0) {
				const identifier = unescapeToken(tokens[tokens.length - 1]);
				const sanitized = keyMap.get(identifier);
				if (sanitized !== void 0) $ref = tokens.slice(0, -1).join("/") + "/" + sanitized;
			}
			return $ref.replace(RE_DEFS, "#/components/schemas");
		});
	}
	return {
		dialect: "openapi-3.1",
		schemas: map$3(multiDocument.schemas, rewrite),
		definitions: mapEntries(multiDocument.definitions, (definition, key) => [keyMap.get(key) ?? key, rewrite(definition)])
	};
}
/** @internal */
const VALID_OPEN_API_COMPONENTS_SCHEMAS_KEY_REGEXP = /^[a-zA-Z0-9.\-_]+$/;
/**
* Returns a sanitized key for an OpenAPI component schema.
* Should match the `^[a-zA-Z0-9.\-_]+$` regular expression.
*
* @internal
*/
function sanitizeOpenApiComponentsSchemasKey(s) {
	if (s.length === 0) return "_";
	if (VALID_OPEN_API_COMPONENTS_SCHEMAS_KEY_REGEXP.test(s)) return s;
	const out = [];
	for (const ch of s) {
		const code = ch.codePointAt(0);
		if (code !== void 0 && (code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 46 || code === 45 || code === 95)) out.push(ch);
		else out.push("_");
	}
	return out.join("");
}
function rewrite_refs(node, f) {
	if (Array.isArray(node)) return node.map((v) => rewrite_refs(v, f));
	if (!isObject(node)) return node;
	const out = {};
	for (const k of Object.keys(node)) {
		const v = node[k];
		if (k === "$ref") out[k] = typeof v === "string" ? f(v) : v;
		else if (Array.isArray(v) || isObject(v)) out[k] = rewrite_refs(v, f);
		else out[k] = v;
	}
	return out;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Schema.js
const TypeId$17 = TypeId$18;
/**
* Creates a schema for a **parametric** type (a generic container such as
* `Array<A>`, `Option<A>`, etc.) by accepting a list of type-parameter schemas
* and a decoder factory.
*
* The outer call `declareConstructor<T, E, Iso>()` fixes the decoded type `T`,
* the encoded type `E`, and the optional iso type. The inner call receives:
* - `typeParameters` — the concrete schemas for each type variable
* - `run` — a factory that, given resolved codecs for each type parameter,
*   returns a parsing function `(u, ast, options) => Effect<T, Issue>`
* - `annotations` — optional metadata
*
* @see {@link declare} for creating schemas for non-parametric types.
*
* **Example** (Schema for a parametric `Box<A>` type)
*
* ```ts
* import { Effect, Schema } from "effect"
* import * as SchemaParser from "effect/SchemaParser"
* import * as Issue from "effect/SchemaIssue"
* import * as Option from "effect/Option"
*
* interface Box<A> {
*   readonly value: A
* }
*
* const isBox = (u: unknown): u is Box<unknown> =>
*   typeof u === "object" && u !== null && "value" in u
*
* const Box = <A extends Schema.Top>(item: A) =>
*   Schema.declareConstructor<Box<A["Type"]>, Box<A["Encoded"]>>()(
*     [item],
*     ([itemCodec]) =>
*       (u, ast, options) => {
*         if (!isBox(u)) {
*           return Effect.fail(new Issue.InvalidType(ast, Option.some(u)))
*         }
*         return Effect.map(
*           SchemaParser.decodeUnknownEffect(itemCodec)(u.value, options),
*           (value) => ({ value })
*         )
*       }
*   )
*
* const schema = Box(Schema.Number)
* ```
*
* @category Constructors
* @since 4.0.0
*/
function declareConstructor() {
	return (typeParameters, run, annotations) => {
		return make$9(new Declaration(typeParameters.map(getAST), (typeParameters) => run(typeParameters.map((ast) => make$9(ast))), annotations));
	};
}
/**
* Creates a schema for a **non-parametric** opaque type using a type-guard
* function. The schema accepts any unknown value and succeeds when `is` returns
* `true`, failing with an `InvalidType` issue otherwise.
*
* Use this when the type has no type parameters. For parametric types such as
* `Option<A>` or `Array<A>`, use {@link declareConstructor} instead.
*
* **Example** (Schema for a custom `UserId` branded type)
*
* ```ts
* import { Schema } from "effect"
*
* type UserId = string & { readonly _tag: "UserId" }
*
* const isUserId = (u: unknown): u is UserId =>
*   typeof u === "string" && u.startsWith("user_")
*
* const UserId = Schema.declare<UserId>(isUserId, {
*   title: "UserId",
*   description: "A user identifier starting with 'user_'"
* })
* ```
*
* @see {@link declareConstructor} for creating schemas for parametric types.
*
* @category Constructors
* @since 4.0.0
*/
function declare(is, annotations) {
	return declareConstructor()([], () => (input, ast) => is(input) ? succeed$2(input) : fail$2(new InvalidType(ast, some(input))), annotations);
}
/**
* Creates a schema from an AST (Abstract Syntax Tree) node.
*
* This is the fundamental constructor for all schemas in the Effect Schema
* library. It takes an AST node and wraps it in a fully-typed schema that
* preserves all type information and provides the complete schema API.
*
* The `make` function is used internally to create all primitive schemas like
* `String`, `Number`, `Boolean`, etc., as well as more complex schemas. It's
* the bridge between the untyped AST representation and the strongly-typed
* schema.
*
* @category Constructors
* @since 4.0.0
*/
const make$9 = make$10;
/**
* Tests if a value is a `Schema`.
*
* @category Guards
* @since 4.0.0
*/
function isSchema(u) {
	return hasProperty(u, TypeId$17) && u[TypeId$17] === TypeId$17;
}
/**
* Creates an exact optional key schema for struct fields. Unlike `optional`,
* this creates exact optional properties (not `| undefined`) that can be
* completely omitted from the object.
*
* **Example** (Creating a struct with optional key)
*
* ```ts
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.String,
*   age: Schema.optionalKey(Schema.Number)
* })
*
* // Type: { readonly name: string; readonly age?: number }
* type Person = typeof schema["Type"]
* ```
*
* @since 4.0.0
*/
const optionalKey = /* @__PURE__ */ lambda((schema) => make$9(optionalKey$1(schema.ast), { schema }));
/**
* Marks a struct field as optional, allowing the key to be absent or
* `undefined`.
*
* explicitly set to `undefined`. Equivalent to `optionalKey(UndefinedOr(S))`.
*
* Use {@link optionalKey} instead if you want exact optional semantics (absent
* only, not `undefined`).
*
* **Example** (Optional field accepting undefined)
*
* ```ts
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.String,
*   age: Schema.optional(Schema.Number)
* })
*
* // { readonly name: string; readonly age?: number | undefined }
* type Person = typeof schema.Type
* ```
*
* @since 4.0.0
*/
const optional = /* @__PURE__ */ lambda((self) => optionalKey(UndefinedOr(self)));
/**
* Creates a schema for a single literal value (string, number, bigint, boolean, or null).
*
* **Example** (String literal)
* ```ts
* import { Schema } from "effect"
*
* const schema = Schema.Literal("hello")
* // Type: Schema.Literal<"hello">
* ```
*
* @see {@link Literals} for a schema that represents a union of literals.
* @see {@link tag} for a schema that represents a literal value that can be
* used as a discriminator field in tagged unions and has a constructor default.
* @since 4.0.0
*/
function Literal(literal) {
	const out = make$9(new Literal$1(literal), {
		literal,
		transform(to) {
			return out.pipe(decodeTo(Literal(to), {
				decode: transform$1(() => to),
				encode: transform$1(() => literal)
			}));
		}
	});
	return out;
}
/**
* Schema for the `any` type. Accepts any value without validation.
*
* @see {@link Unknown} for a safer alternative that uses `unknown`.
* @since 4.0.0
*/
const Any = /* @__PURE__ */ make$9(any);
/**
* Schema for the `unknown` type. Accepts any value without validation.
*
* @see {@link Any} for the `any` variant.
* @since 4.0.0
*/
const Unknown = /* @__PURE__ */ make$9(unknown);
/**
* Schema for the `undefined` literal. Validates that the input is strictly `undefined`.
*
* @see {@link UndefinedOr} for a union with another schema.
* @since 4.0.0
*/
const Undefined = /* @__PURE__ */ make$9(undefined_);
/**
* Schema for `string` values. Validates that the input is `typeof` `"string"`.
*
* @since 4.0.0
*/
const String$1 = /* @__PURE__ */ make$9(string);
/**
* Schema for the `void` type. Accepts `undefined` as the encoded value.
*
* @since 4.0.0
*/
const Void = /* @__PURE__ */ make$9(void_);
function makeStruct(ast, fields) {
	return make$9(ast, {
		fields,
		mapFields(f, options) {
			const fields = f(this.fields);
			return makeStruct(struct(fields, options?.unsafePreserveChecks ? this.ast.checks : void 0), fields);
		}
	});
}
/**
* Defines a struct schema from a map of field schemas.
*
* Each field value is a schema. Use {@link optionalKey} or {@link optional} to
* mark fields as optional, and {@link mutableKey} to mark them as mutable.
*
* The resulting schema's `Type` is a readonly object type with the fields'
* decoded types. The `Encoded` form mirrors the field schemas' encoded types.
*
* **Example** (Basic struct)
*
* ```ts
* import { Schema } from "effect"
*
* const Person = Schema.Struct({
*   name: Schema.String,
*   age: Schema.Number,
*   email: Schema.optionalKey(Schema.String)
* })
*
* // { readonly name: string; readonly age: number; readonly email?: string }
* type Person = typeof Person.Type
*
* const alice = Schema.decodeUnknownSync(Person)({ name: "Alice", age: 30 })
* console.log(alice)
* // { name: 'Alice', age: 30 }
* ```
*
* @category Constructors
* @since 4.0.0
*/
function Struct(fields) {
	return makeStruct(struct(fields, void 0), fields);
}
function makeTuple(ast, elements) {
	return make$9(ast, {
		elements,
		mapElements(f, options) {
			const elements = f(this.elements);
			return makeTuple(tuple(elements, options?.unsafePreserveChecks ? this.ast.checks : void 0), elements);
		}
	});
}
function makeUnion(ast, members) {
	return make$9(ast, {
		members,
		mapMembers(f, options) {
			const members = f(this.members);
			return makeUnion(union(members, this.ast.mode, options?.unsafePreserveChecks ? this.ast.checks : void 0), members);
		}
	});
}
/**
* Creates a union schema from an array of member schemas. Members are tested in
* order; the first match is returned.
*
* Optionally, specify `mode`:
* - `"anyOf"` (default) — matches if any member matches.
* - `"oneOf"` — matches if exactly one member matches.
*
* **Example** (String or number union)
*
* ```ts
* import { Schema } from "effect"
*
* const schema = Schema.Union([Schema.String, Schema.Number])
*
* Schema.decodeUnknownSync(schema)("hello") // "hello"
* Schema.decodeUnknownSync(schema)(42)       // 42
* ```
*
* @category Constructors
* @since 4.0.0
*/
function Union(members, options) {
	return makeUnion(union(members, options?.mode ?? "anyOf", void 0), members);
}
/**
* Creates a union schema from an array of literal values.
*
* **Example** (Status codes)
* ```ts
* import { Schema } from "effect"
*
* const schema = Schema.Literals(["active", "inactive", "pending"])
* // accepts "active", "inactive", or "pending"
* ```
*
* @see {@link Literal} for a schema that represents a single literal.
* @category Constructors
* @since 4.0.0
*/
function Literals(literals) {
	const members = literals.map(Literal);
	return make$9(union(members, "anyOf", void 0), {
		literals,
		members,
		mapMembers(f) {
			return Union(f(this.members));
		},
		pick(literals) {
			return Literals(literals);
		},
		transform(to) {
			return Union(members.map((member, index) => member.transform(to[index])));
		}
	});
}
/**
* Creates a union schema of `S | undefined`.
*
* @category Constructors
* @since 4.0.0
*/
const UndefinedOr = /* @__PURE__ */ lambda((self) => Union([self, Undefined]));
function decodeTo(to, transformation) {
	return (from) => {
		return make$9(decodeTo$1(from.ast, to.ast, transformation ? make$11(transformation) : passthrough()), {
			from,
			to
		});
	};
}
/**
* Attaches a constructor default value to a schema field.
*
* Constructor defaults are applied only during `make*`, not during decoding or
* encoding.
*
* **Example** (Optional field with a static default)
*
* ```ts
* import { Effect, Schema } from "effect"
*
* const MySchema = Schema.Struct({
*   name: Schema.String.pipe(
*     Schema.optionalKey,
*     Schema.withConstructorDefault(Effect.succeed("anonymous"))
*   )
* })
*
* const value = MySchema.make({})
* // value: { name: "anonymous" }
* ```
*
* @since 4.0.0
*/
function withConstructorDefault(defaultValue) {
	return (schema) => make$9(withConstructorDefault$1(schema.ast, defaultValue), { schema });
}
/**
* Combines a {@link Literal} schema with {@link withConstructorDefault}, making it ideal
* for discriminator fields in tagged unions. When constructing via `make`, the
* `_tag` field can be omitted and will be filled automatically.
*
* **Example** (Discriminated union tag)
*
* ```ts
* import { Schema } from "effect"
*
* const A = Schema.Struct({ _tag: Schema.tag("A"), value: Schema.Number })
*
* // _tag is optional in make, auto-filled to "A"
* const a = A.make({ value: 42 })
* // a: { _tag: "A", value: 42 }
* ```
*
* @see {@link tagDefaultOmit} to also omit the tag during encoding
* @see {@link TaggedStruct} for a shorthand that adds `_tag` automatically
* @since 4.0.0
*/
function tag(literal) {
	return Literal(literal).pipe(withConstructorDefault(succeed$2(literal)));
}
/**
* Creates a schema that validates values using `instanceof`.
* Decoding and encoding pass the value through unchanged.
*
* **Example** (Schema for a built-in class)
*
* ```ts
* import { Schema } from "effect"
*
* const DateSchema = Schema.instanceOf(Date)
*
* const decoded = Schema.decodeUnknownSync(DateSchema)(new Date("2024-01-01"))
* // decoded: Date
* ```
*
* @category Constructors
* @since 4.0.0
*/
function instanceOf(constructor, annotations) {
	return declare((u) => u instanceof constructor, annotations);
}
/**
* Constructs an `AST.Link` that describes how a value of type `T` encodes to and decodes from a `To` schema.
* Used when building low-level AST transformations that bridge two schema types.
*
* @since 4.0.0
*/
function link() {
	return (encodeTo, transformation) => {
		return new Link(encodeTo.ast, make$11(transformation));
	};
}
const ErrorJsonEncoded = /* @__PURE__ */ Struct({
	message: String$1,
	name: /* @__PURE__ */ optionalKey(String$1),
	stack: /* @__PURE__ */ optionalKey(String$1)
});
/**
* A schema that represents `Error` objects.
*
* The default json serializer decodes to a struct with `name` and `message`
* properties (stack is omitted for security).
*
* @category Schemas
* @since 4.0.0
*/
const Error$1 = /* @__PURE__ */ instanceOf(globalThis.Error, {
	typeConstructor: { _tag: "Error" },
	generation: {
		runtime: `Schema.Error`,
		Type: `globalThis.Error`
	},
	expected: "Error",
	toCodecJson: () => link()(ErrorJsonEncoded, errorFromErrorJsonEncoded()),
	toArbitrary: () => (fc) => fc.string().map((message) => new globalThis.Error(message))
});
globalThis.Error;
const defectTransformation = /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough$1(), /* @__PURE__ */ transform$1((u) => {
	try {
		return JSON.parse(JSON.stringify(u));
	} catch {
		return format$1(u);
	}
}));
/**
* A schema that represents defects.
*
* @category Constructors
* @since 4.0.0
*/
const Defect = /* @__PURE__ */ Union([/* @__PURE__ */ ErrorJsonEncoded.pipe(/* @__PURE__ */ decodeTo(Error$1, /* @__PURE__ */ errorFromErrorJsonEncoded())), /* @__PURE__ */ Any.pipe(/* @__PURE__ */ decodeTo(/* @__PURE__ */ Unknown.annotate({
	toCodecJson: () => link()(Any, defectTransformation),
	toArbitrary: () => (fc) => fc.json()
}), defectTransformation))]);
globalThis.RegExp;
globalThis.URL;
globalThis.File;
globalThis.FormData;
globalThis.URLSearchParams;
globalThis.Uint8Array;
const immerable = /* @__PURE__ */ globalThis.Symbol.for("immer-draftable");
function makeClass(Inherited, identifier, struct$1, annotations, proto) {
	const getClassSchema = getClassSchemaFactory(struct$1, identifier, annotations);
	const ClassTypeId = getClassTypeId(identifier);
	const out = class extends Inherited {
		constructor(...[input, options]) {
			input = input ?? {};
			const validated = struct$1.make(input, options);
			super({
				...input,
				...validated
			}, {
				...options,
				disableChecks: true
			});
		}
		static [TypeId$17] = TypeId$17;
		get [ClassTypeId]() {
			return ClassTypeId;
		}
		static [immerable] = true;
		static identifier = identifier;
		static fields = struct$1.fields;
		static get ast() {
			return getClassSchema(this).ast;
		}
		static pipe() {
			return pipeArguments(this, arguments);
		}
		static rebuild(ast) {
			return getClassSchema(this).rebuild(ast);
		}
		static make(input, options) {
			return new this(input, options);
		}
		static makeOption(input, options) {
			return makeOption(getClassSchema(this))(input ?? {}, options);
		}
		static makeEffect(input, options) {
			return mapErrorEager(makeEffect(getClassSchema(this))(input ?? {}, options), (issue) => new SchemaError(issue));
		}
		static annotate(annotations) {
			return this.rebuild(annotate(this.ast, annotations));
		}
		static annotateKey(annotations) {
			return this.rebuild(annotateKey(this.ast, annotations));
		}
		static check(...checks) {
			return this.rebuild(appendChecks(this.ast, checks));
		}
		static extend(identifier) {
			return (newFields, annotations) => {
				const fields = {
					...struct$1.fields,
					...newFields
				};
				return makeClass(this, identifier, makeStruct(struct(fields, struct$1.ast.checks, { identifier }), fields), annotations, proto);
			};
		}
		static mapFields(f, options) {
			return struct$1.mapFields(f, options);
		}
	};
	if (proto !== void 0) Object.assign(out.prototype, proto(identifier));
	return out;
}
function getClassTransformation(self) {
	return new Transformation(transform$1((input) => new self(input)), passthrough$1());
}
function getClassTypeId(identifier) {
	return `~effect/Schema/Class/${identifier}`;
}
function getClassSchemaFactory(from, identifier, annotations) {
	let memo;
	return (self) => {
		if (memo === void 0) {
			const transformation = getClassTransformation(self);
			const to = make$9(new Declaration([from.ast], () => (input, ast) => {
				return input instanceof self || hasProperty(input, getClassTypeId(identifier)) ? succeed$2(input) : fail$2(new InvalidType(ast, some(input)));
			}, {
				identifier,
				[ClassTypeId]: ([from]) => new Link(from, transformation),
				toCodec: ([from]) => new Link(from.ast, transformation),
				toArbitrary: ([from]) => () => from.map((args) => new self(args)),
				toFormatter: ([from]) => (t) => `${self.identifier}(${from(t)})`,
				"~sentinels": collectSentinels(from.ast),
				...annotations
			}));
			memo = from.pipe(decodeTo(to, transformation));
		}
		return memo;
	};
}
function isStruct(schema) {
	return isSchema(schema);
}
/**
* Creates a schema-backed error class that can be used as a typed,
* yieldable error in Effect programs. Combines {@link Class} validation with
* the `YieldableError` interface so instances can be yielded directly inside
* `Effect.gen`.
*
* **Example** (Schema-backed error)
*
* ```ts
* import { Effect, Schema } from "effect"
*
* class NotFound extends Schema.ErrorClass<NotFound>("NotFound")({
*   id: Schema.Number
* }) {}
*
* const program = Effect.gen(function*() {
*   yield* new NotFound({ id: 1 })
* })
* ```
*
* @category Constructors
* @since 4.0.0
*/
const ErrorClass = (identifier) => (schema, annotations) => {
	return makeClass(Error$3, identifier, isStruct(schema) ? schema : Struct(schema), annotations, (identifier) => ({ name: identifier }));
};
/**
* Derives a canonical JSON codec from a schema. The encoded form is `unknown`
* (any JSON-compatible value), decoded to the schema's `Type`.
*
* @category Canonical Codecs
* @since 4.0.0
*/
function toCodecJson(schema) {
	return make$9(toCodecJsonTop(schema.ast));
}
const toCodecJsonTop = /* @__PURE__ */ toCodec((ast) => {
	const out = toCodecJsonBase(ast, toCodecJsonTop);
	return out !== ast && isOptional(ast) ? optionalKeyLastLink(out) : out;
});
function toCodecJsonBase(ast, recur) {
	switch (ast._tag) {
		case "Declaration": {
			const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
			if (isFunction(getLink)) {
				const link = getLink(isDeclaration(ast) ? ast.typeParameters.map((tp) => make$10(toEncoded(tp))) : []);
				const to = recur(link.to);
				return replaceEncoding(ast, to === link.to ? [link] : [new Link(to, link.transformation)]);
			}
			return replaceEncoding(ast, [unknownToNull]);
		}
		case "Unknown":
		case "ObjectKeyword": return replaceEncoding(ast, [unknownToJson]);
		case "Undefined":
		case "Void":
		case "Literal":
		case "Number": return ast.toCodecJson();
		case "UniqueSymbol":
		case "Symbol":
		case "BigInt": return ast.toCodecStringTree();
		case "Objects":
			if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) throw new globalThis.Error("Objects property names must be strings", { cause: ast });
			return ast.recur(recur);
		case "Union": {
			const sortedTypes = jsonReorder(ast.types);
			if (sortedTypes !== ast.types) return new Union$1(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context).recur(recur);
			return ast.recur(recur);
		}
		case "Arrays":
		case "Suspend": return ast.recur(recur);
	}
	return ast;
}
function toCodecStringTree(schema, options) {
	return make$9(toCodecEnsureArray(options?.keepDeclarations === true ? serializerStringTreeKeepDeclarations(schema.ast) : serializerStringTree(schema.ast)));
}
function getStringTreePriority(ast) {
	switch (ast._tag) {
		case "Null":
		case "Boolean":
		case "Number":
		case "BigInt":
		case "Symbol":
		case "UniqueSymbol": return 0;
		default: return 1;
	}
}
const treeReorder = /* @__PURE__ */ makeReorder(getStringTreePriority);
function serializerTree(ast, recur, onMissingAnnotation) {
	switch (ast._tag) {
		case "Declaration": {
			const getLink = ast.annotations?.toCodecJson ?? ast.annotations?.toCodec;
			if (isFunction(getLink)) {
				const link = getLink(isDeclaration(ast) ? ast.typeParameters.map((tp) => make$9(recur(toEncoded(tp)))) : []);
				const to = recur(link.to);
				return replaceEncoding(ast, to === link.to ? [link] : [new Link(to, link.transformation)]);
			}
			return onMissingAnnotation(ast);
		}
		case "Null": return replaceEncoding(ast, [nullToString]);
		case "Boolean": return replaceEncoding(ast, [booleanToString]);
		case "Unknown":
		case "ObjectKeyword": return replaceEncoding(ast, [unknownToStringTree]);
		case "Enum":
		case "Number":
		case "Literal":
		case "UniqueSymbol":
		case "Symbol":
		case "BigInt": return ast.toCodecStringTree();
		case "Objects":
			if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) throw new globalThis.Error("Objects property names must be strings", { cause: ast });
			return ast.recur(recur);
		case "Union": {
			const sortedTypes = treeReorder(ast.types);
			if (sortedTypes !== ast.types) return new Union$1(sortedTypes, ast.mode, ast.annotations, ast.checks, ast.encoding, ast.context).recur(recur);
			return ast.recur(recur);
		}
		case "Arrays":
		case "Suspend": return ast.recur(recur);
	}
	return ast;
}
const nullToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Literal$1("null"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform$1(() => null), /* @__PURE__ */ transform$1(() => "null")));
const booleanToString = /* @__PURE__ */ new Link(/* @__PURE__ */ new Union$1([/* @__PURE__ */ new Literal$1("true"), /* @__PURE__ */ new Literal$1("false")], "anyOf"), /* @__PURE__ */ new Transformation(/* @__PURE__ */ transform$1((s) => s === "true"), /* @__PURE__ */ String$3()));
const serializerStringTree = /* @__PURE__ */ toCodec((ast) => {
	const out = serializerTree(ast, serializerStringTree, (ast) => replaceEncoding(ast, [unknownToUndefined]));
	if (out !== ast && isOptional(ast)) return optionalKeyLastLink(out);
	return out;
});
const unknownToUndefined = /* @__PURE__ */ new Link(undefined_, /* @__PURE__ */ new Transformation(/* @__PURE__ */ passthrough$1(), /* @__PURE__ */ transform$1(() => void 0)));
const serializerStringTreeKeepDeclarations = /* @__PURE__ */ toCodec((ast) => {
	const out = serializerTree(ast, serializerStringTreeKeepDeclarations, identity);
	if (out !== ast && isOptional(ast)) return optionalKeyLastLink(out);
	return out;
});
const SERIALIZER_ENSURE_ARRAY = "~effect/Schema/SERIALIZER_ENSURE_ARRAY";
const toCodecEnsureArray = /* @__PURE__ */ toCodec((ast) => {
	if (isUnion(ast) && ast.annotations?.[SERIALIZER_ENSURE_ARRAY]) return ast;
	const out = onSerializerEnsureArray(ast);
	if (isArrays(out)) {
		const ensure = new Union$1([out, decodeTo$1(string, out, new Transformation(split(), passthrough$1()))], "anyOf", { [SERIALIZER_ENSURE_ARRAY]: true });
		return isOptional(ast) ? optionalKey$1(ensure) : ensure;
	}
	return out;
});
function onSerializerEnsureArray(ast) {
	switch (ast._tag) {
		default: return ast;
		case "Declaration":
		case "Arrays":
		case "Objects":
		case "Union":
		case "Suspend": return ast.recur(toCodecEnsureArray);
	}
}
const bigint1024 = /* @__PURE__ */ BigInt(1024);
bigint1024 * bigint1024 * bigint1024 * bigint1024 * bigint1024;
Service()("effect/platform/FileSystem/WatchBackend");
({ ...PipeInspectableProto });
const fromInputNested = (input) => {
	const entries = typeof input[Symbol.iterator] === "function" ? fromIterable$2(input) : Object.entries(input);
	const out = [];
	for (const [key, value] of entries) if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) if (value[i] !== void 0) out.push([key, String(value[i])]);
	} else if (typeof value === "object") {
		const nested = fromInputNested(value);
		for (const [k, v] of nested) out.push([[key, ...typeof k === "string" ? [k] : k], v]);
	} else if (value !== void 0) out.push([key, String(value)]);
	return out;
};
TaggedError("UrlParamsError");
TaggedError("HttpBodyError");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/Headers.js
/**
* @since 4.0.0
*/
/**
* This is a symbol to allow direct access of keys without conflicts.
*
* @since 4.0.0
* @category type ids
*/
const TypeId$11 = /* @__PURE__ */ Symbol.for("~effect/http/Headers");
Object.defineProperties(/* @__PURE__ */ Object.create(null), {
	[TypeId$11]: { value: TypeId$11 },
	[symbolRedactable]: { value(context) {
		return redact(this, get$1(context, CurrentRedactedNames));
	} },
	toJSON: { value() {
		return redact$1(this);
	} },
	[symbol$2]: { value(that) {
		return Equivalence(this, that);
	} },
	[symbol$3]: { value() {
		return structure(this);
	} },
	toString: { value: BaseProto.toString },
	[NodeInspectSymbol]: { value: BaseProto[NodeInspectSymbol] }
});
/**
* @since 4.0.0
* @category Equivalence
*/
const Equivalence = /* @__PURE__ */ makeEquivalence$2(/* @__PURE__ */ strictEqual());
/**
* @since 4.0.0
* @category combinators
*/
const redact = /* @__PURE__ */ dual(2, (self, key) => {
	const out = { ...self };
	const modify = (key) => {
		if (typeof key === "string") {
			const k = key.toLowerCase();
			if (k in self) out[k] = make$13(self[k]);
		} else for (const name in self) if (key.test(name)) out[name] = make$13(self[name]);
	};
	if (Array.isArray(key)) for (let i = 0; i < key.length; i++) modify(key[i]);
	else modify(key);
	return out;
});
/**
* @since 4.0.0
* @category fiber refs
*/
const CurrentRedactedNames = /* @__PURE__ */ Reference("effect/Headers/CurrentRedactedNames", { defaultValue: () => [
	"authorization",
	"cookie",
	"set-cookie",
	"x-api-key"
] });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/Cookies.js
/**
* @since 4.0.0
*/
const TypeId$10 = "~effect/http/Cookies";
TaggedError("CookieError");
({
	[TypeId$10]: TypeId$10,
	...BaseProto,
	toJSON() {
		return {
			_id: "effect/Cookies",
			cookies: map$4(this.cookies, (cookie) => cookie.toJSON())
		};
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
});
({ ...BaseProto });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/HttpClientError.js
/**
* @since 4.0.0
*/
const TypeId$9 = "~effect/http/HttpClientError";
TaggedError("HttpClientError");
TaggedError("TransportError");
TaggedError("EncodeError");
TaggedError("InvalidUrlError");
TaggedError("StatusCodeError");
TaggedError("DecodeError");
TaggedError("EmptyBodyError");
ErrorClass(TypeId$9)({
	_tag: /* @__PURE__ */ tag("HttpError"),
	kind: /* @__PURE__ */ Literals([
		"EncodeError",
		"DecodeError",
		"TransportError",
		"InvalidUrlError",
		"StatusCodeError",
		"EmptyBodyError"
	]),
	cause: /* @__PURE__ */ optional(Defect)
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/HttpMethod.js
/**
* @since 4.0.0
*/
/**
* @since 4.0.0
*/
const hasBody = (method) => method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && method !== "TRACE";
({ ...PipeInspectableProto });
TaggedError("HttpServerError");
TaggedError("RequestParseError");
TaggedError("RouteNotFound");
TaggedError("InternalError");
TaggedError("ResponseError");
TaggedError("ServeError");
Service()("effect/http/HttpServerError/ClientAbort");
var State$1;
(function(State) {
	State[State["key"] = 0] = "key";
	State[State["whitespace"] = 1] = "whitespace";
	State[State["value"] = 2] = "value";
})(State$1 || (State$1 = {}));
//#endregion
//#region ../../../node_modules/.bun/multipasta@0.2.7/node_modules/multipasta/dist/esm/internal/multipart.js
var State;
(function(State) {
	State[State["headers"] = 0] = "headers";
	State[State["body"] = 1] = "body";
})(State || (State = {}));
TaggedError("MultipartError");
/**
* @since 4.0.0
* @category context
*/
const HttpServerRequest = /* @__PURE__ */ Service("effect/http/HttpServerRequest");
Service()("effect/http/ParsedSearchParams");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/HttpMiddleware.js
const loggerDisabledRequests = /* @__PURE__ */ new WeakSet();
/**
* @since 4.0.0
* @category Logger
*/
const withLoggerDisabled = (self) => withFiber((fiber) => {
	const request = getUnsafe$1(fiber.context, HttpServerRequest);
	loggerDisabledRequests.add(request.source);
	return self;
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/http/HttpRouter.js
/**
* @since 4.0.0
*/
/**
* @since 4.0.0
* @category HttpRouter
*/
const HttpRouter = /* @__PURE__ */ Service("effect/http/HttpRouter");
Service()("effect/http/HttpRouter/RouteContext");
const removeTrailingSlash = (path) => path.endsWith("/") ? path.slice(0, -1) : path;
/**
* @since 4.0.0
* @category PathInput
*/
const prefixPath = /* @__PURE__ */ dual(2, (self, prefix) => {
	prefix = removeTrailingSlash(prefix);
	if (self === "*") return `${prefix}/*`;
	else if (self === "/") return prefix;
	return prefix + self;
});
const MiddlewareTypeId = "~effect/http/HttpRouter/Middleware";
/**
* Create a middleware layer that can be used to modify requests and responses.
*
* By default, the middleware only affects the routes that it is provided to.
*
* If you want to create a middleware that applies globally to all routes, pass
* the `global` option as `true`.
*
* ```ts
* import { Effect } from "effect"
* import * as Layer from "effect/Layer"
* import * as Context from "effect/Context"
* import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware"
* import * as HttpRouter from "effect/unstable/http/HttpRouter"
* import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
*
* // Here we are defining a CORS middleware
* const CorsMiddleware = HttpRouter.middleware(HttpMiddleware.cors()).layer
* // You can also use HttpRouter.cors() to create a CORS middleware
*
* class CurrentSession extends Context.Service<CurrentSession, {
*   readonly token: string
* }>()("CurrentSession") {}
*
* // You can create middleware that provides a service to the HTTP requests.
* const SessionMiddleware = HttpRouter.middleware<{
*   provides: CurrentSession
* }>()(
*   Effect.gen(function*() {
*     yield* Effect.log("SessionMiddleware initialized")
*
*     return (httpEffect) =>
*       Effect.provideService(httpEffect, CurrentSession, {
*         token: "dummy-token"
*       })
*   })
* ).layer
*
* Effect.gen(function*() {
*   const router = yield* HttpRouter.HttpRouter
*   yield* router.add(
*     "GET",
*     "/hello",
*     Effect.gen(function*() {
*       // Requests can now access the current session
*       const session = yield* CurrentSession
*       return HttpServerResponse.text(
*         `Hello, World! Your token is ${session.token}`
*       )
*     })
*   )
* }).pipe(
*   Layer.effectDiscard,
*   // Provide the SessionMiddleware & CorsMiddleware to some routes
*   Layer.provide([SessionMiddleware, CorsMiddleware])
* )
* ```
*
* @since 4.0.0
* @category Middleware
*/
const middleware = function() {
	if (arguments.length === 0) return makeMiddleware;
	return makeMiddleware(arguments[0], arguments[1]);
};
const makeMiddleware = (middleware, options) => options?.global ? effectDiscard(gen(function* () {
	const router = yield* HttpRouter;
	const fn = isEffect(middleware) ? yield* middleware : middleware;
	yield* router.addGlobalMiddleware(fn);
})) : new MiddlewareImpl(isEffect(middleware) ? effectContext(map$1(middleware, (fn) => makeUnsafe$5(new Map([[fnContextKey, fn]])))) : succeedContext(makeUnsafe$5(new Map([[fnContextKey, middleware]]))));
let middlewareId = 0;
const fnContextKey = "effect/http/HttpRouter/MiddlewareFn";
var MiddlewareImpl = class MiddlewareImpl {
	[MiddlewareTypeId] = {};
	layerFn;
	dependencies;
	constructor(layerFn, dependencies) {
		this.layerFn = layerFn;
		this.dependencies = dependencies;
		const contextKey = `effect/http/HttpRouter/Middleware-${++middlewareId}`;
		this.layer = effectContext(gen({ self: this }, function* () {
			const context$2 = yield* context();
			const stack = [context$2.mapUnsafe.get(fnContextKey)];
			if (this.dependencies) {
				const memoMap = yield* CurrentMemoMap;
				const scope = get$1(context$2, Scope);
				const depsContext = yield* buildWithMemoMap(this.dependencies, memoMap, scope);
				stack.push(...getMiddleware(depsContext));
			}
			return makeUnsafe$5(new Map([[contextKey, stack]]));
		})).pipe(provide(this.layerFn));
	}
	layer;
	combine(other) {
		return new MiddlewareImpl(this.layerFn, this.dependencies ? provideMerge(this.dependencies, other.layer) : other.layer);
	}
};
const middlewareCache = /* @__PURE__ */ new WeakMap();
const getMiddleware = (context) => {
	let arr = middlewareCache.get(context);
	if (arr) return arr;
	const topLevel = empty$6();
	let maxLength = 0;
	for (const [key, value] of context.mapUnsafe) if (key.startsWith("effect/http/HttpRouter/Middleware-")) {
		topLevel.push(value);
		if (value.length > maxLength) maxLength = value.length;
	}
	if (topLevel.length === 0) arr = [];
	else {
		const middleware = /* @__PURE__ */ new Set();
		for (let i = maxLength - 1; i >= 0; i--) for (const arr of topLevel) if (i < arr.length) middleware.add(arr[i]);
		arr = fromIterable$2(middleware).reverse();
	}
	middlewareCache.set(context, arr);
	return arr;
};
middleware(withLoggerDisabled).layer;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/HttpApiSchema.js
const statusCodeByLiteral = {
	Continue: 100,
	SwitchingProtocols: 101,
	Processing: 102,
	EarlyHints: 103,
	OK: 200,
	Ok: 200,
	Created: 201,
	Accepted: 202,
	NonAuthoritativeInformation: 203,
	NoContent: 204,
	ResetContent: 205,
	PartialContent: 206,
	MultiStatus: 207,
	AlreadyReported: 208,
	ImUsed: 226,
	MultipleChoices: 300,
	MovedPermanently: 301,
	Found: 302,
	SeeOther: 303,
	NotModified: 304,
	TemporaryRedirect: 307,
	PermanentRedirect: 308,
	BadRequest: 400,
	Unauthorized: 401,
	PaymentRequired: 402,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405,
	NotAcceptable: 406,
	ProxyAuthenticationRequired: 407,
	RequestTimeout: 408,
	Conflict: 409,
	Gone: 410,
	LengthRequired: 411,
	PreconditionFailed: 412,
	PayloadTooLarge: 413,
	UriTooLong: 414,
	UnsupportedMediaType: 415,
	RangeNotSatisfiable: 416,
	ExpectationFailed: 417,
	ImATeapot: 418,
	MisdirectedRequest: 421,
	UnprocessableEntity: 422,
	Locked: 423,
	FailedDependency: 424,
	TooEarly: 425,
	UpgradeRequired: 426,
	PreconditionRequired: 428,
	TooManyRequests: 429,
	RequestHeaderFieldsTooLarge: 431,
	UnavailableForLegalReasons: 451,
	InternalServerError: 500,
	NotImplemented: 501,
	BadGateway: 502,
	ServiceUnavailable: 503,
	GatewayTimeout: 504,
	HttpVersionNotSupported: 505,
	VariantAlsoNegotiates: 506,
	InsufficientStorage: 507,
	LoopDetected: 508,
	NotExtended: 510,
	NetworkAuthenticationRequired: 511
};
function status(code) {
	const statusCode = typeof code === "string" ? statusCodeByLiteral[code] : code;
	return (self) => {
		return self.annotate({ httpApiStatus: statusCode });
	};
}
/**
* Creates a void schema with the given HTTP status code.
* This is used to represent empty responses with a specific status code.
*
* @see {@link asEmpty} for creating a no content response that can be decoded into a meaningful value on the client side.
*
* @category Empty
* @since 4.0.0
*/
const Empty = (code) => Void.pipe(status(code));
/**
* A void schema with the HTTP status code 204.
* This is used to represent empty responses with the status code 204.
*
* @since 4.0.0
* @category Empty
*/
const NoContent = /* @__PURE__ */ Empty(204);
function asNonMultipartEncoding(self, options) {
	return self.annotate({ "~httpApiEncoding": {
		_tag: options._tag,
		contentType: options.contentType ?? defaultContentType(options._tag)
	} });
}
function defaultContentType(_tag) {
	switch (_tag) {
		case "Multipart": return "multipart/form-data";
		case "Json": return "application/json";
		case "FormUrlEncoded": return "application/x-www-form-urlencoded";
		case "Uint8Array": return "application/octet-stream";
		case "Text": return "text/plain";
	}
}
/**
* Marks a schema as a URL params payload / response.
*
* The schema encoded side must be a record of strings.
*
* @category Encoding
* @since 4.0.0
*/
function asFormUrlEncoded(options) {
	return (self) => asNonMultipartEncoding(self, {
		_tag: "FormUrlEncoded",
		...options
	});
}
/**
* @since 4.0.0
*/
const isNoContent = (ast) => {
	if (isVoid(ast)) return true;
	if (isVoid(toEncoded(ast))) return true;
	const target = ast.encoding?.[0].to;
	if (target === void 0) return false;
	return isVoid(target);
};
const resolveHttpApiEncoding = /* @__PURE__ */ resolveAt("~httpApiEncoding");
const resolveHttpApiStatus = /* @__PURE__ */ resolveAt("httpApiStatus");
const defaultJsonEncoding = {
	_tag: "Json",
	contentType: "application/json"
};
const defaultUrlEncodedEncoding = {
	_tag: "FormUrlEncoded",
	contentType: "application/x-www-form-urlencoded"
};
function getEncoding(ast) {
	return resolveHttpApiEncoding(ast) ?? defaultJsonEncoding;
}
/** @internal */
function getPayloadEncoding(ast, method) {
	const encoding = resolveHttpApiEncoding(ast);
	if (encoding) return encoding;
	return hasBody(method) ? defaultJsonEncoding : defaultUrlEncodedEncoding;
}
/** @internal */
function getResponseEncoding(ast) {
	const out = getEncoding(ast);
	if (out._tag === "Multipart") throw new Error("Multipart is not supported in response");
	return out;
}
/** @internal */
function getStatusSuccess(self) {
	return resolveHttpApiStatus(self) ?? 200;
}
/** @internal */
function getStatusError(self) {
	return resolveHttpApiStatus(self) ?? 500;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/HttpApiEndpoint.js
/**
* @since 4.0.0
*/
const TypeId$2 = "~effect/httpapi/HttpApiEndpoint";
/** @internal */
function getSuccessSchemas(endpoint) {
	const schemas = Array.from(endpoint.success);
	return isArrayNonEmpty(schemas) ? schemas : [NoContent];
}
/** @internal */
function getErrorSchemas(endpoint) {
	const schemas = new Set(endpoint.error);
	for (const middleware of endpoint.middlewares) {
		const key = middleware;
		for (const schema of key.error) schemas.add(schema);
	}
	return Array.from(schemas);
}
const Proto$2 = {
	[TypeId$2]: TypeId$2,
	pipe() {
		return pipeArguments(this, arguments);
	},
	prefix(prefix) {
		return makeProto$2({
			...this,
			path: prefixPath(this.path, prefix)
		});
	},
	middleware(middleware) {
		return makeProto$2({
			...this,
			middlewares: new Set([...this.middlewares, middleware])
		});
	},
	annotate(key, value) {
		return makeProto$2({
			...this,
			annotations: add(this.annotations, key, value)
		});
	},
	annotateMerge(annotations) {
		return makeProto$2({
			...this,
			annotations: merge$1(this.annotations, annotations)
		});
	}
};
function makeProto$2(options) {
	return Object.assign(Object.create(Proto$2), options);
}
/**
* @since 4.0.0
* @category constructors
*/
const make$2 = (method) => (name, path, options) => {
	const disableCodecs = options?.disableCodecs ?? false;
	const transformStringTree = disableCodecs ? identity : toCodecStringTree;
	return makeProto$2({
		name,
		path,
		method,
		params: ensureStruct(options?.params, transformStringTree),
		query: ensureStruct(options?.query, transformStringTree),
		headers: ensureStruct(options?.headers, transformStringTree),
		payload: getPayload(options?.payload, method, disableCodecs),
		success: getResponse(options?.success, disableCodecs),
		error: getResponse(options?.error, disableCodecs),
		annotations: empty$8(),
		middlewares: /* @__PURE__ */ new Set()
	});
};
function ensureStruct(params, transform) {
	if (params === void 0) return void 0;
	if (isSchema(params)) return transform(params);
	return transform(Struct(params));
}
function getPayload(payload, method, disableCodecs) {
	const result = /* @__PURE__ */ new Map();
	if (payload === void 0) return result;
	const schemas = Array.isArray(payload) ? payload : isSchema(payload) ? [payload] : [Struct(payload).pipe(asFormUrlEncoded())];
	const transform = disableCodecs ? identity : transformPayload;
	for (const schema of schemas) {
		const encoding = getPayloadEncoding(schema.ast, method);
		const existing = result.get(encoding.contentType);
		if (existing) {
			if (existing.encoding._tag !== encoding._tag) throw new Error(`Multiple payload encodings for content-type: ${encoding.contentType}`);
			if (existing.encoding._tag === "Multipart") throw new Error(`Multiple multipart payloads for content-type: ${encoding.contentType}`);
			existing.schemas.push(transform(schema, method));
		} else result.set(encoding.contentType, {
			encoding,
			schemas: [transform(schema, method)]
		});
	}
	return result;
}
function getResponse(success, disableCodecs) {
	if (success === void 0) return /* @__PURE__ */ new Set();
	const arr = ensure(success);
	return new Set(disableCodecs ? arr : arr.map(transformResponse));
}
function transformResponse(schema) {
	switch (getResponseEncoding(schema.ast)._tag) {
		case "Json": return toCodecJson(schema);
		case "FormUrlEncoded": return toCodecStringTree(schema);
		case "Text":
		case "Uint8Array": return schema;
	}
}
function transformPayload(schema, method) {
	switch (getPayloadEncoding(schema.ast, method)._tag) {
		case "Json": return toCodecJson(schema);
		case "FormUrlEncoded": return toCodecStringTree(schema);
		case "Text":
		case "Uint8Array":
		case "Multipart": return schema;
	}
}
/**
* @since 4.0.0
* @category constructors
*/
const get = /* @__PURE__ */ make$2("GET");
/**
* @since 4.0.0
* @category constructors
*/
const post = /* @__PURE__ */ make$2("POST");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/HttpApi.js
const TypeId$1 = "~effect/httpapi/HttpApi";
const Proto$1 = {
	[TypeId$1]: TypeId$1,
	pipe() {
		return pipeArguments(this, arguments);
	},
	add(...toAdd) {
		const groups = { ...this.groups };
		for (const group of toAdd) groups[group.identifier] = group;
		return makeProto$1({
			identifier: this.identifier,
			groups,
			annotations: this.annotations
		});
	},
	addHttpApi(api) {
		const newGroups = { ...this.groups };
		for (const key in api.groups) {
			const newGroup = api.groups[key];
			newGroup.annotations = merge$1(api.annotations, newGroup.annotations);
			newGroups[key] = newGroup;
		}
		return makeProto$1({
			identifier: this.identifier,
			groups: newGroups,
			annotations: this.annotations
		});
	},
	prefix(prefix) {
		return makeProto$1({
			identifier: this.identifier,
			groups: map$4(this.groups, (group) => group.prefix(prefix)),
			annotations: this.annotations
		});
	},
	middleware(tag) {
		return makeProto$1({
			identifier: this.identifier,
			groups: map$4(this.groups, (group) => group.middleware(tag)),
			annotations: this.annotations
		});
	},
	annotate(key, value) {
		return makeProto$1({
			identifier: this.identifier,
			groups: this.groups,
			annotations: add(this.annotations, key, value)
		});
	},
	annotateMerge(annotations) {
		return makeProto$1({
			identifier: this.identifier,
			groups: this.groups,
			annotations: merge$1(this.annotations, annotations)
		});
	}
};
const makeProto$1 = (options) => {
	function HttpApi() {}
	Object.setPrototypeOf(HttpApi, Proto$1);
	HttpApi.groups = options.groups;
	HttpApi.annotations = options.annotations;
	return HttpApi;
};
/**
* An `HttpApi` is a collection of `HttpApiEndpoint`s. You can use an `HttpApi` to
* represent a portion of your domain.
*
* You can then use `HttpApiBuilder.layer(api)` to implement the endpoints of the
* `HttpApi`.
*
* @since 4.0.0
* @category constructors
*/
const make$1 = (identifier) => makeProto$1({
	identifier,
	groups: /* @__PURE__ */ new Map(),
	annotations: empty$8()
});
/**
* @since 4.0.0
* @category Reflection
*/
const reflect = (self, options) => {
	const groups = Object.values(self.groups);
	for (const group of groups) {
		const groupAnnotations = merge$1(self.annotations, group.annotations);
		options.onGroup({
			group,
			mergedAnnotations: groupAnnotations
		});
		const endpoints = Object.values(group.endpoints);
		for (const endpoint of endpoints) {
			if (options.predicate && !options.predicate({
				endpoint,
				group
			})) continue;
			options.onEndpoint({
				group,
				endpoint,
				middleware: endpoint.middlewares,
				mergedAnnotations: merge$1(groupAnnotations, endpoint.annotations),
				successes: extractResponseContent(getSuccessSchemas(endpoint), getStatusSuccess),
				errors: extractResponseContent(getErrorSchemas(endpoint), getStatusError)
			});
		}
	}
};
const extractResponseContent = (schemas, getStatus) => {
	const map = /* @__PURE__ */ new Map();
	schemas.forEach(add);
	return map;
	function add(schema) {
		const ast = schema.ast;
		const status = getStatus(ast);
		const schemas = map.get(status);
		if (schemas === void 0) map.set(status, [schema]);
		else schemas.push(schema);
	}
};
/**
* Adds additional schemas to components/schemas.
* The provided schemas must have a `identifier` annotation.
*
* @since 4.0.0
* @category tags
*/
var AdditionalSchemas = class extends Service()("effect/httpapi/HttpApi/AdditionalSchemas") {};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/HttpApiMiddleware.js
const SecurityTypeId = "~effect/httpapi/HttpApiMiddleware/Security";
/**
* @since 4.0.0
* @category guards
*/
const isSecurity = (u) => hasProperty(u, SecurityTypeId);
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/SchemaRepresentation.js
const toJsonAnnotationsBlacklist = /* @__PURE__ */ new Set([
	...fromASTBlacklist,
	"expected",
	"contentMediaType",
	"contentSchema"
]);
/**
* Converts one or more Schema ASTs into a {@link MultiDocument}.
*
* - Use when you have multiple schemas that may share references.
* - Pure function; does not mutate the input ASTs.
* - All schemas share a single `references` map.
*
* @see {@link MultiDocument}
* @see {@link fromAST}
*
* @since 4.0.0
*/
const fromASTs = fromASTs$1;
/**
* Converts a {@link MultiDocument} to a Draft 2020-12 JSON Schema
* multi-document.
*
* - Use when you have multiple schemas sharing references.
* - Pure function; does not mutate the input.
*
* @see {@link MultiDocument}
* @see {@link toJsonSchemaDocument}
* @see {@link fromJsonSchemaMultiDocument}
*
* @since 4.0.0
*/
const toJsonSchemaMultiDocument = toJsonSchemaMultiDocument$1;
[...toJsonAnnotationsBlacklist];
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/OpenApi.js
/**
* @since 4.0.0
*/
/**
* @since 4.0.0
* @category annotations
*/
var Identifier = class extends Service()("effect/httpapi/OpenApi/Identifier") {};
/**
* @since 4.0.0
* @category annotations
*/
var Title = class extends Service()("effect/httpapi/OpenApi/Title") {};
/**
* @since 4.0.0
* @category annotations
*/
var Version = class extends Service()("effect/httpapi/OpenApi/Version") {};
/**
* @since 4.0.0
* @category annotations
*/
var Description = class extends Service()("effect/httpapi/OpenApi/Description") {};
/**
* @since 4.0.0
* @category annotations
*/
var License = class extends Service()("effect/httpapi/OpenApi/License") {};
/**
* @since 4.0.0
* @category annotations
*/
var ExternalDocs = class extends Service()("effect/httpapi/OpenApi/ExternalDocs") {};
/**
* @since 4.0.0
* @category annotations
*/
var Servers = class extends Service()("effect/httpapi/OpenApi/Servers") {};
/**
* @since 4.0.0
* @category annotations
*/
var Format = class extends Service()("effect/httpapi/OpenApi/Format") {};
/**
* @since 4.0.0
* @category annotations
*/
var Summary = class extends Service()("effect/httpapi/OpenApi/Summary") {};
/**
* @since 4.0.0
* @category annotations
*/
var Deprecated = class extends Service()("effect/httpapi/OpenApi/Deprecated") {};
/**
* @since 4.0.0
* @category annotations
*/
var Override = class extends Service()("effect/httpapi/OpenApi/Override") {};
/**
* @since 4.0.0
* @category annotations
*/
const Exclude = /* @__PURE__ */ Reference("effect/httpapi/OpenApi/Exclude", { defaultValue: constFalse });
/**
* Transforms the generated OpenAPI specification
*
* @since 4.0.0
* @category annotations
*/
var Transform = class extends Service()("effect/httpapi/OpenApi/Transform") {};
const servicesPartial = (tags) => {
	const entries = Object.entries(tags);
	return (options) => {
		let context = empty$8();
		for (const [key, tag] of entries) if (options[key] !== void 0) context = add(context, tag, options[key]);
		return context;
	};
};
/**
* @since 4.0.0
* @category annotations
*/
const annotations = /* @__PURE__ */ servicesPartial({
	identifier: Identifier,
	title: Title,
	version: Version,
	description: Description,
	license: License,
	summary: Summary,
	deprecated: Deprecated,
	externalDocs: ExternalDocs,
	servers: Servers,
	format: Format,
	override: Override,
	exclude: Exclude,
	transform: Transform
});
const apiCache = /* @__PURE__ */ new WeakMap();
/**
* This function checks if a given tag exists within the provided context. If
* the tag is present, it retrieves the associated value and applies the given
* callback function to it. If the tag is not found, the function does nothing.
*/
function processAnnotation(ctx, annotation, f) {
	const o = getOption(ctx, annotation);
	if (isSome(o)) f(o.value);
}
/**
* Converts an `HttpApi` instance into an OpenAPI Specification object.
*
* **Details**
*
* This function takes an `HttpApi` instance, which defines a structured API,
* and generates an OpenAPI Specification (`OpenAPISpec`). The resulting spec
* adheres to the OpenAPI 3.1.0 standard and includes detailed metadata such as
* paths, operations, security schemes, and components. The function processes
* the API's annotations, middleware, groups, and endpoints to build a complete
* and accurate representation of the API in OpenAPI format.
*
* The function also deduplicates schemas, applies transformations, and
* integrates annotations like descriptions, summaries, external documentation,
* and overrides. Cached results are used for better performance when the same
* `HttpApi` instance is processed multiple times.
*
* @category constructors
* @since 4.0.0
*/
function fromApi(api) {
	const cached = apiCache.get(api);
	if (cached !== void 0) return cached;
	let spec = {
		openapi: "3.1.0",
		info: {
			title: "Api",
			version: "0.0.1"
		},
		paths: {},
		components: {
			schemas: {},
			securitySchemes: {}
		},
		security: [],
		tags: []
	};
	const pathOps = [];
	processAnnotation(api.annotations, Title, (title) => {
		spec.info.title = title;
	});
	processAnnotation(api.annotations, Version, (version) => {
		spec.info.version = version;
	});
	processAnnotation(api.annotations, Description, (description) => {
		spec.info.description = description;
	});
	processAnnotation(api.annotations, License, (license) => {
		spec.info.license = license;
	});
	processAnnotation(api.annotations, Summary, (summary) => {
		spec.info.summary = summary;
	});
	processAnnotation(api.annotations, Servers, (servers) => {
		spec.servers = [...servers];
	});
	reflect(api, {
		onGroup({ group }) {
			if (get$1(group.annotations, Exclude)) return;
			let tag = { name: getOrElse(group.annotations, Title, () => group.identifier) };
			processAnnotation(group.annotations, Description, (description) => {
				tag.description = description;
			});
			processAnnotation(group.annotations, ExternalDocs, (externalDocs) => {
				tag.externalDocs = externalDocs;
			});
			processAnnotation(group.annotations, Override, (override) => {
				Object.assign(tag, override);
			});
			processAnnotation(group.annotations, Transform, (transformFn) => {
				tag = transformFn(tag);
			});
			spec.tags.push(tag);
		},
		onEndpoint({ endpoint, group, mergedAnnotations, middleware }) {
			if (get$1(mergedAnnotations, Exclude)) return;
			let op = {
				tags: [getOrElse(group.annotations, Title, () => group.identifier)],
				operationId: getOrElse(endpoint.annotations, Identifier, () => group.topLevel ? endpoint.name : `${group.identifier}.${endpoint.name}`),
				parameters: [],
				security: [],
				responses: {}
			};
			const path = endpoint.path.replace(/:(\w+)\??/g, "{$1}");
			const method = endpoint.method.toLowerCase();
			function processRequestBodies(payloadMap) {
				if (payloadMap.size > 0) {
					const c = {};
					let hasContent = false;
					payloadMap.forEach(({ encoding, schemas }, contentType) => {
						const filtered = schemas.filter((s) => !isNoContent(s.ast));
						if (filtered.length === 0) return;
						hasContent = true;
						const asts = filtered.map(getAST);
						const ast = asts.length === 1 ? asts[0] : new Union$1(asts, "anyOf");
						pathOps.push({
							_tag: "schema",
							ast: toEncodingAST(ast, encoding._tag),
							path: [
								"paths",
								path,
								method,
								"requestBody",
								"content",
								contentType,
								"schema"
							]
						});
						c[contentType] = { schema: {} };
					});
					if (hasContent) op.requestBody = {
						content: c,
						required: true
					};
				}
			}
			function processResponseBodies(bodies, defaultDescription) {
				for (const [status, { content, descriptions }] of bodies) {
					const description = descriptions.size > 0 ? Array.from(descriptions).join(" | ") : defaultDescription();
					op.responses[status] = { description };
					if (content !== void 0) content.forEach((map, encoding) => {
						map.forEach((schemas, contentType) => {
							const asts = Array.from(schemas, getAST);
							const ast = asts.length === 1 ? asts[0] : new Union$1(asts, "anyOf");
							pathOps.push({
								_tag: "schema",
								ast: toEncodingAST(ast, encoding),
								path: [
									"paths",
									path,
									method,
									"responses",
									String(status),
									"content",
									contentType,
									"schema"
								]
							});
							op.responses[status].content ??= {};
							op.responses[status].content[contentType] = { schema: {} };
						});
					});
				}
			}
			function processParameters(schema, i) {
				if (schema) {
					const ast = getLastEncoding(schema.ast);
					if (isObjects(ast)) for (const ps of ast.propertySignatures) {
						op.parameters.push({
							name: String(ps.name),
							in: i,
							schema: {},
							required: i === "path" || !isOptional(ps.type)
						});
						pathOps.push({
							_tag: "parameter",
							ast: ps.type,
							path: [
								"paths",
								path,
								method,
								"parameters",
								String(op.parameters.length - 1),
								"schema"
							]
						});
					}
				}
			}
			processAnnotation(endpoint.annotations, Description, (description) => {
				op.description = description;
			});
			processAnnotation(endpoint.annotations, Summary, (summary) => {
				op.summary = summary;
			});
			processAnnotation(endpoint.annotations, Deprecated, (deprecated) => {
				op.deprecated = deprecated;
			});
			processAnnotation(endpoint.annotations, ExternalDocs, (externalDocs) => {
				op.externalDocs = externalDocs;
			});
			middleware.forEach((middleware) => {
				if (!isSecurity(middleware)) return;
				for (const [name, security] of Object.entries(middleware.security)) {
					processHttpApiSecurity(name, security);
					op.security.push({ [name]: [] });
				}
			});
			function processHttpApiSecurity(name, security) {
				if (spec.components.securitySchemes[name] !== void 0) return;
				spec.components.securitySchemes[name] = makeSecurityScheme(security);
			}
			const hasBody$1 = hasBody(endpoint.method);
			if (hasBody$1) processRequestBodies(endpoint.payload);
			processParameters(endpoint.params, "path");
			if (!hasBody$1 && endpoint.payload.size === 1) {
				const entry = endpoint.payload.values().next().value;
				processParameters(entry.schemas[0], "query");
			}
			processParameters(endpoint.headers, "header");
			processParameters(endpoint.query, "query");
			processResponseBodies(extractResponseBodies(getSuccessSchemas(endpoint), getStatusSuccess, resolveDescriptionOrIdentifier), () => "Success");
			processResponseBodies(extractResponseBodies(getErrorSchemas(endpoint), getStatusError, resolveDescriptionOrIdentifier), () => "Error");
			if (!spec.paths[path]) spec.paths[path] = {};
			processAnnotation(endpoint.annotations, Override, (override) => {
				Object.assign(op, override);
			});
			processAnnotation(endpoint.annotations, Transform, (transformFn) => {
				op = transformFn(op);
			});
			spec.paths[path][method] = op;
		}
	});
	processAnnotation(api.annotations, AdditionalSchemas, (componentSchemas) => {
		componentSchemas.forEach((componentSchema) => {
			const identifier = resolveIdentifier(componentSchema.ast);
			if (identifier !== void 0) {
				if (identifier in spec.components.schemas) throw new globalThis.Error(`Duplicate component schema identifier: ${identifier}`);
				spec.components.schemas[identifier] = {};
				pathOps.push({
					_tag: "schema",
					ast: componentSchema.ast,
					path: [
						"components",
						"schemas",
						identifier
					]
				});
			}
		});
	});
	function escapePath(path) {
		return "/" + path.map(escapeToken).join("/");
	}
	if (isArrayNonEmpty(pathOps)) {
		const jsonSchemaMultiDocument = toMultiDocumentOpenApi3_1(toJsonSchemaMultiDocument(fromASTs(map$3(pathOps, (op) => op.ast))));
		const patchOps = pathOps.map((op, i) => {
			return {
				op: "replace",
				path: escapePath(op.path),
				value: jsonSchemaMultiDocument.schemas[i]
			};
		});
		Object.entries(jsonSchemaMultiDocument.definitions).forEach(([name, definition]) => {
			patchOps.push({
				op: "add",
				path: escapePath([
					"components",
					"schemas",
					name
				]),
				value: definition
			});
		});
		spec = apply(patchOps, spec);
	}
	Object.keys(spec.components.schemas).forEach((key) => {
		if (!VALID_OPEN_API_COMPONENTS_SCHEMAS_KEY_REGEXP.test(key)) throw new globalThis.Error(`Invalid component schema key: ${key}`);
	});
	processAnnotation(api.annotations, Override, (override) => {
		Object.assign(spec, override);
	});
	processAnnotation(api.annotations, Transform, (transformFn) => {
		spec = transformFn(spec);
	});
	apiCache.set(api, spec);
	return spec;
}
function extractResponseBodies(schemas, getStatus, getDescription) {
	const map = /* @__PURE__ */ new Map();
	schemas.forEach(process);
	return map;
	function process(schema) {
		const ast = schema.ast;
		const status = getStatus(ast);
		if (isNoContent(ast)) addNoContent(status, getDescription(schema.ast) ?? "<No Content>");
		else addContent(schema, status, getResponseEncoding(ast));
	}
	function addNoContent(status, description) {
		const statusMap = map.get(status);
		if (statusMap === void 0) map.set(status, {
			descriptions: new Set([description]),
			content: void 0
		});
		else if (description !== void 0) statusMap.descriptions.add(description);
	}
	function addContent(schema, status, encoding) {
		const description = getDescription(schema.ast);
		const statusMap = map.get(status);
		const { _tag, contentType } = encoding;
		if (statusMap === void 0) map.set(status, {
			descriptions: new Set(description !== void 0 ? [description] : []),
			content: new Map([[_tag, new Map([[contentType, new Set([schema])]])]])
		});
		else if (statusMap.content !== void 0) {
			if (description !== void 0) statusMap.descriptions.add(description);
			const contentTypeMap = statusMap.content.get(_tag);
			if (contentTypeMap === void 0) statusMap.content.set(_tag, new Map([[contentType, new Set([schema])]]));
			else {
				const set = contentTypeMap.get(contentType);
				if (set === void 0) contentTypeMap.set(contentType, new Set([schema]));
				else set.add(schema);
			}
		}
	}
}
function resolveDescriptionOrIdentifier(ast) {
	return resolveDescription(ast) ?? resolveIdentifier(ast);
}
const Uint8ArrayEncoding = /* @__PURE__ */ String$1.annotate({ format: "binary" });
function toEncodingAST(ast, _tag) {
	switch (_tag) {
		case "Uint8Array": return Uint8ArrayEncoding.ast;
		case "Text": return String$1.ast;
		case "FormUrlEncoded":
		case "Json": return ast;
		case "Multipart": return persistedFileToBinaryEncoding(ast);
	}
}
function persistedFileToBinaryEncoding(ast) {
	if (isDeclaration(ast) && ast.annotations?.typeConstructor?._tag === "effect/http/PersistedFile") return Uint8ArrayEncoding.ast;
	if (typeof ast?.recur === "function") return ast.recur(persistedFileToBinaryEncoding);
	return ast;
}
const makeSecurityScheme = (security) => {
	const meta = {};
	processAnnotation(security.annotations, Description, (description) => {
		meta.description = description;
	});
	switch (security._tag) {
		case "Basic": return {
			...meta,
			type: "http",
			scheme: "basic"
		};
		case "Bearer": {
			const format = getOption(security.annotations, Format).pipe(map$5((format) => ({ bearerFormat: format })), getOrUndefined);
			return {
				...meta,
				type: "http",
				scheme: "bearer",
				...format
			};
		}
		case "ApiKey": return {
			...meta,
			type: "apiKey",
			name: security.key,
			in: security.in
		};
	}
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/unstable/httpapi/HttpApiGroup.js
const TypeId = "~effect/httpapi/HttpApiGroup";
const Proto = {
	[TypeId]: TypeId,
	add(...toAdd) {
		const endpoints = { ...this.endpoints };
		for (const endpoint of toAdd) endpoints[endpoint.name] = endpoint;
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints,
			annotations: this.annotations
		});
	},
	prefix(prefix) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: map$4(this.endpoints, (endpoint) => endpoint.prefix(prefix)),
			annotations: this.annotations
		});
	},
	middleware(middleware) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: map$4(this.endpoints, (endpoint) => endpoint.middleware(middleware)),
			annotations: this.annotations
		});
	},
	annotateMerge(annotations) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: this.endpoints,
			annotations: merge$1(this.annotations, annotations)
		});
	},
	annotate(annotation, value) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: this.endpoints,
			annotations: add(this.annotations, annotation, value)
		});
	},
	annotateEndpointsMerge(annotations) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: map$4(this.endpoints, (endpoint) => endpoint.annotateMerge(annotations)),
			annotations: this.annotations
		});
	},
	annotateEndpoints(annotation, value) {
		return makeProto({
			identifier: this.identifier,
			topLevel: this.topLevel,
			endpoints: map$4(this.endpoints, (endpoint) => endpoint.annotate(annotation, value)),
			annotations: this.annotations
		});
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const makeProto = (options) => {
	function HttpApiGroup() {}
	Object.setPrototypeOf(HttpApiGroup, Proto);
	HttpApiGroup.key = `effect/httpapi/HttpApiGroup/${options.identifier}`;
	return Object.assign(HttpApiGroup, options);
};
/**
* An `HttpApiGroup` is a collection of `HttpApiEndpoint`s. You can use an `HttpApiGroup` to
* represent a portion of your domain.
*
* The endpoints can be implemented later using the `HttpApiBuilder.group` api.
*
* @since 4.0.0
* @category constructors
*/
const make = (identifier, options) => makeProto({
	identifier,
	topLevel: options?.topLevel ?? false,
	endpoints: empty$7(),
	annotations: empty$8()
});
//#endregion
//#region ../protocol/src/openapi.ts
const HARBOR_OPENAPI_VERSION = "1.0.0";
const HARBOR_OPENAPI_PATH = "/openapi/harbor.v1.json";
const HARBOR_OPENAPI_ALIAS_PATH = "/openapi.json";
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const objectSchema = (properties, required = [], extra = {}) => ({
	type: "object",
	additionalProperties: false,
	properties,
	...required.length > 0 ? { required: [...required] } : {},
	...extra
});
const stringEnum = (values) => ({
	type: "string",
	enum: [...values]
});
const nullable = (schema) => ({ anyOf: [schema, { type: "null" }] });
const jsonValueSchema = { description: "Arbitrary JSON value." };
const harborProtocolOperations = [
	{
		operationId: "getHealth",
		method: "get",
		path: "/health",
		tags: ["Health"],
		summary: "Read the shallow Harbor API health status.",
		auth: "none",
		responseSchemaName: "HealthResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getV1Health",
		method: "get",
		path: "/v1/health",
		tags: ["Health"],
		summary: "Read the shallow Harbor API health status through the v1 compatibility path.",
		auth: "none",
		responseSchemaName: "HealthResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHealthz",
		method: "get",
		path: "/healthz",
		tags: ["Health"],
		summary: "Read the deep Harbor API health status including D1 migration readiness.",
		auth: "none",
		responseSchemaName: "HealthzResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getV1Healthz",
		method: "get",
		path: "/v1/healthz",
		tags: ["Health"],
		summary: "Read the deep Harbor API health status through the v1 compatibility path.",
		auth: "none",
		responseSchemaName: "HealthzResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHarborWellKnown",
		method: "get",
		path: "/.well-known/harbor.json",
		tags: ["Discovery"],
		summary: "Read Harbor service discovery metadata.",
		auth: "none",
		responseSchemaName: "WellKnownHarbor",
		responseEnvelope: "direct"
	},
	{
		operationId: "getWellKnownIndex",
		method: "get",
		path: "/.well-known/index.json",
		tags: ["Discovery"],
		summary: "Read the Harbor well-known index.",
		auth: "none",
		responseSchemaName: "WellKnownIndex",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHarborOpenApi",
		method: "get",
		path: HARBOR_OPENAPI_PATH,
		tags: ["Discovery"],
		summary: "Read the first-party Harbor OpenAPI document.",
		auth: "none",
		responseSchemaName: "OpenApiDocument",
		responseEnvelope: "direct"
	},
	{
		operationId: "getOpenApiJson",
		method: "get",
		path: HARBOR_OPENAPI_ALIAS_PATH,
		tags: ["Discovery"],
		summary: "Read the first-party Harbor OpenAPI document through the conventional alias.",
		description: "Compatibility alias for generic OpenAPI tooling. The canonical Harbor path remains /openapi/harbor.v1.json.",
		auth: "none",
		responseSchemaName: "OpenApiDocument",
		responseEnvelope: "direct"
	},
	{
		operationId: "listWorkspaces",
		method: "post",
		path: "/workspaces/list",
		tags: ["Workspaces"],
		summary: "List workspaces available to the authenticated caller.",
		description: "Returns the caller-specific workspace membership view. The API control plane derives the caller from the bearer token.",
		auth: "bearer",
		requestSchemaName: "ListWorkspacesRequest",
		responseSchemaName: "ListWorkspacesResult",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getWorkspace",
		method: "post",
		path: "/workspaces/get",
		tags: ["Workspaces"],
		summary: "Read one workspace visible to the authenticated caller.",
		description: "The API control plane enforces workspace scope before returning the workspace record.",
		auth: "bearer",
		requestSchemaName: "WorkspaceRequest",
		responseSchemaName: "WorkspaceDetail",
		responseEnvelope: "api-success"
	},
	{
		operationId: "executePlugin",
		method: "post",
		path: "/plugins/execute",
		tags: ["Runtime"],
		summary: "Execute JavaScript or TypeScript against ready Harbor sources in a workspace.",
		description: "The API control plane authenticates and authorizes the caller before dispatching to the runtime execution layer.",
		auth: "bearer",
		requestSchemaName: "ExecuteRequest",
		responseSchemaName: "ExecuteResult",
		responseEnvelope: "api-success"
	},
	{
		operationId: "inspectTrigger",
		method: "post",
		path: "/triggers/inspect",
		tags: ["Triggers"],
		summary: "Inspect and validate a proposed trigger before activation.",
		auth: "bearer",
		requestSchemaName: "TriggerInspectBody",
		responseSchemaName: "TriggerInspectResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "activateTrigger",
		method: "post",
		path: "/triggers/activate",
		tags: ["Triggers"],
		summary: "Activate a trigger from a valid Inspect receipt.",
		auth: "bearer",
		requestSchemaName: "TriggerActivateBody",
		responseSchemaName: "TriggerActivateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "listTriggers",
		method: "post",
		path: "/triggers/list",
		tags: ["Triggers"],
		summary: "List triggers in a workspace.",
		auth: "bearer",
		requestSchemaName: "TriggerListBody",
		responseSchemaName: "TriggerListResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTrigger",
		method: "post",
		path: "/triggers/get",
		tags: ["Triggers"],
		summary: "Read one trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerGetBody",
		responseSchemaName: "TriggerGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "pauseTrigger",
		method: "post",
		path: "/triggers/pause",
		tags: ["Triggers"],
		summary: "Pause an active trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "resumeTrigger",
		method: "post",
		path: "/triggers/resume",
		tags: ["Triggers"],
		summary: "Resume a paused trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "disableTrigger",
		method: "post",
		path: "/triggers/disable",
		tags: ["Triggers"],
		summary: "Disable a trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "replayTriggerDelivery",
		method: "post",
		path: "/triggers/replay",
		tags: ["Triggers"],
		summary: "Replay a terminal trigger delivery.",
		auth: "bearer",
		requestSchemaName: "TriggerReplayBody",
		responseSchemaName: "TriggerDeliveryGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "listTriggerDeliveries",
		method: "post",
		path: "/triggers/deliveries/list",
		tags: ["Triggers"],
		summary: "List trigger deliveries in a workspace.",
		auth: "bearer",
		requestSchemaName: "TriggerDeliveriesListBody",
		responseSchemaName: "TriggerDeliveriesListResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTriggerDelivery",
		method: "post",
		path: "/triggers/deliveries/get",
		tags: ["Triggers"],
		summary: "Read one trigger delivery.",
		auth: "bearer",
		requestSchemaName: "TriggerDeliveryGetBody",
		responseSchemaName: "TriggerDeliveryGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTriggerLimits",
		method: "post",
		path: "/triggers/limits/get",
		tags: ["Triggers"],
		summary: "Read workspace trigger limits.",
		auth: "bearer",
		requestSchemaName: "TriggerLimitsGetBody",
		responseSchemaName: "TriggerLimitsResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "updateTriggerLimits",
		method: "post",
		path: "/triggers/limits/update",
		tags: ["Triggers"],
		summary: "Update workspace trigger limits.",
		auth: "bearer",
		requestSchemaName: "TriggerLimitsUpdateBody",
		responseSchemaName: "TriggerLimitsResponse",
		responseEnvelope: "api-success"
	}
];
const harborOpenApiComponents = {
	ApiFailure: objectSchema({
		success: {
			type: "boolean",
			enum: [false]
		},
		error: { type: "string" },
		issues: {
			type: "array",
			items: { type: "string" }
		}
	}, ["success", "error"]),
	RateLimitInfo: objectSchema({
		policy_id: { type: "string" },
		scope: stringEnum([
			"workspace",
			"user",
			"agent",
			"ip",
			"public"
		]),
		limit: {
			type: "integer",
			minimum: 1
		},
		window_ms: {
			type: "integer",
			minimum: 1
		},
		remaining: {
			type: "integer",
			minimum: 0
		},
		reset_at_ms: {
			type: "integer",
			minimum: 1
		}
	}, [
		"policy_id",
		"scope",
		"limit",
		"window_ms",
		"remaining",
		"reset_at_ms"
	]),
	ApiRateLimitFailure: objectSchema({
		success: {
			type: "boolean",
			enum: [false]
		},
		error: { type: "string" },
		retry_after_sec: {
			type: "integer",
			minimum: 1
		},
		rate_limit: ref("RateLimitInfo")
	}, [
		"success",
		"error",
		"retry_after_sec",
		"rate_limit"
	]),
	HealthResponse: objectSchema({
		status: {
			type: "string",
			enum: ["ok"]
		},
		service: {
			type: "string",
			enum: ["harbor-api"]
		},
		environment: { type: "string" }
	}, [
		"status",
		"service",
		"environment"
	]),
	HealthzResponse: objectSchema({
		status: stringEnum(["ok", "error"]),
		service: {
			type: "string",
			enum: ["harbor-api"]
		},
		environment: { type: "string" },
		version: nullable({ type: "string" }),
		checks: objectSchema({
			db: stringEnum(["ok", "error"]),
			migrations: stringEnum([
				"ok",
				"drift",
				"unknown"
			])
		}, ["db", "migrations"]),
		migrations: objectSchema({
			expected: nullable({ type: "string" }),
			latest_applied: nullable({ type: "string" }),
			latest_applied_at: nullable({ type: "string" }),
			applied_count: { type: "number" }
		}),
		db_ms: { type: "number" },
		total_ms: { type: "number" },
		timestamp: {
			type: "string",
			format: "date-time"
		},
		error: { type: "string" }
	}, [
		"status",
		"service",
		"environment",
		"checks",
		"migrations",
		"db_ms",
		"total_ms",
		"timestamp"
	]),
	WellKnownHarbor: objectSchema({
		name: { type: "string" },
		id: { type: "string" },
		description: { type: "string" },
		endpoints: objectSchema({
			api: {
				type: "string",
				format: "uri"
			},
			web: {
				type: "string",
				format: "uri"
			},
			mcp: {
				type: "string",
				format: "uri"
			},
			apps: {
				type: "string",
				format: "uri"
			}
		}, [
			"api",
			"web",
			"mcp",
			"apps"
		]),
		well_known: objectSchema({
			index: {
				type: "string",
				format: "uri"
			},
			harbor: {
				type: "string",
				format: "uri"
			},
			openapi: {
				type: "string",
				format: "uri"
			},
			mcp_protected_resource: {
				type: "string",
				format: "uri"
			},
			agent_skills: {
				type: "string",
				format: "uri"
			},
			ai_policy: {
				type: "string",
				format: "uri"
			}
		}, [
			"index",
			"harbor",
			"openapi",
			"mcp_protected_resource",
			"agent_skills",
			"ai_policy"
		])
	}, [
		"name",
		"id",
		"description",
		"endpoints",
		"well_known"
	]),
	WellKnownIndex: objectSchema({
		name: { type: "string" },
		entries: {
			type: "array",
			items: objectSchema({
				rel: { type: "string" },
				href: { type: "string" },
				type: { type: "string" }
			}, [
				"rel",
				"href",
				"type"
			])
		}
	}, ["name", "entries"]),
	OpenApiDocument: {
		type: "object",
		additionalProperties: true,
		description: "OpenAPI 3 document for Harbor first-party API surfaces."
	},
	Workspace: objectSchema({
		id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		slug: {
			type: "string",
			pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
		},
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		role: stringEnum([
			"owner",
			"admin",
			"member",
			"viewer"
		]),
		onboarded_at: nullable({
			type: "string",
			format: "date-time"
		}),
		current_user_id: {
			type: "string",
			format: "uuid"
		},
		current_user_email: {
			type: "string",
			format: "email"
		},
		current_user_name: nullable({ type: "string" }),
		current_user_avatar: nullable({ type: "string" })
	}, [
		"id",
		"name",
		"slug",
		"role",
		"onboarded_at"
	]),
	WorkspaceDetail: objectSchema({
		id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		slug: {
			type: "string",
			pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
		},
		created_by: {
			type: "string",
			format: "uuid"
		},
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		}
	}, [
		"id",
		"name",
		"slug",
		"created_by",
		"created_at",
		"updated_at"
	]),
	ListWorkspacesRequest: objectSchema({
		limit: {
			type: "integer",
			minimum: 1
		},
		offset: {
			type: "integer",
			minimum: 0
		},
		cursor: { type: "string" },
		include_total: { type: "boolean" }
	}),
	WorkspaceRequest: objectSchema({ workspace_id: {
		type: "string",
		format: "uuid"
	} }, ["workspace_id"]),
	ListWorkspacesResult: objectSchema({
		data: {
			type: "array",
			items: ref("Workspace")
		},
		total: nullable({ type: "number" }),
		limit: {
			type: "integer",
			minimum: 0
		},
		offset: {
			type: "integer",
			minimum: 0
		},
		hasMore: { type: "boolean" },
		nextCursor: nullable({ type: "string" })
	}, [
		"data",
		"limit",
		"offset",
		"hasMore"
	]),
	ApiSuccessListWorkspacesResult: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("ListWorkspacesResult")
	}, ["success", "data"]),
	ApiSuccessWorkspaceDetail: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("WorkspaceDetail")
	}, ["success", "data"]),
	SourceRef: objectSchema({ namespace: {
		type: "string",
		minLength: 1
	} }, ["namespace"]),
	ExecutionInput: objectSchema({
		path: {
			type: "string",
			minLength: 1
		},
		content_type: { type: "string" },
		size_bytes: { type: "number" },
		sha256: { type: "string" },
		data_base64: { type: "string" }
	}, [
		"path",
		"size_bytes",
		"sha256",
		"data_base64"
	]),
	ExecuteRequest: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		mode: stringEnum(["exec", "workflow"]),
		sources: {
			type: "array",
			items: ref("SourceRef")
		},
		code: {
			type: "string",
			minLength: 1
		},
		timeout_ms: { type: "number" },
		run_id: {
			type: "string",
			format: "uuid"
		},
		sand_session_id: { type: "string" },
		origin_cwd: { type: "string" },
		execution_inputs: {
			type: "array",
			items: ref("ExecutionInput")
		}
	}, ["workspace_id", "code"]),
	ExecuteWarning: objectSchema({
		namespace: { type: "string" },
		tool: { type: "string" },
		message: { type: "string" }
	}, [
		"namespace",
		"tool",
		"message"
	]),
	ExecuteResultTextContent: objectSchema({
		type: {
			type: "string",
			enum: ["text"]
		},
		mime_type: { type: "string" },
		text: { type: "string" }
	}, ["type", "text"]),
	ExecuteResultJsonContent: objectSchema({
		type: {
			type: "string",
			enum: ["json"]
		},
		mime_type: { type: "string" },
		json: jsonValueSchema
	}, ["type", "json"]),
	ExecuteSkillBundleFile: objectSchema({
		relative_path: { type: "string" },
		content_base64: { type: "string" },
		content_hash: { type: "string" }
	}, [
		"relative_path",
		"content_base64",
		"content_hash"
	]),
	ExecuteSkillBundle: objectSchema({
		slug: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		content: { type: "string" },
		content_hash: { type: "string" },
		source_commit: { type: "string" },
		files: {
			type: "array",
			items: ref("ExecuteSkillBundleFile")
		}
	}, [
		"slug",
		"content",
		"content_hash"
	]),
	ExecuteResultSkillBundleContent: objectSchema({
		type: {
			type: "string",
			enum: ["skill_bundle"]
		},
		skill: ref("ExecuteSkillBundle")
	}, ["type", "skill"]),
	ExecuteResultContent: { oneOf: [
		ref("ExecuteResultTextContent"),
		ref("ExecuteResultJsonContent"),
		ref("ExecuteResultSkillBundleContent")
	] },
	ExecuteResult: objectSchema({
		result: jsonValueSchema,
		error: { type: "string" },
		logs: jsonValueSchema,
		mode: stringEnum(["dynamic_worker", "workflow"]),
		content: {
			type: "array",
			items: ref("ExecuteResultContent")
		},
		warnings: {
			type: "array",
			items: ref("ExecuteWarning")
		},
		run_id: {
			type: "string",
			format: "uuid"
		},
		workflow_instance_id: { type: "string" }
	}, [
		"result",
		"mode",
		"run_id"
	]),
	ApiSuccessExecuteResult: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("ExecuteResult")
	}, ["success", "data"]),
	TriggerKind: stringEnum([
		"schedule.cron",
		"schedule.once",
		"webhook.http"
	]),
	TriggerStatus: stringEnum([
		"draft",
		"active",
		"paused",
		"disabled",
		"failed"
	]),
	TriggerDeliveryStatus: stringEnum([
		"queued",
		"claimed",
		"running",
		"completed",
		"failed",
		"skipped",
		"cancelled",
		"dead_lettered"
	]),
	TriggerTargetJobRef: objectSchema({
		job: {
			type: "string",
			minLength: 1
		},
		version: { type: "string" }
	}, ["job"]),
	TriggerLimits: objectSchema({
		max_active_triggers: { type: "number" },
		max_active_schedules: { type: "number" },
		max_due_per_tick: { type: "number" },
		max_concurrent_deliveries: { type: "number" },
		max_concurrent_cron_deliveries: { type: "number" },
		max_concurrent_webhook_deliveries: { type: "number" },
		min_cron_interval_seconds: { type: "number" },
		max_event_bytes: { type: "number" }
	}),
	TriggerInspectBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		source: jsonValueSchema,
		target: ref("TriggerTargetJobRef"),
		input_mapping: jsonValueSchema,
		limits: ref("TriggerLimits"),
		activation: objectSchema({
			name: { type: "string" },
			description: { type: "string" }
		})
	}, [
		"workspace_id",
		"source",
		"target"
	]),
	TriggerActivateBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		inspect_receipt_id: {
			type: "string",
			minLength: 1
		},
		name: { type: "string" },
		description: nullable({ type: "string" }),
		status: stringEnum(["active", "paused"])
	}, [
		"workspace_id",
		"inspect_receipt_id",
		"name"
	]),
	TriggerListBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		status: ref("TriggerStatus"),
		kind: ref("TriggerKind"),
		limit: { type: "number" },
		offset: { type: "number" }
	}, ["workspace_id"]),
	TriggerGetBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "trigger_id"]),
	TriggerPauseResumeBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "trigger_id"]),
	TriggerReplayBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		delivery_id: {
			type: "string",
			minLength: 1
		},
		reason: { type: "string" }
	}, ["workspace_id", "delivery_id"]),
	TriggerDeliveriesListBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		},
		status: ref("TriggerDeliveryStatus"),
		limit: { type: "number" },
		offset: { type: "number" }
	}, ["workspace_id"]),
	TriggerDeliveryGetBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		delivery_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "delivery_id"]),
	TriggerLimitsGetBody: objectSchema({ workspace_id: {
		type: "string",
		format: "uuid"
	} }, ["workspace_id"]),
	TriggerLimitsUpdateBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		limits: ref("TriggerLimits")
	}, ["workspace_id", "limits"]),
	TriggerCheck: objectSchema({
		code: {
			type: "string",
			minLength: 1
		},
		status: stringEnum([
			"pass",
			"warn",
			"fail"
		]),
		message: { type: "string" },
		data: jsonValueSchema
	}, [
		"code",
		"status",
		"message"
	]),
	TriggerRequiredSetup: objectSchema({
		kind: stringEnum([
			"webhook_url",
			"provider_permission",
			"secret",
			"schedule",
			"policy"
		]),
		status: stringEnum([
			"ready",
			"required",
			"missing"
		]),
		data: jsonValueSchema
	}, ["kind", "status"]),
	TriggerRecord: objectSchema({
		id: {
			type: "string",
			minLength: 1
		},
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		description: nullable({ type: "string" }),
		kind: ref("TriggerKind"),
		status: ref("TriggerStatus"),
		target_job_name: { type: "string" },
		target_version_name: { type: "string" },
		trigger_manifest: jsonValueSchema,
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		activated_at: nullable({
			type: "string",
			format: "date-time"
		}),
		paused_at: nullable({
			type: "string",
			format: "date-time"
		}),
		disabled_at: nullable({
			type: "string",
			format: "date-time"
		})
	}, [
		"id",
		"workspace_id",
		"name",
		"description",
		"kind",
		"status",
		"target_job_name",
		"target_version_name",
		"created_at",
		"updated_at",
		"activated_at",
		"paused_at",
		"disabled_at"
	]),
	TriggerDeliveryRecord: objectSchema({
		id: {
			type: "string",
			minLength: 1
		},
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		},
		kind: ref("TriggerKind"),
		status: ref("TriggerDeliveryStatus"),
		scheduled_for: nullable({
			type: "string",
			format: "date-time"
		}),
		source_delivery_id: nullable({ type: "string" }),
		idempotency_key: { type: "string" },
		run_id: nullable({
			type: "string",
			format: "uuid"
		}),
		job_invocation_id: nullable({
			type: "string",
			format: "uuid"
		}),
		attempt_count: { type: "number" },
		next_attempt_at: nullable({
			type: "string",
			format: "date-time"
		}),
		error_reason: nullable({ type: "string" }),
		error_message: nullable({ type: "string" }),
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		finished_at: nullable({
			type: "string",
			format: "date-time"
		})
	}, [
		"id",
		"workspace_id",
		"trigger_id",
		"kind",
		"status",
		"scheduled_for",
		"source_delivery_id",
		"idempotency_key",
		"run_id",
		"job_invocation_id",
		"attempt_count",
		"next_attempt_at",
		"error_reason",
		"error_message",
		"created_at",
		"updated_at",
		"finished_at"
	]),
	TriggerInspectResponse: objectSchema({
		ok: { type: "boolean" },
		receipt_id: { type: "string" },
		expires_at: {
			type: "string",
			format: "date-time"
		},
		normalized: jsonValueSchema,
		target: jsonValueSchema,
		checks: {
			type: "array",
			items: ref("TriggerCheck")
		},
		required_setup: {
			type: "array",
			items: ref("TriggerRequiredSetup")
		},
		activation_body: jsonValueSchema,
		errors: {
			type: "array",
			items: jsonValueSchema
		}
	}, [
		"ok",
		"receipt_id",
		"expires_at",
		"normalized",
		"target",
		"checks",
		"required_setup"
	]),
	TriggerActivateResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerListResponse: objectSchema({
		triggers: {
			type: "array",
			items: ref("TriggerRecord")
		},
		count: { type: "number" }
	}, ["triggers", "count"]),
	TriggerGetResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerStatusUpdateResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerDeliveriesListResponse: objectSchema({
		deliveries: {
			type: "array",
			items: ref("TriggerDeliveryRecord")
		},
		count: { type: "number" }
	}, ["deliveries", "count"]),
	TriggerDeliveryGetResponse: objectSchema({ delivery: ref("TriggerDeliveryRecord") }, ["delivery"]),
	TriggerLimitsResponse: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		limits: ref("TriggerLimits")
	}, ["workspace_id", "limits"]),
	ApiSuccessTriggerInspectResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerInspectResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerActivateResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerActivateResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerListResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerListResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerGetResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerGetResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerStatusUpdateResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerStatusUpdateResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerDeliveriesListResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerDeliveriesListResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerDeliveryGetResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerDeliveryGetResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerLimitsResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerLimitsResponse")
	}, ["success", "data"])
};
const responseFor = (operation) => {
	return {
		description: "Successful response.",
		content: { "application/json": { schema: operation.responseEnvelope === "api-success" ? ref(`ApiSuccess${operation.responseSchemaName}`) : ref(operation.responseSchemaName) } }
	};
};
const jsonContent = (name) => ({ "application/json": { schema: ref(name) } });
const failureResponses = (operation) => operation.auth === "bearer" ? {
	"400": {
		description: "Invalid request.",
		content: jsonContent("ApiFailure")
	},
	"401": {
		description: "Missing or invalid credentials.",
		content: jsonContent("ApiFailure")
	},
	"403": {
		description: "Workspace or capability access denied.",
		content: jsonContent("ApiFailure")
	},
	"429": {
		description: "Configured rate limit exceeded.",
		content: jsonContent("ApiRateLimitFailure")
	},
	"500": {
		description: "Internal service failure.",
		content: jsonContent("ApiFailure")
	}
} : { "500": {
	description: "Internal service failure.",
	content: jsonContent("ApiFailure")
} };
const operationToOpenApi = (operation) => ({
	operationId: operation.operationId,
	tags: [...operation.tags],
	summary: operation.summary,
	...operation.description ? { description: operation.description } : {},
	...operation.auth === "bearer" ? { security: [{ bearerAuth: [] }] } : { security: [] },
	...operation.requestSchemaName ? { requestBody: {
		required: true,
		content: { "application/json": { schema: ref(operation.requestSchemaName) } }
	} } : {},
	responses: {
		"200": responseFor(operation),
		...failureResponses(operation)
	}
});
function createHarborOpenApiDocument(options = {}) {
	const paths = {};
	for (const operation of harborProtocolOperations) {
		const pathItem = paths[operation.path] ?? {};
		pathItem[operation.method] = operationToOpenApi(operation);
		paths[operation.path] = pathItem;
	}
	return {
		openapi: "3.0.3",
		info: {
			title: "Harbor API",
			version: HARBOR_OPENAPI_VERSION,
			description: "First-party Harbor API contract for discovery, health, and runtime execution ingress. Control-plane authorization remains owned by apps/api."
		},
		servers: [{
			url: options.serverUrl ?? "https://api.tryharbor.ai",
			description: "Production"
		}, {
			url: options.stagingServerUrl ?? "https://stagapi.tryharbor.ai",
			description: "Staging"
		}],
		paths,
		components: {
			securitySchemes: { bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "Harbor API key or WorkOS AuthKit access token",
				description: "Use a Harbor workspace API key, or a WorkOS/AuthKit access token on API routes that explicitly support WorkOS bearer authentication. Workspace authorization remains enforced by Harbor API routes."
			} },
			schemas: harborOpenApiComponents
		},
		tags: [
			{
				name: "Discovery",
				description: "Unauthenticated discovery documents."
			},
			{
				name: "Health",
				description: "Operational health checks."
			},
			{
				name: "Workspaces",
				description: "Authenticated workspace control-plane resources."
			},
			{
				name: "Runtime",
				description: "Workspace-scoped execution ingress."
			}
		]
	};
}
createHarborOpenApiDocument();
//#endregion
//#region ../protocol/src/effect-http-api.ts
const operationById = new Map(harborProtocolOperations.map((operation) => [operation.operationId, operation]));
function operationAnnotations(operationId) {
	const operation = operationById.get(operationId);
	return annotations({
		identifier: operationId,
		summary: operation?.summary,
		description: operation?.description
	});
}
const ApiFailureSchema = Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	issues: Schema.optional(Schema.Array(Schema.String))
});
const RateLimitInfoSchema = Schema.Struct({
	policy_id: Schema.String,
	scope: Schema.Literals([
		"workspace",
		"user",
		"agent",
		"ip",
		"public"
	]),
	limit: Schema.Number,
	window_ms: Schema.Number,
	remaining: Schema.Number,
	reset_at_ms: Schema.Number
});
const ApiRateLimitFailureSchema = Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	retry_after_sec: Schema.Number,
	rate_limit: RateLimitInfoSchema
});
const HealthResponseSchema = Schema.Struct({
	status: Schema.Literal("ok"),
	service: Schema.Literal("harbor-api"),
	environment: Schema.String
});
const HealthzResponseSchema = Schema.Struct({
	status: Schema.Literals(["ok", "error"]),
	service: Schema.Literal("harbor-api"),
	environment: Schema.String,
	version: Schema.optional(Schema.NullOr(Schema.String)),
	checks: Schema.Struct({
		db: Schema.Literals(["ok", "error"]),
		migrations: Schema.Literals([
			"ok",
			"drift",
			"unknown"
		])
	}),
	migrations: Schema.Struct({
		expected: Schema.optional(Schema.NullOr(Schema.String)),
		latest_applied: Schema.optional(Schema.NullOr(Schema.String)),
		latest_applied_at: Schema.optional(Schema.NullOr(Schema.String)),
		applied_count: Schema.optional(Schema.Number)
	}),
	db_ms: Schema.Number,
	total_ms: Schema.Number,
	timestamp: Schema.String,
	error: Schema.optional(Schema.String)
});
const WellKnownHarborSchema = Schema.Struct({
	name: Schema.String,
	id: Schema.String,
	description: Schema.String,
	endpoints: Schema.Struct({
		api: Schema.String,
		web: Schema.String,
		mcp: Schema.String,
		apps: Schema.String
	}),
	well_known: Schema.Struct({
		index: Schema.String,
		harbor: Schema.String,
		openapi: Schema.String,
		mcp_protected_resource: Schema.String,
		agent_skills: Schema.String,
		ai_policy: Schema.String
	})
});
const WellKnownIndexSchema = Schema.Struct({
	name: Schema.String,
	entries: Schema.Array(Schema.Struct({
		rel: Schema.String,
		href: Schema.String,
		type: Schema.String
	}))
});
const OpenApiDocumentSchema = Schema.Record(Schema.String, Schema.Unknown);
const WorkspaceSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	slug: Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
	role: Schema.Literals([
		"owner",
		"admin",
		"member",
		"viewer"
	]),
	onboarded_at: Schema.NullOr(Schema.String),
	current_user_id: Schema.optional(Schema.String),
	current_user_email: Schema.optional(Schema.String),
	current_user_name: Schema.optional(Schema.NullOr(Schema.String)),
	current_user_avatar: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String)
});
const WorkspaceDetailSchema = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	slug: Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
	created_by: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String
});
const ListWorkspacesRequestSchema = Schema.Struct({
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const WorkspaceRequestSchema = Schema.Struct({ workspace_id: Schema.String });
const ListWorkspacesResultSchema = Schema.Struct({
	data: Schema.Array(WorkspaceSchema),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const ApiSuccessListWorkspacesResultSchema = Schema.Struct({
	success: Schema.Literal(true),
	data: ListWorkspacesResultSchema
});
const ApiSuccessWorkspaceDetailSchema = Schema.Struct({
	success: Schema.Literal(true),
	data: WorkspaceDetailSchema
});
const ExecuteSourceRefSchema = Schema.Struct({ namespace: Schema.String });
const ExecuteInputSchema = Schema.Struct({
	path: Schema.String,
	content_type: Schema.optional(Schema.String),
	size_bytes: Schema.Number,
	sha256: Schema.String,
	data_base64: Schema.String
});
const ExecuteRequestSchema = Schema.Struct({
	workspace_id: Schema.String,
	mode: Schema.optional(Schema.Literals(["exec", "workflow"])),
	sources: Schema.optional(Schema.Array(ExecuteSourceRefSchema)),
	code: Schema.String,
	timeout_ms: Schema.optional(Schema.Number),
	run_id: Schema.optional(Schema.String),
	sand_session_id: Schema.optional(Schema.String),
	origin_cwd: Schema.optional(Schema.String),
	execution_inputs: Schema.optional(Schema.Array(ExecuteInputSchema))
});
const ExecuteWarningSchema = Schema.Struct({
	namespace: Schema.String,
	tool: Schema.String,
	message: Schema.String
});
const ExecuteResultSchema = Schema.Struct({
	result: Schema.Unknown,
	error: Schema.optional(Schema.String),
	logs: Schema.optional(Schema.Unknown),
	mode: Schema.Literals(["dynamic_worker", "workflow"]),
	warnings: Schema.optional(Schema.Array(ExecuteWarningSchema)),
	run_id: Schema.String,
	workflow_instance_id: Schema.optional(Schema.String)
});
const ApiSuccessExecuteResultSchema = Schema.Struct({
	success: Schema.Literal(true),
	data: ExecuteResultSchema
});
const TriggerRequestSchema = Schema.Record(Schema.String, Schema.Unknown);
const TriggerResponseSchema = Schema.Record(Schema.String, Schema.Unknown);
const ApiSuccessTriggerResponseSchema = Schema.Struct({
	success: Schema.Literal(true),
	data: TriggerResponseSchema
});
const DiscoveryGroup = make("Discovery").add(get("getHarborWellKnown", "/.well-known/harbor.json", {
	success: WellKnownHarborSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getHarborWellKnown")), get("getWellKnownIndex", "/.well-known/index.json", {
	success: WellKnownIndexSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getWellKnownIndex")), get("getHarborOpenApi", HARBOR_OPENAPI_PATH, {
	success: OpenApiDocumentSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getHarborOpenApi")), get("getOpenApiJson", HARBOR_OPENAPI_ALIAS_PATH, {
	success: OpenApiDocumentSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getOpenApiJson")));
const HealthGroup = make("Health").add(get("getHealth", "/health", {
	success: HealthResponseSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getHealth")), get("getV1Health", "/v1/health", {
	success: HealthResponseSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getV1Health")), get("getHealthz", "/healthz", {
	success: HealthzResponseSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getHealthz")), get("getV1Healthz", "/v1/healthz", {
	success: HealthzResponseSchema,
	error: ApiFailureSchema
}).annotateMerge(operationAnnotations("getV1Healthz")));
const WorkspacesGroup = make("Workspaces").add(post("listWorkspaces", "/workspaces/list", {
	payload: ListWorkspacesRequestSchema,
	success: ApiSuccessListWorkspacesResultSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("listWorkspaces")), post("getWorkspace", "/workspaces/get", {
	payload: WorkspaceRequestSchema,
	success: ApiSuccessWorkspaceDetailSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("getWorkspace")));
const RuntimeGroup = make("Runtime").add(post("executePlugin", "/plugins/execute", {
	payload: ExecuteRequestSchema,
	success: ApiSuccessExecuteResultSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("executePlugin")));
const TriggersGroup = make("Triggers").add(post("inspectTrigger", "/triggers/inspect", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("inspectTrigger")), post("activateTrigger", "/triggers/activate", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("activateTrigger")), post("listTriggers", "/triggers/list", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("listTriggers")), post("getTrigger", "/triggers/get", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("getTrigger")), post("pauseTrigger", "/triggers/pause", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("pauseTrigger")), post("resumeTrigger", "/triggers/resume", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("resumeTrigger")), post("disableTrigger", "/triggers/disable", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("disableTrigger")), post("replayTriggerDelivery", "/triggers/replay", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("replayTriggerDelivery")), post("listTriggerDeliveries", "/triggers/deliveries/list", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("listTriggerDeliveries")), post("getTriggerDelivery", "/triggers/deliveries/get", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("getTriggerDelivery")), post("getTriggerLimits", "/triggers/limits/get", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("getTriggerLimits")), post("updateTriggerLimits", "/triggers/limits/update", {
	payload: TriggerRequestSchema,
	success: ApiSuccessTriggerResponseSchema,
	error: Schema.Union([ApiFailureSchema, ApiRateLimitFailureSchema])
}).annotateMerge(operationAnnotations("updateTriggerLimits")));
const HarborHttpApi = make$1("HarborApi").annotateMerge(annotations({
	title: "Harbor API",
	version: HARBOR_OPENAPI_VERSION,
	description: "First-party Harbor control-plane and runtime ingress contract.",
	servers: [{
		url: "https://api.tryharbor.ai",
		description: "Production"
	}, {
		url: "https://stagapi.tryharbor.ai",
		description: "Staging"
	}]
})).add(DiscoveryGroup, HealthGroup, WorkspacesGroup, RuntimeGroup, TriggersGroup);
function createHarborEffectOpenApiDocument(options = {}) {
	return fromApi(options.servers ? HarborHttpApi.annotateMerge(annotations({ servers: options.servers })) : HarborHttpApi);
}
function collectHarborHttpApiOperations() {
	const operations = [];
	reflect(HarborHttpApi, {
		onGroup: () => {},
		onEndpoint: ({ group, endpoint }) => {
			operations.push({
				operationId: endpoint.name,
				method: endpoint.method.toLowerCase(),
				path: endpoint.path,
				group: group.identifier
			});
		}
	});
	return operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
}
function assertHarborHttpApiMatchesOperationRegistry() {
	const httpApiOperations = collectHarborHttpApiOperations();
	const registryOperations = [...harborProtocolOperations].map((operation) => ({
		operationId: operation.operationId,
		method: operation.method,
		path: operation.path
	})).sort((a, b) => a.operationId.localeCompare(b.operationId));
	if (httpApiOperations.length !== registryOperations.length) throw new Error(`Harbor HttpApi operation count mismatch: httpapi=${httpApiOperations.length} registry=${registryOperations.length}`);
	for (let index = 0; index < registryOperations.length; index += 1) {
		const httpApi = httpApiOperations[index];
		const registry = registryOperations[index];
		if (!httpApi || !registry) throw new Error("Harbor HttpApi registry comparison failed");
		if (httpApi.operationId !== registry.operationId || httpApi.method !== registry.method || httpApi.path !== registry.path) throw new Error(`Harbor HttpApi operation mismatch at ${index}: httpapi=${httpApi.operationId} ${httpApi.method} ${httpApi.path}, registry=${registry.operationId} ${registry.method} ${registry.path}`);
	}
}
//#endregion
export { ApiFailureSchema, ApiRateLimitFailureSchema, ApiSuccessExecuteResultSchema, ApiSuccessListWorkspacesResultSchema, ApiSuccessWorkspaceDetailSchema, ExecuteInputSchema, ExecuteRequestSchema, ExecuteResultSchema, ExecuteSourceRefSchema, ExecuteWarningSchema, HarborHttpApi, HealthResponseSchema, HealthzResponseSchema, ListWorkspacesRequestSchema, ListWorkspacesResultSchema, OpenApiDocumentSchema, RateLimitInfoSchema, WellKnownHarborSchema, WellKnownIndexSchema, WorkspaceDetailSchema, WorkspaceRequestSchema, WorkspaceSchema, assertHarborHttpApiMatchesOperationRegistry, collectHarborHttpApiOperations, createHarborEffectOpenApiDocument };

//# sourceMappingURL=effect-http-api.mjs.map