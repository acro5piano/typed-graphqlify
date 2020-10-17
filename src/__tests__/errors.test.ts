import { params, query } from '../index'

test('graphqlify properly throw errors on invalid input', () => {
  // @ts-expect-error
  expect(() => query('EmptyQuery')).toThrow()
  expect(() => query({}).toString()).toThrow()
  expect(() => query('Empty', {}).toString()).toThrow()
  expect(() => query('Empty', { hero: {} }).toString()).toThrow()
  expect(() => query('Empty', { hero: [] }).toString()).toThrow()
  expect(() => query('DirectTypes', { hero: { str: 'string' } }).toString()).toThrow()
  expect(() => query('DirectTypes', { hero: { int: 4 } }).toString()).toThrow()
  expect(() => query('DirectTypes', { hero: { float: 3.14 } }).toString()).toThrow()
  expect(() => query('DirectTypes', { hero: { bool: true } }).toString()).toThrow()
  expect(() => query('BadValue', { hero: { prop: null } }).toString()).toThrow()
  expect(() => query('BadValue', { hero: { prop() {} } }).toString()).toThrow()
  expect(() => params('str' as any, {}).toString()).toThrow()
  expect(() => params({}, 'str' as any).toString()).toThrow()
})
