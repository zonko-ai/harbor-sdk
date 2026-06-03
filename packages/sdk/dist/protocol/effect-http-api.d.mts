import { Schema } from "effect";

//#region \0rolldown/runtime.js
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Types.d.ts
/**
 * Prevents TypeScript from inferring a type parameter from a specific
 * position.
 *
 * **When to use**
 *
 * Use on a function parameter when you want inference to come from other
 * parameters, not this one.
 *
 * **Details**
 *
 * The parameter using `NoInfer` must still match the inferred type.
 *
 * **Example** (Controlling inference)
 *
 * ```ts
 * import type { Types } from "effect"
 *
 * declare function withDefault<T>(value: T, fallback: Types.NoInfer<T>): T
 *
 * // T is inferred as "a" | "b" from the first argument only
 * const result = withDefault<"a" | "b">("a", "b")
 * ```
 *
 * @category models
 * @since 2.0.0
 */
type NoInfer$1<A> = [A][A extends any ? 0 : never];
/**
 * Function-type alias encoding covariant variance for a phantom type
 * parameter.
 *
 * **When to use**
 *
 * Use as a phantom field type to make a type parameter covariant in output
 * position.
 *
 * **Details**
 *
 * `Covariant<A>` is assignable to `Covariant<B>` when `A extends B`, following
 * the subtype direction.
 *
 * **Example** (Covariant phantom type)
 *
 * ```ts
 * import type { Types } from "effect"
 *
 * interface Producer<T> {
 *   readonly _phantom: Types.Covariant<T>
 *   readonly get: () => T
 * }
 * ```
 *
 * @see {@link Covariant.Type}
 * @see {@link Contravariant}
 * @see {@link Invariant}
 *
 * @category models
 * @since 2.0.0
 */
type Covariant<A> = (_: never) => A;
/**
 * Namespace for {@link Covariant}-related utilities.
 *
 * @since 3.9.0
 */
declare namespace Covariant {
  /**
   * Extracts the type parameter `A` from a `Covariant<A>`.
   *
   * **Example** (Extracting the inner type)
   *
   * ```ts
   * import type { Types } from "effect"
   *
   * type Inner = Types.Covariant.Type<Types.Covariant<string>>
   * // string
   * ```
   *
   * @see {@link Covariant}
   *
   * @category models
   * @since 3.9.0
   */
  type Type<A> = A extends Covariant<infer U> ? U : never;
}
/**
 * Function-type alias encoding contravariant variance for a phantom type
 * parameter.
 *
 * **When to use**
 *
 * Use as a phantom field type to make a type parameter contravariant in input
 * position.
 *
 * **Details**
 *
 * `Contravariant<A>` is assignable to `Contravariant<B>` when `B extends A`,
 * following the supertype direction.
 *
 * **Example** (Contravariant phantom type)
 *
 * ```ts
 * import type { Types } from "effect"
 *
 * interface Consumer<T> {
 *   readonly _phantom: Types.Contravariant<T>
 *   readonly accept: (value: T) => void
 * }
 * ```
 *
 * @see {@link Contravariant.Type}
 * @see {@link Covariant}
 * @see {@link Invariant}
 *
 * @category models
 * @since 2.0.0
 */
type Contravariant<A> = (_: A) => void;
/**
 * Namespace for {@link Contravariant}-related utilities.
 *
 * @since 3.9.0
 */
declare namespace Contravariant {
  /**
   * Extracts the type parameter `A` from a `Contravariant<A>`.
   *
   * **Example** (Extracting the inner type)
   *
   * ```ts
   * import type { Types } from "effect"
   *
   * type Inner = Types.Contravariant.Type<Types.Contravariant<string>>
   * // string
   * ```
   *
   * @see {@link Contravariant}
   *
   * @category models
   * @since 3.9.0
   */
  type Type<A> = A extends Contravariant<infer U> ? U : never;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Combiner.d.ts
/**
 * Represents a strategy for combining two values of the same type `A`. A
 * `Combiner` contains a single `combine` method that takes two values and
 * returns a merged result. It does not include an identity/empty value; use
 * `Reducer` when you need one.
 *
 * **When to use**
 *
 * Use `Combiner` when you need to describe how two values of the same type
 * merge, pass a reusable combining strategy to library functions like
 * `Struct.makeCombiner` or `Option.makeCombinerFailFast`, or define the
 * combining step for a `Reducer`.
 *
 * **Example** (number addition combiner)
 *
 * ```ts
 * import { Combiner } from "effect"
 *
 * const Sum = Combiner.make<number>((self, that) => self + that)
 *
 * console.log(Sum.combine(3, 4))
 * // Output: 7
 * ```
 *
 * @see {@link make} – create a `Combiner` from a function
 * @category models
 * @since 4.0.0
 */
interface Combiner<A> {
  /**
   * Combines two values into a new value.
   */
  readonly combine: (self: A, that: A) => A;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Equivalence.d.ts
/**
 * Represents an equivalence relation over type `A`.
 *
 * **When to use**
 *
 * - Use as a type annotation for equivalence functions
 * - Use when implementing custom equivalence logic
 * - Use when working with collection operations that require equivalence relations
 *
 * **Details**
 *
 * - Pure function: does not mutate inputs or have side effects
 * - Returns `boolean`: `true` if values are equivalent, `false` otherwise
 * - Must satisfy reflexive, symmetric, and transitive properties
 *
 * **Example** (Simple number equivalence)
 *
 * ```ts
 * import type { Equivalence } from "effect"
 *
 * const numberEq: Equivalence.Equivalence<number> = (a, b) => a === b
 *
 * console.log(numberEq(1, 1)) // true
 * console.log(numberEq(1, 2)) // false
 * ```
 *
 * **Example** (Custom object equivalence)
 *
 * ```ts
 * import type { Equivalence } from "effect"
 *
 * interface Point {
 *   x: number
 *   y: number
 * }
 *
 * const pointEq: Equivalence.Equivalence<Point> = (a, b) =>
 *   a.x === b.x && a.y === b.y
 *
 * console.log(pointEq({ x: 1, y: 2 }, { x: 1, y: 2 })) // true
 * ```
 *
 * @see {@link make}
 * @see {@link strictEqual}
 * @category type class
 * @since 2.0.0
 */
type Equivalence<in A> = (self: A, that: A) => boolean;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Hash.d.ts
/**
 * A type that represents an object that can be hashed.
 *
 * **Details**
 *
 * Objects implementing this interface provide a method to compute their hash value,
 * which is used for efficient comparison and storage operations.
 *
 * **Example** (Implementing Hash)
 *
 * ```ts
 * import { Hash } from "effect"
 *
 * class MyClass implements Hash.Hash {
 *   constructor(private value: number) {}
 *
 *   [Hash.symbol](): number {
 *     return Hash.hash(this.value)
 *   }
 * }
 *
 * const instance = new MyClass(42)
 * console.log(instance[Hash.symbol]()) // hash value of 42
 * ```
 *
 * @category models
 * @since 2.0.0
 */
interface Hash {
  [symbol](): number;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Equal.d.ts
/**
 * The interface for types that define their own equality logic.
 *
 * **When to use**
 *
 * - When you need value-based equality for a class (e.g. domain IDs,
 *   coordinates, money values).
 * - When your type will be stored in `HashMap` or `HashSet`.
 * - When the default structural comparison is too broad or too narrow for
 *   your type.
 *
 * **Details**
 *
 * Any object that implements both `[Equal.symbol]` (equality) and
 * `[Hash.symbol]` (hashing) is recognized by {@link equals} and by hash-based
 * collections such as `HashMap` and `HashSet`.
 *
 * - Extends `Hash.Hash`, so implementors **must** also provide `[Hash.symbol]`.
 * - The hash contract: if `a[Equal.symbol](b)` returns `true`, then
 *   `Hash.hash(a)` must equal `Hash.hash(b)`.
 * - {@link equals} delegates to this method when both operands implement it.
 *   If only one operand implements `Equal`, they are considered unequal.
 *
 * **Example** (Coordinate with Value Equality)
 *
 * ```ts
 * import { Equal, Hash } from "effect"
 *
 * class Coordinate implements Equal.Equal {
 *   constructor(readonly x: number, readonly y: number) {}
 *
 *   [Equal.symbol](that: Equal.Equal): boolean {
 *     return that instanceof Coordinate &&
 *       this.x === that.x &&
 *       this.y === that.y
 *   }
 *
 *   [Hash.symbol](): number {
 *     return Hash.string(`${this.x},${this.y}`)
 *   }
 * }
 *
 * console.log(Equal.equals(new Coordinate(1, 2), new Coordinate(1, 2))) // true
 * console.log(Equal.equals(new Coordinate(1, 2), new Coordinate(3, 4))) // false
 * ```
 *
 * @see {@link symbol} — the property key used by the equality method
 * @see {@link equals} — the main comparison function
 * @see {@link isEqual} — type guard for `Equal` implementors
 * @category models
 * @since 2.0.0
 */
interface Equal extends Hash {
  [symbol](that: Equal): boolean;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Inspectable.d.ts
/**
 * Interface for objects that can be inspected and provide custom string representations.
 *
 * **Details**
 *
 * Objects implementing this interface can control how they appear in debugging contexts,
 * JSON serialization, and Node.js inspection. This is particularly useful for creating
 * custom data types that display meaningful information during development.
 *
 * **Example** (Implementing inspectable objects)
 *
 * ```ts
 * import { Formatter, Inspectable } from "effect"
 *
 * class Result implements Inspectable.Inspectable {
 *   constructor(
 *     private readonly tag: "Success" | "Failure",
 *     private readonly value: unknown
 *   ) {}
 *
 *   toString(): string {
 *     return Formatter.format(this.toJSON())
 *   }
 *
 *   toJSON() {
 *     return { _tag: this.tag, value: this.value }
 *   }
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return this.toJSON()
 *   }
 * }
 *
 * const success = new Result("Success", 42)
 * console.log(success.toString()) // Pretty formatted JSON
 * ```
 *
 * @category models
 * @since 2.0.0
 */
interface Inspectable {
  toString(): string;
  toJSON(): unknown;
  [NodeInspectSymbol](): unknown;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Pipeable.d.ts
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
 * Interface for values that support method-style `pipe` composition.
 *
 * **Details**
 *
 * Calling `value.pipe(f, g, h)` passes the value through each function from
 * left to right, returning the final result. Many Effect data types implement
 * this so operations can be chained without nesting function calls.
 *
 * **Example** (Chaining operations with pipe)
 *
 * ```ts
 * import { Effect } from "effect"
 *
 * // The Pipeable interface allows Effect values to be chained using the pipe method
 * const program = Effect.succeed(1).pipe(
 *   Effect.map((x) => x + 1),
 *   Effect.flatMap((x) => Effect.succeed(x * 2)),
 *   Effect.tap((x) => Effect.log(`Result: ${x}`))
 * )
 * ```
 *
 * @category models
 * @since 2.0.0
 */
interface Pipeable {
  pipe<A>(this: A): A;
  pipe<A, B = never>(this: A, ab: (_: A) => B): B;
  pipe<A, B = never, C = never>(this: A, ab: (_: A) => B, bc: (_: B) => C): C;
  pipe<A, B = never, C = never, D = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D): D;
  pipe<A, B = never, C = never, D = never, E = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E): E;
  pipe<A, B = never, C = never, D = never, E = never, F = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F): F;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G): G;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H): H;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I): I;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J): J;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K): K;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L): L;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M): M;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N): N;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O): O;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P): P;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q): Q;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R): R;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S): S;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T): T;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never, U = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T, tu: (_: T) => U): U;
  pipe<A, B = never, C = never, D = never, E = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never, M = never, N = never, O = never, P = never, Q = never, R = never, S = never, T = never, U = never>(this: A, ab: (_: A) => B, bc: (_: B) => C, cd: (_: C) => D, de: (_: D) => E, ef: (_: E) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => L, lm: (_: L) => M, mn: (_: M) => N, no: (_: N) => O, op: (_: O) => P, pq: (_: P) => Q, qr: (_: Q) => R, rs: (_: R) => S, st: (_: S) => T, tu: (_: T) => U): U;
}
/**
 * Base constructor whose instances implement the standard `Pipeable.pipe`
 * method.
 *
 * **When to use**
 *
 * Extend or compose this constructor when defining a class that should support
 * Effect-style method chaining through `.pipe(...)`.
 *
 * @category constructors
 * @since 3.15.0
 */
declare const Class: new () => Pipeable;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Context.d.ts
/**
 * String literal type used as the runtime type identifier for `Context`
 * service keys.
 *
 * @category Type Identifiers
 * @since 4.0.0
 */
type ServiceTypeId = "~effect/Context/Service";
/**
 * Runtime type identifier attached to `Context` service keys and used by
 * `isKey` to recognize them.
 *
 * @category Type Identifiers
 * @since 4.0.0
 */
declare const ServiceTypeId: ServiceTypeId;
/**
 * Typed identifier for a service stored in a `Context`.
 *
 * **Details**
 *
 * `Identifier` tracks the requirement in Effect types, while `Shape` is the
 * service implementation retrieved by the key. A key is also an Effect value,
 * so yielding it inside `Effect.gen` retrieves the service from the current
 * fiber context.
 *
 * @category models
 * @since 4.0.0
 */
interface Key$1<out Identifier, out Shape> extends Effect<Shape, never, Identifier> {
  readonly [ServiceTypeId]: ServiceTypeId;
  readonly Service: Shape;
  readonly Identifier: Identifier;
  readonly key: string;
  readonly stack?: string | undefined;
}
declare const TypeId$10: "~effect/Context";
/**
 * Immutable collection of service implementations used for dependency
 * injection in Effect programs.
 *
 * **Details**
 *
 * The type parameter tracks the service identifiers available in the context.
 * At runtime, services are stored by each key's string `key`.
 *
 * **Example** (Creating a context with multiple services)
 *
 * ```ts
 * import { Context } from "effect"
 *
 * // Create a context with multiple services
 * const Logger = Context.Service<{ log: (msg: string) => void }>("Logger")
 * const Database = Context.Service<{ query: (sql: string) => string }>(
 *   "Database"
 * )
 *
 * const context = Context.make(Logger, {
 *   log: (msg: string) => console.log(msg)
 * })
 *   .pipe(Context.add(Database, { query: (sql) => `Result: ${sql}` }))
 * ```
 *
 * @category models
 * @since 2.0.0
 */
