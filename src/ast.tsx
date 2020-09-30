/*
 * GraphQL related literals
 */

export type LineBreak = "\r" | "\n";
export type Whitespace = " " | "\t" | LineBreak;
export type EndOfIdentifier = Whitespace | "," | ":" | "!";
export type LowerAlphabet = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
export type UpperAlphabet = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
export type Alphabet = LowerAlphabet | UpperAlphabet
export type Digit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
export type Letter = Alphabet | Digit | '_';

export type ReadName<S extends string> = S extends `${infer L}${infer Next}` ? L extends Letter ? `${L}${ReadName<Next>}` : "" : "";
export type AfterName<S extends string> = S extends `${infer L}${infer Next}` ? L extends Letter ? AfterName<Next> : Next : S;

export type Operation = 'query' | 'mutation' | 'subscription'

export type Trim<S extends string> = S extends `${infer L}${Whitespace}` ? Trim<L> : S
