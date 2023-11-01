const F = require('@awerlogus/data-types/lib/function')
const E = require('@awerlogus/data-types/lib/either')

// MODULE Type imports

/** @template T @typedef {import('./util').Compute<T>} Compute */

/** @template {ReadonlyArray<any>} T @typedef {import('@awerlogus/data-types/lib/array').Elem<T>} Elem */

/** @template {Record<string, any>} E @typedef {import('./errors').ValidationError<E>} ValidationError */

// MODULE Validator data types

// SECTION Type declarations

/** @template {Record<string, any>} E, P, T @typedef {(data: P) => ValidationResult<E, T>} Validator */

/** @template {Record<string, any>} E, T @typedef {E.Either<ReadonlyArray<ValidationError<E>>, T>} ValidationResult */

/** @template {Validator<any, any, any>} V @typedef {Compute<ValidationError<ValidatorCustomErrors<V>>>} ValidatorErrors */

/** @template {Validator<any, any, any>} V @typedef {V extends Validator<any, any, infer T> ? T : never} ValidatorResult */

/** @template {ValidationError<any> & { __tag: 'condition' }} E @typedef {{ [C in E['condition']]: (E & { condition: C })['details'] }} CustomValidationErrorAlgebra */

// @ts-ignore necessary
/** @template {Validator<any, any, any>} V @typedef {ReturnType<V> extends Either<infer E, any> ? CustomValidationErrorAlgebra<Elem<E> & { __tag: 'condition' }> : never} ValidatorCustomErrors */

// SECTION Methods

/** @type {<I, P, R, E extends Record<string, any> = {}>(validator: Validator<E, I, P>, mapper: (data: P) => R) => Validator<E, I, R>} */
const map = (validator, mapper) => F.flow(validator, E.mapC(mapper))

/** @type {<I, P, R, E1 extends Record<string, any> = {}, E2 extends Record<string, any> = {}>(first: Validator<E1, I, P>, second: Validator<E2, P, R>) => Validator<E1 & E2, I, R>} */
const chain = (first, second) => F.flow(first, E.chainC(second))

// MODULE Exports

module.exports = { map, chain }
