import { TokenKind } from "graphql";

/*
 * TypeScript 4.1
 */

type User = {
  id: number
  name: string
  gender: 'male' | 'female'
  posts: Post[]
}

type Post = {
  id: number
  title: string
}

type Query = {
  hello: string
  users: User[]
}

export type Schema = {
  Query: Query,
  User: User,
}

type Tokens = typeof TokenKind;
type ValidToken = keyof Tokens;
type LineBreak = "\r" | "\n";
type Whitespace = " " | "\t" | LineBreak;
// type EndOfIdentifier = Whitespace | "," | ":" | "!";
type LowerAlphabet = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
type UpperAlphabet = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
type Alphabet = LowerAlphabet | UpperAlphabet
type Digit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
type Letter = Alphabet | Digit | '_';

type ReadName<S extends string> = S extends `${infer L}${infer Next}` ? L extends Letter ? `${L}${ReadName<Next>}` : "" : "";
type AfterName<S extends string> = S extends `${infer L}${infer Next}` ? L extends Letter ? AfterName<Next> : Next : S;

type Token<Type extends ValidToken, Value extends string | undefined = undefined> = {
  type: Type;
  value?: Value;
}

// type QueryBuilder<Query> = Query extends `${Letter}${infer RootQueryName}${Letter}`
//   ? RootQueryName extends keyof Query
//     ? { [k in RootQueryName]: Query[RootQueryName] }
//     : never
//   : never

// type ReadNext<T extends string> =
//   T extends `${Whitespace}${infer Next}` ? ReadNext<Next> :
//   T extends `${Letter}${infer Next}` ? Token<"NAME", ReadName<T>> & { next: ReadNext<AfterName<T>> } :

type GetRootQuery<T extends string> =
  T extends `${Whitespace}${infer Next}` ? GetRootQuery<Next> :
  T extends `{${infer Next}`             ? GetRootQuery<Next> :
  T extends `query ${infer _OperationName} {${infer Next}`        ? GetRootQuery<Next> :
  T extends `${Letter}${infer _Next}`     ? { RootOperation: ReadName<T> , next: GetRootQuery<_Next>   }    :
  never

// type PickSelectionSetFromObj<T extends string, Result extends string = never> =
//   T extends `${Whitespace}${infer Next}` ? GetSelectionSet<Next> :
//   T extends `{${infer Next}`             ? GetSelectionSet<Next> :
//   T extends `}`                          ? Result :
//   T extends `${Letter}${infer _Next}`     ? GetSelectionSet<AfterName<T>, Result | ReadName<T>> :
//   T extends ``                           ? Result :
//   never

type GetSelectionSet<T extends string, Result extends string = never> =
  T extends `${Whitespace}${infer Next}` ? GetSelectionSet<Next> :
  T extends `{${infer Next}`             ? GetSelectionSet<Next> :
  T extends `}`                          ? Result :
  T extends `${Letter}${infer _Next}`     ? GetSelectionSet<AfterName<T>, Result | ReadName<T>> :
  T extends ``                           ? Result :
  never

export type OP = GetRootQuery<typeof GetUsersQuery>
export type SelectionSet = GetSelectionSet<'{ id name }'>

export type UserOp = Pick<Query[OP['RootOperation']][number], SelectionSet>

// export type Result

type Parse<T extends string> =
  T extends `${Whitespace}${infer Next}` ? Parse<Next> :
  T extends `{${infer Next}` ? Token<'BRACE_L'> & { next: Parse<Next> } :
  T extends `}${infer Next}` ? Token<'BRACE_R'> & { next: Parse<Next> } :
  T extends `${Letter}${infer Next}` ? Token<'NAME', ReadName<Next>> & { next: Parse<AfterName<Next>> } :
  T

const GetUsersQuery = `
  query GetUsers {
    users {
      id
      name
    }
  }
`


export type ParsedQuery = Parse<typeof GetUsersQuery> // => { user: User[] }

// type OperationName = ParsedQuery

// export type ExpectUserType = QueryBuilder<typeof GetUsersQuery> // => { user: User[] }

// export type ExpectQueryType = QueryBuilder<'{ hello }'> // => { hello: string }
// export type ExpectNever = QueryBuilder<'{ foo }'> // => never
