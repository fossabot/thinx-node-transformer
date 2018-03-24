# thinx-node-transformer

Instance of NodeJS process [thinx-node-transformer](https://github.com/suculent/thinx-node-tranformer) safely enclosed inside a docker image. Takes jobs as HTTP posts and executes JavaScript code from job locally. 

See example expected code at [THiNX Wiki](https://suculent/thinx-device-api)

### Exceptionally dumb

This instance does not support anything more than bare node.js server. **Please, ase for rewuired extensions.** We'll add https support and root certificates soon, but at this point, we expect tranformer issues with TLS/SSL connections.

### No security expected

This instance must be firewalled on port 7445. Must not be accessible except on localhost, where it is expected to execute primitive JavaScript in sandbox.

### Roadmap

* Provide https
* Provide API for Slack, Influx,...

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
    code: "function transformer(status, device) { return status; };",
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

### Testing

```
curl -XPOST http://localhost:7474/do
```

```
curl -XPOST -d '{ "jobs": [{ "id": "1", "owner": "demo", "codename": "alias", "code": "function transformer(status, device) { return status; };", "params": { "status": "Battery 1.0V", "device": { "owner": "demo", "id": server_id } } ] }' http://localhost:7474/do
```
