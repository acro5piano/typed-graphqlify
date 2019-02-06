import { Fragment, FragmentMarker } from './helpers'

export function optional<T>(obj: T): T | undefined {
  return obj
}

export function on<T extends {}>(typeName: string, fields: T): Partial<T> {
  const fragment = new Fragment(typeName, fields)
  return { [`${FragmentMarker}${typeName}`]: fragment } as any
}

function constant<T extends string>(c: T): T {
  return c
}

function custom<T>(): T {
  return '' as any
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
  static custom = custom
}
