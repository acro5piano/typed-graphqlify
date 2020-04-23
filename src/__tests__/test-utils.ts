export function gql(literals: TemplateStringsArray) {
  return literals[0]
    .replace(/\n/g, '')
    .replace(/ +/g, ' ')
    .replace(/^ /, '')
    .replace(/ $/, '')
    .replace(/ ?({|}|:|,) ?/g, '$1')
    .replace(/\.\.\. /g, '...')
}
