require('dotenv').config()
const webpack = require('webpack')

// next.config.js
module.exports = {
    webpack: (config) => {
        config.plugins.push(
            new webpack.EnvironmentPlugin(process.env)
        )
        return config
    },
    serverRuntimeConfig: {
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        databaseURL: process.env.databaseURL,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId,
        measurementId: process.env.measurementId,
    },
}

