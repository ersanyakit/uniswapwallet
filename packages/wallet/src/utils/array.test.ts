import { differenceWith, next } from 'wallet/src/utils/array'

it('returns undefined for empty arrays', () => {
  expect(next([], '123')).toBe(undefined)
})

it('returns the next element', () => {
  expect(next([1, 2, 3], 1)).toEqual(2)
})

it('handles wrapping around', () => {
  expect(next([1, 2, 3], 3)).toEqual(1)
})

it('returns undefined whenelement not found', () => {
  expect(next([1, 2, 3], 4)).toBe(undefined)
})

it('calculates difference correctly', () => {
  const result = differenceWith([1, 2], [2, 4], (a, b) => a === b)
  expect(result.length).toEqual(1)
  expect(result[0]).toBe(1)

  const emptyResult = differenceWith([1, 2], [1, 2], (a, b) => a === b)
  expect(emptyResult.length).toEqual(0)

  const sameResult = differenceWith([1, 2], [3, 4], (a, b) => a === b)
  expect(sameResult.length).toEqual(2)
  expect(sameResult[0]).toBe(1)
  expect(sameResult[1]).toBe(2)
})
