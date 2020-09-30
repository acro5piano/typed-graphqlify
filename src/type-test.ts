import { ParseGql } from './parser'

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

type IsEq = Actual extends Expected ? 'YES' : 'NO'
