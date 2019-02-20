/**
 * Defines the type of the object
 */
export enum GraphQLType {
  SCALAR,
  INLINE_FRAGMENT,
}

/**
 * The symbol to use to store the object GQL type
 */
export const typeSymbol = Symbol('GraphQL Type')
/**
 * The symbol to use to store the object parameters.
 */
export const paramsSymbol = Symbol('GraphQL Params')

/**
 * The parameters type.
 */
export interface Params {
  [key: string]: string | Params
}

/**
 * A GQL inline fragment.
 */
export interface GraphQLInlineFragment {
  [typeSymbol]: GraphQLType.INLINE_FRAGMENT
  typeName: string
  internal: Record<string, unknown>
}

/**
 * Checks whether an object is a fragment object.
 */
function isFragmentObject(value: unknown): value is GraphQLInlineFragment {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any)[typeSymbol] === GraphQLType.INLINE_FRAGMENT
  )
}

/**
 * A GQL scalar object.
 * Stores the params of the scalar if any were given.
 */
export interface GraphQLScalar {
  [typeSymbol]: GraphQLType.SCALAR
  [paramsSymbol]?: Params
}

/**
 * Checks whether an object is a scalar object.
 */
function isScalarObject(value: unknown): value is GraphQLScalar {
  return (
    typeof value === 'object' && value !== null && (value as any)[typeSymbol] === GraphQLType.SCALAR
  )
}

/**
 * Renders the name if it was given.
 */
function renderName(name: string | undefined): string {
  return name === undefined ? '' : name
}

/**
 * Renders the parameters if they were given.
 */
function renderParams(params?: Params, brackets = true): string {
  if (!params) {
    // If no params are given, don't render anything.
    return ''
  }

  const builder: string[] = []
  for (const [key, value] of Object.entries(params)) {
    let params: string
    if (typeof value === 'object') {
      params = `{${renderParams(value, false)}}`
    } else {
      params = `${value}`
    }
    builder.push(`${key}:${params}`)
  }

  let built = builder.join(',')
  if (brackets) {
    built = `(${built})`
  }
  return built
}

/**
 * Renders a GQL scalar.
 */
function renderScalar(name: string | undefined, params?: Params): string {
  // Scalars have no content, just a name.
  return renderName(name) + renderParams(params)
}

/**
 * Renders a GQL inline fragment.
 */
function renderInlineFragment(fragement: GraphQLInlineFragment): string {
  return `...on ${fragement.typeName}${render(fragement.internal)}`
}

/**
 * Renders a GQL array.
 */
function renderArray(name: string | undefined, arr: unknown[]): string {
  // Get first item.
  const first = arr[0]

  // Ensure we have something.
  if (first === undefined || first === null) {
    throw new Error('Cannot render array with no first value')
  }

  // Render type normally.
  return renderType(name, first)
}

/**
 * Renders the given value into its given GQL.
 */
function renderType(name: string | undefined, value: unknown): string {
  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'number':
    case 'string':
      throw new Error(`Rendering type ${typeof value} directly is disallowed`)
    case 'object':
      // Ignore null fields.
      if (value === null) {
        throw new Error('Cannot render null')
      }
      if (isScalarObject(value)) {
        return `${renderScalar(name, value[paramsSymbol])} `
      } else if (Array.isArray(value)) {
        return renderArray(name, value)
      } else {
        return renderObject(name, value)
      }
    case 'undefined':
      throw new Error('Cannot render undefined')
    default:
      throw new Error(`Cannot render type ${typeof value}`)
  }
}

/**
 * Renders a object to GQL.
 */
function renderObject(name: string | undefined, obj: object): string {
  const fields: string[] = []

  // Iterate normal properties and render them accordingly.
  for (const [key, value] of Object.entries(obj)) {
    // __params is a special case currently.
    if (key === '__params') {
      continue
    }
    fields.push(renderType(key, value))
  }

  // Search for fragment symbols and render them.
  for (const sym of Object.getOwnPropertySymbols(obj)) {
    const value = (obj as any)[sym]
    if (isFragmentObject(value)) {
      fields.push(renderInlineFragment(value))
    }
  }

  // Validate that we have fields to render.
  if (fields.length === 0) {
    throw new Error('Object cannot have no fields')
  }

  // Render function object. (& handle params)
  return `${renderName(name)}${renderParams((obj as any).__params)}{${fields.join('').trim()}}`
}

/**
 * Performs a complete render of a given object.
 */
export function render(value: Record<string, unknown>): string {
  return renderObject(undefined, value)
}
