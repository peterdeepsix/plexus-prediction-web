const express = require('express')
const session = require('express-session')
const cors = require('cors');
const bodyParser = require('body-parser')
const FileStore = require('session-file-store')(session)
const next = require('next')
const admin = require('firebase-admin')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()
    const { serverRuntimeConfig, publicRuntimeConfig } = require('next/config').default();
    console.log(serverRuntimeConfig)
    console.log(publicRuntimeConfig)
    const { type, project_id, private_key_id, private_key, client_email, client_id, auth_uri, token_uri, auth_provider_x509_cert_url, client_x509_cert_url } = serverRuntimeConfig
    const firebase = admin.initializeApp(
        {
            credential: admin.credential.cert({
                "type": type,
                "project_id": project_id,
                "private_key_id": private_key_id,
                "private_key": private_key,
                "client_email": client_email,
                "client_id": client_id,
                "auth_uri": auth_uri,
                "token_uri": token_uri,
                "auth_provider_x509_cert_url": auth_provider_x509_cert_url,
                "client_x509_cert_url": client_x509_cert_url
            }
            ),
        },
        'server'
    )

    server.use(cors());
    server.use(bodyParser.json())

    server.use(
        session({
            secret: 'geheimnis',
            saveUninitialized: true,
            store: new FileStore({ secret: 'geheimnis' }),
            resave: false,
            rolling: true,
            httpOnly: true,
            cookie: { maxAge: 604800000 }, // week
        })
    )

    server.use((req, res, next) => {
        req.firebaseServer = firebase
        next()
    })

    server.post('/api/login', (req, res) => {
        if (!req.body) return res.sendStatus(400)

        const token = req.body.token
        firebase
            .auth()
            .verifyIdToken(token)
            .then(decodedToken => {
                req.session.decodedToken = decodedToken
                return decodedToken
            })
            .then(decodedToken => res.json({ status: true, decodedToken }))
            .catch(error => res.json({ error }))
    })

    server.post('/api/logout', (req, res) => {
        req.session.decodedToken = null
        res.json({ status: true })
    })

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, err => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})