interface Context$2<in Services> extends Equal, Pipeable, Inspectable {
  readonly [TypeId$10]: {
    readonly _Services: Contravariant<Services>;
  };
  readonly mapUnsafe: ReadonlyMap<string, any>;
  mutable: boolean;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Unify.d.ts
/**
 * The `Unify` module contains the type-level protocol Effect uses to normalize
 * unions of data types that opt in to unification. It is primarily a library
 * authoring tool: data types expose hidden symbol properties describing how
 * their variants should be widened, and {@link Unify} turns those protocol
 * entries into the user-facing union type that TypeScript should infer.
 *
 * Most application code does not need to interact with these symbols directly.
 * The main runtime helper, {@link unify}, is an identity function that preserves
 * values and functions at runtime while applying {@link Unify} to the relevant
 * static type. This is useful when authoring APIs that return branded or
 * protocol-enabled values and need inference to collapse to the public Effect
 * data type rather than exposing implementation details.
 *
 * @since 2.0.0
 */
/**
 * A unique symbol used to identify unification behavior in Effect types.
 *
 * **Details**
 *
 * This symbol is used internally by the Effect type system to enable automatic
 * unification of Effect types in unions and complex type operations.
 *
 * @category symbols
 * @since 2.0.0
 */
declare const unifySymbol: unique symbol;
/**
 * The type of the unifySymbol.
 *
 * **Details**
 *
 * This type represents the unique symbol used for identifying unification
 * behavior in Effect types. It's typically used in type-level operations
 * to enable automatic type unification.
 *
 * @category symbols
 * @since 2.0.0
 */
type unifySymbol = typeof unifySymbol;
/**
 * A unique symbol used to identify the type information for unification.
 *
 * **Details**
 *
 * This symbol is used internally by the Effect type system to store type
 * information that can be used during type unification operations.
 *
 * @category symbols
 * @since 2.0.0
 */
declare const typeSymbol: unique symbol;
/**
 * The type of the typeSymbol.
 *
 * **Details**
 *
 * This type represents the unique symbol used for storing type information
 * in types that support unification. It's used in type-level operations
 * to access and manipulate type information.
 *
 * @category symbols
 * @since 2.0.0
 */
type typeSymbol = typeof typeSymbol;
/**
 * A unique symbol used to specify types that should be ignored during unification.
 *
 * **Details**
 *
 * This symbol is used internally by the Effect type system to mark types
 * that should be excluded from the unification process, allowing for more
 * precise type handling in complex scenarios.
 *
 * @category symbols
 * @since 2.0.0
 */
declare const ignoreSymbol: unique symbol;
/**
 * The type of the ignoreSymbol.
 *
 * **Details**
 *
 * This type represents the unique symbol used for marking types that should
 * be ignored during unification operations. It's used in type-level operations
 * to exclude specific types from the unification process.
 *
 * @category symbols
 * @since 2.0.0
 */
type ignoreSymbol = typeof ignoreSymbol;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/LogLevel.d.ts
/**
 * Log levels that represent actual message severities, excluding the `All` and
 * `None` sentinel levels.
 *
 * @category models
 * @since 4.0.0
 */
type Severity = "Fatal" | "Error" | "Warn" | "Info" | "Debug" | "Trace";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Formatter.d.ts
/**
 * A callable interface representing a function that converts a `Value` into a `Format`, which defaults to `string`.
 *
 * **When to use**
 *
 * Use `Formatter` when you want to type a formatting or rendering function generically, or when you are building a pipeline that accepts pluggable formatters.
 *
 * **Details**
 *
 * This is a pure callable type and carries no runtime implementation. It is contravariant in `Value` and covariant in `Format`.
 *
 * **Example** (Define a custom formatter)
 *
 * ```ts
 * import type { Formatter } from "effect"
 *
 * const upper: Formatter.Formatter<string> = (s) => s.toUpperCase()
 *
 * console.log(upper("hello"))
 * // HELLO
 * ```
 *
 * @see {@link format}
 * @see {@link formatJson}
 * @category models
 * @since 4.0.0
 */
interface Formatter<in Value, out Format = string> {
  (value: Value): Format;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/SchemaGetter.d.ts
/**
 * A composable transformation from an encoded type `E` to a decoded type `T`.
 *
 * **When to use**
 *
 * - Building custom schema transformations with `Schema.decodeTo` or `Schema.decode`.
 * - Composing multiple transformation steps into a single getter.
 *
 * **Details**
 *
 * - A getter wraps a function `Option<E> -> Effect<Option<T>, Issue, R>`.
 * - Receives `Option.None` when the encoded key is absent (e.g. missing struct field).
 * - Returns `Option.None` to omit the value from the decoded output.
 * - Fails with `Issue` on invalid input.
 * - May require Effect services via `R`.
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
 * @see {@link transform} - create a getter from a pure function
 * @see {@link passthrough} - identity getter
 * @see {@link transformOrFail} - fallible transformation
 *
 * @category models
 * @since 4.0.0
 */
declare class Getter<out T, in E, R = never> extends Class {
  readonly run: (input: Option<E>, options: ParseOptions) => Effect<Option<T>, Issue, R>;
  constructor(run: (input: Option<E>, options: ParseOptions) => Effect<Option<T>, Issue, R>);
  map<T2>(f: (t: T) => T2): Getter<T2, E, R>;
  compose<T2, R2>(other: Getter<T2, T, R2>): Getter<T2, E, R | R2>;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/SchemaTransformation.d.ts
/**
 * A middleware that wraps the entire parsing `Effect` pipeline for both
 * decode and encode directions.
 *
 * **When to use**
 *
 * - You need to catch or recover from parsing errors (e.g. `Schema.catchDecoding`).
 * - You need to run side effects around the parsing pipeline.
 * - You need access to the full `Effect` rather than a single decoded value.
 *
 * **Details**
 *
 * Unlike `Transformation`, which operates on individual values via `Getter`,
 * `Middleware` receives the full `Effect` produced by the inner schema and can
 * intercept, modify, retry, or replace it.
 *
 * - Immutable — constructing a Middleware does not mutate existing instances.
 * - `decode` receives an `Effect<Option<E>, Issue, RDE>` and returns
 *   `Effect<Option<T>, Issue, RDT>`.
 * - `encode` receives an `Effect<Option<T>, Issue, RET>` and returns
 *   `Effect<Option<E>, Issue, REE>`.
 * - `flip()` swaps the decode and encode functions, producing a
 *   `Middleware<E, T, ...>`.
 *
 * Typically constructed indirectly via `Schema.middlewareDecoding` or
 * `Schema.middlewareEncoding` rather than instantiating this class directly.
 *
 * **Example** (Creating a middleware that falls back on decode failure)
 *
 * ```ts
 * import { Effect, Option, SchemaTransformation } from "effect"
 *
 * const fallback = new SchemaTransformation.Middleware(
 *   (effect) => Effect.catch(effect, () => Effect.succeed(Option.some("fallback"))),
 *   (effect) => effect
 * )
 * ```
 *
 * @see {@link Transformation} — value-level bidirectional transformation
 *
 * @category models
 * @since 4.0.0
 */
declare class Middleware<in out T, in out E, RDE, RDT, RET, REE> {
  readonly _tag = "Middleware";
  readonly decode: (effect: Effect<Option<E>, Issue, RDE>, options: ParseOptions) => Effect<Option<T>, Issue, RDT>;
  readonly encode: (effect: Effect<Option<T>, Issue, RET>, options: ParseOptions) => Effect<Option<E>, Issue, REE>;
  constructor(decode: (effect: Effect<Option<E>, Issue, RDE>, options: ParseOptions) => Effect<Option<T>, Issue, RDT>, encode: (effect: Effect<Option<T>, Issue, RET>, options: ParseOptions) => Effect<Option<E>, Issue, REE>);
  flip(): Middleware<E, T, RET, REE, RDE, RDT>;
}
declare const TypeId$9 = "~effect/SchemaTransformation/Transformation";
/**
 * A bidirectional transformation between a decoded type `T` and an encoded
 * type `E`, built from a pair of `Getter`s.
 *
 * **When to use**
 *
 * - You need to define how a schema converts between two representations.
 * - You want to compose multiple transformations into a pipeline.
 * - You want to flip a transformation to swap decode/encode.
 *
 * **Details**
 *
 * This is the primary building block for `Schema.decodeTo`, `Schema.encodeTo`,
 * `Schema.decode`, `Schema.encode`, and `Schema.link`. Each direction is a
 * `SchemaGetter.Getter` that handles optionality, failure, and Effect services.
 *
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
 * @see {@link make} — construct from `{ decode, encode }` getters
 * @see {@link transform} — construct from pure functions
 * @see {@link transformOrFail} — construct from effectful functions
 * @see {@link Middleware} — effect-pipeline-level alternative
 *
 * @category models
 * @since 4.0.0
 */
declare class Transformation<in out T, in out E, RD = never, RE = never> {
  readonly [TypeId$9] = "~effect/SchemaTransformation/Transformation";
  readonly _tag = "Transformation";
  readonly decode: Getter<T, E, RD>;
  readonly encode: Getter<E, T, RE>;
  constructor(decode: Getter<T, E, RD>, encode: Getter<E, T, RE>);
  flip(): Transformation<E, T, RE, RD>;
  compose<T2, RD2, RE2>(other: Transformation<T2, T, RD2, RE2>): Transformation<T2, E, RD | RD2, RE | RE2>;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/SchemaAST.d.ts
/**
 * Discriminated union of all AST node types.
 *
 * **Details**
 *
 * Every `Schema` has an `.ast` property of this type. Use the guard functions
 * ({@link isString}, {@link isObjects}, etc.) to narrow to a specific variant,
 * then access variant-specific fields.
 *
 * - All variants share the {@link Base} fields: `annotations`, `checks`,
 *   `encoding`, `context`.
 * - Discriminate on the `_tag` field (e.g. `"String"`, `"Objects"`, `"Union"`).
 *
 * @see {@link Base}
 * @see {@link isAST}
 * @category models
 * @since 3.10.0
 */
type AST = Declaration | Null | Undefined | Void$1 | Never | Unknown | Any$2 | String$1 | Number$1 | Boolean | BigInt | Symbol$2 | Literal | UniqueSymbol | ObjectKeyword | Enum | TemplateLiteral | Arrays | Objects$1 | Union$1 | Suspend;
/**
 * A single step in an {@link Encoding} chain.
 *
 * **Details**
 *
 * A link pairs a target {@link AST} with a `Transformation` or `Middleware`
 * that converts values between the current node and the target.
 *
 * - `to` — the AST node on the other side of this transformation step.
 * - `transformation` — the bidirectional conversion logic (decode/encode).
 *
 * Links are composed into a non-empty array ({@link Encoding}) attached to
 * AST nodes that have a different encoded representation.
 *
 * @see {@link Encoding}
 * @see {@link decodeTo}
 * @category models
 * @since 4.0.0
 */
declare class Link {
  readonly to: AST;
  readonly transformation: Transformation<any, any, any, any> | Middleware<any, any, any, any, any, any>;
  constructor(to: AST, transformation: Transformation<any, any, any, any> | Middleware<any, any, any, any, any, any>);
}
/**
 * A non-empty chain of {@link Link} values representing the transformation
 * steps between a schema's decoded (type) form and its encoded (wire) form.
 *
 * **Details**
 *
 * Stored on {@link Base.encoding}. When `undefined`, the node has no
 * encoding transformation (type and encoded forms are identical).
 *
 * @see {@link Link}
 * @see {@link toEncoded}
 * @category models
 * @since 4.0.0
 */
type Encoding$1 = readonly [Link, ...Array<Link>];
/**
 * Options that control schema parsing, validation, transformation, and output behavior.
 *
 * **Details**
 *
 * Pass to `Schema.decodeUnknown`, `Schema.encode`, and related APIs to customize
 * error reporting, excess property handling, output key ordering, check
 * execution, and asynchronous parser concurrency.
 *
 * - `errors` — `"first"` (default) stops at the first error; `"all"` collects
 *   every error.
 * - `onExcessProperty` — `"ignore"` (default) strips unknown object keys;
 *   `"error"` fails; `"preserve"` keeps them.
 * - `propertyOrder` — `"none"` (default) lets the system choose key order;
 *   `"original"` preserves input key order.
 * - `disableChecks` — skips validation checks while still applying defaults and
 *   transformations.
 * - `concurrency` — maximum number of async parse effects to run concurrently;
 *   defaults to `1`, or use `"unbounded"`.
 *
 * @category models
 * @since 3.10.0
 */
interface ParseOptions {
  /**
   * Controls how many parsing errors are reported.
   *
   * **Details**
   *
   * The default, `"first"`, stops at the first error. Set the option to `"all"`
   * to collect every parsing error, which can help with debugging or with
   * presenting more complete error messages to a user.
   *
   * @default "first"
   */
  readonly errors?: "first" | "all" | undefined;
  /**
   * Controls how object parsing handles keys that are not declared by the schema.
   *
   * **Details**
   *
   * The default, `"ignore"`, strips unspecified properties from the output. Use
   * `"error"` to fail when an excess property is present, or `"preserve"` to
   * keep excess properties in the output.
   *
   * @default "ignore"
   */
  readonly onExcessProperty?: "ignore" | "error" | "preserve" | undefined;
  /**
   * The `propertyOrder` option provides control over the order of object fields
   * in the output. This feature is useful when the sequence of keys is
   * important for the consuming processes or when maintaining the input order
   * enhances readability and usability.
   *
   * **Details**
   *
   * By default, the `propertyOrder` option is set to `"none"`. This means that
   * the internal system decides the order of keys to optimize parsing speed.
   *
   * Setting `propertyOrder` to `"original"` ensures that the keys are ordered
   * as they appear in the input during the decoding/encoding process.
   *
   * **Gotchas**
   *
   * The key order for `"none"` should not be considered stable and may change
   * in future updates without notice.
   *
   * @default "none"
   */
  readonly propertyOrder?: "none" | "original" | undefined;
  /**
   * Whether to disable checks while still applying defaults and
   * transformations.
   */
  readonly disableChecks?: boolean | undefined;
  /**
   * The maximum number of async effects to run concurrently.
   *
   * @default 1
   */
  readonly concurrency?: number | "unbounded" | undefined;
}
/**
 * Per-property metadata attached to AST nodes via {@link Base.context}.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare class Context$1 {
  readonly isOptional: boolean;
  readonly isMutable: boolean;
  /** Used for constructor default values (e.g. `withConstructorDefault` API) */
  readonly defaultValue: Encoding$1 | undefined;
  readonly annotations: Annotations.Key<unknown> | undefined;
  constructor(isOptional: boolean, isMutable: boolean, /** Used for constructor default values (e.g. `withConstructorDefault` API) */

  defaultValue?: Encoding$1 | undefined, annotations?: Annotations.Key<unknown> | undefined);
}
/**
 * Non-empty array of validation {@link Check} values attached to an AST node
 * via {@link Base.checks}.
 *
 * **Details**
 *
 * Checks are run after basic type matching succeeds. They represent
 * refinements like `minLength`, `pattern`, `int`, etc.
 *
 * @see {@link Check}
 * @see {@link Filter}
 * @see {@link FilterGroup}
 * @category models
 * @since 4.0.0
 */
type Checks = readonly [Check<any>, ...Array<Check<any>>];
declare const TypeId$8 = "~effect/Schema";
/**
 * Abstract base class for all {@link AST} node variants.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare abstract class Base$1 {
  readonly [TypeId$8] = "~effect/Schema";
  abstract readonly _tag: string;
  readonly annotations: Annotations.Annotations | undefined;
  readonly checks: Checks | undefined;
  readonly encoding: Encoding$1 | undefined;
  readonly context: Context$1 | undefined;
  constructor(annotations?: Annotations.Annotations | undefined, checks?: Checks | undefined, encoding?: Encoding$1 | undefined, context?: Context$1 | undefined);
  toString(): string;
}
/**
 * AST node for user-defined opaque types with custom parsing logic.
 *
 * **When to use**
 *
 * Use when none of the built-in AST nodes fit. The `run` function receives
 * `typeParameters` and returns a parser that validates/transforms raw input.
 *
 * **Details**
 *
 * - `typeParameters` — inner schemas this declaration is parameterized over
 *   (e.g. the element type for a custom collection).
 * - `run` — factory producing the actual parse function.
 *
 * @see {@link isDeclaration}
 * @category models
 * @since 3.10.0
 */
declare class Declaration extends Base$1 {
  readonly _tag = "Declaration";
  readonly typeParameters: ReadonlyArray<AST>;
  readonly run: (typeParameters: ReadonlyArray<AST>) => (input: unknown, self: Declaration, options: ParseOptions) => Effect<any, Issue, any>;
  constructor(typeParameters: ReadonlyArray<AST>, run: (typeParameters: ReadonlyArray<AST>) => (input: unknown, self: Declaration, options: ParseOptions) => Effect<any, Issue, any>, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * AST node matching the `null` literal value.
 *
 * **Details**
 *
 * Parsing succeeds only when the input is exactly `null`.
 *
 * @see {@link null}
 * @see {@link isNull}
 * @category models
 * @since 4.0.0
 */
declare class Null extends Base$1 {
  readonly _tag = "Null";
}
/**
 * AST node matching the `undefined` value.
 *
 * **Details**
 *
 * Parsing succeeds only when the input is exactly `undefined`.
 *
 * @see {@link undefined}
 * @see {@link isUndefined}
 * @category models
 * @since 4.0.0
 */
declare class Undefined extends Base$1 {
  readonly _tag = "Undefined";
}
/**
 * AST node matching the `void` type (accepts `undefined` at runtime).
 *
 * **Details**
 *
 * Behaves like {@link Undefined} for parsing but represents the TypeScript
 * `void` type semantically.
 *
 * @see {@link void}
 * @see {@link isVoid}
 * @category models
 * @since 4.0.0
 */
declare class Void$1 extends Base$1 {
  readonly _tag = "Void";
}
/**
 * AST node representing the `never` type — no value matches.
 *
 * **Details**
 *
 * Parsing always fails. Useful as a placeholder in unions or as the result
 * of narrowing that eliminates all options.
 *
 * @see {@link never}
 * @see {@link isNever}
 * @category models
 * @since 4.0.0
 */
declare class Never extends Base$1 {
  readonly _tag = "Never";
}
/**
 * AST node representing the `any` type — every value matches.
 *
 * @see {@link any}
 * @see {@link isAny}
 *
 * @category models
 * @since 4.0.0
 */
declare class Any$2 extends Base$1 {
  readonly _tag = "Any";
}
/**
 * AST node representing the `unknown` type — every value matches.
 *
 * **Details**
 *
 * Unlike {@link Any}, this is type-safe: the parsed result is typed as
 * `unknown` rather than `any`.
 *
 * @see {@link unknown}
 * @see {@link isUnknown}
 * @category models
 * @since 4.0.0
 */
declare class Unknown extends Base$1 {
  readonly _tag = "Unknown";
}
/**
 * AST node matching the TypeScript `object` type — accepts objects, arrays,
 * and functions (anything non-primitive and non-null).
 *
 * @see {@link objectKeyword}
 * @see {@link isObjectKeyword}
 *
 * @category models
 * @since 3.10.0
 */
declare class ObjectKeyword extends Base$1 {
  readonly _tag = "ObjectKeyword";
}
/**
 * AST node representing a TypeScript `enum`.
 *
 * **Details**
 *
 * Holds `enums` as an array of `[name, value]` pairs where values are
 * `string | number`. Parsing succeeds when the input matches any enum value.
 *
 * @see {@link isEnum}
 * @category models
 * @since 4.0.0
 */
declare class Enum extends Base$1 {
  readonly _tag = "Enum";
  readonly enums: ReadonlyArray<readonly [string, string | number]>;
  constructor(enums: ReadonlyArray<readonly [string, string | number]>, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * AST node representing a TypeScript template literal type
 * (e.g. `` `user_${string}` ``).
 *
 * **Details**
 *
 * `parts` is an array of AST nodes; each part contributes to the
 * template literal pattern. A regex is derived from the parts to validate
 * strings at runtime.
 *
 * @see {@link isTemplateLiteral}
 * @category models
 * @since 3.10.0
 */
declare class TemplateLiteral extends Base$1 {
  readonly _tag = "TemplateLiteral";
  readonly parts: ReadonlyArray<AST>;
  constructor(parts: ReadonlyArray<AST>, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * AST node matching a specific `unique symbol` value.
 *
 * **Details**
 *
 * Parsing succeeds only when the input is reference-equal to the stored
 * `symbol`.
 *
 * @see {@link isUniqueSymbol}
 * @category models
 * @since 3.10.0
 */
declare class UniqueSymbol extends Base$1 {
  readonly _tag = "UniqueSymbol";
  readonly symbol: symbol;
  constructor(symbol: symbol, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * The set of primitive types that can appear as a {@link Literal} value.
 *
 * @see {@link Literal}
 *
 * @category models
 * @since 3.10.0
 */
type LiteralValue = string | number | boolean | bigint;
/**
 * AST node matching an exact primitive value (string, number, boolean, or
 * bigint).
 *
 * **Details**
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
 * @category models
 * @since 3.10.0
 */
declare class Literal extends Base$1 {
  readonly _tag = "Literal";
  readonly literal: LiteralValue;
  constructor(literal: LiteralValue, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * AST node matching any `string` value.
 *
 * @see {@link string}
 * @see {@link isString}
 *
 * @category models
 * @since 4.0.0
 */
declare class String$1 extends Base$1 {
  readonly _tag = "String";
}
/**
 * AST node matching any `number` value (including `NaN`, `Infinity`,
 * `-Infinity`).
 *
 * **Details**
 *
 * Default JSON serialization:
 *
 * - Finite numbers are serialized as JSON numbers.
 * - `Infinity`, `-Infinity`, and `NaN` are serialized as JSON strings.
 *
 * If the node has an `isFinite` or `isInt` check, the string fallback is
 * skipped since non-finite values cannot occur.
 *
 * @see {@link number}
 * @see {@link isNumber}
 * @category models
 * @since 4.0.0
 */
declare class Number$1 extends Base$1 {
  readonly _tag = "Number";
}
/**
 * AST node matching any `boolean` value (`true` or `false`).
 *
 * @see {@link boolean}
 * @see {@link isBoolean}
 *
 * @category models
 * @since 4.0.0
 */
declare class Boolean extends Base$1 {
  readonly _tag = "Boolean";
}
/**
 * AST node matching any `symbol` value.
 *
 * **Details**
 *
 * When serialized to a string-based codec, symbols are converted via
 * `Symbol.keyFor` and must be registered with `Symbol.for`.
 *
 * @see {@link symbol}
 * @see {@link isSymbol}
 * @category models
 * @since 4.0.0
 */
declare class Symbol$2 extends Base$1 {
  readonly _tag = "Symbol";
}
/**
 * AST node matching any `bigint` value.
 *
 * **Details**
 *
 * When serialized to a string-based codec, bigints are converted to/from
 * their decimal string representation.
 *
 * @see {@link bigInt}
 * @see {@link isBigInt}
 * @category models
 * @since 4.0.0
 */
declare class BigInt extends Base$1 {
  readonly _tag = "BigInt";
}
/**
 * AST node for array-like types — both tuples and arrays.
 *
 * **Details**
 *
 * - `elements` — positional element types (tuple elements). An element is
 *   optional if its {@link Context.isOptional} is `true`.
 * - `rest` — the rest/variadic element types. When non-empty, the first
 *   entry is the "spread" type (e.g. `...Array<string>`), and subsequent
 *   entries are trailing positional elements after the spread.
 * - `isMutable` — whether the resulting array is `readonly` (`false`) or
 *   mutable (`true`).
 *
 * **Gotchas**
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
 * @category models
 * @since 4.0.0
 */
declare class Arrays extends Base$1 {
  readonly _tag = "Arrays";
  readonly isMutable: boolean;
  readonly elements: ReadonlyArray<AST>;
  readonly rest: ReadonlyArray<AST>;
  constructor(isMutable: boolean, elements: ReadonlyArray<AST>, rest: ReadonlyArray<AST>, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * A named property within an {@link Objects} node.
 *
 * **Details**
 *
 * Pairs a `name` (any `PropertyKey`) with a `type` ({@link AST}). The
 * property's optionality and mutability are determined by the `type`'s
 * {@link Context}.
 *
 * @see {@link Objects}
 * @category models
 * @since 3.10.0
 */
declare class PropertySignature {
  readonly name: PropertyKey;
  readonly type: AST;
  constructor(name: PropertyKey, type: AST);
}
/**
 * Bidirectional merge strategy for index signature key-value pairs.
 *
 * **Details**
 *
 * Used by {@link IndexSignature} when the same key appears multiple times
 * (e.g. from `Schema.extend` or overlapping records). Provides separate
 * `decode` and `encode` combiners that determine how duplicate entries are
 * merged.
 *
 * @see {@link IndexSignature}
 * @category models
 * @since 4.0.0
 */
declare class KeyValueCombiner {
  readonly decode: Combiner<readonly [key: PropertyKey, value: any]> | undefined;
  readonly encode: Combiner<readonly [key: PropertyKey, value: any]> | undefined;
  constructor(decode: Combiner<readonly [key: PropertyKey, value: any]> | undefined, encode: Combiner<readonly [key: PropertyKey, value: any]> | undefined);
}
/**
 * An index signature entry within an {@link Objects} node.
 *
 * **Details**
 *
 * - `parameter` — the key type AST (e.g. {@link String} for `string` keys,
 *   {@link TemplateLiteral} for patterned keys).
 * - `type` — the value type AST.
 * - `merge` — optional {@link KeyValueCombiner} for handling duplicate keys.
 *
 * **Gotchas**
 *
 * Using `Schema.optionalKey` on the value type is not allowed for index
 * signatures (throws at construction); use `Schema.optional` instead.
 *
 * @see {@link Objects}
 * @see {@link PropertySignature}
 * @category models
 * @since 3.10.0
 */
declare class IndexSignature {
  readonly parameter: AST;
  readonly type: AST;
  readonly merge: KeyValueCombiner | undefined;
  constructor(parameter: AST, type: AST, merge: KeyValueCombiner | undefined);
}
/**
 * AST node for object-like schemas, including structs and records.
 *
 * **Details**
 *
 * - `propertySignatures` — named properties with their types (struct fields).
 * - `indexSignatures` — index signature entries (record patterns), each with
 *   a `parameter` AST for matching keys and a `type` AST for values.
 *
 * An `Objects` node with no properties and no index signatures performs only a
 * non-nullish check: it accepts any value except `null` and `undefined`,
 * including primitive values.
 *
 * **Gotchas**
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
 * @category models
 * @since 4.0.0
 */
declare class Objects$1 extends Base$1 {
  readonly _tag = "Objects";
  readonly propertySignatures: ReadonlyArray<PropertySignature>;
  readonly indexSignatures: ReadonlyArray<IndexSignature>;
  constructor(propertySignatures: ReadonlyArray<PropertySignature>, indexSignatures: ReadonlyArray<IndexSignature>, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
  private rebuild;
}
/**
 * AST node representing a union of schemas.
 *
 * **Details**
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
 * @category models
 * @since 3.10.0
 */
declare class Union$1<A extends AST = AST> extends Base$1 {
  readonly _tag = "Union";
  readonly types: ReadonlyArray<A>;
  readonly mode: "anyOf" | "oneOf";
  constructor(types: ReadonlyArray<A>, mode: "anyOf" | "oneOf", annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * AST node for lazy/recursive schemas.
 *
 * **Details**
 *
 * Wraps a thunk (`() => AST`) that is memoized on first call. Use this to
 * define recursive or mutually recursive schemas without infinite loops at
 * construction time.
 *
 * **Example** (Recursive schema AST)
 *
 * ```ts
 * import { Schema, SchemaAST } from "effect"
 *
 * interface Category {
 *   readonly name: string
 *   readonly children: ReadonlyArray<Category>
 * }
 *
 * const Category = Schema.Struct({
 *   name: Schema.String,
 *   children: Schema.Array(Schema.suspend((): Schema.Codec<Category> => Category))
 * })
 *
 * // The recursive branch is a Suspend node
 * ```
 *
 * @see {@link isSuspend}
 * @category models
 * @since 3.10.0
 */
declare class Suspend extends Base$1 {
  readonly _tag = "Suspend";
  readonly thunk: () => AST;
  constructor(thunk: () => AST, annotations?: Annotations.Annotations, checks?: Checks, encoding?: Encoding$1, context?: Context$1);
}
/**
 * A single validation check attached to an AST node.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare class Filter$1<in E> extends Class {
  readonly _tag = "Filter";
  readonly run: (input: E, self: AST, options: ParseOptions) => Issue | undefined;
  readonly annotations: Annotations.Filter | undefined;
  /**
   * Whether the parsing process should be aborted after this check has failed.
   */
  readonly aborted: boolean;
  constructor(run: (input: E, self: AST, options: ParseOptions) => Issue | undefined, annotations?: Annotations.Filter | undefined,
  /**
   * Whether the parsing process should be aborted after this check has failed.
   */

  aborted?: boolean);
  annotate(annotations: Annotations.Filter): Filter$1<E>;
  abort(): Filter$1<E>;
  and(other: Check<E>, annotations?: Annotations.Filter): FilterGroup<E>;
}
/**
 * A composite validation check grouping multiple {@link Check} values.
 *
 * **Details**
 *
 * Created by calling `.and()` on a {@link Filter} or another `FilterGroup`.
 * All inner checks are run; failures from aborted filters still stop
 * evaluation.
 *
 * @see {@link Filter}
 * @see {@link Check}
 * @category models
 * @since 4.0.0
 */
declare class FilterGroup<in E> extends Class {
  readonly _tag = "FilterGroup";
  readonly checks: readonly [Check<E>, ...Array<Check<E>>];
  readonly annotations: Annotations.Filter | undefined;
  constructor(checks: readonly [Check<E>, ...Array<Check<E>>], annotations?: Annotations.Filter | undefined);
  annotate(annotations: Annotations.Filter): FilterGroup<E>;
  and(other: Check<E>, annotations?: Annotations.Filter): FilterGroup<E>;
}
/**
 * A validation check — either a single {@link Filter} or a composite
 * {@link FilterGroup}.
 *
 * **Details**
 *
 * Stored in the {@link Checks} array on {@link Base.checks}.
 *
 * @see {@link Filter}
 * @see {@link FilterGroup}
 * @category models
 * @since 4.0.0
 */
type Check<T> = Filter$1<T> | FilterGroup<T>;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/SchemaIssue.d.ts
declare const TypeId$7 = "~effect/SchemaIssue/Issue";
/**
 * Returns `true` if the given value is an {@link Issue}.
 *
 * **When to use**
 *
 * - Narrowing an `unknown` value to `Issue` in error-handling code.
 * - Distinguishing an `Issue` from other error types in a catch-all handler.
 *
 * **Details**
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
 * @category guards
 * @since 4.0.0
 */
/**
 * Union of all terminal (leaf) issue types that have no inner `Issue` children.
 *
 * **When to use**
 *
 * - Constraining formatter hooks to only handle terminal nodes.
 * - Pattern-matching on the `_tag` of an issue when you only care about leaves.
 *
 * **Details**
 *
 * Members: {@link InvalidType}, {@link InvalidValue}, {@link MissingKey},
 * {@link UnexpectedKey}, {@link Forbidden}, {@link OneOf}.
 *
 * @see {@link Issue} — the full union including composite nodes
 * @see {@link LeafHook} — formatter hook that operates on `Leaf` values
 *
 * @category models
 * @since 4.0.0
 */
type Leaf = InvalidType | InvalidValue | MissingKey | UnexpectedKey | Forbidden | OneOf;
/**
 * The root discriminated union of all validation error nodes.
 *
 * **When to use**
 *
 * - Typing the error channel in `Effect<A, Issue, R>` results from schema
 *   parsing.
 * - Writing custom formatters or issue-tree walkers.
 *
 * **Details**
 *
 * Every node has a `_tag` field for pattern-matching. The union includes both
 * terminal {@link Leaf} types and composite types that wrap inner issues:
 * {@link Filter}, {@link Encoding}, {@link Pointer}, {@link Composite},
 * {@link AnyOf}. All `Issue` instances have a `toString()` that delegates to
 * the default formatter, so `String(issue)` produces a human-readable message.
 *
 * @see {@link Leaf} — the terminal subset
 * @see {@link isIssue} — type guard
 * @see {@link getActual} — extract the actual value from any issue
 *
 * @category models
 * @since 4.0.0
 */
type Issue = Leaf | Filter | Encoding | Pointer | Composite | AnyOf;
declare class Base {
  readonly [TypeId$7] = "~effect/SchemaIssue/Issue";
  toString(this: Issue): string;
}
/**
 * Issue produced when a schema filter (refinement check) fails.
 *
 * **When to use**
 *
 * - Inspect which filter rejected the value.
 * - Walk the inner `issue` for the specific validation failure.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare class Filter extends Base {
  readonly _tag = "Filter";
  /**
   * The input value that caused the issue.
   */
  readonly actual: unknown;
  /**
   * The filter that failed.
   */
  readonly filter: Filter$1<unknown>;
  /**
   * The issue that occurred.
   */
  readonly issue: Issue;
  constructor(
  /**
   * The input value that caused the issue.
   */

  actual: unknown,
  /**
   * The filter that failed.
   */

  filter: Filter$1<any>,
  /**
   * The issue that occurred.
   */

  issue: Issue);
}
/**
 * Issue produced when a schema transformation (encode/decode step) fails.
 *
 * **When to use**
 *
 * - Inspect failures from `Schema.decodeTo` / `Schema.encodeTo`
 *   transformations.
 * - Walk the inner `issue` for the root cause of the transformation failure.
 *
 * **Details**
 *
 * - `ast` is the AST node for the transformation that failed.
 * - `actual` is `Option.some(value)` when the input was present, or
 *   `Option.none()` when it was absent.
 * - `issue` is the inner issue describing the failure.
 *
 * @see {@link Filter} — failure from a refinement check (not a transformation)
 * @see {@link Composite} — multiple issues from a single schema node
 *
 * @category models
 * @since 4.0.0
 */
declare class Encoding extends Base {
  readonly _tag = "Encoding";
  /**
   * The schema that caused the issue.
   */
  readonly ast: AST;
  /**
   * The input value that caused the issue.
   */
  readonly actual: Option<unknown>;
  /**
   * The issue that occurred.
   */
  readonly issue: Issue;
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: AST,
  /**
   * The input value that caused the issue.
   */

  actual: Option<unknown>,
  /**
   * The issue that occurred.
   */

  issue: Issue);
}
/**
 * Wraps an inner {@link Issue} with a property-key path, indicating *where* in
 * a nested structure the error occurred.
 *
 * **When to use**
 *
 * - Walk the issue tree to accumulate path segments for error reporting.
 * - Match on `_tag === "Pointer"` when flattening nested issues.
 *
 * **Details**
 *
 * - `path` is an array of property keys (strings, numbers, or symbols).
 * - Has no `actual` value — {@link getActual} returns `Option.none()`.
 * - Formatters concatenate nested `Pointer` paths into a single path like
 *   `["a"]["b"][0]`.
 *
 * @see {@link getActual} — returns `Option.none()` for `Pointer`
 * @see {@link Composite} — groups multiple issues under one schema node
 *
 * @category models
 * @since 3.10.0
 */
declare class Pointer extends Base {
  readonly _tag = "Pointer";
  /**
   * The path to the location in the input that caused the issue.
   */
  readonly path: ReadonlyArray<PropertyKey>;
  /**
   * The issue that occurred.
   */
  readonly issue: Issue;
  constructor(
  /**
   * The path to the location in the input that caused the issue.
   */

  path: ReadonlyArray<PropertyKey>,
  /**
   * The issue that occurred.
   */

  issue: Issue);
}
/**
 * Issue produced when a required key or tuple index is missing from the input.
 *
 * **When to use**
 *
 * - Detect absent fields in struct/tuple validation.
 * - Typically found inside a {@link Pointer} that indicates which key is
 *   missing.
 *
 * **Details**
 *
 * - Has no `actual` value — {@link getActual} returns `Option.none()`.
 * - `annotations` may contain a custom `messageMissingKey` for formatting.
 *
 * @see {@link Pointer} — wraps this issue with the missing key's path
 * @see {@link UnexpectedKey} — the opposite case (extra key present)
 *
 * @category models
 * @since 4.0.0
 */
declare class MissingKey extends Base {
  readonly _tag = "MissingKey";
  /**
   * The metadata for the issue.
   */
  readonly annotations: Annotations.Key<unknown> | undefined;
  constructor(
  /**
   * The metadata for the issue.
   */

  annotations: Annotations.Key<unknown> | undefined);
}
/**
 * Issue produced when an input object or tuple contains a key/index not
 * declared by the schema.
 *
 * **When to use**
 *
 * - Detect excess properties during strict struct/tuple validation.
 * - Typically found inside a {@link Pointer} that indicates which key was
 *   unexpected.
 *
 * **Details**
 *
 * - `actual` is the raw value at the unexpected key (plain `unknown`).
 * - `ast` is the schema that was being validated against.
 * - `annotations` on `ast` may contain a custom `messageUnexpectedKey`.
 *
 * @see {@link MissingKey} — the opposite case (required key absent)
 * @see {@link Pointer} — wraps this issue with the unexpected key's path
 *
 * @category models
 * @since 4.0.0
 */
declare class UnexpectedKey extends Base {
  readonly _tag = "UnexpectedKey";
  /**
   * The schema that caused the issue.
   */
  readonly ast: AST;
  /**
   * The input value that caused the issue.
   */
  readonly actual: unknown;
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: AST,
  /**
   * The input value that caused the issue.
   */

  actual: unknown);
}
/**
 * Issue that groups multiple child issues under a single schema node.
 *
 * **When to use**
 *
 * - Walk the issue tree for struct/tuple schemas that collect all field errors
 *   rather than failing on the first.
 * - Match on `_tag === "Composite"` to iterate over `issues`.
 *
 * **Details**
 *
 * - `issues` is a non-empty readonly array (at least one child).
 * - `actual` is `Option.some(value)` when the input was present, or
 *   `Option.none()` when absent.
 * - Formatters flatten `Composite` by recursing into each child.
 *
 * @see {@link AnyOf} — used for union no-match errors (similar but different semantics)
 * @see {@link Pointer} — adds path context to individual issues
 *
 * @category models
 * @since 3.10.0
 */
declare class Composite extends Base {
  readonly _tag = "Composite";
  /**
   * The schema that caused the issue.
   */
  readonly ast: AST;
  /**
   * The input value that caused the issue.
   */
  readonly actual: Option<unknown>;
  /**
   * The issues that occurred.
   */
  readonly issues: readonly [Issue, ...Array<Issue>];
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: AST,
  /**
   * The input value that caused the issue.
   */

  actual: Option<unknown>,
  /**
   * The issues that occurred.
   */

  issues: readonly [Issue, ...Array<Issue>]);
}
/**
 * Issue produced when the runtime type of the input does not match the type
 * expected by the schema (e.g. got `null` when `string` was expected).
 *
 * **When to use**
 *
 * - Detect basic type mismatches (wrong primitive, null where object expected,
 *   etc.).
 * - The most common leaf issue in typical validation failures.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare class InvalidType extends Base {
  readonly _tag = "InvalidType";
  /**
   * The schema that caused the issue.
   */
  readonly ast: AST;
  /**
   * The input value that caused the issue.
   */
  readonly actual: Option<unknown>;
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: AST,
  /**
   * The input value that caused the issue.
   */

  actual: Option<unknown>);
}
/**
 * Issue produced when the input has the correct type but its value violates a
 * constraint (e.g. a string that is too short, a number out of range).
 *
 * **When to use**
 *
 * - Detect constraint violations from `Schema.filter`, `Schema.minLength`,
 *   `Schema.greaterThan`, etc.
 * - Create custom validation errors in `Schema.makeFilter` callbacks.
 *
 * **Details**
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
 * @category models
 * @since 4.0.0
 */
declare class InvalidValue extends Base {
  readonly _tag = "InvalidValue";
  /**
   * The value that caused the issue.
   */
  readonly actual: Option<unknown>;
  /**
   * The metadata for the issue.
   */
  readonly annotations: Annotations.Issue | undefined;
  constructor(
  /**
   * The value that caused the issue.
   */

  actual: Option<unknown>,
  /**
   * The metadata for the issue.
   */

  annotations?: Annotations.Issue | undefined);
}
/**
 * Issue produced when a forbidden operation is encountered during parsing,
 * such as an asynchronous Effect running inside `Schema.decodeUnknownSync`.
 *
 * **When to use**
 *
 * - Detect that a schema requires async execution but was run synchronously.
 * - Provide custom error messages via the `annotations.message` field.
 *
 * **Details**
 *
 * - `actual` is `Option.some(value)` when the input is known, or
 *   `Option.none()` when absent.
 * - `annotations` optionally carries a `message` string.
 * - The default formatter renders this as `"Forbidden operation"`.
 *
 * **Example** (Creating a Forbidden issue)
 *
 * ```ts
 * import { Option, SchemaIssue } from "effect"
 *
 * const issue = new SchemaIssue.Forbidden(
 *   Option.none(),
 *   { message: "async operation not allowed in sync context" }
 * )
 * console.log(String(issue))
 * // "async operation not allowed in sync context"
 * ```
 *
 * @see {@link InvalidValue} — for value-constraint failures (not operation failures)
 *
 * @category models
 * @since 3.10.0
 */
declare class Forbidden extends Base {
  readonly _tag = "Forbidden";
  /**
   * The input value that caused the issue.
   */
  readonly actual: Option<unknown>;
  /**
   * The metadata for the issue.
   */
  readonly annotations: Annotations.Issue | undefined;
  constructor(
  /**
   * The input value that caused the issue.
   */

  actual: Option<unknown>,
  /**
   * The metadata for the issue.
   */

  annotations: Annotations.Issue | undefined);
}
/**
 * Issue produced when a value does not match *any* member of a union schema.
 *
 * **When to use**
 *
 * - Inspect which union members were attempted and why each failed.
 * - `issues` may be empty when the union has no members or when the input does
 *   not pass the initial type guard.
 *
 * **Details**
 *
 * - `ast` is the `Union` AST node.
 * - `actual` is the raw input value (plain `unknown`).
 * - `issues` contains per-member failures. When empty, the formatter falls
 *   back to the union's `expected` annotation.
 *
 * @see {@link OneOf} — the opposite: *too many* members matched
 * @see {@link Composite} — groups multiple issues under a non-union schema
 *
 * @category models
 * @since 4.0.0
 */
declare class AnyOf extends Base {
  readonly _tag = "AnyOf";
  /**
   * The schema that caused the issue.
   */
  readonly ast: Union$1;
  /**
   * The input value that caused the issue.
   */
  readonly actual: unknown;
  /**
   * The issues that occurred.
   */
  readonly issues: ReadonlyArray<Issue>;
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: Union$1,
  /**
   * The input value that caused the issue.
   */

  actual: unknown,
  /**
   * The issues that occurred.
   */

  issues: ReadonlyArray<Issue>);
}
/**
 * Issue produced when a value matches *multiple* members of a union that is
 * configured to allow exactly one match (oneOf mode).
 *
 * **When to use**
 *
 * - Detect ambiguous union matches when `oneOf` validation is enabled.
 * - Inspect `successes` to see which members matched.
 *
 * **Details**
 *
 * - `ast` is the `Union` AST node.
 * - `actual` is the raw input value (plain `unknown`).
 * - `successes` lists the AST nodes of each member that accepted the input.
 * - The default formatter renders this as
 *   `"Expected exactly one member to match the input <actual>"`.
 *
 * @see {@link AnyOf} — the opposite: *no* members matched
 *
 * @category models
 * @since 4.0.0
 */
declare class OneOf extends Base {
  readonly _tag = "OneOf";
  /**
   * The schema that caused the issue.
   */
  readonly ast: Union$1;
  /**
   * The input value that caused the issue.
   */
  readonly actual: unknown;
  /**
   * The schemas that were successful.
   */
  readonly successes: ReadonlyArray<AST>;
  constructor(
  /**
   * The schema that caused the issue.
   */

  ast: Union$1,
  /**
   * The input value that caused the issue.
   */

  actual: unknown,
  /**
   * The schemas that were successful.
   */

  successes: ReadonlyArray<AST>);
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/internal/schema/schema.d.ts
declare class SchemaError {
  readonly [SchemaErrorTypeId] = "~effect/Schema/SchemaError";
  readonly _tag = "SchemaError";
  readonly name: string;
  readonly issue: Issue;
  constructor(issue: Issue);
  get message(): string;
  toString(): string;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/JsonSchema.d.ts
/**
 * A plain object representing a single JSON Schema node.
 *
 * **Details**
 *
 * This is an open record type (`[x: string]: unknown`) so it can hold any JSON
 * Schema keyword. Most functions in this module accept or return this type.
 *
 * @category models
 * @since 4.0.0
 */
interface JsonSchema {
  [x: string]: unknown;
}
/**
 * A record of named JSON Schema definitions, keyed by definition name.
 *
 * @category models
 * @since 4.0.0
 */
interface Definitions extends Record<string, JsonSchema> {}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Struct.d.ts
/**
 * Flattens intersection types into a single object type for readability.
 *
 * **When to use**
 *
 * Use when hovering over a type shows `A & B & C` instead of the merged shape.
 *
 * **Details**
 *
 * This helper is purely cosmetic at the type level and has no runtime effect.
 * It preserves `readonly` modifiers; use {@link Mutable} to strip them.
 *
 * **Example** (Flattening an intersection)
 *
 * ```ts
 * import type { Struct } from "effect"
 *
 * type Original = { a: string } & { b: number }
 *
 * // Without Simplify, the type displays as `{ a: string } & { b: number }`
 * type Simplified = Struct.Simplify<Original>
 * // { a: string; b: number }
 * ```
 *
 * @see {@link Mutable} – also flattens but removes `readonly`
 * @see {@link Assign} – merges two types with right-side precedence
 * @category Type-Level Programming
 * @since 4.0.0
 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};
//#endregion
//#region ../../../node_modules/.bun/pure-rand@8.4.0/node_modules/pure-rand/lib/RandomGenerator-CKZRB3Fu.d.ts
//#region src/types/RandomGenerator.d.ts
interface RandomGenerator$1 {
  /** Produce a fully independent clone of the current instance */
  clone(): RandomGenerator$1;
  /**
  * Generate next value BUT alters current generator.
  * Values uniform in range -0x8000_0000 (included) to 0x7fff_ffff (included)
  */
  next(): number;
  /** Access to the internal state of a RandomGenerator in a read-only fashion */
  getState(): readonly number[];
} //#endregion
//#endregion
//#region ../../../node_modules/.bun/pure-rand@8.4.0/node_modules/pure-rand/lib/types/JumpableRandomGenerator.d.ts
//#region src/types/JumpableRandomGenerator.d.ts
interface JumpableRandomGenerator extends RandomGenerator$1 {
  /** Produce a fully independent clone of the current instance */
  clone(): JumpableRandomGenerator;
  /**
  * Jump current generator
  *
  * Move the generator forward by an extremely large number of steps in its sequence.
  * This is typically a number so large that it would be infeasible to reach by repeated `next()` calls.
  */
  jump(): void;
} //#endregion
//#endregion
//#region ../../../node_modules/.bun/fast-check@4.8.0/node_modules/fast-check/lib/cjs/fast-check.d.ts
//#region src/check/precondition/Pre.d.ts
/**
* Add pre-condition checks inside a property execution
* @param expectTruthy - cancel the run whenever this value is falsy
* @remarks Since 1.3.0
* @public
*/
declare function pre(expectTruthy: boolean): asserts expectTruthy; //#endregion
//#region src/random/generator/RandomGenerator.d.ts
interface RandomGenerator7x {
  clone(): RandomGenerator7x;
  next(): [number, RandomGenerator7x];
  jump?(): RandomGenerator7x;
  unsafeNext(): number;
  unsafeJump?(): void;
  getState(): readonly number[];
}
/**
* Merged type supporting both pure-rand v7 and v8 random generators.
* Keeping compatibility with v7 avoids a breaking API change and a new major version.
* @remarks Since 4.6.0
* @public
*/
type RandomGenerator = RandomGenerator7x | RandomGenerator$1 | JumpableRandomGenerator; //#endregion
//#region src/random/generator/Random.d.ts
/**
* Wrapper around an instance of a `pure-rand`'s random number generator
* offering a simpler interface to deal with random with impure patterns
*
* @public
*/
declare class Random {
  /**
  * Create a mutable random number generator by cloning the passed one and mutate it
  * @param sourceRng - Immutable random generator from pure-rand library, will not be altered (a clone will be)
  */
  constructor(sourceRng: RandomGenerator);
  /**
  * Clone the random number generator
  */
  clone(): Random;
  /**
  * Generate an integer having `bits` random bits
  * @param bits - Number of bits to generate
  * @deprecated Prefer {@link nextInt} with explicit bounds: `nextInt(0, (1 << bits) - 1)`
  */
  next(bits: number): number;
  /**
  * Generate a random boolean
  */
  nextBoolean(): boolean;
  /**
  * Generate a random integer (32 bits)
  * @deprecated Prefer {@link nextInt} with explicit bounds: `nextInt(-2147483648, 2147483647)`
  */
  nextInt(): number;
  /**
  * Generate a random integer between min (included) and max (included)
  * @param min - Minimal integer value
  * @param max - Maximal integer value
  */
  nextInt(min: number, max: number): number;
  /**
  * Generate a random bigint between min (included) and max (included)
  * @param min - Minimal bigint value
  * @param max - Maximal bigint value
  */
  nextBigInt(min: bigint, max: bigint): bigint;
  /**
  * Generate a random floating point number between 0.0 (included) and 1.0 (excluded)
  */
  nextDouble(): number;
  /**
  * Extract the internal state of the internal RandomGenerator backing the current instance of Random
  */
  getState(): readonly number[] | undefined;
} //#endregion
//#region src/stream/Stream.d.ts
/**
* Wrapper around `IterableIterator` interface
* offering a set of helpers to deal with iterations in a simple way
*
* @remarks Since 0.0.7
* @public
*/
declare class Stream<T> implements IterableIterator<T> {
  /** @internal */
  private readonly g;
  /**
  * Create an empty stream of T
  * @remarks Since 0.0.1
  */
  static nil<T>(): Stream<T>;
  /**
  * Create a stream of T from a variable number of elements
  *
  * @param elements - Elements used to create the Stream
  * @remarks Since 2.12.0
  */
  static of<T>(...elements: T[]): Stream<T>;
  /**
  * Create a Stream based on `g`
  * @param g - Underlying data of the Stream
  */
  constructor(g: IterableIterator<T>);
  next(): IteratorResult<T>;
  [Symbol.iterator](): IterableIterator<T>;
  /**
  * Map all elements of the Stream using `f`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Mapper function
  * @remarks Since 0.0.1
  */
  map<U>(f: (v: T) => U): Stream<U>;
  /**
  * Flat map all elements of the Stream using `f`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Mapper function
  * @remarks Since 0.0.1
  */
  flatMap<U>(f: (v: T) => IterableIterator<U>): Stream<U>;
  /**
  * Drop elements from the Stream while `f(element) === true`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Drop condition
  * @remarks Since 0.0.1
  */
  dropWhile(f: (v: T) => boolean): Stream<T>;
  /**
  * Drop `n` first elements of the Stream
  *
  * WARNING: It closes the current stream
  *
  * @param n - Number of elements to drop
  * @remarks Since 0.0.1
  */
  drop(n: number): Stream<T>;
  /**
  * Take elements from the Stream while `f(element) === true`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Take condition
  * @remarks Since 0.0.1
  */
  takeWhile(f: (v: T) => boolean): Stream<T>;
  /**
  * Take `n` first elements of the Stream
  *
  * WARNING: It closes the current stream
  *
  * @param n - Number of elements to take
  * @remarks Since 0.0.1
  */
  take(n: number): Stream<T>;
  /**
  * Filter elements of the Stream
  *
  * WARNING: It closes the current stream
  *
  * @param f - Elements to keep
  * @remarks Since 1.23.0
  */
  filter<U extends T>(f: (v: T) => v is U): Stream<U>;
  /**
  * Filter elements of the Stream
  *
  * WARNING: It closes the current stream
  *
  * @param f - Elements to keep
  * @remarks Since 0.0.1
  */
  filter(f: (v: T) => boolean): Stream<T>;
  /**
  * Check whether all elements of the Stream are successful for `f`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Condition to check
  * @remarks Since 0.0.1
  */
  every(f: (v: T) => boolean): boolean;
  /**
  * Check whether one of the elements of the Stream is successful for `f`
  *
  * WARNING: It closes the current stream
  *
  * @param f - Condition to check
  * @remarks Since 0.0.1
  */
  has(f: (v: T) => boolean): [boolean, T | null];
  /**
  * Join `others` Stream to the current Stream
  *
  * WARNING: It closes the current stream and the other ones (as soon as it iterates over them)
  *
  * @param others - Streams to join to the current Stream
  * @remarks Since 0.0.1
  */
  join(...others: IterableIterator<T>[]): Stream<T>;
  /**
  * Take the `nth` element of the Stream of the last (if it does not exist)
  *
  * WARNING: It closes the current stream
  *
  * @param nth - Position of the element to extract
  * @remarks Since 0.0.12
  */
  getNthOrLast(nth: number): T | null;
}
/**
* Create a Stream based on `g`
*
* @param g - Underlying data of the Stream
*
* @remarks Since 0.0.7
* @public
*/
declare function stream<T>(g: IterableIterator<T>): Stream<T>; //#endregion
//#region src/check/arbitrary/definition/Value.d.ts
/**
* A `Value<T, TShrink = T>` holds an internal value of type `T`
* and its associated context
*
* @remarks Since 3.0.0 (previously called `NextValue` in 2.15.0)
* @public
*/
declare class Value<T> {
  /**
  * State storing the result of hasCloneMethod
  * If `true` the value will be cloned each time it gets accessed
  * @remarks Since 2.15.0
  */
  readonly hasToBeCloned: boolean;
  /**
  * Safe value of the shrinkable
  * Depending on `hasToBeCloned` it will either be `value_` or a clone of it
  * @remarks Since 2.15.0
  */
  readonly value: T;
  /**
  * Internal value of the shrinkable
  * @remarks Since 2.15.0
  */
  readonly value_: T;
  /**
  * Context for the generated value
  * TODO - Do we want to clone it too?
  * @remarks 2.15.0
  */
  readonly context: unknown;
  /**
  * @param value_ - Internal value of the shrinkable
  * @param context - Context associated to the generated value (useful for shrink)
  * @param customGetValue - Limited to internal usages (to ease migration to next), it will be removed on next major
  */
  constructor(value_: T, context: unknown, customGetValue?: () => T);
} //#endregion
//#region src/check/arbitrary/definition/Arbitrary.d.ts
/**
* Abstract class able to generate values on type `T`
*
* The values generated by an instance of Arbitrary can be previewed - with {@link sample} - or classified - with {@link statistics}.
*
* @remarks Since 0.0.7
* @public
*/
declare abstract class Arbitrary<T> {
  /**
  * Generate a value of type `T` along with its context (if any)
  * based on the provided random number generator
  *
  * @param mrng - Random number generator
  * @param biasFactor - If taken into account 1 value over biasFactor must be biased. Either integer value greater or equal to 2 (bias) or undefined (no bias)
  * @returns Random value of type `T` and its context
  *
  * @remarks Since 0.0.1 (return type changed in 3.0.0)
  */
  abstract generate(mrng: Random, biasFactor: number | undefined): Value<T>;
  /**
  * Check if a given value could be pass to `shrink` without providing any context.
  *
  * In general, `canShrinkWithoutContext` is not designed to be called for each `shrink` but rather on very special cases.
  * Its usage must be restricted to `canShrinkWithoutContext` or in the rare* contexts of a `shrink` method being called without
  * any context. In this ill-formed case of `shrink`, `canShrinkWithoutContext` could be used or called if needed.
  *
  * *we fall in that case when fast-check is asked to shrink a value that has been provided manually by the user,
  *  in other words: a value not coming from a call to `generate` or a normal `shrink` with context.
  *
  * @param value - Value to be assessed
  * @returns `true` if and only if the value could have been generated by this instance
  *
  * @remarks Since 3.0.0
  */
  abstract canShrinkWithoutContext(value: unknown): value is T;
  /**
  * Shrink a value of type `T`, may rely on the context previously provided to shrink efficiently
  *
  * Must never be called with possibly invalid values and no context without ensuring that such call is legal
  * by calling `canShrinkWithoutContext` first on the value.
  *
  * @param value - The value to shrink
  * @param context - Its associated context (the one returned by generate) or `undefined` if no context but `canShrinkWithoutContext(value) === true`
  * @returns Stream of shrinks for value based on context (if provided)
  *
  * @remarks Since 3.0.0
  */
  abstract shrink(value: T, context: unknown | undefined): Stream<Value<T>>;
  /**
  * Create another arbitrary by filtering values against `predicate`
  *
  * All the values produced by the resulting arbitrary
  * satisfy `predicate(value) == true`
  *
  * Be aware that using filter may highly impact the time required to generate a valid entry
  *
  * @example
  * ```typescript
  * const integerGenerator: Arbitrary<number> = ...;
  * const evenIntegerGenerator: Arbitrary<number> = integerGenerator.filter(e => e % 2 === 0);
  * // new Arbitrary only keeps even values
  * ```
  *
  * @param refinement - Predicate, to test each produced element. Return true to keep the element, false otherwise
  * @returns New arbitrary filtered using predicate
  *
  * @remarks Since 1.23.0
  */
  filter<U extends T>(refinement: (t: T) => t is U): Arbitrary<U>;
  /**
  * Create another arbitrary by filtering values against `predicate`
  *
  * All the values produced by the resulting arbitrary
  * satisfy `predicate(value) == true`
  *
  * Be aware that using filter may highly impact the time required to generate a valid entry
  *
  * @example
  * ```typescript
  * const integerGenerator: Arbitrary<number> = ...;
  * const evenIntegerGenerator: Arbitrary<number> = integerGenerator.filter(e => e % 2 === 0);
  * // new Arbitrary only keeps even values
  * ```
  *
  * @param predicate - Predicate, to test each produced element. Return true to keep the element, false otherwise
  * @returns New arbitrary filtered using predicate
  *
  * @remarks Since 0.0.1
  */
  filter(predicate: (t: T) => boolean): Arbitrary<T>;
  /**
  * Create another arbitrary by mapping all produced values using the provided `mapper`
  * Values produced by the new arbitrary are the result of applying `mapper` value by value
  *
  * @example
  * ```typescript
  * const rgbChannels: Arbitrary<{r:number,g:number,b:number}> = ...;
  * const color: Arbitrary<string> = rgbChannels.map(ch => `#${(ch.r*65536 + ch.g*256 + ch.b).toString(16).padStart(6, '0')}`);
  * // transform an Arbitrary producing {r,g,b} integers into an Arbitrary of '#rrggbb'
  * ```
  *
  * @param mapper - Map function, to produce a new element based on an old one
  * @param unmapper - Optional unmap function, it will never be used except when shrinking user defined values. Must throw if value is not compatible (since 3.0.0)
  * @returns New arbitrary with mapped elements
  *
  * @remarks Since 0.0.1
  */
  map<U>(mapper: (t: T) => U, unmapper?: (possiblyU: unknown) => T): Arbitrary<U>;
  /**
  * Create another arbitrary by mapping a value from a base Arbirary using the provided `fmapper`
  * Values produced by the new arbitrary are the result of the arbitrary generated by applying `fmapper` to a value
  * @example
  * ```typescript
  * const arrayAndLimitArbitrary = fc.nat().chain((c: number) => fc.tuple( fc.array(fc.nat(c)), fc.constant(c)));
  * ```
  *
  * @param chainer - Chain function, to produce a new Arbitrary using a value from another Arbitrary
  * @returns New arbitrary of new type
  *
  * @remarks Since 1.2.0
  */
  chain<U>(chainer: (t: T) => Arbitrary<U>): Arbitrary<U>;
} //#endregion
//#region src/check/precondition/PreconditionFailure.d.ts
/**
* Error type produced whenever a precondition fails
* @remarks Since 2.2.0
* @public
*/
declare class PreconditionFailure extends Error {
  readonly interruptExecution: boolean;
  constructor(interruptExecution?: boolean);
  static isFailure(err: unknown): err is PreconditionFailure;
} //#endregion
//#region src/check/property/IRawProperty.d.ts
/**
* Represent failures of the property
* @remarks Since 3.0.0
* @public
*/
type PropertyFailure = {
  /**
  * The original error that has been intercepted.
  * Possibly not an instance Error as users can throw anything.
  * @remarks Since 3.0.0
  */
  error: unknown;
};
/**
* Property
*
* A property is the combination of:
* - Arbitraries: how to generate the inputs for the algorithm
* - Predicate: how to confirm the algorithm succeeded?
*
* @remarks Since 1.19.0
* @public
*/
interface IRawProperty<Ts, IsAsync extends boolean = boolean> {
  /**
  * Is the property asynchronous?
  *
  * true in case of asynchronous property, false otherwise
  * @remarks Since 0.0.7
  */
  isAsync(): IsAsync;
  /**
  * Generate values of type Ts
  *
  * @param mrng - Random number generator
  * @param runId - Id of the generation, starting at 0 - if set the generation might be biased
  *
  * @remarks Since 0.0.7 (return type changed in 3.0.0)
  */
  generate(mrng: Random, runId?: number): Value<Ts>;
  /**
  * Shrink value of type Ts
  *
  * @param value - The value to be shrunk, it can be context-less
  *
  * @remarks Since 3.0.0
  */
  shrink(value: Value<Ts>): Stream<Value<Ts>>;
  /**
  * Check the predicate for v
  * @param v - Value of which we want to check the predicate
  * @remarks Since 0.0.7
  */
  run(v: Ts): (IsAsync extends true ? Promise<PreconditionFailure | PropertyFailure | null> : never) | (IsAsync extends false ? PreconditionFailure | PropertyFailure | null : never);
  /**
  * Run before each hook
  * @remarks Since 3.4.0
  */
  runBeforeEach: () => (IsAsync extends true ? Promise<void> : never) | (IsAsync extends false ? void : never);
  /**
  * Run after each hook
  * @remarks Since 3.4.0
  */
  runAfterEach: () => (IsAsync extends true ? Promise<void> : never) | (IsAsync extends false ? void : never);
} //#endregion
//#region src/arbitrary/_internals/helpers/MaxLengthFromMinLength.d.ts
/**
* The size parameter defines how large the generated values could be.
*
* The default in fast-check is 'small' but it could be increased (resp. decreased)
* to ask arbitraries for larger (resp. smaller) values.
*
* @remarks Since 2.22.0
* @public
*/
type Size = "xsmall" | "small" | "medium" | "large" | "xlarge";
/**
* @remarks Since 2.22.0
* @public
*/
type RelativeSize = "-4" | "-3" | "-2" | "-1" | "=" | "+1" | "+2" | "+3" | "+4";
/**
* Superset of {@link Size} to override the default defined for size
* @remarks Since 2.22.0
* @public
*/
type SizeForArbitrary = RelativeSize | Size | "max" | undefined;
/**
* Superset of {@link Size} to override the default defined for size.
* It can either be based on a numeric value manually selected by the user (not recommended)
* or rely on presets based on size (recommended).
*
* This size will be used to infer a bias to limit the depth, used as follow within recursive structures:
* While going deeper, the bias on depth will increase the probability to generate small instances.
*
* When used with {@link Size}, the larger the size the deeper the structure.
* When used with numeric values, the larger the number (floating point number &gt;= 0),
* the deeper the structure. `+0` means extremelly biased depth meaning barely impossible to generate
* deep structures, while `Number.POSITIVE_INFINITY` means "depth has no impact".
*
* Using `max` or `Number.POSITIVE_INFINITY` is fully equivalent.
*
* @remarks Since 2.25.0
* @public
*/
type DepthSize = RelativeSize | Size | "max" | number | undefined; //#endregion
//#region src/check/runner/configuration/RandomType.d.ts
/**
* Random generators automatically recognized by the framework
* without having to pass a builder function
* @remarks Since 2.2.0
* @public
*/
type RandomType = "mersenne" | "congruential" | "congruential32" | "xorshift128plus" | "xoroshiro128plus"; //#endregion
//#region src/check/runner/configuration/VerbosityLevel.d.ts
/**
* Verbosity level
* @remarks Since 1.9.1
* @public
*/
declare enum VerbosityLevel {
  /**
  * Level 0 (default)
  *
  * Minimal reporting:
  * - minimal failing case
  * - error log corresponding to the minimal failing case
  *
  * @remarks Since 1.9.1
  */
  None = 0,
  /**
  * Level 1
  *
  * Failures reporting:
  * - same as `VerbosityLevel.None`
  * - list all the failures encountered during the shrinking process
  *
  * @remarks Since 1.9.1
  */
  Verbose = 1,
  /**
  * Level 2
  *
  * Execution flow reporting:
  * - same as `VerbosityLevel.None`
  * - all runs with their associated status displayed as a tree
  *
  * @remarks Since 1.9.1
  */
  VeryVerbose = 2
} //#endregion
//#region src/check/runner/reporter/ExecutionStatus.d.ts
/**
* Status of the execution of the property
* @remarks Since 1.9.0
* @public
*/
declare enum ExecutionStatus {
  Success = 0,
  Skipped = -1,
  Failure = 1
} //#endregion
//#region src/check/runner/reporter/ExecutionTree.d.ts
/**
* Summary of the execution process
* @remarks Since 1.9.0
* @public
*/
interface ExecutionTree<Ts> {
  /**
  * Status of the property
  * @remarks Since 1.9.0
  */
  status: ExecutionStatus;
  /**
  * Generated value
  * @remarks Since 1.9.0
  */
  value: Ts;
  /**
  * Values derived from this value
  * @remarks Since 1.9.0
  */
  children: ExecutionTree<Ts>[];
} //#endregion
//#region src/check/runner/reporter/RunDetails.d.ts
/**
* Post-run details produced by {@link check}
*
* A failing property can easily detected by checking the `failed` flag of this structure
*
* @remarks Since 0.0.7
* @public
*/
type RunDetails<Ts> = RunDetailsFailureProperty<Ts> | RunDetailsFailureTooManySkips<Ts> | RunDetailsFailureInterrupted<Ts> | RunDetailsSuccess<Ts>;
/**
* Run reported as failed because
* the property failed
*
* Refer to {@link RunDetailsCommon} for more details
*
* @remarks Since 1.25.0
* @public
*/
interface RunDetailsFailureProperty<Ts> extends RunDetailsCommon<Ts> {
  failed: true;
  interrupted: boolean;
  counterexample: Ts;
  counterexamplePath: string;
  errorInstance: unknown;
}
/**
* Run reported as failed because
* too many retries have been attempted to generate valid values
*
* Refer to {@link RunDetailsCommon} for more details
*
* @remarks Since 1.25.0
* @public
*/
interface RunDetailsFailureTooManySkips<Ts> extends RunDetailsCommon<Ts> {
  failed: true;
  interrupted: false;
  counterexample: null;
  counterexamplePath: null;
  errorInstance: null;
}
/**
* Run reported as failed because
* it took too long and thus has been interrupted
*
* Refer to {@link RunDetailsCommon} for more details
*
* @remarks Since 1.25.0
* @public
*/
interface RunDetailsFailureInterrupted<Ts> extends RunDetailsCommon<Ts> {
  failed: true;
  interrupted: true;
  counterexample: null;
  counterexamplePath: null;
  errorInstance: null;
}
/**
* Run reported as success
*
* Refer to {@link RunDetailsCommon} for more details
*
* @remarks Since 1.25.0
* @public
*/
interface RunDetailsSuccess<Ts> extends RunDetailsCommon<Ts> {
  failed: false;
  interrupted: boolean;
  counterexample: null;
  counterexamplePath: null;
  errorInstance: null;
}
/**
* Shared part between variants of RunDetails
* @remarks Since 2.2.0
* @public
*/
interface RunDetailsCommon<Ts> {
  /**
  * Does the property failed during the execution of {@link check}?
  * @remarks Since 0.0.7
  */
  failed: boolean;
  /**
  * Was the execution interrupted?
  * @remarks Since 1.19.0
  */
  interrupted: boolean;
  /**
  * Number of runs
  *
  * - In case of failed property: Number of runs up to the first failure (including the failure run)
  * - Otherwise: Number of successful executions
  *
  * @remarks Since 1.0.0
  */
  numRuns: number;
  /**
  * Number of skipped entries due to failed pre-condition
  *
  * As `numRuns` it only takes into account the skipped values that occured before the first failure.
  * Refer to {@link pre} to add such pre-conditions.
  *
  * @remarks Since 1.3.0
  */
  numSkips: number;
  /**
  * Number of shrinks required to get to the minimal failing case (aka counterexample)
  * @remarks Since 1.0.0
  */
  numShrinks: number;
  /**
  * Seed that have been used by the run
  *
  * It can be forced in {@link assert}, {@link check}, {@link sample} and {@link statistics} using `Parameters`
  * @remarks Since 0.0.7
  */
  seed: number;
  /**
  * In case of failure: the counterexample contains the minimal failing case (first failure after shrinking)
  * @remarks Since 0.0.7
  */
  counterexample: Ts | null;
  /**
  * In case of failure: it contains the error that has been thrown if any
  * @remarks Since 3.0.0
  */
  errorInstance: unknown | null;
  /**
  * In case of failure: path to the counterexample
  *
  * For replay purposes, it can be forced in {@link assert}, {@link check}, {@link sample} and {@link statistics} using `Parameters`
  *
  * @remarks Since 1.0.0
  */
  counterexamplePath: string | null;
  /**
  * List all failures that have occurred during the run
  *
  * You must enable verbose with at least `Verbosity.Verbose` in `Parameters`
  * in order to have values in it
  *
  * @remarks Since 1.1.0
  */
  failures: Ts[];
  /**
  * Execution summary of the run
  *
  * Traces the origin of each value encountered during the test and its execution status.
  * Can help to diagnose shrinking issues.
  *
  * You must enable verbose with at least `Verbosity.Verbose` in `Parameters`
  * in order to have values in it:
  * - Verbose: Only failures
  * - VeryVerbose: Failures, Successes and Skipped
  *
  * @remarks Since 1.9.0
  */
  executionSummary: ExecutionTree<Ts>[];
  /**
  * Verbosity level required by the user
  * @remarks Since 1.9.0
  */
  verbose: VerbosityLevel;
  /**
  * Configuration of the run
  *
  * It includes both local parameters set on {@link check} or {@link assert}
  * and global ones specified using {@link configureGlobal}
  *
  * @remarks Since 1.25.0
  */
  runConfiguration: Parameters$1<Ts>;
} //#endregion
//#region src/check/runner/configuration/Parameters.d.ts
/**
* Customization of the parameters used to run the properties
* @remarks Since 0.0.6
* @public
*/
interface Parameters$1<T = void> {
  /**
  * Initial seed of the generator: `Date.now()` by default
  *
  * It can be forced to replay a failed run.
  *
  * In theory, seeds are supposed to be 32-bit integers.
  * In case of double value, the seed will be rescaled into a valid 32-bit integer (eg.: values between 0 and 1 will be evenly spread into the range of possible seeds).
  *
  * @remarks Since 0.0.6
  */
  seed?: number;
  /**
  * Random number generator: `xorshift128plus` by default
  *
  * Random generator is the core element behind the generation of random values - changing it might directly impact the quality and performances of the generation of random values.
  * It can be one of: 'mersenne', 'congruential', 'congruential32', 'xorshift128plus', 'xoroshiro128plus'
  * Or any function able to build a `RandomGenerator` based on a seed
  *
  * As required since pure-rand v6.0.0, when passing a builder for {@link RandomGenerator},
  * the random number generator must generate values between -0x80000000 and 0x7fffffff.
  *
  * @remarks Since 1.6.0
  */
  randomType?: RandomType | ((seed: number) => RandomGenerator);
  /**
  * Number of runs before success: 100 by default
  * @remarks Since 1.0.0
  */
  numRuns?: number;
  /**
  * Maximal number of skipped values per run
  *
  * Skipped is considered globally, so this value is used to compute maxSkips = maxSkipsPerRun * numRuns.
  * Runner will consider a run to have failed if it skipped maxSkips+1 times before having generated numRuns valid entries.
  *
  * See {@link pre} for more details on pre-conditions
  *
  * @remarks Since 1.3.0
  */
  maxSkipsPerRun?: number;
  /**
  * Maximum time in milliseconds for the predicate to answer: disabled by default
  *
  * WARNING: Only works for async code (see {@link asyncProperty}), will not interrupt a synchronous code.
  * @remarks Since 0.0.11
  */
  timeout?: number;
  /**
  * Skip all runs after a given time limit: disabled by default
  *
  * NOTE: Relies on `Date.now()`.
  *
  * NOTE:
  * Useful to stop too long shrinking processes.
  * Replay capability (see `seed`, `path`) can resume the shrinking.
  *
  * WARNING:
  * It skips runs. Thus test might be marked as failed.
  * Indeed, it might not reached the requested number of successful runs.
  *
  * @remarks Since 1.15.0
  */
  skipAllAfterTimeLimit?: number;
  /**
  * Interrupt test execution after a given time limit: disabled by default
  *
  * NOTE: Relies on `Date.now()`.
  *
  * NOTE:
  * Useful to avoid having too long running processes in your CI.
  * Replay capability (see `seed`, `path`) can still be used if needed.
  *
  * WARNING:
  * If the test got interrupted before any failure occured
  * and before it reached the requested number of runs specified by `numRuns`
  * it will be marked as success. Except if `markInterruptAsFailure` has been set to `true`
  *
  * @remarks Since 1.19.0
  */
  interruptAfterTimeLimit?: number;
  /**
  * Mark interrupted runs as failed runs if preceded by one success or more: disabled by default
  * Interrupted with no success at all always defaults to failure whatever the value of this flag.
  * @remarks Since 1.19.0
  */
  markInterruptAsFailure?: boolean;
  /**
  * Skip runs corresponding to already tried values.
  *
  * WARNING:
  * Discarded runs will be retried. Under the hood they are simple calls to `fc.pre`.
  * In other words, if you ask for 100 runs but your generator can only generate 10 values then the property will fail as 100 runs will never be reached.
  * Contrary to `ignoreEqualValues` you always have the number of runs you requested.
  *
  * NOTE: Relies on `fc.stringify` to check the equality.
  *
  * @remarks Since 2.14.0
  */
  skipEqualValues?: boolean;
  /**
  * Discard runs corresponding to already tried values.
  *
  * WARNING:
  * Discarded runs will not be replaced.
  * In other words, if you ask for 100 runs and have 2 discarded runs you will only have 98 effective runs.
  *
  * NOTE: Relies on `fc.stringify` to check the equality.
  *
  * @remarks Since 2.14.0
  */
  ignoreEqualValues?: boolean;
  /**
  * Way to replay a failing property directly with the counterexample.
  * It can be fed with the counterexamplePath returned by the failing test (requires `seed` too).
  * @remarks Since 1.0.0
  */
  path?: string;
  /**
  * Logger (see {@link statistics}): `console.log` by default
  * @remarks Since 0.0.6
  */
  logger?(v: string): void;
  /**
  * Force the use of unbiased arbitraries: biased by default
  * @remarks Since 1.1.0
  */
  unbiased?: boolean;
  /**
  * Enable verbose mode: {@link VerbosityLevel.None} by default
  *
  * Using `verbose: true` is equivalent to `verbose: VerbosityLevel.Verbose`
  *
  * It can prove very useful to troubleshoot issues.
  * See {@link VerbosityLevel} for more details on each level.
  *
  * @remarks Since 1.1.0
  */
  verbose?: boolean | VerbosityLevel;
  /**
  * Custom values added at the beginning of generated ones
  *
  * It enables users to come with examples they want to test at every run
  *
  * @remarks Since 1.4.0
  */
  examples?: T[];
  /**
  * Stop run on failure
  *
  * It makes the run stop at the first encountered failure without shrinking.
  *
  * When used in complement to `seed` and `path`,
  * it replays only the minimal counterexample.
  *
  * @remarks Since 1.11.0
  */
  endOnFailure?: boolean;
  /**
  * Replace the default reporter handling errors by a custom one
  *
  * Reporter is responsible to throw in case of failure: default one throws whenever `runDetails.failed` is true.
  * But you may want to change this behaviour in yours.
  *
  * Only used when calling {@link assert}
  * Cannot be defined in conjonction with `asyncReporter`
  *
  * @remarks Since 1.25.0
  */
  reporter?: (runDetails: RunDetails<T>) => void;
  /**
  * Replace the default reporter handling errors by a custom one
  *
  * Reporter is responsible to throw in case of failure: default one throws whenever `runDetails.failed` is true.
  * But you may want to change this behaviour in yours.
  *
  * Only used when calling {@link assert}
  * Cannot be defined in conjonction with `reporter`
  * Not compatible with synchronous properties: runner will throw
  *
  * @remarks Since 1.25.0
  */
  asyncReporter?: (runDetails: RunDetails<T>) => Promise<void>;
  /**
  * By default the Error causing the failure of the predicate will not be directly exposed within the message
  * of the Error thown by fast-check. It will be exposed by a cause field attached to the Error.
  *
  * The Error with cause has been supported by Node since 16.14.0 and is properly supported in many test runners.
  *
  * But if the original Error fails to appear within your test runner,
  * Or if you prefer the Error to be included directly as part of the message of the resulted Error,
  * you can toggle this flag and the Error produced by fast-check in case of failure will expose the source Error
  * as part of the message and not as a cause.
  */
  includeErrorInReport?: boolean;
} //#endregion
//#region src/check/runner/configuration/GlobalParameters.d.ts
/**
* Type of legal hook function that can be used in the global parameter `beforeEach` and/or `afterEach`
* @remarks Since 2.3.0
* @public
*/
type GlobalPropertyHookFunction = () => void;
/**
* Type of legal hook function that can be used in the global parameter `asyncBeforeEach` and/or `asyncAfterEach`
* @remarks Since 2.3.0
* @public
*/
type GlobalAsyncPropertyHookFunction = (() => Promise<unknown>) | (() => void);
/**
* Type describing the global overrides
* @remarks Since 1.18.0
* @public
*/
type GlobalParameters = Pick<Parameters$1<unknown>, Exclude<keyof Parameters$1<unknown>, "path" | "examples">> & {
  /**
  * Specify a function that will be called before each execution of a property.
  * It behaves as-if you manually called `beforeEach` method on all the properties you execute with fast-check.
  *
  * The function will be used for both {@link fast-check#property} and {@link fast-check#asyncProperty}.
  * This global override should never be used in conjunction with `asyncBeforeEach`.
  *
  * @remarks Since 2.3.0
  */
  beforeEach?: GlobalPropertyHookFunction;
  /**
  * Specify a function that will be called after each execution of a property.
  * It behaves as-if you manually called `afterEach` method on all the properties you execute with fast-check.
  *
  * The function will be used for both {@link fast-check#property} and {@link fast-check#asyncProperty}.
  * This global override should never be used in conjunction with `asyncAfterEach`.
  *
  * @remarks Since 2.3.0
  */
  afterEach?: GlobalPropertyHookFunction;
  /**
  * Specify a function that will be called before each execution of an asynchronous property.
  * It behaves as-if you manually called `beforeEach` method on all the asynchronous properties you execute with fast-check.
  *
  * The function will be used only for {@link fast-check#asyncProperty}. It makes synchronous properties created by {@link fast-check#property} unable to run.
  * This global override should never be used in conjunction with `beforeEach`.
  *
  * @remarks Since 2.3.0
  */
  asyncBeforeEach?: GlobalAsyncPropertyHookFunction;
  /**
  * Specify a function that will be called after each execution of an asynchronous property.
  * It behaves as-if you manually called `afterEach` method on all the asynchronous properties you execute with fast-check.
  *
  * The function will be used only for {@link fast-check#asyncProperty}. It makes synchronous properties created by {@link fast-check#property} unable to run.
  * This global override should never be used in conjunction with `afterEach`.
  *
  * @remarks Since 2.3.0
  */
  asyncAfterEach?: GlobalAsyncPropertyHookFunction;
  /**
  * Define the base size to be used by arbitraries.
  *
  * By default arbitraries not specifying any size will default to it (except in some cases when used defaultSizeToMaxWhenMaxSpecified is true).
  * For some arbitraries users will want to override the default and either define another size relative to this one,
  * or a fixed one.
  *
  * @defaultValue `"small"`
  * @remarks Since 2.22.0
  */
  baseSize?: Size;
  /**
  * When set to `true` and if the size has not been defined for this precise instance,
  * it will automatically default to `"max"` if the user specified a upper bound for the range
  * (applies to length and to depth).
  *
  * When `false`, the size will be defaulted to `baseSize` even if the user specified
  * a upper bound for the range.
  *
  * @remarks Since 2.22.0
  */
  defaultSizeToMaxWhenMaxSpecified?: boolean;
};
/**
* Define global parameters that will be used by all the runners
*
* @example
* ```typescript
* fc.configureGlobal({ numRuns: 10 });
* //...
* fc.assert(
*   fc.property(
*     fc.nat(), fc.nat(),
*     (a, b) => a + b === b + a
*   ), { seed: 42 }
* ) // equivalent to { numRuns: 10, seed: 42 }
* ```
*
* @param parameters - Global parameters
*
* @remarks Since 1.18.0
* @public
*/
declare function configureGlobal(parameters: GlobalParameters): void;
/**
* Read global parameters that will be used by runners
* @remarks Since 1.18.0
* @public
*/
declare function readConfigureGlobal(): GlobalParameters;
/**
* Reset global parameters
* @remarks Since 1.18.0
* @public
*/
declare function resetConfigureGlobal(): void; //#endregion
//#region src/check/property/AsyncProperty.generic.d.ts
/**
* Type of legal hook function that can be used to call `beforeEach` or `afterEach`
* on a {@link IAsyncPropertyWithHooks}
*
* @remarks Since 2.2.0
* @public
*/
type AsyncPropertyHookFunction = ((previousHookFunction: GlobalAsyncPropertyHookFunction) => Promise<unknown>) | ((previousHookFunction: GlobalAsyncPropertyHookFunction) => void);
/**
* Interface for asynchronous property, see {@link IRawProperty}
* @remarks Since 1.19.0
* @public
*/
interface IAsyncProperty<Ts> extends IRawProperty<Ts, true> {}
/**
* Interface for asynchronous property defining hooks, see {@link IAsyncProperty}
* @remarks Since 2.2.0
* @public
*/
interface IAsyncPropertyWithHooks<Ts> extends IAsyncProperty<Ts> {
  /**
  * Define a function that should be called before all calls to the predicate
  * @param hookFunction - Function to be called
  * @remarks Since 1.6.0
  */
  beforeEach(hookFunction: AsyncPropertyHookFunction): IAsyncPropertyWithHooks<Ts>;
  /**
  * Define a function that should be called after all calls to the predicate
  * @param hookFunction - Function to be called
  * @remarks Since 1.6.0
  */
  afterEach(hookFunction: AsyncPropertyHookFunction): IAsyncPropertyWithHooks<Ts>;
} //#endregion
//#region src/check/property/AsyncProperty.d.ts
/**
* Instantiate a new {@link fast-check#IAsyncProperty}
* @param predicate - Assess the success of the property. Would be considered falsy if it throws or if its output evaluates to false
* @remarks Since 0.0.7
* @public
*/
declare function asyncProperty<Ts extends [unknown, ...unknown[]]>(...args: [...arbitraries: { [K in keyof Ts]: Arbitrary<Ts[K]> }, predicate: (...args: Ts) => Promise<boolean | void>]): IAsyncPropertyWithHooks<Ts>; //#endregion
//#region src/check/property/Property.generic.d.ts
/**
* Type of legal hook function that can be used to call `beforeEach` or `afterEach`
* on a {@link IPropertyWithHooks}
*
* @remarks Since 2.2.0
* @public
*/
type PropertyHookFunction = (globalHookFunction: GlobalPropertyHookFunction) => void;
/**
* Interface for synchronous property, see {@link IRawProperty}
* @remarks Since 1.19.0
* @public
*/
interface IProperty<Ts> extends IRawProperty<Ts, false> {}
/**
* Interface for synchronous property defining hooks, see {@link IProperty}
* @remarks Since 2.2.0
* @public
*/
interface IPropertyWithHooks<Ts> extends IProperty<Ts> {
  /**
  * Define a function that should be called before all calls to the predicate
  * @param invalidHookFunction - Function to be called, please provide a valid hook function
  * @remarks Since 1.6.0
  */
  beforeEach(invalidHookFunction: (hookFunction: GlobalPropertyHookFunction) => Promise<unknown>): "beforeEach expects a synchronous function but was given a function returning a Promise";
  /**
  * Define a function that should be called before all calls to the predicate
  * @param hookFunction - Function to be called
  * @remarks Since 1.6.0
  */
  beforeEach(hookFunction: PropertyHookFunction): IPropertyWithHooks<Ts>;
  /**
  * Define a function that should be called after all calls to the predicate
  * @param invalidHookFunction - Function to be called, please provide a valid hook function
  * @remarks Since 1.6.0
  */
  afterEach(invalidHookFunction: (hookFunction: GlobalPropertyHookFunction) => Promise<unknown>): "afterEach expects a synchronous function but was given a function returning a Promise";
  /**
  * Define a function that should be called after all calls to the predicate
  * @param hookFunction - Function to be called
  * @remarks Since 1.6.0
  */
  afterEach(hookFunction: PropertyHookFunction): IPropertyWithHooks<Ts>;
} //#endregion
//#region src/check/property/Property.d.ts
/**
* Instantiate a new {@link fast-check#IProperty}
* @param predicate - Assess the success of the property. Would be considered falsy if it throws or if its output evaluates to false
* @remarks Since 0.0.1
* @public
*/
declare function property<Ts extends [unknown, ...unknown[]]>(...args: [...arbitraries: { [K in keyof Ts]: Arbitrary<Ts[K]> }, predicate: (...args: Ts) => boolean | void]): IPropertyWithHooks<Ts>; //#endregion
//#region src/check/runner/Runner.d.ts
/**
* Run the property, do not throw contrary to {@link assert}
*
* WARNING: Has to be awaited
*
* @param property - Asynchronous property to be checked
* @param params - Optional parameters to customize the execution
*
* @returns Test status and other useful details
*
* @remarks Since 0.0.7
* @public
*/
declare function check<Ts>(property: IAsyncProperty<Ts>, params?: Parameters$1<Ts>): Promise<RunDetails<Ts>>;
/**
* Run the property, do not throw contrary to {@link assert}
*
* @param property - Synchronous property to be checked
* @param params - Optional parameters to customize the execution
*
* @returns Test status and other useful details
*
* @remarks Since 0.0.1
* @public
*/
declare function check<Ts>(property: IProperty<Ts>, params?: Parameters$1<Ts>): RunDetails<Ts>;
/**
* Run the property, do not throw contrary to {@link assert}
*
* WARNING: Has to be awaited if the property is asynchronous
*
* @param property - Property to be checked
* @param params - Optional parameters to customize the execution
*
* @returns Test status and other useful details
*
* @remarks Since 0.0.7
* @public
*/
declare function check<Ts>(property: IRawProperty<Ts>, params?: Parameters$1<Ts>): Promise<RunDetails<Ts>> | RunDetails<Ts>;
/**
* Run the property, throw in case of failure
*
* It can be called directly from describe/it blocks of Mocha.
* No meaningful results are produced in case of success.
*
* WARNING: Has to be awaited
*
* @param property - Asynchronous property to be checked
* @param params - Optional parameters to customize the execution
*
* @remarks Since 0.0.7
* @public
*/
declare function assert<Ts>(property: IAsyncProperty<Ts>, params?: Parameters$1<Ts>): Promise<void>;
/**
* Run the property, throw in case of failure
*
* It can be called directly from describe/it blocks of Mocha.
* No meaningful results are produced in case of success.
*
* @param property - Synchronous property to be checked
* @param params - Optional parameters to customize the execution
*
* @remarks Since 0.0.1
* @public
*/
declare function assert<Ts>(property: IProperty<Ts>, params?: Parameters$1<Ts>): void;
/**
* Run the property, throw in case of failure
*
* It can be called directly from describe/it blocks of Mocha.
* No meaningful results are produced in case of success.
*
* WARNING: Returns a promise to be awaited if the property is asynchronous
*
* @param property - Synchronous or asynchronous property to be checked
* @param params - Optional parameters to customize the execution
*
* @remarks Since 0.0.7
* @public
*/
declare function assert<Ts>(property: IRawProperty<Ts>, params?: Parameters$1<Ts>): Promise<void> | void; //#endregion
//#region src/check/runner/Sampler.d.ts
/**
* Generate an array containing all the values that would have been generated during {@link assert} or {@link check}
*
* @example
* ```typescript
* fc.sample(fc.nat(), 10); // extract 10 values from fc.nat() Arbitrary
* fc.sample(fc.nat(), {seed: 42}); // extract values from fc.nat() as if we were running fc.assert with seed=42
* ```
*
* @param generator - {@link IProperty} or {@link Arbitrary} to extract the values from
* @param params - Integer representing the number of values to generate or `Parameters` as in {@link assert}
*
* @remarks Since 0.0.6
* @public
*/
declare function sample<Ts>(generator: IRawProperty<Ts> | Arbitrary<Ts>, params?: Parameters$1<Ts> | number): Ts[];
/**
* Gather useful statistics concerning generated values
*
* Print the result in `console.log` or `params.logger` (if defined)
*
* @example
* ```typescript
* fc.statistics(
*     fc.nat(999),
*     v => v < 100 ? 'Less than 100' : 'More or equal to 100',
*     {numRuns: 1000, logger: console.log});
* // Classify 1000 values generated by fc.nat(999) into two categories:
* // - Less than 100
* // - More or equal to 100
* // The output will be sent line by line to the logger
* ```
*
* @param generator - {@link IProperty} or {@link Arbitrary} to extract the values from
* @param classify - Classifier function that can classify the generated value in zero, one or more categories (with free labels)
* @param params - Integer representing the number of values to generate or `Parameters` as in {@link assert}
*
* @remarks Since 0.0.6
* @public
*/
declare function statistics<Ts>(generator: IRawProperty<Ts> | Arbitrary<Ts>, classify: (v: Ts) => string | string[], params?: Parameters$1<Ts> | number): void; //#endregion
//#region src/arbitrary/_internals/builders/GeneratorValueBuilder.d.ts
/**
* Take an arbitrary builder and all its arguments separatly.
* Generate a value out of it.
*
* @remarks Since 3.8.0
* @public
*/
type GeneratorValueFunction = <T, TArgs extends unknown[]>(arb: (...params: TArgs) => Arbitrary<T>, ...args: TArgs) => T;
/**
* The values part is mostly exposed for the purpose of the tests.
* Or if you want to have a custom error formatter for this kind of values.
*
* @remarks Since 3.8.0
* @public
*/
type GeneratorValueMethods = {
  values: () => unknown[];
};
/**
* An instance of {@link GeneratorValue} can be leveraged within predicates themselves to produce extra random values
* while preserving part of the shrinking capabilities on the produced values.
*
* It can be seen as a way to start property based testing within something looking closer from what users will
* think about when thinking about random in tests. But contrary to raw random, it comes with many useful strengths
* such as: ability to re-run the test (seeded), shrinking...
*
* @remarks Since 3.8.0
* @public
*/
type GeneratorValue = GeneratorValueFunction & GeneratorValueMethods; //#endregion
//#region src/arbitrary/gen.d.ts
/**
* Generate values within the test execution itself by leveraging the strength of `gen`
*
* @example
* ```javascript
* fc.assert(
*   fc.property(fc.gen(), gen => {
*     const size = gen(fc.nat, {max: 10});
*     const array = [];
*     for (let index = 0 ; index !== size ; ++index) {
*       array.push(gen(fc.integer));
*     }
*     // Here is an array!
*     // Note: Prefer fc.array(fc.integer(), {maxLength: 10}) if you want to produce such array
*   })
* )
* ```
*
* ⚠️ WARNING:
* While `gen` is easy to use, it may not shrink as well as tailored arbitraries based on `filter` or `map`.
*
* ⚠️ WARNING:
* Additionally it cannot run back the test properly when attempting to replay based on a seed and a path.
* You'll need to limit yourself to the seed and drop the path from the options if you attempt to replay something
* implying it.  More precisely, you may keep the very first part of the path but have to drop anything after the
* first ":".
*
* ⚠️ WARNING:
* It also does not support custom examples.
*
* @remarks Since 3.8.0
* @public
*/
declare function gen(): Arbitrary<GeneratorValue>; //#endregion
//#region src/arbitrary/_internals/helpers/DepthContext.d.ts
/**
* Type used to strongly type instances of depth identifier while keeping internals
* what they contain internally
*
* @remarks Since 2.25.0
* @public
*/
type DepthIdentifier = {} & DepthContext;
/**
* Instance of depth, can be used to alter the depth perceived by an arbitrary
* or to bias your own arbitraries based on the current depth
*
* @remarks Since 2.25.0
* @public
*/
type DepthContext = {
  /**
  * Current depth (starts at 0, continues with 1, 2...).
  * Only made of integer values superior or equal to 0.
  *
  * Remark: Whenever altering the `depth` during a `generate`, please make sure to ALWAYS
  * reset it to its original value before you leave the `generate`. Otherwise the execution
  * will imply side-effects that will potentially impact the following runs and make replay
  * of the issue barely impossible.
  */
  depth: number;
};
/**
* Get back the requested DepthContext
* @remarks Since 2.25.0
* @public
*/
declare function getDepthContextFor(contextMeta: DepthContext | DepthIdentifier | string | undefined): DepthContext;
/**
* Create a new and unique instance of DepthIdentifier
* that can be shared across multiple arbitraries if needed
* @public
*/
declare function createDepthIdentifier(): DepthIdentifier; //#endregion
//#region src/arbitrary/array.d.ts
/**
* Constraints to be applied on {@link array}
* @remarks Since 2.4.0
* @public
*/
interface ArrayConstraints$1 {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 2.4.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.4.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  *
  * When used in conjonction with `maxLength`, `size` will be used to define
  * the upper bound of the generated array size while `maxLength` will be used
  * to define and document the general maximal length allowed for this case.
  *
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
  /**
  * When receiving a depth identifier, the arbitrary will impact the depth
  * attached to it to avoid going too deep if it already generated lots of items.
  *
  * In other words, if the number of generated values within the collection is large
  * then the generated items will tend to be less deep to avoid creating structures a lot
  * larger than expected.
  *
  * For the moment, the depth is not taken into account to compute the number of items to
  * define for a precise generate call of the array. Just applied onto eligible items.
  *
  * @remarks Since 2.25.0
  */
  depthIdentifier?: DepthIdentifier | string;
}
/**
* For arrays of values coming from `arb`
*
* @param arb - Arbitrary used to generate the values inside the array
* @param constraints - Constraints to apply when building instances (since 2.4.0)
*
* @remarks Since 0.0.1
* @public
*/
declare function array<T>(arb: Arbitrary<T>, constraints?: ArrayConstraints$1): Arbitrary<T[]>; //#endregion
//#region src/arbitrary/bigInt.d.ts
/**
* Constraints to be applied on {@link bigInt}
* @remarks Since 2.6.0
* @public
*/
interface BigIntConstraints$1 {
  /**
  * Lower bound for the generated bigints (eg.: -5n, 0n, BigInt(Number.MIN_SAFE_INTEGER))
  * @remarks Since 2.6.0
  */
  min?: bigint;
  /**
  * Upper bound for the generated bigints (eg.: -2n, 2147483647n, BigInt(Number.MAX_SAFE_INTEGER))
  * @remarks Since 2.6.0
  */
  max?: bigint;
}
/**
* For bigint
* @remarks Since 1.9.0
* @public
*/
declare function bigInt(): Arbitrary<bigint>;
/**
* For bigint between min (included) and max (included)
*
* @param min - Lower bound for the generated bigints (eg.: -5n, 0n, BigInt(Number.MIN_SAFE_INTEGER))
* @param max - Upper bound for the generated bigints (eg.: -2n, 2147483647n, BigInt(Number.MAX_SAFE_INTEGER))
*
* @remarks Since 1.9.0
* @public
*/
declare function bigInt(min: bigint, max: bigint): Arbitrary<bigint>;
/**
* For bigint between min (included) and max (included)
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.6.0
* @public
*/
declare function bigInt(constraints: BigIntConstraints$1): Arbitrary<bigint>;
/**
* For bigint between min (included) and max (included)
*
* @param args - Either min/max bounds as an object or constraints to apply when building instances
*
* @remarks Since 2.6.0
* @public
*/
declare function bigInt(...args: [] | [bigint, bigint] | [BigIntConstraints$1]): Arbitrary<bigint>; //#endregion
//#region src/arbitrary/boolean.d.ts
/**
* For boolean values - `true` or `false`
* @remarks Since 0.0.6
* @public
*/
declare function boolean(): Arbitrary<boolean>; //#endregion
//#region src/arbitrary/falsy.d.ts
/**
* Constraints to be applied on {@link falsy}
* @remarks Since 1.26.0
* @public
*/
interface FalsyContraints {
  /**
  * Enable falsy bigint value
  * @remarks Since 1.26.0
  */
  withBigInt?: boolean;
}
/**
* Typing for values generated by {@link falsy}
* @remarks Since 2.2.0
* @public
*/
type FalsyValue<TConstraints extends FalsyContraints = object> = false | null | 0 | "" | typeof NaN | undefined | (TConstraints extends {
  withBigInt: true;
} ? 0n : never);
/**
* For falsy values:
* - ''
* - 0
* - NaN
* - false
* - null
* - undefined
* - 0n (whenever withBigInt: true)
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 1.26.0
* @public
*/
declare function falsy<TConstraints extends FalsyContraints>(constraints?: TConstraints): Arbitrary<FalsyValue<TConstraints>>; //#endregion
//#region src/arbitrary/constant.d.ts
/**
* For `value`
* @param value - The value to produce
* @remarks Since 0.0.1
* @public
*/
declare function constant<const T>(value: T): Arbitrary<T>; //#endregion
//#region src/arbitrary/constantFrom.d.ts
/**
* For one `...values` values - all equiprobable
*
* **WARNING**: It expects at least one value, otherwise it should throw
*
* @param values - Constant values to be produced (all values shrink to the first one)
*
* @remarks Since 0.0.12
* @public
*/
declare function constantFrom<const T = never>(...values: T[]): Arbitrary<T>;
/**
* For one `...values` values - all equiprobable
*
* **WARNING**: It expects at least one value, otherwise it should throw
*
* @param values - Constant values to be produced (all values shrink to the first one)
*
* @remarks Since 0.0.12
* @public
*/
declare function constantFrom<TArgs extends any[] | [any]>(...values: TArgs): Arbitrary<TArgs[number]>; //#endregion
//#region src/arbitrary/context.d.ts
/**
* Execution context attached to one predicate run
* @remarks Since 2.2.0
* @public
*/
interface ContextValue {
  /**
  * Log execution details during a test.
  * Very helpful when troubleshooting failures
  * @param data - Data to be logged into the current context
  * @remarks Since 1.8.0
  */
  log(data: string): void;
  /**
  * Number of logs already logged into current context
  * @remarks Since 1.8.0
  */
  size(): number;
}
/**
* Produce a {@link ContextValue} instance
* @remarks Since 1.8.0
* @public
*/
declare function context(): Arbitrary<ContextValue>; //#endregion
//#region src/arbitrary/date.d.ts
/**
* Constraints to be applied on {@link date}
* @remarks Since 3.3.0
* @public
*/
interface DateConstraints$1 {
  /**
  * Lower bound of the range (included)
  * @defaultValue new Date(-8640000000000000)
  * @remarks Since 1.17.0
  */
  min?: Date;
  /**
  * Upper bound of the range (included)
  * @defaultValue new Date(8640000000000000)
  * @remarks Since 1.17.0
  */
  max?: Date;
  /**
  * When set to true, no more "Invalid Date" can be generated.
  * @defaultValue false
  * @remarks Since 3.13.0
  */
  noInvalidDate?: boolean;
}
/**
* For date between constraints.min or new Date(-8640000000000000) (included) and constraints.max or new Date(8640000000000000) (included)
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 1.17.0
* @public
*/
declare function date(constraints?: DateConstraints$1): Arbitrary<Date>; //#endregion
//#region src/arbitrary/clone.d.ts
/**
* Type of the value produced by {@link clone}
* @remarks Since 2.5.0
* @public
*/
type CloneValue<T, N extends number, Rest extends T[] = []> = [number] extends [N] ? T[] : Rest["length"] extends N ? Rest : CloneValue<T, N, [T, ...Rest]>;
/**
* Clone the values generated by `arb` in order to produce fully equal values (might not be equal in terms of === or ==)
*
* @param arb - Source arbitrary
* @param numValues - Number of values to produce
*
* @remarks Since 2.5.0
* @public
*/
declare function clone<T, N extends number>(arb: Arbitrary<T>, numValues: N): Arbitrary<CloneValue<T, N>>; //#endregion
//#region src/arbitrary/chainUntil.d.ts
/**
* Build an arbitrary by iteratively chaining arbitraries until the chainer returns undefined.
*
* Starting from a value produced by `startArb`, the `chainer` function is called with the current value
* to produce the next arbitrary. This process repeats until `chainer` returns `undefined`.
* The final value in the chain is the one produced by this arbitrary.
*
* The implementation is fully iterative (non-recursive) and supports shrinking.
*
* @param startArb - The starting arbitrary producing the initial value
* @param chainer - A function called with the current value that returns either the next arbitrary to generate from or undefined to stop the chain
* @returns An arbitrary producing the last value in the chain
*
* @remarks Since 4.8.0
* @public
*/
declare function chainUntil<T>(startArb: Arbitrary<T>, chainer: (prev: T) => Arbitrary<T> | undefined): Arbitrary<T>; //#endregion
//#region src/arbitrary/dictionary.d.ts
/**
* Constraints to be applied on {@link dictionary}
* @remarks Since 2.22.0
* @public
*/
interface DictionaryConstraints {
  /**
  * Lower bound for the number of keys defined into the generated instance
  * @defaultValue 0
  * @remarks Since 2.22.0
  */
  minKeys?: number;
  /**
  * Upper bound for the number of keys defined into the generated instance
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.22.0
  */
  maxKeys?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
  /**
  * Depth identifier can be used to share the current depth between several instances.
  *
  * By default, if not specified, each instance of dictionary will have its own depth.
  * In other words: you can have depth=1 in one while you have depth=100 in another one.
  *
  * @remarks Since 3.15.0
  */
  depthIdentifier?: DepthIdentifier | string;
  /**
  * Do not generate objects with null prototype
  * @defaultValue false
  * @remarks Since 3.13.0
  */
  noNullPrototype?: boolean;
}
/**
* For dictionaries with keys produced by `keyArb` and values from `valueArb`
*
* @param keyArb - Arbitrary used to generate the keys of the object
* @param valueArb - Arbitrary used to generate the values of the object
*
* @remarks Since 1.0.0
* @public
*/
declare function dictionary<T>(keyArb: Arbitrary<string>, valueArb: Arbitrary<T>, constraints?: DictionaryConstraints): Arbitrary<Record<string, T>>;
/**
* For dictionaries with keys produced by `keyArb` and values from `valueArb`
*
* @param keyArb - Arbitrary used to generate the keys of the object
* @param valueArb - Arbitrary used to generate the values of the object
*
* @remarks Since 4.4.0
* @public
*/
declare function dictionary<K extends PropertyKey, V>(keyArb: Arbitrary<K>, valueArb: Arbitrary<V>, constraints?: DictionaryConstraints): Arbitrary<Record<K, V>>; //#endregion
//#region src/arbitrary/emailAddress.d.ts
/**
* Constraints to be applied on {@link emailAddress}
* @remarks Since 2.22.0
* @public
*/
interface EmailAddressConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For email address
*
* According to {@link https://www.ietf.org/rfc/rfc2821.txt | RFC 2821},
* {@link https://www.ietf.org/rfc/rfc3696.txt | RFC 3696} and
* {@link https://www.ietf.org/rfc/rfc5322.txt | RFC 5322}
*
* @param constraints - Constraints to apply when building instances (since 2.22.0)
*
* @remarks Since 1.14.0
* @public
*/
declare function emailAddress(constraints?: EmailAddressConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/double.d.ts
/**
* Constraints to be applied on {@link double}
* @remarks Since 2.6.0
* @public
*/
interface DoubleConstraints {
  /**
  * Lower bound for the generated 64-bit floats (included, see minExcluded to exclude it)
  * @defaultValue Number.NEGATIVE_INFINITY, -1.7976931348623157e+308 when noDefaultInfinity is true
  * @remarks Since 2.8.0
  */
  min?: number;
  /**
  * Should the lower bound (aka min) be excluded?
  * Note: Excluding min=Number.NEGATIVE_INFINITY would result into having min set to -Number.MAX_VALUE.
  * @defaultValue false
  * @remarks Since 3.12.0
  */
  minExcluded?: boolean;
  /**
  * Upper bound for the generated 64-bit floats (included, see maxExcluded to exclude it)
  * @defaultValue Number.POSITIVE_INFINITY, 1.7976931348623157e+308 when noDefaultInfinity is true
  * @remarks Since 2.8.0
  */
  max?: number;
  /**
  * Should the upper bound (aka max) be excluded?
  * Note: Excluding max=Number.POSITIVE_INFINITY would result into having max set to Number.MAX_VALUE.
  * @defaultValue false
  * @remarks Since 3.12.0
  */
  maxExcluded?: boolean;
  /**
  * By default, lower and upper bounds are -infinity and +infinity.
  * By setting noDefaultInfinity to true, you move those defaults to minimal and maximal finite values.
  * @defaultValue false
  * @remarks Since 2.8.0
  */
  noDefaultInfinity?: boolean;
  /**
  * When set to true, no more Number.NaN can be generated.
  * @defaultValue false
  * @remarks Since 2.8.0
  */
  noNaN?: boolean;
  /**
  * When set to true, Number.isInteger(value) will be false for any generated value.
  * Note: -infinity and +infinity, or NaN can stil be generated except if you rejected them via another constraint.
  * @defaultValue false
  * @remarks Since 3.18.0
  */
  noInteger?: boolean;
}
/**
* For 64-bit floating point numbers:
* - sign: 1 bit
* - significand: 52 bits
* - exponent: 11 bits
*
* @param constraints - Constraints to apply when building instances (since 2.8.0)
*
* @remarks Since 0.0.6
* @public
*/
declare function double(constraints?: DoubleConstraints): Arbitrary<number>; //#endregion
//#region src/arbitrary/float.d.ts
/**
* Constraints to be applied on {@link float}
* @remarks Since 2.6.0
* @public
*/
interface FloatConstraints {
  /**
  * Lower bound for the generated 32-bit floats (included)
  * @defaultValue Number.NEGATIVE_INFINITY, -3.4028234663852886e+38 when noDefaultInfinity is true
  * @remarks Since 2.8.0
  */
  min?: number;
  /**
  * Should the lower bound (aka min) be excluded?
  * Note: Excluding min=Number.NEGATIVE_INFINITY would result into having min set to -3.4028234663852886e+38.
  * @defaultValue false
  * @remarks Since 3.12.0
  */
  minExcluded?: boolean;
  /**
  * Upper bound for the generated 32-bit floats (included)
  * @defaultValue Number.POSITIVE_INFINITY, 3.4028234663852886e+38 when noDefaultInfinity is true
  * @remarks Since 2.8.0
  */
  max?: number;
  /**
  * Should the upper bound (aka max) be excluded?
  * Note: Excluding max=Number.POSITIVE_INFINITY would result into having max set to 3.4028234663852886e+38.
  * @defaultValue false
  * @remarks Since 3.12.0
  */
  maxExcluded?: boolean;
  /**
  * By default, lower and upper bounds are -infinity and +infinity.
  * By setting noDefaultInfinity to true, you move those defaults to minimal and maximal finite values.
  * @defaultValue false
  * @remarks Since 2.8.0
  */
  noDefaultInfinity?: boolean;
  /**
  * When set to true, no more Number.NaN can be generated.
  * @defaultValue false
  * @remarks Since 2.8.0
  */
  noNaN?: boolean;
  /**
  * When set to true, Number.isInteger(value) will be false for any generated value.
  * Note: -infinity and +infinity, or NaN can stil be generated except if you rejected them via another constraint.
  * @defaultValue false
  * @remarks Since 3.18.0
  */
  noInteger?: boolean;
}
/**
* For 32-bit floating point numbers:
* - sign: 1 bit
* - significand: 23 bits
* - exponent: 8 bits
*
* The smallest non-zero value (in absolute value) that can be represented by such float is: 2 ** -126 * 2 ** -23.
* And the largest one is: 2 ** 127 * (1 + (2 ** 23 - 1) / 2 ** 23).
*
* @param constraints - Constraints to apply when building instances (since 2.8.0)
*
* @remarks Since 0.0.6
* @public
*/
declare function float(constraints?: FloatConstraints): Arbitrary<number>; //#endregion
//#region src/arbitrary/compareBooleanFunc.d.ts
/**
* For comparison boolean functions
*
* A comparison boolean function returns:
* - `true` whenever `a < b`
* - `false` otherwise (ie. `a = b` or `a > b`)
*
* @remarks Since 1.6.0
* @public
*/
declare function compareBooleanFunc<T>(): Arbitrary<(a: T, b: T) => boolean>; //#endregion
//#region src/arbitrary/compareFunc.d.ts
/**
* For comparison functions
*
* A comparison function returns:
* - negative value whenever `a < b`
* - positive value whenever `a > b`
* - zero whenever `a` and `b` are equivalent
*
* Comparison functions are transitive: `a < b and b < c => a < c`
*
* They also satisfy: `a < b <=> b > a` and `a = b <=> b = a`
*
* @remarks Since 1.6.0
* @public
*/
declare function compareFunc<T>(): Arbitrary<(a: T, b: T) => number>; //#endregion
//#region src/arbitrary/func.d.ts
/**
* For pure functions
*
* @param arb - Arbitrary responsible to produce the values
*
* @remarks Since 1.6.0
* @public
*/
declare function func<TArgs extends any[], TOut>(arb: Arbitrary<TOut>): Arbitrary<(...args: TArgs) => TOut>; //#endregion
//#region src/arbitrary/domain.d.ts
/**
* Constraints to be applied on {@link domain}
* @remarks Since 2.22.0
* @public
*/
interface DomainConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For domains
* having an extension with at least two lowercase characters
*
* According to {@link https://www.ietf.org/rfc/rfc1034.txt | RFC 1034},
* {@link https://www.ietf.org/rfc/rfc1035.txt | RFC 1035},
* {@link https://www.ietf.org/rfc/rfc1123.txt | RFC 1123} and
* {@link https://url.spec.whatwg.org/ | WHATWG URL Standard}
*
* @param constraints - Constraints to apply when building instances (since 2.22.0)
*
* @remarks Since 1.14.0
* @public
*/
declare function domain(constraints?: DomainConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/integer.d.ts
/**
* Constraints to be applied on {@link integer}
* @remarks Since 2.6.0
* @public
*/
interface IntegerConstraints {
  /**
  * Lower bound for the generated integers (included)
  * @defaultValue -0x80000000
  * @remarks Since 2.6.0
  */
  min?: number;
  /**
  * Upper bound for the generated integers (included)
  * @defaultValue 0x7fffffff
  * @remarks Since 2.6.0
  */
  max?: number;
}
/**
* For integers between min (included) and max (included)
*
* @param constraints - Constraints to apply when building instances (since 2.6.0)
*
* @remarks Since 0.0.1
* @public
*/
declare function integer(constraints?: IntegerConstraints): Arbitrary<number>; //#endregion
//#region src/arbitrary/maxSafeInteger.d.ts
/**
* For integers between Number.MIN_SAFE_INTEGER (included) and Number.MAX_SAFE_INTEGER (included)
* @remarks Since 1.11.0
* @public
*/
declare function maxSafeInteger(): Arbitrary<number>; //#endregion
//#region src/arbitrary/maxSafeNat.d.ts
/**
* For positive integers between 0 (included) and Number.MAX_SAFE_INTEGER (included)
* @remarks Since 1.11.0
* @public
*/
declare function maxSafeNat(): Arbitrary<number>; //#endregion
//#region src/arbitrary/nat.d.ts
/**
* Constraints to be applied on {@link nat}
* @remarks Since 2.6.0
* @public
*/
interface NatConstraints {
  /**
  * Upper bound for the generated postive integers (included)
  * @defaultValue 0x7fffffff
  * @remarks Since 2.6.0
  */
  max?: number;
}
/**
* For positive integers between 0 (included) and 2147483647 (included)
* @remarks Since 0.0.1
* @public
*/
declare function nat(): Arbitrary<number>;
/**
* For positive integers between 0 (included) and max (included)
*
* @param max - Upper bound for the generated integers
*
* @remarks You may prefer to use `fc.nat({max})` instead.
* @remarks Since 0.0.1
* @public
*/
declare function nat(max: number): Arbitrary<number>;
/**
* For positive integers between 0 (included) and max (included)
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.6.0
* @public
*/
declare function nat(constraints: NatConstraints): Arbitrary<number>;
/**
* For positive integers between 0 (included) and max (included)
*
* @param arg - Either a maximum number or constraints to apply when building instances
*
* @remarks Since 2.6.0
* @public
*/
declare function nat(arg?: number | NatConstraints): Arbitrary<number>; //#endregion
//#region src/arbitrary/ipV4.d.ts
/**
* For valid IP v4
*
* Following {@link https://tools.ietf.org/html/rfc3986#section-3.2.2 | RFC 3986}
*
* @remarks Since 1.14.0
* @public
*/
declare function ipV4(): Arbitrary<string>; //#endregion
//#region src/arbitrary/ipV4Extended.d.ts
/**
* For valid IP v4 according to WhatWG
*
* Following {@link https://url.spec.whatwg.org/ | WhatWG}, the specification for web-browsers
*
* There is no equivalent for IP v6 according to the {@link https://url.spec.whatwg.org/#concept-ipv6-parser | IP v6 parser}
*
* @remarks Since 1.17.0
* @public
*/
declare function ipV4Extended(): Arbitrary<string>; //#endregion
//#region src/arbitrary/ipV6.d.ts
/**
* For valid IP v6
*
* Following {@link https://tools.ietf.org/html/rfc3986#section-3.2.2 | RFC 3986}
*
* @remarks Since 1.14.0
* @public
*/
declare function ipV6(): Arbitrary<string>; //#endregion
//#region src/arbitrary/letrec.d.ts
/**
* Type of the value produced by {@link letrec}
* @remarks Since 3.0.0
* @public
*/
type LetrecValue<T> = { [K in keyof T]: Arbitrary<T[K]> };
/**
* Strongly typed type for the `tie` function passed by {@link letrec} to the `builder` function we pass to it.
* You may want also want to use its loosely typed version {@link LetrecLooselyTypedTie}.
*
* @remarks Since 3.0.0
* @public
*/
interface LetrecTypedTie<T> {
  <K extends keyof T>(key: K): Arbitrary<T[K]>;
  (key: string): Arbitrary<unknown>;
}
/**
* Strongly typed type for the `builder` function passed to {@link letrec}.
* You may want also want to use its loosely typed version {@link LetrecLooselyTypedBuilder}.
*
* @remarks Since 3.0.0
* @public
*/
type LetrecTypedBuilder<T> = (tie: LetrecTypedTie<T>) => LetrecValue<T>;
/**
* Loosely typed type for the `tie` function passed by {@link letrec} to the `builder` function we pass to it.
* You may want also want to use its strongly typed version {@link LetrecTypedTie}.
*
* @remarks Since 3.0.0
* @public
*/
type LetrecLooselyTypedTie = (key: string) => Arbitrary<unknown>;
/**
* Loosely typed type for the `builder` function passed to {@link letrec}.
* You may want also want to use its strongly typed version {@link LetrecTypedBuilder}.
*
* @remarks Since 3.0.0
* @public
*/
type LetrecLooselyTypedBuilder<T> = (tie: LetrecLooselyTypedTie) => LetrecValue<T>;
/**
* For mutually recursive types
*
* @example
* ```typescript
* type Leaf = number;
* type Node = [Tree, Tree];
* type Tree = Node | Leaf;
* const { tree } = fc.letrec<{ tree: Tree, node: Node, leaf: Leaf }>(tie => ({
*   tree: fc.oneof({depthSize: 'small'}, tie('leaf'), tie('node')),
*   node: fc.tuple(tie('tree'), tie('tree')),
*   leaf: fc.nat()
* }));
* // tree is 50% of node, 50% of leaf
* // the ratio goes in favor of leaves as we go deeper in the tree (thanks to depthSize)
* ```
*
* @param builder - Arbitraries builder based on themselves (through `tie`)
*
* @remarks Since 1.16.0
* @public
*/
declare function letrec<T>(builder: T extends Record<string, unknown> ? LetrecTypedBuilder<T> : never): LetrecValue<T>;
/**
* For mutually recursive types
*
* @example
* ```typescript
* const { tree } = fc.letrec(tie => ({
*   tree: fc.oneof({depthSize: 'small'}, tie('leaf'), tie('node')),
*   node: fc.tuple(tie('tree'), tie('tree')),
*   leaf: fc.nat()
* }));
* // tree is 50% of node, 50% of leaf
* // the ratio goes in favor of leaves as we go deeper in the tree (thanks to depthSize)
* ```
*
* @param builder - Arbitraries builder based on themselves (through `tie`)
*
* @remarks Since 1.16.0
* @public
*/
declare function letrec<T>(builder: LetrecLooselyTypedBuilder<T>): LetrecValue<T>; //#endregion
//#region src/arbitrary/_internals/interfaces/EntityGraphTypes.d.ts
/**
* Defines the shape of a single entity type, where each field is associated with
* an arbitrary that generates values for that field.
*
* @example
* ```typescript
* // Employee entity with firstName and lastName fields
* { firstName: fc.string(), lastName: fc.string() }
* ```
*
* @remarks Since 4.5.0
* @public
*/
type ArbitraryStructure<TFields> = { [TField in keyof TFields]: Arbitrary<TFields[TField]> };
/**
* Defines all entity types and their data fields for {@link entityGraph}.
*
* This is the first argument to {@link entityGraph} and specifies the non-relational properties
* of each entity type. Each key is the name of an entity type and its value defines the
* arbitraries for that entity.
*
* @example
* ```typescript
* {
*   employee: { name: fc.string(), age: fc.nat(100) },
*   team: { name: fc.string(), size: fc.nat(50) }
* }
* ```
*
* @remarks Since 4.5.0
* @public
*/
type Arbitraries<TEntityFields> = { [TEntityName in keyof TEntityFields]: ArbitraryStructure<TEntityFields[TEntityName]> };
/**
* Cardinality of a relationship between entities.
*
* Determines how many target entities can be referenced:
* - `'0-1'`: Optional relationship — references zero or one target entity (value or undefined)
* - `'1'`: Required relationship — always references exactly one target entity
* - `'many'`: Multi-valued relationship — references an array of target entities (may be empty, no duplicates)
* - `'inverse'`: Inverse relationship — automatically computed array of entities that reference this entity through a specified forward relationship
*
* @remarks Since 4.5.0
* @public
*/
type Arity = "0-1" | "1" | "many" | "inverse";
/**
* Defines restrictions on which entities can be targeted by a relationship.
*
* - `'any'`: No restrictions — any entity of the target type can be referenced
* - `'exclusive'`: Each target entity can only be referenced by one relationship (prevents sharing)
* - `'successor'`: Target must appear later in the entity list (prevents cycles)
*
* @defaultValue 'any'
* @remarks Since 4.5.0
* @public
*/
type Strategy = "any" | "exclusive" | "successor";
/**
* Specifies a single relationship between entity types.
*
* A relationship defines how one entity type references another (or itself). This configuration
* determines both the cardinality of the relationship and any restrictions on which entities
* can be referenced.
*
* @example
* ```typescript
* // An employee has an optional manager who is also an employee
* { arity: '0-1', type: 'employee', strategy: 'successor' }
*
* // A team has exactly one department
* { arity: '1', type: 'department' }
*
* // An employee can have multiple competencies
* { arity: 'many', type: 'competency' }
* ```
*
* @remarks Since 4.5.0
* @public
*/
type Relationship<TTypeNames> = {
  /**
  * Cardinality of the relationship — determines how many target entities can be referenced.
  *
  * - `'0-1'`: Optional — produces undefined or a single instance of the target type
  * - `'1'`: Required — always produces a single instance of the target type
  * - `'many'`: Multi-valued — produces an array of target instances (may be empty, contains no duplicates)
  * - `'inverse'`: Inverse — automatically produces an array of entities that reference this entity via the specified forward relationship
  *
  * @remarks Since 4.5.0
  */
  arity: Arity;
  /**
  * The name of the entity type being referenced by this relationship.
  *
  * Must be one of the entity type names defined in the first argument to {@link entityGraph}.
  *
  * @remarks Since 4.5.0
  */
  type: TTypeNames;
} & ({
  arity: Exclude<Arity, "inverse">;
  /**
  * Constrains which target entities are eligible to be referenced.
  *
  * - `'any'`: No restrictions — any entity of the target type can be selected
  * - `'exclusive'`: Each target can only be used once — prevents multiple relationships from referencing the same entity
  * - `'successor'`: Target must appear after the source in the entity array — prevents self-references and cycles
  *
  * @defaultValue 'any'
  * @remarks Since 4.5.0
  */
  strategy?: Strategy;
} | {
  arity: "inverse";
  /**
  * Name of the forward relationship property in the target type that references this entity type.
  * The inverse relationship will contain all entities that reference this entity through that forward relationship.
  *
  * @example
  * ```typescript
  * // If 'employee' has 'team: { arity: "1", type: "team" }'
  * // Then 'team' can have 'members: { arity: "inverse", type: "employee", forwardRelationship: "team" }'
  * ```
  *
  * @remarks Since 4.5.0
  */
  forwardRelationship: string;
});
/**
* Defines all relationships between entity types for {@link entityGraph}.
*
* This is the second argument to {@link entityGraph} and specifies how entities reference each other.
* Each entity type can have zero or more relationship fields, where each field defines a link
* to other entities.
*
* @example
* ```typescript
* {
*   employee: {
*     manager: { arity: '0-1', type: 'employee' },
*     team: { arity: '1', type: 'team' }
*   },
*   team: {}
* }
* ```
*
* @remarks Since 4.5.0
* @public
*/
type EntityRelations<TEntityFields> = { [TEntityName in keyof TEntityFields]: { [TField in string]: Relationship<keyof TEntityFields> } };
type RelationsToValue<TRelations, TValues> = { [TField in keyof TRelations]: TRelations[TField] extends {
  arity: "0-1";
  type: infer TTypeName extends keyof TValues;
} ? TValues[TTypeName] | undefined : TRelations[TField] extends {
  arity: "1";
  type: infer TTypeName extends keyof TValues;
} ? TValues[TTypeName] : TRelations[TField] extends {
  arity: "many";
  type: infer TTypeName extends keyof TValues;
} ? TValues[TTypeName][] : TRelations[TField] extends {
  arity: "inverse";
  type: infer TTypeName extends keyof TValues;
} ? TValues[TTypeName][] : never };
type Prettify$1<T> = { [K in keyof T]: T[K] } & {};
type EntityGraphSingleValue<TEntityFields, TEntityRelations extends EntityRelations<TEntityFields>> = { [TEntityName in keyof TEntityFields]: Prettify$1<TEntityFields[TEntityName] & RelationsToValue<TEntityRelations[TEntityName], EntityGraphSingleValue<TEntityFields, TEntityRelations>>> };
/**
* Type of the values generated by {@link entityGraph}.
*
* The output is an object where each key is an entity type name and each value is an array
* of entities of that type. Each entity contains both its data fields (from arbitraries) and
* relationship fields (from relations), with relationships resolved to actual entity references.
*
* @remarks Since 4.5.0
* @public
*/
type EntityGraphValue<TEntityFields, TEntityRelations extends EntityRelations<TEntityFields>> = { [TEntityName in keyof EntityGraphSingleValue<TEntityFields, TEntityRelations>]: EntityGraphSingleValue<TEntityFields, TEntityRelations>[TEntityName][] }; //#endregion
//#region src/arbitrary/uniqueArray.d.ts
/**
* Shared constraints to be applied on {@link uniqueArray}
* @remarks Since 2.23.0
* @public
*/
type UniqueArraySharedConstraints = {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 2.23.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.23.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.23.0
  */
  size?: SizeForArbitrary;
  /**
  * When receiving a depth identifier, the arbitrary will impact the depth
  * attached to it to avoid going too deep if it already generated lots of items.
  *
  * In other words, if the number of generated values within the collection is large
  * then the generated items will tend to be less deep to avoid creating structures a lot
  * larger than expected.
  *
  * For the moment, the depth is not taken into account to compute the number of items to
  * define for a precise generate call of the array. Just applied onto eligible items.
  *
  * @remarks Since 2.25.0
  */
  depthIdentifier?: DepthIdentifier | string;
};
/**
* Constraints implying known and optimized comparison function
* to be applied on {@link uniqueArray}
*
* @remarks Since 2.23.0
* @public
*/
type UniqueArrayConstraintsRecommended<T, U> = UniqueArraySharedConstraints & {
  /**
  * The operator to be used to compare the values after having applied the selector (if any):
  * - SameValue behaves like `Object.is` — {@link https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevalue}
  * - SameValueZero behaves like `Set` or `Map` — {@link https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero}
  * - IsStrictlyEqual behaves like `===` — {@link https://tc39.es/ecma262/multipage/abstract-operations.html#sec-isstrictlyequal}
  * - Fully custom comparison function: it implies performance costs for large arrays
  *
  * @defaultValue 'SameValue'
  * @remarks Since 2.23.0
  */
  comparator?: "SameValue" | "SameValueZero" | "IsStrictlyEqual";
  /**
  * How we should project the values before comparing them together
  * @defaultValue (v =&gt; v)
  * @remarks Since 2.23.0
  */
  selector?: (v: T) => U;
};
/**
* Constraints implying a fully custom comparison function
* to be applied on {@link uniqueArray}
*
* WARNING - Imply an extra performance cost whenever you want to generate large arrays
*
* @remarks Since 2.23.0
* @public
*/
type UniqueArrayConstraintsCustomCompare<T> = UniqueArraySharedConstraints & {
  /**
  * The operator to be used to compare the values after having applied the selector (if any)
  * @remarks Since 2.23.0
  */
  comparator: (a: T, b: T) => boolean;
  /**
  * How we should project the values before comparing them together
  * @remarks Since 2.23.0
  */
  selector?: undefined;
};
/**
* Constraints implying fully custom comparison function and selector
* to be applied on {@link uniqueArray}
*
* WARNING - Imply an extra performance cost whenever you want to generate large arrays
*
* @remarks Since 2.23.0
* @public
*/
type UniqueArrayConstraintsCustomCompareSelect<T, U> = UniqueArraySharedConstraints & {
  /**
  * The operator to be used to compare the values after having applied the selector (if any)
  * @remarks Since 2.23.0
  */
  comparator: (a: U, b: U) => boolean;
  /**
  * How we should project the values before comparing them together
  * @remarks Since 2.23.0
  */
  selector: (v: T) => U;
};
/**
* Constraints implying known and optimized comparison function
* to be applied on {@link uniqueArray}
*
* The defaults relies on the defaults specified by {@link UniqueArrayConstraintsRecommended}
*
* @remarks Since 2.23.0
* @public
*/
type UniqueArrayConstraints<T, U> = UniqueArrayConstraintsRecommended<T, U> | UniqueArrayConstraintsCustomCompare<T> | UniqueArrayConstraintsCustomCompareSelect<T, U>;
/**
* For arrays of unique values coming from `arb`
*
* @param arb - Arbitrary used to generate the values inside the array
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.23.0
* @public
*/
declare function uniqueArray<T, U>(arb: Arbitrary<T>, constraints?: UniqueArrayConstraintsRecommended<T, U>): Arbitrary<T[]>;
/**
* For arrays of unique values coming from `arb`
*
* @param arb - Arbitrary used to generate the values inside the array
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.23.0
* @public
*/
declare function uniqueArray<T>(arb: Arbitrary<T>, constraints: UniqueArrayConstraintsCustomCompare<T>): Arbitrary<T[]>;
/**
* For arrays of unique values coming from `arb`
*
* @param arb - Arbitrary used to generate the values inside the array
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.23.0
* @public
*/
declare function uniqueArray<T, U>(arb: Arbitrary<T>, constraints: UniqueArrayConstraintsCustomCompareSelect<T, U>): Arbitrary<T[]>;
/**
* For arrays of unique values coming from `arb`
*
* @param arb - Arbitrary used to generate the values inside the array
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 2.23.0
* @public
*/
declare function uniqueArray<T, U>(arb: Arbitrary<T>, constraints: UniqueArrayConstraints<T, U>): Arbitrary<T[]>; //#endregion
//#region src/arbitrary/entityGraph.d.ts
/**
* Constraints to be applied on {@link entityGraph}
* @remarks Since 4.5.0
* @public
*/
type EntityGraphContraints<TEntityFields> = {
  /**
  * Controls the minimum number of entities generated for each entity type in the initial pool.
  *
  * The initial pool defines the baseline set of entities that are created before any relationships
  * are established. Other entities may be created later to satisfy relationship requirements.
  *
  * @example
  * ```typescript
  * // Ensure at least 2 employees and at most 5 teams in the initial pool
  * // But possibly more than 5 teams at the end
  * { initialPoolConstraints: { employee: { minLength: 2 }, team: { maxLength: 5 } } }
  * ```
  *
  * @defaultValue When unspecified, defaults from {@link array} are used for each entity type
  * @remarks Since 4.5.0
  */
  initialPoolConstraints?: { [EntityName in keyof TEntityFields]?: ArrayConstraints$1 };
  /**
  * Defines uniqueness criteria for entities of each type to prevent duplicate values.
  *
  * The selector function extracts a key from each entity. Entities with identical keys
  * (compared using `Object.is`) are considered duplicates and only one instance will be kept.
  *
  * @example
  * ```typescript
  * // Ensure employees have unique names
  * { unicityConstraints: { employee: (emp) => emp.name } }
  * ```
  *
  * @defaultValue All entities are considered unique (no deduplication is performed)
  * @remarks Since 4.5.0
  */
  unicityConstraints?: { [EntityName in keyof TEntityFields]?: UniqueArrayConstraintsRecommended<TEntityFields[EntityName], unknown>["selector"] };
  /**
  * Do not generate values with null prototype
  * @defaultValue false
  * @remarks Since 4.5.0
  */
  noNullPrototype?: boolean;
};
/**
* Generates interconnected entities with relationships based on a schema definition.
*
* This arbitrary creates structured data where entities can reference each other through defined
* relationships. The generated values automatically include links between entities, making it
* ideal for testing graph structures, relational data, or interconnected object models.
*
* The output is an object where each key corresponds to an entity type and the value is an array
* of entities of that type. Entities contain both their data fields and relationship links.
*
* @example
* ```typescript
* // Generate a simple directed graph where nodes link to other nodes
* fc.entityGraph(
*   { node: { id: fc.stringMatching(/^[A-Z][a-z]*$/) } },
*   { node: { linkTo: { arity: 'many', type: 'node' } } },
* )
* // Produces: { node: [{ id: "Abc", linkTo: [<node#1>, <node#0>] }, ...] }
* ```
*
* @example
* ```typescript
* // Generate employees with managers and teams
* fc.entityGraph(
*   {
*     employee: { name: fc.string() },
*     team: { name: fc.string() }
*   },
*   {
*     employee: {
*       manager: { arity: '0-1', type: 'employee' },  // Optional manager
*       team: { arity: '1', type: 'team' }           // Required team
*     },
*     team: {}
*   }
* )
* ```
*
* @param arbitraries - Defines the data fields for each entity type (non-relational properties)
* @param relations - Defines how entities reference each other (relational properties)
* @param constraints - Optional configuration to customize generation behavior
*
* @remarks Since 4.5.0
* @public
*/
declare function entityGraph<TEntityFields, TEntityRelations extends EntityRelations<TEntityFields>>(arbitraries: Arbitraries<TEntityFields>, relations: TEntityRelations, constraints?: EntityGraphContraints<TEntityFields>): Arbitrary<EntityGraphValue<TEntityFields, TEntityRelations>>; //#endregion
//#region src/arbitrary/lorem.d.ts
/**
* Constraints to be applied on {@link lorem}
* @remarks Since 2.5.0
* @public
*/
interface LoremConstraints {
  /**
  * Maximal number of entities:
  * - maximal number of words in case mode is 'words'
  * - maximal number of sentences in case mode is 'sentences'
  *
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.5.0
  */
  maxCount?: number;
  /**
  * Type of strings that should be produced by {@link lorem}:
  * - words: multiple words
  * - sentences: multiple sentences
  *
  * @defaultValue 'words'
  * @remarks Since 2.5.0
  */
  mode?: "words" | "sentences";
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
}
/**
* For lorem ipsum string of words or sentences with maximal number of words or sentences
*
* @param constraints - Constraints to be applied onto the generated value (since 2.5.0)
*
* @remarks Since 0.0.1
* @public
*/
declare function lorem(constraints?: LoremConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/map.d.ts
/**
* Constraints to be applied on {@link map}
* @remarks Since 4.4.0
* @public
*/
interface MapConstraints {
  /**
  * Lower bound for the number of entries defined into the generated instance
  * @defaultValue 0
  * @remarks Since 4.4.0
  */
  minKeys?: number;
  /**
  * Upper bound for the number of entries defined into the generated instance
  * @defaultValue 0x7fffffff
  * @remarks Since 4.4.0
  */
  maxKeys?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 4.4.0
  */
  size?: SizeForArbitrary;
  /**
  * Depth identifier can be used to share the current depth between several instances.
  *
  * By default, if not specified, each instance of map will have its own depth.
  * In other words: you can have depth=1 in one while you have depth=100 in another one.
  *
  * @remarks Since 4.4.0
  */
  depthIdentifier?: DepthIdentifier | string;
}
/**
* For Maps with keys produced by `keyArb` and values from `valueArb`
*
* @param keyArb - Arbitrary used to generate the keys of the Map
* @param valueArb - Arbitrary used to generate the values of the Map
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 4.4.0
* @public
*/
declare function map<K, V>(keyArb: Arbitrary<K>, valueArb: Arbitrary<V>, constraints?: MapConstraints): Arbitrary<Map<K, V>>; //#endregion
//#region src/arbitrary/mapToConstant.d.ts
/**
* Generate non-contiguous ranges of values
* by mapping integer values to constant
*
* @param options - Builders to be called to generate the values
*
* @example
* ```
* // generate alphanumeric values (a-z0-9)
* mapToConstant(
*   { num: 26, build: v => String.fromCharCode(v + 0x61) },
*   { num: 10, build: v => String.fromCharCode(v + 0x30) },
* )
* ```
*
* @remarks Since 1.14.0
* @public
*/
declare function mapToConstant<T>(...entries: {
  num: number;
  build: (idInGroup: number) => T;
}[]): Arbitrary<T>; //#endregion
//#region src/arbitrary/memo.d.ts
/**
* Output type for {@link memo}
* @remarks Since 1.16.0
* @public
*/
type Memo<T> = (maxDepth?: number) => Arbitrary<T>;
/**
* For mutually recursive types
*
* @example
* ```typescript
* // tree is 1 / 3 of node, 2 / 3 of leaf
* const tree: fc.Memo<Tree> = fc.memo(n => fc.oneof(node(n), leaf(), leaf()));
* const node: fc.Memo<Tree> = fc.memo(n => {
*   if (n <= 1) return fc.record({ left: leaf(), right: leaf() });
*   return fc.record({ left: tree(), right: tree() }); // tree() is equivalent to tree(n-1)
* });
* const leaf = fc.nat;
* ```
*
* @param builder - Arbitrary builder taken the maximal depth allowed as input (parameter `n`)
*
* @remarks Since 1.16.0
* @public
*/
declare function memo<T>(builder: (maxDepth: number) => Arbitrary<T>): Memo<T>; //#endregion
//#region src/arbitrary/mixedCase.d.ts
/**
* Constraints to be applied on {@link mixedCase}
* @remarks Since 1.17.0
* @public
*/
interface MixedCaseConstraints {
  /**
  * Transform a character to its upper and/or lower case version
  * @defaultValue try `toUpperCase` on the received code-point, if no effect try `toLowerCase`
  * @remarks Since 1.17.0
  */
  toggleCase?: (rawChar: string) => string;
  /**
  * In order to be fully reversable (only in case you want to shrink user definable values)
  * you should provide a function taking a string containing possibly toggled items and returning its
  * untoggled version.
  */
  untoggleAll?: (toggledString: string) => string;
}
/**
* Randomly switch the case of characters generated by `stringArb` (upper/lower)
*
* WARNING:
* Require bigint support.
* Under-the-hood the arbitrary relies on bigint to compute the flags that should be toggled or not.
*
* @param stringArb - Arbitrary able to build string values
* @param constraints - Constraints to be applied when computing upper/lower case version
*
* @remarks Since 1.17.0
* @public
*/
declare function mixedCase(stringArb: Arbitrary<string>, constraints?: MixedCaseConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/_shared/StringSharedConstraints.d.ts
/**
* Constraints to be applied on arbitraries for strings
* @remarks Since 2.4.0
* @public
*/
interface StringSharedConstraints {
  /**
  * Lower bound of the generated string length (included)
  * @defaultValue 0
  * @remarks Since 2.4.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated string length (included)
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.4.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
} //#endregion
//#region src/arbitrary/string.d.ts
/**
* Constraints to be applied on arbitrary {@link string}
* @remarks Since 3.22.0
* @public
*/
type StringConstraints$1 = StringSharedConstraints & {
  /**
  * A string results from the join between several unitary strings produced by the Arbitrary instance defined by `unit`.
  * The `minLength` and `maxLength` refers to the number of these units composing the string. In other words it does not have to be confound with `.length` on an instance of string.
  *
  * A unit can either be a fully custom Arbitrary or one of the pre-defined options:
  * - `'grapheme'` - Any printable grapheme as defined by the Unicode standard. This unit includes graphemes that may:
  *   - Span multiple code points (e.g., `'\u{0061}\u{0300}'`)
  *   - Consist of multiple characters (e.g., `'\u{1f431}'`)
  *   - Include non-European and non-ASCII characters.
  *   - **Note:** Graphemes produced by this unit are designed to remain visually distinct when joined together.
  *   - **Note:** We are relying on the specifications of Unicode 15.
  * - `'grapheme-composite'` - Any printable grapheme limited to a single code point. This option produces graphemes limited to a single code point.
  *   - **Note:** Graphemes produced by this unit are designed to remain visually distinct when joined together.
  *   - **Note:** We are relying on the specifications of Unicode 15.
  * - `'grapheme-ascii'` - Any printable ASCII character.
  * - `'binary'` - Any possible code point (except half surrogate pairs), regardless of how it may combine with subsequent code points in the produced string. This unit produces a single code point within the full Unicode range (0000-10FFFF).
  * - `'binary-ascii'` - Any possible ASCII character, including control characters. This unit produces any code point in the range 0000-00FF.
  *
  * @defaultValue 'grapheme-ascii'
  * @remarks Since 3.22.0
  */
  unit?: "grapheme" | "grapheme-composite" | "grapheme-ascii" | "binary" | "binary-ascii" | Arbitrary<string>;
};
/**
* For strings of {@link char}
*
* @param constraints - Constraints to apply when building instances (since 2.4.0)
*
* @remarks Since 0.0.1
* @public
*/
declare function string(constraints?: StringConstraints$1): Arbitrary<string>; //#endregion
//#region src/arbitrary/_internals/helpers/QualifiedObjectConstraints.d.ts
/**
* Constraints for {@link anything} and {@link object}
* @public
*/
interface ObjectConstraints {
  /**
  * Limit the depth of the object by increasing the probability to generate simple values (defined via values)
  * as we go deeper in the object.
  * @remarks Since 2.20.0
  */
  depthSize?: DepthSize;
  /**
  * Maximal depth allowed
  * @defaultValue Number.POSITIVE_INFINITY — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 0.0.7
  */
  maxDepth?: number;
  /**
  * Maximal number of keys
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 1.13.0
  */
  maxKeys?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
  /**
  * Arbitrary for keys
  * @defaultValue {@link string}
  * @remarks Since 0.0.7
  */
  key?: Arbitrary<string>;
  /**
  * Arbitrary for values
  * @defaultValue {@link boolean}, {@link integer}, {@link double}, {@link string}, null, undefined, Number.NaN, +0, -0, Number.EPSILON, Number.MIN_VALUE, Number.MAX_VALUE, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY
  * @remarks Since 0.0.7
  */
  values?: Arbitrary<unknown>[];
  /**
  * Also generate boxed versions of values
  * @defaultValue false
  * @remarks Since 1.11.0
  */
  withBoxedValues?: boolean;
  /**
  * Also generate Set
  * @defaultValue false
  * @remarks Since 1.11.0
  */
  withSet?: boolean;
  /**
  * Also generate Map
  * @defaultValue false
  * @remarks Since 1.11.0
  */
  withMap?: boolean;
  /**
  * Also generate string representations of object instances
  * @defaultValue false
  * @remarks Since 1.17.0
  */
  withObjectString?: boolean;
  /**
  * Also generate object with null prototype
  * @defaultValue false
  * @remarks Since 1.23.0
  */
  withNullPrototype?: boolean;
  /**
  * Also generate BigInt
  * @defaultValue false
  * @remarks Since 1.26.0
  */
  withBigInt?: boolean;
  /**
  * Also generate Date
  * @defaultValue false
  * @remarks Since 2.5.0
  */
  withDate?: boolean;
  /**
  * Also generate typed arrays in: (Uint|Int)(8|16|32)Array and Float(32|64)Array
  * Remark: no typed arrays made of bigint
  * @defaultValue false
  * @remarks Since 2.9.0
  */
  withTypedArray?: boolean;
  /**
  * Also generate sparse arrays (arrays with holes)
  * @defaultValue false
  * @remarks Since 2.13.0
  */
  withSparseArray?: boolean;
  /**
  * Replace the arbitrary of strings defaulted for key and values by one able to generate unicode strings with non-ascii characters.
  * If you override key and/or values constraint, this flag will not apply to your override.
  * @deprecated Prefer using `stringUnit` to customize the kind of strings that will be generated by default.
  * @defaultValue false
  * @remarks Since 3.19.0
  */
  withUnicodeString?: boolean;
  /**
  * Replace the default unit for strings.
  * @defaultValue undefined
  * @remarks Since 3.23.0
  */
  stringUnit?: StringConstraints$1["unit"];
} //#endregion
//#region src/arbitrary/object.d.ts
/**
* For any objects
*
* You may use {@link sample} to preview the values that will be generated
*
* @example
* ```javascript
* {}, {k: [{}, 1, 2]}
* ```
*
* @remarks Since 0.0.7
* @public
*/
declare function object(): Arbitrary<Record<string, unknown>>;
/**
* For any objects following the constraints defined by `settings`
*
* You may use {@link sample} to preview the values that will be generated
*
* @example
* ```javascript
* {}, {k: [{}, 1, 2]}
* ```
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 0.0.7
* @public
*/
declare function object(constraints: ObjectConstraints): Arbitrary<Record<string, unknown>>; //#endregion
//#region src/arbitrary/_internals/helpers/JsonConstraintsBuilder.d.ts
/**
* Shared constraints for:
* - {@link json},
* - {@link jsonValue},
*
* @remarks Since 2.5.0
* @public
*/
interface JsonSharedConstraints {
  /**
  * Limit the depth of the object by increasing the probability to generate simple values (defined via values)
  * as we go deeper in the object.
  *
  * @remarks Since 2.20.0
  */
  depthSize?: DepthSize;
  /**
  * Maximal depth allowed
  * @defaultValue Number.POSITIVE_INFINITY — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.5.0
  */
  maxDepth?: number;
  /**
  * Only generate instances having keys and values made of ascii strings (when true)
  * @deprecated Prefer using `stringUnit` to customize the kind of strings that will be generated by default.
  * @defaultValue true
  * @remarks Since 3.19.0
  */
  noUnicodeString?: boolean;
  /**
  * Replace the default unit for strings.
  * @defaultValue undefined
  * @remarks Since 3.23.0
  */
  stringUnit?: StringConstraints$1["unit"];
}
/**
* Typings for a Json array
* @remarks Since 2.20.0
* @public
*/
type JsonArray$1 = Array<JsonValue>;
/**
* Typings for a Json object
* @remarks Since 2.20.0
* @public
*/
type JsonObject$1 = { [key in string]?: JsonValue };
/**
* Typings for a Json value
* @remarks Since 2.20.0
* @public
*/
type JsonValue = boolean | number | string | null | JsonArray$1 | JsonObject$1; //#endregion
//#region src/arbitrary/json.d.ts
/**
* For any JSON strings
*
* Keys and string values rely on {@link string}
*
* @param constraints - Constraints to be applied onto the generated instance (since 2.5.0)
*
* @remarks Since 0.0.7
* @public
*/
declare function json(constraints?: JsonSharedConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/anything.d.ts
/**
* For any type of values
*
* You may use {@link sample} to preview the values that will be generated
*
* @example
* ```javascript
* null, undefined, 42, 6.5, 'Hello', {}, {k: [{}, 1, 2]}
* ```
*
* @remarks Since 0.0.7
* @public
*/
declare function anything(): Arbitrary<unknown>;
/**
* For any type of values following the constraints defined by `settings`
*
* You may use {@link sample} to preview the values that will be generated
*
* @example
* ```javascript
* null, undefined, 42, 6.5, 'Hello', {}, {k: [{}, 1, 2]}
* ```
*
* @example
* ```typescript
* // Using custom settings
* fc.anything({
*     key: fc.string(),
*     values: [fc.integer(10,20), fc.constant(42)],
*     maxDepth: 2
* });
* // Can build entries such as:
* // - 19
* // - [{"2":12,"k":15,"A":42}]
* // - {"4":[19,13,14,14,42,11,20,11],"6":42,"7":16,"L":10,"'":[20,11],"e":[42,20,42,14,13,17]}
* // - [42,42,42]...
* ```
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 0.0.7
* @public
*/
declare function anything(constraints: ObjectConstraints): Arbitrary<unknown>; //#endregion
//#region src/arbitrary/jsonValue.d.ts
/**
* For any JSON compliant values
*
* Keys and string values rely on {@link string}
*
* As `JSON.parse` preserves `-0`, `jsonValue` can also have `-0` as a value.
* `jsonValue` must be seen as: any value that could have been built by doing a `JSON.parse` on a given string.
*
* @param constraints - Constraints to be applied onto the generated instance
*
* @remarks Since 2.20.0
* @public
*/
declare function jsonValue(constraints?: JsonSharedConstraints): Arbitrary<JsonValue>; //#endregion
//#region src/arbitrary/oneof.d.ts
/**
* Conjonction of a weight and an arbitrary used by {@link oneof}
* in order to generate values
*
* @remarks Since 1.18.0
* @public
*/
interface WeightedArbitrary<T> {
  /**
  * Weight to be applied when selecting which arbitrary should be used
  * @remarks Since 0.0.7
  */
  weight: number;
  /**
  * Instance of Arbitrary
  * @remarks Since 0.0.7
  */
  arbitrary: Arbitrary<T>;
}
/**
* Either an `Arbitrary<T>` or a `WeightedArbitrary<T>`
* @remarks Since 3.0.0
* @public
*/
type MaybeWeightedArbitrary<T> = Arbitrary<T> | WeightedArbitrary<T>;
/**
* Infer the type of the Arbitrary produced by {@link oneof}
* given the type of the source arbitraries
*
* @remarks Since 2.2.0
* @public
*/
type OneOfValue<Ts extends MaybeWeightedArbitrary<unknown>[]> = { [K in keyof Ts]: Ts[K] extends MaybeWeightedArbitrary<infer U> ? U : never }[number];
/**
* Constraints to be applied on {@link oneof}
* @remarks Since 2.14.0
* @public
*/
type OneOfConstraints = {
  /**
  * When set to true, the shrinker of oneof will try to check if the first arbitrary
  * could have been used to discover an issue. It allows to shrink trees.
  *
  * Warning: First arbitrary must be the one resulting in the smallest structures
  * for usages in deep tree-like structures.
  *
  * @defaultValue false
  * @remarks Since 2.14.0
  */
  withCrossShrink?: boolean;
  /**
  * While going deeper and deeper within a recursive structure (see {@link letrec}),
  * this factor will be used to increase the probability to generate instances
  * of the first passed arbitrary.
  *
  * @remarks Since 2.14.0
  */
  depthSize?: DepthSize;
  /**
  * Maximal authorized depth.
  * Once this depth has been reached only the first arbitrary will be used.
  *
  * @defaultValue Number.POSITIVE_INFINITY — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.14.0
  */
  maxDepth?: number;
  /**
  * Depth identifier can be used to share the current depth between several instances.
  *
  * By default, if not specified, each instance of oneof will have its own depth.
  * In other words: you can have depth=1 in one while you have depth=100 in another one.
  *
  * @remarks Since 2.14.0
  */
  depthIdentifier?: DepthIdentifier | string;
};
/**
* For one of the values generated by `...arbs` - with all `...arbs` equiprobable
*
* **WARNING**: It expects at least one arbitrary
*
* @param arbs - Arbitraries that might be called to produce a value
*
* @remarks Since 0.0.1
* @public
*/
declare function oneof<Ts extends MaybeWeightedArbitrary<unknown>[]>(...arbs: Ts): Arbitrary<OneOfValue<Ts>>;
/**
* For one of the values generated by `...arbs` - with all `...arbs` equiprobable
*
* **WARNING**: It expects at least one arbitrary
*
* @param constraints - Constraints to be applied when generating the values
* @param arbs - Arbitraries that might be called to produce a value
*
* @remarks Since 2.14.0
* @public
*/
declare function oneof<Ts extends MaybeWeightedArbitrary<unknown>[]>(constraints: OneOfConstraints, ...arbs: Ts): Arbitrary<OneOfValue<Ts>>; //#endregion
//#region src/arbitrary/option.d.ts
/**
* Constraints to be applied on {@link option}
* @remarks Since 2.2.0
* @public
*/
interface OptionConstraints<TNil = null> {
  /**
  * The probability to build a nil value is of `1 / freq`.
  * @defaultValue 6
  * @remarks Since 1.17.0
  */
  freq?: number;
  /**
  * The nil value
  * @defaultValue null
  * @remarks Since 1.17.0
  */
  nil?: TNil;
  /**
  * While going deeper and deeper within a recursive structure (see {@link letrec}),
  * this factor will be used to increase the probability to generate nil.
  *
  * @remarks Since 2.14.0
  */
  depthSize?: DepthSize;
  /**
  * Maximal authorized depth. Once this depth has been reached only nil will be used.
  * @defaultValue Number.POSITIVE_INFINITY — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.14.0
  */
  maxDepth?: number;
  /**
  * Depth identifier can be used to share the current depth between several instances.
  *
  * By default, if not specified, each instance of option will have its own depth.
  * In other words: you can have depth=1 in one while you have depth=100 in another one.
  *
  * @remarks Since 2.14.0
  */
  depthIdentifier?: DepthIdentifier | string;
}
/**
* For either nil or a value coming from `arb` with custom frequency
*
* @param arb - Arbitrary that will be called to generate a non nil value
* @param constraints - Constraints on the option(since 1.17.0)
*
* @remarks Since 0.0.6
* @public
*/
declare function option<T, TNil = null>(arb: Arbitrary<T>, constraints?: OptionConstraints<TNil>): Arbitrary<T | TNil>; //#endregion
//#region src/arbitrary/record.d.ts
type Prettify<T> = { [K in keyof T]: T[K] } & {};
/**
* Constraints to be applied on {@link record}
* @remarks Since 0.0.12
* @public
*/
type RecordConstraints<T = unknown> = {
  /**
  * List keys that should never be deleted.
  *
  * Remark:
  * You might need to use an explicit typing in case you need to declare symbols as required (not needed when required keys are simple strings).
  * With something like `{ requiredKeys: [mySymbol1, 'a'] as [typeof mySymbol1, 'a'] }` when both `mySymbol1` and `a` are required.
  *
  * @defaultValue Array containing all keys of recordModel
  * @remarks Since 2.11.0
  */
  requiredKeys?: T[];
  /**
  * Do not generate records with null prototype
  * @defaultValue false
  * @remarks Since 3.13.0
  */
  noNullPrototype?: boolean;
};
/**
* Infer the type of the Arbitrary produced by record
* given the type of the source arbitrary and constraints to be applied
*
* @remarks Since 2.2.0
* @public
*/
type RecordValue<T, K> = Prettify<Partial<T> & Pick<T, K & keyof T>>;
/**
* For records following the `recordModel` schema
*
* @example
* ```typescript
* record({ x: someArbitraryInt, y: someArbitraryInt }, {requiredKeys: []}): Arbitrary<{x?:number,y?:number}>
* // merge two integer arbitraries to produce a {x, y}, {x}, {y} or {} record
* ```
*
* @param recordModel - Schema of the record
* @param constraints - Contraints on the generated record
*
* @remarks Since 0.0.12
* @public
*/
declare function record<T, K extends keyof T = keyof T>(model: { [K in keyof T]: Arbitrary<T[K]> }, constraints?: RecordConstraints<K>): Arbitrary<RecordValue<T, K>>; //#endregion
//#region src/arbitrary/set.d.ts
/**
* Constraints to be applied on {@link set}
* @remarks Since 4.4.0
* @public
*/
type SetConstraints = {
  /**
  * Lower bound of the generated set size
  * @defaultValue 0
  * @remarks Since 4.4.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated set size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 4.4.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 4.4.0
  */
  size?: SizeForArbitrary;
  /**
  * When receiving a depth identifier, the arbitrary will impact the depth
  * attached to it to avoid going too deep if it already generated lots of items.
  *
  * In other words, if the number of generated values within the collection is large
  * then the generated items will tend to be less deep to avoid creating structures a lot
  * larger than expected.
  *
  * For the moment, the depth is not taken into account to compute the number of items to
  * define for a precise generate call of the set. Just applied onto eligible items.
  *
  * @remarks Since 4.4.0
  */
  depthIdentifier?: DepthIdentifier | string;
};
/**
* For sets of values coming from `arb`
*
* All the values in the set are unique. Comparison of values relies on `SameValueZero`
* which is the same comparison algorithm used by `Set`.
*
* @param arb - Arbitrary used to generate the values inside the set
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 4.4.0
* @public
*/
declare function set<T>(arb: Arbitrary<T>, constraints?: SetConstraints): Arbitrary<Set<T>>; //#endregion
//#region src/arbitrary/infiniteStream.d.ts
/**
* Constraints to be applied on {@link infiniteStream}
* @remarks Since 4.3.0
* @public
*/
interface InfiniteStreamConstraints {
  /**
  * Do not save items emitted by this arbitrary and print count instead.
  * Recommended for very large tests.
  *
  * @defaultValue false
  */
  noHistory?: boolean;
}
/**
* Produce an infinite stream of values
*
* WARNING: By default, infiniteStream remembers all values it has ever
* generated. This causes unbounded memory growth during large tests.
* Set noHistory to disable.
*
* WARNING: Requires Object.assign
*
* @param arb - Arbitrary used to generate the values
* @param constraints - Constraints to apply when building instances (since 4.3.0)
*
* @remarks Since 1.8.0
* @public
*/
declare function infiniteStream<T>(arb: Arbitrary<T>, constraints?: InfiniteStreamConstraints): Arbitrary<Stream<T>>; //#endregion
//#region src/arbitrary/base64String.d.ts
/**
* For base64 strings
*
* A base64 string will always have a length multiple of 4 (padded with =)
*
* @param constraints - Constraints to apply when building instances (since 2.4.0)
*
* @remarks Since 0.0.1
* @public
*/
declare function base64String(constraints?: StringSharedConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/subarray.d.ts
/**
* Constraints to be applied on {@link subarray}
* @remarks Since 2.4.0
* @public
*/
interface SubarrayConstraints {
  /**
  * Lower bound of the generated subarray size (included)
  * @defaultValue 0
  * @remarks Since 2.4.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated subarray size (included)
  * @defaultValue The length of the original array itself
  * @remarks Since 2.4.0
  */
  maxLength?: number;
}
/**
* For subarrays of `originalArray` (keeps ordering)
*
* @param originalArray - Original array
* @param constraints - Constraints to apply when building instances (since 2.4.0)
*
* @remarks Since 1.5.0
* @public
*/
declare function subarray<T>(originalArray: T[], constraints?: SubarrayConstraints): Arbitrary<T[]>; //#endregion
//#region src/arbitrary/shuffledSubarray.d.ts
/**
* Constraints to be applied on {@link shuffledSubarray}
* @remarks Since 2.18.0
* @public
*/
interface ShuffledSubarrayConstraints {
  /**
  * Lower bound of the generated subarray size (included)
  * @defaultValue 0
  * @remarks Since 2.4.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated subarray size (included)
  * @defaultValue The length of the original array itself
  * @remarks Since 2.4.0
  */
  maxLength?: number;
}
/**
* For subarrays of `originalArray`
*
* @param originalArray - Original array
* @param constraints - Constraints to apply when building instances (since 2.4.0)
*
* @remarks Since 1.5.0
* @public
*/
declare function shuffledSubarray<T>(originalArray: T[], constraints?: ShuffledSubarrayConstraints): Arbitrary<T[]>; //#endregion
//#region src/arbitrary/tuple.d.ts
/**
* For tuples produced using the provided `arbs`
*
* @param arbs - Ordered list of arbitraries
*
* @remarks Since 0.0.1
* @public
*/
declare function tuple<Ts extends unknown[]>(...arbs: { [K in keyof Ts]: Arbitrary<Ts[K]> }): Arbitrary<Ts>; //#endregion
//#region src/arbitrary/ulid.d.ts
/**
* For ulid
*
* According to {@link https://github.com/ulid/spec | ulid spec}
*
* No mixed case, only upper case digits (0-9A-Z except for: I,L,O,U)
*
* @remarks Since 3.11.0
* @public
*/
declare function ulid(): Arbitrary<string>; //#endregion
//#region src/arbitrary/uuid.d.ts
/**
* Constraints to be applied on {@link uuid}
* @remarks Since 3.21.0
* @public
*/
interface UuidConstraints {
  /**
  * Define accepted versions in the [1-15] according to {@link https://datatracker.ietf.org/doc/html/rfc9562#name-version-field | RFC 9562}
  * @defaultValue [1,2,3,4,5,6,7,8]
  * @remarks Since 3.21.0
  */
  version?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15) | (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15)[];
}
/**
* For UUID from v1 to v5
*
* According to {@link https://tools.ietf.org/html/rfc4122 | RFC 4122}
*
* No mixed case, only lower case digits (0-9a-f)
*
* @remarks Since 1.17.0
* @public
*/
declare function uuid(constraints?: UuidConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webAuthority.d.ts
/**
* Constraints to be applied on {@link webAuthority}
* @remarks Since 1.14.0
* @public
*/
interface WebAuthorityConstraints {
  /**
  * Enable IPv4 in host
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withIPv4?: boolean;
  /**
  * Enable IPv6 in host
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withIPv6?: boolean;
  /**
  * Enable extended IPv4 format
  * @defaultValue false
  * @remarks Since 1.17.0
  */
  withIPv4Extended?: boolean;
  /**
  * Enable user information prefix
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withUserInfo?: boolean;
  /**
  * Enable port suffix
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withPort?: boolean;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For web authority
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986} - `authority = [ userinfo "@" ] host [ ":" port ]`
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 1.14.0
* @public
*/
declare function webAuthority(constraints?: WebAuthorityConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webFragments.d.ts
/**
* Constraints to be applied on {@link webFragments}
* @remarks Since 2.22.0
* @public
*/
interface WebFragmentsConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For fragments of an URI (web included)
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986}
*
* eg.: In the url `https://domain/plop?page=1#hello=1&world=2`, `?hello=1&world=2` are query parameters
*
* @param constraints - Constraints to apply when building instances (since 2.22.0)
*
* @remarks Since 1.14.0
* @public
*/
declare function webFragments(constraints?: WebFragmentsConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webPath.d.ts
/**
* Constraints to be applied on {@link webPath}
* @remarks Since 3.3.0
* @public
*/
interface WebPathConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 3.3.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For web path
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986} and
* {@link https://url.spec.whatwg.org/ | WHATWG URL Standard}
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 3.3.0
* @public
*/
declare function webPath(constraints?: WebPathConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webQueryParameters.d.ts
/**
* Constraints to be applied on {@link webQueryParameters}
* @remarks Since 2.22.0
* @public
*/
interface WebQueryParametersConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For query parameters of an URI (web included)
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986}
*
* eg.: In the url `https://domain/plop/?hello=1&world=2`, `?hello=1&world=2` are query parameters
*
* @param constraints - Constraints to apply when building instances (since 2.22.0)
*
* @remarks Since 1.14.0
* @public
*/
declare function webQueryParameters(constraints?: WebQueryParametersConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webSegment.d.ts
/**
* Constraints to be applied on {@link webSegment}
* @remarks Since 2.22.0
* @public
*/
interface WebSegmentConstraints {
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For internal segment of an URI (web included)
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986}
*
* eg.: In the url `https://github.com/dubzzz/fast-check/`, `dubzzz` and `fast-check` are segments
*
* @param constraints - Constraints to apply when building instances (since 2.22.0)
*
* @remarks Since 1.14.0
* @public
*/
declare function webSegment(constraints?: WebSegmentConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/webUrl.d.ts
/**
* Constraints to be applied on {@link webUrl}
* @remarks Since 1.14.0
* @public
*/
interface WebUrlConstraints {
  /**
  * Enforce specific schemes, eg.: http, https
  * @defaultValue ['http', 'https']
  * @remarks Since 1.14.0
  */
  validSchemes?: string[];
  /**
  * Settings for {@link webAuthority}
  * @defaultValue &#123;&#125;
  * @remarks Since 1.14.0
  */
  authoritySettings?: WebAuthorityConstraints;
  /**
  * Enable query parameters in the generated url
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withQueryParameters?: boolean;
  /**
  * Enable fragments in the generated url
  * @defaultValue false
  * @remarks Since 1.14.0
  */
  withFragments?: boolean;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: Exclude<SizeForArbitrary, "max">;
}
/**
* For web url
*
* According to {@link https://www.ietf.org/rfc/rfc3986.txt | RFC 3986} and
* {@link https://url.spec.whatwg.org/ | WHATWG URL Standard}
*
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 1.14.0
* @public
*/
declare function webUrl(constraints?: WebUrlConstraints): Arbitrary<string>; //#endregion
//#region src/check/model/command/ICommand.d.ts
/**
* Interface that should be implemented in order to define a command
* @remarks Since 1.5.0
* @public
*/
interface ICommand<Model extends object, Real, RunResult, CheckAsync extends boolean = false> {
  /**
  * Check if the model is in the right state to apply the command
  *
  * WARNING: does not change the model
  *
  * @param m - Model, simplified or schematic representation of real system
  *
  * @remarks Since 1.5.0
  */
  check(m: Readonly<Model>): CheckAsync extends false ? boolean : Promise<boolean>;
  /**
  * Receive the non-updated model and the real or system under test.
  * Perform the checks post-execution - Throw in case of invalid state.
  * Update the model accordingly
  *
  * @param m - Model, simplified or schematic representation of real system
  * @param r - Sytem under test
  *
  * @remarks Since 1.5.0
  */
  run(m: Model, r: Real): RunResult;
  /**
  * Name of the command
  * @remarks Since 1.5.0
  */
  toString(): string;
} //#endregion
//#region src/check/model/command/AsyncCommand.d.ts
/**
* Interface that should be implemented in order to define
* an asynchronous command
*
* @remarks Since 1.5.0
* @public
*/
interface AsyncCommand<Model extends object, Real, CheckAsync extends boolean = false> extends ICommand<Model, Real, Promise<void>, CheckAsync> {} //#endregion
//#region src/check/model/command/Command.d.ts
/**
* Interface that should be implemented in order to define
* a synchronous command
*
* @remarks Since 1.5.0
* @public
*/
interface Command<Model extends object, Real> extends ICommand<Model, Real, void> {} //#endregion
//#region src/check/model/commands/CommandsContraints.d.ts
/**
* Parameters for {@link commands}
* @remarks Since 2.2.0
* @public
*/
interface CommandsContraints {
  /**
  * Maximal number of commands to generate per run
  *
  * You probably want to use `size` instead.
  *
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 1.11.0
  */
  maxCommands?: number;
  /**
  * Define how large the generated values (number of commands) should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
  /**
  * Do not show replayPath in the output
  * @defaultValue false
  * @remarks Since 1.11.0
  */
  disableReplayLog?: boolean;
  /**
  * Hint for replay purposes only
  *
  * Should be used in conjonction with `{ seed, path }` of {@link assert}
  *
  * @remarks Since 1.11.0
  */
  replayPath?: string;
} //#endregion
//#region src/arbitrary/commands.d.ts
/**
* For arrays of {@link AsyncCommand} to be executed by {@link asyncModelRun}
*
* This implementation comes with a shrinker adapted for commands.
* It should shrink more efficiently than {@link array} for {@link AsyncCommand} arrays.
*
* @param commandArbs - Arbitraries responsible to build commands
* @param constraints - Constraints to be applied when generating the commands (since 1.11.0)
*
* @remarks Since 1.5.0
* @public
*/
declare function commands<Model extends object, Real, CheckAsync extends boolean>(commandArbs: Arbitrary<AsyncCommand<Model, Real, CheckAsync>>[], constraints?: CommandsContraints): Arbitrary<Iterable<AsyncCommand<Model, Real, CheckAsync>>>;
/**
* For arrays of {@link Command} to be executed by {@link modelRun}
*
* This implementation comes with a shrinker adapted for commands.
* It should shrink more efficiently than {@link array} for {@link Command} arrays.
*
* @param commandArbs - Arbitraries responsible to build commands
* @param constraints - Constraints to be applied when generating the commands (since 1.11.0)
*
* @remarks Since 1.5.0
* @public
*/
declare function commands<Model extends object, Real>(commandArbs: Arbitrary<Command<Model, Real>>[], constraints?: CommandsContraints): Arbitrary<Iterable<Command<Model, Real>>>; //#endregion
//#region src/arbitrary/_internals/interfaces/Scheduler.d.ts
/**
* Function responsible to run the passed function and surround it with whatever needed.
* The name has been inspired from the `act` function coming with React.
*
* This wrapper function is not supposed to throw. The received function f will never throw.
*
* Wrapping order in the following:
*
* - global act defined on `fc.scheduler` wraps wait level one
* - wait act defined on `s.waitX` wraps local one
* - local act defined on `s.scheduleX(...)` wraps the trigger function
*
* @remarks Since 3.9.0
* @public
*/
type SchedulerAct = (f: () => Promise<void>) => Promise<void>;
/**
* Instance able to reschedule the ordering of promises for a given app
* @remarks Since 1.20.0
* @public
*/
interface Scheduler<TMetaData = unknown> {
  /**
  * Wrap a new task using the Scheduler
  * @remarks Since 1.20.0
  */
  schedule: <T>(task: Promise<T>, label?: string, metadata?: TMetaData, customAct?: SchedulerAct) => Promise<T>;
  /**
  * Automatically wrap function output using the Scheduler
  * @remarks Since 1.20.0
  */
  scheduleFunction: <TArgs extends any[], T>(asyncFunction: (...args: TArgs) => Promise<T>, customAct?: SchedulerAct) => (...args: TArgs) => Promise<T>;
  /**
  * Schedule a sequence of Promise to be executed sequencially.
  * Items within the sequence might be interleaved by other scheduled operations.
  *
  * Please note that whenever an item from the sequence has started,
  * the scheduler will wait until its end before moving to another scheduled task.
  *
  * A handle is returned by the function in order to monitor the state of the sequence.
  * Sequence will be marked:
  * - done if all the promises have been executed properly
  * - faulty if one of the promises within the sequence throws
  *
  * @remarks Since 1.20.0
  */
  scheduleSequence(sequenceBuilders: SchedulerSequenceItem<TMetaData>[], customAct?: SchedulerAct): {
    done: boolean;
    faulty: boolean;
    task: Promise<{
      done: boolean;
      faulty: boolean;
    }>;
  };
  /**
  * Count of pending scheduled tasks
  * @remarks Since 1.20.0
  */
  count(): number;
  /**
  * Wait one scheduled task to be executed
  * @throws Whenever there is no task scheduled
  * @remarks Since 1.20.0
  * @deprecated Use `waitNext(1)` instead, it comes with a more predictable behavior
  */
  waitOne: (customAct?: SchedulerAct) => Promise<void>;
  /**
  * Wait all scheduled tasks,
  * including the ones that might be created by one of the resolved task
  * @remarks Since 1.20.0
  * @deprecated Use `waitIdle()` instead, it comes with a more predictable behavior awaiting all scheduled and reachable tasks to be completed
  */
  waitAll: (customAct?: SchedulerAct) => Promise<void>;
  /**
  * Wait and schedule exactly `count` scheduled tasks.
  * @remarks Since 4.2.0
  */
  waitNext: (count: number, customAct?: SchedulerAct) => Promise<void>;
  /**
  * Wait until the scheduler becomes idle: all scheduled and reachable tasks have completed.
  *
  * It will include tasks scheduled by other tasks, recursively.
  *
  * Note: Tasks triggered by uncontrolled sources (like `fetch` or external events) cannot be detected
  * or awaited and may lead to incomplete waits.
  *
  * If you want to wait for a precise event to happen you should rather opt for `waitFor` or `waitNext`
  * given they offer you a more granular control on what you are exactly waiting for.
  *
  * @remarks Since 4.2.0
  */
  waitIdle: (customAct?: SchedulerAct) => Promise<void>;
  /**
  * Wait as many scheduled tasks as need to resolve the received Promise
  *
  * Some tests frameworks like `supertest` are not triggering calls to subsequent queries in a synchronous way,
  * some are waiting an explicit call to `then` to trigger them (either synchronously or asynchronously)...
  * As a consequence, none of `waitOne` or `waitAll` cannot wait for them out-of-the-box.
  *
  * This helper is responsible to wait as many scheduled tasks as needed (but the bare minimal) to get
  * `unscheduledTask` resolved. Once resolved it returns its output either success or failure.
  *
  * Be aware that while this helper will wait eveything to be ready for `unscheduledTask` to resolve,
  * having uncontrolled tasks triggering stuff required for `unscheduledTask` might be a source a uncontrollable
  * and not reproducible randomness as those triggers cannot be handled and scheduled by fast-check.
  *
  * @remarks Since 2.24.0
  */
  waitFor: <T>(unscheduledTask: Promise<T>, customAct?: SchedulerAct) => Promise<T>;
  /**
  * Produce an array containing all the scheduled tasks so far with their execution status.
  * If the task has been executed, it includes a string representation of the associated output or error produced by the task if any.
  *
  * Tasks will be returned in the order they get executed by the scheduler.
  *
  * @remarks Since 1.25.0
  */
  report: () => SchedulerReportItem<TMetaData>[];
}
/**
* Define an item to be passed to `scheduleSequence`
* @remarks Since 1.20.0
* @public
*/
type SchedulerSequenceItem<TMetaData = unknown> = {
  /**
  * Builder to start the task
  * @remarks Since 1.20.0
  */
  builder: () => Promise<any>;
  /**
  * Label
  * @remarks Since 1.20.0
  */
  label: string;
  /**
  * Metadata to be attached into logs
  * @remarks Since 1.25.0
  */
  metadata?: TMetaData;
} | (() => Promise<any>);
/**
* Describe a task for the report produced by the scheduler
* @remarks Since 1.25.0
* @public
*/
interface SchedulerReportItem<TMetaData = unknown> {
  /**
  * Execution status for this task
  * - resolved: task released by the scheduler and successful
  * - rejected: task released by the scheduler but with errors
  * - pending:  task still pending in the scheduler, not released yet
  *
  * @remarks Since 1.25.0
  */
  status: "resolved" | "rejected" | "pending";
  /**
  * How was this task scheduled?
  * - promise: schedule
  * - function: scheduleFunction
  * - sequence: scheduleSequence
  *
  * @remarks Since 1.25.0
  */
  schedulingType: "promise" | "function" | "sequence";
  /**
  * Incremental id for the task, first received task has taskId = 1
  * @remarks Since 1.25.0
  */
  taskId: number;
  /**
  * Label of the task
  * @remarks Since 1.25.0
  */
  label: string;
  /**
  * Metadata linked when scheduling the task
  * @remarks Since 1.25.0
  */
  metadata?: TMetaData;
  /**
  * Stringified version of the output or error computed using fc.stringify
  * @remarks Since 1.25.0
  */
  outputValue?: string;
} //#endregion
//#region src/arbitrary/scheduler.d.ts
/**
* Constraints to be applied on {@link scheduler}
* @remarks Since 2.2.0
* @public
*/
interface SchedulerConstraints {
  /**
  * Ensure that all scheduled tasks will be executed in the right context (for instance it can be the `act` of React)
  * @remarks Since 1.21.0
  */
  act: (f: () => Promise<void>) => Promise<unknown>;
}
/**
* For scheduler of promises
* @remarks Since 1.20.0
* @public
*/
declare function scheduler<TMetaData = unknown>(constraints?: SchedulerConstraints): Arbitrary<Scheduler<TMetaData>>;
/**
* For custom scheduler with predefined resolution order
*
* Ordering is defined by using a template string like the one generated in case of failure of a {@link scheduler}
*
* It may be something like:
*
* @example
* ```typescript
* fc.schedulerFor()`
*   -> [task\${2}] promise pending
*   -> [task\${3}] promise pending
*   -> [task\${1}] promise pending
* `
* ```
*
* Or more generally:
* ```typescript
* fc.schedulerFor()`
*   This scheduler will resolve task ${2} first
*   followed by ${3} and only then task ${1}
* `
* ```
*
* WARNING:
* Custom scheduler will
* neither check that all the referred promises have been scheduled
* nor that they resolved with the same status and value.
*
*
* WARNING:
* If one the promises is wrongly defined it will fail - for instance asking to resolve 5 while 5 does not exist.
*
* @remarks Since 1.25.0
* @public
*/
declare function schedulerFor<TMetaData = unknown>(constraints?: SchedulerConstraints): (_strs: TemplateStringsArray, ...ordering: number[]) => Scheduler<TMetaData>;
/**
* For custom scheduler with predefined resolution order
*
* WARNING:
* Custom scheduler will not check that all the referred promises have been scheduled.
*
*
* WARNING:
* If one the promises is wrongly defined it will fail - for instance asking to resolve 5 while 5 does not exist.
*
* @param customOrdering - Array defining in which order the promises will be resolved.
* Id of the promises start at 1. 1 means first scheduled promise, 2 second scheduled promise and so on.
*
* @remarks Since 1.25.0
* @public
*/
declare function schedulerFor<TMetaData = unknown>(customOrdering: number[], constraints?: SchedulerConstraints): Scheduler<TMetaData>; //#endregion
//#region src/check/model/ModelRunner.d.ts
/**
* Synchronous definition of model and real
* @remarks Since 2.2.0
* @public
*/
type ModelRunSetup<Model, Real> = () => {
  model: Model;
  real: Real;
};
/**
* Asynchronous definition of model and real
* @remarks Since 2.2.0
* @public
*/
type ModelRunAsyncSetup<Model, Real> = () => Promise<{
  model: Model;
  real: Real;
}>;
/**
* Run synchronous commands over a `Model` and the `Real` system
*
* Throw in case of inconsistency
*
* @param s - Initial state provider
* @param cmds - Synchronous commands to be executed
*
* @remarks Since 1.5.0
* @public
*/
declare function modelRun<Model extends object, Real, InitialModel extends Model>(s: ModelRunSetup<InitialModel, Real>, cmds: Iterable<Command<Model, Real>>): void;
/**
* Run asynchronous commands over a `Model` and the `Real` system
*
* Throw in case of inconsistency
*
* @param s - Initial state provider
* @param cmds - Asynchronous commands to be executed
*
* @remarks Since 1.5.0
* @public
*/
declare function asyncModelRun<Model extends object, Real, CheckAsync extends boolean, InitialModel extends Model>(s: ModelRunSetup<InitialModel, Real> | ModelRunAsyncSetup<InitialModel, Real>, cmds: Iterable<AsyncCommand<Model, Real, CheckAsync>>): Promise<void>;
/**
* Run asynchronous and scheduled commands over a `Model` and the `Real` system
*
* Throw in case of inconsistency
*
* @param scheduler - Scheduler
* @param s - Initial state provider
* @param cmds - Asynchronous commands to be executed
*
* @remarks Since 1.24.0
* @public
*/
declare function scheduledModelRun<Model extends object, Real, CheckAsync extends boolean, InitialModel extends Model>(scheduler: Scheduler, s: ModelRunSetup<InitialModel, Real> | ModelRunAsyncSetup<InitialModel, Real>, cmds: Iterable<AsyncCommand<Model, Real, CheckAsync>>): Promise<void>; //#endregion
//#region src/check/symbols.d.ts
/**
* Generated instances having a method [cloneMethod]
* will be automatically cloned whenever necessary
*
* This is pretty useful for statefull generated values.
* For instance, whenever you use a Stream you directly impact it.
* Implementing [cloneMethod] on the generated Stream would force
* the framework to clone it whenever it has to re-use it
* (mainly required for chrinking process)
*
* @remarks Since 1.8.0
* @public
*/
declare const cloneMethod: unique symbol;
/**
* Object instance that should be cloned from one generation/shrink to another
* @remarks Since 2.15.0
* @public
*/
interface WithCloneMethod<T> {
  [cloneMethod]: () => T;
}
/**
* Check if an instance has to be clone
* @remarks Since 2.15.0
* @public
*/
declare function hasCloneMethod<T>(instance: T | WithCloneMethod<T>): instance is WithCloneMethod<T>;
/**
* Clone an instance if needed
* @remarks Since 2.15.0
* @public
*/
declare function cloneIfNeeded<T>(instance: T): T; //#endregion
//#region src/utils/hash.d.ts
/**
* CRC-32 based hash function
*
* Used internally by fast-check in {@link func}, {@link compareFunc} or even {@link compareBooleanFunc}.
*
* @param repr - String value to be hashed
*
* @remarks Since 2.1.0
* @public
*/
declare function hash(repr: string): number; //#endregion
//#region src/utils/stringify.d.ts
/**
* Use this symbol to define a custom serializer for your instances.
* Serializer must be a function returning a string (see {@link WithToStringMethod}).
*
* @remarks Since 2.17.0
* @public
*/
declare const toStringMethod: unique symbol;
/**
* Interface to implement for {@link toStringMethod}
*
* @remarks Since 2.17.0
* @public
*/
type WithToStringMethod = {
  [toStringMethod]: () => string;
};
/**
* Check if an instance implements {@link WithToStringMethod}
*
* @remarks Since 2.17.0
* @public
*/
declare function hasToStringMethod<T>(instance: T): instance is T & WithToStringMethod;
/**
* Use this symbol to define a custom serializer for your instances.
* Serializer must be a function returning a promise of string (see {@link WithAsyncToStringMethod}).
*
* Please note that:
* 1. It will only be useful for asynchronous properties.
* 2. It has to return barely instantly.
*
* @remarks Since 2.17.0
* @public
*/
declare const asyncToStringMethod: unique symbol;
/**
* Interface to implement for {@link asyncToStringMethod}
*
* @remarks Since 2.17.0
* @public
*/
type WithAsyncToStringMethod = {
  [asyncToStringMethod]: () => Promise<string>;
};
/**
* Check if an instance implements {@link WithAsyncToStringMethod}
*
* @remarks Since 2.17.0
* @public
*/
declare function hasAsyncToStringMethod<T>(instance: T): instance is T & WithAsyncToStringMethod;
/**
* Convert any value to its fast-check string representation
*
* @param value - Value to be converted into a string
*
* @remarks Since 1.15.0
* @public
*/
declare function stringify<Ts>(value: Ts): string;
/**
* Convert any value to its fast-check string representation
*
* This asynchronous version is also able to dig into the status of Promise
*
* @param value - Value to be converted into a string
*
* @remarks Since 2.17.0
* @public
*/
declare function asyncStringify<Ts>(value: Ts): Promise<string>; //#endregion
//#region src/check/runner/utils/RunDetailsFormatter.d.ts
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 1.25.0
* @public
*/
declare function defaultReportMessage<Ts>(out: RunDetails<Ts> & {
  failed: false;
}): undefined;
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 1.25.0
* @public
*/
declare function defaultReportMessage<Ts>(out: RunDetails<Ts> & {
  failed: true;
}): string;
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 1.25.0
* @public
*/
declare function defaultReportMessage<Ts>(out: RunDetails<Ts>): string | undefined;
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 2.17.0
* @public
*/
declare function asyncDefaultReportMessage<Ts>(out: RunDetails<Ts> & {
  failed: false;
}): Promise<undefined>;
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 2.17.0
* @public
*/
declare function asyncDefaultReportMessage<Ts>(out: RunDetails<Ts> & {
  failed: true;
}): Promise<string>;
/**
* Format output of {@link check} using the default error reporting of {@link assert}
*
* Produce a string containing the formated error in case of failed run,
* undefined otherwise.
*
* @remarks Since 2.17.0
* @public
*/
declare function asyncDefaultReportMessage<Ts>(out: RunDetails<Ts>): Promise<string | undefined>; //#endregion
//#region src/arbitrary/_internals/builders/TypedIntArrayArbitraryBuilder.d.ts
/**
* Constraints to be applied on typed arrays for integer values
* @remarks Since 2.9.0
* @public
*/
type IntArrayConstraints = {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 2.9.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.9.0
  */
  maxLength?: number;
  /**
  * Lower bound for the generated int (included)
  * @defaultValue smallest possible value for this type
  * @remarks Since 2.9.0
  */
  min?: number;
  /**
  * Upper bound for the generated int (included)
  * @defaultValue highest possible value for this type
  * @remarks Since 2.9.0
  */
  max?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
};
/**
* Constraints to be applied on typed arrays for big int values
* @remarks Since 3.0.0
* @public
*/
type BigIntArrayConstraints = {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 3.0.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 3.0.0
  */
  maxLength?: number;
  /**
  * Lower bound for the generated int (included)
  * @defaultValue smallest possible value for this type
  * @remarks Since 3.0.0
  */
  min?: bigint;
  /**
  * Upper bound for the generated int (included)
  * @defaultValue highest possible value for this type
  * @remarks Since 3.0.0
  */
  max?: bigint;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 3.0.0
  */
  size?: SizeForArbitrary;
}; //#endregion
//#region src/arbitrary/int8Array.d.ts
/**
* For Int8Array
* @remarks Since 2.9.0
* @public
*/
declare function int8Array(constraints?: IntArrayConstraints): Arbitrary<Int8Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/int16Array.d.ts
/**
* For Int16Array
* @remarks Since 2.9.0
* @public
*/
declare function int16Array(constraints?: IntArrayConstraints): Arbitrary<Int16Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/int32Array.d.ts
/**
* For Int32Array
* @remarks Since 2.9.0
* @public
*/
declare function int32Array(constraints?: IntArrayConstraints): Arbitrary<Int32Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/uint8Array.d.ts
/**
* For Uint8Array
* @remarks Since 2.9.0
* @public
*/
declare function uint8Array(constraints?: IntArrayConstraints): Arbitrary<Uint8Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/uint8ClampedArray.d.ts
/**
* For Uint8ClampedArray
* @remarks Since 2.9.0
* @public
*/
declare function uint8ClampedArray(constraints?: IntArrayConstraints): Arbitrary<Uint8ClampedArray<ArrayBuffer>>; //#endregion
//#region src/arbitrary/uint16Array.d.ts
/**
* For Uint16Array
* @remarks Since 2.9.0
* @public
*/
declare function uint16Array(constraints?: IntArrayConstraints): Arbitrary<Uint16Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/uint32Array.d.ts
/**
* For Uint32Array
* @remarks Since 2.9.0
* @public
*/
declare function uint32Array(constraints?: IntArrayConstraints): Arbitrary<Uint32Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/float32Array.d.ts
/**
* Constraints to be applied on {@link float32Array}
* @remarks Since 2.9.0
* @public
*/
type Float32ArrayConstraints = {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 2.9.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.9.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
} & FloatConstraints;
/**
* For Float32Array
* @remarks Since 2.9.0
* @public
*/
declare function float32Array(constraints?: Float32ArrayConstraints): Arbitrary<Float32Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/float64Array.d.ts
/**
* Constraints to be applied on {@link float64Array}
* @remarks Since 2.9.0
* @public
*/
type Float64ArrayConstraints = {
  /**
  * Lower bound of the generated array size
  * @defaultValue 0
  * @remarks Since 2.9.0
  */
  minLength?: number;
  /**
  * Upper bound of the generated array size
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.9.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
} & DoubleConstraints;
/**
* For Float64Array
* @remarks Since 2.9.0
* @public
*/
declare function float64Array(constraints?: Float64ArrayConstraints): Arbitrary<Float64Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/sparseArray.d.ts
/**
* Constraints to be applied on {@link sparseArray}
* @remarks Since 2.13.0
* @public
*/
interface SparseArrayConstraints {
  /**
  * Upper bound of the generated array size (maximal size: 4294967295)
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.13.0
  */
  maxLength?: number;
  /**
  * Lower bound of the number of non-hole elements
  * @defaultValue 0
  * @remarks Since 2.13.0
  */
  minNumElements?: number;
  /**
  * Upper bound of the number of non-hole elements
  * @defaultValue 0x7fffffff — _defaulting seen as "max non specified" when `defaultSizeToMaxWhenMaxSpecified=true`_
  * @remarks Since 2.13.0
  */
  maxNumElements?: number;
  /**
  * When enabled, all generated arrays will either be the empty array or end by a non-hole
  * @defaultValue false
  * @remarks Since 2.13.0
  */
  noTrailingHole?: boolean;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 2.22.0
  */
  size?: SizeForArbitrary;
  /**
  * When receiving a depth identifier, the arbitrary will impact the depth
  * attached to it to avoid going too deep if it already generated lots of items.
  *
  * In other words, if the number of generated values within the collection is large
  * then the generated items will tend to be less deep to avoid creating structures a lot
  * larger than expected.
  *
  * For the moment, the depth is not taken into account to compute the number of items to
  * define for a precise generate call of the array. Just applied onto eligible items.
  *
  * @remarks Since 2.25.0
  */
  depthIdentifier?: DepthIdentifier | string;
}
/**
* For sparse arrays of values coming from `arb`
* @param arb - Arbitrary used to generate the values inside the sparse array
* @param constraints - Constraints to apply when building instances
* @remarks Since 2.13.0
* @public
*/
declare function sparseArray<T>(arb: Arbitrary<T>, constraints?: SparseArrayConstraints): Arbitrary<T[]>; //#endregion
//#region src/arbitrary/bigInt64Array.d.ts
/**
* For BigInt64Array
* @remarks Since 3.0.0
* @public
*/
declare function bigInt64Array(constraints?: BigIntArrayConstraints): Arbitrary<BigInt64Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/bigUint64Array.d.ts
/**
* For BigUint64Array
* @remarks Since 3.0.0
* @public
*/
declare function bigUint64Array(constraints?: BigIntArrayConstraints): Arbitrary<BigUint64Array<ArrayBuffer>>; //#endregion
//#region src/arbitrary/stringMatching.d.ts
/**
* Constraints to be applied on the arbitrary {@link stringMatching}
* @remarks Since 3.10.0
* @public
*/
type StringMatchingConstraints = {
  /**
  * Upper bound of the generated string length (included)
  * @defaultValue 0x7fffffff
  * @remarks Since 4.6.0
  */
  maxLength?: number;
  /**
  * Define how large the generated values should be (at max)
  * @remarks Since 3.10.0
  */
  size?: SizeForArbitrary;
};
/**
* For strings matching the provided regex
*
* @param regex - Arbitrary able to generate random strings (possibly multiple characters)
* @param constraints - Constraints to apply when building instances
*
* @remarks Since 3.10.0
* @public
*/
declare function stringMatching(regex: RegExp, constraints?: StringMatchingConstraints): Arbitrary<string>; //#endregion
//#region src/arbitrary/noShrink.d.ts
/**
* Build an arbitrary without shrinking capabilities.
*
* NOTE:
* In most cases, users should avoid disabling shrinking capabilities.
* If the concern is the shrinking process taking too long or being unnecessary in CI environments,
* consider using alternatives like `endOnFailure` or `interruptAfterTimeLimit` instead.
*
* @param arb - The original arbitrary used for generating values. This arbitrary remains unchanged, but its shrinking capabilities will not be included in the new arbitrary.
*
* @remarks Since 3.20.0
* @public
*/
declare function noShrink<T>(arb: Arbitrary<T>): Arbitrary<T>; //#endregion
//#region src/arbitrary/noBias.d.ts
/**
* Build an arbitrary without any bias.
*
* The produced instance wraps the source one and ensures the bias factor will always be passed to undefined meaning bias will be deactivated.
* All the rest stays unchanged.
*
* @param arb - The original arbitrary used for generating values. This arbitrary remains unchanged.
*
* @remarks Since 3.20.0
* @public
*/
declare function noBias<T>(arb: Arbitrary<T>): Arbitrary<T>; //#endregion
//#region src/arbitrary/limitShrink.d.ts
/**
* Create another Arbitrary with a limited (or capped) number of shrink values
*
* @example
* ```typescript
* const dataGenerator: Arbitrary<string> = ...;
* const limitedShrinkableDataGenerator: Arbitrary<string> = fc.limitShrink(dataGenerator, 10);
* // up to 10 shrunk values could be extracted from the resulting arbitrary
* ```
*
* NOTE: Although limiting the shrinking capabilities can speed up your CI when failures occur, we do not recommend this approach.
* Instead, if you want to reduce the shrinking time for automated jobs or local runs, consider using `endOnFailure` or `interruptAfterTimeLimit`.
*
* @param arbitrary - Instance of arbitrary responsible to generate and shrink values
* @param maxShrinks - Maximal number of shrunk values that can be pulled from the resulting arbitrary
*
* @returns Create another arbitrary with limited number of shrink values
* @remarks Since 3.20.0
* @public
*/
declare function limitShrink<T>(arbitrary: Arbitrary<T>, maxShrinks: number): Arbitrary<T>;
/** @public */
/**
* Type of module (commonjs or module)
* @remarks Since 1.22.0
* @public
*/
declare const __type: string;
/**
* Version of fast-check used by your project (eg.: "4.8.0")
* @remarks Since 1.22.0
* @public
*/
declare const __version: string;
/**
* Commit hash of the current code (eg.: "c0da76fbcf6470339ad7bb2f0dfcebee06ede56c")
* @remarks Since 2.7.0
* @public
*/
declare const __commitHash: string; //#endregion
declare namespace FastCheck_d_exports {
  export { Arbitrary, ArrayConstraints$1 as ArrayConstraints, AsyncCommand, AsyncPropertyHookFunction, BigIntArrayConstraints, BigIntConstraints$1 as BigIntConstraints, CloneValue, Command, CommandsContraints, ContextValue, DateConstraints$1 as DateConstraints, DepthContext, DepthIdentifier, DepthSize, DictionaryConstraints, DomainConstraints, DoubleConstraints, EmailAddressConstraints, Arbitraries as EntityGraphArbitraries, EntityGraphContraints, EntityRelations as EntityGraphRelations, EntityGraphValue, ExecutionStatus, ExecutionTree, FalsyContraints, FalsyValue, Float32ArrayConstraints, Float64ArrayConstraints, FloatConstraints, GeneratorValue, GlobalAsyncPropertyHookFunction, GlobalParameters, GlobalPropertyHookFunction, IAsyncProperty, IAsyncPropertyWithHooks, ICommand, IProperty, IPropertyWithHooks, IRawProperty, IntArrayConstraints, IntegerConstraints, JsonSharedConstraints, JsonValue, LetrecLooselyTypedBuilder, LetrecLooselyTypedTie, LetrecTypedBuilder, LetrecTypedTie, LetrecValue, LoremConstraints, MapConstraints, MaybeWeightedArbitrary, Memo, MixedCaseConstraints, ModelRunAsyncSetup, ModelRunSetup, NatConstraints, ObjectConstraints, OneOfConstraints, OneOfValue, OptionConstraints, Parameters$1 as Parameters, PreconditionFailure, PropertyFailure, PropertyHookFunction, Random, RandomGenerator, RandomType, RecordConstraints, RecordValue, RunDetails, RunDetailsCommon, RunDetailsFailureInterrupted, RunDetailsFailureProperty, RunDetailsFailureTooManySkips, RunDetailsSuccess, Scheduler, SchedulerAct, SchedulerConstraints, SchedulerReportItem, SchedulerSequenceItem, SetConstraints, ShuffledSubarrayConstraints, Size, SizeForArbitrary, SparseArrayConstraints, Stream, StringConstraints$1 as StringConstraints, StringMatchingConstraints, StringSharedConstraints, SubarrayConstraints, UniqueArrayConstraints, UniqueArrayConstraintsCustomCompare, UniqueArrayConstraintsCustomCompareSelect, UniqueArrayConstraintsRecommended, UniqueArraySharedConstraints, UuidConstraints, Value, VerbosityLevel, WebAuthorityConstraints, WebFragmentsConstraints, WebPathConstraints, WebQueryParametersConstraints, WebSegmentConstraints, WebUrlConstraints, WeightedArbitrary, WithAsyncToStringMethod, WithCloneMethod, WithToStringMethod, __commitHash, __type, __version, anything, array, assert, asyncDefaultReportMessage, asyncModelRun, asyncProperty, asyncStringify, asyncToStringMethod, base64String, bigInt, bigInt64Array, bigUint64Array, boolean, chainUntil, check, clone, cloneIfNeeded, cloneMethod, commands, compareBooleanFunc, compareFunc, configureGlobal, constant, constantFrom, context, createDepthIdentifier, date, defaultReportMessage, dictionary, domain, double, emailAddress, entityGraph, falsy, float, float32Array, float64Array, func, gen, getDepthContextFor, hasAsyncToStringMethod, hasCloneMethod, hasToStringMethod, hash, infiniteStream, int16Array, int32Array, int8Array, integer, ipV4, ipV4Extended, ipV6, json, jsonValue, letrec, limitShrink, lorem, map, mapToConstant, maxSafeInteger, maxSafeNat, memo, mixedCase, modelRun, nat, noBias, noShrink, object, oneof, option, pre, property, readConfigureGlobal, record, resetConfigureGlobal, sample, scheduledModelRun, scheduler, schedulerFor, set, shuffledSubarray, sparseArray, statistics, stream, string, stringMatching, stringify, subarray, toStringMethod, tuple, uint16Array, uint32Array, uint8Array, uint8ClampedArray, ulid, uniqueArray, uuid, webAuthority, webFragments, webPath, webQueryParameters, webSegment, webUrl };
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Schema.d.ts
declare const TypeId$6 = "~effect/Schema/Schema";
/**
 * Whether a schema field is required or optional within a struct.
 *
 * @see {@link optionalKey} — mark a struct field as optional
 * @see {@link optional} — mark a struct field as optional with `| undefined`
 *
 * @category models
 * @since 4.0.0
 */
type Optionality = "required" | "optional";
/**
 * Whether a schema field is readonly or mutable within a struct.
 *
 * @see {@link mutableKey} — mark a struct field as mutable
 *
 * @category models
 * @since 4.0.0
 */
type Mutability = "readonly" | "mutable";
/**
 * Whether a schema field has a constructor default value.
 *
 * @see {@link withConstructorDefault} — add a default to a schema field
 * @see {@link tag} — creates a literal field with a constructor default
 *
 * @category models
 * @since 4.0.0
 */
type ConstructorDefault = "no-default" | "with-default";
/**
 * Options for `makeEffect`, `make`, and Class constructors.
 *
 * **When to use**
 *
 * - Pass `disableChecks: true` to skip validation when you trust the data.
 * - Pass `parseOptions` to control error reporting behavior.
 *
 * @see {@link Bottom.makeEffect}
 * @see {@link Bottom.make}
 *
 * @category models
 * @since 3.13.4
 */
interface MakeOptions {
  /**
   * The parse options to use for the schema.
   */
  readonly parseOptions?: ParseOptions | undefined;
  /**
   * Whether to disable validation for the schema.
   */
  readonly disableChecks?: boolean | undefined;
}
/**
 * The fully-parameterized base interface for all schemas. Exposes all 14 type
 * parameters controlling type inference, mutability, optionality, services,
 * and transformation behavior.
 *
 * **When to use**
 *
 * - You are writing advanced generic schema utilities or performing schema
 *   introspection.
 * - In user code, prefer {@link Schema}, {@link Codec}, {@link Decoder}, or
 *   {@link Encoder} instead.
 *
 * @see {@link Top} — the existential "any schema" type (erased type params)
 * @see {@link Schema} — tracks only the decoded Type
 * @see {@link Codec} — tracks Type + Encoded
 *
 * @category models
 * @since 4.0.0
 */
interface Bottom<out T, out E, out RD, out RE, out Ast extends AST, out Rebuild extends Top, out TypeMakeIn = T, out Iso = T, in out TypeParameters extends ReadonlyArray<Top> = readonly [], out TypeMake = TypeMakeIn, out TypeMutability extends Mutability = "readonly", out TypeOptionality extends Optionality = "required", out TypeConstructorDefault extends ConstructorDefault = "no-default", out EncodedMutability extends Mutability = "readonly", out EncodedOptionality extends Optionality = "required"> extends Pipeable {
  readonly [TypeId$6]: typeof TypeId$6;
  readonly "ast": Ast;
  readonly "Rebuild": Rebuild;
  readonly "~type.parameters": TypeParameters;
  readonly "Type": T;
  readonly "Encoded": E;
  readonly "DecodingServices": RD;
  readonly "EncodingServices": RE;
  readonly "~type.make.in": TypeMakeIn;
  readonly "~type.make": TypeMake;
  readonly "~type.constructor.default": TypeConstructorDefault;
  readonly "Iso": Iso;
  readonly "~type.mutability": TypeMutability;
  readonly "~type.optionality": TypeOptionality;
  readonly "~encoded.mutability": EncodedMutability;
  readonly "~encoded.optionality": EncodedOptionality;
  annotate(annotations: Annotations.Bottom<this["Type"], this["~type.parameters"]>): this["Rebuild"];
  annotateKey(annotations: Annotations.Key<this["Type"]>): this["Rebuild"];
  check(...checks: readonly [Check<this["Type"]>, ...Array<Check<this["Type"]>>]): this["Rebuild"];
  rebuild(ast: this["ast"]): this["Rebuild"];
  /**
   * Constructs a value from the make input representation.
   */
  make(input: this["~type.make.in"], options?: MakeOptions): this["Type"];
  makeOption(input: this["~type.make.in"], options?: MakeOptions): Option<this["Type"]>;
  makeEffect(input: this["~type.make.in"], options?: MakeOptions): Effect<this["Type"], SchemaError>;
}
/**
 * The existential "any schema" type — all type parameters are erased to `unknown`.
 *
 * **Details**
 *
 * Use `Top` as a constraint when writing generic utilities that must accept *any*
 * schema regardless of its `Type`, `Encoded`, or service requirements. It is the
 * widest possible schema type and therefore gives you the least static information.
 *
 * In user code prefer the narrower interfaces:
 * - {@link Schema}`<T>` — when you only care about the decoded type
 * - {@link Codec}`<T, E, RD, RE>` — when you need the encoded type and service requirements
 * - {@link Decoder}`<T, RD>` — for decode-only APIs
 * - {@link Encoder}`<E, RE>` — for encode-only APIs
 *
 * @category models
 * @since 4.0.0
 */
interface Top extends Bottom<unknown, unknown, unknown, unknown, AST, Top, unknown, unknown, any, // this is because TypeParameters is invariant
unknown, Mutability, Optionality, ConstructorDefault, Mutability, Optionality> {}
/**
 * Namespace of type-level helpers for {@link Schema}.
 *
 * @since 3.10.0
 */
declare namespace Schema$1 {
  /**
   * Extracts the decoded `Type` from a schema.
   *
   * **Example** (Extracting the decoded type)
   *
   * ```ts
   * import { Schema } from "effect"
   *
   * const Person = Schema.Struct({ name: Schema.String, age: Schema.Number })
   * type Person = Schema.Schema.Type<typeof Person>
   * // { readonly name: string; readonly age: number }
   * ```
   *
   * @category utility types
   * @since 3.10.0
   */
  type Type<S> = S extends Top ? S["Type"] : never;
}
/**
 * A typed view of a schema that tracks only the decoded (output) type `T`.
 *
 * **Details**
 *
 * Use `Schema<T>` as a constraint when you want to accept "any schema that
 * decodes to `T`" and do not need to know or constrain the encoded
 * representation, required services, or any other type parameters.
 *
 * This is a structural interface — concrete schema values are produced by the
 * constructors in this module (e.g. {@link Struct}, {@link String}, {@link Number}).
 * When you also need the encoded type or service requirements, use {@link Codec}.
 *
 * **Example** (Function that accepts any schema decoding to `string`)
 *
 * ```ts
 * import { Schema } from "effect"
 *
 * declare function print(schema: Schema.Schema<string>): void
 *
 * print(Schema.String)            // ok
 * print(Schema.NonEmptyString)    // ok
 * ```
 *
 * @see {@link Codec} — also tracks Encoded, DecodingServices, EncodingServices
 * @see {@link Schema.Type} — extract the decoded type at the type level
 *
 * @category models
 * @since 3.10.0
 */
interface Schema$1<out T> extends Top {
  readonly "Type": T;
  readonly "Rebuild": Schema$1<T>;
}
/**
 * Namespace of type-level helpers for {@link Codec}.
 *
 * @since 4.0.0
 */
declare namespace Codec {
  /**
   * Extracts the encoded (`Encoded`) type from a schema.
   *
   * **Example** (Extracting the encoded type)
   *
   * ```ts
   * import { Schema } from "effect"
   *
   * const schema = Schema.NumberFromString
   * type Enc = Schema.Codec.Encoded<typeof schema>
   * // string
   * ```
   *
   * @category utility types
   * @since 3.10.0
   */
  type Encoded<S> = S extends Top ? S["Encoded"] : never;
  /**
   * Extracts the Effect services required during *decoding* from a schema.
   *
   * **Example** (Checking decoding service requirements)
   *
   * ```ts
   * import { Schema } from "effect"
   *
   * const schema = Schema.String
   * type RD = Schema.Codec.DecodingServices<typeof schema>
   * // never
   * ```
   *
   * @category utility types
   * @since 4.0.0
   */
  type DecodingServices<S> = S extends Top ? S["DecodingServices"] : never;
  /**
   * Extracts the Effect services required during *encoding* from a schema.
   *
   * **Example** (Checking encoding service requirements)
   *
   * ```ts
   * import { Schema } from "effect"
   *
   * const schema = Schema.String
   * type RE = Schema.Codec.EncodingServices<typeof schema>
   * // never
   * ```
   *
   * @category utility types
   * @since 4.0.0
   */
  type EncodingServices<S> = S extends Top ? S["EncodingServices"] : never;
}
/**
 * A schema that tracks the decoded type `T`, the encoded type `E`, and the
 * Effect services required during decoding (`RD`) and encoding (`RE`).
 *
 * **Details**
 *
 * Use `Codec<T, E, RD, RE>` when you need to preserve full type information
 * about a schema — both what it decodes to and what it serializes from/to.
 * Most concrete schemas produced by this module implement `Codec`.
 *
 * For APIs that only need one direction, prefer the narrower views:
 * - {@link Decoder}`<T, RD>` — decode-only
 * - {@link Encoder}`<E, RE>` — encode-only
 * - {@link Schema}`<T>` — type-only (no encoded representation)
 *
 * **Example** (Accepting a codec that decodes to `number` from `string`)
 *
 * ```ts
 * import { Schema } from "effect"
 *
 * declare function serialize<T>(codec: Schema.Codec<T, string>): string
 *
 * serialize(Schema.NumberFromString) // ok — decodes number, encoded as string
 * ```
 *
 * @see {@link Codec.Encoded} — extract the encoded type
 * @see {@link Codec.DecodingServices} — extract required decoding services
 * @see {@link Codec.EncodingServices} — extract required encoding services
 * @see {@link revealCodec} — helper to make TypeScript infer the full Codec type
 *
 * @category models
 * @since 4.0.0
 */
interface Codec<out T, out E = T, out RD = never, out RE = never> extends Schema$1<T> {
  readonly "Encoded": E;
  readonly "DecodingServices": RD;
  readonly "EncodingServices": RE;
  readonly "Rebuild": Codec<T, E, RD, RE>;
}
/**
 * Schema for `string` values.
 *
 * @see {@link String} for the schema value.
 * @category models
 * @since 4.0.0
 */
interface String extends Bottom<string, string, never, never, String$1, String> {}
/**
 * Schema for `string` values. Validates that the input is `typeof` `"string"`.
 *
 * @category schemas
 * @since 4.0.0
 */
declare const String: String;
/**
 * Schema for `number` values, including `NaN`, `Infinity`, and `-Infinity`.
 *
 * @see {@link Number} for the schema value.
 * @category models
 * @since 4.0.0
 */
interface Number extends Bottom<number, number, never, never, Number$1, Number> {}
/**
 * Schema for `number` values, including `NaN`, `Infinity`, and `-Infinity`.
 *
 * **Details**
 *
 * Default JSON serializer:
 *
 * - Finite numbers are serialized as numbers.
 * - Non-finite values are serialized as strings (`"NaN"`, `"Infinity"`, `"-Infinity"`).
 *
 * @see {@link Finite} for a schema that excludes non-finite values.
 * @category schemas
 * @since 4.0.0
 */
declare const Number: Number;
/**
 * Schema for `symbol` values.
 *
 * @see {@link Symbol} for the schema value.
 * @category models
 * @since 4.0.0
 */
interface Symbol$1 extends Bottom<symbol, symbol, never, never, Symbol$2, Symbol$1> {}
/**
 * Schema for `symbol` values. Validates that the input is `typeof` `"symbol"`.
 *
 * @see {@link UniqueSymbol} for a schema that matches a specific symbol.
 * @category schemas
 * @since 4.0.0
 */
declare const Symbol$1: Symbol$1;
/**
 * Schema for the `void` type.
 *
 * @see {@link Void} for the schema value.
 * @category models
 * @since 3.10.0
 */
interface Void extends Bottom<void, void, never, never, Void$1, Void> {}
/**
 * Schema for the `void` type. Accepts `undefined` as the encoded value.
 *
 * @category schemas
 * @since 3.10.0
 */
declare const Void: Void;
/**
 * Namespace for `Record` type utilities.
 *
 * **Details**
 *
 * - `Record.Key` — constraint for the key schema (must encode to `PropertyKey`)
 * - `Record.Type<K, V>` — decoded type of the record
 * - `Record.Encoded<K, V>` — encoded type of the record
 *
 * @since 3.10.0
 */
declare namespace Record$1 {
  /**
   * Constraint for schemas that can be used as record keys.
   *
   * **Details**
   *
   * The key schema must decode and encode property keys (`string`, `number`, or
   * `symbol`) so it can describe object property names.
   *
   * @category utility types
   * @since 4.0.0
   */
  interface Key extends Codec<PropertyKey$1, PropertyKey$1, unknown, unknown> {
    readonly "~type.make": PropertyKey$1;
    readonly "Iso": PropertyKey$1;
  }
  /**
   * Computes the decoded object type for a record schema from its key and value
   * schemas.
   *
   * **Details**
   *
   * The key schema supplies the property keys and the value schema supplies each
   * property's decoded `Type`. Optional and mutable value schemas affect the
   * resulting property optionality and writability.
   *
   * @category utility types
   * @since 3.10.0
   */
  type Type<Key extends Record$1.Key, Value extends Top> = Value extends {
    readonly "~type.optionality": "optional";
  } ? Value extends {
    readonly "~type.mutability": "mutable";
  } ? { [P in Key["Type"]]?: Value["Type"] } : { readonly [P in Key["Type"]]?: Value["Type"] } : Value extends {
    readonly "~type.mutability": "mutable";
  } ? { [P in Key["Type"]]: Value["Type"] } : { readonly [P in Key["Type"]]: Value["Type"] };
  /**
   * Computes the iso object type for a record schema from the key schema's `Iso`
   * keys and the value schema's `Iso` values.
   *
   * @category utility types
   * @since 4.0.0
   */
  type Iso<Key extends Record$1.Key, Value extends Top> = Value extends {
    readonly "~type.optionality": "optional";
  } ? Value extends {
    readonly "~type.mutability": "mutable";
  } ? { [P in Key["Iso"]]?: Value["Iso"] } : { readonly [P in Key["Iso"]]?: Value["Iso"] } : Value extends {
    readonly "~type.mutability": "mutable";
  } ? { [P in Key["Iso"]]: Value["Iso"] } : { readonly [P in Key["Iso"]]: Value["Iso"] };
  /**
   * Computes the encoded object type for a record schema from the key and value
   * schemas' encoded types.
   *
   * **Details**
   *
   * Encoded-side optionality and mutability on the value schema determine whether
   * the encoded record properties are optional or writable.
   *
   * @category utility types
   * @since 3.10.0
   */
  type Encoded<Key extends Record$1.Key, Value extends Top> = Value extends {
    readonly "~encoded.optionality": "optional";
  } ? Value extends {
    readonly "~encoded.mutability": "mutable";
  } ? { [P in Key["Encoded"]]?: Value["Encoded"] } : { readonly [P in Key["Encoded"]]?: Value["Encoded"] } : Value extends {
    readonly "~encoded.mutability": "mutable";
  } ? { [P in Key["Encoded"]]: Value["Encoded"] } : { readonly [P in Key["Encoded"]]: Value["Encoded"] };
  /**
   * Union of the decoding service requirements of a record's key schema and value
   * schema.
   *
   * @category utility types
   * @since 4.0.0
   */
  type DecodingServices<Key extends Record$1.Key, Value extends Top> = Key["DecodingServices"] | Value["DecodingServices"];
  /**
   * Union of the encoding service requirements of a record's key schema and value
   * schema.
   *
   * @category utility types
   * @since 4.0.0
   */
  type EncodingServices<Key extends Record$1.Key, Value extends Top> = Key["EncodingServices"] | Value["EncodingServices"];
  /**
   * Computes the input object type accepted when constructing a record value.
   *
   * **Details**
   *
   * Keys use the key schema's `~type.make` type and values use the value schema's
   * `~type.make` type. Value optionality and mutability determine whether
   * properties are optional or writable.
   *
   * @category utility types
   * @since 4.0.0
   */
  type MakeIn<Key extends Record$1.Key, Value extends Top> = Value extends {
    readonly "~encoded.optionality": "optional";
  } ? Value extends {
    readonly "~encoded.mutability": "mutable";
  } ? { [P in Key["~type.make"]]?: Value["~type.make"] } : { readonly [P in Key["~type.make"]]?: Value["~type.make"] } : Value extends {
    readonly "~encoded.mutability": "mutable";
  } ? { [P in Key["~type.make"]]: Value["~type.make"] } : { readonly [P in Key["~type.make"]]: Value["~type.make"] };
}
/**
 * Companion type for a key-value record (map) with a typed key and value schema.
 * Produced by {@link Record}.
 *
 * @category models
 * @since 4.0.0
 */
interface $Record<Key extends Record$1.Key, Value extends Top> extends Bottom<Record$1.Type<Key, Value>, Record$1.Encoded<Key, Value>, Record$1.DecodingServices<Key, Value>, Record$1.EncodingServices<Key, Value>, Objects$1, $Record<Key, Value>, Simplify<Record$1.MakeIn<Key, Value>>, Record$1.Iso<Key, Value>> {
  readonly key: Key;
  readonly value: Value;
}
/**
 * Defines a record (dictionary) schema with typed keys and values.
 *
 * **Example** (String-keyed record of numbers)
 *
 * ```ts
 * import { Schema } from "effect"
 *
 * const schema = Schema.Record(Schema.String, Schema.Number)
 *
 * // { readonly [x: string]: number }
 * type R = typeof schema.Type
 *
 * const result = Schema.decodeUnknownSync(schema)({ a: 1, b: 2 })
 * console.log(result)
 * // { a: 1, b: 2 }
 * ```
 *
 * @category constructors
 * @since 3.10.0
 */
declare function Record$1<Key extends Record$1.Key, Value extends Top>(key: Key, value: Value, options?: {
  readonly keyValueCombiner: {
    readonly decode?: Combiner<readonly [Key["Type"], Value["Type"]]> | undefined;
    readonly encode?: Combiner<readonly [Key["Encoded"], Value["Encoded"]]> | undefined;
  };
}): $Record<Key, Value>;
/**
 * Schema interface produced by `Schema.Array` for readonly arrays.
 *
 * **Details**
 *
 * The decoded type is `ReadonlyArray<S["Type"]>`, the encoded type is
 * `ReadonlyArray<S["Encoded"]>`, and the element schema is available as
 * `schema`.
 *
 * @category models
 * @since 4.0.0
 */
interface $Array<S extends Top> extends Bottom<ReadonlyArray<S["Type"]>, ReadonlyArray<S["Encoded"]>, S["DecodingServices"], S["EncodingServices"], Arrays, $Array<S>, ReadonlyArray<S["~type.make"]>, ReadonlyArray<S["Iso"]>> {
  readonly schema: S;
}
/**
 * Companion type for a union of multiple schemas. Produced by {@link Union}.
 *
 * @category models
 * @since 3.10.0
 */
interface Union<Members extends ReadonlyArray<Top>> extends Bottom<{ [K in keyof Members]: Members[K]["Type"] }[number], { [K in keyof Members]: Members[K]["Encoded"] }[number], { [K in keyof Members]: Members[K]["DecodingServices"] }[number], { [K in keyof Members]: Members[K]["EncodingServices"] }[number], Union$1<{ [K in keyof Members]: Members[K]["ast"] }[number]>, Union<Members>, { [K in keyof Members]: Members[K]["~type.make"] }[number], { [K in keyof Members]: Members[K]["Iso"] }[number]> {
  readonly members: Members;
  /**
   * Returns a new union with the members modified by the provided function.
   *
   * **Details**
   *
   * Options:
   *
   * - `unsafePreserveChecks` - if `true`, keep any `.check(...)` constraints
   *   that were attached to the original union. Defaults to `false`.
   *
   *   **Warning**: This is an unsafe operation. Since `mapFields`
   *   transformations change the schema type, the original refinement functions
   *   may no longer be valid or safe to apply to the transformed schema. Only
   *   use this option if you have verified that your refinements remain correct
   *   after the transformation.
   */
  mapMembers<To extends ReadonlyArray<Top>>(f: (members: Members) => To, options?: {
    readonly unsafePreserveChecks?: boolean | undefined;
  } | undefined): Union<Simplify<Readonly<To>>>;
}
/**
 * Creates a union schema from an array of member schemas. Members are tested in
 * order; the first match is returned.
 *
 * **Details**
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
 * @category constructors
 * @since 3.10.0
 */
declare function Union<const Members extends ReadonlyArray<Top>>(members: Members, options?: {
  mode?: "anyOf" | "oneOf";
}): Union<Members>;
/**
 * Schema type wrapping a lazily-evaluated schema. Produced by {@link suspend}.
 *
 * @category models
 * @since 3.10.0
 */
interface suspend<S extends Top> extends Bottom<S["Type"], S["Encoded"], S["DecodingServices"], S["EncodingServices"], Suspend, suspend<S>, S["~type.make.in"], S["Iso"], S["~type.parameters"], S["~type.make"], S["~type.mutability"], S["~type.optionality"], S["~type.constructor.default"], S["~encoded.mutability"], S["~encoded.optionality"]> {}
/**
 * Creates a suspended schema that defers evaluation until needed. This is
 * essential for creating recursive schemas where a schema references itself,
 * preventing infinite recursion during schema definition.
 *
 * **Example** (Recursive tree schema)
 *
 * ```ts
 * import { Schema } from "effect"
 *
 * interface Tree {
 *   readonly value: number
 *   readonly children: ReadonlyArray<Tree>
 * }
 *
 * const Tree = Schema.Struct({
 *   value: Schema.Number,
 *   children: Schema.Array(Schema.suspend((): Schema.Codec<Tree> => Tree))
 * })
 * ```
 *
 * @category constructors
 * @since 3.10.0
 */
declare function suspend<S extends Top>(f: () => S): suspend<S>;
/**
 * Type-level representation of the `Finite` number schema, which rejects `NaN`,
 * `Infinity`, and `-Infinity`.
 *
 * @category Number
 * @since 3.10.0
 */
interface Finite extends Number {
  readonly "Rebuild": Finite;
}
/**
 * A schema for finite numbers, rejecting `NaN`, `Infinity`, and `-Infinity`.
 *
 * @category Number
 * @since 3.10.0
 */
declare const Finite: Finite;
/**
 * A union schema for property keys accepted by Effect schemas: finite `number`,
 * `symbol`, or `string`.
 *
 * @category PropertyKey
 * @since 4.0.0
 */
declare const PropertyKey$1: Union<readonly [Finite, Symbol$1, String]>;
/**
 * A {@link Tree} of `string | undefined` nodes. Leaf values are either a
 * string representation or `undefined` for opaque/declaration types.
 *
 * @category Canonical Codecs
 * @since 4.0.0
 */
type StringTree$1 = Tree<string | undefined>;
/**
 * Recursive tree type whose leaves are `Node` values and whose branches are
 * readonly arrays or string-keyed records of child trees.
 *
 * @category Tree
 * @since 4.0.0
 */
type Tree<Node> = Node | TreeRecord<Node> | ReadonlyArray<Tree<Node>>;
/**
 * A record node in a {@link Tree}: an object mapping string keys to child
 * `Tree` nodes.
 *
 * @category Tree
 * @since 4.0.0
 */
interface TreeRecord<A> {
  readonly [x: string]: Tree<A>;
}
/**
 * Creates a recursive schema for a {@link Tree} of values described by `node`.
 * The resulting schema accepts a single node value, an array of trees, or an
 * object whose values are trees.
 *
 * @category Tree
 * @since 4.0.0
 */
declare function Tree<S extends Top>(node: S): Union<readonly [S, $Array<suspend<Codec<Tree<S["Type"]>, Tree<S["Encoded"]>, S["DecodingServices"], S["EncodingServices"]>>>, $Record<String, suspend<Codec<Tree<S["Type"]>, Tree<S["Encoded"]>, S["DecodingServices"], S["EncodingServices"]>>>]>;
/**
 * Recursive TypeScript type for any valid immutable JSON value: `null`,
 * `number`, `boolean`, `string`, a readonly array of `Json` values, or a
 * readonly record of `string → Json`. For the corresponding schema, see the
 * {@link Json} const.
 *
 * @category JSON
 * @since 4.0.0
 */
type Json$1 = null | number | boolean | string | JsonArray | JsonObject;
/**
 * A readonly array of {@link Json} values.
 *
 * @category JSON
 * @since 4.0.0
 */
interface JsonArray extends ReadonlyArray<Json$1> {}
/**
 * A readonly record whose values are {@link Json} values.
 *
 * @category JSON
 * @since 4.0.0
 */
interface JsonObject {
  readonly [x: string]: Json$1;
}
/**
 * Schema that accepts and validates any immutable JSON-compatible value.
 *
 * **Example** (Validating a JSON value)
 *
 * ```ts
 * import { Schema } from "effect"
 *
 * const result = Schema.decodeUnknownOption(Schema.Json)({ key: [1, true, null] })
 * console.log(result._tag) // "Some"
 * ```
 *
 * @category JSON
 * @since 4.0.0
 */
declare const Json$1: Codec<Json$1>;
/**
 * The `Annotations` namespace groups all annotation interfaces used to attach
 * metadata to schemas. Annotations control documentation, validation messages,
 * JSON Schema generation, equivalence, arbitrary generation, and more.
 *
 * **Details**
 *
 * Use {@link resolveAnnotations} to read the annotations attached to a schema at
 * runtime.
 *
 * @since 3.10.0
 */
declare namespace Annotations {
  /**
   * This interface is used to define the annotations that can be attached to a
   * schema. You can extend this interface to define your own annotations.
   *
   * **Details**
   *
   * Note that both a missing key or `undefined` is used to indicate that the
   * annotation is not present.
   *
   * This means that can remove any annotation by setting it to `undefined`.
   *
   * **Example** (Defining your own annotations)
   *
   * ```ts
   * import { Schema } from "effect"
   *
   * // Extend the Annotations interface with a custom `version` annotation
   * declare module "effect/Schema" {
   *   namespace Annotations {
   *     interface Annotations {
   *       readonly version?:
   *         | readonly [major: number, minor: number, patch: number]
   *         | undefined
   *     }
   *   }
   * }
   *
   * // The `version` annotation is now recognized by the TypeScript compiler
   * const schema = Schema.String.annotate({ version: [1, 2, 0] })
   *
   * // const version: readonly [major: number, minor: number, patch: number] | undefined
   * const version = Schema.resolveAnnotations(schema)?.["version"]
   *
   * if (version) {
   *   // Access individual parts of the version
   *   console.log(version[1])
   *   // Output: 2
   * }
   * ```
   *
   * @category models
   * @since 3.10.0
   */
  interface Annotations {
    readonly [x: string]: unknown;
  }
  /**
   * Annotations shared by all schema nodes. These map to common JSON Schema /
   * OpenAPI fields: `title`, `description`, `format`, etc.
   *
   * @category models
   * @since 4.0.0
   */
  interface Augment extends Annotations {
    /**
     * Human-readable description of what a value is expected to satisfy.
     *
     * **Details**
     *
     * For filter and refinement failures, the default formatter uses
     * `message` first, then `expected`, and finally falls back to `<filter>`.
     *
     * Use this to name a failed filter in the default message:
     * `Expected <expected>, got <actual>`.
     */
    readonly expected?: string | undefined;
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly documentation?: string | undefined;
    readonly readOnly?: boolean | undefined;
    readonly writeOnly?: boolean | undefined;
    readonly format?: string | undefined;
    readonly contentEncoding?: string | undefined;
    readonly contentMediaType?: string | undefined;
  }
  /**
   * Extends {@link Augment} with type-parametric `default` and `examples` fields.
   *
   * @category models
   * @since 4.0.0
   */
  interface Documentation<T> extends Augment {
    readonly default?: T | undefined;
    readonly examples?: ReadonlyArray<T> | undefined;
  }
  /**
   * Annotations for struct property schemas. Extends {@link Documentation}
   * with an optional `messageMissingKey` to override the error message when
   * the property key is absent during decoding.
   *
   * @category models
   * @since 4.0.0
   */
  interface Key<T> extends Documentation<T> {
    /**
     * The message to use when a key is missing.
     */
    readonly messageMissingKey?: string | undefined;
  }
  /**
   * Base annotations shared by all composite schema nodes. Extends
   * {@link Documentation} with error messages, branding, parse options, and
   * arbitrary generation hooks. {@link Declaration} and other annotation
   * interfaces build on top of this.
   *
   * @category models
   * @since 4.0.0
   */
  interface Bottom<T, TypeParameters extends ReadonlyArray<Top>> extends Documentation<T> {
    /**
     * Complete message to use when this schema node reports an issue.
     *
     * **Details**
     *
     * This replaces the default message for matching issue types instead of
     * only changing the expected label. For a filter or refinement failure,
     * annotate the filter with `message` to replace the whole filter failure
     * message, or `expected` to keep the default
     * `Expected <expected>, got <actual>` shape.
     */
    readonly message?: string | undefined;
    /**
     * The message to use when a key is unexpected.
     */
    readonly messageUnexpectedKey?: string | undefined;
    /**
     * Stable identifier for this schema node.
     *
     * **Details**
     *
     * Identifiers are used by schema tooling, including JSON Schema
     * generation, to name references. The default formatter also uses
     * `identifier` as the expected label for type-level failures, such as
     * `Expected UserId, got null`.
     *
     * `identifier` does not name a failed filter or refinement. If the base
     * type matches and a filter fails, put `expected` or `message` on the
     * filter/refinement instead.
     */
    readonly identifier?: string | undefined;
    readonly parseOptions?: ParseOptions | undefined;
    /**
     * Optional metadata used to identify or extend the filter with custom data.
     */
    readonly meta?: Meta | undefined;
    /**
     * Accumulated brands when multiple brands are added with `Schema.brand`.
     */
    readonly brands?: ReadonlyArray<string> | undefined;
    readonly toArbitrary?: ToArbitrary.Declaration<T, TypeParameters> | undefined;
  }
  /**
   * Helpers for projecting declaration type-parameter schemas into decoded or
   * encoded codec arrays used by annotation hooks.
   *
   * @since 4.0.0
   */
  namespace TypeParameters {
    /**
     * Maps declaration type-parameter schemas to codecs for their decoded `Type`
     * values.
     *
     * @category utility types
     * @since 3.10.0
     */
    type Type<TypeParameters extends ReadonlyArray<Top>> = { readonly [K in keyof TypeParameters]: Codec<TypeParameters[K]["Type"]> };
    /**
     * Maps declaration type-parameter schemas to codecs for their `Encoded` values.
     *
     * @category utility types
     * @since 3.10.0
     */
    type Encoded<TypeParameters extends ReadonlyArray<Top>> = { readonly [K in keyof TypeParameters]: Codec<TypeParameters[K]["Encoded"]> };
  }
  /**
   * Full annotation set for `Declaration` schema nodes — used when defining
   * custom, opaque schema types via `Schema.declare`. Extends {@link Bottom}
   * with optional codec, arbitrary, equivalence, and formatter hooks so that
   * derived capabilities (JSON encoding, property testing, etc.) can be
   * provided for the custom type.
   *
   * @category models
   * @since 4.0.0
   */
  interface Declaration<T, TypeParameters extends ReadonlyArray<Top> = readonly []> extends Bottom<T, TypeParameters> {
    readonly toCodec?: ((typeParameters: TypeParameters.Encoded<TypeParameters>) => Link) | undefined;
    readonly toCodecJson?: ((typeParameters: TypeParameters.Encoded<TypeParameters>) => Link) | undefined;
    readonly toCodecIso?: ((typeParameters: TypeParameters.Type<TypeParameters>) => Link) | undefined;
    readonly toArbitrary?: ToArbitrary.Declaration<T, TypeParameters> | undefined;
    readonly toEquivalence?: ToEquivalence.Declaration<T, TypeParameters> | undefined;
    readonly toFormatter?: ToFormatter.Declaration<T, TypeParameters> | undefined;
    readonly typeConstructor?: {
      readonly _tag: string;
    } | undefined;
    readonly generation?: {
      readonly runtime: string;
      readonly Type: string;
      readonly Encoded?: string | undefined;
      readonly importDeclaration?: string | undefined;
    } | undefined;
  }
  /**
   * Annotations for filter schema nodes (created via `Schema.filter`). Extends
   * {@link Augment} with an optional error message, identifier, and metadata.
   * Filters are intentionally non-parametric to keep them covariant.
   *
   * @category models
   * @since 3.10.0
   */
  interface Filter extends Augment {
    /**
     * Complete message to use when this filter or refinement fails.
     *
     * **Details**
     *
     * The default formatter checks filter annotations in this order:
     * `message`, then `expected`, then `<filter>`.
     */
    readonly message?: string | undefined;
    /**
     * Stable identifier for the schema after this filter is attached.
     *
     * **Details**
     *
     * This can affect schema tooling such as JSON Schema generation and
     * type-level failures before the filter runs, but it does not name the
     * failed filter itself. For filter failure messages, use `expected` or
     * `message`.
     */
    readonly identifier?: string | undefined;
    /**
     * Optional metadata used to identify or extend the filter with custom data.
     */
    readonly meta?: Meta | undefined;
    readonly toArbitraryConstraint?: ToArbitrary.Constraint | undefined;
    /**
     * Marks the filter as *structural*, meaning it applies to the shape or
     * structure of the container (e.g., array length, object keys) rather than
     * the contents.
     *
     * **Details**
     *
     * Example: `minLength` on an array is a structural filter.
     */
    readonly "~structural"?: boolean | undefined;
  }
  /**
   * Types used by arbitrary-derivation annotations to configure `toArbitrary`
   * hooks and carry merged fast-check constraints.
   *
   * @since 4.0.0
   */
  namespace ToArbitrary {
    /**
     * fast-check string constraints plus optional regular-expression pattern strings
     * used when deriving string arbitraries from schema checks.
     *
     * @category models
     * @since 4.0.0
     */
    interface StringConstraints extends StringSharedConstraints {
      readonly patterns?: readonly [string, ...Array<string>];
    }
    /**
     * fast-check floating-point constraints plus `isInteger`, which switches
     * derived number arbitraries to integer generation.
     *
     * @category models
     * @since 4.0.0
     */
    interface NumberConstraints extends FloatConstraints {
      readonly isInteger?: boolean;
    }
    /**
     * fast-check bigint constraints used when deriving arbitraries for bigint
     * schemas.
     *
     * @category models
     * @since 4.0.0
     */
    interface BigIntConstraints extends BigIntConstraints$1 {}
    /**
     * fast-check array constraints plus an optional comparator used when deriving
     * unique-array arbitraries.
     *
     * @category models
     * @since 4.0.0
     */
    interface ArrayConstraints extends ArrayConstraints$1 {
      readonly comparator?: (a: any, b: any) => boolean;
    }
    /**
     * fast-check date constraints used when deriving arbitraries for `Date` and
     * DateTime schemas.
     *
     * @category models
     * @since 4.0.0
     */
    interface DateConstraints extends DateConstraints$1 {}
    /**
     * Grouped arbitrary-generation constraints accumulated from schema checks and
     * passed to `toArbitrary` derivation.
     *
     * @category models
     * @since 4.0.0
     */
    interface Constraint {
      readonly string?: StringConstraints | undefined;
      readonly number?: NumberConstraints | undefined;
      readonly bigint?: BigIntConstraints | undefined;
      readonly array?: ArrayConstraints | undefined;
      readonly date?: DateConstraints | undefined;
    }
    /**
     * Context passed to arbitrary-derivation hooks, including accumulated
     * constraints and an `isSuspend` flag used to limit recursion for suspended
     * schemas.
     *
     * @category models
     * @since 3.10.0
     */
    interface Context {
      /**
       * This flag is set to `true` when the current schema is a suspend. The goal
       * is to avoid infinite recursion when generating arbitrary values for
       * suspends, so implementations should try to avoid excessive recursion.
       */
      readonly isSuspend?: boolean | undefined;
      readonly constraints?: ToArbitrary.Constraint | undefined;
    }
    /**
     * Hook signature for declaration schema arbitrary annotations.
     *
     * **Details**
     *
     * Given arbitraries for any type parameters, returns a function that receives the
     * fast-check module and derivation context and produces an arbitrary for `T`.
     *
     * @category models
     * @since 4.0.0
     */
    interface Declaration<T, TypeParameters extends ReadonlyArray<Top>> {
      (typeParameters: { readonly [K in keyof TypeParameters]: Arbitrary<TypeParameters[K]["Type"]> }): (fc: typeof FastCheck_d_exports, context: Context) => Arbitrary<T>;
    }
  }
  /**
   * Types used by formatter annotations to customize formatter derivation for
   * declaration schemas.
   *
   * @since 4.0.0
   */
  namespace ToFormatter {
    /**
     * Hook signature for declaration schema formatter annotations.
     *
     * **Details**
     *
     * Given formatters for any type parameters, returns a formatter for `T`.
     *
     * @category models
     * @since 4.0.0
     */
    interface Declaration<T, TypeParameters extends ReadonlyArray<Top>> {
      (typeParameters: { readonly [K in keyof TypeParameters]: Formatter<TypeParameters[K]["Type"]> }): Formatter<T>;
    }
  }
  /**
   * Types used by equivalence annotations to customize equivalence derivation for
   * declaration schemas.
   *
   * @since 4.0.0
   */
  namespace ToEquivalence {
    /**
     * Hook signature for declaration schema equivalence annotations.
     *
     * **Details**
     *
     * Given equivalences for any type parameters, returns an `Equivalence` for `T`.
     *
     * @category models
     * @since 4.0.0
     */
    interface Declaration<T, TypeParameters extends ReadonlyArray<Top>> {
      (typeParameters: { readonly [K in keyof TypeParameters]: Equivalence<TypeParameters[K]["Type"]> }): Equivalence<T>;
    }
  }
  /**
   * Annotations that can be attached to schema issues.
   *
   * **Details**
   *
   * The optional `message` field overrides the default issue message.
   *
   * @category models
   * @since 4.0.0
   */
  interface Issue extends Annotations {
    readonly message?: string | undefined;
  }
  /**
   * Registry of metadata payloads emitted by built-in schema filters and checks.
   *
   * **Details**
   *
   * Do not augment this interface with custom metadata; extend `MetaDefinitions`
   * instead.
   *
   * @category models
   * @since 4.0.0
   */
  interface BuiltInMetaDefinitions {
    readonly isStringFinite: {
      readonly _tag: "isStringFinite";
      readonly regExp: globalThis.RegExp;
    };
    readonly isStringBigInt: {
      readonly _tag: "isStringBigInt";
      readonly regExp: globalThis.RegExp;
    };
    readonly isStringSymbol: {
      readonly _tag: "isStringSymbol";
      readonly regExp: globalThis.RegExp;
    };
    readonly isMinLength: {
      readonly _tag: "isMinLength";
      readonly minLength: number;
    };
    readonly isMaxLength: {
      readonly _tag: "isMaxLength";
      readonly maxLength: number;
    };
    readonly isLengthBetween: {
      readonly _tag: "isLengthBetween";
      readonly minimum: number;
      readonly maximum: number;
    };
    readonly isPattern: {
      readonly _tag: "isPattern";
      readonly regExp: globalThis.RegExp;
    };
    readonly isTrimmed: {
      readonly _tag: "isTrimmed";
      readonly regExp: globalThis.RegExp;
    };
    readonly isUUID: {
      readonly _tag: "isUUID";
      readonly regExp: globalThis.RegExp;
      readonly version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
    };
    readonly isULID: {
      readonly _tag: "isULID";
      readonly regExp: globalThis.RegExp;
    };
    readonly isBase64: {
      readonly _tag: "isBase64";
      readonly regExp: globalThis.RegExp;
    };
    readonly isBase64Url: {
      readonly _tag: "isBase64Url";
      readonly regExp: globalThis.RegExp;
    };
    readonly isStartsWith: {
      readonly _tag: "isStartsWith";
      readonly startsWith: string;
      readonly regExp: globalThis.RegExp;
    };
    readonly isEndsWith: {
      readonly _tag: "isEndsWith";
      readonly endsWith: string;
      readonly regExp: globalThis.RegExp;
    };
    readonly isIncludes: {
      readonly _tag: "isIncludes";
      readonly includes: string;
      readonly regExp: globalThis.RegExp;
    };
    readonly isUppercased: {
      readonly _tag: "isUppercased";
      readonly regExp: globalThis.RegExp;
    };
    readonly isLowercased: {
      readonly _tag: "isLowercased";
      readonly regExp: globalThis.RegExp;
    };
    readonly isCapitalized: {
      readonly _tag: "isCapitalized";
      readonly regExp: globalThis.RegExp;
    };
    readonly isUncapitalized: {
      readonly _tag: "isUncapitalized";
      readonly regExp: globalThis.RegExp;
    };
    readonly isFinite: {
      readonly _tag: "isFinite";
    };
    readonly isInt: {
      readonly _tag: "isInt";
    };
    readonly isMultipleOf: {
      readonly _tag: "isMultipleOf";
      readonly divisor: number;
    };
    readonly isGreaterThan: {
      readonly _tag: "isGreaterThan";
      readonly exclusiveMinimum: number;
    };
    readonly isGreaterThanOrEqualTo: {
      readonly _tag: "isGreaterThanOrEqualTo";
      readonly minimum: number;
    };
    readonly isLessThan: {
      readonly _tag: "isLessThan";
      readonly exclusiveMaximum: number;
    };
    readonly isLessThanOrEqualTo: {
      readonly _tag: "isLessThanOrEqualTo";
      readonly maximum: number;
    };
    readonly isBetween: {
      readonly _tag: "isBetween";
      readonly minimum: number;
      readonly maximum: number;
      readonly exclusiveMinimum?: boolean | undefined;
      readonly exclusiveMaximum?: boolean | undefined;
    };
    readonly isGreaterThanBigInt: {
      readonly _tag: "isGreaterThanBigInt";
      readonly exclusiveMinimum: bigint;
    };
    readonly isGreaterThanOrEqualToBigInt: {
      readonly _tag: "isGreaterThanOrEqualToBigInt";
      readonly minimum: bigint;
    };
    readonly isLessThanBigInt: {
      readonly _tag: "isLessThanBigInt";
      readonly exclusiveMaximum: bigint;
    };
    readonly isLessThanOrEqualToBigInt: {
      readonly _tag: "isLessThanOrEqualToBigInt";
      readonly maximum: bigint;
    };
    readonly isBetweenBigInt: {
      readonly _tag: "isBetweenBigInt";
      readonly minimum: bigint;
      readonly maximum: bigint;
      readonly exclusiveMinimum?: boolean | undefined;
      readonly exclusiveMaximum?: boolean | undefined;
    };
    readonly isDateValid: {
      readonly _tag: "isDateValid";
    };
    readonly isGreaterThanDate: {
      readonly _tag: "isGreaterThanDate";
      readonly exclusiveMinimum: globalThis.Date;
    };
    readonly isGreaterThanOrEqualToDate: {
      readonly _tag: "isGreaterThanOrEqualToDate";
      readonly minimum: globalThis.Date;
    };
    readonly isLessThanDate: {
      readonly _tag: "isLessThanDate";
      readonly exclusiveMaximum: globalThis.Date;
    };
    readonly isLessThanOrEqualToDate: {
      readonly _tag: "isLessThanOrEqualToDate";
      readonly maximum: globalThis.Date;
    };
    readonly isBetweenDate: {
      readonly _tag: "isBetweenDate";
      readonly minimum: globalThis.Date;
      readonly maximum: globalThis.Date;
      readonly exclusiveMinimum?: boolean | undefined;
      readonly exclusiveMaximum?: boolean | undefined;
    };
    readonly isMinProperties: {
      readonly _tag: "isMinProperties";
      readonly minProperties: number;
    };
    readonly isMaxProperties: {
      readonly _tag: "isMaxProperties";
      readonly maxProperties: number;
    };
    readonly isPropertiesLengthBetween: {
      readonly _tag: "isPropertiesLengthBetween";
      readonly minimum: number;
      readonly maximum: number;
    };
    readonly isPropertyNames: {
      readonly _tag: "isPropertyNames";
      readonly propertyNames: AST;
    };
    readonly isUnique: {
      readonly _tag: "isUnique";
    };
    readonly isMinSize: {
      readonly _tag: "isMinSize";
      readonly minSize: number;
    };
    readonly isMaxSize: {
      readonly _tag: "isMaxSize";
      readonly maxSize: number;
    };
    readonly isSizeBetween: {
      readonly _tag: "isSizeBetween";
      readonly minimum: number;
      readonly maximum: number;
    };
  }
  /**
   * Union of all metadata payloads defined by `BuiltInMetaDefinitions`.
   *
   * @category utility types
   * @since 4.0.0
   */
  type BuiltInMeta = BuiltInMetaDefinitions[keyof BuiltInMetaDefinitions];
  /**
   * Augmentable registry of schema filter metadata payloads.
   *
   * **Details**
   *
   * Extend this interface to add custom values accepted by annotation `meta`
   * fields.
   *
   * @category models
   * @since 4.0.0
   */
  interface MetaDefinitions extends BuiltInMetaDefinitions {}
  /**
   * Union of built-in and user-augmented schema filter metadata payloads.
   *
   * @category utility types
   * @since 4.0.0
   */
  type Meta = MetaDefinitions[keyof MetaDefinitions];
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Record.d.ts
/**
 * Represents a readonly record with keys of type `K` and values of type `A`.
 * This is the foundational type for immutable key-value mappings in Effect.
 *
 * **Example** (Defining a readonly record type)
 *
 * ```ts
 * import type { Record } from "effect"
 *
 * // Creating a readonly record type
 * type UserRecord = Record.ReadonlyRecord<"name" | "age", string | number>
 *
 * const user: UserRecord = {
 *   name: "John",
 *   age: 30
 * }
 * ```
 *
 * @category models
 * @since 2.0.0
 */
type ReadonlyRecord<in out K extends string | symbol, out A> = { readonly [P in K]: A };
/**
 * Namespace containing utility types for working with readonly records.
 * These types help with type-level operations on record keys and values.
 *
 * **Example** (Using readonly record helper types)
 *
 * ```ts
 * import type { Record } from "effect"
 *
 * // Using NonLiteralKey to convert literal keys to generic types
 * type GenericKey = Record.ReadonlyRecord.NonLiteralKey<"foo" | "bar"> // string
 *
 * // Using IntersectKeys to find common keys between record types
 * type CommonKeys = Record.ReadonlyRecord.IntersectKeys<"a" | "b", "b" | "c"> // "b"
 * ```
 *
 * @since 2.0.0
 */
declare namespace ReadonlyRecord {
  type IsFiniteString<T extends string> = T extends "" ? true : [T] extends [`${infer Head}${infer Rest}`] ? string extends Head ? false : `${number}` extends Head ? false : Rest extends "" ? true : IsFiniteString<Rest> : false;
  /**
   * Represents a type that converts literal string keys to generic string type and symbol keys to generic symbol type.
   * This is useful for maintaining type safety while allowing flexible key types in record operations.
   *
   * **Example** (Converting literal keys to non-literal keys)
   *
   * ```ts
   * import type { Record } from "effect"
   *
   * // For literal string keys, this becomes 'string'
   * type Example1 = Record.ReadonlyRecord.NonLiteralKey<"foo" | "bar"> // string
   *
   * // For symbol keys, this becomes 'symbol'
   * type Example2 = Record.ReadonlyRecord.NonLiteralKey<symbol> // symbol
   * ```
   *
   * @category models
   * @since 2.0.0
   */
  type NonLiteralKey<K extends string | symbol> = K extends string ? IsFiniteString<K> extends true ? string : K : symbol;
  /**
   * Represents the intersection of two key types, handling both literal and non-literal string keys.
   * This type is used in record operations that need to compute overlapping keys.
   *
   * **Example** (Intersecting record keys)
   *
   * ```ts
   * import type { Record } from "effect"
   *
   * // Intersection of literal keys
   * type Example1 = Record.ReadonlyRecord.IntersectKeys<"a" | "b", "b" | "c"> // "b"
   *
   * // Intersection with generic string
   * type Example2 = Record.ReadonlyRecord.IntersectKeys<string, "a" | "b"> // string
   * ```
   *
   * @category models
   * @since 2.0.0
   */
  type IntersectKeys<K1 extends string, K2 extends string> = [string] extends [K1 | K2] ? NonLiteralKey<K1> & NonLiteralKey<K2> : K1 & K2;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Effect.d.ts
/**
 * Type-level identifier for `Effect` values.
 *
 * @category Type identifiers
 * @since 4.0.0
 */
type TypeId$5 = "~effect/Effect";
/**
 * Runtime identifier used to recognize `Effect` values.
 *
 * @category Type identifiers
 * @since 4.0.0
 */
declare const TypeId$5: TypeId$5;
/**
 * The `Effect` interface defines a value that lazily describes a workflow or
 * job. The workflow requires some context `R`, and may fail with an error of
 * type `E`, or succeed with a value of type `A`.
 *
 * **Details**
 *
 * `Effect` values model resourceful interaction with the outside world,
 * including synchronous, asynchronous, concurrent, and parallel interaction.
 * They use a fiber-based concurrency model, with built-in support for
 * scheduling, fine-grained interruption, structured concurrency, and high
 * scalability.
 *
 * To run an `Effect` value, you need a `Runtime`, which is a type that is
 * capable of executing `Effect` values.
 *
 * @category models
 * @since 2.0.0
 */
interface Effect<out A, out E = never, out R = never> extends Pipeable, Inspectable {
  readonly [TypeId$5]: Variance<A, E, R>;
  [Symbol.iterator](): EffectIterator<Effect<A, E, R>>;
  [typeSymbol]?: unknown;
  [unifySymbol]?: EffectUnify<this>;
  [ignoreSymbol]?: {};
}
/**
 * Type-level unification support for `Effect` values.
 *
 * @category models
 * @since 2.0.0
 */
interface EffectUnify<A extends {
  [typeSymbol]?: any;
}> {
  Effect?: () => A[typeSymbol] extends Effect<infer A0, infer E0, infer R0> | infer _ ? Effect<A0, E0, R0> : never;
}
/**
 * Variance interface for Effect, encoding the type parameters' variance.
 *
 * @category models
 * @since 2.0.0
 */
interface Variance<A, E, R> {
  _A: Covariant<A>;
  _E: Covariant<E>;
  _R: Covariant<R>;
}
/**
 * Extracts the success type from an `Effect`.
 *
 * @category models
 * @since 2.0.0
 */
type Success<T> = T extends Effect<infer _A, infer _E, infer _R> ? _A : never;
/**
 * Iterator interface for Effect generators, enabling Effect values to work with generator functions.
 *
 * @category models
 * @since 4.0.0
 */
interface EffectIterator<T extends Effect<any, any, any>> {
  next(...args: ReadonlyArray<any>): IteratorResult<T, Success<T>>;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Option.d.ts
declare const TypeId$4 = "~effect/data/Option";
/**
 * The `Option` data type represents optional values. An `Option<A>` is either
 * `Some<A>`, containing a value of type `A`, or `None`, representing absence.
 *
 * **When to use**
 *
 * - Representing initial values that may not yet exist
 * - Returning from partial functions (not defined for all inputs)
 * - Managing optional fields in data structures
 *
 * @see {@link some} for creating a `Some`
 * @see {@link none} for creating a `None`
 * @see {@link match} for pattern matching
 *
 * @category models
 * @since 2.0.0
 */
type Option<A> = None<A> | Some<A>;
/**
 * Represents the absence of a value within an {@link Option}.
 *
 * **When to use**
 *
 * - Use as a type guard target when narrowing via {@link isNone}
 *
 * **Details**
 *
 * - `_tag` is always `"None"`
 * - Implements `Pipeable`, `Inspectable`, and structural equality
 *
 * @see {@link isNone} to check if an `Option` is `None`
 * @see {@link none} to construct a `None`
 *
 * @category models
 * @since 2.0.0
 */
interface None<out A> extends Pipeable, Inspectable {
  readonly _tag: "None";
  readonly _op: "None";
  readonly valueOrUndefined: undefined;
  readonly [TypeId$4]: {
    readonly _A: Covariant<A>;
  };
  [Symbol.iterator](): OptionIterator<Option<A>>;
  [typeSymbol]?: unknown;
  [unifySymbol]?: OptionUnify<this>;
  [ignoreSymbol]?: OptionUnifyIgnore;
}
/**
 * Iterator protocol used to yield an `Option` inside {@link gen}, returning the
 * contained value type back to the generator.
 *
 * @category Generators
 * @since 4.0.0
 */
interface OptionIterator<T extends Option<any>> {
  next(...args: ReadonlyArray<any>): IteratorResult<T, Option.Value<T>>;
}
/**
 * Represents the presence of a value within an {@link Option}.
 *
 * **When to use**
 *
 * - Use as a type guard target when narrowing via {@link isSome}
 * - Access the inner value via `.value`
 *
 * **Details**
 *
 * - `_tag` is always `"Some"`
 * - `.value` holds the contained value of type `A`
 * - Implements `Pipeable`, `Inspectable`, and structural equality
 *
 * @see {@link isSome} to check if an `Option` is `Some`
 * @see {@link some} to construct a `Some`
 *
 * @category models
 * @since 2.0.0
 */
interface Some<out A> extends Pipeable, Inspectable {
  readonly _tag: "Some";
  readonly _op: "Some";
  readonly value: A;
  readonly valueOrUndefined: A;
  readonly [TypeId$4]: {
    readonly _A: Covariant<A>;
  };
  [Symbol.iterator](): OptionIterator<Option<A>>;
  [typeSymbol]?: unknown;
  [unifySymbol]?: OptionUnify<this>;
  [ignoreSymbol]?: OptionUnifyIgnore;
}
/**
 * Type-level unification support for `Option` values.
 *
 * **Details**
 *
 * This is used by Effect's `Unify` machinery to preserve the contained value
 * type when generic code returns or combines `Option` values. Users normally
 * do not need to reference this interface directly.
 *
 * @category models
 * @since 2.0.0
 */
interface OptionUnify<A extends {
  [typeSymbol]?: any;
}> {
  Option?: () => A[typeSymbol] extends Option<infer A0> | infer _ ? Option<A0> : never;
}
/**
 * Namespace containing utility types for `Option`.
 *
 * @since 2.0.0
 */
declare namespace Option {
  /**
   * Extracts the type of the value contained in an `Option`.
   *
   * **Example** (Extracting the value type)
   *
   * ```ts
   * import type { Option } from "effect"
   *
   * declare const myOption: Option.Option<string>
   *
   * //      ┌─── string
   * //      ▼
   * type MyType = Option.Option.Value<typeof myOption>
   * ```
   *
   * @category Type-level Utils
   * @since 2.0.0
   */
  type Value<T extends Option<any>> = [T] extends [Option<infer _A>] ? _A : never;
}
/**
 * Marker interface used by Effect's `Unify` machinery for `Option` values.
 *
 * **Details**
 *
 * This supports type-level unification behavior for `Option`. Users normally
 * do not need to reference this interface directly.
 *
 * @category models
 * @since 2.0.0
 */
interface OptionUnifyIgnore {}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/Array.d.ts
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
declare const Array$1: ArrayConstructor;
/**
 * A readonly array guaranteed to have at least one element.
 *
 * **When to use**
 *
 * Use this type when you need to ensure non-emptiness at the type level while
 * preventing mutation. Many Array module functions accept or return this type.
 *
 * **Example** (Typing a non-empty array)
 *
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]
 * const head: number = nonEmpty[0] // guaranteed to exist
 * ```
 *
 * @see {@link NonEmptyArray} — mutable counterpart
 * @see {@link isReadonlyArrayNonEmpty} — narrow a `ReadonlyArray` to this type
 *
 * @category models
 * @since 2.0.0
 */
type NonEmptyReadonlyArray<A> = readonly [A, ...Array$1<A>];
/**
 * A mutable array guaranteed to have at least one element.
 *
 * **Details**
 *
 * This is the mutable counterpart of {@link NonEmptyReadonlyArray}. Most Array
 * module functions return `NonEmptyArray` when the result is guaranteed
 * non-empty.
 *
 * **Example** (Typing a mutable non-empty array)
 *
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyArray<number> = [1, 2, 3]
 * nonEmpty.push(4)
 * ```
 *
 * @see {@link NonEmptyReadonlyArray} — readonly counterpart
 * @see {@link isArrayNonEmpty} — narrow an `Array` to this type
 *
 * @category models
 * @since 2.0.0
 */
type NonEmptyArray<A> = [A, ...Array$1<A>];
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/http/HttpMethod.d.ts
/**
 * Defines the supported HTTP method literals shared by the unstable HTTP client,
 * server, and routing APIs.
 *
 * Use this module when constructing method-specific requests, matching incoming
 * requests, validating unknown method values, or deriving method helper names.
 * Methods are represented as uppercase string literals, so values such as `"get"`
 * are not accepted as `HttpMethod` values.
 *
 * The body classification is intentionally conservative and file-specific:
 * `GET`, `HEAD`, `OPTIONS`, and `TRACE` are modeled as bodyless methods, while
 * `POST`, `PUT`, `DELETE`, and `PATCH` are modeled as methods that can carry a
 * request body. This means `DELETE` is allowed to carry a body even though some
 * servers and intermediaries may ignore it, and `GET` request bodies are not
 * represented by these helpers even though the wire protocol does not strictly
 * forbid them.
 *
 * @since 4.0.0
 */
/**
 * Union of supported uppercase HTTP method literals.
 *
 * @category models
 * @since 4.0.0
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE";
/**
 * Namespace containing subtype helpers associated with `HttpMethod`.
 *
 * @since 4.0.0
 */
declare namespace HttpMethod {
  /**
   * HTTP methods that this module treats as not carrying a request body.
   *
   * @category models
   * @since 4.0.0
   */
  type NoBody = "GET" | "HEAD" | "OPTIONS" | "TRACE";
  /**
   * HTTP methods that this module treats as capable of carrying a request body.
   *
   * @category models
   * @since 4.0.0
   */
  type WithBody = Exclude<HttpMethod, NoBody>;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/ErrorReporter.d.ts
/**
 * Interface that object errors can implement to control reporting behavior.
 *
 * **Details**
 *
 * All three annotation properties are optional: `[ErrorReporter.ignore]`
 * prevents reporting when set to `true`, `[ErrorReporter.severity]` overrides
 * the default `"Info"` severity, and `[ErrorReporter.attributes]` adds extra
 * key/value pairs forwarded to reporters. The global `Error` interface is
 * augmented with `Reportable`, so these properties are available on `Error`
 * instances at the type level.
 *
 * @category annotations
 * @since 4.0.0
 */
interface Reportable {
  readonly [ignore]?: boolean;
  readonly [severity]?: Severity;
  readonly [attributes]?: ReadonlyRecord<string, unknown>;
}
declare global {
  interface Error extends Reportable {}
}
/**
 * String property key used to mark an object error as ignored by error
 * reporting.
 *
 * **Details**
 *
 * Set this property to `true` on an error class or object error to prevent it
 * from being forwarded to reporters. This is useful for expected failures such
 * as HTTP 404 responses.
 *
 * @category annotations
 * @since 4.0.0
 */
type ignore = "~effect/ErrorReporter/ignore";
/**
 * Runtime property key used to mark an object error as ignored by error
 * reporting.
 *
 * **Details**
 *
 * Set `error[ErrorReporter.ignore]` to `true` to prevent the error from being
 * forwarded to reporters. This is useful for expected failures such as HTTP 404
 * responses.
 *
 * **Example** (Marking errors as ignored)
 *
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {
 *   readonly [ErrorReporter.ignore] = true
 * }
 * ```
 *
 * @category annotations
 * @since 4.0.0
 */
declare const ignore: ignore;
/**
 * String property key used to override the severity level of an object error.
 *
 * **Details**
 *
 * When set to a valid `LogLevel.Severity`, the reporter callback receives this
 * value as `severity`. Missing or invalid values fall back to `"Info"`.
 *
 * @category annotations
 * @since 4.0.0
 */
type severity = "~effect/ErrorReporter/severity";
/**
 * Runtime property key used to override the severity level of an object error.
 *
 * **Details**
 *
 * Set `error[ErrorReporter.severity]` to a valid `LogLevel.Severity` value.
 * Missing or invalid values fall back to `"Info"`.
 *
 * **Example** (Setting error severity annotations)
 *
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class DeprecationWarning extends Data.TaggedError("DeprecationWarning")<{}> {
 *   readonly [ErrorReporter.severity] = "Warn" as const
 * }
 * ```
 *
 * @category annotations
 * @since 4.0.0
 */
declare const severity: severity;
/**
 * String property key used to attach extra key/value metadata to an object
 * error report.
 *
 * **Details**
 *
 * Reporters receive these attributes alongside the error, making it easy to
 * include contextual information such as user IDs, request IDs, or other
 * domain-specific debugging data.
 *
 * @category annotations
 * @since 4.0.0
 */
type attributes = "~effect/ErrorReporter/attributes";
/**
 * Runtime property key used to attach extra key/value metadata to an object
 * error report.
 *
 * **Details**
 *
 * Set `error[ErrorReporter.attributes]` to a record of metadata that should be
 * forwarded to reporters alongside the error.
 *
 * **Example** (Setting error attributes)
 *
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class PaymentError extends Data.TaggedError("PaymentError")<{
 *   readonly orderId: string
 * }> {
 *   readonly [ErrorReporter.attributes] = {
 *     orderId: this.orderId
 *   }
 * }
 * ```
 *
 * @category annotations
 * @since 4.0.0
 */
declare const attributes: attributes;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/http/HttpRouter.d.ts
/**
 * Path pattern accepted by the router. Routes must use an absolute path
 * beginning with `/` or the wildcard `*`.
 *
 * @category PathInput
 * @since 4.0.0
 */
type PathInput = `/${string}` | "*";
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/HttpApiSchema.d.ts
declare module "../../Schema.ts" {
  namespace Annotations {
    interface Augment {
      readonly httpApiStatus?: number | undefined;
    }
  }
}
/**
 * Type of the `NoContent` schema, a void schema annotated with HTTP status code 204.
 *
 * @category models
 * @since 4.0.0
 */
interface NoContent extends Void {}
/**
 * A void schema with the HTTP status code 204.
 * This is used to represent empty responses with the status code 204.
 *
 * @category Empty
 * @since 4.0.0
 */
declare const NoContent: NoContent;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/HttpApiMiddleware.d.ts
declare const TypeId$3 = "~effect/httpapi/HttpApiMiddleware";
type ErrorConstraint = Top | ReadonlyArray<Top>;
/**
 * Type-level identifier carried by middleware services to track provided services, required services, errors, client errors, and client requirements.
 *
 * @category models
 * @since 4.0.0
 */
interface AnyId {
  readonly [TypeId$3]: {
    readonly provides: any;
    readonly requires: any;
    readonly error: ErrorConstraint;
    readonly clientError: any;
    readonly requiredForClient: boolean;
  };
}
/**
 * Extracts the services provided by a middleware identifier.
 *
 * @category models
 * @since 4.0.0
 */
type Provides<A> = A extends {
  readonly [TypeId$3]: {
    readonly provides: infer P;
  };
} ? P : never;
/**
 * Extracts the services required to run a middleware implementation.
 *
 * @category models
 * @since 4.0.0
 */
type Requires<A> = A extends {
  readonly [TypeId$3]: {
    readonly requires: infer R;
  };
} ? R : never;
/**
 * Applies a middleware's service changes to an existing requirement type by removing services it provides and adding services it requires.
 *
 * @category models
 * @since 4.0.0
 */
type ApplyServices<A extends AnyId, R> = Exclude<R, Provides<A>> | Requires<A>;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/HttpApiGroup.d.ts
declare const TypeId$2 = "~effect/httpapi/HttpApiGroup";
/**
 * Returns `true` when a value is an `HttpApiGroup`, narrowing the value to the
 * group interface.
 *
 * @category guards
 * @since 4.0.0
 */
/**
 * An `HttpApiGroup` is a named collection of `HttpApiEndpoint`s that represents
 * a portion of your domain.
 *
 * **Details**
 *
 * Endpoint implementations can be provided later with `HttpApiBuilder.group`.
 *
 * @category models
 * @since 4.0.0
 */
interface HttpApiGroup<out Id extends string, out Endpoints extends Any = never, out TopLevel extends boolean = false> extends Pipeable {
  new (_: never): {};
  readonly [TypeId$2]: typeof TypeId$2;
  readonly identifier: Id;
  readonly key: string;
  readonly topLevel: TopLevel;
  readonly endpoints: ReadonlyRecord<string, Endpoints>;
  readonly annotations: Context$2<never>;
  /**
   * Add an `HttpApiEndpoint` to an `HttpApiGroup`.
   */
  add<A extends NonEmptyReadonlyArray<Any>>(...endpoints: A): HttpApiGroup<Id, Endpoints | A[number], TopLevel>;
  /**
   * Add a path prefix to all endpoints in an `HttpApiGroup`. Note that this will only
   * add the prefix to the endpoints before this api is called.
   */
  prefix<const Prefix extends PathInput>(prefix: Prefix): HttpApiGroup<Id, AddPrefix<Endpoints, Prefix>, TopLevel>;
  /**
   * Adds an `HttpApiMiddleware` to every endpoint currently in the group.
   *
   * **Gotchas**
   *
   * Endpoints added after this method is called do not have the middleware
   * applied.
   */
  middleware<I extends AnyId, S>(middleware: Key$1<I, S>): HttpApiGroup<Id, AddMiddleware<Endpoints, I>, TopLevel>;
  /**
   * Merge the annotations of an `HttpApiGroup` with the provided annotations.
   */
  annotateMerge<I>(annotations: Context$2<I>): HttpApiGroup<Id, Endpoints, TopLevel>;
  /**
   * Add an annotation to an `HttpApiGroup`.
   */
  annotate<I, S>(key: Key$1<I, S>, value: S): HttpApiGroup<Id, Endpoints, TopLevel>;
  /**
   * Merges the provided context into every endpoint currently in the group.
   *
   * **Gotchas**
   *
   * Endpoints added after this method is called do not have these annotations.
   */
  annotateEndpointsMerge<I>(annotations: Context$2<I>): HttpApiGroup<Id, Endpoints, TopLevel>;
  /**
   * Adds an annotation to every endpoint currently in the group.
   *
   * **Gotchas**
   *
   * Endpoints added after this method is called do not have this annotation.
   */
  annotateEndpoints<I, S>(key: Key$1<I, S>, value: S): HttpApiGroup<Id, Endpoints, TopLevel>;
}
/**
 * A widened `HttpApiGroup` type used when the concrete group name, endpoints, and
 * top-level flag are not needed.
 *
 * @category models
 * @since 4.0.0
 */
interface Any$1 {
  readonly [TypeId$2]: typeof TypeId$2;
  readonly identifier: string;
  readonly key: string;
  readonly endpoints: ReadonlyRecord<string, Any>;
}
/**
 * Returns the type of a group after adding the supplied path prefix to each endpoint in the group.
 *
 * @category models
 * @since 4.0.0
 */
type AddPrefix$1<Group, Prefix extends PathInput> = Group extends HttpApiGroup<infer _Name, infer _Endpoints, infer _TopLevel> ? HttpApiGroup<_Name, AddPrefix<_Endpoints, Prefix>, _TopLevel> : never;
/**
 * Returns the type of a group after applying a middleware identifier to every endpoint in the group.
 *
 * @category models
 * @since 4.0.0
 */
type AddMiddleware$1<Group, Id extends AnyId> = Group extends HttpApiGroup<infer _Name, infer _Endpoints, infer _TopLevel> ? HttpApiGroup<_Name, AddMiddleware<_Endpoints, Id>, _TopLevel> : never;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/HttpApiEndpoint.d.ts
declare const TypeId$1 = "~effect/httpapi/HttpApiEndpoint";
/**
 * Returns `true` when a value is an `HttpApiEndpoint`, narrowing the value to the
 * endpoint interface.
 *
 * @category guards
 * @since 4.0.0
 */
/**
 * Maps content types to the payload encoding strategy and one or more schemas that
 * can decode or encode payloads for that content type.
 *
 * @category models
 * @since 4.0.0
 */
type PayloadMap = ReadonlyMap<string, {
  readonly encoding: undefined;
  readonly schemas: [Top, ...Array<Top>];
}>;
/**
 * Represents an API endpoint. An API endpoint is mapped to a single route on
 * the underlying `HttpRouter`.
 *
 * @category models
 * @since 4.0.0
 */
interface HttpApiEndpoint<out Name extends string, out Method extends HttpMethod, out Path extends string, out Params extends Top = never, out Query extends Top = never, out Payload extends Top = never, out Headers extends Top = never, out Success extends Top = typeof NoContent, out Error extends Top = never, in out Middleware = never, out MiddlewareR = never> extends Pipeable {
  readonly [TypeId$1]: {
    readonly _MiddlewareR: Covariant<MiddlewareR>;
  };
  readonly "~Params": Params;
  readonly "~Query": Query;
  readonly "~Headers": Headers;
  readonly "~Payload": Payload;
  readonly "~Success": Success;
  readonly "~Error": Error;
  readonly name: Name;
  readonly path: Path;
  readonly method: Method;
  readonly params: Top | undefined;
  readonly query: Top | undefined;
  readonly headers: Top | undefined;
  readonly payload: PayloadMap;
  readonly success: ReadonlySet<Top>;
  readonly error: ReadonlySet<Top>;
  readonly annotations: Context$2<never>;
  readonly middlewares: ReadonlySet<Key$1<Middleware, any>>;
  /**
   * Add a prefix to the path of the endpoint.
   */
  prefix<const Prefix extends PathInput>(prefix: Prefix): HttpApiEndpoint<Name, Method, `${Prefix}${Path}`, Params, Query, Payload, Headers, Success, Error, Middleware, MiddlewareR>;
  /**
   * Add an `HttpApiMiddleware` to the endpoint.
   */
  middleware<I extends AnyId, S>(middleware: Key$1<I, S>): HttpApiEndpoint<Name, Method, Path, Params, Query, Payload, Headers, Success, Error, Middleware | I, ApplyServices<I, MiddlewareR>>;
  /**
   * Add an annotation on the endpoint.
   */
  annotate<I, S>(key: Key$1<I, S>, value: NoInfer$1<S>): HttpApiEndpoint<Name, Method, Path, Params, Query, Payload, Headers, Success, Error, Middleware, MiddlewareR>;
  /**
   * Merge the annotations of the endpoint with the provided context.
   */
  annotateMerge<I>(annotations: Context$2<I>): HttpApiEndpoint<Name, Method, Path, Params, Query, Payload, Headers, Success, Error, Middleware, MiddlewareR>;
}
/**
 * A widened `HttpApiEndpoint` type used when the concrete method, path, schemas,
 * and middleware types are not needed.
 *
 * @category models
 * @since 4.0.0
 */
interface Any extends Pipeable {
  readonly [TypeId$1]: any;
  readonly name: string;
  readonly ["~Success"]: Top;
  readonly ["~Error"]: Top;
}
/**
 * Returns an endpoint type with the supplied path prefix prepended while
 * preserving the endpoint's schemas, method, errors, and middleware.
 *
 * @category models
 * @since 4.0.0
 */
type AddPrefix<Endpoint extends Any, Prefix extends PathInput> = Endpoint extends HttpApiEndpoint<infer _Name, infer _Method, infer _Path, infer _Params, infer _Query, infer _Payload, infer _Headers, infer _Success, infer _Error, infer _M, infer _MR> ? HttpApiEndpoint<_Name, _Method, `${Prefix}${_Path}`, _Params, _Query, _Payload, _Headers, _Success, _Error, _M, _MR> : never;
/**
 * Returns an endpoint type with additional middleware applied and the endpoint's
 * middleware service requirements updated accordingly.
 *
 * @category models
 * @since 4.0.0
 */
type AddMiddleware<Endpoint extends Any, M extends AnyId> = Endpoint extends HttpApiEndpoint<infer _Name, infer _Method, infer _Path, infer _Params, infer _Query, infer _Payload, infer _Headers, infer _Success, infer _Error, infer _M, infer _MR> ? HttpApiEndpoint<_Name, _Method, _Path, _Params, _Query, _Payload, _Headers, _Success, _Error, _M | M, ApplyServices<M, _MR>> : never;
/**
 * A schema codec that decodes and encodes the schema's value type through JSON
 * transport values.
 *
 * @category Codecs
 * @since 4.0.0
 */
interface Json<S extends Top> extends Codec<S["Type"], Json$1, S["DecodingServices"], S["EncodingServices"]> {}
/**
 * A schema codec that decodes and encodes the schema's value type through
 * `Schema.StringTree` transport values.
 *
 * @category Codecs
 * @since 4.0.0
 */
interface StringTree<S extends Top> extends Codec<S["Type"], StringTree$1, S["DecodingServices"], S["EncodingServices"]> {}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/HttpApi.d.ts
declare const TypeId = "~effect/httpapi/HttpApi";
/**
 * Returns `true` when a value is an `HttpApi`.
 *
 * @category guards
 * @since 4.0.0
 */
/**
 * An `HttpApi` is a collection of HTTP API groups and endpoints that represents a
 * portion of your domain.
 *
 * **When to use**
 *
 * Endpoint implementations can be provided with `HttpApiBuilder.group`, and the
 * completed API can be registered with `HttpApiBuilder.layer`.
 *
 * @category models
 * @since 4.0.0
 */
interface HttpApi<out Id extends string, out Groups extends Any$1 = never> extends Pipeable {
  new (_: never): {};
  readonly [TypeId]: typeof TypeId;
  readonly identifier: Id;
  readonly groups: ReadonlyRecord<string, Groups>;
  readonly annotations: Context$2<never>;
  /**
   * Add a `HttpApiGroup` to the `HttpApi`.
   */
  add<A extends NonEmptyReadonlyArray<Any$1>>(...groups: A): HttpApi<Id, Groups | A[number]>;
  /**
   * Add another `HttpApi` to the `HttpApi`.
   */
  addHttpApi<Id2 extends string, Groups2 extends Any$1>(api: HttpApi<Id2, Groups2>): HttpApi<Id, Groups | Groups2>;
  /**
   * Prefix all endpoints in the `HttpApi`.
   */
  prefix<const Prefix extends PathInput>(prefix: Prefix): HttpApi<Id, AddPrefix$1<Groups, Prefix>>;
  /**
   * Adds a middleware to every endpoint currently in the `HttpApi`.
   *
   * **Gotchas**
   *
   * Endpoints added after this method is called do not receive the middleware.
   */
  middleware<I extends AnyId, S>(middleware: Key$1<I, S>): HttpApi<Id, AddMiddleware$1<Groups, I>>;
  /**
   * Annotate the `HttpApi`.
   */
  annotate<I, S>(tag: Key$1<I, S>, value: S): HttpApi<Id, Groups>;
  /**
   * Annotate the `HttpApi` with a Context.
   */
  annotateMerge<I>(context: Context$2<I>): HttpApi<Id, Groups>;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.70/node_modules/effect/dist/unstable/httpapi/OpenApi.d.ts
/**
 * This model describes the OpenAPI specification (version 3.1.0) returned by
 * {@link fromApi}. It is not intended to describe the entire OpenAPI
 * specification, only the output of `fromApi`.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpec {
  openapi: "3.1.0";
  info: OpenAPISpecInfo;
  paths: OpenAPISpecPaths;
  components: OpenAPIComponents;
  security: Array<OpenAPISecurityRequirement>;
  tags: Array<OpenAPISpecTag>;
  servers?: Array<OpenAPISpecServer>;
}
/**
 * OpenAPI `info` object generated by `fromApi`.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecInfo {
  title: string;
  version: string;
  description?: string;
  license?: OpenAPISpecLicense;
  summary?: string;
}
/**
 * OpenAPI tag object generated for an HTTP API group.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecTag {
  name: string;
  description?: string;
  externalDocs?: OpenAPISpecExternalDocs;
}
/**
 * OpenAPI external documentation metadata.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecExternalDocs {
  url: string;
  description?: string;
}
/**
 * OpenAPI license metadata used in the generated `info` object.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecLicense {
  name: string;
  url?: string;
  [key: string]: unknown;
}
/**
 * OpenAPI server object used in the generated `servers` array.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPISpecServerVariable>;
}
/**
 * OpenAPI variable definition for templated server URLs.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecServerVariable {
  default: string;
  enum?: NonEmptyArray<string>;
  description?: string;
}
/**
 * Generated OpenAPI `paths` object, keyed by route path.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISpecPaths = Record<string, OpenAPISpecPathItem>;
/**
 * Lowercase HTTP method names used as keys in generated OpenAPI path items.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISpecMethodName = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";
/**
 * Generated OpenAPI path item mapping HTTP methods to operations for a single route path.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISpecPathItem = { [K in OpenAPISpecMethodName]?: OpenAPISpecOperation };
/**
 * Generated OpenAPI parameter object for path, query, header, or cookie parameters.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  schema: object;
  required: boolean;
  description?: string;
}
/**
 * Generated OpenAPI responses object, keyed by HTTP status code.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISpecResponses = Record<number, OpenApiSpecResponse>;
/**
 * Generated OpenAPI content object, keyed by media type.
 *
 * @category models
 * @since 4.0.0
 */
type OpenApiSpecContent = { [K in string]: OpenApiSpecMediaType };
/**
 * Generated OpenAPI response object for an endpoint success or error schema.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenApiSpecResponse {
  description: string;
  content?: OpenApiSpecContent;
}
/**
 * Generated OpenAPI media type object containing the JSON Schema for a request or response body.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenApiSpecMediaType {
  schema: JsonSchema;
}
/**
 * Generated OpenAPI request body object for endpoint payloads.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecRequestBody {
  content: OpenApiSpecContent;
  required: true;
}
/**
 * Generated OpenAPI components containing shared schemas and security schemes.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPIComponents {
  schemas: Definitions;
  securitySchemes: Record<string, OpenAPISecurityScheme>;
}
/**
 * Generated OpenAPI HTTP security scheme, such as bearer or basic authentication.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPIHTTPSecurityScheme {
  readonly type: "http";
  scheme: "bearer" | "basic" | string;
  description?: string;
  bearerFormat?: string;
}
/**
 * Generated OpenAPI API key security scheme.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPIApiKeySecurityScheme {
  readonly type: "apiKey";
  name: string;
  in: "query" | "header" | "cookie";
  description?: string;
}
/**
 * Union of security scheme objects emitted in generated OpenAPI components.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISecurityScheme = OpenAPIHTTPSecurityScheme | OpenAPIApiKeySecurityScheme;
/**
 * Generated OpenAPI security requirement, keyed by security scheme name.
 *
 * @category models
 * @since 4.0.0
 */
type OpenAPISecurityRequirement = Record<string, Array<string>>;
/**
 * Generated OpenAPI operation object for an HTTP API endpoint.
 *
 * @category models
 * @since 4.0.0
 */
interface OpenAPISpecOperation {
  operationId: string;
  parameters: Array<OpenAPISpecParameter>;
  responses: OpenAPISpecResponses;
  /** Always contains at least the title annotation or the group identifier */
  tags: NonEmptyArray<string>;
  security: Array<OpenAPISecurityRequirement>;
  requestBody?: OpenAPISpecRequestBody;
  description?: string;
  summary?: string;
  deprecated?: boolean;
  externalDocs?: OpenAPISpecExternalDocs;
}
//#endregion
//#region ../protocol/src/effect-http-api.d.ts
declare const ApiFailureSchema: Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>;
declare const RateLimitInfoSchema: Schema.Struct<{
  readonly policy_id: Schema.String;
  readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
  readonly limit: Schema.Number;
  readonly window_ms: Schema.Number;
  readonly remaining: Schema.Number;
  readonly reset_at_ms: Schema.Number;
}>;
declare const ApiRateLimitFailureSchema: Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>;
declare const HealthResponseSchema: Schema.Struct<{
  readonly status: Schema.Literal<"ok">;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
}>;
declare const HealthzResponseSchema: Schema.Struct<{
  readonly status: Schema.Literals<readonly ["ok", "error"]>;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
  readonly version: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly checks: Schema.Struct<{
    readonly db: Schema.Literals<readonly ["ok", "error"]>;
    readonly migrations: Schema.Literals<readonly ["ok", "drift", "unknown"]>;
  }>;
  readonly migrations: Schema.Struct<{
    readonly expected: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly applied_count: Schema.optional<Schema.Number>;
  }>;
  readonly db_ms: Schema.Number;
  readonly total_ms: Schema.Number;
  readonly timestamp: Schema.String;
  readonly error: Schema.optional<Schema.String>;
}>;
declare const WellKnownHarborSchema: Schema.Struct<{
  readonly name: Schema.String;
  readonly id: Schema.String;
  readonly description: Schema.String;
  readonly endpoints: Schema.Struct<{
    readonly api: Schema.String;
    readonly web: Schema.String;
    readonly mcp: Schema.String;
    readonly apps: Schema.String;
  }>;
  readonly well_known: Schema.Struct<{
    readonly index: Schema.String;
    readonly harbor: Schema.String;
    readonly openapi: Schema.String;
    readonly mcp_protected_resource: Schema.String;
    readonly agent_skills: Schema.String;
    readonly ai_policy: Schema.String;
  }>;
}>;
declare const WellKnownIndexSchema: Schema.Struct<{
  readonly name: Schema.String;
  readonly entries: Schema.$Array<Schema.Struct<{
    readonly rel: Schema.String;
    readonly href: Schema.String;
    readonly type: Schema.String;
  }>>;
}>;
declare const OpenApiDocumentSchema: Schema.$Record<Schema.String, Schema.Unknown>;
declare const WorkspaceSchema: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly slug: Schema.String;
  readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
  readonly current_user_id: Schema.optional<Schema.String>;
  readonly current_user_email: Schema.optional<Schema.String>;
  readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.optional<Schema.String>;
  readonly updated_at: Schema.optional<Schema.String>;
}>;
declare const WorkspaceDetailSchema: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly slug: Schema.String;
  readonly created_by: Schema.String;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
declare const ListWorkspacesRequestSchema: Schema.Struct<{
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
declare const WorkspaceRequestSchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
declare const UserOnboardingSchema: Schema.Struct<{
  readonly onboardedAt: Schema.NullOr<Schema.String>;
}>;
declare const ListWorkspacesResultSchema: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly slug: Schema.String;
    readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
    readonly current_user_id: Schema.optional<Schema.String>;
    readonly current_user_email: Schema.optional<Schema.String>;
    readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.optional<Schema.String>;
    readonly updated_at: Schema.optional<Schema.String>;
  }>>;
  readonly user: Schema.Struct<{
    readonly onboardedAt: Schema.NullOr<Schema.String>;
  }>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
declare const ApiSuccessListWorkspacesResultSchema: Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly data: Schema.$Array<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.String;
      readonly slug: Schema.String;
      readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
      readonly current_user_id: Schema.optional<Schema.String>;
      readonly current_user_email: Schema.optional<Schema.String>;
      readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly created_at: Schema.optional<Schema.String>;
      readonly updated_at: Schema.optional<Schema.String>;
    }>>;
    readonly user: Schema.Struct<{
      readonly onboardedAt: Schema.NullOr<Schema.String>;
    }>;
    readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
    readonly limit: Schema.Number;
    readonly offset: Schema.Number;
    readonly hasMore: Schema.Boolean;
    readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
  }>;
}>;
declare const ApiSuccessWorkspaceDetailSchema: Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly slug: Schema.String;
    readonly created_by: Schema.String;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>;
}>;
declare const ExecuteSourceRefSchema: Schema.Struct<{
  readonly namespace: Schema.String;
}>;
declare const ExecuteInputSchema: Schema.Struct<{
  readonly path: Schema.String;
  readonly content_type: Schema.optional<Schema.String>;
  readonly size_bytes: Schema.Number;
  readonly sha256: Schema.String;
  readonly data_base64: Schema.String;
}>;
declare const ExecuteRequestSchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly mode: Schema.optional<Schema.Literals<readonly ["exec", "workflow"]>>;
  readonly sources: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
  }>>>;
  readonly code: Schema.String;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly run_id: Schema.optional<Schema.String>;
  readonly sand_session_id: Schema.optional<Schema.String>;
  readonly origin_cwd: Schema.optional<Schema.String>;
  readonly execution_inputs: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly path: Schema.String;
    readonly content_type: Schema.optional<Schema.String>;
    readonly size_bytes: Schema.Number;
    readonly sha256: Schema.String;
    readonly data_base64: Schema.String;
  }>>>;
}>;
declare const ExecuteWarningSchema: Schema.Struct<{
  readonly namespace: Schema.String;
  readonly tool: Schema.String;
  readonly message: Schema.String;
}>;
declare const ExecuteResultSchema: Schema.Struct<{
  readonly result: Schema.Unknown;
  readonly error: Schema.optional<Schema.String>;
  readonly logs: Schema.optional<Schema.Unknown>;
  readonly mode: Schema.Literals<readonly ["dynamic_worker", "workflow"]>;
  readonly warnings: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
    readonly tool: Schema.String;
    readonly message: Schema.String;
  }>>>;
  readonly run_id: Schema.String;
  readonly workflow_instance_id: Schema.optional<Schema.String>;
}>;
declare const ApiSuccessExecuteResultSchema: Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly result: Schema.Unknown;
    readonly error: Schema.optional<Schema.String>;
    readonly logs: Schema.optional<Schema.Unknown>;
    readonly mode: Schema.Literals<readonly ["dynamic_worker", "workflow"]>;
    readonly warnings: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly namespace: Schema.String;
      readonly tool: Schema.String;
      readonly message: Schema.String;
    }>>>;
    readonly run_id: Schema.String;
    readonly workflow_instance_id: Schema.optional<Schema.String>;
  }>;
}>;
declare const HarborHttpApi: HttpApi<"HarborApi", HttpApiGroup<"Discovery", HttpApiEndpoint<"getHarborWellKnown", "GET", "/.well-known/harbor.json", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly name: Schema.String;
  readonly id: Schema.String;
  readonly description: Schema.String;
  readonly endpoints: Schema.Struct<{
    readonly api: Schema.String;
    readonly web: Schema.String;
    readonly mcp: Schema.String;
    readonly apps: Schema.String;
  }>;
  readonly well_known: Schema.Struct<{
    readonly index: Schema.String;
    readonly harbor: Schema.String;
    readonly openapi: Schema.String;
    readonly mcp_protected_resource: Schema.String;
    readonly agent_skills: Schema.String;
    readonly ai_policy: Schema.String;
  }>;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getWellKnownIndex", "GET", "/.well-known/index.json", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly name: Schema.String;
  readonly entries: Schema.$Array<Schema.Struct<{
    readonly rel: Schema.String;
    readonly href: Schema.String;
    readonly type: Schema.String;
  }>>;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getHarborOpenApi", "GET", "/openapi/harbor.v1.json", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getOpenApiJson", "GET", "/openapi.json", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never>, false> | HttpApiGroup<"Health", HttpApiEndpoint<"getHealth", "GET", "/health", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly status: Schema.Literal<"ok">;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getV1Health", "GET", "/v1/health", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly status: Schema.Literal<"ok">;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getHealthz", "GET", "/healthz", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly status: Schema.Literals<readonly ["ok", "error"]>;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
  readonly version: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly checks: Schema.Struct<{
    readonly db: Schema.Literals<readonly ["ok", "error"]>;
    readonly migrations: Schema.Literals<readonly ["ok", "drift", "unknown"]>;
  }>;
  readonly migrations: Schema.Struct<{
    readonly expected: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly applied_count: Schema.optional<Schema.Number>;
  }>;
  readonly db_ms: Schema.Number;
  readonly total_ms: Schema.Number;
  readonly timestamp: Schema.String;
  readonly error: Schema.optional<Schema.String>;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never> | HttpApiEndpoint<"getV1Healthz", "GET", "/v1/healthz", StringTree<never>, StringTree<never>, StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly status: Schema.Literals<readonly ["ok", "error"]>;
  readonly service: Schema.Literal<"harbor-api">;
  readonly environment: Schema.String;
  readonly version: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly checks: Schema.Struct<{
    readonly db: Schema.Literals<readonly ["ok", "error"]>;
    readonly migrations: Schema.Literals<readonly ["ok", "drift", "unknown"]>;
  }>;
  readonly migrations: Schema.Struct<{
    readonly expected: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_applied_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly applied_count: Schema.optional<Schema.Number>;
  }>;
  readonly db_ms: Schema.Number;
  readonly total_ms: Schema.Number;
  readonly timestamp: Schema.String;
  readonly error: Schema.optional<Schema.String>;
}>>, Json<Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>>, never, never>, false> | HttpApiGroup<"Workspaces", HttpApiEndpoint<"listWorkspaces", "POST", "/workspaces/list", StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly data: Schema.$Array<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.String;
      readonly slug: Schema.String;
      readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
      readonly current_user_id: Schema.optional<Schema.String>;
      readonly current_user_email: Schema.optional<Schema.String>;
      readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly created_at: Schema.optional<Schema.String>;
      readonly updated_at: Schema.optional<Schema.String>;
    }>>;
    readonly user: Schema.Struct<{
      readonly onboardedAt: Schema.NullOr<Schema.String>;
    }>;
    readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
    readonly limit: Schema.Number;
    readonly offset: Schema.Number;
    readonly hasMore: Schema.Boolean;
    readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
  }>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"getWorkspace", "POST", "/workspaces/get", StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly workspace_id: Schema.String;
}>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly slug: Schema.String;
    readonly created_by: Schema.String;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never>, false> | HttpApiGroup<"Runtime", HttpApiEndpoint<"executePlugin", "POST", "/plugins/execute", StringTree<never>, StringTree<never>, Json<Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly mode: Schema.optional<Schema.Literals<readonly ["exec", "workflow"]>>;
  readonly sources: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
  }>>>;
  readonly code: Schema.String;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly run_id: Schema.optional<Schema.String>;
  readonly sand_session_id: Schema.optional<Schema.String>;
  readonly origin_cwd: Schema.optional<Schema.String>;
  readonly execution_inputs: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly path: Schema.String;
    readonly content_type: Schema.optional<Schema.String>;
    readonly size_bytes: Schema.Number;
    readonly sha256: Schema.String;
    readonly data_base64: Schema.String;
  }>>>;
}>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.Struct<{
    readonly result: Schema.Unknown;
    readonly error: Schema.optional<Schema.String>;
    readonly logs: Schema.optional<Schema.Unknown>;
    readonly mode: Schema.Literals<readonly ["dynamic_worker", "workflow"]>;
    readonly warnings: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly namespace: Schema.String;
      readonly tool: Schema.String;
      readonly message: Schema.String;
    }>>>;
    readonly run_id: Schema.String;
    readonly workflow_instance_id: Schema.optional<Schema.String>;
  }>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never>, false> | HttpApiGroup<"Triggers", HttpApiEndpoint<"inspectTrigger", "POST", "/triggers/inspect", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"activateTrigger", "POST", "/triggers/activate", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"listTriggers", "POST", "/triggers/list", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"getTrigger", "POST", "/triggers/get", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"pauseTrigger", "POST", "/triggers/pause", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"resumeTrigger", "POST", "/triggers/resume", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"disableTrigger", "POST", "/triggers/disable", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"replayTriggerDelivery", "POST", "/triggers/replay", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"listTriggerDeliveries", "POST", "/triggers/deliveries/list", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"getTriggerDelivery", "POST", "/triggers/deliveries/get", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"getTriggerLimits", "POST", "/triggers/limits/get", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never> | HttpApiEndpoint<"updateTriggerLimits", "POST", "/triggers/limits/update", StringTree<never>, StringTree<never>, Json<Schema.$Record<Schema.String, Schema.Unknown>>, StringTree<never>, Json<Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Record<Schema.String, Schema.Unknown>;
}>>, Json<Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>]>>, never, never>, false>>;
interface HarborEffectOpenApiOptions {
  readonly servers?: ReadonlyArray<OpenAPISpecServer> | undefined;
}
declare function createHarborEffectOpenApiDocument(options?: HarborEffectOpenApiOptions): OpenAPISpec;
interface HarborHttpApiOperation {
  readonly operationId: string;
  readonly method: string;
  readonly path: string;
  readonly group: string;
}
declare function collectHarborHttpApiOperations(): readonly HarborHttpApiOperation[];
declare function assertHarborHttpApiMatchesOperationRegistry(): void;
//#endregion
export { ApiFailureSchema, ApiRateLimitFailureSchema, ApiSuccessExecuteResultSchema, ApiSuccessListWorkspacesResultSchema, ApiSuccessWorkspaceDetailSchema, ExecuteInputSchema, ExecuteRequestSchema, ExecuteResultSchema, ExecuteSourceRefSchema, ExecuteWarningSchema, HarborEffectOpenApiOptions, HarborHttpApi, HarborHttpApiOperation, HealthResponseSchema, HealthzResponseSchema, ListWorkspacesRequestSchema, ListWorkspacesResultSchema, OpenApiDocumentSchema, RateLimitInfoSchema, UserOnboardingSchema, WellKnownHarborSchema, WellKnownIndexSchema, WorkspaceDetailSchema, WorkspaceRequestSchema, WorkspaceSchema, assertHarborHttpApiMatchesOperationRegistry, collectHarborHttpApiOperations, createHarborEffectOpenApiDocument };
//# sourceMappingURL=effect-http-api.d.mts.map