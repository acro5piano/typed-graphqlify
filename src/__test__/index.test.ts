import {
  params,
  fragment,
  query,
  mutation,
  types,
  optional,
  alias,
  on,
  rawString,
  onUnion,
} from '../index'
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

    const actual = query(queryObject)

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
      [alias('maleUser', 'user')]: params(
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

    const actual = query(queryObject)

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

    const actual = query('user', queryObject)

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

  it('render param on scalar', () => {
    const queryObject = {
      userName: params({ id: 1 }, types.string),
    }

    const actual = query(queryObject)

    expect(actual).toEqual(gql`
      query {
        userName(id: 1)
      }
    `)
  })

  it('render no params GraphQL', () => {
    const queryObject = {
      user: {
        id: types.number,
      },
    }
    const actual = query('getUser', queryObject)

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
    const actual = query('getUser', queryObject)

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

    const actual = query('getUser', queryObject)

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
    const actual = query('getUser', queryObject)

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
    const queryObject = params(
      { $id: 'Int!' },
      {
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
      },
    )
    const actual = query('getUser', queryObject)

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
    const queryObject = params(
      { $name: 'String!' },
      {
        updateUser: params(
          { name: '$name' },
          {
            id: types.number,
          },
        ),
      },
    )
    const actual = mutation('updateUserMutation', queryObject)

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
    const actual = query('getUser', queryObject)

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
    const actual = query('getUsers', queryObject)

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
    const actual = query('getUsers', queryObject)

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
    const actual = query('getUsers', queryObject)

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
    const queryObject = params(
      { $status: 'String!' },
      {
        users: params({ status: '$status' }, [
          {
            id: types.number,
          },
        ]),
      },
    )
    const actual = query('getUsers', queryObject)

    expect(actual).toEqual(gql`
      query getUsers($status: String!) {
        users(status: $status) {
          id
        }
      }
    `)
  })

  it('render raw string parameters', () => {
    const queryObject = {
      user: params(
        { remark: rawString('"hello"') },
        {
          id: types.number,
        },
      ),
    }
    const actual = query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        user(remark: "\\"hello\\"") {
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
    const actual = query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
          type
        }
      }
    `)
  })

  it('render inline fragment', () => {
    const queryObject = {
      hero: {
        id: types.number,
        ...on('Droid', {
          primaryFunction: types.string,
        }),
        ...on('Human', {
          height: types.number,
        }),
      },
    }

    const actual = query('getHeroForEpisode', queryObject)

    expect(actual).toEqual(gql`
      query getHeroForEpisode {
        hero {
          id
          ... on Droid {
            primaryFunction
          }
          ... on Human {
            height
          }
        }
      }
    `)
  })

  it('render nested inline fragment', () => {
    const queryObject = {
      hero: {
        id: types.number,
        ...on('Droid', {
          internalData: {
            memory: types.number,
            parts: {
              ...on('Cpu', {
                instuctionSet: types.string,
              }),
              ...on('HDD', {
                size: types.number,
                diagnostics: {
                  maxRpm: types.number,
                },
              }),
            },
          },
        }),
        ...on('Human', {
          height: types.number,
        }),
      },
    }

    const actual = query('getHeroForEpisode', queryObject)

    expect(actual).toEqual(gql`
      query getHeroForEpisode {
        hero {
          id
          ... on Droid {
            internalData {
              memory
              parts {
                ... on Cpu {
                  instuctionSet
                }
                ... on HDD {
                  size
                  diagnostics {
                    maxRpm
                  }
                }
              }
            }
          }
          ... on Human {
            height
          }
        }
      }
    `)
  })

  it('render inline fragment unions', () => {
    const queryObject = {
      hero: {
        id: types.number,
        ...on('Droid', {
          internalData: {
            memory: types.number,
            parts: [
              {
                ...onUnion({
                  Cpu: {
                    kind: types.constant('CPU'),
                    instuctionSet: types.string,
                  },
                  HDD: {
                    kind: types.constant('HDD'),
                    size: types.number,
                    diagnostics: {
                      maxRpm: types.number,
                    },
                  },
                }),
              },
            ],
          },
        }),
        ...on('Human', {
          height: types.number,
        }),
      },
    }

    const actual = query('getHeroForEpisode', queryObject)

    expect(actual).toEqual(gql`
      query getHeroForEpisode {
        hero {
          id
          ... on Droid {
            internalData {
              memory
              parts {
                ... on Cpu {
                  kind
                  instuctionSet
                }
                ... on HDD {
                  kind
                  size
                  diagnostics {
                    maxRpm
                  }
                }
              }
            }
          }
          ... on Human {
            height
          }
        }
      }
    `)
  })

  it('render nested params', () => {
    const queryObject = params(
      { $param1: 'String!', $param2: 'Number' },
      {
        user: params(
          { condition: { param1: '$param1', param2: '$param2' } },
          {
            id: types.number,
            type: types.string,
          },
        ),
      },
    )

    const actual = query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser($param1: String!, $param2: Number) {
        user(condition: { param1: $param1, param2: $param2 }) {
          id
          type
        }
      }
    `)
  })

  it('render scalar in an array', () => {
    const queryObject = {
      user: {
        emails: [types.string],
        activity: {
          logins: [types.number],
        },
        addresses: [
          {
            id: types.number,
          },
        ],
      },
    }

    const actual = query('getUserDetails', queryObject)

    expect(actual).toEqual(gql`
      query getUserDetails {
        user {
          emails
          activity {
            logins
          }
          addresses {
            id
          }
        }
      }
    `)
  })

  it('render all scalar types', () => {
    enum TestEnum {
      A = 'a',
    }

    const queryObject = {
      user: {
        num: types.number,
        str: types.string,
        bool: types.boolean,
        const: types.constant('const'),
        oneOf: types.oneOf(TestEnum),
        custom: types.custom<{ a: string }>(),
        undef: undefined,
        optional: {
          num: types.optional.number,
          str: types.optional.string,
          bool: types.optional.boolean,
          const: types.optional.constant('const'),
          oneOf: types.optional.oneOf(TestEnum),
          custom: types.optional.custom<{ a: string }>(),
        },
      },
    }

    const actual = query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        user {
          num
          str
          bool
          const
          oneOf
          custom
          optional {
            num
            str
            bool
            const
            oneOf
            custom
          }
        }
      }
    `)
  })

  it('render fragments', () => {
    const bankAccountFragment = fragment('bankAccountFragment', 'BankAccount', {
      id: types.number,
      branch: types.string,
    })

    const userFragment = fragment('userFragment', 'User', {
      id: types.number,
      bankAccount: {
        ...bankAccountFragment,
      },
    })

    const queryObject = {
      user: params(
        { id: 1 },
        {
          ...userFragment,
          name: types.string,
        },
      ),
      [alias('maleUsers', 'users')]: params(
        { sex: 'MALE' },
        {
          name: types.string,
          ...userFragment,
        },
      ),
    }

    const actual = query(queryObject)

    expect(actual).toEqual(gql`
      query {
        user(id: 1) {
          name
          ...userFragment
        }
        maleUsers: users(sex: MALE) {
          name
          ...userFragment
        }
      }
      fragment userFragment on User {
        id
        bankAccount {
          ...bankAccountFragment
        }
      }
      fragment bankAccountFragment on BankAccount {
        id
        branch
      }
    `)
  })

  it('render or', () => {
    const queryObject: {
      user: {
        id: number
        type: string | null
      }
    } = {
      user: {
        id: types.number,
        type: types.or(types.string, null),
      },
    }
    const actual = query('getUser', queryObject)

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
          type
        }
      }
    `)
  })

  it('properly errors on invalid input', () => {
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
})
