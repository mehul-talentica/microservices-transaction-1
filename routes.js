"use strict";
const express    = require('express');
const request = require("request");
const User = require('./models/user');
const rpcUtil = require("./rpc-calls");
const logger = require('./logger');

const router = express.Router();

router.route("/").get((req, res) => {
  User
  .find({})
  .lean()
  .exec((err, users) => {
    if (err) return res.status(500).send(err.message);
    return res.status(200).send(users);
  });
});

router.route("/create").post((req, res) => {
  logger.log("Transaction 1 Microservice - In create User request");
  let reqUserObj = {
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "gender": req.body.gender,
    "email": req.body.email,
    "createdOn" : Date.now()
  };
  User.create(req.body, function (err, user) {
    if (err) return res.send(err.message);
    rpcUtil.consumeRpcResponse(function(message){
      if(message !== "Success"){
        logger.log("Transaction 1 Microservice - Retry");
        console.log("reqUserObj", message);
        rpcUtil.sendTransactionRequest(message);
      }
    });
    rpcUtil.sendTransactionRequest(JSON.stringify(reqUserObj));
    return res.send("User created. Will try to create wallet now.");
  });
});

module.exports = router;