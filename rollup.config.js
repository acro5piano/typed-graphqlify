import typescript from 'rollup-plugin-typescript2'

export default {
  input: './index.ts',
  plugins: [
    typescript({
      tslib: require('tslib'),
      declaration: true,
    }),
  ],
  external: id => !id.startsWith('.') && !id.startsWith('/'),
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    name: 'infra-frontend-core',
    sourcemap: true,
  },
}
