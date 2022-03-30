const { same, literalToString, isArray } = require('./util')
const N = require('@awerlogus/data-types/lib/nullable')
const E = require('@awerlogus/data-types/lib/either')
const O = require('@awerlogus/data-types/lib/option')
const assert = require('assert')
const ER = require('./errors')

// SECTION Types

// MODULE Imports

/** @template T @typedef {import('./util').Tuple<T>} Tuple */

/** @typedef {import('./errors').ValidateError} ValidateError */

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('../lib/util').Compute<T>} Compute */

/** @typedef {import('@awerlogus/data-types/lib/json').JsonRecord} JsonRecord */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

/** @template T @typedef {import('../lib/util').UnionToIntersection<T>} UnionToIntersection */

/** @template E, R @typedef {import('@awerlogus/data-types/lib/either').Either<E, R>} Either */

// MODULE Declarations

/** @typedef {'optional' | 'required'} PropType */

/** @template T @typedef {ValidatorExtension<Option<Json>, T>} Validator */

/** @template P, T @typedef {(data: P) => ValidationResult<T>} ValidatorExtension */

/** @template T @typedef {Either<ReadonlyArray<ValidateError>, T>} ValidationResult */

/**
 * @template {PropType} P
 * @template {string} K
 * @template T
 *
 * @typedef {P extends 'optional' ? { [KEY in K]?: T } : { [KEY in K]: T }} PropToObject
 */

/** @template {ValidatorExtension<any, any>} V @typedef {V extends ValidatorExtension<any, infer T> ? T : never} ValidatorContent */

/** @template {Tuple<ValidatorExtension<Record<string, Json>, Record<string, any>>>} T @typedef {UnionToIntersection<ValidatorContent<T[number]>>} PropsToObject */

/**
 * @template {Tuple<Validator<any>>} T
 *
 * @typedef {(
 *   T extends [infer HEAD, ...infer Tail]
 *   ? HEAD extends Validator<any>
 *     ? Tail extends Tuple<Validator<any>>
 *       ? [ValidatorContent<HEAD>, ...TupleFromValidator<Tail>]
 *       : [ValidatorContent<HEAD>]
 *   : [] : []
 * )} TupleFromValidator
 */

// SECTION Library

/** @type {<P extends string | boolean | number>(object: Record<string, P>) => Validator<P>} */
const enumeration = object => data => {
  const values = Object.values(object)

  for (const value of values) {
    if (same(data, value)) {
      return E.right(value)
    }
  }

  return E.left([ER.conditionError(`exists in [${values}]`, data)])
}

/** @type {Validator<null>} */
const nullVal = data => data === null ? E.right(null) : E.left([ER.typeError('null', data)])

/** @type {Validator<boolean>} */
const boolean = data => typeof data === 'boolean' ? E.right(data) : E.left([ER.typeError('boolean', data)])

/** @type {<P extends string | boolean | number>(value: P) => Validator<P>} */
const literal = value => data => same(data, value) ? E.right(data) : E.left([ER.conditionError(`equals ${literalToString(value)}`, data)])

/** @type {Validator<number>} */
const number = data => typeof data === 'number' ? E.right(data) : E.left([ER.typeError('number', data)])

/** @type {Validator<string>} */
const string = data => typeof data === 'string' ? E.right(data) : E.left([ER.typeError('string', data)])

/** @type {<P extends Tuple<Validator<any>>>(validators: P) => Validator<TupleFromValidator<P>>} */
// @ts-ignore necessary
const tuple = validators => data => {
  if (!Array.isArray(data)) {
    return E.left([ER.typeError('Tuple', data)])
  }

  const { length } = validators

  const lengthValidated = literal(length)(data.length)

  if (E.isLeft(lengthValidated)) {
    return E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError('length'),
      ...lengthValidated[1]
    ])
  }

  /** @type {Array<any>} */
  const result = []

  for (let i = 0; i < length; i += 1) {
    const validator = validators[i]

    assert(O.isSome(validator))

    const validated = validator(data[i])

    if (E.isLeft(validated)) {
      return E.left([
        ER.containerError('Tuple', 1),
        ER.fieldError(String(i)),
        ...validated[1],
      ])
    }

    result.push(validated[1])
  }

  return E.right(result)
}

