const E = require('@awerlogus/data-types/lib/either')
const ER = require('./errors')
const T = require('./basic')

// MODULE Type imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/data-types/lib/option').Option<T>} Option */

// MODULE Tests

// SECTION Constants

/** @type {import('./data-type').Validator<{}, Option<Json>, number>} */
const stringToLength = data => typeof data === 'string' ? E.right(data.length) : E.left([ER.typeError('string', data)])

// SECTION Tests

describe('string validator', () => {
  it('should return data if string passed', () => {
    expect(T.string('')).toStrictEqual(E.right(''))
  })

  it('should return TypeError if not string passed', () => {
    expect(T.string(1)).toStrictEqual(E.left([ER.typeError('string', 1)]))
  })
})

describe('number validator', () => {
  it('should return data if number passed', () => {
    expect(T.number(0)).toStrictEqual(E.right(0))
  })

  it('should return TypeError if not number passed', () => {
    expect(T.number('')).toStrictEqual(E.left([ER.typeError('number', '')]))
  })
})

describe('boolean validator', () => {
  it('should return data if boolean passed', () => {
    expect(T.boolean(true)).toStrictEqual(E.right(true))
  })

  it('should return TypeError if not boolean passed', () => {
    expect(T.boolean(1)).toStrictEqual(E.left([ER.typeError('boolean', 1)]))
  })
})

describe('nullVal validator', () => {
  it('should return data if null passed', () => {
    expect(T.nullVal(null)).toStrictEqual(E.right(null))
  })

  it('should return TypeError if not null passed', () => {
    expect(T.nullVal(1)).toStrictEqual(E.left([ER.typeError('null', 1)]))
  })
})

describe('undef validator', () => {
  it('should return data if undefined passed', () => {
    expect(T.undef(undefined)).toStrictEqual(E.right(undefined))
  })

  it('should return TypeError if not null passed', () => {
    expect(T.undef(1)).toStrictEqual(E.left([ER.typeError('undefined', 1)]))
  })
})

describe('literal validator', () => {
  it('should return data if the same literal passed', () => {
    expect(T.literal('123')('123')).toStrictEqual(E.right('123'))
  })

  it('should return ConditionError if not same literal passed', () => {
    expect(T.literal(123)('')).toStrictEqual(E.left([ER.conditionError('is-literally', { expected: 123 }, '')]))
    expect(T.literal(true)('')).toStrictEqual(E.left([ER.conditionError('is-literally', { expected: true }, '')]))
    expect(T.literal('123')('')).toStrictEqual(E.left([ER.conditionError('is-literally', { expected: '123' }, '')]))
  })
})

describe('array validator', () => {
  it('should return data if valid array passed', () => {
    expect(T.array(T.number)([1, 2, 3])).toStrictEqual(E.right([1, 2, 3]))
  })

  it('should return type error for non array type', () => {
    expect(T.array(T.number)(1)).toStrictEqual(E.left([ER.typeError('Array', 1)]))
  })

  it('should return array container error if elements not match type', () => {
    expect(T.array(T.number)([1, 2, true])).toStrictEqual(E.left([
      ER.containerError('Array', 1),
      ER.fieldError(2),
      ER.typeError('number', true)
    ]))
  })

  it('should return new array with elements mapped by validator passed', () => {
    expect(T.array(stringToLength)(['0', '01', '012'])).toStrictEqual(E.right([1, 2, 3]))
  })

  it('should return error if element doesn\'t match mapping validator passed', () => {
    expect(T.array(stringToLength)(['0', '01', 3])).toStrictEqual(E.left([
      ER.containerError('Array', 1),
      ER.fieldError(2),
      ER.typeError('string', 3)
    ]))
  })
})

describe('tuple validator', () => {
  it('should return data if valid tuple passed', () => {
    expect(T.tuple([T.number, T.string])([0, ''])).toStrictEqual(E.right([0, '']))
  })

  it('should return type error for non tuple type', () => {
    expect(T.tuple([T.number])(1)).toStrictEqual(E.left([ER.typeError('Tuple', 1)]))
  })

  it('should return tuple container error if elements not match types', () => {
    expect(T.tuple([T.number, T.string])([1, 2])).toStrictEqual(E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError(1),
      ER.typeError('string', 2)
    ]))

    expect(T.tuple([T.number, T.string])(['', 2])).toStrictEqual(E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError(0),
      ER.typeError('number', '')
    ]))

    expect(T.tuple([T.number, T.string])(['', ''])).toStrictEqual(E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError(0),
      ER.typeError('number', '2'),
    ]))
  })

  it('should return literal error if length doesn\'t match', () => {
    expect(T.tuple([T.number, T.string])([1, 2, 3])).toStrictEqual(E.left([
      ER.containerError('Tuple', 1),
      ER.fieldError('length'),
      ER.conditionError('is-literally', { expected: 2 }, 3),
    ]))
  })

  it('should return new tuple with elements mapped by validators passed', () => {
    expect(T.tuple([stringToLength, stringToLength, stringToLength])(['0', '01', '012'])).toStrictEqual(E.right([1, 2, 3]))
  })
})

describe('enumeration validator', () => {
  const boolEnum = { false: false, true: true }

  it('should return data if enumeration member passed', () => {
    expect(T.enumeration(boolEnum)(true)).toStrictEqual(E.right(true))
  })

  it('should return condition error if non enum member passed', () => {
    expect(T.enumeration(boolEnum)(0)).toStrictEqual(E.left([ER.conditionError('part-of-enum', { enum: boolEnum }, 0)]))
  })
})

