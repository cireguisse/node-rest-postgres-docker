'use strict';
require('dotenv').config({path: './.env'});
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const keepAliveAgent = new http.Agent({ keepAlive: true });
const config = require('./app/config/initial.config');
const app = express();
const secret =require('./app/config/auth.config').secret;

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
//add security app
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl({ allow: true}));
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
    maxAge: 123456,
    includeSubDomains: false,
    preload: true
}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// parse requests of content-type = application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy


app.use(cors(corsOptions));
app.use(morgan('combined'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// routes
require('./app/routes/auth.routes')(app);
//require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
const server = http.createServer();


const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl','certs/ca.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl','certs/ca.crt'))
};

https.createServer(options, app).listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}.`);

});