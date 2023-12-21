const N = require('@awerlogus/data-types/lib/nullable')
const E = require('@awerlogus/data-types/lib/either')
const O = require('@awerlogus/data-types/lib/option')
const { same, isArray } = require('./util')
const assert = require('assert')
const ER = require('./errors')

// MODULE Type imports

/** @template T @typedef {import('./util').Tuple<T>} Tuple */

/** @template T @typedef {import('./util').Compute<T>} Compute */

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @typedef {import('@awerlogus/data-types/lib/json').JsonRecord} JsonRecord */

/** @template T @typedef {import('./util').UnionToIntersection<T>} UnionToIntersection */

/** @template {Record<string, any>} E @typedef {import('./errors').ValidationError<E>} ValidationError */

/** @template {Record<string, any>} E, P, T @typedef {import('./data-type').Validator<E, P, T>} Validator */

/** @template {Validator<any, any, any>} V @typedef {import('./data-type').ValidatorResult<V>} ValidatorResult */

/** @template {Validator<any, any, any>} V @typedef {import('./data-type').ValidatorCustomErrors<V>} ValidatorCustomErrors */

// MODULE Basic validator declarations

// SECTION Type declarations

/** @typedef {'optional' | 'required'} PropType */

/**
 * @template {PropType} P
 * @template {string} K
 * @template V
 *
 * @typedef {P extends 'optional' ? Partial<Record<K, V>> : Record<K, V>} PropToObject
 */

/** @template {Tuple<Validator<any, JsonRecord, Record<string, any>>>} T @typedef {UnionToIntersection<ValidatorResult<T[number]>>} PropsToObject */

/**
 * @template {Tuple<Validator<any, any, any>>} T
 *
 * @typedef {(
 *   T extends [infer HEAD, ...infer Tail]
 *   ? HEAD extends Validator<any, any, any>
 *     ? Tail extends Tuple<Validator<any, any, any>>
 *       ? [ValidatorResult<HEAD>, ...TupleFromValidator<Tail>]
 *       : [ValidatorResult<HEAD>]
 *   : [] : []
 * )} TupleFromValidator
 */

/**
 * @template {Tuple<Validator<any, any, any>>} T
 *
 * @typedef {UnionToIntersection<{ [K in keyof T & `${number}`] : ValidatorCustomErrors<T[K]> }[keyof T & `${number}`]>} TupleValidatorErrors
 */

// SECTION Error declarations

/** @typedef {{ 'is-literally': { expected: string | boolean | number }}} LiteralError */

/** @typedef {{ 'part-of-enum': { enum: Record<string, string | boolean | number> }}} EnumError */

// SECTION Methods

/** @type {<P extends string | boolean | number>(object: Record<string, P>) => Validator<EnumError, O.Option<Json>, P>} */
const enumeration = object => data => {
  const values = Object.values(object)

  for (const value of values) {
    if (same(data, value)) {
      return E.right(value)
    }
  }

  return E.left([ER.conditionError('part-of-enum', { enum: object }, data)])
}

/** @type {Validator<{}, O.Option<Json>, null>} */
const nullVal = data => data === null ? E.right(null) : E.left([ER.typeError('null', data)])

/** @type {Validator<{}, O.Option<Json>, boolean>} */
const boolean = data => typeof data === 'boolean' ? E.right(data) : E.left([ER.typeError('boolean', data)])

/** @type {<P extends string | boolean | number>(value: P) => Validator<LiteralError, O.Option<Json>, P>} */
const literal = value => data => same(data, value) ? E.right(data) : E.left([ER.conditionError('is-literally', { expected: value }, data)])

/** @type {Validator<{}, O.Option<Json>, number>} */
const number = data => typeof data === 'number' ? E.right(data) : E.left([ER.typeError('number', data)])

/** @type {Validator<{}, O.Option<Json>, string>} */
const string = data => typeof data === 'string' ? E.right(data) : E.left([ER.typeError('string', data)])

