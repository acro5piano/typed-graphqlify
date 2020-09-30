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

const GetUsersQuery = `
  query GetUsers {
    users {
      id
      name
      posts {
        id
        title
      }
    }
  }
`

/*
 * TypeScript 4.1
 */

const TokenKind = {
  SOF: '<SOF>',
  EOF: '<EOF>',
  BANG: '!',
  DOLLAR: '$',
  AMP: '&',
  PAREN_L: '(',
  PAREN_R: ')',
  SPREAD: '...',
  COLON: ':',
  EQUALS: '=',
  AT: '@',
  BRACKET_L: '[',
  BRACKET_R: ']',
  BRACE_L: '{',
  PIPE: '|',
  BRACE_R: '}',
  NAME: 'Name',
  INT: 'Int',
  FLOAT: 'Float',
  STRING: 'String',
  BLOCK_STRING: 'BlockString',
  COMMENT: 'Comment',
};

type ValidToken = keyof typeof TokenKind;
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

// type ASTKind =
//   | 'OperationTypeDefinition'
//   | 'OperationDefinition'
//   | 'SelectionSet'
//   | 'Field'
//   | 'Name'

type Node<Type extends ValidToken, Value extends string | undefined = undefined> =
  Token<Type, Value> &  { next: Node<any, any> }

type Parse<T extends string> =
  T extends `${Whitespace}${infer Next}` ? Parse<Next> :
  T extends `{${infer Next}` ? Token<'BRACE_L'> & { next: Parse<Next> } :
  T extends `}${infer Next}` ? Token<'BRACE_R'> & { next: Parse<Next> } :
  T extends `${Letter}${infer Next}` ? Token<'NAME', ReadName<Next>> & { next: Parse<AfterName<Next>> } :
  T

type ParsedQuery = Parse<typeof GetUsersQuery>


// type ParseObjectType<Object, FieldNode extends Node<any, any>> =
//   { [k in FieldNode['value']]: Object[FieldNode['value']] } &
//     ParseObjectType<Object, FieldNode['next']>

      // 'next' extends keyof FieldNode ? ParseObjectType<Object, FieldNode['next']> : {}

// type N = ParseObjectType<{ id: number, name: string }, { type: 'Name', value: 'id', next: { type: 'Name', value: 'name' } } >
// type N = ParseObjectType<{ id: number, name: string }, { type: 'Name', value: 'id' } >

// const a: {a: 1} & {}

// type C<T extends string | undefined> = T extends string ? T : null
//
// type D = C<'a'>
// type E = C<number>

// type o = { a: 1; b: 2, next?: 'n' | undefined }
//
// type A<T> = 'next' extends keyof o
//   ? o['next'] extends undefined ? 'Hoge' : 'FUGA'
//   : o['next']
//
// type K = A<o>

export type Expected = Array<{
  id: number
  name: string
  posts: {
    id: number
    title: string
  }
}>

// type GetSelectionSet
//
// // export type ParsedQuery = Parse<typeof GetUsersQuery>
