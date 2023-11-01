import type { Either } from '@awerlogus/data-types/lib/either'
import type { Elem } from '@awerlogus/data-types/lib/array'
import type { ValidationError } from './errors'
import type { Compute } from './util'

// SECTION Types

export type Validator<E extends Record<string, any>, P, T > = (data: P) => ValidationResult<E, T>

export type ValidationResult<E extends Record<string, any>, T> = Either<ReadonlyArray<ValidationError<E>>, T>

export type ValidatorErrors<V extends Validator<any, any, any>> = Compute<ValidationError<ValidatorCustomErrors<V>>>

export type ValidatorResult<V extends Validator<any, any, any>> = V extends Validator<any, any, infer T> ? T : never

export type CustomValidationErrorAlgebra<E extends ValidationError<any> & { __tag: 'condition' }> = { [C in E['condition']]: (E & { condition: C })['details'] }

// @ts-ignore
export type ValidatorCustomErrors<V extends Validator<any, any, any>> = ReturnType<V> extends Either<infer E, any> ? CustomValidationErrorAlgebra<Elem<E> & { __tag: 'condition' }> : never

// SECTION Methods

export const map: <I, P, R, E extends Record<string, any> = {}>(validator: Validator<E, I, P>, mapper: (data: P) => R) => Validator<E, I, R>

export const chain: <I, P, R, E1 extends Record<string, any> = {}, E2 extends Record<string, any> = {}>(first: Validator<E1, I, P>, second: Validator<E2, P, R>) => Validator<E1 & E2, I, R>
