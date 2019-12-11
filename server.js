const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const FileStore = require("session-file-store")(session);
const next = require("next");
const admin = require("firebase-admin");

const { join } = require("path");
const { parse } = require("url");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  //   const {
  //     serverRuntimeConfig,
  //     publicRuntimeConfig
  //   } = require("next/config").default();
  //   const {
  //     type,
  //     project_id
  //   } = serverRuntimeConfig;
  const firebase = admin.initializeApp(
    {
      credential: admin.credential.cert(require("./credentials/server"))
    },
    "server"
  );

  server.use(cors());
  server.use(bodyParser.json());

  server.use(
    session({
      secret: "geheimnis",
      saveUninitialized: true,
      store: new FileStore({ secret: "geheimnis" }),
      resave: false,
      rolling: true,
      httpOnly: true,
      cookie: { maxAge: 604800000 } // week
    })
  );

  server.use((req, res, next) => {
    req.firebaseServer = firebase;
    next();
  });

  server.post("/service-worker.js", (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    const filePath = join(__dirname, ".next", pathname);
    app.serveStatic(req, res, filePath);
  });

  server.post("/api/login", (req, res) => {
    if (!req.body) return res.sendStatus(400);

    const token = req.body.token;
    firebase
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        req.session.decodedToken = decodedToken;
        return decodedToken;
      })
      .then(decodedToken => res.json({ status: true, decodedToken }))
      .catch(error => res.json({ error }));
  });

  server.post("/api/logout", (req, res) => {
    req.session.decodedToken = null;
    res.json({ status: true });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
