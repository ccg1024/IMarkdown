const rules = require('./webpack.rules')

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
})

rules.push({
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}
