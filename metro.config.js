const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(projectRoot, 'packages'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  '@game/2048':        path.resolve(projectRoot, 'packages/game-2048'),
  '@game/arrow-break': path.resolve(projectRoot, 'packages/game-arrow-break'),
};

module.exports = config;
