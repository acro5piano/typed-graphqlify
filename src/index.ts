export type GraphQLData<T extends {}> = {
  value: T[keyof T]
}['value']

export function optional<T>(obj: T): T | undefined {
  return obj
}

function constant<T extends string>(c: T): T {
  return c
}

function oneOf<T extends {}>(e: T): keyof T {
  return Object.keys(e)[0] as keyof T
}

export class types {
  static number: number = 0
  static string: string = ''
  static boolean: boolean = false
  static optional: Partial<typeof types> = types
  static constant = constant
  static oneOf = oneOf
}

const filterParams = (k: string) => k !== '__params'

function compileToGql(obj: any) {
  const operationName = Object.keys(obj).filter(filterParams)[0]
  const query = obj[operationName]
  const operationParams = getParams(query.__params)

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

  return `${operationName}${operationParams} { ${fields} }`
}

export const graphqlify = {
  query(obj: any) {
    return `query ${compileToGql(obj)}`
  },
  mutation(obj: any) {
    return `mutation ${compileToGql(obj)}`
  },
  subscription(obj: any) {
    return `subscription ${compileToGql(obj)}`
  },
}

// TODO: Tail Call Recursion
const joinFieldRecursively = (fieldOrObject: any): string => {
  const joinedFields = Object.keys(fieldOrObject)
    .filter(filterParams)
    .map(key => {
      if (Array.isArray(fieldOrObject)) {
        return `${joinFieldRecursively(fieldOrObject[0])}`
      }
      if (typeof fieldOrObject[key] === 'object') {
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
