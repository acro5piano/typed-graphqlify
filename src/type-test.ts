import { ParseGql } from './parser'

type Post  = {
  id: number
  title: string
}

type User = {
  id: number
  gender: 'male' | 'female' | 'other'
  posts: Post[]
}

type Schema = {
  Query: {
    hello: string
    posts: Post[]
    users: User[]
  }
}

const query = `
  query {
    hello
    posts {
      id
      title
    }
    users {
      id
      gender
      posts {
        id
        title
      }
    }
  }
`

type Actual = ParseGql<typeof query>

type Expected = {
  hello: string
  posts: {
    id: string
    title: string
  }
  users: {
    id: string
    gender: string
  }
}

// @ts-ignore
type IsEq = Actual extends Expected ? 'YES' : 'NO'

declare function exec<T>(gql: string): Promise<T>

declare const a: Actual

// @ts-ignore
exec<ParseGql<typeof query>>(query).then(res => {
  res.users.posts
})
