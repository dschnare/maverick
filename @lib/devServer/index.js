const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const webpackConfigBuilder = require('../webpackConfigBuilder')

// See: http://webpack.github.io/docs/webpack-dev-server.html

module.exports = function (settings = {}, serveMode = 'hmr', port = 8080, host = 'localhost') {
  process.env.NODE_ENV = 'development'

  const HMR = serveMode === 'hmr'
  const webpackConfig = webpackConfigBuilder(settings, 'debug')

  // Hot module replacement with inline page reload.
  if (HMR) {
    Object.keys(webpackConfig.entry).forEach(key => {
      let src = webpackConfig.entry[key]
      if (typeof src === 'string') src = [src]
      src.unshift(
        `webpack-dev-server/client?http://${host}:${port}/`,
        'webpack/hot/dev-server'
      )
      webpackConfig.entry[key] = src
    })

    webpackConfig.plugins = webpackConfig.plugins || []
    webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new FriendlyErrorsWebpackPlugin({
        // See: https://github.com/geowarin/friendly-errors-webpack-plugin
      })
    )
  // Inline page reload.
  } else {
    Object.keys(webpackConfig.entry).forEach(key => {
      webpackConfig.entry[key].unshift(`webpack-dev-server/client?http://${host}:${port}/`)
    })
  }

  const compiler = webpack(webpackConfig)
  return new WebpackDevServer(compiler, { hot: HMR })
}