/** @type {<P extends Tuple<Validator<Record<string, any>, O.Option<Json>, any>>>(validators: P) => Validator<Compute<LiteralError & TupleValidatorErrors<P>>, O.Option<Json>, TupleFromValidator<P>>} */
// @ts-ignore necessary
const tuple = validators => data => {
  if (!isArray(data)) {
    return E.left([ER.typeError('Tuple', data)])
  }

  const { length } = validators

  const lengthValidated = literal(length)(data.length)

  if (E.isLeft(lengthValidated)) {
    return E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError('length'),
      ...E.get(lengthValidated),
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
        ER.fieldError(i),
        ...E.get(validated),
      ])
    }

    result.push(E.get(validated))
  }

  return E.right(result)
}

/** @type {<V extends Validator<any, O.Option<Json>, any>>(validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, O.Option<Json>, ReadonlyArray<ValidatorResult<V>>>} */
// @ts-ignore necessary
const array = validator => data => {
  if (!isArray(data)) {
    return E.left([ER.typeError('Array', data)])
  }

  /** @type {Array<any>} */
  const result = []

  const { length } = data

  for (let i = 0; i < length; i += 1) {
    const elem = data[i]

    const validated = validator(elem)

    if (E.isLeft(validated)) {
      return E.left([
        ER.containerError('Array', 1),
        ER.fieldError(i),
        ...E.get(validated),
      ])
    }

    result.push(E.get(validated))
  }

  return E.right(result)
}

/** @type {<P extends Tuple<Validator<any, O.Option<Json>, any>>>(validators: P) => Validator<Compute<TupleValidatorErrors<P>>, O.Option<Json>, ValidatorResult<P[number]>>} */
// @ts-ignore necessary
const union = validators => data => {
  /** @type {Array<ReadonlyArray<ValidationError<TupleValidatorErrors<typeof validators>>>>} */
  const results = []

  for (const validator of validators) {
    const validated = validator(data)

    if (E.isRight(validated)) {
      return E.right(E.get(validated))
    }

    // @ts-ignore necessary
    results.push(E.get(validated))
  }

  if (results.length === 1) {
    return E.left(results.flat())
  }

  return E.left([ER.containerError('Union', results.length), ...results.flat()])
}

/** @type {Validator<{}, O.Option<Json>, undefined>} */
const undef = data => data === undefined ? E.right(undefined) : E.left([ER.typeError('undefined', data)])

/** @type {<V extends Validator<any, O.Option<Json>, any>, P extends PropType, K extends string>(type: P, key: K, validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, JsonRecord, PropToObject<P, K, ValidatorResult<V>>>} */
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
      ...E.get(validated)
    ])
  }

  return E.right({ [key]: E.get(validated) })
}

/** @type {<V extends Validator<any, O.Option<Json>, any>>(validator: V) => Validator<Compute<ValidatorCustomErrors<V>>, O.Option<Json>, Record<string, ValidatorResult<V>>>} */
// @ts-ignore necessary
const record = validator => data => {
  if (isArray(data) || N.isNull(data) || typeof data !== 'object') {
    return E.left([ER.typeError('Object', data)])
  }

  /** @typedef {ValidatorResult<typeof validator>} V */

  /** @type {Record<string, V>} */
  const result = {}

  for (const [key, value] of Object.entries(data)) {
    const validated = validator(value)

    if (E.isLeft(validated)) {
      return E.left([
        ER.containerError('Object', 1),
        ER.fieldError(key),
        ...E.get(validated)
      ])
    }

    result[key] = E.get(validated)
  }

  return E.right(result)
}

/** @type {<P extends Tuple<Validator<any, JsonRecord, Record<string, any>>>>(props: P) => Validator<Compute<TupleValidatorErrors<P>>, O.Option<Json>, PropsToObject<P>>} */
// @ts-ignore necessary
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

    result.push(E.get(res))
  }

  return E.right(Object.assign({}, ...result))
}

/** @type {<P extends Tuple<Validator<any, JsonRecord, Record<string, any>>>>(props: P) => Validator<Compute<TupleValidatorErrors<P>>, O.Option<Json>, JsonRecord & PropsToObject<P>>} */
// @ts-ignore necessary
const type = props => data => {
  if (isArray(data) || N.isNull(data) || typeof data !== 'object') {
    return E.left([ER.typeError('Object', data)])
  }

  /** @type {Array<Record<string, any>>}} */
  const result = []

  for (const _prop of props) {
    const validated = _prop(data)

    if (E.isLeft(validated)) {
      return validated
    }

    result.push(E.get(validated))
  }

  return E.right(Object.assign({}, data, ...result))
}

// MODULE Exports

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
