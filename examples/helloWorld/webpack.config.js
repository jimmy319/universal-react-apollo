module.exports = {
  mode: 'production',
  entry: {
    'home': './src/clientEntry'
  },
  output: {
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              highlightCode: true
            }
          }
        ]
      },
      // workaround for graphql-js mjs resolving issue https://github.com/graphql/graphql-js/issues/2721#issuecomment-723008284
      {
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    },
    ]
  }
}
