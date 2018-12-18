export class types {
  static number: number = 0
  static string: string = ''
  static boolean: boolean = false
}

const filterParams = (k: string) => k !== '__params'

type QueryType = 'query' | 'mutation'

export const typedGraphQL = (type: QueryType, obj: any) => {
  const operationName = Object.keys(obj).filter(filterParams)[0]
  const query = obj[operationName]
  const operationParams = getParams(query.__params)

  const fields = Object.keys(query)
    .filter(filterParams)
    .map(dataType => {
      const params = getParams(query[dataType].__params)
      const joinedFields = joinFieldRecursively(query[dataType])
      return `${dataType}${params} { ${joinedFields} }`
    })
    .join(' ')

  return `${type} ${operationName}${operationParams} { ${fields} }`
}

const joinFieldRecursively = (fieldOrObject: any): string => {
  const joinedFields = Object.keys(fieldOrObject)
    .filter(filterParams)
    .map(key => {
      if (typeof fieldOrObject[key] === 'object') {
        // TODO: Tail Call Recursion
        return `${key} { ${joinFieldRecursively(fieldOrObject[key])} }`
      }
      return key
    })
    .join(' ')
  return joinedFields
}

const getParams = (params: any) => {
  if (!params) {
    return ''
  }
  const variables = Object.keys(params)
    .map(key => `${key}: ${params[key]}`)
    .join(', ')
  return `(${variables})`
}
