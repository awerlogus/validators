const E = require('@awerlogus/data-types/lib/either')

// SECTION Types

// MODULE Imports

/** @template T @typedef {import('./basic').Validator<T>} Validator */

/** @template P, R @typedef {import('./basic').ValidatorExtension<P,  R>} ValidatorExtension */

// SECTION Library

/** @type {<P, R>(validator: Validator<P>, mapper: (data: P) => R) => Validator<R>} */
const map = (validator, mapper) => data => E.map(validator(data), mapper)

/** @type {<P, R>(first: Validator<P>, second: ValidatorExtension<P, R>) => Validator<R>} */
const chain = (first, second) => data => E.chain(first(data), second)

// SECTION Exports

module.exports = { map, chain }
