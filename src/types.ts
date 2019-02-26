import { typeSymbol, GraphQLType, GraphQLScalar, GraphQLInlineFragment } from './render'

export function optional<T>(obj: T): T | undefined {
  return obj
}

export function on<T extends {}>(typeName: string, internal: T): Partial<T> {
  const fragment: GraphQLInlineFragment = {
    [typeSymbol]: GraphQLType.INLINE_FRAGMENT,
    typeName,
    internal,
  }
  return { [Symbol(`InlineFragment(${typeName})`)]: fragment } as any
}

function scalarType(): any {
  const scalar: GraphQLScalar = {
    [typeSymbol]: GraphQLType.SCALAR,
  }
  return scalar
}

export class types {
  static get number(): number {
    return scalarType()
  }

  static get string(): string {
    return scalarType()
  }

  static get boolean(): boolean {
    return scalarType()
  }

  static constant<T extends string>(_c: T): T {
    return scalarType()
  }

  static oneOf<T extends {}>(_e: T): keyof T {
    return scalarType()
  }

  static custom<T>(): T {
    return scalarType()
  }

  static optional: {
    number?: number
    string?: string
    boolean?: boolean
    constant: <T extends string>(_c: T) => T | undefined
    oneOf: <T extends {}>(_e: T) => (keyof T) | undefined
    custom: <T>() => T | undefined
  } = types
}
