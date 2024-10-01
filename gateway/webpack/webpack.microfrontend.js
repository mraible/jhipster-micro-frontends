const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const packageJson = require('../package.json');
// Microfrontend api, should match across gateway and microservices.
const apiVersion = '0.0.1';

const sharedDefaults = { singleton: true, strictVersion: true, requiredVersion: apiVersion };
const shareMappings = (...mappings) => Object.fromEntries(mappings.map(map => [map, { ...sharedDefaults, version: apiVersion }]));

const shareDependencies = ({ skipList = [] } = {}) =>
  Object.fromEntries(
    Object.entries(packageJson.dependencies)
      .filter(([dependency]) => !skipList.includes(dependency))
      .map(([dependency, version]) => [dependency, { ...sharedDefaults, version, requiredVersion: version }]),
  );

module.exports = () => {
  return {
    optimization: {
      moduleIds: 'named',
      chunkIds: 'named',
      runtimeChunk: false,
    },
    resolve: {
      fallback: {
        // Workaround https://github.com/module-federation/universe/issues/1575
        path: false,
      },
    },

    plugins: [
      new ModuleFederationPlugin({
        shareScope: 'default',
        shared: {
          ...shareDependencies(),
          ...shareMappings('@/shared/security/authority', '@/shared/alert/alert.service', '@/locale/translation.service'),
        },
      }),
    ],
    output: {
      publicPath: 'auto',
    },
  };
};
