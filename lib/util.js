// MODULE Type imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

// MODULE Util Declarations

// SECTION Type declarations

/** @template T @typedef {(ReadonlyArray<T> & { readonly 0: T }) | readonly []} Tuple */

/** @template T @typedef {T extends Function ? T : { [K in keyof T]: T[K] } & unknown} Compute */

/** @template T @typedef {Compute<(T extends any ? (k: T) => void : never) extends ((k: infer I) => void) ? I : never>} UnionToIntersection */

// SECTION Methods

/** @type {{ isArray: (data: unknown) => data is ReadonlyArray<unknown> }} */
const { isArray } = Array

/** @type {<T extends string | number | boolean>(value: Option<Json>, template: T) => value is T} */
const same = (value, template) => value === template

/** @type {(data: Option<Json>) => string} */
const getTypeOf = data => {
  const type = typeof data

  if (type !== 'object') { return type }

  if (data === null) { return 'null' }

  if (Array.isArray(data)) { return 'Array' }

  return 'Object'
}

// MODULE Exports

module.exports = { isArray, same, getTypeOf }
