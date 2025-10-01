const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Fix for React Native 0.81+ package export resolution issues
  config.resolver.unstable_enablePackageExports = false;

  // Additional fixes for React Native 0.81+ and React 19 compatibility
  config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

  // Note: Symlinks handling is managed by Expo's default configuration

  // Enhanced module resolution for problematic modules
  config.resolver.extraNodeModules = {
    // Handle modules that might have exports field issues
    'react-native': require.resolve('react-native'),
    '@react-native': require.resolve('react-native'),
  };

  // Enhanced module resolution for React Native 0.81.4 and React 19 compatibility
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Handle React Native core modules that might have exports field issues
    if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch (error) {
        // Try alternative resolution paths for React Native modules
        if (moduleName === 'react-native') {
          try {
            return context.resolveRequest(context, 'react-native/index.js', platform);
          } catch (fallbackError) {
            return context.resolveRequest(context, 'react-native', platform);
          }
        }
        return context.resolveRequest(context, moduleName, platform);
      }
    }

    // Handle scoped packages that might have exports field issues
    if (moduleName.startsWith('@')) {
      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch (error) {
        // For scoped packages, try without the scope prefix as fallback
        const withoutScope = moduleName.substring(moduleName.indexOf('/') + 1);
        try {
          return context.resolveRequest(context, withoutScope, platform);
        } catch (fallbackError) {
          return context.resolveRequest(context, moduleName, platform);
        }
      }
    }

    // Handle other modules with potential exports field issues
    try {
      return context.resolveRequest(context, moduleName, platform);
    } catch (error) {
      // Final fallback - return the original module name
      return context.resolveRequest(context, moduleName, platform);
    }
  };

  // Add custom serializer configuration for React 19
  config.serializer = {
    ...config.serializer,
    // Ensure proper module initialization order
    getModulesRunBeforeMainModule: () => [],
    getPolyfills: () => [
      // Add FormData polyfill for React Native
      require.resolve('react-native/Libraries/Network/FormData'),
    ],
  };

  return config;
})();
