/* tslint:disable */

import { params, query, types } from 'typed-graphqlify'

async function executeGraphql(gqlString: string): Promise<any> {
  return 0
}

const getUserQuery = {
  getUser: {
    user: params(
      { id: 1 },
      {
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    ),
  },
}

const gqlString = query(getUserQuery)

console.log(gqlString)
// =>
//   query getUser(id: 1) {
//     user {
//       id
//       name
//       bankAccount {
//         id
//         name
//       }
//     }
//   }

async function run() {
  // We would like to type this!
  const result: typeof getUserQuery = await executeGraphql(query(getUserQuery))

  // As we cast `result` to `typeof getUser`,
  // Now, `result` type looks like this:
  // interface result {
  //   getUser: {
  //     id: number
  //     name: string
  //     bankAccount: {
  //       id: number
  //       branch: string
  //     }
  //   }
  // }
}

run()
