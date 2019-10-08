import { typeSymbol, GraphQLType, GraphQLScalar, GraphQLInlineFragment } from './render'

// Utility type
type ValueOf<T> = T[keyof T]

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

export function onUnion<T>(types: Record<string, T>): T {
  let fragments: Record<any, T> = {}
  for (const [typeName, internal] of Object.entries(types)) {
    fragments = {
      ...fragments,
      ...on(typeName, internal),
    }
  }
  return fragments as any
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

  static oneOf<T extends {}>(_e: T): ValueOf<T> {
    return scalarType()
  }

  static custom<T>(): T {
    return scalarType()
  }

  static or<T, U>(_t: T, _u: U): T | U {
    return scalarType()
  }

  static optional: {
    number?: number
    string?: string
    boolean?: boolean
    constant: <T extends string>(_c: T) => T | undefined
    oneOf: <T extends {}>(_e: T) => (ValueOf<T>) | undefined
    custom: <T>() => T | undefined
    or: <T, U>(_t: T, _u: U) => T | U | undefined
  } = types
}
