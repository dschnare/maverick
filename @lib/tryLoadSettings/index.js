const path = require('path')

module.exports = function tryLoadSettings (settingsPath = 'maverick.settings.js') {
  try {
    return [require(path.resolve(settingsPath)), null]
  } catch (error) {
    return [{}, null]
  }
}
