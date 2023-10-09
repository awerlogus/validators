const E = require('@awerlogus/data-types/lib/either')
const { chain, map } = require('./data-type')
const ER = require('./errors')
const T = require('./basic')

// SECTION Types

/** @template {Record<string, any>} E, T @typedef {import('../lib/data-type').ValidationResult<E, T>} ValidationResult */

// SECTION utils

/** @type {(string: string) => number} */
function length (string) { return string.length }

/** @type {<T extends { length: number }>(container: T) => ValidationResult<{ 'non-empty': null }, T>} */
const nonEmpty = container => container.length === 0 ? E.left([ER.conditionError('non-empty', null, container)]) : E.right(container)

// SECTION Tests

describe('map function', () => {
  it('should return mapped value if validator passed', () => {
    expect(map(T.string, length)('01234')).toStrictEqual(E.right(5))
  })

  it('should return error if validator doesn\'t passed', () => {
    expect(map(T.string, length)(0)).toStrictEqual(E.left([ER.typeError('string', 0)]))
  })
})

describe('chain function', () => {
  it('should return data if it matches both validators', () => {
    expect(chain(T.array(T.number), nonEmpty)([0])).toStrictEqual(E.right([0]))
  })

  it('should apply main validator checks first', () => {
    expect(chain(T.array(T.number), nonEmpty)(3)).toStrictEqual(E.left([ER.typeError('Array', 3)]))

    expect(chain(T.array(T.number), nonEmpty)([''])).toStrictEqual(E.left([
      ER.containerError('Array', 1),
      ER.fieldError(0),
      ER.typeError('number', '')
    ]))
  })

  it('should return error if data matches validator, but not extension', () => {
    expect(chain(T.array(T.number), nonEmpty)([])).toStrictEqual(E.left([ER.conditionError('non-empty', null, [])]))
  })
})
