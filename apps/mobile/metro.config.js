const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

// Resolve os pacotes compartilhados localmente (para EAS Build funcionar)
config.resolver.extraNodeModules = {
  '@keepergo/api-client': path.resolve(projectRoot, 'lib/packages/api-client'),
  '@keepergo/shared-types': path.resolve(projectRoot, 'lib/packages/shared-types'),
}

module.exports = config
