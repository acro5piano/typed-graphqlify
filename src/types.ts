export function optional<T>(obj: T): T | undefined {
  return obj
}

export class Fragment<T> {
  readonly typeName: string
  readonly fields: T

  constructor(typeName: string, fields: T) {
    this.typeName = typeName
    this.fields = fields
  }

  render() {
    const joinedFields = Object.keys(this.fields).join(' ')
    return `... on ${this.typeName} { ${joinedFields} }` as any
  }
}

export const FragmentMarker = '__fragment__on__'

export function on<T extends {}>(typeName: string, fields: T): Partial<T> {
  const fragment = new Fragment(typeName, fields)
  return { [`${FragmentMarker}${typeName}`]: fragment } as any
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
