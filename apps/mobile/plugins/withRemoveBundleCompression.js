const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withRemoveBundleCompression(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /[ \t]*enableBundleCompression[^\n]*\n/g,
      '',
    );
    return config;
  });
};
