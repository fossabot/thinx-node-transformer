FROM dockette/alpine:3.6

MAINTAINER Matej Sychra <suculent@me.com>

RUN apk update && apk upgrade && \
    apk add nodejs-current-npm git && \
    npm --silent install --global --depth 0 pnpm && \
    rm -rf /var/cache/apk/*

EXPOSE 7474

CMD cd /app && \
    npm install . && \
    node server.js >> /logs/transformer.log
