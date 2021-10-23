const { same, getTypeOf, literalToString } = require('./util')

// SECTION Library

/** @type {(number: number) => number} */
const add1 = number => number + 1

/** @type {(number: number) => boolean} */
const geq5 = number => number >= 5

// SECTION Tests

describe('add1 function', () => {
  it('should add 1 to number', () => {
    expect(add1(0)).toBe(1)
    expect(add1(1)).toBe(2)
  })
})

describe('geq5 function', () => {
  it('should check if number is greater or less than 5', () => {
    expect(geq5(4)).toBe(false)
    expect(geq5(5)).toBe(true)
    expect(geq5(6)).toBe(true)
  })
})

describe('same function', () => {
  it('should return true if literals are equal', () => {
    expect(same(1, 1)).toBe(true)
    expect(same('1', '1')).toBe(true)
    expect(same(true, true)).toBe(true)
  })

  it('should return false if literals are non equal', () => {
    expect(same(0, 1)).toBe(false)
    expect(same(1, 0)).toBe(false)
    expect(same('0', '1')).toBe(false)
    expect(same('1', '0')).toBe(false)
    expect(same(false, true)).toBe(false)
    expect(same(true, false)).toBe(false)
  })
})

describe('getTypeOf function', () => {
  it('should return valid type of all data', () => {
    expect(getTypeOf(true)).toBe('boolean')
    expect(getTypeOf(1)).toBe('number')
    expect(getTypeOf('1')).toBe('string')
    expect(getTypeOf(null)).toBe('null')
    expect(getTypeOf(undefined)).toBe('undefined')
    expect(getTypeOf({ a: 0 })).toBe('Object')
    expect(getTypeOf([0])).toBe('Array')
  })
})

describe('toString function', () => {
  it('should wrap string values to quotes', () => {
    expect(literalToString('asd')).toBe('\'asd\'')
  })

  it('should convert basic types to string', () => {
    expect(literalToString(1)).toBe('1')
    expect(literalToString(true)).toBe('true')
  })
})
