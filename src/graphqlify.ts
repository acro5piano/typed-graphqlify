import { GraphQLFragment, GraphQLType, Params, paramsSymbol, render, typeSymbol } from './render'

interface QueryObject {
  [x: string]: any
}

interface CompiledResult<D, V> {
  toString: () => string
  data: D
  variable: V
  result: { data: D }
}

function createOperate(operateType: string) {
  function operate<T extends QueryObject>(queryObject: T): CompiledResult<T, any>
  function operate<T extends QueryObject>(
    operationName: string,
    queryObject: T,
  ): CompiledResult<T, any>
  function operate<T extends QueryObject>(
    opNameOrQueryObject: string | T,
    queryObject?: T,
  ): CompiledResult<any, any> {
    if (typeof opNameOrQueryObject === 'string') {
      if (!queryObject) {
        throw new Error('queryObject is not set')
      }
      return {
        toString: () => `${operateType} ${opNameOrQueryObject}${render(queryObject)}`,
      } as any
    }
    return {
      toString: () => `${operateType}${render(opNameOrQueryObject)}`,
    } as any
  }
  return operate
}

export const query = createOperate('query')
export const mutation = createOperate('mutation')
export const subscription = createOperate('subscription')

export function params<T>(params: Params, input: T): T {
  if (typeof params !== 'object') {
    throw new Error('Params have to be an object')
  }
  if (typeof input !== 'object') {
    throw new Error(`Cannot apply params to JS ${typeof params}`)
  }

  ;(input as any)[paramsSymbol] = params
  return input
}

export function alias<T extends string>(alias: T, target: string): T {
  return `${alias}:${target}` as T
}

export function fragment<T extends Record<string, unknown>>(
  name: string,
  typeName: string,
  input: T,
): T {
  const fragment: GraphQLFragment = {
    [typeSymbol]: GraphQLType.FRAGMENT,
    name,
    typeName,
    internal: input,
  }

  return { [Symbol(`Fragment(${name} on ${typeName})`)]: fragment } as any
}

/**
 * prevent `String` param being rendered as enum
 */
export function rawString(input: string) {
  return JSON.stringify(input)
}
