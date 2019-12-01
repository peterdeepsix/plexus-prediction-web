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

const firebase = admin.initializeApp(
    {
        credential: admin.credential.cert({
            "type": "service_account",
            "project_id": "plexus-1d216",
            "private_key_id": "dbe734aae0fa2add241d4370e836ef804006d2ac",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSYzvzaSERzog8\nqd+m8v/NrwBdXNA79KaJObSTmit7dnAlr0H3aW/7QscY84y4RhW1kdeNZeA91j4u\n4iPynUgUuHS+INV7C6Cla3CqxN1XzGZ90GS5I3Lv4Fo5FEpz4p3eiLwQy61WHyHm\n5/ZhvM1vFqTYFMaE4FybOW1gEuu0DPPCNoyJtYpzKd133MOQbJZE1wROa8uWeidp\npIjePMGIHs8+NhHoPCEIXGGXA2o6AGHVosRhivG8fiS0z8QIBOovBlPFZ3G7Fr2k\nfn5TIcW/QWbYaYJbjqi/sfnOs6z8QvAWMMx0uFcLoE9zcV0vxpri3WstpRZf20LZ\nCBTT8BTfAgMBAAECggEANkTErRf8IMS+na9P8peR5nNyy6JqUFzeLF2HN9+3waQe\nb4oSoQhAi3aBNu1z6gCiDvDswht6SVkfNya8ERQDCN0/t99uUcwBB0p8iIA5fDFM\nar27jYoYVsnvW/Pg9J2LDWEF6esv7hwfuZkyE6oI79POd7J8NsBNAvlAPl0DEbEh\ntfedZdljWJtG64hiIsebdvK4ip/vgEj+sYEzymGKtEvK3BqELvtf70YB4Cm3QK96\nu5s+pGYW766Rb49Eb4hkk2JQF4balIotg0dqVSlmzUqsjNn3AVOlI0KkKWQWKRoC\nZaSbxs3G2USoJQBEOdq7rs4JmHGanbfE6jmixZF5YQKBgQD0urC6zTL87piGE0U9\n4BiI1kVhMLWS/JD7SkGc56Xf4CpWukTShDumHyv6Rc0rzNS8wAWIalt0WF37bbNP\nDKrRAehbCsiXIj0zO2we00d3m1/eDo9De3PYb8K5l9U8nkjzIVPXHinNDSsiuvGL\njimMRy1usSVKS4coBKmiz+Y0UQKBgQDcE6mwRwfESrH3sHDZ0sS3TX4nwJZnHlkR\nT6ZxIDqUsxPvvcje7zjn51PKo/oeObOz0VUtje1t072HubyF9e7lbzhMgUXqMFk2\n22vJLUOwZT+Ad36hQgrvtL9zpBhHT3ONWsNnrhe6ks94BORKzq5XvixeVgRFa0Lg\niuJza8haLwKBgQDm8j7RKdASLL8213yiVZYRm9NBUownN71BxuOARIKecJbD3WgR\nGcSIkiYYOkLSMKwZq0QNZgEEHFgka3OpB5UzRA+Xyudc6GzEqjDwLgXlc3TWwvqj\nfh7mgyFJr2UFnYHOHwdVnBtqbCDm13AWeIPw40KWkQlVwUy8kRnckUD24QKBgGHc\nRHpkO2nnpRd019mkRWEVDmHy225jKkvuVR68rA/vSZAznhyz12QXk0TqgY/rLKNr\nFCs7jzZlD0RJLTGMWHyhZjFu0n3+nc0s6NL+U7kebIxdlmtyiJZqky+C6mDbTZCv\nqXBzE44dNjAyTKmPGiteHzCboy6TMZvTZjrY1LB1AoGAAWDew2EXZXdboY5jO56U\ncX+PQQbcUxO5wOanA1tghLdVX+ri2bmPTatnNbk7z4YtC+2GxSDVwqkwwhrRyiMt\nKoQVZP7VpbQ/JKajq/HNP/B327KNahgCKFgSLCVgbe6kLd+gIaxx3PUS0fqFJWrf\n/URYTUZy/2PleJxaYTPGF6w=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-vptjl@plexus-1d216.iam.gserviceaccount.com",
            "client_id": "106829195479524158263",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vptjl%40plexus-1d216.iam.gserviceaccount.com"
        }
        ),
    },
    'server'
)

app.prepare().then(() => {
    const server = express()

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