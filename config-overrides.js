const webpack = require("webpack");

module.exports = {
  webpack: (config) => {
    // Override config of webpack CRA
    const overrideConfig = override(
      addPostcssPlugins([
        require("tailwindcss")("./tailwind.config.js"),
        require("autoprefixer"),
      ]),
      addWebpackAlias(nxPathAlias)
    )(config);
    return config;
  },
};

module.exports = function override(webpackConfig) {
  // Disable resolving ESM paths as fully specified.
  // See: https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
  webpackConfig.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Ignore source map warnings from node_modules.
  // See: https://github.com/facebook/create-react-app/pull/11752
  webpackConfig.ignoreWarnings = [/Failed to parse source map/];

  // Polyfill Buffer.
  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] })
  );

  // Polyfill other modules.
  webpackConfig.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    util: require.resolve("util"),
    assert: require.resolve("assert"),
    fs: false,
    process: false,
    path: false,
    zlib: false,
  };

  return webpackConfig;
};
