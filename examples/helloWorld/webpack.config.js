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
      }
    ]
  }
}
