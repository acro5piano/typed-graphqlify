import { filterParams, getParams, joinFieldRecursively } from './helpers'

interface QueryObject {
  [x: string]: any
}

const compileToField = (name: string, query: QueryObject) => {
  let params = getParams(query.__params)
  if (Array.isArray(query)) {
    params = getParams(query[0].__params)
  }
  const joinedFields = joinFieldRecursively(query)
  return `${name}${params} { ${joinedFields} }`
}

export const compileToGql = (query: QueryObject) => {
  const fields = Object.keys(query)
    .filter(filterParams)
    .map(dataType => compileToField(dataType, query[dataType]))
    .join(' ')
  return `{ ${fields} }`
}

function createOperate(operateType: string) {
  function operate(queryObject: QueryObject): string
  function operate(operationName: string, queryObject: QueryObject): string
  function operate(opNameOrQueryObject: string | QueryObject, queryObject?: QueryObject): string {
    if (typeof opNameOrQueryObject === 'string') {
      if (!queryObject) {
        throw new Error('queryObject is not set')
      }
      const operationParams = getParams(queryObject.__params)
      return `${operateType} ${opNameOrQueryObject}${operationParams} ${compileToGql(queryObject)}`
    }
    const operationParams = getParams(opNameOrQueryObject.__params)
    return `${operateType} ${operationParams}${compileToGql(opNameOrQueryObject)}`
  }
  return operate
}

export const graphqlify = {
  query: createOperate('query'),
  mutation: createOperate('mutation'),
  subscription: createOperate('subscription'),
}

export function alias<T extends string>(alias: T, target: string): T {
  return `${alias}: ${target}` as T
}
