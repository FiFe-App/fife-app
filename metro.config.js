const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("cjs");
//defaultConfig.resolver.assetExts.push("module:react-native-dotenv");

module.exports = defaultConfig;