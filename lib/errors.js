const { getTypeOf } = require('./util')

// SECTION Types

// MODULE Imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

// MODULE Declarations

/** @typedef {{ __tag: 'not-found' }} NotFoundError */

/** @typedef {{ __tag: 'type', expected: string, got: string }} TypeError */

/** @typedef {{ __tag: 'field', field: string, children: number }} FieldError */

/** @typedef {{ __tag: 'container', container: string, children: number }} ContainerError */

/** @typedef {{ __tag: 'condition', condition: string, value: Option<Json> }} ConditionError */

/** @typedef {NotFoundError | TypeError | FieldError | ConditionError | ContainerError} ValidateError */

// SECTION Constants

/** @type {NotFoundError['__tag']} */
const notFoundTag = 'not-found'

/** @type {FieldError['__tag']} */
const fieldTag = 'field'

/** @type {TypeError['__tag']} */
const typeTag = 'type'

/** @type {ConditionError['__tag']} */
const conditionTag = 'condition'

/** @type {ContainerError['__tag']} */
const containerTag = 'container'

// SECTION Library

/** @type {ValidateError} */
const notFound = { __tag: notFoundTag }

/** @type {(field: string) => ValidateError} */
const fieldError = field => ({ __tag: fieldTag, field, children: 1 })

/** @type {(condition: string, value: Option<Json>) => ValidateError} */
const conditionError = (condition, value) => ({ __tag: conditionTag, condition, value })

/** @type {(expected: string, data: Option<Json>) => ValidateError} */
const typeError = (expected, data) => ({ __tag: typeTag, expected, got: getTypeOf(data) })

/** @type {(container: string, children: number) => ValidateError} */
const containerError = (container, children) => ({ __tag: containerTag, container, children })

// SECTION Exports

module.exports = { notFound, fieldError, conditionError, typeError, containerError }
