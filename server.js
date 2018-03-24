var Transformer = function() {

  var express = require("express");
  var session = require("express-session");
  var http = require('http');
  var parser = require("body-parser");
  var typeOf = require("typeof");
  var base64 = require("base-64");

  const uuidv1 = require('uuid/v1');
  const server_id = uuidv1();
  var server_mac = null;

  require('getmac').getMac(function(err, macAddress) {
    if (err) {
      console.log("getmac error: " + err);
    } else {
      console.log(macAddress);
      server_mac = macAddress;
    }
  });

  /*
  var Rollbar = require("rollbar");
  var rollbar = new Rollbar({
    accessToken: config.rollbar.server_token,
    handleUncaughtExceptions: true,
    handleUnhandledRejections: true,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: "production"
    }
  });
  */

  function respond(res, object) {
    if (typeOf(object) == "buffer") {
      res.header("Content-Type", "application/octet-stream");
      res.send(object);
    } else if (typeOf(object) == "string") {
      res.end(object);
    } else {
      res.end(JSON.stringify(object));
    }
  }

  console.log("Starting THiNX Transformer Server Node");

  var app = express();

  app.use(parser.json({
    limit: "1mb"
  }));

  app.use(parser.urlencoded({
    extended: true,
    parameterLimit: 1000,
    limit: "1mb"
  }));

  const http_port = 7474;

  http.createServer(app).listen(http_port);

  console.log("Started on port: " + http_port);

  app.all("/*", function(req, res, next) {

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Access-Token,X-Key");

    if (req.method == "OPTIONS") {
      res.status(200).end();
    } else {
      next();
    }
  });

  //
  // Handlers
  //

  app.post("/do", function(req, res) {

    var job;

    if (typeof(req.body) === "undefined") {
      console.log("POST /do: no body.");
      //return;
    } else {
      job = req.body.job;
      console.log("POST /do.");
    }

    if (typeof(job) === "undefined") {
      console.log("ERR: NO JOB");

        jobs = [{
        id: server_id,
        owner: "demo",
        codename: "alias",
        code: base64.encode("function transformer(status, device) { return status; };"),
        params: {
          status: "Battery 1.0V",
          device: {
            owner: "demo",
            id: server_id
          }
        }
      }];
    } else {
      jobs = req.body.jobs;
    }

    console.log("Running jobs: " + JSON.stringify(jobs));

    var input_raw = jobs[0].params.status;
    console.log("Input: " + input_raw);

    var status = input_raw;
    var error = null;

    for (job_index in jobs) {

      const job = jobs[job_index];

      const code = job.code;
      const owner = job.owner;
      const transaction_id = job.id;

      try {
        /* jshint -W061 */
        var cleancode;
        try {
          cleancode = unescape(base64.decode(code));
        } catch (e) {
          cleancode = unescape(code); // accept bare code for testing, will deprecate
        }

        console.log("Evaluating code: "+cleancode);

        eval(cleancode); // expects transformer(status, device); function only; may provide API

        console.log("Running job:");
        console.log("- codename: "+job.codename);
        console.log("- id: "+job.id);
        console.log("- params: "+JSON.stringify(job.params));
        console.log("- owner: "+JSON.stringify(job.owner));

        status = transformer(job.params.status, job.params.device); // may be dangerous if not running in closure with cleaned globals!
        console.log("Transformed status: '" + status + "'");
        /* jshint +W061 */
      } catch (e) {
        console.log(e);
        error = JSON.stringify(e);
      }
    }

    respond(res, {
      input: input_raw,
      output: status,
      error: error
    });

  });

  /* Credits handler, returns current credits from user info */
  app.get("/id", function(req, res) {
    respond(res, {
      id: server_id,
      mac: server_mac
    });
  });

};

var server = new Transformer();
