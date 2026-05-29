import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";

//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Types.d.ts
/**
 * Function-type alias encoding covariant variance for a phantom type
 * parameter.
 *
 * - Use as a phantom field type to make a type parameter covariant
 *   (output position).
 * - `Covariant<A>` is assignable to `Covariant<B>` when `A extends B`
 *   (subtype direction).
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
 * @since 2.0.0
 * @category models
 */
type Covariant<A> = (_: never) => A;
/**
 * Namespace for {@link Covariant}-related utilities.
 *
 * @since 3.9.0
 * @category models
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
   * @since 3.9.0
   * @category models
   */
  type Type<A> = A extends Covariant<infer U> ? U : never;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Inspectable.d.ts
/**
 * Interface for objects that can be inspected and provide custom string representations.
 *
 * Objects implementing this interface can control how they appear in debugging contexts,
 * JSON serialization, and Node.js inspection. This is particularly useful for creating
 * custom data types that display meaningful information during development.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 * import { format } from "effect/Formatter"
 *
 * class Result implements Inspectable.Inspectable {
 *   constructor(
 *     private readonly tag: "Success" | "Failure",
 *     private readonly value: unknown
 *   ) {}
 *
 *   toString(): string {
 *     return format(this.toJSON())
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
 * @since 2.0.0
 * @category models
 */
interface Inspectable {
  toString(): string;
  toJSON(): unknown;
  [NodeInspectSymbol](): unknown;
}
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Pipeable.d.ts
/**
 * @since 2.0.0
 */
/**
 * @since 2.0.0
 * @category models
 * @example
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
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Unify.d.ts
/**
 * @since 2.0.0
 */
/**
 * A unique symbol used to identify unification behavior in Effect types.
 *
 * This symbol is used internally by the Effect type system to enable automatic
 * unification of Effect types in unions and complex type operations.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The unifySymbol is used internally in Effect types
 * // to enable automatic type unification
 * declare const effect: {
 *   readonly [Unify.unifySymbol]?: any
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
declare const unifySymbol: unique symbol;
/**
 * The type of the unifySymbol.
 *
 * This type represents the unique symbol used for identifying unification
 * behavior in Effect types. It's typically used in type-level operations
 * to enable automatic type unification.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The unifySymbol type is used in type declarations
 * // to enable unification behavior
 * type UnifyableType = {
 *   [Unify.unifySymbol]?: any
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
type unifySymbol = typeof unifySymbol;
/**
 * A unique symbol used to identify the type information for unification.
 *
 * This symbol is used internally by the Effect type system to store type
 * information that can be used during type unification operations.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The typeSymbol is used internally in Effect types
 * // to store type information for unification
 * declare const effect: {
 *   readonly [Unify.typeSymbol]?: any
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
declare const typeSymbol: unique symbol;
/**
 * The type of the typeSymbol.
 *
 * This type represents the unique symbol used for storing type information
 * in types that support unification. It's used in type-level operations
 * to access and manipulate type information.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The typeSymbol type is used in type declarations
 * // to store type information for unification
 * type TypedValue = {
 *   [Unify.typeSymbol]?: string
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
type typeSymbol = typeof typeSymbol;
/**
 * A unique symbol used to specify types that should be ignored during unification.
 *
 * This symbol is used internally by the Effect type system to mark types
 * that should be excluded from the unification process, allowing for more
 * precise type handling in complex scenarios.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The ignoreSymbol is used internally in Effect types
 * // to mark types that should be ignored during unification
 * declare const effect: {
 *   readonly [Unify.ignoreSymbol]?: any
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
declare const ignoreSymbol: unique symbol;
/**
 * The type of the ignoreSymbol.
 *
 * This type represents the unique symbol used for marking types that should
 * be ignored during unification operations. It's used in type-level operations
 * to exclude specific types from the unification process.
 *
 * @example
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The ignoreSymbol type is used in type declarations
 * // to mark types that should be ignored during unification
 * type IgnorableType = {
 *   [Unify.ignoreSymbol]?: unknown
 * }
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
type ignoreSymbol = typeof ignoreSymbol;
//#endregion
//#region ../../../node_modules/.bun/effect@4.0.0-beta.66/node_modules/effect/dist/Effect.d.ts
/**
 * @category Type identifiers
 * @since 2.0.0
 */
type TypeId = "~effect/Effect";
/**
 * @category Type identifiers
 * @since 2.0.0
 */
