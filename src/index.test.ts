import { typedGraphQL, types } from './version2'
import { gql } from './test-utils'

describe('typedGraphQL', () => {
  it('render GraphQL', () => {
    const queryObject = {
      getUser: {
        user: {
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
    const actual = typedGraphQL('query', queryObject)

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
      getUser: {
        user: {
          id: types.number,
        },
      },
    }
    const actual = typedGraphQL('query', queryObject)

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
    const actual = typedGraphQL('query', queryObject)

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
    const actual = typedGraphQL('query', queryObject)

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
    const actual = typedGraphQL('query', queryObject)

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
    const actual = typedGraphQL('query', queryObject)

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
})
