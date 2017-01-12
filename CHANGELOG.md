# 3.1.4 - Jan, 12 2017

- Change devtool to inline-source-map when debugging so source maps are loaded
  correctly when running the dev server.

# 3.1.3 - Jan, 12 2017

- Resolve issue with app builder module resolution. Ensure relative module paths
  are handled correctly.

- Add source-map-loader to the preLoaders array so that emitted source maps from
  TypeScript will be loaded into Webpack.

# 3.1.2 - Jan, 11 2017

- Add support for specifying a directory as a destination for a copy target.

# 3.1.1 - Jan, 11 2017

- Fix incorrect import path used for shelljs.

# 3.1.0 - Jan, 11 2017

- Add copyTargets setting option that dictates what files should be copied
  when building the project.

- Add staticRoutes setting option that dictates what static routes should be
  installed when running the dev server.

# 3.0.11 - Jan, 10 2017

- Add inner error to error message when app builder module fails to load.

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
