export type GraphQLData<T extends {}> = {
  value: T[keyof T]
}['value']

export function optional<T>(obj: T): T | null {
  if (obj instanceof CoreType) {
    const newCoreType = new CoreType(obj.type)

    newCoreType.optional = true
    return (newCoreType as any) as T
  }
  return obj
}

function constant<T extends string>(c: T): T {
  return c
}

function oneOf<T extends {}>(e: T): keyof T {
  return Object.keys(e)[0] as keyof T
}

export enum TypeFlags {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
}

class CoreType {
  type: TypeFlags
  optional: boolean = false
  constructor(type: TypeFlags) {
    this.type = type
  }
}

class RawType {
  name: string
  constructor(name: string) {
    this.name = name
  }
}

class OperationVariable {
  coreType: CoreType
  varName: string
  constructor(varName: string, coreType: CoreType) {
    this.coreType = coreType
    this.varName = varName
  }
}

export class types {
  static number: number = (new CoreType(TypeFlags.Number) as any) as number
  static string: string = (new CoreType(TypeFlags.String) as any) as string
  static boolean: boolean = (new CoreType(TypeFlags.Boolean) as any) as boolean
  static Date: Date = (new CoreType(TypeFlags.Date) as any) as Date
  static optional: Partial<typeof types> = types
  static constant = constant
  static oneOf = oneOf
  static raw(name: string) {
    return new RawType(name)
  }
}

const paramsWeakMap = new WeakMap()

const getParams = (params: any) => {
  if (!params) {
    return ''
  }
  const variables = Object.keys(params)
    .map(key => {
      const paramValue = params[key]

      if (paramValue instanceof CoreType) {
        return `${key}: $${key}`
      } else if (paramValue instanceof OperationVariable) {
        return `${key}: $${paramValue.varName}`
      } else {
        return `${key}: ${paramValue}`
      }
    })
    .join(', ')
  return `(${variables})`
}

function compileToGql(queryObject: any, opName: string) {
  const operationParamsObject: { [key: string]: CoreType | OperationVariable } = {}

  const fields = Object.keys(queryObject)
    .map(fieldName => {
      // console.log('dataType: ', fieldName)
      const fieldValue = queryObject[fieldName]
      const paramsObject = paramsWeakMap.get(fieldValue)
      // console.log('paramsObject: ', paramsObject)
      let params = ''
      if (paramsObject) {
        Object.keys(paramsObject).forEach(paramName => {
          const newParamDef = paramsObject[paramName]
          // console.log('newParamDef: ', newParamDef, paramName)

          if (!(newParamDef instanceof CoreType) && !(newParamDef instanceof OperationVariable)) {
            // this is just a raw value-we put it inline without naming a variable
            return
          }
          const existingParamDef = operationParamsObject[paramName]

          if (existingParamDef) {
            throw new Error(
              `variable for parameter "${paramName}" for field "${fieldName}" must be named as there already is a variable named as such`,
            )
          }
          if (newParamDef instanceof OperationVariable) {
            operationParamsObject[newParamDef.varName] = newParamDef
          } else {
            operationParamsObject[paramName] = newParamDef
          }
        })
        params = getParams(paramsObject)
      }

      const joinedFields = joinFieldRecursively(fieldValue)

      return `${fieldName}${params} { ${joinedFields} }`
    })
    .join(' ')
  // console.log('operationParamsObject: ', operationParamsObject)
  const operationParamsPresent = Object.keys(operationParamsObject).length > 0
  if (operationParamsPresent) {
    const operationParamsString = `(${Object.entries(operationParamsObject)
      .map(([key, value]) => {
        if (value instanceof OperationVariable) {
          const exclamationMark = value.coreType.optional ? '' : '!'

          return '$' + key + ': ' + value.coreType.type + exclamationMark
        }
        const exclamationMark = value.optional ? '' : '!'
        return '$' + key + ': ' + value.type + exclamationMark
      })
      .join(', ')})`
    return `${opName}${operationParamsString} { ${fields} }`
  } else {
    if (!opName) {
      return `{ ${fields} }`
    }
    return `${opName} { ${fields} }`
  }
}

export const graphqlify = {
  query(queryObject: any, operationName: string = '') {
    return `query ${compileToGql(queryObject, operationName)}`
  },
  mutation(queryObject: any, operationName: string = '') {
    return `mutation ${compileToGql(queryObject, operationName)}`
  },
  subscription(queryObject: any, operationName: string = '') {
    return `subscription ${compileToGql(queryObject, operationName)}`
  },
}

// TODO: Tail Call Recursion
const joinFieldRecursively = (fieldOrObject: any): string => {
  const joinedFields = Object.keys(fieldOrObject)
    .map(key => {
      if (Array.isArray(fieldOrObject)) {
        return `${joinFieldRecursively(fieldOrObject[0])}`
      }
      if (typeof fieldOrObject[key] === 'object' && !(fieldOrObject[key] instanceof CoreType)) {
        return `${key} { ${joinFieldRecursively(fieldOrObject[key])} }`
      }
      return key
    })
    .join(' ')
  return joinedFields
}

export function params<T extends object>(params: object, fields: T): T {
  paramsWeakMap.set(fields, params)
  return fields
}

export function $(varName: string, type: any) {
  return new OperationVariable(varName, type)
}
