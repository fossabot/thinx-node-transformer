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

  const cluster = require('cluster');
  const numCPUs = require('os').cpus().length; // default number of forks

  require('getmac').getMac(function(err, macAddress) {
    if (err) {
      console.log("getmac error: " + err);
    } else {
      console.log(macAddress);
      server_mac = macAddress;
    }
  });

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    const forks = numCPUs;
    for (let i = 0; i < forks; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(8000);

    console.log(`Worker ${process.pid} started`);

    var Rollbar = require("rollbar");

    var rollbar = new Rollbar({
      accessToken: "2858ad77bbcc4b669e1f0dbd8c0b5809",
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

    console.log("Starting THiNX Transformer Server Node at "+new Date().toString());

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

      if (typeof(req.body) === "undefined") {
        respond(res, {
  	      success: false,
  	      error: "missing: body"
  	    });;
        return;
      }

      var ingress = req.body;

      try {
        ingress = JSON.parse(req.body);
      } catch (e) {
        ingress = req.body;
      }

      console.log("---");      

      var jobs = ingress.jobs;

      if (typeof(ingress.jobs) === "undefined") {
        respond(res, {
  	      success: false,
  	      error: "missing: body.jobs"
  	    });;
        return;
      }

      console.log( new Date().toString() + "Incoming job." );

      //
      // Run loop
      //

      var input_raw = jobs[0].params.status;

      var status = input_raw;
      var error = null;

      for (job_index in jobs) {

        const job = jobs[job_index];
        const code = job.code;
        const owner = job.owner;
        const transaction_id = job.id;

        console.log(new Date().toString() + " job: " + JSON.stringify(job));

        try {

          var exec = null;

          /* jshint -W061 */
          var cleancode;
          try {
            cleancode = unescape(base64.decode(code));
          } catch (e) {
            cleancode = unescape(code); // accept bare code for testing, will deprecate
          }

          console.log("Running code:\n"+cleancode);

          eval(cleancode); // expects transformer(status, device); function only; may provide API

          status = transformer(status, job.params.device); // passthrough previous status
          console.log("Docker Transformer will return status: '" + status + "'");
          /* jshint +W061 */
        } catch (e) {
          console.log("Docker Transformer Ecception: " + e);
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

  }

};

var server = new Transformer();
