[![CircleCI](https://circleci.com/gh/acro5piano/typed-graphqlify.svg?style=svg)](https://circleci.com/gh/acro5piano/typed-graphqlify)
[![npm version](https://badge.fury.io/js/typed-graphqlify.svg)](https://badge.fury.io/js/typed-graphqlify)

# typed-graphqlify

Build Typed GraphQL Query in TypeScript. Better TypeScript + GraphQL experience.

# Install

```
yarn add typed-graphqlify
```

# Motivation

We all know that GraphQL is so great and solves many problems that we have with REST API, like overfetching and underfetching. But developing a GraphQL API in TypeScript is sometimes a bit of pain. Why? Let's take a look at the example we usually have to make.

When we use GraphQL library such as Apollo, We have to define query and its interface like this:

```typescript
interface GetUserQueryData {
  getUser: {
    id: number
    name: string
    bankAccount: {
      id: number
      branch?: string
    }
  }
}

const query = graphql(gql`
  query getUser {
    user {
      id
      name
      bankAccount {
        id
        branch
      }
    }
  }
`)

apolloClient.query<GetUserQueryData>(query).then(data => ...)
```

This is so painful.

The biggest problem is the redundancy in our codebase, which makes it difficult to keep things in sync. To add a new field to our entity, we have to care about both GraphQL and TypeScript interface. And type checking does not work if we do something wrong.

**typed-graphqlify** comes to address this issues, based on experience from over a dozen months of developing with GraphQL APIs in TypeScript. The main idea is to have only one source of truth by defining the schema using GraphQL-like object and a bit of helper class. Additional features including graphql-tag, or Fragment can be implemented by other tools like Apollo.

# How to use

First, define GraphQL-like JS Object:

```typescript
import { graphqlify, types } from 'typed-graphqlify'

const getUserQuery = {
  getUser: {
    user: {
      __params: { id: 1 },
      id: types.number,
      name: types.string,
      bankAccount: {
        id: types.number,
        branch: types.optional.string,
      },
    },
  },
}
```

Note that we use our `types` helper to define types in the result.

Then, convert the JS Object to GraphQL (string) with `graphqlify`:

```typescript
const gqlString = graphqlify('query', getUserQuery)

console.log(gqlString)
// =>
//   query getUser {
//     user(id: 1) {
//       id
//       name
//       bankAccount {
//         id
//         branch
//       }
//     }
//   }
```

Finally, execute the GraphQL:

```typescript
import { executeGraphql } from 'some-graphql-request-library'

// We would like to type this!
const result: typeof getUser = await executeGraphql(gqlString)

// As we cast `result` to `typeof getUser`,
// Now, `result` type looks like this:
// interface result {
//   user: {
//     id: number
//     name: string
//     bankAccount: {
//       id: number
//       branch?: string
//     }
//   }
// }
```

![image](https://github.com/acro5piano/typed-graphqlify/blob/master/screenshot.jpg)

# Features

- Nested Query
- Array Query
- Input variables, parameters
- Query and Mutation
- Optional types

# Exapmles

## Basic Query

```graphql
query getUser {
  user {
    id
    name
  }
}
```

```typescript
graphqlify('query', {
  getUser: {
    user: {
      id: types.number,
      name: types.string,
    },
  },
})
```

## Basic Mutation

Change the first argument of `graphqlify` to `mutation`.

```graphql
mutation updateUser($input: UserInput!) {
  updateUser(input: $input) {
    id
    name
  }
}
```

```typescript
graphqlify('mutation', {
  __params: { $input: 'UserInput!' },
  updateUser: {
    __params: { input: '$input' },
    id: types.number,
    name: types.string,
  },
})
```

## Nested Query

Write nested object just like GraphQL.

```graphql
query getUser {
  user {
    id
    name
    parent {
      id
      name
      grandParent {
        id
        name
        children {
          id
          name
        }
      }
    }
  }
}
```

```typescript
graphqlify('query', {
  getUser: {
    user: {
      id: types.number,
      name: types.string,
      parent: {
        id: types.number,
        name: types.string,
        grandParent: {
          id: types.number,
          name: types.string,
          children: {
            id: types.number,
            name: types.string,
          },
        },
      },
    },
  },
})
```

## Array Field

Just add array to your query.

```graphql
query getUsers {
  users {
    id
    name
  }
}
```

```typescript
graphqlify('query', {
  getUsers: {
    users: [
      {
        id: types.number,
        name: types.string,
      },
    ],
  },
})
```

## Multiple Queries

Add other queries at the same level of the other query.

```graphql
query getFatherAndMother {
  father {
    id
    name
  }
  mother {
    id
    name
  }
}
```

```typescript
graphqlify('query', {
  getFatherAndMother: {
    father: {
      id: types.number,
      name: types.string,
    },
    mother: {
      id: types.number,
      name: types.number,
    },
  },
})
```

See more examples at [`src/index.test.ts`](https://github.com/acro5piano/typed-graphqlify/blob/master/src/index.test.ts)

# Documentation

## Basic Types

```typescript
import { types } from 'typed-graphqlify'
```

currently `types` has these three types:

- `types.number`
- `types.string`
- `types.boolean`

## Optional

Add `optional` to define optional field:

```typescript
import { types, optional } from 'typed-graphqlify'

graphqlify('query', {
  getUser: {
    user: {
      id: types.number,
      name: types.optional.string, // <-- user.name is `string | undefined`
      bankAccount: optional({     // <-- user.bankAccount is `{ id: number } | undefined`
        id: types.number,
      }),
    },
  },
}
```

# TODO

- [x] Optional support
- [ ] Enum support

# Thanks

Inspired by

- https://github.com/kadirahq/graphqlify
- https://github.com/19majkel94/type-graphql
