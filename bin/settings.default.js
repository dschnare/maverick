const path = require('path')
const webpack = require('webpack')
const shelljs = require('shelljs')

const nodeModulesDir = path.resolve('node_modules')
const outputPath = path.resolve('wwwroot')

// TODO: Add comment explaining that a postcss.config.js file can be used
// to configure the postcss-loader.

// TODO: Add comments for each property.

module.exports = {
  nodeModulesDir: nodeModulesDir,
  outputPath: outputPath,
  outputPublicPath: '/',
  sourceMap: true,
  extractCss: true,
  entrypoints: {
    // TODO: Add comments explaining the properties.
  },
  externals: {
    // TODO: Add comments explaining how to use.
  },
  alias: {},
  proxy: {},
  // Static routes to be installed when running the dev server.
  // Routes can route to an array of directory paths or a single directory path.
  // However, the '/' route can only route to a single directory path.
  staticRoutes: {
    '/': path.resolve('public')
    /*
    // Can route to an array of folders
    '/vendor': [
      path.resolve('node_modules/jquery/dist'),
      path.resolve('somefolder')
    ]
    */
  },
  // Folders and files to copy. If the source ends with '/' then the
  // directory contents will be copied and not the directory itself.
  copyTargets: [
    {
      src: path.resolve('public') + '/',
      dest: outputPath
    }
  ],
  jsIncludeDirs: ['@client', '@shared'].map(p => path.resolve(p)),
  hooks: {
    clean: function (buildMode, done) {
      shelljs.rm('-rf', outputPath)
      done()
    }
  },
  loaders: [
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
      test: /\.(txt?|ini|xml)(\?.*)?$/,
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
  plugins: [
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
  ],

  // Turn on gzipping when building in release mode.
  // This will gzip all files that match the gzipExtensions
  // and save them as file.gz.
  gzip: false,
  gzipExtensions: ['js', 'css']
}
