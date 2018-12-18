# typed-graphqlify

Build Typed GraphQL Query in TypeScript. Better TypeScript + GraphQL experience.

# Install

```
yarn add typed-graphqlify
```

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
//       isActive
//       bankAccount {
//         id
//         name
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

- [ ] Publish to NPM
- [ ] Enum support
- [ ] Variable Input support

# Thanks

Inspired by https://github.com/kadirahq/graphqlify
