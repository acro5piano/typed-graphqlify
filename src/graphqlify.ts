import { render } from './render'

interface QueryObject {
  [x: string]: any
}

function createOperate(operateType: string) {
  function operate(queryObject: QueryObject): string
  function operate(operationName: string, queryObject: QueryObject): string
  function operate(opNameOrQueryObject: string | QueryObject, queryObject?: QueryObject): string {
    if (typeof opNameOrQueryObject === 'string') {
      if (!queryObject) {
        throw new Error('queryObject is not set')
      }
      return `${operateType} ${opNameOrQueryObject}${render(queryObject)}`
    }
    return `${operateType}${render(opNameOrQueryObject)}`
  }
  return operate
}

export const graphqlify = {
  query: createOperate('query'),
  mutation: createOperate('mutation'),
  subscription: createOperate('subscription'),
}

export function alias<T extends string>(alias: T, target: string): T {
  return `${alias}:${target}` as T
}
