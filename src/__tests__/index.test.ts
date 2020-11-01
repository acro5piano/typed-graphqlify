import {
  params,
  fragment,
  fragmentToString,
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
    const q = query({
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
    })

    const actual = gql(q.toString())

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

  it('render params embed GraphQL', () => {
    const q = query('GetUser($id: Int!)', {
      'user(id: $id)': {
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    })

    expect(gql(q.toString())).toEqual(gql`
      query GetUser($id: Int!) {
        user(id: $id) {
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

  it('render params as alias GraphQL', () => {
    const q = query('GetUser($id: Int!)', {
      [alias('user', 'user(id: $id)')]: {
        id: types.number,
        name: types.string,
        bankAccount: {
          id: types.number,
          branch: types.string,
        },
      },
    })

    q?.data?.user?.id

    // @ts-expect-error
    q.data?.['user(id: $id)']

    expect(gql(q.toString())).toEqual(gql`
      query GetUser($id: Int!) {
        user: user(id: $id) {
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
    const q = query({
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
    })

    const actual = gql(q.toString())

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
    const q = query('user', {
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
    })

    const actual = gql(q.toString())

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
    const q = query({
      userName: params({ id: 1 }, types.string),
    })

    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query {
        userName(id: 1)
      }
    `)
  })

  it('render no params GraphQL', () => {
    const q = query('getUser', {
      user: {
        id: types.number,
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
        }
      }
    `)
  })

  it('render very deep GraphQL', () => {
    const q = query('getUser', {
      user: {
        student: {
          mother: {
            father: {
              id: types.number,
            },
          },
        },
      },
    })
    const actual = gql(q.toString())

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
    const q = query('getUser', {
      user: {
        id: types.number,
      },
      bankAccount: {
        id: types.number,
      },
    })

    const actual = gql(q.toString())

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
    const q = query('getUser', {
      user: params(
        { id: 1 },
        {
          id: types.number,
        },
      ),
      bankAccount: params(
        { bank: rawString('city_bank') },
        {
          id: types.number,
        },
      ),
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUser {
        user(id: 1) {
          id
        }
        bankAccount(bank: "city_bank") {
          id
        }
      }
    `)
  })

  it('render operation params', () => {
    const q = query(
      'getUser',
      params(
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
      ),
    )
    const actual = gql(q.toString())

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
    const q = mutation(
      'updateUserMutation',
      params(
        { $name: 'String!' },
        {
          updateUser: params(
            { name: '$name' },
            {
              id: types.number,
            },
          ),
        },
      ),
    )
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      mutation updateUserMutation($name: String!) {
        updateUser(name: $name) {
          id
        }
      }
    `)
  })

  it('render optional field', () => {
    const q = query('getUser', {
      user: optional({
        id: types.optional.number,
      }),
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUser {
        user {
          id
        }
      }
    `)
  })

  it('render array field', () => {
    const q = query('getUsers', {
      users: [
        {
          id: types.number,
        },
      ],
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        users {
          id
        }
      }
    `)
  })

  it('render __typename itself', () => {
    const q = query('getUsers', {
      users: {
        id: types.number,
        __typename: types.constant('User'),
      },
    })
    const actual = gql(q.toString())

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

    const q = query('getUsers', {
      users: {
        id: types.number,
        customField: types.custom<CustomField>(),
      },
    })
    const actual = gql(q.toString())

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
    const q = query(
      'getUsers',
      params(
        { $status: 'String!' },
        {
          users: params({ status: '$status' }, [
            {
              id: types.number,
            },
          ]),
        },
      ),
    )
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers($status: String!) {
        users(status: $status) {
          id
        }
      }
    `)
  })

  it('render raw string parameters', () => {
    const q = query('getUser', {
      user: params(
        { remark: rawString('"hello"') },
        {
          id: types.number,
        },
      ),
    })
    const actual = gql(q.toString())

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

    const q = query('getUsers', {
      user: {
        id: types.number,
        type: types.oneOf(UserType),
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          id
          type
        }
      }
    `)
  })

  it('render enum with value', () => {
    enum UserType {
      'Student' = 'Student',
      'Teacher' = 'Student',
    }

    const q = query('getUsers', {
      user: {
        id: types.number,
        type: types.oneOf(UserType),
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          id
          type
        }
      }
    `)
  })

  it('render object as enum', () => {
    const userType = {
      STUDENT: 'STUDENT',
      TEACHER: 'TEACHER',
    }

    const q = query('getUsers', {
      user: {
        id: types.number,
        type: types.oneOf(userType),
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          id
          type
        }
      }
    `)
  })

  it('render array as const', () => {
    const UserType = ['Student', 'Teacher'] as const

    const q = query('getUsers', {
      user: {
        id: types.number,
        type: types.oneOf(UserType),
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          id
          type
        }
      }
    `)
  })

  it('render optional enums', () => {
    const UserTypeArray = ['Student', 'Teacher'] as const
    enum UserTypeEnum {
      'Student' = 'Student',
      'Teacher' = 'Student',
    }

    const q = query('getUsers', {
      user: {
        id: types.number,
        userTypeEnum: types.optional.oneOf(UserTypeEnum),
        userTypeArray: types.optional.oneOf(UserTypeArray),
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          id
          userTypeEnum
          userTypeArray
        }
      }
    `)
  })

  it('render inline fragment', () => {
    const q = query('getHeroForEpisode', {
      hero: {
        id: types.number,
        ...on('Droid', {
          primaryFunction: types.string,
        }),
        ...on('Human', {
          height: types.number,
        }),
      },
    })

    const actual = gql(q.toString())

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
    const q = query('getHeroForEpisode', {
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
    })

    const actual = gql(q.toString())

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
    const q = query('getHeroForEpisode', {
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
    })

    const actual = gql(q.toString())

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
    const q = query(
      'getUsers',
      params(
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
      ),
    )

    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers($param1: String!, $param2: Number) {
        user(condition: { param1: $param1, param2: $param2 }) {
          id
          type
        }
      }
    `)
  })

  it('render hasura-like graphql', () => {
    // prettier-ignore
    expect(
      gql(mutation('BulkInsertUsers($objects: [user_insert_input!]!)', {
        insert_users: params({ objects: '$objects' }, {
          returning: {
            id: types.number,
          },
        })
      }).toString())
    ).toEqual(gql`
      mutation BulkInsertUsers($objects: [user_insert_input!]!) {
        insert_users(objects: $objects) {
          returning {
            id
          }
        }
      }
    `)
  })

  it('render scalar in an array', () => {
    const q = query('getUserDetails', {
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
    })

    const actual = gql(q.toString())

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

    const q = query('getUsers', {
      user: {
        num: types.number,
        str: types.string,
        bool: types.boolean,
        const: types.constant('const'),
        oneOfEnum: types.oneOf(TestEnum),
        oneOfArray: types.oneOf(['a', 'b', 'c'] as const),
        custom: types.custom<{ a: string }>(),
        undef: undefined,
        optional: {
          num: types.optional.number,
          str: types.optional.string,
          bool: types.optional.boolean,
          const: types.optional.constant('const'),
          oneOfEnum: types.oneOf(TestEnum),
          oneOfArray: types.oneOf(['a', 'b', 'c'] as const),
          custom: types.optional.custom<{ a: string }>(),
        },
      },
    })
    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query getUsers {
        user {
          num
          str
          bool
          const
          oneOfEnum
          oneOfArray
          custom
          optional {
            num
            str
            bool
            const
            oneOfEnum
            oneOfArray
            custom
          }
        }
      }
    `)
  })

  it('render fragments alone', () => {
    const bankAccountFragment = fragment('bankAccountFragment', 'BankAccount', {
      id: types.number,
      branch: types.string,
    })
    expect(fragmentToString(bankAccountFragment)).toEqual(
      gql`
        fragment bankAccountFragment on BankAccount {
          id
          branch
        }
      `,
    )
  })

  it('render nested fragments alone', () => {
    const bankAccountFragment = fragment('bankAccountFragment', 'BankAccount', {
      id: types.number,
      branch: types.string,
      user: {
        name: types.string,
      },
    })
    expect(fragmentToString(bankAccountFragment)).toEqual(gql`
      fragment bankAccountFragment on BankAccount {
        id
        branch
        user {
          name
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

    const q = query({
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
    })

    const actual = gql(q.toString())

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

  it('render directive', () => {
    const q = query({
      [alias('myState', 'myState @client')]: types.string,
    })

    const actual = gql(q.toString())

    expect(actual).toEqual(gql`
      query {
        myState: myState @client
      }
    `)
  })
})
