// express
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

const https = require("https")
const fs = require("fs");

const { uuid } = require('uuidv4');
var mime = require('mime-types')

// http2 server
const compression = require('compression')
const spdy = require('spdy')

// init port form env vars
const port = parseInt(process.env.PORT, 10) || 3000;

// check for dev environment
const dev = process.env.NODE_ENV !== "production";

// init nextjs app
const app = next({ dev });

// init nextjs app req handler
const handle = app.getRequestHandler();

// setup multer for multipart file upload
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 
  }
});

// setup gcp storage
const storage = new Storage();
const bucketname = "plexus-predictions-up";
const bucket = storage.bucket(bucketname);


// cert for local web dev via http2
const options  = {
  key: fs.readFileSync(join(__dirname, '/privateKey.key')),
  cert: fs.readFileSync(join(__dirname, '/certificate.crt'))
}

// setup compression for http2
const shouldCompress = (req, res) => {
  // don't compress responses asking explicitly not
  if (req.headers['x-no-compression']) {
    return false
  }

  // use compression filter function
  return compression.filter(req, res)
}

//nextjs prepare app
app.prepare().then(() => {

  // init express
  const expressApp = express();

  // set up compression in express
  expressApp.use(compression({ filter: shouldCompress }))

  //init firebase
  const firebase = admin.initializeApp(
    {
      credential: admin.credential.cert(require("./credentials/server"))
    },
    "server"
  );

  // use cors lib
  expressApp.use(cors());

  //parse request body
  expressApp.use(bodyParser.json());

  // static server for service worker
  expressApp.use(express.static(join(__dirname, '')));

  //firebase filestore sesssion middleware
  expressApp.use(
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

  //firebase instance middleware
  expressApp.use((req, res, next) => {
    req.firebaseServer = firebase;
    next();
  });

  // service worker static route
  expressApp.post("/service-worker.js", (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    const filePath = join(__dirname, ".next", pathname);
    app.serveStatic(req, res, filePath);
  });

  // login route
  expressApp.post("/api/login", (req, res) => {
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

  // logout route
  expressApp.post("/api/logout", (req, res) => {
    req.session.decodedToken = null;
    res.json({ status: true });
  });

  // multer file upload to google cloud
  expressApp.post('/uploadHandler', multer.single('file'), (req, res, next) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    // create a new blob in the bucket and upload the file data.
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

  // upload video stream wo9ah
  expressApp.post('/upload', multer.single('image'), (req, res, next) => {
    const type = mime.lookup(req.file.originalname);

    const bucket = storage.bucket(config.google.bucket);
    const blob = bucket.file(`${uuid()}.${mime.extensions[type][0]}`);

    const stream = blob.createWriteStream({
      resumable: true,
      contentType: type,
      predefinedAcl: 'publicRead',
    });

    stream.on('error', err => {
      next(err);
    });

    stream.on('finish', () => {
      res.status(200).json({
        data: {
          url: `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
        },
      });
    });

    stream.end(req.file.buffer);
  });

  // declaring routes for pages
  expressApp.get('/', (req, res) => {
    return app.render(req, res, '/', req.query)
  })
  expressApp.get('/record', (req, res) => {
    return app.render(req, res, '/record', req.query)
  })
  expressApp.get('/predict', (req, res) => {
    return app.render(req, res, '/predict', req.query)
  })

  // fallback route and send to nextjs req handler
  expressApp.all("*", (req, res) => {
    return handle(req, res);
  });

   // start the HTTP/2 server with express
   spdy.createServer(options, expressApp).listen(port, error => {
    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log(`HTTP/2 server listening on port:${port} Ready at http://localhost:${port}`)
    }
  })

});
