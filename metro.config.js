const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
    resolver: {
      extraNodeModules: {
        'react-native-maps': '@teovilla/react-native-web-maps',
      },
    },
    ...config
  };