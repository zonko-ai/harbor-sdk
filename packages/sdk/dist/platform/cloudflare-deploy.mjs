import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Pipeable.js
/**
* The `Pipeable` module defines the shared interface and implementation helpers
* for values that support Effect-style method chaining with `.pipe(...)`.
*
* A `Pipeable` value can pass itself through a sequence of unary functions from
* left to right, so code can be written as `value.pipe(f, g, h)` instead of
* deeply nesting calls. This is the method form used by many Effect data types
* to compose transformations, validations, and effectful operations while
* keeping the original value as the starting point of the pipeline.
*
* **Common tasks**
*
* - Type values that expose a `.pipe(...)` method with the {@link Pipeable} interface
* - Implement a custom `.pipe(...)` method with {@link pipeArguments}
* - Reuse the standard implementation through {@link Prototype}, {@link Class}, or {@link Mixin}
*
* **Gotchas**
*
* - Each function receives the result of the previous function, not the original value
* - The overloads preserve precise types for long pipelines, but very long chains may be easier to read when split
*
* @since 2.0.0
*/
/**
* Applies a `pipe` method's variadic arguments to an initial value from left
* to right.
*
* **Details**
*
* This helper is intended for implementing `Pipeable.pipe` methods that
* receive JavaScript's `arguments` object. With no functions it returns the
* original value; otherwise it feeds each result into the next function.
*
* **Example** (Implementing a pipe method)
*
* ```ts
* import { Pipeable } from "effect"
*
* class NumberBox {
*   constructor(readonly value: number) {}
*
*   pipe(..._fns: ReadonlyArray<(value: number) => number>): number {
*     return Pipeable.pipeArguments(this.value, arguments) as number
*   }
* }
*
* const result = new NumberBox(5).pipe(
*   (n) => n + 2,
*   (n) => n * 3
* )
* console.log(result) // 21
* ```
*
* @category utils
* @since 2.0.0
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
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Function.js
/**
* Creates a function that can be called in data-first style or data-last
* (`pipe`-friendly) style.
*
* **Details**
*
* Pass either the arity of the uncurried function or a predicate that decides
* whether the current call is data-first. Arity is the common case. Use a
* predicate when optional arguments make arity ambiguous.
*
* **Example** (Using arity to determine data-first or data-last style)
*
* ```ts
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
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
* import { Function, pipe } from "effect"
*
* const sum: {
*   (that: number): (self: number) => number
*   (self: number, that: number): number
* } = Function.dual(2, (self: number, that: number): number => self + that)
*
* console.log(sum(2, 3)) // 5
* console.log(pipe(2, sum(3))) // 5
* ```
*
* **Example** (Using a predicate to determine data-first or data-last style)
*
* ```ts
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
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
* **Example** (Returning the same value)
*
* ```ts
* import { identity } from "effect"
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
* Creates a zero-argument function that always returns the provided value.
*
* **When to use**
*
* Use `constant` when an API expects a thunk or callback and every invocation
* should return the same value.
*
* **Example** (Creating a constant thunk)
*
* ```ts
* import { Function } from "effect"
* import * as assert from "node:assert"
*
* const constNull = Function.constant(null)
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
* A thunk that returns always `undefined`.
*
* **Example** (Returning undefined from a thunk)
*
* ```ts
* import { Function } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(Function.constUndefined(), undefined)
* ```
*
* @category constants
* @since 2.0.0
*/
const constUndefined = /* @__PURE__ */ constant(void 0);
/**
* A thunk that returns always `void`.
*
* **Example** (Returning void from a thunk)
*
* ```ts
* import { Function } from "effect"
* import * as assert from "node:assert"
*
* assert.deepStrictEqual(Function.constVoid(), undefined)
* ```
*
* @category constants
* @since 2.0.0
*/
const constVoid = constUndefined;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/equal.js
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
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Predicate.js
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
* import { Predicate } from "effect"
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
* Checks whether a value is a `function`.
*
* **When to use**
*
* - You need to guard an `unknown` value as callable.
*
* **Details**
*
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
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
function isFunction(input) {
	return typeof input === "function";
}
/**
* Checks whether a value is an `object` in the JavaScript sense (objects, arrays, functions).
*
* **When to use**
*
* - You want to accept arrays and functions as well as objects.
*
* **Details**
*
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
* @see {@link isObject}
* @see {@link isObjectOrArray}
* @category guards
* @since 4.0.0
*/
function isObjectKeyword(input) {
	return typeof input === "object" && input !== null || isFunction(input);
}
/**
* Checks whether a value has a given property key.
*
* **When to use**
*
* - You need to guard property access on `unknown` values.
* - You want a simple structural guard for objects.
*
* **Details**
*
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
* @see {@link isTagged}
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
const hasProperty = /* @__PURE__ */ dual(2, (self, property) => isObjectKeyword(self) && property in self);
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Hash.js
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
* @category symbols
* @since 2.0.0
*/
const symbol$1 = "~effect/interfaces/Hash";
/**
* Computes a hash value for any given value.
*
* **Details**
*
* This function can hash primitives (numbers, strings, booleans, etc.) as well as
* objects, arrays, and other complex data structures. It automatically handles
* different types and provides a consistent hash value for equivalent inputs.
*
* **Gotchas**
*
* Objects being hashed must be treated as immutable after their first hash
* computation. Hash results are cached, so mutating an object after hashing will
* lead to stale cached values and broken hash-based operations. For mutable
* objects, implement a custom `Hash` interface that hashes the object reference
* rather than its content.
*
* **Example** (Hashing different values)
*
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
* console.log(Hash.hash({ id: "user-1", roles: ["admin", "editor"] }))
* ```
*
* @category hashing
* @since 2.0.0
*/
const hash = (self) => {
	switch (typeof self) {
		case "number": return number(self);
		case "bigint": return string(self.toString(10));
		case "boolean": return string(String(self));
		case "symbol": return string(String(self));
		case "string": return string(self);
		case "undefined": return string("undefined");
		case "function":
		case "object": if (self === null) return string("null");
		else if (self instanceof Date) return string(self.toISOString());
		else if (self instanceof RegExp) return string(self.toString());
		else {
			if (byReferenceInstances.has(self)) return random(self);
			if (hashCache.has(self)) return hashCache.get(self);
			const h = withVisitedTracking$1(self, () => {
				if (isHash(self)) return self[symbol$1]();
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
* **Details**
*
* This function creates a random hash value for objects that don't have their own
* hash implementation. The hash value is cached using a WeakMap, so the same object
* will always return the same hash value during its lifetime.
*
* **Example** (Hashing objects by reference)
*
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
	if (!randomHashCache.has(self)) randomHashCache.set(self, number(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
	return randomHashCache.get(self);
};
/**
* Combines two hash values into a single hash value.
*
* **Details**
*
* This function takes two hash values and combines them using a mathematical
* operation to produce a new hash value. It's useful for creating hash values
* of composite structures.
*
* **Example** (Combining hash values)
*
* ```ts
* import { Hash, pipe } from "effect"
*
* // Can also be used with pipe
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
* **Details**
*
* This function takes a hash value and applies bitwise operations to improve
* the distribution of hash values, reducing the likelihood of collisions.
*
* **Example** (Optimizing a hash value)
*
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
* **Details**
*
* This function determines whether a given value has the Hash symbol property,
* indicating that it can provide its own hash value implementation.
*
* **Example** (Checking for Hash support)
*
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
const isHash = (u) => hasProperty(u, symbol$1);
/**
* Computes a hash value for a number.
*
* **Details**
*
* This function creates a hash value for numeric inputs, handling special cases
* like NaN, Infinity, and -Infinity with distinct hash values. It uses bitwise operations to ensure good distribution
* of hash values across different numeric inputs.
*
* **Example** (Hashing numbers)
*
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
const number = (n) => {
	if (n !== n) return string("NaN");
	if (n === Infinity) return string("Infinity");
	if (n === -Infinity) return string("-Infinity");
	let h = n | 0;
	if (h !== n) h ^= n * 4294967295;
	while (n > 4294967295) h ^= n /= 4294967295;
	return optimize(h);
};
/**
* Computes a hash value for a string using the djb2 algorithm.
*
* **Details**
*
* This function implements a variation of the djb2 hash algorithm, which is
* known for its good distribution properties and speed. It processes each
* character of the string to produce a consistent hash value.
*
* **Example** (Hashing strings)
*
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
const string = (str) => {
	let h = 5381, i = str.length;
	while (i) h = h * 33 ^ str.charCodeAt(--i);
	return optimize(h);
};
/**
* Computes a hash value for an object using only the specified keys.
*
* **Details**
*
* This function allows you to hash an object by considering only specific keys,
* which is useful when you want to create a hash based on a subset of an object's
* properties.
*
* **Example** (Hashing selected object keys)
*
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
* Computes a structural hash for an object using Effect's object key collection.
*
* **Details**
*
* The hash is based on the object's structural keys and their values, including
* symbol keys and relevant prototype keys for non-plain objects.
*
* **Example** (Hashing object structures)
*
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
* **Details**
*
* This function creates a hash value based on all elements in the array.
* The order of elements matters, so arrays with the same elements in different
* orders will produce different hash values.
*
* **Example** (Hashing arrays)
*
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
const hashMap = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Map"), ([k, v]) => combine(hash(k), hash(v)));
const hashSet = /* @__PURE__ */ iterableWith(/* @__PURE__ */ string("Set"), hash);
const randomHashCache = /* @__PURE__ */ new WeakMap();
const hashCache = /* @__PURE__ */ new WeakMap();
const visitedObjects = /* @__PURE__ */ new WeakSet();
function withVisitedTracking$1(obj, fn) {
	if (visitedObjects.has(obj)) return string("[Circular]");
	visitedObjects.add(obj);
	const result = fn();
	visitedObjects.delete(obj);
	return result;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Equal.js
/**
* The unique string identifier for the {@link Equal} interface.
*
* **When to use**
*
* - Use it as the computed property key when implementing custom equality on a
*   class or object literal.
* - Use it to check manually whether an object carries an equality method (prefer
*   {@link isEqual} instead).
*
* **Details**
*
* This is a pure constant with no allocation or side effects.
*
* **Example** (Implementing Equal on a Class)
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
* @category symbols
* @since 2.0.0
*/
const symbol = "~effect/interfaces/Equal";
function equals() {
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
		if (bothEquals) return self[symbol](that);
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
* **When to use**
*
* - To branch on whether a value supports custom equality before calling
*   its `[Equal.symbol]` method directly.
* - In generic utility code that needs to distinguish `Equal` implementors
*   from plain values.
*
* **Details**
*
* - Pure function, no side effects.
* - Returns `true` if and only if `u` has a property keyed by
*   {@link symbol}.
* - Acts as a TypeScript type guard, narrowing the input to {@link Equal}.
*
* **Example** (Type Guard)
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
* @category guards
* @since 2.0.0
*/
const isEqual = (u) => hasProperty(u, symbol);
/**
* Wraps {@link equals} as an `Equivalence<A>`.
*
* **When to use**
*
* - When an API (e.g. `Array.dedupeWith`, `Equivalence.mapInput`) requires an
*   `Equivalence` and you want to reuse `Equal.equals`.
*
* **Details**
*
* - Returns a function `(a: A, b: A) => boolean` that delegates to
*   {@link equals}.
* - Pure; allocates a thin wrapper on each call.
*
* **Example** (Deduplicating with Equal Semantics)
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
* @category instances
* @since 4.0.0
*/
const asEquivalence = () => equals;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Redactable.js
/**
* Symbol used to identify objects that implement the {@link Redactable}
* protocol.
*
* **When to use**
*
* Use this symbol as the property key when implementing {@link Redactable}.
*
* **Details**
*
* Add a method under this key to make an object redactable. The method receives
* the current `Context` and must return the replacement value. The symbol is
* registered globally via `Symbol.for("~effect/Redactable")`, so it is
* identical across multiple copies of the library at runtime.
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
* @see {@link Redactable} - the interface this symbol belongs to
* @see {@link isRedactable} - check whether a value has this symbol
* @category symbol
* @since 3.10.0
*/
const symbolRedactable = /* @__PURE__ */ Symbol.for("~effect/Redactable");
/**
* Calls `[symbolRedactable]` on a value that is already known to be
* {@link Redactable} and returns the result.
*
* **When to use**
*
* Use this when you have already verified the value is `Redactable`, for
* example with {@link isRedactable}, and want to avoid a second check.
*
* **Details**
*
* This function reads the current fiber's `Context` from the global fiber
* reference and passes it to the redaction method. It does not mutate the input.
*
* **Gotchas**
*
* If no fiber is active, an empty `Context` is passed to the redaction method.
*
* @see {@link redact} - higher-level variant that handles non-redactable values
* @see {@link isRedactable} - type guard to verify before calling this
* @category destructors
* @since 4.0.0
*/
function getRedacted(redactable) {
	return redactable[symbolRedactable](globalThis["~effect/Fiber/currentFiber"]?.context ?? emptyContext);
}
/** @internal */
const currentFiberTypeId = "~effect/Fiber/currentFiber";
const emptyContext = {
	"~effect/Context": {},
	mapUnsafe: /* @__PURE__ */ new Map(),
	pipe() {
		return pipeArguments(this, arguments);
	}
};
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Formatter.js
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
* **When to use**
*
* - Pretty-printing values for debugging, logging, or error messages.
* - You need to handle `BigInt`, `Symbol`, `Set`, `Map`, `Date`, `RegExp`,
*   or class instances that `JSON.stringify` cannot represent.
* - You want circular references shown as `"[Circular]"` instead of
*   throwing.
*
* **Details**
*
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
* @see {@link formatJson}
* @see {@link Formatter}
* @category formatting
* @since 2.0.0
*/
function format(input, options) {
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
			if (symbolRedactable in v) return format(getRedacted(v));
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
* @internal
*/
function formatPropertyKey(name) {
	return typeof name === "string" ? JSON.stringify(name) : String(name);
}
/**
* Formats a `Date` as an ISO 8601 string, returning `"Invalid Date"` for
* invalid dates instead of throwing.
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
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Inspectable.js
/**
* Symbol used by Node.js for custom object inspection.
*
* **Details**
*
* This symbol is recognized by Node.js's `util.inspect()` function and the REPL
* for custom object representation. When an object has a method with this symbol,
* it will be called to determine how the object should be displayed.
*
* **Example** (Defining custom Node inspection)
*
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
* @category symbols
* @since 2.0.0
*/
const NodeInspectSymbol = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Utils.js
/**
* An `IterableIterator` that yields its wrapped value exactly once.
*
* **When to use**
*
* Implement `[Symbol.iterator]()` on Effect-like types so they can be
* `yield*`-ed inside generator functions, such as `Effect.gen` and
* `Option.gen`. You almost never construct this directly — it is created
* internally by yieldable types.
*
* **Details**
*
* The first call to `next()` returns `{ value: self, done: false }`. Every
* subsequent call returns `{ value: a, done: true }` where `a` is the argument
* passed to `next()`. `[Symbol.iterator]()` returns a **new** `SingleShotGen`
* wrapping the same value, so the outer type can be iterated multiple times.
* It does not mutate the wrapped value.
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
	* Yields the stored value once, then completes with the value sent back in.
	*
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
	* Creates a fresh single-shot iterator over the stored value.
	*
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
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/core.js
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
		return format(this.toJSON(), {
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
const isEffect = (u) => hasProperty(u, EffectTypeId);
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
		return `Cause(${format(this.reasons)})`;
	}
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	[symbol](that) {
		return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals(e, that.reasons[i]));
	}
	[symbol$1]() {
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
		return format(this);
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
		return `Fail(${format(this.error)})`;
	}
	toJSON() {
		return {
			_tag: "Fail",
			error: this.error
		};
	}
	[symbol](that) {
		return isFailReason(that) && equals(this.error, that.error) && equals(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string(this._tag))(combine(hash(this.error))(hash(this.annotations)));
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
		return `Die(${format(this.defect)})`;
	}
	toJSON() {
		return {
			_tag: "Die",
			defect: this.defect
		};
	}
	[symbol](that) {
		return isDieReason(that) && equals(this.defect, that.defect) && equals(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
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
			return `${options.op}(${format(this[args])})`;
		},
		toJSON() {
			return {
				_id: "Exit",
				_tag: options.op,
				[options.prop]: this[args]
			};
		},
		[symbol](that) {
			return isExit(that) && that._tag === this._tag && equals(this[args], that[args]);
		},
		[symbol$1]() {
			return combine(string(options.op), hash(this[args]));
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
const withFiber = /* @__PURE__ */ makePrimitive({
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
const Error$1 = /* @__PURE__ */ function() {
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
const TaggedError = (tag) => {
	class Base extends Error$1 {
		_tag = tag;
	}
	Base.prototype.name = tag;
	return Base;
};
TaggedError("NoSuchElementError");
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Effectable.js
/**
* Create a low-level `Effect` prototype.
*
* **Details**
*
* When the effect is evaluated, it calls `evaluate` with the current fiber.
*
* @category Prototypes
* @since 4.0.0
*/
const Prototype = (options) => makePrimitiveProto({
	op: options.label,
	[evaluate]: options.evaluate
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Context.js
/**
* Runtime type identifier attached to `Context` service keys and used by
* `isKey` to recognize them.
*
* @category Type Identifiers
* @since 4.0.0
*/
const ServiceTypeId = "~effect/Context/Service";
/**
* Creates a `Context` service key.
*
* **Details**
*
* Call `Context.Service("Key")` for a function-style key, or use the two-stage
* form `Context.Service<Self, Shape>()("Key")` for class-style service
* declarations. The returned key can be yielded as an Effect and passed to
* `Context.make`, `Context.add`, and the Context getter functions.
*
* **Example** (Creating service keys)
*
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
* @category constructors
* @since 4.0.0
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
			return exitSucceed(get(fiber.context, this));
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
		return make(this, self);
	},
	use(f) {
		return withFiber((fiber) => f(get(fiber.context, this)));
	},
	useSync(f) {
		return withFiber((fiber) => exitSucceed(f(get(fiber.context, this))));
	}
};
const ReferenceTypeId = "~effect/Context/Reference";
const TypeId$2 = "~effect/Context";
/**
* Creates a `Context` from an existing service map without validating or
* copying it.
*
* **Gotchas**
*
* This is unsafe because later mutation of the provided map can affect the
* created `Context`. Prefer `empty`, `make`, `add`, or `merge` for normal
* Context construction.
*
* **Example** (Creating a context from a map)
*
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
* @category constructors
* @since 4.0.0
*/
const makeUnsafe$2 = (mapUnsafe) => {
	const self = Object.create(Proto);
	self.mapUnsafe = mapUnsafe;
	self.mutable = false;
	return self;
};
const Proto = {
	...PipeInspectableProto,
	[TypeId$2]: { _Services: (_) => _ },
	toJSON() {
		return {
			_id: "Context",
			services: Array.from(this.mapUnsafe).map(([key, value]) => ({
				key,
				value
			}))
		};
	},
	[symbol](that) {
		if (!isContext(that) || this.mapUnsafe.size !== that.mapUnsafe.size) return false;
		for (const k of this.mapUnsafe.keys()) if (!that.mapUnsafe.has(k) || !equals(this.mapUnsafe.get(k), that.mapUnsafe.get(k))) return false;
		return true;
	},
	[symbol$1]() {
		return number(this.mapUnsafe.size);
	}
};
/**
* Checks if the provided argument is a `Context`.
*
* **Example** (Checking for contexts)
*
* ```ts
* import { Context } from "effect"
* import * as assert from "node:assert"
*
* assert.strictEqual(Context.isContext(Context.empty()), true)
* ```
*
* @category guards
* @since 2.0.0
*/
const isContext = (u) => hasProperty(u, TypeId$2);
/**
* Checks if the provided argument is a `Reference`.
*
* **Example** (Checking for references)
*
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
* @category guards
* @since 3.11.0
*/
const isReference = (u) => hasProperty(u, ReferenceTypeId);
/**
* Creates a new `Context` with a single service associated to the key.
*
* **Example** (Creating a context with one service)
*
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
* @category constructors
* @since 2.0.0
*/
const make = (key, service) => makeUnsafe$2(new Map([[key.key, service]]));
/**
* Gets the service for a key, or evaluates the fallback when a non-reference
* key is absent.
*
* **Details**
*
* If the key is a `Context.Reference` and no override is stored in the
* context, its cached default value is returned instead of the fallback.
*
* **Example** (Falling back for missing services)
*
* ```ts
* import { Context } from "effect"
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
* console.log(logger === Context.get(context, Logger)) // true
* console.log(database.query("SELECT 1")) // "fallback"
* ```
*
* @category getters
* @since 3.7.0
*/
const getOrElse = /* @__PURE__ */ dual(3, (self, key, orElse) => {
	if (self.mapUnsafe.has(key.key)) return self.mapUnsafe.get(key.key);
	return isReference(key) ? getDefaultValue(key) : orElse();
});
/**
* Get a service from the context that corresponds to the given key.
*
* **Example** (Getting a service from a context)
*
* ```ts
* import { Context, pipe } from "effect"
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
* @category getters
* @since 2.0.0
*/
const get = /* @__PURE__ */ dual(2, (self, service) => {
	if (!self.mapUnsafe.has(service.key)) {
		if (ReferenceTypeId in service) return getDefaultValue(service);
		throw serviceNotFoundError(service);
	}
	return self.mapUnsafe.get(service.key);
});
/**
* Gets the value for a `Context.Reference`, returning its cached default when
* the context does not contain an override.
*
* **Example** (Getting reference defaults unsafely)
*
* ```ts
* import { Context } from "effect"
*
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
* })
*
* const context = Context.empty()
* const logger = Context.getReferenceUnsafe(context, LoggerRef)
*
* console.log(typeof logger.log) // "function"
* ```
*
* @category unsafe
* @since 4.0.0
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
* Merges any number of `Context`s into one.
*
* **Details**
*
* When multiple contexts contain the same service key, the service from the
* last context with that key is kept.
*
* **Example** (Merging multiple contexts)
*
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
* @category combining
* @since 3.12.0
*/
const mergeAll$1 = (...ctxs) => {
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i < ctxs.length; i++) ctxs[i].mapUnsafe.forEach((value, key) => {
		map.set(key, value);
	});
	return makeUnsafe$2(map);
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
* **Example** (Creating references with default values)
*
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
* @category references
* @since 3.11.0
*/
const Reference = Service;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/array.js
/**
* @since 2.0.0
*/
/** @internal */
const isArrayNonEmpty = (self) => self.length > 0;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Array.js
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
* **When to use**
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
* **Details**
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
const fromIterable = (collection) => Array$1.isArray(collection) ? collection : Array$1.from(collection);
/**
* Concatenates two iterables into a single array.
*
* **Details**
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
const appendAll = /* @__PURE__ */ dual(2, (self, that) => fromIterable(self).concat(fromIterable(that)));
Array$1.isArray;
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
* @since 4.0.0
*/
const isReadonlyArrayNonEmpty = isArrayNonEmpty;
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
	const a = fromIterable(self);
	const b = fromIterable(that);
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
const union = /* @__PURE__ */ dual(2, (self, that) => unionWith(self, that, asEquivalence()));
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
	const input = fromIterable(self);
	if (isReadonlyArrayNonEmpty(input)) {
		const out = [headNonEmpty(input)];
		const rest = tailNonEmpty(input);
		for (const r of rest) if (out.every((a) => !isEquivalent(r, a))) out.push(r);
		return out;
	}
	return [];
});
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Scheduler.js
/**
* The `Scheduler` module defines the runtime scheduling services used by
* Effect fibers. A scheduler decides how runnable tasks are enqueued, when they
* are dispatched, and whether a fiber should yield after consuming its
* operation budget.
*
* **Common tasks**
*
* - Use {@link Scheduler} to provide a custom runtime scheduler
* - Use {@link MixedScheduler} for the default priority-aware scheduler
* - Use {@link MaxOpsBeforeYield} to tune fairness for CPU-bound fibers
* - Use {@link PreventSchedulerYield} only when a runtime should bypass yield checks
*
* **Gotchas**
*
* - Scheduler priorities affect the order of queued runtime tasks, not the
*   semantic result of an `Effect`
* - Disabling scheduler yields can improve throughput for controlled workloads,
*   but it can also let long-running fibers monopolize the JavaScript thread
*
* @since 2.0.0
*/
/**
* Context reference for the scheduler used by the Effect runtime.
*
* **Details**
*
* The default value creates a `MixedScheduler`. Provide this service to
* customize execution mode, task dispatching, or yield behavior.
*
* @category references
* @since 2.0.0
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
* A scheduler implementation that batches queued tasks and dispatches them by
* priority.
*
* **Details**
*
* `MixedScheduler` supports synchronous and asynchronous execution modes, uses
* operation counts to decide when fibers should yield, and is the default
* scheduler implementation.
*
* @category schedulers
* @since 2.0.0
*/
var MixedScheduler = class {
	executionMode;
	setImmediate;
	constructor(executionMode = "async", setImmediateFn = setImmediate) {
		this.executionMode = executionMode;
		this.setImmediate = setImmediateFn;
	}
	/**
	* Returns whether the fiber has reached its operation budget and should yield.
	*
	* @since 2.0.0
	*/
	shouldYield(fiber) {
		return fiber.currentOpCount >= fiber.maxOpsBeforeYield;
	}
	/**
	* Creates a dispatcher that schedules work through this scheduler.
	*
	* @since 4.0.0
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
* can perform before yielding control back to the scheduler.
*
* **Details**
*
* The default value is `2048` operations, which balances performance and
* fairness by helping prevent long-running fibers from monopolizing the
* execution thread.
*
* @category references
* @since 4.0.0
*/
const MaxOpsBeforeYield = /* @__PURE__ */ Reference("effect/Scheduler/MaxOpsBeforeYield", { defaultValue: () => 2048 });
/**
* A service reference that controls whether the runtime should bypass scheduler
* yield checks. When set to `true`, the fiber run loop won't call
* `Scheduler.shouldYield`.
*
* @category references
* @since 4.0.0
*/
const PreventSchedulerYield = /* @__PURE__ */ Reference("effect/Scheduler/PreventSchedulerYield", { defaultValue: () => false });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Tracer.js
/**
* The `Tracer` module defines the low-level tracing model used by Effect to
* describe and propagate spans. A span records the lifetime of an operation,
* including its name, parent, attributes, links, annotations, sampling decision,
* kind, and completion status.
*
* **Mental model**
*
* - `Tracer` is the backend interface responsible for creating spans
* - `Span` values represent Effect-managed operations with mutable lifecycle
*   hooks for ending spans and adding attributes, events, or links
* - `ExternalSpan` represents trace context imported from another tracing
*   system so Effect spans can be parented by or linked to external work
* - `ParentSpan`, `Tracer`, and related context references control propagation,
*   sampling, and trace-level filtering through the Effect context
*
* **Common tasks**
*
* - Implement a custom tracing backend with {@link make}
* - Provide or inspect parent span context with {@link ParentSpan}
* - Convert external trace identifiers into Effect span values with
*   {@link externalSpan}
* - Configure span metadata with {@link SpanOptions}, {@link SpanKind}, and
*   {@link SpanLink}
* - Disable propagation or adjust trace filtering with
*   {@link DisablePropagation}, {@link CurrentTraceLevel}, and
*   {@link MinimumTraceLevel}
*
* **Gotchas**
*
* - This module exposes the tracing data model and backend hooks; most
*   application code should create spans through higher-level Effect APIs such
*   as `Effect.withSpan`
* - `ExternalSpan` only carries identity and metadata from another system; it
*   does not have lifecycle methods like `Span`
* - Propagation and sampling are context-dependent, so parent selection can be
*   affected by disabled propagation, root span options, and trace-level
*   thresholds
*
* @since 2.0.0
*/
/**
* The string key used to identify the `ParentSpan` context service.
*
* **Example** (Reading the parent span key)
*
* ```ts
* import { Tracer } from "effect"
*
* // The key used to identify parent spans in the context
* console.log(Tracer.ParentSpanKey) // "effect/Tracer/ParentSpan"
* ```
*
* @category tags
* @since 4.0.0
*/
const ParentSpanKey = "effect/Tracer/ParentSpan";
Service()(ParentSpanKey);
/**
* The string key used to identify the active `Tracer` context reference.
*
* @category references
* @since 4.0.0
*/
const TracerKey = "effect/Tracer";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/metric.js
/** @internal */
const FiberRuntimeMetricsKey = "effect/observability/Metric/FiberRuntimeMetricsKey";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/references.js
/** @internal */
const CurrentConcurrency = /* @__PURE__ */ Reference("effect/References/CurrentConcurrency", { defaultValue: () => "unbounded" });
/** @internal */
const CurrentStackFrame = /* @__PURE__ */ Reference("effect/References/CurrentStackFrame", { defaultValue: constUndefined });
/** @internal */
const CurrentLogLevel = /* @__PURE__ */ Reference("effect/References/CurrentLogLevel", { defaultValue: () => "Info" });
/** @internal */
const MinimumLogLevel = /* @__PURE__ */ Reference("effect/References/MinimumLogLevel", { defaultValue: () => "Info" });
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/effect.js
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
	[symbol](that) {
		return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
	}
	[symbol$1]() {
		return combine(string(`${this._tag}:${this.fiberId}`))(random(this.annotations));
	}
};
/** @internal */
const causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
/** @internal */
const hasInterrupts = (self) => self.reasons.some(isInterruptReason);
/** @internal */
const causeCombine = /* @__PURE__ */ dual(2, (self, that) => {
	if (self.reasons.length === 0) return that;
	else if (that.reasons.length === 0) return self;
	const newCause = new CauseImpl(union(self.reasons, that.reasons));
	return equals(self, newCause) ? self : newCause;
});
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
		if (this.currentStackFrame) cause = causeAnnotate(cause, make(StackTraceKey, this.currentStackFrame));
		if (annotations) cause = causeAnnotate(cause, annotations);
		this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
		if (this.interruptible) this.evaluate(failCause(this._interruptedCause));
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
		if (interruptChildren !== void 0) return this.evaluate(flatMap(interruptChildren, () => exit));
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
					current = flatMap(yieldNow, () => prev);
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
	return makeUnsafe$2(annotations);
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
		resume(succeed(exits));
	}
	loop();
	return sync(() => cancel?.());
});
/** @internal */
const fiberInterruptAll = (fibers) => withFiber((parent) => {
	const annotations = fiberStackAnnotations(parent);
	for (const fiber of fibers) fiber.interruptUnsafe(parent.id, annotations);
	return asVoid(fiberAwaitAll(fibers));
});
/** @internal */
const succeed = exitSucceed;
/** @internal */
const failCause = exitFailCause;
/** @internal */
const sync = /* @__PURE__ */ makePrimitive({
	op: "Sync",
	[evaluate](fiber) {
		const value = this[args]();
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
	}
});
/** @internal */
const suspend = /* @__PURE__ */ makePrimitive({
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
const void_ = /* @__PURE__ */ succeed(void 0);
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
		return hasInterrupts(cause) ? flatMap(this[args](), () => failCause(cause)) : failCause(cause);
	}
});
/** @internal */
const callback = (register) => callbackOptions(register, register.length >= 2);
/** @internal */
const gen$1 = (...args) => suspend(() => fromIteratorUnsafe(args.length === 1 ? args[0]() : args[1].call(args[0].self)));
/** @internal */
const fnUntraced = (body, ...pipeables) => {
	const fn = pipeables.length === 0 ? function() {
		return suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
	} : function() {
		let effect = suspend(() => fromIteratorUnsafe(body.apply(this, arguments)));
		for (let i = 0; i < pipeables.length; i++) effect = pipeables[i](effect, ...arguments);
		return effect;
	};
	return defineFunctionLength(body.length, fn);
};
const defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
	value: length,
	configurable: true
});
const fromIteratorUnsafe = /* @__PURE__ */ makePrimitive({
	op: "Iterator",
	single: false,
	[contA](value, fiber) {
		const iter = this[args][0];
		while (true) {
			const state = iter.next(value);
			if (state.done) return succeed(state.value);
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
	const b = succeed(value);
	return flatMap(self, (_) => b);
});
/** @internal */
const andThen = /* @__PURE__ */ dual(2, (self, f) => flatMap(self, (a) => isEffect(f) ? f : internalCall(() => f(a))));
/** @internal */
const asVoid = (self) => flatMap(self, (_) => exitVoid);
/** @internal */
const flatMap = /* @__PURE__ */ dual(2, (self, f) => {
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
const map = /* @__PURE__ */ dual(2, (self, f) => flatMap(self, (a) => succeed(internalCall(() => f(a)))));
/** @internal */
const exitVoid = /* @__PURE__ */ exitSucceed(void 0);
/** @internal */
const exitAsVoidAll = (exits) => {
	const failures = [];
	for (const exit of exits) if (exit._tag === "Failure") failures.push(...exit.cause.reasons);
	return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
/** @internal */
const exit = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
const exitPrimitive = /* @__PURE__ */ makePrimitive({
	op: "Exit",
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args];
	},
	[contA](value, _, exit) {
		return succeed(exit ?? exitSucceed(value));
	},
	[contE](cause, _, exit) {
		return succeed(exit ?? exitFailCause(cause));
	}
});
/** @internal */
const ScopeTypeId = "~effect/Scope";
/** @internal */
const ScopeCloseableTypeId = "~effect/Scope/Closeable";
/** @internal */
const scopeClose = (self, exit_) => suspend(() => scopeCloseUnsafe(self, exit_) ?? void_);
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
const scopeCloseFinalizers = /* @__PURE__ */ fnUntraced(function* (self, finalizers, exit_) {
	let exits = [];
	const fibers = [];
	const arr = Array.from(finalizers.values());
	const parent = getCurrentFiber();
	for (let i = arr.length - 1; i >= 0; i--) {
		const finalizer = arr[i];
		if (self.strategy === "sequential") exits.push(yield* exit(finalizer(exit_)));
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
	scopeAddFinalizerUnsafe(newScope, key, (_) => sync(() => scopeRemoveFinalizerUnsafe(scope, key)));
	return newScope;
};
/** @internal */
const scopeAddFinalizerExit = (scope, finalizer) => {
	return suspend(() => {
		if (scope.state._tag === "Closed") return finalizer(scope.state.exit);
		scopeAddFinalizerUnsafe(scope, {}, finalizer);
		return void_;
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
const onExit = /* @__PURE__ */ dual(2, /* @__PURE__ */ makePrimitive({
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
		return eff ? flatMap(eff, (_) => exit) : exit;
	},
	[contE](cause, _, exit) {
		exit ??= exitFailCause(cause);
		const eff = this[args][1](exit);
		return eff ? flatMap(eff, (_) => exit) : exit;
	}
}));
const setInterruptibleTrue = /* @__PURE__ */ (/* @__PURE__ */ makePrimitive({
	op: "SetInterruptible",
	[contAll](fiber) {
		fiber.interruptible = this[args];
		if (fiber._interruptedCause && fiber.interruptible) return () => failCause(fiber._interruptedCause);
	}
}))(true);
/** @internal */
const whileLoop = /* @__PURE__ */ makePrimitive({
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
const forEach = /* @__PURE__ */ dual((args) => typeof args[1] === "function", (iterable, f, options) => withFiber((parent) => {
	const concurrencyOption = options?.concurrency === "inherit" ? parent.getRef(CurrentConcurrency) : options?.concurrency ?? 1;
	const concurrency = concurrencyOption === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrencyOption);
	if (concurrency === 1) return forEachSequential(iterable, f, options);
	const items = fromIterable(iterable);
	let length = items.length;
	if (length === 0) return options?.discard ? void_ : succeed([]);
	const out = options?.discard ? void 0 : new Array(length);
	const eff = forEachConcurrent({
		f,
		out
	}, items, { concurrency });
	return eff ? as(eff, out) : succeed(out);
}));
const forEachSequential = (iterable, f, options) => suspend(() => {
	const out = options?.discard ? void 0 : [];
	const iterator = iterable[Symbol.iterator]();
	let state = iterator.next();
	let index = 0;
	return as(whileLoop({
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
				} else if (concurrency === 1) return flatMap(exit(eff), (exit) => {
					terminal = step(state, item, exit, index);
					index++;
					return terminal ?? go() ?? void_;
				});
				else if (!parentFiber) return callback((cb) => {
					parentFiber = getCurrentFiber();
					effect = eff;
					resume = cb;
					const result = go();
					if (result) return cb(result);
					return suspend(() => {
						terminal = exitVoid;
						interrupted = true;
						return fibers ? fiberInterruptAll(fibers) : void_;
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
						} else if (done && fibers.size === 0) resume(terminal ?? void_);
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
				else if (fibers.size === 0) resume(void_);
			}
		};
		return go();
	};
};
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
TaggedError("TimeoutError");
TaggedError("IllegalArgumentError");
TaggedError("ExceededCapacityError");
TaggedError("AsyncFiberError");
TaggedError("UnknownError");
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
* Synchronously creates an empty `Deferred` outside the `Effect` runtime.
*
* **When to use**
*
* Prefer `Deferred.make` in effectful code so allocation is represented in
* `Effect`; use this only when direct synchronous allocation is required.
*
* **Example** (Creating a Deferred unsafely)
*
* ```ts
* import { Deferred } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* console.log(deferred)
* ```
*
* @category unsafe
* @since 4.0.0
*/
const makeUnsafe$1 = () => {
	const self = Object.create(DeferredProto);
	self.resumes = void 0;
	self.effect = void 0;
	return self;
};
const _await = (self) => callback((resume) => {
	if (self.effect) return resume(self.effect);
	self.resumes ??= [];
	self.resumes.push(resume);
	return sync(() => {
		const index = self.resumes.indexOf(resume);
		self.resumes.splice(index, 1);
	});
});
/**
* Exits the `Deferred` with the specified `Exit` value, which will be
* propagated to all fibers waiting on the value of the `Deferred`.
*
* **Example** (Completing a Deferred with an Exit)
*
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
* @category utils
* @since 2.0.0
*/
const done = /* @__PURE__ */ dual(2, (self, effect) => sync(() => doneUnsafe(self, effect)));
/**
* Synchronously attempts to complete the `Deferred` with the specified
* completion effect.
*
* **Details**
*
* This mutates the `Deferred` directly and should be reserved for low-level
* code; prefer the effectful completion APIs when possible. Returns `true` if
* this call completed the `Deferred`, or `false` if it was already completed.
*
* **Example** (Completing a Deferred unsafely)
*
* ```ts
* import { Deferred, Effect } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* const success = Deferred.doneUnsafe(deferred, Effect.succeed(42))
* console.log(success) // true
* ```
*
* @category unsafe
* @since 4.0.0
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
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Scope.js
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
* Creates a new `Scope` synchronously without wrapping it in an `Effect`.
* This is useful when you need a scope immediately but should be used with caution
* as it doesn't provide the same safety guarantees as the `Effect`-wrapped version.
*
* **Example** (Creating a scope synchronously)
*
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
* @category constructors
* @since 4.0.0
*/
const makeUnsafe = scopeMakeUnsafe;
/**
* Synchronously creates a closeable child scope registered with a parent scope.
*
* **Details**
*
* Closing the parent closes the child with the same exit value, and closing the
* child detaches it from the parent. The optional finalizer strategy configures
* the child scope and defaults to `"sequential"` when omitted.
*
* **Example** (Creating a child scope synchronously)
*
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
* @category combinators
* @since 4.0.0
*/
const forkUnsafe = scopeForkUnsafe;
/**
* Closes a scope, running all registered finalizers in the appropriate order.
* The exit value is passed to each finalizer.
*
* **Example** (Running scope finalizers)
*
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
* @since 2.0.0
*/
const close = scopeClose;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Layer.js
const TypeId = "~effect/Layer";
const MemoMapTypeId = "~effect/Layer/MemoMap";
const memoMapReuse = (entry, scope) => {
	entry.observers++;
	return andThen(scopeAddFinalizerExit(scope, (exit) => entry.finalizer(exit)), entry.effect);
};
const LayerProto = {
	[TypeId]: {
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
* Constructs a `Layer` from a function that uses a `MemoMap` and `Scope` to
* build the layer.
*
* **Details**
*
* The function receives a `MemoMap` for memoization and a `Scope` for resource management.
* A child scope is created, and if the build fails, the child scope is closed.
*
* **Example** (Constructing a layer from a build function)
*
* ```ts
* import { Context, Effect, Layer } from "effect"
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
* @category constructors
* @since 4.0.0
*/
const fromBuild = (build) => fromBuildUnsafe((memoMap, scope) => {
	const layerScope = forkUnsafe(scope);
	return onExit(build(memoMap, layerScope), (exit) => exit._tag === "Failure" ? close(layerScope, exit) : void_);
});
const memoMapBuild = (memoMap, layer, scope, build) => {
	const layerScope = makeUnsafe();
	const deferred = makeUnsafe$1();
	const entry = {
		observers: 1,
		effect: _await(deferred),
		finalizer: (exit) => suspend(() => {
			entry.observers--;
			if (entry.observers === 0) {
				memoMap.map.delete(layer);
				return close(layerScope, exit);
			}
			return void_;
		})
	};
	memoMap.map.set(layer, entry);
	return scopeAddFinalizerExit(scope, entry.finalizer).pipe(flatMap(() => build(memoMap, layerScope)), onExit((exit) => {
		entry.effect = exit;
		return done(deferred, exit);
	}));
};
var MemoMapImpl = class {
	get [MemoMapTypeId]() {
		return MemoMapTypeId;
	}
	parent;
	constructor(parent) {
		this.parent = parent;
	}
	map = /* @__PURE__ */ new Map();
	get(layer, scope) {
		const local = this.map.get(layer);
		if (local) return memoMapReuse(local, scope);
		return this.parent?.get(layer, scope);
	}
	getOrElseMemoize(layer, scope, build) {
		const existing = this.get(layer, scope);
		if (existing) return existing;
		return memoMapBuild(this, layer, scope, build);
	}
};
/**
* Constructs a `MemoMap` that can be used to build additional layers.
*
* **Example** (Creating a memo map unsafely)
*
* ```ts
* import { Context, Effect, Layer } from "effect"
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
*   const dbLayer = Layer.succeed(Database, {
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*   const context = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
*
*   return Context.get(context, Database)
* })
* ```
*
* @category memo map
* @since 4.0.0
*/
const makeMemoMapUnsafe = () => new MemoMapImpl();
(class extends Service()("effect/Layer/CurrentMemoMap") {
	static getOrCreate = /* @__PURE__ */ getOrElse(this, makeMemoMapUnsafe);
});
const mergeAllEffect = (layers, memoMap, scope) => {
	const parentScope = forkUnsafe(scope, "parallel");
	return forEach(layers, (layer) => layer.build(memoMap, forkUnsafe(parentScope, "sequential")), { concurrency: layers.length }).pipe(map((context) => mergeAll$1(...context)));
};
/**
* Combines all the provided layers concurrently, creating a new layer with
* merged input, error, and output types.
*
* **When to use**
*
* Use this when you need to combine multiple independent layers.
*
* **Details**
*
* All layers are built concurrently, and their outputs are merged into a single layer.
*
* If multiple merged layers depend on the same layer value, that dependency is
* shared by default. Reuse a named layer value when you want services to share
* the same resource, such as one database pool.
*
* **Example** (Merging independent layers)
*
* ```ts
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* const dbLayer = Layer.succeed(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
* })
* const loggerLayer = Layer.succeed(Logger, {
*   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
* })
*
* const mergedLayer = Layer.mergeAll(dbLayer, loggerLayer)
* ```
*
* @see {@link merge} for merging one layer with another layer or array
*
* @category zipping
* @since 2.0.0
*/
const mergeAll = (...layers) => fromBuild((memoMap, scope) => mergeAllEffect(layers, memoMap, scope));
/**
* Merges this layer with another layer concurrently, producing a new layer with
* combined input, error, and output types.
*
* **When to use**
*
* Use `merge` when composing from an existing layer in a pipeline. Use
* `mergeAll` when you already have all layers as separate arguments.
*
* **Details**
*
* This is a binary version of `mergeAll` that merges exactly two layers or one
* layer with an array of layers. The layers are built concurrently and their
* outputs are combined.
*
* **Example** (Merging two layers)
*
* ```ts
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* const dbLayer = Layer.succeed(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
* })
* const loggerLayer = Layer.succeed(Logger, {
*   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
* })
*
* const mergedLayer = Layer.merge(dbLayer, loggerLayer)
* ```
*
* @see {@link mergeAll} for merging several layers at once
*
* @category zipping
* @since 2.0.0
*/
const merge = /* @__PURE__ */ dual(2, (self, that) => mergeAll(self, ...Array.isArray(that) ? that : [that]));
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Effect.js
/**
* Provides a way to write effectful code using generator functions, simplifying
* control flow and error handling.
*
* **When to use**
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
* **Example** (Sequencing effects with generators)
*
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
* @category Creating Effects
* @since 2.0.0
*/
const gen = gen$1;
Service()("effect/Effect/Transaction");
//#endregion
//#region ../platform-cloudflare/src/stack.ts
const defaultHarborPlatformCloudflareBindingNames = {
	database: "DB",
	artifactBucket: "BUCKET",
	cacheNamespace: "KV",
	harborExecWorkflow: "HARBOR_EXEC_WORKFLOW",
	toolIndexWorkflow: "TOOL_INDEX_WORKFLOW",
	openApiImportWorkflow: "OPENAPI_IMPORT_WORKFLOW"
};
function harborPlatformCloudflareBindingNames(overrides = {}) {
	return {
		database: overrides.database ?? defaultHarborPlatformCloudflareBindingNames.database,
		artifactBucket: overrides.artifactBucket ?? defaultHarborPlatformCloudflareBindingNames.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaultHarborPlatformCloudflareBindingNames.cacheNamespace,
		harborExecWorkflow: Object.hasOwn(overrides, "harborExecWorkflow") ? overrides.harborExecWorkflow : defaultHarborPlatformCloudflareBindingNames.harborExecWorkflow,
		toolIndexWorkflow: Object.hasOwn(overrides, "toolIndexWorkflow") ? overrides.toolIndexWorkflow : defaultHarborPlatformCloudflareBindingNames.toolIndexWorkflow,
		openApiImportWorkflow: Object.hasOwn(overrides, "openApiImportWorkflow") ? overrides.openApiImportWorkflow : defaultHarborPlatformCloudflareBindingNames.openApiImportWorkflow,
		sessionsObject: Object.hasOwn(overrides, "sessionsObject") ? overrides.sessionsObject : defaultHarborPlatformCloudflareBindingNames.sessionsObject
	};
}
function createHarborPlatformCloudflareStackSpec(options) {
	return {
		name: options.stackName,
		bindings: harborPlatformCloudflareBindingNames(options.bindingNames)
	};
}
const defaultHarborPlatformCloudflareResourceIds = (stackName) => ({
	apiWorker: stackName + "-api",
	database: stackName + "-db",
	artifactBucket: stackName + "-artifacts",
	cacheNamespace: stackName + "-kv",
	harborExecWorkflow: stackName + "-exec-workflow",
	toolIndexWorkflow: stackName + "-tool-index-workflow",
	openApiImportWorkflow: stackName + "-openapi-import-workflow",
	sessionsObject: stackName + "-sessions"
});
const resolveHarborPlatformCloudflareResourceIds = (stackName, overrides = {}) => {
	const defaults = defaultHarborPlatformCloudflareResourceIds(stackName);
	return {
		apiWorker: overrides.apiWorker ?? defaults.apiWorker,
		database: overrides.database ?? defaults.database,
		artifactBucket: overrides.artifactBucket ?? defaults.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaults.cacheNamespace,
		harborExecWorkflow: overrides.harborExecWorkflow ?? defaults.harborExecWorkflow,
		toolIndexWorkflow: overrides.toolIndexWorkflow ?? defaults.toolIndexWorkflow,
		openApiImportWorkflow: overrides.openApiImportWorkflow ?? defaults.openApiImportWorkflow,
		sessionsObject: overrides.sessionsObject ?? defaults.sessionsObject
	};
};
const workflowBindingName$1 = (bindings, key) => {
	if (key === "harborExec") return bindings.harborExecWorkflow;
	if (key === "toolIndex") return bindings.toolIndexWorkflow;
	return bindings.openApiImportWorkflow;
};
const workflowResourceId$1 = (resources, key) => {
	if (key === "harborExec") return resources.harborExecWorkflow;
	if (key === "toolIndex") return resources.toolIndexWorkflow;
	return resources.openApiImportWorkflow;
};
const definedBindingNames = (bindings) => [
	bindings.database,
	bindings.artifactBucket,
	bindings.cacheNamespace,
	bindings.harborExecWorkflow,
	bindings.toolIndexWorkflow,
	bindings.openApiImportWorkflow,
	bindings.sessionsObject
].filter((binding) => typeof binding === "string" && binding.length > 0);
const duplicateValues = (values) => {
	const seen = /* @__PURE__ */ new Set();
	const duplicates = /* @__PURE__ */ new Set();
	for (const value of values) {
		if (seen.has(value)) duplicates.add(value);
		seen.add(value);
	}
	return Array.from(duplicates).sort();
};
function createHarborPlatformCloudflareStackDeclaration(options) {
	const spec = createHarborPlatformCloudflareStackSpec(options);
	const resourceIds = resolveHarborPlatformCloudflareResourceIds(options.stackName, options.resourceIds);
	const workflowEntries = Object.entries(options.workflows ?? {});
	const workflowResources = {};
	for (const [key, workflow] of workflowEntries) {
		const binding = workflowBindingName$1(spec.bindings, key);
		workflowResources[key] = {
			id: workflowResourceId$1(resourceIds, key),
			kind: "workflow",
			binding,
			metadata: {
				workflowName: workflow.workflowName,
				className: workflow.className
			}
		};
	}
	const requiredBindings = [
		spec.bindings.database,
		spec.bindings.artifactBucket,
		spec.bindings.cacheNamespace,
		...workflowEntries.flatMap(([key]) => {
			const binding = workflowBindingName$1(spec.bindings, key);
			return binding ? [binding] : [];
		}),
		...spec.bindings.sessionsObject ? [spec.bindings.sessionsObject] : []
	];
	const warnings = [...spec.bindings.sessionsObject ? ["sessionsObject declares a future Durable Object binding; platform-cloudflare does not provision the namespace yet."] : []];
	return {
		spec,
		resources: {
			apiWorker: {
				id: resourceIds.apiWorker,
				kind: "worker",
				metadata: { main: options.apiWorker.main }
			},
			database: {
				id: resourceIds.database,
				kind: "d1_database",
				binding: spec.bindings.database
			},
			artifactBucket: {
				id: resourceIds.artifactBucket,
				kind: "r2_bucket",
				binding: spec.bindings.artifactBucket
			},
			cacheNamespace: {
				id: resourceIds.cacheNamespace,
				kind: "kv_namespace",
				binding: spec.bindings.cacheNamespace
			},
			workflows: workflowResources,
			...spec.bindings.sessionsObject ? { sessionsObject: {
				id: resourceIds.sessionsObject,
				kind: "durable_object_namespace",
				binding: spec.bindings.sessionsObject
			} } : {}
		},
		requiredBindings,
		warnings
	};
}
function validateHarborPlatformCloudflareStackDeclaration(declaration) {
	const errors = [];
	const warnings = [...declaration.warnings];
	if (declaration.spec.name.trim().length === 0) errors.push("stackName must be a non-empty string.");
	const workerMain = declaration.resources.apiWorker.metadata?.main;
	if (!workerMain || workerMain.trim().length === 0) errors.push("apiWorker.main must be a non-empty path.");
	const duplicateBindings = duplicateValues(definedBindingNames(declaration.spec.bindings));
	for (const binding of duplicateBindings) errors.push("binding name must be unique: " + binding);
	const resourceIds = [
		declaration.resources.apiWorker.id,
		declaration.resources.database.id,
		declaration.resources.artifactBucket.id,
		declaration.resources.cacheNamespace.id,
		...Object.values(declaration.resources.workflows).map((resource) => resource.id),
		...declaration.resources.sessionsObject ? [declaration.resources.sessionsObject.id] : []
	];
	for (const id of duplicateValues(resourceIds)) errors.push("resource id must be unique: " + id);
	for (const [key, resource] of Object.entries(declaration.resources.workflows)) if (!resource.binding) errors.push(key + " workflow resource requires a workflow binding name.");
	if (declaration.requiredBindings.length === 0) errors.push("at least one platform binding must be declared.");
	return {
		ok: errors.length === 0,
		errors,
		warnings
	};
}
//#endregion
//#region ../platform-cloudflare/src/deploy.ts
const assertValidDeclaration = (declaration) => {
	const validation = validateHarborPlatformCloudflareStackDeclaration(declaration);
	if (!validation.ok) throw new Error("Invalid Harbor platform Cloudflare stack declaration: " + validation.errors.join("; "));
};
const workflowBindingName = (bindingNames, key) => {
	if (key === "harborExec") return bindingNames.harborExecWorkflow;
	if (key === "toolIndex") return bindingNames.toolIndexWorkflow;
	return bindingNames.openApiImportWorkflow;
};
const workflowResourceId = (resourceIds, key) => {
	if (key === "harborExec") return resourceIds.harborExecWorkflow;
	if (key === "toolIndex") return resourceIds.toolIndexWorkflow;
	return resourceIds.openApiImportWorkflow;
};
const workflowEntries = (workflows) => Object.entries(workflows ?? {});
function createHarborPlatformCloudflareStack(options) {
	const declaration = createHarborPlatformCloudflareStackDeclaration({
		stackName: options.stackName,
		bindingNames: options.bindingNames,
		resourceIds: options.resourceIds,
		apiWorker: { main: options.apiWorker.main },
		workflows: options.workflows
	});
	assertValidDeclaration(declaration);
	const bindingNames = harborPlatformCloudflareBindingNames(options.bindingNames);
	const resourceIds = resolveHarborPlatformCloudflareResourceIds(options.stackName, options.resourceIds);
	return Alchemy.Stack(options.stackName, {
		providers: merge(Cloudflare.providers(), Cloudflare.WorkflowProvider()),
		state: Cloudflare.state()
	}, gen(function* () {
		const database = yield* Cloudflare.D1Database(resourceIds.database, options.database ?? {});
		const artifactBucket = yield* Cloudflare.R2Bucket(resourceIds.artifactBucket, options.artifactBucket ?? {});
		const cacheNamespace = yield* Cloudflare.KVNamespace(resourceIds.cacheNamespace, options.cacheNamespace ?? {});
		const bindings = {
			...options.apiWorker.bindings ?? {},
			[bindingNames.database]: database,
			[bindingNames.artifactBucket]: artifactBucket,
			[bindingNames.cacheNamespace]: cacheNamespace
		};
		const apiWorker = yield* Cloudflare.Worker(resourceIds.apiWorker, {
			...options.apiWorker.props ?? {},
			main: options.apiWorker.main,
			bindings
		});
		const workflowOutputs = {};
		for (const [key, workflow] of workflowEntries(options.workflows)) {
			const bindingName = workflowBindingName(bindingNames, key);
			if (!bindingName) continue;
			yield* apiWorker.bind`${bindingName}`({ bindings: [{
				type: "workflow",
				name: bindingName,
				workflowName: workflow.workflowName,
				className: workflow.className
			}] });
			const workflowResource = yield* Cloudflare.WorkflowResource(workflowResourceId(resourceIds, key), {
				workflowName: workflow.workflowName,
				className: workflow.className,
				scriptName: apiWorker.workerName
			});
			workflowOutputs[key] = {
				workflowId: workflowResource.workflowId,
				workflowName: workflowResource.workflowName,
				className: workflowResource.className
			};
		}
		return {
			declaration,
			apiWorker: {
				workerId: apiWorker.workerId,
				workerName: apiWorker.workerName,
				url: apiWorker.url
			},
			database: {
				databaseId: database.databaseId,
				databaseName: database.databaseName
			},
			artifactBucket: { bucketName: artifactBucket.bucketName },
			cacheNamespace: {
				namespaceId: cacheNamespace.namespaceId,
				title: cacheNamespace.title
			},
			workflows: workflowOutputs
		};
	}));
}
//#endregion
export { createHarborPlatformCloudflareStack };

//# sourceMappingURL=cloudflare-deploy.mjs.map