declare const TypeId: TypeId;
/**
 * The `Effect` interface defines a value that lazily describes a workflow or
 * job. The workflow requires some context `R`, and may fail with an error of
 * type `E`, or succeed with a value of type `A`.
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
 * @example
 * ```ts
 * import { Data, Effect } from "effect"
 *
 * class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
 *
 * // A simple effect that succeeds with a value
 * const success = Effect.succeed(42)
 *
 * // An effect that will always fail
 * const risky = Effect.fail(new TaskError({ message: "Something went wrong" }))
 *
 * // Effects can be composed using generator functions
 * const program = Effect.gen(function*() {
 *   const value = yield* success
 *   console.log(value) // 42
 *   return value * 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category Models
 */
interface Effect<out A, out E = never, out R = never> extends Pipeable, Inspectable {
  readonly [TypeId]: Variance<A, E, R>;
  [Symbol.iterator](): EffectIterator<Effect<A, E, R>>;
  [typeSymbol]?: unknown;
  [unifySymbol]?: EffectUnify<this>;
  [ignoreSymbol]?: {};
}
/**
 * @category Models
 * @since 2.0.0
 * @example
 * ```ts
 * import type { Effect } from "effect"
 *
 * // EffectUnify is used internally for type unification
 * // It enables automatic unification of Effect types in unions
 * declare const unified: Effect.EffectUnify<any>
 * ```
 */
interface EffectUnify<A extends {
  [typeSymbol]?: any;
}> {
  Effect?: () => A[typeSymbol] extends Effect<infer A0, infer E0, infer R0> | infer _ ? Effect<A0, E0, R0> : never;
}
/**
 * Variance interface for Effect, encoding the type parameters' variance.
 *
 * @since 2.0.0
 * @category Models
 */
interface Variance<A, E, R> {
  _A: Covariant<A>;
  _E: Covariant<E>;
  _R: Covariant<R>;
}
/**
 * @since 2.0.0
 * @category Models
 * @example
 * ```ts
 * import type { Effect } from "effect"
 *
 * // Extract the success type from an Effect
 * declare const myEffect: Effect.Effect<string, Error, never>
 * // This type utility extracts the success type A from Effect<A, E, R>
 * ```
 */
type Success<T> = T extends Effect<infer _A, infer _E, infer _R> ? _A : never;
/**
 * Iterator interface for Effect generators, enabling Effect values to work with generator functions.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 *
 * // Effects are iterable and work with generator functions
 * const program = Effect.gen(function*() {
 *   const effect: Effect.Effect<number, never, never> = Effect.succeed(42)
 *
 *   // The effect's iterator is used internally by yield*
 *   const result = yield* effect
 *   return result * 2
 * })
 *
 * Effect.runPromise(program).then(console.log) // 84
 * ```
 *
 * @since 2.0.0
 * @category Models
 */
