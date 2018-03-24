# thinx-node-transformer

Instance of Status Transformer NodeJS processor [thinx-node-transformer](https://github.com/suculent/thinx-node-tranformer) safely enclosed inside a docker image, so the app can run safely as root.

### Roadmap

* Provide API for Slack, Influx,...

### Supported Modules (Public)

_Feel free to submit proposals for adding more modules. Intention is to keep it small and safe._

`base-64` : processed JavaScript must be safely encoded when transferred
`ssl-root-cas` : https support


### Notes

Instance should accept only local HTTP requests. Make sure its port is not exposed on host machine firewall.

`docker run suculent/thinx-node-transformer`

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
  ]
}
```
