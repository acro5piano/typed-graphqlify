import typescript from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  plugins: [
    typescript({
      tslib: require('tslib'),
      declaration: true,
    }),
  ],
  external: id => !id.startsWith('.') && !id.startsWith('/') && id !== 'tslib',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      name: 'typed-graphqlify',
      sourcemap: true,
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true,
    },
  ],
}
