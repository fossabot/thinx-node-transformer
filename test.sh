#!/bin/ash

curl -XPOST http://localhost:7474/do

curl -XPOST \
-d '{ jobs: [ { id: "transaction-identifier", owner: "owner-id", codename: "status-transformer-alias",
code: "function transformer(status, device) { return status; };", params: { status: "Battery
1.0V", device: { owner: "owner-id", id: "device-id" } } ] }' \
http://localhost:7474/do
