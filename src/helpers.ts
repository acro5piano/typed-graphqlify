export class Fragment<T> {
  readonly typeName: string
  readonly fields: T

  constructor(typeName: string, fields: T) {
    this.typeName = typeName
    this.fields = fields
  }

  render() {
    const joinedFields = joinFieldRecursively(this.fields)
    return `... on ${this.typeName} { ${joinedFields} }` as any
  }
}

export const FragmentMarker = '__fragment__on__'

export const filterParams = (k: string) => k !== '__params'

const nestParams = (params: any): any =>
  typeof params === 'object' ? `{ ${serializeParams(params)} }` : params
const serializeParams = (params: any) =>
  Object.keys(params)
    .map(key => `${key}: ${nestParams(params[key])}`)
    .join(', ')
export const getParams = (params: any) => (params ? `(${serializeParams(params)})` : '')

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
        // We render scalar itself if it is in an array.
        // e.g) emails: [types.string]
        // For more details, please see https://github.com/acro5piano/typed-graphqlify/issues/42
        if (Array.isArray(fieldOrObject[key]) && typeof fieldOrObject[key][0] !== 'object') {
          return key
        }
        return `${key} { ${joinFieldRecursively(fieldOrObject[key])} }`
      }
      return key
    })
    .join(' ')
  return joinedFields
}
