# Maverick

This a tool that abstracts a Webpack 1.x configuration I frequently use on many
projects. Using this tool I can get a debug and release build pipeline complete
with a dev server configured with hot module reloading with one command:

    npm install dschnare/maverick -D

## Usage

    Usage:
    maverick {command} [options]

    Commands
      init     Saves a default maverick.settings.js file in the current working directory.

      build    Builds source files and saves them outputPath.
        --settings,-S        The module path for the settings. {default: maverick.settings.js}
        --build-mode,-B      The build mode (supported values: debug, test, release) {default: debug}

      serve    Serves source files with a dev server.
        --settings,-S        The module path for the settings. {default: maverick.settings.js}
        --port,-P            The port to bind the server to. {default: 8080}
        --serve-mode,-M      The serve mode (supported values: hmr, inline) {default: hmr}
        --app-builder,-A     The module path for an Express app builder to install the dev server as middleware onto.

## Pre-configured Loaders

The following is configured out of the box:

- JSX
- ES2015 syntax via Typescript
- Async/await support ( http://bit.ly/2ixus5E )
- LESS and CSS imports and minification
- Postcss
- URL/File importing for images,fonts,audio,text and document files
- Module chunking based on node_module imports
- Friendly error messages
- Automatic generation of HTML files and minification (for SPAs)
- All assets are saved to sane folders in the output (i.e. scripts, styles,
  fonts, images, audio, docs and data)
- Easy/optional config file that makes it simple to add new loaders or plugins
  when needed

## Dev Server

The dev server comes in two flavors. The first just uses the
`webpack-dev-server` module. The second uses a custom Express server that will
be mounted as middleware on your existing Express app. This last option makes it
easy to serve your backend server while your running your dev server.

To mount the dev server into your own app server you need to define an
`AppBuilder` module that has the following API:

- it exports a constructor/class that accepts no arguments
- on the prototype the following methods must be defined:
  - use(expressApp) => returns this
  - build() => returns this
  - listen(port, callback) => returns result from app.listen()

Example:

    // src/AppBuilder/index.js
    module.exports = class AppBuilder {
      constructor () {
        this.app = express()
        // add any early middleware to my app
      }

      use (app) {
        // mount another app to our app
        this.app.use(app)
        return this
      }

      build () {
        // finish adding our usual middlware to our app
        this.app.use('/', express.static(__dirname))
      }

      listen (port, callback) {
        return this.app.listen(port, callback)
      }
    }

To run a dev server using this AppBuilder module:

    maverick serve --app-builder ./src/AppBuilder
