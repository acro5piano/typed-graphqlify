**Do you have any questions about GraphQL, TypeScript, or React?**

I'm happy to assist you via Remotehour. Feel free to call me if I'm online → [https://remotehour.com/kay/quick](https://remotehour.com/kay/quick?utm_source=github&utm_medium=social&utm_campaign=typed-graphqlify)

[![CircleCI](https://circleci.com/gh/acro5piano/typed-graphqlify.svg?style=svg)](https://circleci.com/gh/acro5piano/typed-graphqlify)
![release](https://github.com/acro5piano/typed-graphqlify/workflows/release/badge.svg)
[![npm version](https://badge.fury.io/js/typed-graphqlify.svg)](https://badge.fury.io/js/typed-graphqlify)
[![codecov](https://codecov.io/gh/acro5piano/typed-graphqlify/branch/master/graph/badge.svg)](https://codecov.io/gh/acro5piano/typed-graphqlify)

![image](images/logo-fixed.png)

# typed-graphqlify

Build Typed GraphQL Queries in TypeScript. A better TypeScript + GraphQL experience.

# Install

```
npm install --save typed-graphqlify
```

Or if you use Yarn:

```
yarn add typed-graphqlify
```

# Motivation

We all know that GraphQL is so great and solves many problems that we have with REST APIs, like overfetching and underfetching. But developing a GraphQL Client in TypeScript is sometimes a bit of pain. Why? Let's take a look at the example we usually have to make.

When we use GraphQL library such as Apollo, We have to define a query and its interface like this:

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

**typed-graphqlify** comes in to address this issues, based on experience from over a dozen months of developing with GraphQL APIs in TypeScript. The main idea is to have only one source of truth by defining the schema using GraphQL-like object and a bit of helper class. Additional features including graphql-tag, or Fragment can be implemented by other tools like Apollo.

# How to use

First, define GraphQL-like JS Object:

```typescript
import { params, types } from 'typed-graphqlify'

const getUserQuery = {
  user: params(
    { id: 1 },
    {
      id: types.number,
      name: types.string,
      bankAccount: {
        id: types.number,
        branch: types.optional.string,
      },
    },
  ),
}
```

Note that we use our `types` helper to define types in the result, and the `params` helper to define the parameters.

Then, convert the JS Object to GraphQL (string) with `graphqlify`:

```typescript
import { query } from 'typed-graphqlify'

const gqlString = query('getUser', getUserQuery)

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

![image](images/screenshot.jpg)

# Features

Currently `typed-graphqlify` can convert these GraphQL features:

- Operations
  - Query
  - Mutation
  - Subscription
- Inputs
  - Variables
  - Parameters
- Data structures
  - Nested object query
  - Array query
- Scalar types
  - `number`
  - `string`
  - `boolean`
  - Enum
  - Constant
  - Custom type
  - Optional types, e.g.) `number | undefined`
- Fragments
- Inline Fragments

# Examples

## Basic Query

```graphql
query getUser {
  user {
    id
    name
    isActive
  }
}
```

```typescript
import { query, types } from 'typed-graphqlify'

query('getUser', {
  user: {
    id: types.number,
    name: types.string,
    isActive: types.boolean,
  },
})
```

Or without query name

```graphql
query {
  user {
    id
    name
    isActive
  }
}
```

```typescript
import { query, types } from 'typed-graphqlify'

query({
  user: {
    id: types.number,
    name: types.string,
    isActive: types.boolean,
  },
})
```

## Basic Mutation

Just use `mutation`.

```graphql
mutation updateUserMutation($input: UserInput!) {
  updateUser(input: $input) {
    id
    name
  }
}
```

```typescript
import { mutation, params } from 'typed-graphqlify'

mutation('updateUserMutation', params({ $input: 'UserInput!' }, {
  updateUser: params({ input: '$input' }, {
    id: types.number,
    name: types.string,
  }),
})
```

## Nested Query

Write nested objects just like GraphQL.

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
import { query, types } from 'typed-graphqlify'

query('getUser', {
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
})
```

## Array Field

Just add array to your query. This does not change the result, but TypeScript will be aware the field is an array.

```graphql
query getUsers {
  users(status: 'active') {
    id
    name
  }
}
```

```typescript
import { params, query, types } from 'typed-graphqlify'

query('users', {
  users: params({ status: 'active' }, [
    {
      id: types.number,
      name: types.string,
    },
  ]),
})
```

## Optional Field

Add `types.optional` or `optional` helper method to define optional field.

```typescript
import { optional, query, types } from 'typed-graphqlify'

query('getUser', {
  user: {
    id: types.number,
    name: types.optional.string, // <-- user.name is `string | undefined`
    bankAccount: optional({      // <-- user.bankAccount is `{ id: number } | undefined`
      id: types.number,
    }),
  },
}
```

## Constant field

Use `types.constant` method to define constant field.

```graphql
query getUser {
  user {
    id
    name
    __typename # <-- Always `User`
  }
}
```

```typescript
import { query, types } from 'typed-graphqlify'

query('getUser', {
  user: {
    id: types.number,
    name: types.string,
    __typename: types.constant('User'),
  },
})
```

## Enum field

Use `types.oneOf` method to define Enum field. It accepts an instance of `Array`, `Object` and `Enum`.

**Deprecated: Don't use enum, use array or plain object to define enum if possible. typed-graphqlify can't guarantee inferred type is correct.**

```graphql
query getUser {
  user {
    id
    name
    type # <-- `STUDENT` or `TEACHER`
  }
}
```

```typescript
import { query, types } from 'typed-graphqlify'

const userType = ['STUDENT', 'TEACHER'] as const

query('getUser', {
  user: {
    id: types.number,
    name: types.string,
    type: types.oneOf(userType),
  },
})
```

```typescript
import { query, types } from 'typed-graphqlify'

const userType = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
}

query('getUser', {
  user: {
    id: types.number,
    name: types.string,
    type: types.oneOf(userType),
  },
})
```

You can also use `enum`:

```typescript
import { query, types } from 'typed-graphqlify'

enum UserType {
  'STUDENT',
  'TEACHER',
}

query('getUser', {
  user: {
    id: types.number,
    name: types.string,
    type: types.oneOf(UserType),
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
import { query, types } from 'typed-graphqlify'

query('getFatherAndMother', {
  father: {
    id: types.number,
    name: types.string,
  },
  mother: {
    id: types.number,
    name: types.number,
  },
})
```

## Query Alias

Query alias is implemented via a dynamic property.

```graphql
query getMaleUser {
  maleUser: user {
    id
    name
  }
}
```

```typescript
import { alias, query, types } from 'typed-graphqlify'

query('getMaleUser', {
  [alias('maleUser', 'user')]: {
    id: types.number,
    name: types.string,
  },
}
```

## Standard fragments

Use the `fragment` helper to create them, and spread the result into places the fragment is used.

```graphql
query {
  user(id: 1) {
    ...userFragment
  }
  maleUsers: users(sex: MALE) {
    ...userFragment
  }
}

fragment userFragment on User {
  id
  name
  bankAccount {
    ...bankAccountFragment
  }
}

fragment bankAccountFragment on BankAccount {
  id
  branch
}
```

```typescript
import { alias, fragment, params, query } from 'typed-graphqlify'

const bankAccountFragment = fragment('bankAccountFragment', 'BankAccount', {
  id: types.number,
  branch: types.string,
})

const userFragment = fragment('userFragment', 'User', {
  id: types.number,
  name: types.string,
  bankAccount: {
    ...bankAccountFragment,
  },
})

query({
  user: params({ id: 1 }, {
    ...userFragment,
  }),
  [alias('maleUsers', 'users')]: params({ sex: 'MALE' }, {
    ...userFragment,
  }),
}
```

## Inline Fragment

Use `on` helper to write inline fragments.

```graphql
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
```

```typescript
import { on, query, types } from 'typed-graphqlify'

query('getHeroForEpisode', {
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
```

If you are using a discriminated union pattern, then you can use the `onUnion` helper, which will automatically generate the union type for you:

```graphql
query getHeroForEpisode {
  hero {
    id
    ... on Droid {
      kind
      primaryFunction
    }
    ... on Human {
      kind
      height
    }
  }
}
```

```typescript
import { onUnion, query, types } from 'typed-graphqlify'

query('getHeroForEpisode', {
  hero: {
    id: types.number,
    ...onUnion({
      Droid: {
        kind: types.constant('Droid'),
        primaryFunction: types.string,
      },
      Human: {
        kind: types.constant('Human'),
        height: types.number,
      },
    }),
  },
})
```

This function will return a type of `A | B`, meaning that you can use the following logic to differentiate between the 2 types:

```typescript
const droidOrHuman = queryResult.hero
if (droidOrHuman.kind === 'Droid') {
  const droid = droidOrHuman
  // ... handle droid
} else if (droidOrHument.kind === 'Human') {
  const human = droidOrHuman
  // ... handle human
}
```

See more examples at [`src/index.test.ts`](https://github.com/acro5piano/typed-graphqlify/blob/master/src/index.test.ts)

# Usage with React Native

This library uses `Symbol` and `Map`, meaning that if you are targeting ES5 and lower, you will need to polyfill both of them.

So, you may need to import `babel-polyfill` in `App.tsx`.

```typescript
import 'babel-polyfill'
import * as React from 'react'
import { View, Text } from 'react-native'
import { query, types } from 'typed-graphqlify'

const queryString = query({
  getUser: {
    user: {
      id: types.number,
    },
  },
})

export class App extends React.Component<{}> {
  render() {
    return (
      <View>
        <Text>{queryString}</Text>
      </View>
    )
  }
}
```

See: https://github.com/facebook/react-native/issues/18932

# Why not use `apollo client:codegen`?

There are some GraphQL -> TypeScript convertion tools. The most famous one is Apollo codegen:

https://github.com/apollographql/apollo-tooling#apollo-clientcodegen-output

In this section, we will go over why `typed-graphqlify` is a good alternative.

Disclaimer: I am not a heavy user of Apollo codegen, so the following points could be wrong. And I totally don't mean disrespect Apollo codegen.

## Simplicity

Apollo codegen is a great tool. In addition to generating query interfaces, it does a lot of tasks including downloading schemas, schema validation, fragment spreading, etc.

However, great usability is the tradeoff of complexity.

There are some issues to generate interfaces with Apollo codegen.

- https://github.com/apollographql/apollo-tooling/issues/791
- https://github.com/apollographql/apollo-tooling/issues/678

I (and maybe everyone) don't know the exact reasons, but Apollo's codebase is too large to find out what the problem is.

On the other hand, `typed-graphqlify` is as simple as possible by design, and the logic is quite easy. If some issues happen, we can fix them easily.

## Multiple Schemas problem

Currently Apollo codegen cannot handle multiple schemas.

- https://github.com/apollographql/apollo-tooling/issues/588
- https://github.com/apollographql/apollo-tooling/issues/554

Although I know this is a kind of edge case, but if we have the same type name on different schemas, which schema is used?

## typed-graphqlify works even without schema

Some graphql frameworks, such as laravel-graphql, cannot print schema as far as I know.
I agree that we should avoid to use such frameworks, but there must be situations that we cannot get graphql schema for some reasons.

## Write GraphQL programmatically

It is useful to write GraphQL programmatically, although that is an edge case.

Imagine AWS management console:

![image](https://user-images.githubusercontent.com/10719495/50487625-79420580-0a42-11e9-882f-2b5d571ebd13.png)

If you build something like that with GraphQL, you have to build GraphQL dynamically and programmatically.

typed-graphqlify works for such cases without losing type information.

# Contributing

To get started with a development installation of the typed-graphqlify, follow the instructions at our [Contribution Guide](./CONTRIBUTING.md).

# Thanks

Inspired by

- https://github.com/kadirahq/graphqlify
- https://github.com/19majkel94/type-graphql
