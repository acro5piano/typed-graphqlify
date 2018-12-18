# typed-graphqlify

Build Typed GraphQL Query in TypeScript. Better TypeScript + GraphQL experience.

# Install

```
yarn add typed-graphqlify
```

# Example

**GraphQL**

```graphql
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
```

**TypeScript**

```ts
import { graphqlify, types } from 'typed-graphqlify'

graphqlify('query', {
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
})
```

# TODO

- [ ] Publish to NPM
- [ ] Enum support
- [ ] Variable Input support

# Thanks

Inspired by https://github.com/kadirahq/graphqlify
