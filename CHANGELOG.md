# 2.0.0 - Jan 4, 2017

- Add support for `--host,-H` CLI argument when serving.
- Fix issue with hardcoding the host and port when running the dev server
  without an AppBuilder and in HMR mode.
- BREAKING CHANGE: DevServerBuilder#listen now has the same signature as
  WebpackDevServer#listen.
- BREAKING CHANGE: AppBuilder#listen must accept port, host and a callback at a
  minimum.
