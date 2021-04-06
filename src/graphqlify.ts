import { GraphQLFragment, GraphQLType, Params, paramsSymbol, render, typeSymbol } from './render'

export interface QueryObject {
  [x: string]: any
}

/**
 * Create a typed-graphqlify instance which contains GraphQL query.
 * To convert the instance to GraphQL string, run `.toString()` method.
 * To convert the instance to TypeScript type, refer `.data` property.
 *
 * ```typescript
 * const data: typeof getUserQuery.data = await executeGraphql(getUserQuery.toString())
 * ```
 */
export interface CompiledResult<D, V> {
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

/**
 * Create a typed-graphqlify instance which contains GraphQL query.
 */
export const query = createOperate('query')

/**
 * Create a typed-graphqlify instance which contains GraphQL mutation.
 */
export const mutation = createOperate('mutation')

/**
 * Create a typed-graphqlify instance which contains GraphQL subscription.
 */
export const subscription = createOperate('subscription')

/**
 * You can also use `params` helper which is useful for inline arguments.
 *
 * ```typescript
 * import { mutation, params, rawString } from 'typed-graphqlify'
 *
 * mutation('updateUserMutation', {
 *   updateUser: params(
 *     {
 *       input: {
 *         name: rawString('Ben'),
 *         slug: rawString('/ben'),
 *       },
 *     },
 *     {
 *       id: types.number,
 *       name: types.string,
 *     },
 *   ),
 * })
 * ```
 */
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

/**
 * Use `alias` to write GraphQL alias. It should be placed as a dynamic property.
 *
 * ```graphql
 * query getMaleUser {
 *   maleUser: user {
 *     id
 *     name
 *   }
 * }
 * ```
 * import { alias, query, types } from 'typed-graphqlify'
 *
 * query('getMaleUser', {
 *   [alias('maleUser', 'user')]: {
 *     id: types.number,
 *     name: types.string,
 *   },
 * }
 */
export function alias<T extends string>(alias: T, target: string): T {
  return `${alias}:${target}` as T
}

/**
 * Use the `fragment` helper to create GraphQL Fragment, and spread the result into places the fragment is used.
 *
 * ```typescript
 * import { alias, fragment, query } from 'typed-graphqlify'
 *
 * const bankAccountFragment = fragment('bankAccountFragment', 'BankAccount', {
 *   id: types.number,
 *   branch: types.string,
 * })
 *
 * const userFragment = fragment('userFragment', 'User', {
 *   id: types.number,
 *   name: types.string,
 *   bankAccount: {
 *     ...bankAccountFragment,
 *   },
 * })
 *
 * query({
 *   [alias('user', 'user(id: 1)')], {
 *     ...userFragment,
 *   },
 *   [alias('maleUsers', 'users(sex: MALE)')], {
 *     ...userFragment,
 *   },
 * }
 * ```
 */
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
 * prevent `String` param being rendered as enum.
 */
export function rawString(input: string) {
  return JSON.stringify(input)
}
