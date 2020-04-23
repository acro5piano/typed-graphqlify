import { params, query } from '../index'

test('graphqlify properly throw errors on invalid input', () => {
  expect(() => (query as any)('EmptyQuery')).toThrow()
  expect(() => query({})).toThrow()
  expect(() => query('Empty', {})).toThrow()
  expect(() => query('Empty', { hero: {} })).toThrow()
  expect(() => query('Empty', { hero: [] })).toThrow()
  expect(() => query('DirectTypes', { hero: { str: 'string' } })).toThrow()
  expect(() => query('DirectTypes', { hero: { int: 4 } })).toThrow()
  expect(() => query('DirectTypes', { hero: { float: 3.14 } })).toThrow()
  expect(() => query('DirectTypes', { hero: { bool: true } })).toThrow()
  expect(() => query('BadValue', { hero: { prop: null } })).toThrow()
  expect(() => query('BadValue', { hero: { prop() {} } })).toThrow()
  expect(() => params('str' as any, {})).toThrow()
  expect(() => params({}, 'str' as any)).toThrow()
})
