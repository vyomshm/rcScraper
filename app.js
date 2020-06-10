'use strict';

const express = require("express");
const awsServerlessExpress = require("aws-serverless-express");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");


const { generateResBody, generateJsonBody } = require("./helpers/utils");
const { scrapRc } = require('./helpers/rcDetailsParser');

const SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OK = 200;

// init express
const app = express();

const corsOptions = {
  origin: "*",
  credentials: true
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", async function (req, res) {
  return res.send(generateResBody(OK, "Rc vaahan Api is working"));
});

app.post("/verify-rc", async (req, res) => {
  try {
    const {
      plate
    } = req.body;

    if(!license) {
      return res.send(generateResBody(OK, "Invalid Request: No number plate"));
    }

    console.log(plate);

    let rcData = await scrapRc(plate);

    return res.send(generateJsonBody(OK, rcData));
  } catch(e) {
    console.log(e);
    return res.send(generateResBody(SERVER_ERROR, 'Error finding rc details'));
  }
});

const server = awsServerlessExpress.createServer(app);
module.exports.server = (event, context) => awsServerlessExpress.proxy(server, event, context);
