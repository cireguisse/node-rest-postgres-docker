
const dotenv = require('dotenv');
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require('http');
const keepAliveAgent = new http.Agent({ keepAlive: true });
const config = require('./app/config/initial.config');
const app = express();

// get config vars
dotenv.config();


const db = require("./app/models");

try {
    db.sequelize.sync({force: true}).then(() => {
        console.log('Drop and Resync Db');
        config.initial();
    });
} catch (error) {
    console.error(error);
}

var corsOptions = {
  origin: "http://localhost:8081"
};
// Secure App express server
app.use(helmet.contentSecurityPolicy());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(cors(corsOptions));
app.use(morgan('combined'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server = http.createServer();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});