# thinx-node-transformer

Instance of NodeJS process [thinx-node-transformer](https://github.com/suculent/thinx-node-tranformer) safely enclosed inside a docker image. Takes jobs as HTTP posts and executes JavaScript code from job locally.

**Before first run**

1. Register at Sqreen.io and add token to ```/app/sqreen.json```
2. Register at Rollbar.io and add your RollbarToken=<your-token> to ```.env``` file

See example expected code at [THiNX Wiki](https://suculent/thinx-device-api)

### Exceptionally dumb

This instance does not support anything more than bare node.js express server with https support. **Please, ask for required extensions or provide PR with usage example.**

### Security Note

First of all, generate your own Rollbar token, or remove the Rollbar implementation. Otherwise the project usage and errors will be tracked by us.

This instance must be firewalled. Must not be accessible except on localhost, where it is expected to execute primitive JavaScript in sandbox. Expected to run in Docker. Supports outgoing HTTPS.

### Roadmap

* Provide API for Slack, Influx,...

### Supported Modules (Public)

_Feel free to submit proposals for adding more modules. Intention is to keep it small and safe._

`base-64` : processed JavaScript must be safely encoded when transferred

`ssl-root-cas` : https support


### Notes

Instance should accept only local HTTP requests. Make sure neither port 7475 nor 7474 is exposed on host machine firewall.

`docker run --user=transformer -d -p 7475:7474 -v /var/logs:/logs -v /$(pwd):/app suculent/thinx-node-transformer`

### Building the container

`docker build -t suculent/thinx-node-transformer .`


## Job Request Format

HTTP POST BODY:

```
{
  jobs: [
    {
        id: "transaction-identifier",
        owner: "owner-id",
        codename: "status-transformer-alias",
        code: base64.encode("function transformer(status, device) { return status; };"),
        params: {
          status: "Battery 100.0V",
          device: {
            owner: "owner-id",
            id: "device-id"
          }
        }
    }
  ]
}
```
