/*
 * TypeScript 4.1
 */

const hello = `hello`
type QueryBuilder<Schema, Query> = Query extends `{ ${typeof hello} }` ? { hello: string } : never

const schema = `type Query { hello: String! }`
const query = `{ hello }`
const queryFail = `{ foo }`

const a: QueryBuilder<typeof schema, typeof query> // => { hello }
const b: QueryBuilder<typeof schema, typeof queryFail> // => never

// expectType<QueryBuilder<typeof schema, typeof query>>({
//   hello: 'string',
// })
// expectError<QueryBuilder<typeof schema, typeof queryFail>>({
//   hello: 'string',
// })
