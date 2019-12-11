const withOffline = require("next-offline");

require("dotenv").config();
const webpack = require("webpack");

nextConfig = {
  webpack: config => {
    config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    return config;
  },
  serverRuntimeConfig: {
    // type: process.env.type,
    // project_id: process.env.project_id
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    // apiKey: process.env.apiKey,
    // authDomain: process.env.authDomain
  }
};

module.exports = withOffline(nextConfig);
