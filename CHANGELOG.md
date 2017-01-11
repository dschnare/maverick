# 3.0.11 - Jan, 10 2017

Add inner error to error message when app builder module fails to load.

# 3.0.1 - Jan 4, 2017

- Fix issue with HMR configuration when AppBuilder module is specified.

# 3.0.0 - Jan 4, 2017

- Fix issue with HMR not being configured properly when serving with an
  AppBuilder module.

- BREAKING CHANGE: DevServerBuilder#build no longer accepts any arguments.
  Instead the constructor now accepts a second options argument with the
  following shape: { withHmr }.

  This change allows the webpack config object to be modified for HMR before
  being used in any middleware.

  Before:
    new DevServerBuilder(settings).build({ hmr: true })

  After the change:
    new DevServerBuilder(settings, { withHmr: true }).build()

# 2.0.0 - Jan 4, 2017

- Add support for `--host,-H` CLI argument when serving.

- Fix issue with hardcoding the host and port when running the dev server
  without an AppBuilder and in HMR mode.

- BREAKING CHANGE: DevServerBuilder#listen now has the same signature as
  WebpackDevServer#listen.

- BREAKING CHANGE: AppBuilder#listen must accept port, host and a callback at a
  minimum.
