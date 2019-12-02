require('dotenv').config()
const webpack = require('webpack')

const private_key = `-----BEGIN PRIVATE KEY-----\n${process.env.private_key}\n-----END PRIVATE KEY-----\n`

// next.config.js
module.exports = {
    webpack: (config) => {
        config.plugins.push(
            new webpack.EnvironmentPlugin(process.env)
        )
        return config
    },
    serverRuntimeConfig: {
        type: process.env.type,
        project_id: process.env.project_id,
        private_key_id: process.env.private_key_id,
        private_key: private_key,
        // private_key: process.env.private_key.replace(/\\n/g, '\n'),
        client_email: process.env.client_email,
        client_id: process.env.client_id,
        auth_uri: process.env.auth_uri,
        token_uri: process.env.token_uri,
        auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
        client_x509_cert_url: process.env.client_x509_cert_url,
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

