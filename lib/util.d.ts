import { Option } from '@awerlogus/data-types/lib/option'
import { Json } from '@awerlogus/data-types/lib/json'

// SECTION Types

export type Tuple<T> = (ReadonlyArray<T> & { readonly 0: T }) | readonly []

export type Compute<T> = T extends Function ? T : { [K in keyof T]: T[K] } & unknown

export type UnionToIntersection<T> = Compute<(T extends any ? (k: T) => void : never) extends ((k: infer I) => void) ? I : never>

// SECTION Constants

export const isArray: (data: unknown) => data is ReadonlyArray<unknown>

export const same: <T extends string | number | boolean>(value: Option<Json>, template: T) => value is T

export const getTypeOf: (data: Option<Json>) => string
