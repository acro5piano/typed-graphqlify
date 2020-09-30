/*
* Parser
*/

import { Nat, _0, Succ, } from './utils'
import { Whitespace, Operation, Letter, Trim, AfterName, ReadName } from './ast'

type GetBracketInner<T extends string, Depth extends Nat = _0> =
  Depth extends _0 ?
    T extends `{${infer Inner}` ? GetBracketInner<Inner, Succ<Depth>> : never
    : T extends `${infer L}}` ? L : never

type Parse<T extends string> =
  T extends `${Whitespace}${infer Next}` ? Parse<Next> :
  T extends `${Operation} {${infer Next}` ? Parse<Next> :
  T extends `${Letter}${infer Next}` ?
    AfterName<Next> extends `{${infer _}}${infer AfterBracket}` ?
      { [k in ReadName<T>]: Parse<GetBracketInner<Trim<AfterName<Next>>>> } & Parse<AfterBracket> :    // When the word opens "{"
      { [k in ReadName<T>]: /* TODO: */ string } & Parse<`${AfterName<Next>}`> :
  T extends `}${infer Next}` ? Parse<Next> :
  T extends `` ? {} :
  never

export type ParseGql<T extends string> = Parse<Trim<T>>
