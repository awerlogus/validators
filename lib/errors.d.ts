import { Option } from '@awerlogus/data-types/lib/option'
import { Json } from '@awerlogus/data-types/lib/json'

// SECTION Types

/** Error represents case when something not found */
export type NotFoundError = { __tag: 'not-found' }

/** Error represents case when there's something wrong in object field */
export type FieldError = { __tag: 'field', field: string }

/** Error represents type mismatch */
export type TypeError = { __tag: 'type', expected: string, got: string }

/** Error represents case when there's something wrong in container */
export type ContainerError = { __tag: 'container', container: string, children: number }

/** Error represents case when some condition is not met */
export type ConditionError = { __tag: 'condition', condition: string, value: Option<Json> }

/** Error union */
export type ValidateError = NotFoundError | TypeError | FieldError | ConditionError | ContainerError

// SECTION Library

/** NotFoundError instance */
export const notFound: ValidateError

/** Builds FieldError instance for field */
export const fieldError: (field: string) => ValidateError

/** Builds TypeError instance for expected type and data passed */
export const typeError: (expected: string, data: Option<Json>) => ValidateError

/** Builds ContainerError for container and children passed */
export const containerError: (container: string, children: number) => ValidateError

/** Builds ConditionError for condition and value passed */
export const conditionError: (condition: string, value: Option<Json>) => ValidateError
