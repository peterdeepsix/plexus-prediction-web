const format = require('util').format;
const express = require("express");
const session = require("express-session");
const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');
const helmet = require('helmet');
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
  server.use(express.static(join(__dirname, '')));

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


  const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024 
    }
  });

  const storage = new Storage();
  const bucketname = "plexus-predictions-up";
  const bucket = storage.bucket(bucketname);

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

// Process the file upload and upload to Google Cloud Storage.
server.post('/uploadHandler', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(`https://storage.googleapis.com/${bucketname}/${blob.name}`);
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.file.buffer);
});


  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
