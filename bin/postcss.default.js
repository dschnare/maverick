// For more configuration options see https://github.com/postcss/postcss-loader.
module.exports = {
  plugins: [
    // You must `npm install autoprefixer`
    //
    // For more configuration options see
    // https://github.com/postcss/autoprefixer.
    require('autoprefixer')({
      browsers: ['last 2 versions']
    })
  ]
}
