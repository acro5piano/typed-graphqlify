import { graphqlify, types, optional } from './index'
// import { GraphQLData } from './index'
import { gql } from './test-utils'

describe('graphqlify', () => {
  it('render GraphQL', () => {
    const queryObject = {
      getUser: {
        user: {
          __alias: 'maleUser',
          __params: { id: 1 },
          id: types.number,
          name: types.string,
          bankAccount: {
            id: types.number,
            branch: types.string,
          },
        },
      },
    }

    const actual = graphqlify.query(queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        maleUser: user(id: 1) {
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
      getUser: {
        user: {
          id: types.number,
        },
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUser: {
        user: {
          student: {
            mother: {
              father: {
                id: types.number,
              },
            },
          },
        },
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUser: {
        user: {
          id: types.number,
        },
        bankAccount: {
          id: types.number,
        },
      },
    }

    const actual = graphqlify.query(queryObject)

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
      getUser: {
        user: {
          __params: { id: 1 },
          id: types.number,
        },
        bankAccount: {
          __params: { id: 2 },
          id: types.number,
        },
      },
    }
    const actual = graphqlify.query(queryObject)

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

  it('render operation params', () => {
    const queryObject = {
      getUser: {
        __params: { $id: 'Number' },
        user: {
          __params: { id: 1 },
          id: types.number,
        },
        bankAccount: {
          __params: { id: 2 },
          id: types.number,
        },
      },
    }
    const actual = graphqlify.query(queryObject)

    expect(actual).toEqual(gql`
      query getUser($id: Number) {
        user(id: 1) {
          id
        }
        bankAccount(id: 2) {
          id
        }
      }
    `)
  })

  it('render mutation', () => {
    const queryObject = {
      updateUser: {
        __params: { $name: 'String!' },
        updateUser: {
          __params: { name: '$name' },
          id: types.number,
        },
      },
    }
    const actual = graphqlify.mutation(queryObject)

    expect(actual).toEqual(gql`
      mutation updateUser($name: String!) {
        updateUser(name: $name) {
          id
        }
      }
    `)
  })

  it('render optional field', () => {
    const queryObject = {
      getUser: {
        user: optional({
          id: types.optional.number,
        }),
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUsers: {
        users: [
          {
            id: types.number,
          },
        ],
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUsers: {
        users: {
          id: types.number,
          __typename: types.constant('User'),
        },
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUsers: {
        __params: { $status: 'String!' },
        users: [
          {
            __params: { status: '$status' },
            id: types.number,
          },
        ],
      },
    }
    const actual = graphqlify.query(queryObject)

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
      getUser: {
        user: {
          id: types.number,
          type: types.oneOf(UserType),
        },
      },
    }
    const actual = graphqlify.query(queryObject)

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
