const path = require('path')
const fs = require('fs')
const shell = require('shelljs')
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

  // Copy the copy targets. These are static files meant to be copied when building.
  if (settings.copyTargets) {
    settings.copyTargets
      .filter((target) => fs.existsSync(target.src))
      .reduce((newTargets, target) => {
        // Do a file listing for sources that end with a '/' so we copy the contents
        // of a directory and not the directory itself.
        if (target.src.substr(-1) === '/') {
          newTargets = shell.ls('-R', target.src + '**/*.*').map((src) => {
            return {
              src,
              dest: path.join(target.dest, path.relative(target.src, src))
            }
          }).concat(newTargets)
        } else {
          newTargets.push(target)
        }
        return newTargets
      }, [])
      .forEach((target) => {
        shell.mkdir('-p', path.dirname(target.dest))
        shell.cp('-fuR', target.src, target.dest)
      })
  }

  function doBuild () {
    webpack(webpackConfig, callback)
  }
}
