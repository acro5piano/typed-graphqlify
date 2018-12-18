import { QueryOpertaion, Query, Field, Result } from './src'

// This is mock api, should be Apollo or Relay
// returns `any` as usual
const executeGraphql = (q: any): any => q

// Define Fields
class BankAccount extends Field {
  id = Field.number
  branch = Field.string
}

class UserField extends Field {
  id = Field.number
  name = Field.string
  isActive = Field.boolean
  bankAccount = Field.of(BankAccount)
}

// Define Query
class UserQuery extends Query {
  name = 'user'
  field = UserField
}

// Define Operation
class GetUserOperation extends QueryOpertaion {
  name = 'getUser'
  query = UserQuery
}

// Create renderer operation instance
const getUserOperation = new GetUserOperation()

// `gqlString` is a plain string, so feel free to tag it
const gqlString = getUserOperation.render()

console.log(gqlString)
// =>
//   query getUser {
//     user {
//       id
//       name
//       isActive
//       bankAccount {
//         id
//         name
//       }
//     }
//   }

// We would like to type this!
const result: Result<GetUserOperation> = executeGraphql(gqlString)

// Now, `result` type looks like this:
// interface result {
//   user: {
//     id: number
//     name: string
//     isActive: boolean
//     bankAccount: {
//       id: number
//       name: string
//     }
//   }
// }
console.log(result)
