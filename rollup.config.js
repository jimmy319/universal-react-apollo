import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

const external = [
  'react',
  'react-dom',
  'react-dom/server',
  '@apollo/client',
  '@apollo/client/link/schema',
  '@apollo/client/react/ssr',
  'apollo-server-express',
  'graphql-tools'
]
const plugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**'
  })
]

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'lib/universal-react-apollo.cjs.js',
      format: 'cjs',
      name: 'universal-react-apollo',
      sourcemap: true,
      exports: 'named'
    },
    external,
    plugins
  },
  {
    input: 'src/clientRender',
    output: {
      file: 'lib/clientRender.js',
      format: 'esm',
      sourcemap: true
    },
    external,
    plugins
  }
]
