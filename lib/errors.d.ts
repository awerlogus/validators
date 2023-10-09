import type { Option } from '@awerlogus/data-types/lib/option'
import type { Json } from '@awerlogus/data-types/lib/json'

// SECTION Types

type ValidationError<C extends Record<string, any>> = (
  | { __tag: 'not-found' }
  | { __tag: 'type', expected: string, got: string }
  | { __tag: 'container', container: string, depth: number }
  | { __tag: 'field', field: string | number, depth: number }
  | { [K in keyof C]: { __tag: 'condition', condition: K, details: C[K], got: Option<Json> } }[keyof C]
)

// SECTION Constants

export const notFound: ValidationError<{}>

export const fieldError: (field: string | number) => ValidationError<{}>

export const containerError: (container: string, depth: number) => ValidationError<{}>

export const typeError: (expected: string, data: Option<Json>) => ValidationError<{}>

export const conditionError: <const T extends string, const D>(condition: T, details: D, got: Option<Json>) => ValidationError<Record<T, D>>
