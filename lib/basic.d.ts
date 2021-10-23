import type { Json, JsonRecord } from '@awerlogus/data-types/lib/json'
import type { Tuple, Compute, UnionToIntersection } from './util'
import type { Option } from '@awerlogus/data-types/lib/option'
import type { Either } from '@awerlogus/data-types/lib/either'
import type { ValidateError } from './errors'

// SECTION Types

type PropType = 'optional' | 'required'

export type Validator<T> = ValidatorExtension<Option<Json>, T>

export type ValidatorExtension<P, T> = (data: P) => ValidationResult<T>

export type ValidationResult<T> = Either<ReadonlyArray<ValidateError>, T>

type PropToObject<P extends PropType, K extends string, T> = P extends 'optional' ? { [KEY in K]?: T } : { [KEY in K]: T }

export type ValidatorContent<V extends ValidatorExtension<any, any>> = V extends ValidatorExtension<any, infer T> ? T : never

type PropsToObject<T extends Tuple<ValidatorExtension<Record<string, Json>, Record<string, any>>>> = UnionToIntersection<ValidatorContent<T[number]>>

type TupleFromValidator<T extends Tuple<Validator<any>>> =
  T extends [infer HEAD, ...infer Tail]
  ? HEAD extends Validator<any>
    ? Tail extends Tuple<Validator<any>>
      ? [ValidatorContent<HEAD>, ...TupleFromValidator<Tail>]
      : [ValidatorContent<HEAD>]
    : []
  : []

// SECTION Library

export const enumeration: <P extends string | boolean | number>(object: Record<string, P>) => Validator<P>

export const nullVal: Validator<null>

export const boolean: Validator<boolean>

export const literal: <P extends string | boolean | number>(value: P) => Validator<P>

export const number: Validator<number>

export const string: Validator<string>

export const tuple: <P extends Tuple<Validator<any>>>(validators: P) => Validator<TupleFromValidator<P>>

export const array: <P>(validator: Validator<P>) => Validator<ReadonlyArray<P>>

export const union: <P extends Tuple<Validator<any>>>(validators: P) => Validator<ValidatorContent<P[number]>>

export const undef: Validator<undefined>

export const prop: <P extends PropType, K extends string, R>(type: P, key: K, validator: Validator<R>) => ValidatorExtension<JsonRecord, PropToObject<P, K, R>>

export const record: <V>(validator: Validator<V>) => Validator<Record<string, V>>

export const exact: <P extends Tuple<ValidatorExtension<JsonRecord, Record<string, any>>>>(props: P) => Validator<PropsToObject<P>>

export const type: <P extends Tuple<ValidatorExtension<JsonRecord, Record<string, any>>>>(props: P) => Validator<JsonRecord & PropsToObject<P>>
