import { Option } from '@awerlogus/data-types/lib/option'
import { Json } from '@awerlogus/data-types/lib/json'

// SECTION Types

export type Tuple<T> = ReadonlyArray<T> & { 0: T }

export type Compute<T> = T extends Function ? T : { [K in keyof T]: T[K] } & unknown

export type UnionToIntersection<U> = Compute<(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never>

// SECTION Library

export const isArray: (data: unknown) => data is ReadonlyArray<any>

export const same: <T extends string | number | boolean>(value: Option<Json>, template: T) => value is T

export const getTypeOf: (data: Option<Json>) => string

export const literalToString: (data: string | boolean | number) => string