interface EffectIterator<T extends Effect<any, any, any>> {
  next(...args: ReadonlyArray<any>): IteratorResult<T, Success<T>>;
}
//#endregion
//#region ../platform-cloudflare/src/stack.d.ts
interface HarborPlatformCloudflareBindingNameOptions {
  readonly database?: string | undefined;
  readonly artifactBucket?: string | undefined;
  readonly cacheNamespace?: string | undefined;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface HarborPlatformCloudflareBindingNames {
  readonly database: string;
  readonly artifactBucket: string;
  readonly cacheNamespace: string;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface HarborPlatformCloudflareResourceIdOptions {
  readonly apiWorker?: string | undefined;
  readonly database?: string | undefined;
  readonly artifactBucket?: string | undefined;
  readonly cacheNamespace?: string | undefined;
  readonly harborExecWorkflow?: string | undefined;
  readonly toolIndexWorkflow?: string | undefined;
  readonly openApiImportWorkflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface HarborPlatformCloudflareWorkflowOptions {
  readonly workflowName: string;
  readonly className: string;
}
interface HarborPlatformCloudflareWorkflowDeclarations {
  readonly harborExec?: HarborPlatformCloudflareWorkflowOptions | undefined;
  readonly toolIndex?: HarborPlatformCloudflareWorkflowOptions | undefined;
  readonly openApiImport?: HarborPlatformCloudflareWorkflowOptions | undefined;
}
type HarborPlatformCloudflareWorkflowKey = 'harborExec' | 'toolIndex' | 'openApiImport';
type HarborPlatformCloudflareResourceKind = 'worker' | 'd1_database' | 'r2_bucket' | 'kv_namespace' | 'workflow' | 'durable_object_namespace';
interface HarborPlatformCloudflareResourceDeclaration {
  readonly id: string;
  readonly kind: HarborPlatformCloudflareResourceKind;
  readonly binding?: string | undefined;
  readonly metadata?: Record<string, string> | undefined;
}
interface HarborPlatformCloudflareStackSpec {
  readonly name: string;
  readonly bindings: HarborPlatformCloudflareBindingNames;
}
interface HarborPlatformCloudflareStackDeclaration {
  readonly spec: HarborPlatformCloudflareStackSpec;
  readonly resources: {
    readonly apiWorker: HarborPlatformCloudflareResourceDeclaration;
    readonly database: HarborPlatformCloudflareResourceDeclaration;
    readonly artifactBucket: HarborPlatformCloudflareResourceDeclaration;
    readonly cacheNamespace: HarborPlatformCloudflareResourceDeclaration;
    readonly workflows: Partial<Record<HarborPlatformCloudflareWorkflowKey, HarborPlatformCloudflareResourceDeclaration>>;
    readonly sessionsObject?: HarborPlatformCloudflareResourceDeclaration | undefined;
  };
  readonly requiredBindings: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}
//#endregion
//#region ../platform-cloudflare/src/deploy.d.ts
interface HarborPlatformCloudflareApiWorkerOptions {
  readonly main: string;
  readonly props?: Omit<Cloudflare.WorkerProps<Cloudflare.WorkerBindingProps>, 'main' | 'bindings'> | undefined;
  readonly bindings?: Cloudflare.WorkerBindingProps | undefined;
}
interface HarborPlatformAlchemyCloudflareStackOptions {
  readonly stackName: string;
  readonly bindingNames?: HarborPlatformCloudflareBindingNameOptions | undefined;
  readonly resourceIds?: HarborPlatformCloudflareResourceIdOptions | undefined;
  readonly database?: Cloudflare.DatabaseProps | undefined;
  readonly artifactBucket?: Cloudflare.R2BucketProps | undefined;
  readonly cacheNamespace?: Cloudflare.KVNamespaceProps | undefined;
  readonly apiWorker: HarborPlatformCloudflareApiWorkerOptions;
  readonly workflows?: HarborPlatformCloudflareWorkflowDeclarations | undefined;
}
interface HarborPlatformWorkflowStackOutput {
  readonly workflowId: Alchemy.Output<string>;
  readonly workflowName: Alchemy.Output<string>;
  readonly className: Alchemy.Output<string>;
}
interface HarborPlatformAlchemyCloudflareStackOutput {
  readonly declaration: HarborPlatformCloudflareStackDeclaration;
  readonly apiWorker: {
    readonly workerId: Alchemy.Output<string>;
    readonly workerName: Alchemy.Output<string>;
    readonly url?: Alchemy.Output<string | undefined> | undefined;
  };
  readonly database: {
    readonly databaseId: Alchemy.Output<string>;
    readonly databaseName: Alchemy.Output<string>;
  };
  readonly artifactBucket: {
    readonly bucketName: Alchemy.Output<string>;
  };
  readonly cacheNamespace: {
    readonly namespaceId: Alchemy.Output<string>;
    readonly title: Alchemy.Output<string>;
  };
  readonly workflows: Partial<Record<HarborPlatformCloudflareWorkflowKey, HarborPlatformWorkflowStackOutput>>;
}
declare function createHarborPlatformCloudflareStack(options: HarborPlatformAlchemyCloudflareStackOptions): Effect<Alchemy.CompiledStack<{
  declaration: HarborPlatformCloudflareStackDeclaration;
  apiWorker: {
    workerId: Alchemy.Output<string, never>;
    workerName: Alchemy.Output<string, never>;
    url: Alchemy.Output<string | undefined, never>;
  };
  database: {
    databaseId: Alchemy.Output<string, never>;
    databaseName: Alchemy.Output<string, never>;
  };
  artifactBucket: {
    bucketName: Alchemy.Output<string, never>;
  };
  cacheNamespace: {
    namespaceId: Alchemy.Output<string, never>;
    title: Alchemy.Output<string, never>;
  };
  workflows: Partial<Record<HarborPlatformCloudflareWorkflowKey, HarborPlatformWorkflowStackOutput>>;
}, any>, never, never>;
//#endregion
export { HarborPlatformAlchemyCloudflareStackOptions, HarborPlatformAlchemyCloudflareStackOutput, HarborPlatformCloudflareApiWorkerOptions, HarborPlatformWorkflowStackOutput, createHarborPlatformCloudflareStack };
//# sourceMappingURL=cloudflare-deploy.d.mts.map