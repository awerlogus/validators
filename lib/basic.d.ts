import type { Validator, ValidatorResult, ValidatorCustomErrors } from './data-type'
import type { Json, JsonRecord } from '@awerlogus/data-types/lib/json'
import type { Tuple, Compute, UnionToIntersection } from './util'
import type { Option } from '@awerlogus/data-types/lib/option'

// SECTION Types

export type PropType = 'optional' | 'required'

export type PropToObject<P extends PropType, K extends string, V> = P extends 'optional' ? Partial<Record<K, V>> : Record<K, V>

export type PropsToObject<T extends Tuple<Validator<any, JsonRecord, Record<string, any>>>> = UnionToIntersection<ValidatorResult<T[number]>>

export type TupleFromValidator<T extends Tuple<Validator<any, any, any>>> =
  T extends [infer HEAD, ...infer Tail]
  ? HEAD extends Validator<any, any, any>
    ? Tail extends Tuple<Validator<any, any, any>>
      ? [ValidatorResult<HEAD>, ...TupleFromValidator<Tail>]
      : [ValidatorResult<HEAD>]
  : [] : []

export type TupleValidatorErrors<T extends Tuple<Validator<any, any, any>>> = UnionToIntersection<{ [K in keyof T & `${number}`] : ValidatorCustomErrors<T[K]> }[keyof T & `${number}`]>

// SECTION Error declarations

export type LiteralError = { 'is-literally': { expected: string | boolean | number }}

export type EnumError = { 'part-of-enum': { enum: Record<string, string | boolean | number> }}

// SECTION Methods

export const enumeration: <P extends string | boolean | number>(object: Record<string, P>) => Validator<EnumError, Option<Json>, P>

export const nullVal: Validator<{}, Option<Json>, null>

export const boolean: Validator<{}, Option<Json>, boolean>

export const literal: <P extends string | boolean | number>(value: P) => Validator<LiteralError, Option<Json>, P>

export const number: Validator<{}, Option<Json>, number>

export const string: Validator<{}, Option<Json>, string>

export const tuple: <P extends Tuple<Validator<Record<string, any>, Option<Json>, any>>>(validators: P) => Validator<Compute<LiteralError & TupleValidatorErrors<P>>, Option<Json>, TupleFromValidator<P>>

export const array: <V extends Validator<any, Option<Json>, any>>(validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, Option<Json>, ReadonlyArray<ValidatorResult<V>>>

export const union: <P extends Tuple<Validator<any, Option<Json>, any>>>(validators: P) => Validator<Compute<TupleValidatorErrors<P>>, Option<Json>, ValidatorResult<P[number]>>

export const undef: Validator<{}, Option<Json>, undefined>

export const prop: <V extends Validator<any, Option<Json>, any>, P extends PropType, K extends string>(type: P, key: K, validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, JsonRecord, PropToObject<P, K, ValidatorResult<V>>>

export const record: <V extends Validator<any, Option<Json>, any>>(validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, Option<Json>, Record<string, ValidatorResult<V>>>

export const exact: <P extends Tuple<Validator<any, JsonRecord, Record<string, any>>>>(props: P) => Validator<Compute<TupleValidatorErrors<P>>, Option<Json>, PropsToObject<P>>

export const type: <P extends Tuple<Validator<any, JsonRecord, Record<string, any>>>>(props: P) => Validator<Compute<TupleValidatorErrors<P>>, Option<Json>, JsonRecord & PropsToObject<P>>
