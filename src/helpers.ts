import { Fragment, FragmentMarker } from './types'

export const filterParams = (k: string) => k !== '__params'

export const getParams = (params: any) => {
  if (!params) {
    return ''
  }
  const variables = Object.keys(params)
    .map(key => `${key}: ${params[key]}`)
    .join(', ')
  return `(${variables})`
}

// TODO: Tail Call Recursion
export const joinFieldRecursively = (fieldOrObject: any): string => {
  const joinedFields = Object.keys(fieldOrObject)
    .filter(filterParams)
    .map(key => {
      if (key.includes(FragmentMarker)) {
        return fieldOrObject[key].render()
      }
      if (fieldOrObject instanceof Fragment) {
        return fieldOrObject.render()
      }
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
