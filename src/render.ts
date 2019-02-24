/**
 * Defines the type of the object
 */
export enum GraphQLType {
  SCALAR,
  INLINE_FRAGMENT,
  FRAGMENT,
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
  [key: string]: string | boolean | number | Params
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
function isInlineFragmentObject(value: unknown): value is GraphQLInlineFragment {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any)[typeSymbol] === GraphQLType.INLINE_FRAGMENT
  )
}

/**
 * A GQL fragment.
 */
export interface GraphQLFragment {
  [typeSymbol]: GraphQLType.FRAGMENT
  name: string
  typeName: string
  internal: Record<string, unknown>
}

/**
 * Checks whether an object is a fragment object.
 */
function isFragmentObject(value: unknown): value is GraphQLFragment {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any)[typeSymbol] === GraphQLType.FRAGMENT
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
 * Provides the context for the current render.
 */
interface RenderContext {
  fragments: Map<symbol, GraphQLFragment>
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
function renderInlineFragment(fragment: GraphQLInlineFragment, context: RenderContext): string {
  return `...on ${fragment.typeName}${renderObject(undefined, fragment.internal, context)}`
}

/**
 * Renders a GQL fragment.
 */
function renderFragment(fragment: GraphQLFragment, context: RenderContext): string {
  return `fragment ${fragment.name} on ${fragment.typeName}${renderObject(
    undefined,
    fragment.internal,
    context,
  )}`
}

/**
 * Renders a GQL array.
 */
function renderArray(name: string | undefined, arr: unknown[], context: RenderContext): string {
  // Get first item.
  const first = arr[0]

  // Ensure we have something.
  if (first === undefined || first === null) {
    throw new Error('Cannot render array with no first value')
  }

  // Move params onto rendered item.
  ;(first as any)[paramsSymbol] = (arr as any)[paramsSymbol]

  // Render type normally.
  return renderType(name, first, context)
}

/**
 * Renders the given value into its given GQL.
 */
function renderType(name: string | undefined, value: unknown, context: RenderContext): string {
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
        return renderArray(name, value, context)
      } else {
        return renderObject(name, value, context)
      }
    case 'undefined':
      // Ignore undefined values.
      return ''
    default:
      throw new Error(`Cannot render type ${typeof value}`)
  }
}

/**
 * Renders a object to GQL.
 */
function renderObject(name: string | undefined, obj: object, context: RenderContext): string {
  const fields: string[] = []

  // Iterate normal properties and render them accordingly.
  for (const [key, value] of Object.entries(obj)) {
    fields.push(renderType(key, value, context))
  }

  // Search for fragment & inline fragment symbols and render them.
  for (const sym of Object.getOwnPropertySymbols(obj)) {
    const value = (obj as any)[sym]
    if (isInlineFragmentObject(value)) {
      fields.push(renderInlineFragment(value, context))
    } else if (isFragmentObject(value)) {
      context.fragments.set(sym, value)
      fields.push(`...${value.name}`)
    }
  }

  // Validate that we have fields to render.
  if (fields.length === 0) {
    throw new Error('Object cannot have no fields')
  }

  // Render function object.
  return `${renderName(name)}${renderParams((obj as any)[paramsSymbol])}{${fields.join('').trim()}}`
}

/**
 * Performs a complete render of a given object.
 */
export function render(value: Record<string, unknown>): string {
  // Construct main render context.
  const context: RenderContext = {
    fragments: new Map(),
  }

  // Render main body.
  let rend = renderObject(undefined, value, context)

  // Render the fragments defined in each context until we have no more to render.
  const rendered = new Map<symbol, string>()
  let executingContext = context // The context we're currently executing over.
  let currentContext: RenderContext = {
    // The current context for execution.
    fragments: new Map(),
  }
  while (executingContext.fragments.size > 0) {
    // Use Array.from due to ES5 target without downLevelIteration enabled.
    for (const [sym, fragment] of Array.from(executingContext.fragments.entries())) {
      // We only need to render the fragment once, even if it's used multiple times.
      if (!rendered.has(sym)) {
        rendered.set(sym, renderFragment(fragment, currentContext))
      }
    }

    // Set the next context to execute to the one we just used.
    executingContext = currentContext
    currentContext = {
      // Reset current context.
      fragments: new Map(),
    }
  }

  return rend + Array.from(rendered.values()).join('')
}
