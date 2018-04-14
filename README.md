# thinx-node-transformer

Instance of NodeJS process [thinx-node-transformer](https://github.com/suculent/thinx-node-tranformer) safely enclosed inside a docker image. Takes jobs as HTTP posts and executes JavaScript code from job locally.

See example expected code at [THiNX Wiki](https://suculent/thinx-device-api)

### Exceptionally dumb

This instance does not support anything more than bare node.js express server with https support. **Please, ask for required extensions or provide PR with usage example.**

### Security Note

This instance must be firewalled. Must not be accessible except on localhost, where it is expected to execute primitive JavaScript in sandbox. Expected to run in Docker. Supports outgoing HTTPS.

### Roadmap

* Provide API for Slack, Influx,...

### Supported Modules (Public)

_Feel free to submit proposals for adding more modules. Intention is to keep it small and safe._

`base-64` : processed JavaScript must be safely encoded when transferred

`ssl-root-cas` : https support


### Notes

Instance should accept only local HTTP requests. Make sure its port is not exposed on host machine firewall.

`docker run -d -p 7475:7474 -v $(pwd)/logs:/logs suculent/thinx-node-transformer`

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
          status: "Battery 1.0V",
          device: {
            owner: "owner-id",
            id: "device-id"
          }
        }
    }
  ]
}
```
