import { graphqlify, types, optional, params, $ } from './index'
// import { GraphQLData } from './index'
import { gql } from './test-utils'

describe('graphqlify', () => {
  it('render GraphQL', () => {
    const queryObject = {
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
    }

    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user(id: 1) {
          id
          name
          bankAccount {
            id
            branch
          }
        }
      }
    `)
  })

  it('render no params GraphQL', () => {
    const queryObject = {
      user: {
        id: types.number,
      },
    }
    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
        }
      }
    `)
  })

  it('render very deep GraphQL', () => {
    const queryObject = {
      user: {
        student: {
          mother: {
            father: {
              id: types.number,
            },
          },
        },
      },
    }
    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user {
          student {
            mother {
              father {
                id
              }
            }
          }
        }
      }
    `)
  })

  it('render multiple GraphQL', () => {
    const queryObject = {
      user: {
        id: types.number,
      },
      bankAccount: {
        id: types.number,
      },
    }

    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
        }
        bankAccount {
          id
        }
      }
    `)
  })

  it('render multiple GraphQL and params', () => {
    const queryObject = {
      user: params(
        {
          id: 1,
        },
        {
          id: types.number,
        },
      ),
      bankAccount: params(
        {
          id: 2,
        },
        {
          id: types.number,
        },
      ),
    }
    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user(id: 1) {
          id
        }
        bankAccount(id: 2) {
          id
        }
      }
    `)
  })

  it('render inline operation params', () => {
    const queryObject = {
      user: params(
        { id: 1 },
        {
          id: types.number,
        },
      ),
      bankAccount: params(
        { id: 2 },
        {
          id: types.number,
        },
      ),
    }
    const query = graphqlify.query(queryObject)

    expect(query).toEqual(gql`
      query {
        user(id: 1) {
          id
        }
        bankAccount(id: 2) {
          id
        }
      }
    `)
  })

  it('render variable param and name it the same', () => {
    const query = graphqlify.query(
      {
        user: params(
          { id: optional(types.number) },
          {
            id: types.number,
          },
        ),
      },
      'getUserById',
    )

    expect(query).toEqual(gql`
      query getUserById($id: Number) {
        user(id: $id) {
          id
        }
      }
    `)
  })

  it('render variable params with an alias', () => {
    // const paramsObject = {
    //   userId: types.number,
    //   bankAccountId: types.number
    // }

    const queryObject = {
      user: params(
        { id: $('userId', optional(types.number)) },
        {
          id: types.number,
        },
      ),
      bankAccount: params(
        { id: optional(types.number) },
        {
          id: types.number,
        },
      ),
    }
    const actual = graphqlify.query(queryObject, 'getUserAndBankAccount')

    expect(actual).toEqual(gql`
      query getUserAndBankAccount($userId: Number, $id: Number) {
        user(id: $userId) {
          id
        }
        bankAccount(id: $id) {
          id
        }
      }
    `)
  })

  it('render mutation', () => {
    const queryObject = {
      updateUser: params(
        { name: types.string },
        {
          id: types.number,
        },
      ),
    }
    const actual = graphqlify.mutation(queryObject, 'updateUser')

    expect(actual).toEqual(gql`
      mutation updateUser($name: String!) {
        updateUser(name: $name) {
          id
        }
      }
    `)
  })

  it.skip('render mutation with custom type name', () => {
    const queryObject = {
      updateUser: params(
        { input: types.raw('UserInput') },
        {
          id: types.number,
        },
      ),
    }
    const actual = graphqlify.mutation(queryObject, 'updateUser')

    expect(actual).toEqual(gql`
      mutation updateUser($input: UserInput) {
        updateUser(name: $name) {
          id
        }
      }
    `)
  })

  it('render optional field', () => {
    const queryObject = {
      user: optional({
        id: types.number,
      }),
    }
    const actual = graphqlify.query(queryObject, 'getUser')

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
        }
      }
    `)
  })

  it('render array field', () => {
    const queryObject = {
      users: [
        {
          id: types.number,
        },
      ],
    }
    const actual = graphqlify.query(queryObject, 'getUsers')

    expect(actual).toEqual(gql`
      query getUsers {
        users {
          id
        }
      }
    `)
  })

  it('render __typename itself', () => {
    const queryObject = {
      users: {
        id: types.number,
        __typename: types.constant('User'),
      },
    }
    const actual = graphqlify.query(queryObject, 'getUsers')

    // just type check
    // const a: GraphQLData<typeof queryObject> = {
    //   users: {
    //     id: 1,
    //     __typename: 'User',
    //   },
    // }

    expect(actual).toEqual(gql`
      query getUsers {
        users {
          id
          __typename
        }
      }
    `)
  })

  it('render parameters when array', () => {
    const queryObject = {
      users: params({ status: types.string }, [
        {
          id: types.number,
        },
      ]),
    }
    const actual = graphqlify.query(queryObject, 'getUsers')

    expect(actual).toEqual(gql`
      query getUsers($status: String!) {
        users(status: $status) {
          id
        }
      }
    `)
  })

  it('render enum', () => {
    enum UserType {
      'Student',
      'Teacher',
    }

    const queryObject = {
      user: {
        id: types.number,
        type: types.oneOf(UserType),
      },
    }
    const actual = graphqlify.query(queryObject, 'getUser')

    // just type check
    // const a: GraphQLData<typeof queryObject> = {
    //   user: {
    //     id: 1,
    //     type: 'foo',
    //   },
    // }

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
          type
        }
      }
    `)
  })
})
