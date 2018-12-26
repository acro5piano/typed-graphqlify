[![CircleCI](https://circleci.com/gh/acro5piano/typed-graphqlify.svg?style=svg)](https://circleci.com/gh/acro5piano/typed-graphqlify)
[![npm version](https://badge.fury.io/js/typed-graphqlify.svg)](https://badge.fury.io/js/typed-graphqlify)

![image](https://github.com/acro5piano/typed-graphqlify/blob/master/logo-fixed.png)

# typed-graphqlify

Build Typed GraphQL Query in TypeScript. Better TypeScript + GraphQL experience.

# Install

```
npm install --save typed-graphqlify
```

Or if you use Yarn:

```
yarn add typed-graphqlify
```

# Motivation

We all know that GraphQL is so great and solves many problems that we have with REST API, like overfetching and underfetching. But developing a GraphQL Client in TypeScript is sometimes a bit of pain. Why? Let's take a look at the example we usually have to make.

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
const gqlString = graphqlify.query(getUserQuery)

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
// GraphQLData is a type helper which returns one level down
import { GraphQLData } from 'typed-graphqlify'
import { executeGraphql } from 'some-graphql-request-library'

// We would like to type this!
const result: GraphQLData<typeof getUser> = await executeGraphql(gqlString)

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
graphqlify.query({
  getUser: {
    user: {
      id: types.number,
      name: types.string,
      isActive: types.boolean,
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
graphqlify.mutation({
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
graphqlify.query({
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

Just add array to your query. This does not change the result of compile, but TypeScript can aware the field is array.

```graphql
query getUsers {
  users(status: 'active') {
    id
    name
  }
}
```

```typescript
graphqlify.query({
  getUsers: {
    users: [
      {
        __params: { status: 'active' },
        id: types.number,
        name: types.string,
      },
    ],
  },
})
```

## Optional Field

Add `types.optional` or `optional` helper method to define optional field.

```typescript
import { types, optional } from 'typed-graphqlify'

graphqlify.query({
  getUser: {
    user: {
      id: types.number,
      name: types.optional.string, // <-- user.name is `string | undefined`
      bankAccount: optional({      // <-- user.bankAccount is `{ id: number } | undefined`
        id: types.number,
      }),
    },
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
graphqlify.query({
  getUser: {
    user: {
      id: types.number,
      name: types.string,
      __typename: types.constant('User'),
    },
  },
})
```

## Enum field

Use `types.oneOf` method to define Enum field.

```graphql
query getUser {
  user {
    id
    name
    type # <-- `Student` or `Teacher`
  }
}
```

```typescript
enum UserType {
  'Student',
  'Teacher',
}

graphqlify.query({
  getUser: {
    user: {
      id: types.number,
      name: types.string,
      type: types.oneOf(UserType),
    },
  },
})
```

Note: Currently creating type from array element is not supported in TypeScript. See https://github.com/Microsoft/TypeScript/issues/28046

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
graphqlify.query({
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

# Why not use `apollo client:codegen`?

Disclaimer: I am not a heavy user of Apollo codegen, so the following points could be wrong. And I totally don't disrespect Apollo codegen.

## Simplicity

Apollo codegen is a great tool. In addition to generating query interfaces, it does a lot of tasks including downloading schema, schema validation, fragment spreading, etc.

But, usability is the tradeoff of complexity.

There are some issues to generate interfaces with Apollo codegen.

- https://github.com/apollographql/apollo-tooling/issues/791
- https://github.com/apollographql/apollo-tooling/issues/678

I (and maybe everyone) don't know the exact reasons, but Apollo's codebase is too fuge to find out what is the problem.

On the other hand, typed-graphqlify is as simple as possible runtime typed tool and the logic is quite easy, so I think if some issues happen we can fix them easily.

## Multiple Queres problem

Currently Apollo codegen cannot handle multiple schemas.

- https://github.com/apollographql/apollo-tooling/issues/588
- https://github.com/apollographql/apollo-tooling/issues/554

Although I know this is a kind of edge case, but if we have the same type name on different schemas, which schema is taken?

## typed-graphlify works even without schema

Some graphql frameworks, such as laravel-graphql, cannot print schema as far as I know.
I agree that we should avoid to use such frameworks, but there must be situations that we cannot get graphql schema for some reason.

## Readability (heavily depends on person)

This is really personal opinion, but I feel more comfortable to write typed-graphqlify's query than graphql + schema + apollo.

## Conclution

I wrote a lot here, but I just wanted to try the paradigm TypeScript -> GraphQL conversion, because there are no tools to do that, unlike GraphQL -> TypeScript conversion tools.

# TODO

- [x] Optional support
- [x] Enum support

# Thanks

Inspired by

- https://github.com/kadirahq/graphqlify
- https://github.com/19majkel94/type-graphql
