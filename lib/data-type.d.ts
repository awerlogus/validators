import type { Validator, ValidatorExtension } from './basic'

// SECTION Library

export const map: <P, R>(validator: Validator<P>, mapper: (data: P) => R) => Validator<R>

export const chain: <P, R>(first: Validator<P>, second: ValidatorExtension<P, R>) => Validator<R>
