# typed-graphqlify

Build Typed GraphQL Query in TypeScript. Better TypeScript + GraphQL experience.

# Install

```
yarn add typed-graphqlify
```

# Motivation

We all know that GraphQL is so great and solves many problems that we have with REST API, like overfetching and underfetching. But developing a GraphQL API in TypeScript is sometimes a bit of pain. Why? Let's take a look at the steps we usually have to make.

When we use GraphQL library such as Apollo, We have to define query and its interface like this:

```typescript
interface GetUserQueryData {
  getUser: {
    id: number
    name: string
    bankAccount: {
      id: number
      branch: string
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

# Example

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
        branch: types.string,
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
//     user {
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
// We would like to type this!
const result: typeof getUser = executeGraphql(graphqlify('query', getUser))

// As we cast `result` to `typeof getUser`,
// Now, `result` type looks like this:
// interface result {
//   user: {
//     id: number
//     name: string
//     bankAccount: {
//       id: number
//       branch: string
//     }
//   }
// }
```

![image](https://github.com/acro5piano/typed-graphqlify/blob/master/screenshot.jpg)

# TODO

- [x] Publish to NPM
- [ ] Enum support
- [ ] Variable Input support

# Thanks

Inspired by

- https://github.com/kadirahq/graphqlify
- https://raw.githubusercontent.com/19majkel94/type-graphql