describe('union validator', () => {
  it('should return data if any of validators passed', () => {
    expect(T.union([T.number, T.string])(0)).toStrictEqual(E.right(0))
    expect(T.union([T.number, T.string])('')).toStrictEqual(E.right(''))
  })

  it('should return container error if no validators passed', () => {
    expect(T.union([T.number, T.string])(false)).toStrictEqual(E.left([
      ER.containerError('Union', 2),
      ER.typeError('number', false),
      ER.typeError('string', false),
    ]))
  })

  it('should act as internal validator if tuple with 1 element passed', () => {
    expect(T.union([T.number])('')).toStrictEqual(E.left([ER.typeError('number', '')]))
  })
})

describe('prop validator', () => {
  it('should return empty object if object doesn\'t contain prop but validator is optional', () => {
    expect(T.prop('optional', 'foo', T.number)({ bar: 0 })).toStrictEqual(E.right({}))
  })

  it('should return error if object doesn\'t contain required prop', () => {
    expect(T.prop('required', 'foo', T.number)({ bar: 0 })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('foo'),
      ER.notFound
    ]))
  })

  it('should return error if prop exists, but not matches validator', () => {
    expect(T.prop('required', 'foo', T.number)({ foo: '' })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('foo'),
      ER.typeError('number', '')
    ]))

    expect(T.prop('optional', 'foo', T.number)({ foo: '' })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('foo'),
      ER.typeError('number', '')
    ]))
  })

  it('should return data if prop exists and matches validator', () => {
    expect(T.prop('required', 'foo', T.number)({ foo: 0 })).toStrictEqual(E.right({ foo: 0 }))
    expect(T.prop('optional', 'foo', T.number)({ foo: 0 })).toStrictEqual(E.right({ foo: 0 }))
  })
})

describe('type validator', () => {
  const foo = T.prop('required', 'a', T.number)
  const bar = T.prop('optional', 'b', T.string)

  const validator = T.type([foo, bar])

  it('should return data if each prop validator passed', () => {
    expect(validator({ a: 0, b: '' })).toStrictEqual(E.right({ a: 0, b: '' }))

    expect(validator({ a: 0 })).toStrictEqual(E.right({ a: 0 }))
  })

  it('should return TypeError if non object passed', () => {
    expect(validator(0)).toStrictEqual(E.left([ER.typeError('Object', 0)]))
    expect(validator(null)).toStrictEqual(E.left([ER.typeError('Object', null)]))
    expect(validator([0])).toStrictEqual(E.left([ER.typeError('Object', [0])]))
  })

  it('should return NotFoundError if one of fields doesn\'t exist', () => {
    expect(validator({ b: '' })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('a'),
      ER.notFound
    ]))
  })

  it('should return TypeError if field type doesn\'t match', () => {
    expect(validator({ a: 0, b: 1 })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('b'),
      ER.typeError('string', 1)
    ]))
  })

  it('should keep properties that not covered by validator', () => {
    expect(validator({ a: 0, c: 15 })).toStrictEqual(E.right({ a: 0, c: 15 }))
  })
})

describe('exact validator', () => {
  const foo = T.prop('required', 'a', T.number)
  const bar = T.prop('optional', 'b', T.string)

  const validator = T.exact([foo, bar])

  it('should return data if each prop validator passed', () => {
    expect(validator({ a: 0, b: '' })).toStrictEqual(E.right({ a: 0, b: '' }))

    expect(validator({ a: 0 })).toStrictEqual(E.right({ a: 0 }))
  })

  it('should return TypeError if non object passed', () => {
    expect(validator(0)).toStrictEqual(E.left([ER.typeError('Object', 0)]))
    expect(validator(null)).toStrictEqual(E.left([ER.typeError('Object', null)]))
    expect(validator([0])).toStrictEqual(E.left([ER.typeError('Object', [0])]))
  })

  it('should return NotFoundError if one of fields doesn\'t exist', () => {
    expect(validator({ b: '' })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('a'),
      ER.notFound,
    ]))
  })

  it('should return TypeError if field type doesn\'t match', () => {
    expect(validator({ a: 0, b: 1 })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('b'),
      ER.typeError('string', 1),
    ]))
  })

  it('should remove properties that not covered by validator', () => {
    expect(validator({ a: 0, c: 15 })).toStrictEqual(E.right({ a: 0 }))
  })
})

describe('record validator', () => {
  it('should return TypeError if non object passed', () => {
    expect(T.record(T.number)(0)).toStrictEqual(E.left([ER.typeError('Object', 0)]))
    expect(T.record(T.number)(null)).toStrictEqual(E.left([ER.typeError('Object', null)]))
    expect(T.record(T.number)([0])).toStrictEqual(E.left([ER.typeError('Object', [0])]))
  })

  it('should return container error if prop type doesn\'t match inner validator', () => {
    expect(T.record(T.number)({ a: 0, b: '' })).toStrictEqual(E.left([
      ER.containerError('Object', 1),
      ER.fieldError('b'),
      ER.typeError('number', ''),
    ]))
  })

  it('should return object back if all prop values match inner validator', () => {
    expect(T.record(T.number)({ a: 0, b: 1 })).toStrictEqual(E.right({ a: 0, b: 1 }))
  })
})
