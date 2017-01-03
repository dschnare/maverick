const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = function genrateEntrypointConfig (entrypoints = {}, buildMode = 'debug') {
  const RELEASE = buildMode === 'release'
  const config = {
    entry: {},
    plugins: []
  }

  for (let outputName in entrypoints) {
    let entry = entrypoints[outputName]

    const { src } = entry
    config.entry[outputName] = src

    let { htmlPage } = entry
    if (htmlPage) {
      htmlPage = Object.assign({}, entry.htmlPage)
      ;({
        title: htmlPage.title = 'No Title',
        filename: htmlPage.filename = 'index.html',
        inject: htmlPage.inject = 'body'
      } = htmlPage)

      // When building for production we want to minify the HTML.
      if (RELEASE) {
        htmlPage.minify = 'minify' in htmlPage ? htmlPage.minify : {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        }
      // Otherwise we disable any HTML minification.
      } else {
        delete htmlPage.minify
      }

      // Necessary to consistently work with multiple chunks via
      // CommonsChunkPlugin.
      htmlPage.chunksSortMode = 'dependency'

      config.plugins.push(new HtmlWebpackPlugin(htmlPage))
    }
  }

  return config
}
