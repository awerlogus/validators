const { getTypeOf } = require('./util')

// MODULE Type imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

// MODULE Error Declarations

// SECTION Type declarations

/**
 * @template {Record<string, any>} C
 *
 * @typedef {(
 *  | { __tag: 'not-found' }
 *  | { __tag: 'type', expected: string, got: string }
 *  | { __tag: 'container', container: string, depth: number }
 *  | { __tag: 'field', field: string | number, depth: number }
 *  | { [K in keyof C]: { __tag: 'condition', condition: K, details: C[K], got: Option<Json> } }[keyof C]
 * )} ValidationError
 */

// SECTION Methods

/** @type {ValidationError<{}>} */
const notFound = { __tag: 'not-found' }

/** @type {(field: string | number) => ValidationError<{}>} */
const fieldError = field => ({ __tag: 'field', field, depth: 1 })

/** @type {(container: string, depth: number) => ValidationError<{}>} */
const containerError = (container, depth) => ({ __tag: 'container', container, depth })

/** @type {(expected: string, data: Option<Json>) => ValidationError<{}>} */
const typeError = (expected, data) => ({ __tag: 'type', expected, got: getTypeOf(data) })

/** @type {<const T extends string, const D>(condition: T, details: D, got: Option<Json>) => ValidationError<Record<T, D>>} */
// @ts-ignore necessary: Yet another TypeScript bug
const conditionError = (condition, details, got) => ({ __tag: 'condition', condition, details, got })

// MODULE Exports

module.exports = { notFound, fieldError, conditionError, typeError, containerError }
