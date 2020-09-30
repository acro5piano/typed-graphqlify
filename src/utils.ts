/*
 * Utility types
 * @see https://ryota-ka.hatenablog.com/entry/2017/12/21/000000#f-94b1ad5b
 */

export type Bool = False | True

export type True = 't'
export type False = 'f'

export type If<Cond extends Bool, Then, Else> = {
  f: Else
  t: Then
}[Cond]

export type Not<Cond extends Bool> = If<Cond, False, True>
export type And<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, Cond2, False>
export type Or<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, True, Cond2>
export type BoolEq<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, Cond2, Not<Cond2>>

export type Zero = { isZero: True }
export type Nat = Zero | { isZero: False; pred: Nat }

export type Succ<N extends Nat> = { isZero: False; pred: N }
export type Pred<N extends Succ<Nat>> = N['pred']
export type IsZero<N extends Nat> = N['isZero']

export type _0 = Zero
export type _1 = Succ<_0>
export type _2 = Succ<_1>
export type _3 = Succ<_2>
export type _4 = Succ<_3>
export type _5 = Succ<_4>
export type _6 = Succ<_5>
export type _7 = Succ<_6>
export type _8 = Succ<_7>
export type _9 = Succ<_8>
