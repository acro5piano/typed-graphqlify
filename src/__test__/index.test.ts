import { graphqlify, types, optional, alias } from '../index'
import { gql } from './test-utils'

describe('graphqlify', () => {
  it('render GraphQL', () => {
    const queryObject = {
      user: {
        __params: { id: 1 },
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    }

    const actual = graphqlify.query(queryObject)

    expect(actual).toEqual(gql`
      query {
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

  it('render GraphQL alias', () => {
    const queryObject = {
      [alias('maleUser', 'user')]: {
        __params: { id: 1 },
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    }

    const actual = graphqlify.query(queryObject)

    expect(actual).toEqual(gql`
      query {
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

  it('render GraphQL with operateName', () => {
    const queryObject = {
      user: {
        __params: { id: 1 },
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    }

    const actual = graphqlify.query('user', queryObject)

    expect(actual).toEqual(gql`
      query user {
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
    const actual = graphqlify.query('getUser', queryObject)

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
    const actual = graphqlify.query('getUser', queryObject)

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

    const actual = graphqlify.query('getUser', queryObject)

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
      user: {
        __params: { id: 1 },
        id: types.number,
      },
      bankAccount: {
        __params: { id: 2 },
        id: types.number,
      },
    }
    const actual = graphqlify.query('getUser', queryObject)

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
      __params: { $id: 'Int!' },
      user: {
        __params: { id: 1 },
        id: types.number,
      },
      bankAccount: {
        __params: { id: 2 },
        id: types.number,
      },
    }
    const actual = graphqlify.query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser($id: Int!) {
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
      __params: { $name: 'String!' },
      updateUser: {
        __params: { name: '$name' },
        id: types.number,
      },
    }
    const actual = graphqlify.mutation('updateUserMutation', queryObject)

    expect(actual).toEqual(gql`
      mutation updateUserMutation($name: String!) {
        updateUser(name: $name) {
          id
        }
      }
    `)
  })

  it('render optional field', () => {
    const queryObject = {
      user: optional({
        id: types.optional.number,
      }),
    }
    const actual = graphqlify.query('getUser', queryObject)

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
    const actual = graphqlify.query('getUsers', queryObject)

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
    const actual = graphqlify.query('getUsers', queryObject)

    expect(actual).toEqual(gql`
      query getUsers {
        users {
          id
          __typename
        }
      }
    `)
  })

  it('render custom scalar property', () => {
    interface CustomField {
      id: number
    }

    const queryObject = {
      users: {
        id: types.number,
        customField: types.custom<CustomField>(),
      },
    }
    const actual = graphqlify.query('getUsers', queryObject)

    expect(actual).toEqual(gql`
      query getUsers {
        users {
          id
          customField
        }
      }
    `)
  })

  it('render parameters when field is array', () => {
    const queryObject = {
      __params: { $status: 'String!' },
      users: [
        {
          __params: { status: '$status' },
          id: types.number,
        },
      ],
    }
    const actual = graphqlify.query('getUsers', queryObject)

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
    const actual = graphqlify.query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
          type
        }
      }
    `)
  })

  it('render nested params', () => {
    const queryObject = {
      __params: { $param1: 'String!', $param2: 'Number' },
      user: {
        __params: { condition: { param1: '$param1', param2: '$param2' } },
        id: types.number,
        type: types.string,
      },
    }

    const actual = graphqlify.query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser($param1: String!, $param2: Number) {
        user(condition: { param1: $param1, param2: $param2 }) {
          id
          type
        }
      }
    `)
  })
})
