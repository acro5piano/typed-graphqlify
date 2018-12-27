import { filterParams, getParams, joinFieldRecursively } from "./helpers";

interface QueryObject {
  [x: string]: any;
}

export const compileToGql = (query: any) => {
  const fields = Object.keys(query)
    .filter(filterParams)
    .map(dataType => {
      let params = getParams(query[dataType].__params)
      if (Array.isArray(query[dataType])) {
        params = getParams(query[dataType][0].__params)
      }
      const joinedFields = joinFieldRecursively(query[dataType])
      return `${dataType}${params} { ${joinedFields} }`
    })
    .join(' ')

  return `{ ${fields} }`
}

function createOperate (operateType: string) {
  function operate(queryObject: QueryObject): string;
  function operate(operationName: string, queryObject: QueryObject): string;
  function operate(opNameOrQueryObject: string | QueryObject, queryObject?: QueryObject): string {
    if (typeof opNameOrQueryObject === "string") {
      const operationParams = getParams((queryObject as QueryObject).__params)

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
