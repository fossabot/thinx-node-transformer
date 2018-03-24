# thinx-node-transformer

Instance of Status Transformer NodeJS processor [thinx-node-transformer](https://github.com/suculent/thinx-node-tranformer) safely enclosed inside a docker image, so the app can run safely as root.

### Notes

Instance should accept only local HTTP requests. Make sure its port is not exposed on host machine firewall.

```

`docker run suculent/thinx-node-transformer`

### Building the container

`docker build -t suculent/thinx-node-transformer .`


### Testing

```
curl -XPOST http://localhost:7444/do
```

```
curl -XPOST -d '{ "job": { "id": "1", "owner": "demo", "codename": "alias", "code": "function transformer(status, device) { return status; };", "params": { "status": "Battery 1.0V", "device": { "owner": "demo", "id": server_id } } }' http://localhost:7444/do
```
