/**
 * Type alias for a `Dictionary` with a string key and a value of type `TValue`.
 */
export type Dictionary<TValue> = Record<string, TValue>;

/**
 * Type alias for a type that is not an `Error`. 
 */
export type NotError<T> = T extends Error ? never : T;

/**
 * Type alias for a type that is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Type-level assertion that the generic type is not `never`.
 */
export type IsNotNever<T> = [T] extends [never] ? "Generic type must not be 'never'" : true;

/**
 * Type-level assertion that the generic type is `never`.
 */
export type AssertNever<T extends never> = T;

/**
 * Type alias for any constructor (on a concrete or abstract class).
 */
export type Constructor<TReturn> = abstract new (...args: any[]) => TReturn;

/**
 * Type alias for a function.
 */
export type AnyFunction<TReturn = any> = (...args: any[]) => TReturn;

/**
 * Type alias for an asynchronous function.
 */
export type AnyAsyncFunction<TReturn = any> = (
	...args: any[]
) => Promise<TReturn>;

/**
 * Interface that specifies a Discriminant Tag on a class for use in a Discriminated Union.
 */
export interface Discriminated<TDiscriminantTag extends PropertyKey> {
  readonly discriminantTag: TDiscriminantTag;
};
