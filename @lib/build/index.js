const webpack = require('webpack')
const webpackConfigBuilder = require('../webpackConfigBuilder')

module.exports = function build (settings = {}, buildMode = 'debug', callback = null) {
  switch (buildMode) {
    case 'debug':
      process.env.NODE_ENV = 'development'
      break
    case 'test':
      process.env.NODE_ENV = 'testing'
      break
    case 'release':
      process.env.NODE_ENV = 'production'
      break
  }

  const webpackConfig = webpackConfigBuilder(settings, buildMode)

  if (settings.hooks && typeof settings.hooks.clean) {
    settings.hooks.clean(buildMode, doBuild)
  } else {
    doBuild()
  }

  if (buildMode === 'release' && settings.gzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(
          '\\.(' +
          settings.gzipExtensions.join('|') +
          ')$'
        ),
        threshold: 10240,
        minRatio: 0.8
      })
    )
  }

  function doBuild () {
    webpack(webpackConfig, callback)
  }
}
