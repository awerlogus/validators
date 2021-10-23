// SECTION Types

// MODULE Imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

// MODULE Declarations

/** @template T @typedef {(ReadonlyArray<T> & { readonly 0: T }) | readonly []} Tuple */

/** @template T @typedef {T extends Function ? T : { [K in keyof T]: T[K] } & unknown} Compute */

/** @template U @typedef {Compute<(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never>} UnionToIntersection */

// SECTION Library

/** @type {{ isArray: (data: unknown) => data is ReadonlyArray<any> }} */
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

/** @type {(data: string | boolean | number) => string} */
const literalToString = data => typeof data === 'string' ? `'${data}'` : String(data)

// SECTION Exports

module.exports = { isArray, same, getTypeOf, literalToString }
