# Data validators library

## Installation

Run from command line

```
npm i @awerlogus/validators
```

## Usage example

### Define your own validators

```js
const DT = require('@awerlogus/validators/lib/data-type')
const ER = require('@awerlogus/validators/lib/errors')
const E = require('@awerlogus/data-types/lib/either')
const V = require('@awerlogus/validators/lib/basic')

// SECTION Types

// MODULE Imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template T @typedef {import('@awerlogus/validators/lib/basic').ValidationResult<T>} ValidationResult */

/** @template P, R @typedef {import('@awerlogus/validators/lib/basic').ValidatorExtension<P, R>} ValidatorExtension */

// SECTION Constants

// MODULE custom combinators

/** @type {<P extends { length: number } & Json>(data: P) => ValidationResult<P>} */
const nonEmpty = data => data.length !== 0 ? E.right(data) : E.left([ER.conditionError('non empty', data)])

/** @type {(validator: ValidatorExtension<number, number>) => <P extends { length: number } & Json>(data: P) => ValidationResult<P>} */
const lengthMatches = validator => data => {
  const result = validator(data.length)

  if (E.isRight(result)) { return E.right(data) }

  return E.left([ER.fieldError('length'), ...result[1]])
}

/** @type {(number: number) => <N extends number>(data: N) => ValidationResult<N>} */
const leq = number => data => data <= number ? E.right(data) : E.left([ER.conditionError(`less or equal to ${number}`, data)])
```

### Combine your and bundled validators into models

```js
const validatePassword = DT.chain(DT.chain(V.string, nonEmpty), lengthMatches(leq(32)))

const validateOptions = V.type([
  V.prop('required', 'lock', V.boolean),
  V.prop('optional', 'password', validatePassword),
])
```

### Get readable errors out of box

```js
const data = {
  password: '',
  lock: false,
}

const result = validateOptions(data)

if (E.isLeft(result)) {
  // Error:  [
  //   { __tag: 'container', container: 'Object', children: 1 },
  //   { __tag: 'field', field: 'password', children: 1 },
  //   { __tag: 'condition', condition: 'non empty', value: '' },
  // ]
  console.log('Error: ', result[1])
}
```
