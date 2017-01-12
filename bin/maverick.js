#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const opn = require('opn')
const maverick = require('../index')

const args = process.argv.slice(2)
const command = args.shift()
const settingsPath = readArg(args, ['--settings', '-S'], 'maverick.settings.js')
const port = toInt(readArg(args, ['--port', '-P']), 8080)
const host = readArg(args, ['--host,-H'], 'localhost')
const buildMode = toEnum(readArg(args, ['--build-mode', '-B']), ['debug', 'test', 'release'], 'debug')
const serveMode = toEnum(readArg(args, ['--serve-mode', '-M']), ['hmr', 'inline'], 'hmr')
const appBuilderPath = readArg(args, ['--app-builder', '-A'], '')

const [settings, settingsError] = maverick.tryLoadSettings(settingsPath)
if (settingsError) {
  console.error(settingsError)
} else {
  switch (command) {
    case 'init':
      copyFile(path.join(__dirname, 'settings.default.js'), 'maverick.settings.js')
      copyFile(path.join(__dirname, 'postcss.default.js'), 'postcss.config.js')
      break
    case 'build':
      maverick.build(settings, buildMode, function (error) {
        if (error) console.error(error)
      })
      break
    case 'serve':
      let [AppBuilder, appBuilderError] = tryLoadAppBuilder(appBuilderPath)
      if (appBuilderError) {
        console.error(appBuilderError)
        process.exit(9)
      }

      let server = null

      if (AppBuilder) {
        server = new AppBuilder()
          .use(
            new maverick.DevServerBuilder(settings, { withHmr: serveMode === 'hmr' })
              .build().app
          )
          .build()
      } else {
        server = maverick.devServer(settings, serveMode, port, host)
      }

      server.listen(port, host, function (error) {
        if (error) {
          console.error(error)
        } else {
          const uri = `http://${host}:${port}`
          console.log(`Listening at ${uri}\n'`)
          // When env is testing, we don't need open it.
          if (process.env.NODE_ENV !== 'testing') opn(uri)
        }
      })
      break
    default:
      console.log([
        'Usage:',
        'maverick {command} [options]',
        '',
        'Commands',
        '  init     Saves a default maverick.settings.js file in the current working directory.',
        '',
        '  build    Builds source files and saves them outputPath.',
        '    --settings,-S        The module path for the settings {default: maverick.settings.js}',
        '    --build-mode,-B      The build mode (supported values: debug, test, release) {default: debug}',
        '',
        '  serve    Serves source files with a dev server.',
        '    --settings,-S        The module path for the settings {default: maverick.settings.js}',
        '    --port,-P            The port to bind the server to {default: 8080}',
        '    --host,-H            The host name for the dev server {default: localhost}',
        '    --serve-mode,-M      The serve mode (supported values: hmr, inline) {default: hmr}',
        '    --app-builder,-A     The module path for an Express app builder to install the dev server as middleware onto',
        ''
      ].join('\n'))
  }
}

function readArg (args, names, defaultValue = false) {
  let value = defaultValue

  args.some((a, k) => {
    const cliArgname = a.split('=')[0]
    if (names.some(n => cliArgname.indexOf(n) === 0)) {
      // --name=value
      if (args[k].indexOf('=') > 0) {
        value = args[k].split('=').pop()
      // --name
      } else if (args[k + 1] && args[k + 1].charAt('-') === 0) {
        value = true
      // --name value
      } else {
        value = args[k + 1]
      }
      return true
    }
  })

  return value
}

function toInt (value, defaultValue) {
  let v = parseInt(value, 10)
  return isNaN(v) ? defaultValue : v
}

function toEnum (value, supportedValues, defaultValue) {
  return supportedValues.indexOf(value) < 0
    ? defaultValue
    : value
}

function tryLoadAppBuilder (appBuilderPath) {
  let AppBuilder = null

  if (appBuilderPath) {
    // If the app builder path is a relative module path then
    // it's relative to the current working directory. If we don't
    // resolve this path before calling require() then require will
    // assume the path is relative to this file (maverick.js).
    if (appBuilderPath.charAt(0) === '.') {
      appBuilderPath = path.resolve(appBuilderPath)
    }

    try {
      AppBuilder = require(appBuilderPath)
      if (typeof AppBuilder !== 'function' ||
          typeof AppBuilder.prototype.use !== 'function' ||
          typeof AppBuilder.prototype.build !== 'function' ||
          typeof AppBuilder.prototype.listen !== 'function') {
        return [null, new Error('App builder does not have use(), build() and listen() methods on prototype.')]
      }
    } catch (error) {
      return [null, new Error('App builder module cannot be loaded: ' + appBuilderPath + ' InnerError:' + error)]
    }
  }

  return [AppBuilder, null]
}

function copyFile (src, dest) {
  const reader = fs.createReadStream(src)
  const writer = fs.createWriteStream(dest, { encoding: 'utf8' })
  reader.pipe(writer)
}
