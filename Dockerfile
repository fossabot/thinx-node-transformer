FROM dockette/alpine:3.6

MAINTAINER Matej Sychra <suculent@me.com>

ENV RollbarToken e81ab1434d684fc68e1b2a52b33f1c1a

RUN apk update && apk upgrade && \
    apk add nodejs-current-npm curl git && \
    npm --silent install --global --depth 0 pnpm && \
    rm -rf /var/cache/apk/*

EXPOSE 7474

CMD cd /app && \
    npm install . && \
    curl https://api.rollbar.com/api/1/deploy/ -F access_token=$RollbarToken -F environment=production -F revision=$(git log -n 1 --pretty=format:\"%H\") -F local_username=root \
    node server.js >> /var/logs/transformer.log
