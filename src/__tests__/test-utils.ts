export function gql(arg: string | TemplateStringsArray) {
  const target = typeof arg === 'string' ? arg : arg[0]
  return target
    .replace(/\n/g, '')
    .replace(/ +/g, ' ')
    .replace(/^ /, '')
    .replace(/ $/, '')
    .replace(/ ?({|}|:|,) ?/g, '$1')
    .replace(/\.\.\. /g, '...')
}
