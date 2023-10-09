# Data validators library

## Installation

Run from command line

```
npm i @awerlogus/validators
```

## Usage example

```js
const DT = require('@awerlogus/validators/lib/data-type')
const ER = require('@awerlogus/validators/lib/errors')
const E = require('@awerlogus/data-types/lib/either')
const V = require('@awerlogus/validators/lib/basic')

// MODULE Type imports

/** @typedef {import('@awerlogus/data-types/lib/json').Json} Json */

/** @template {Record<string, any>} E, P, T @typedef {import('@awerlogus/validators/lib/data-type').Validator<E, P, T>} Validator */

/** @template {Validator<any, any, any>} V @typedef {import('@awerlogus/validators/lib/data-type').ValidatorErrors<V>} ValidatorErrors */

/** @template {Record<string, any>} E, T @typedef {import('@awerlogus/validators/lib/data-type').ValidationResult<E, T>} ValidationResult */

// MODULE Custom combinators example

// SECTION Type declarations

/**
 * Description of condition checking error:
 *  - The key is error tag;
 *  - The value is error details.
 *
 * Error information is easily composable using type intersection.
 */

/** @typedef {{ 'non-empty': null }} NonEmptyError */

/** @typedef {{ 'less-or-equal': { max: number } }} LessOrEqualError */

// SECTION Constants

/**
 * Every validator must return either result or array of errors.
 * Result and errors are wrapped in @awerlogus/data-types/lib/either.
 *
 * ValidationResult accepts possible custom errors and result types as parameters.
 */

/** @type {<P extends { length: number } & Json>(data: P) => ValidationResult<NonEmptyError, P>} */
const nonEmpty = data => data.length !== 0 ? E.right(data) : E.left([ER.conditionError('non-empty', null, data)])

/**
 * Validator<E, P, T> accepts value of type P and converts is to type T
 * during validation or returns one of the errors passed as E.
 *
 * Example of Validator is a validator that tries to build Date object out of
 * string that probably contains information about date. In this case E will contain an error
 * that valid date string expected, but the string passed does not fit this criteria.
 * Parameter P will be string, and T will be Date. In the case of success string will be converted into Date.
 */

/** @type {(number: number) => Validator<LessOrEqualError, number, number>} */
const leq = number => data => data <= number ? E.right(data) : E.left([ER.conditionError('less-or-equal', { max: number }, data)])

/** There may be higher order validators that accept existing validators as parameters and extend its logic. */

/** @type {<E extends Record<string, any>>(validator: Validator<E, number, number>) => <P extends { length: number } & Json>(data: P) => ValidationResult<E, P>} */
const lengthMatches = validator => data => {
  const result = validator(data.length)

  if (E.isRight(result)) { return E.right(data) }

  return E.left([ER.fieldError('length'), ...E.get(result)])
}

/** Validators are monads, so they can be chained together to define any custom logic. */

const validatePassword = DT.chain(DT.chain(V.string, nonEmpty), lengthMatches(leq(32)))

/** Mix built-in and your custom validators just like constructor details to define versatile validation logic. */

const validateOptions = V.type([
  V.prop('required', 'lock', V.boolean),
  V.prop('optional', 'password', validatePassword),
])

/** Check your data with validator. */

const data = {
  password: '',
  lock: false,
}

const result = validateOptions(data)

/** Get linearized tree with verbose error information. */

if (E.isLeft(result)) {
  /**
   *  Error: [
   *    { __tag: 'container', container: 'Object', depth: 1 },
   *    { __tag: 'field', field: 'password', depth: 1 },
   *    {
   *      __tag: 'condition',
   *      condition: 'non-empty',
   *      details: null,
   *      got: ''
   *    }
   *  ]
   */
  console.log('Error: ', E.get(result))
}

/** Use type information about validator to safely handle errors on the frontend */

/**
 * | {
 *   __tag: "not-found";
 * }
 * | {
 *   __tag: "type";
 *   expected: string;
 *   got: string;
 * }
 * | {
 *   __tag: "container";
 *   container: string;
 *   depth: number;
 * }
 * | {
 *   __tag: "field";
 *   field: string | number;
 *   depth: number;
 * }
 * | {
 *   __tag: "condition";
 *   condition: "non-empty";
 *   details: null;
 *   got: Option<Json>;
 * }
 * | {
 *   __tag: "condition";
 *   condition: "less-or-equal";
 *   details: {
 *       max: number;
 *   };
 *   got: Option<Json>;
 * }
 */

/** @typedef {ValidatorErrors<typeof validateOptions>} ValidateOptionsErrors */
```
