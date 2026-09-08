const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

// Keep Expo's default extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'cjs'
];

module.exports = config;
