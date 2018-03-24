FROM dockette/alpine:3.6

MAINTAINER Matej Sychra <suculent@me.com>

RUN apk update && apk upgrade && \
    apk add nodejs-current-npm git && \
    npm --silent install --global --depth 0 pnpm && \
    rm -rf /var/cache/apk/*

RUN git clone https://github.com/suculent/thinx-node-transformer && \
    ls -la && \
    cd ./thinx-node-transformer && \
    npm install . &&

EXPOSE 7444

CMD ls -la && \
    cd /thinx-node-transformer && \
    node server.js