/** @type {<P>(validator: Validator<P>) => Validator<ReadonlyArray<P>>} */
const array = validator => data => {
  if (!Array.isArray(data)) {
    return E.left([ER.typeError('Array', data)])
  }

  /** @type {Array<any>} */
  const result = []

  for (const elem of data) {
    const validated = validator(elem)

    if (E.isLeft(validated)) {
      return E.left([
        ER.containerError('Array', 1),
        ...validated[1],
      ])
    }

    result.push(validated[1])
  }

  return E.right(result)
}

/** @type {<P extends Tuple<Validator<any>>>(validators: P) => Validator<ValidatorContent<P[number]>>} */
const union = validators => data => {
  /** @type {Array<ReadonlyArray<ValidateError>>} */
  const results = []

  for (const validator of validators) {
    const validated = validator(data)

    if (E.isRight(validated)) {
      return E.right(validated[1])
    }

    results.push(validated[1])
  }

  if (results.length === 1) {
    return E.left(results.flat())
  }

  return E.left([ER.containerError('Union', results.length), ...results.flat()])
}

/** @type {Validator<undefined>} */
const undef = data => data === undefined ? E.right(undefined) : E.left([ER.typeError('undefined', data)])

/** @type {<P extends PropType, K extends string, R>(type: P, key: K, validator: Validator<R>) => ValidatorExtension<JsonRecord, PropToObject<P, K, R>>} */
// @ts-ignore necessary
const prop = (type, key, validator) => data => {
  if (!(key in data)) {
    if (type === 'optional') {
      return E.right({})
    }

    return E.left([
      ER.containerError('Object', 1),
      ER.fieldError(key),
      ER.notFound
    ])
  }

  const validated = validator(data[key])

  if (E.isLeft(validated)) {
    return E.left([
      ER.containerError('Object', 1),
      ER.fieldError(key),
      ...validated[1]
    ])
  }

  return E.right({ [key]: validated[1] })
}

/** @type {<V>(validator: Validator<V>) => Validator<Record<string, V>>} */
const record = validator => data => {
  if (isArray(data) || N.isNull(data) || typeof data !== 'object') {
    return E.left([ER.typeError('Object', data)])
  }

  /** @typedef {ValidatorContent<typeof validator>} V */

  /** @type {Record<string, V>} */
  const result = {}

  for (const [key, value] of Object.entries(data)) {
    const validated = validator(value)

    if (E.isLeft(validated)) {
      return E.left([
        ER.containerError('Object', 1),
        ER.fieldError(key),
        ...validated[1]
      ])
    }

    result[key] = validated[1]
  }

  return E.right(result)
}

/** @type {<P extends Tuple<ValidatorExtension<JsonRecord, Record<string, any>>>>(props: P) => Validator<PropsToObject<P>>} */
const exact = props => data => {
  if (isArray(data) || N.isNull(data) || typeof data !== 'object') {
    return E.left([ER.typeError('Object', data)])
  }

  /** @type {Array<Record<string, any>>}} */
  const result = []

  for (const p of props) {
    const res = p(data)

    if (E.isLeft(res)) {
      return res
    }

    result.push(res[1])
  }

  return E.right(Object.assign({}, ...result))
}

/** @type {<P extends Tuple<ValidatorExtension<JsonRecord, Record<string, any>>>>(props: P) => Validator<JsonRecord & PropsToObject<P>>} */
const type = props => data => {
  if (isArray(data) || N.isNull(data) || typeof data !== 'object') {
    return E.left([ER.typeError('Object', data)])
  }

  /** @type {Array<Record<string, any>>}} */
  const result = []

  for (const p of props) {
    const res = p(data)

    if (E.isLeft(res)) {
      return res
    }

    result.push(res[1])
  }

  return E.right(Object.assign(data, ...result))
}

// SECTION Exports

module.exports = {
  enumeration,
  nullVal,
  boolean,
  literal,
  record,
  number,
  string,
  tuple,
  array,
  union,
  undef,
  exact,
  prop,
  type,
}
