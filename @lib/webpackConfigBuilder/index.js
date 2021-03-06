const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const failPlugin = require('webpack-fail-plugin')
const generateEntrypointConfig = require('./generateEntrypointConfig')

module.exports = function webpackConfig (settings = {}, buildMode = 'debug') {
  const DEBUG = buildMode === 'debug'
  const RELEASE = buildMode === 'release'

  const {
    nodeModulesDir = path.resolve('node_modules'),
    outputPath = path.resolve('wwwroot'),
    outputPublicPath = '/',
    sourceMap = true,
    extractCss = true,
    entrypoints = {},
    externals = {},
    alias = {},
    proxy = {},
    jsIncludeDirs = ['@client', '@shared'].map(p => path.resolve(p)),
    loaders = [
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 5 * 1024,
          name: 'images/[path][name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 5 * 1024,
          name: 'fonts/[path][name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(txt|ini|xml)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 5 * 1024,
          name: 'data/[path][name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(ogg|mp3|wav)(\?.*)?$/,
        loader: 'file',
        query: {
          name: 'audio/[path][name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(pdf|doc|docx)(\?.*)?$/,
        loader: 'file',
        query: {
          name: 'docs/[path][name].[hash:7].[ext]'
        }
      }
    ],
    plugins = [
      // All modules required from node_modules will be written to vendor.js.
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks (module, count) {
          const { resource } = module
          return resource &&
            /\.js$/.test(resource) &&
            resource.indexOf(nodeModulesDir) === 0 &&
            resource.indexOf('@client') < 0 &&
            resource.indexOf('@shared') < 0
        }
      }),
      // Extract Webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated.
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      })
    ]
  } = settings

  const entrypointConfig = generateEntrypointConfig(entrypoints, buildMode)
  const sourceMapQuery = sourceMap ? '?sourceMap' : ''
  const chunkhash = RELEASE ? '.[chunkhash]' : ''
  const cssExtractTextPlugin = new ExtractTextPlugin('styles/[name].[contenthash].css', { disable: !extractCss || DEBUG })
  const componentCssExtractTextPlugin = new ExtractTextPlugin('styles/[name].[contenthash].css', { disable: !extractCss || DEBUG })
  const config = {
    entry: entrypointConfig.entry,
    devServer: { proxy },
    output: {
      path: outputPath,
      publicPath: outputPublicPath,
      filename: `scripts/[name]${chunkhash}.js`,
      chunkFilename: `scripts/[id]${chunkhash}.js`
    },
    devtool: sourceMap ? (RELEASE ? '#source-map' : '#inline-source-map') : false,
    externals,
    alias,
    resolve: {
      extensions: [ '', '.js', '.jsx', '.json' ],
      fallback: [nodeModulesDir, path.resolve(__dirname, '../../node_modules')]
    },
    resolveLoader: {
      fallback: [nodeModulesDir, path.resolve(__dirname, '../../node_modules')]
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: jsIncludeDirs,
          exclude: /(node_modules|bower_components)/,
          query: {
            presets: ['env', {
              useBuiltIns: true,
              targets: {
                browsers: ['last 2 versions']
              }
            }],
            plugins: ['transform-runtime', {
              helpers: true,
              polyfill: false,
              regenerator: false,
              moduleName: 'babel-runtime'
            }]
          }
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.css$/,
          loader: cssExtractTextPlugin.extract('vue-style', `css${sourceMapQuery}&importLoaders=1!postcss`)
        },
        {
          test: /\.less$/,
          loader: cssExtractTextPlugin.extract('vue-style', `css${sourceMapQuery}&importLoaders=1!postcss!less${sourceMapQuery}`)
        }
      ].concat(
        loaders
      ).filter(Boolean)
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: `"${process.env.NODE_ENV}"` }
      })
    ].concat(
      entrypointConfig.plugins,
      RELEASE
        ? new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
        : null,
      new webpack.optimize.OccurrenceOrderPlugin(),
      cssExtractTextPlugin,
      componentCssExtractTextPlugin,
      failPlugin,
      plugins
    ).filter(Boolean)
  }

  return config
}

