const path = require('path')
const express = require('express')
const webpack = require('webpack')
const opn = require('opn')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const proxyMiddleware = require('http-proxy-middleware')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const connectHistoryApiFallback = require('connect-history-api-fallback')
const webpackConfigBuilder = require('../webpackConfigBuilder')

module.exports = class DevServerBuilder {
  constructor (settings = {}) {
    const webpackConfig = webpackConfigBuilder(settings)
    const compiler = webpack(webpackConfig)

    const app = express()

    this.app = app
    this.settings = settings
    this.webpackConfig = webpackConfig
    this.compiler = compiler
  }

  addHttpProxies () {
    // Define HTTP proxies to your custom API backend
    // https://github.com/chimurai/http-proxy-middleware
    const app = this.app
    const proxy = this.webpackConfig.devServer.proxy || {}
    Object.keys(proxy).forEach(function (context) {
      let options = proxy[context]
      if (typeof options === 'string') options = { target: options }
      if (options.context) context = options.context
      app.use(proxyMiddleware(context, options))
    })

    return this
  }

  addHtml5ApiFallback () {
    // Handle fallback for HTML5 history API
    this.app.use(connectHistoryApiFallback())
    return this
  }

  addWebpack () {
    const devMiddleware = webpackDevMiddleware(this.compiler, {
      publicPath: this.webpackConfig.output.publicPath,
      stats: { colors: true, chunks: false }
    })

    this.app.use(devMiddleware)
    return this
  }

  addHmr ({ disable = false }) {
    if (disable) return this

    const hotMiddleware = webpackHotMiddleware(this.compiler)
    // force page reload when html-webpack-plugin template changes
    this.compiler.plugin('compilation', function (compilation) {
      compilation.plugin('html-webpack-plugin-after-emit', function (data, callback) {
        hotMiddleware.publish({ action: 'reload' })
        callback()
      })
    })

    Object.keys(this.webpackConfig.entry).forEach(key => {
      let src = this.webpackConfig.entry[key]
      if (typeof src === 'string') src = [src]
      src.unshift(path.join(__dirname, 'hmrClient'))
      this.webpackConfig.entry[key] = src
    })

    this.webpackConfig.plugins = this.webpackConfig.plugins || []
    this.webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new FriendlyErrorsWebpackPlugin({
        // See: https://github.com/geowarin/friendly-errors-webpack-plugin
      })
    )

    this.app.use(hotMiddleware)
    return this
  }

  addStatic () {
    // Serve static assets
    this.app.use(this.webpackConfig.output.publicPath, express.static(this.webpackConfig.output.path))
    return this
  }

  build ({ hmr = true } = {}) {
    return this.addHttpProxies()
      .addHtml5ApiFallback()
      .addWebpack()
      .addHmr({ disable: !hmr })
      .addStatic()
  }

  listen (port = 8080, callback) {
    return this.app.listen(port, callback || function (err) {
      if (err) {
        console.log(err)
        return
      }

      const uri = 'http://localhost:' + port
      console.log('Listening at ' + uri + '\n')

      // When env is testing, we don't need open it.
      if (process.env.NODE_ENV !== 'testing') opn(uri)
    })
  }
}
