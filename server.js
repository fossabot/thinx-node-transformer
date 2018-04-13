var Transformer = function() {

  var express = require("express");
  var session = require("express-session");
  var http = require('http');
  var https = require("https"); require('ssl-root-cas').inject();
	https.globalAgent.options.ca = require('ssl-root-cas');
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

  var Rollbar = require("rollbar");

  var rollbar = new Rollbar({
    accessToken: "5505bac5dc6c4542ba3bd947a150cb55",
    handleUncaughtExceptions: true,
    handleUnhandledRejections: true
  });

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

    //
    // Input validation
    //
    //
    console.log("body: "+JSON.stringify(req.body));

    if (typeof(req.body) === "undefined") {
      respond(res, {
	      success: false,
	      error: "missing: body"
	    });;
      return;
    }

    if (typeof(req.body.jobs) === "undefined") {
      respond(res, {
	      success: false,
	      error: "missing: body.jobs"
	    });;
      return;
    }

    var jobs = req.body.jobs;

    //
    // Run loop
    //

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

        var exec = null;

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

        status = transformer(status, job.params.device); // passthrough previous status
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
