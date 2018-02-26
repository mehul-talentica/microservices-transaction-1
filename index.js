"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose   = require('mongoose');
const routes = require("./routes");
const logger = require('./logger');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/transaction-1-db'); // connect to our database

const SERVER_PORT = process.env.SERVER_PORT || 8081;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'Why the heck do I need a secret key here.',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000}
  })
);
app.use("/api/v1/users", routes);

app.listen(SERVER_PORT, () => {
    logger.log("Transaction 1 micro service started listening on port"+ SERVER_PORT);
});
