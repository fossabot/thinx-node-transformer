FROM dockette/alpine:3.6

MAINTAINER Matej Sychra <suculent@me.com>

# TODO: Move Rollbar token to ENV variable, this is insecure!

ENV RollbarToken 2858ad77bbcc4b669e1f0dbd8c0b5809

RUN apk update && apk upgrade && \
    apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python nodejs-current-npm curl git htop && \
    npm install --quiet node-gyp -g &&\
    npm install --global --depth 0 pnpm && \
    rm -rf /var/cache/apk/*


EXPOSE 7474

# Sqreen.io token is inside a JSON file

ADD sqreen.json /app/sqreen.json

CMD cd /app && \
    npm install . && \
    curl -s https://api.rollbar.com/api/1/deploy/ -F access_token=$RollbarToken -F environment=production -F revision=$(git log -n 1 --pretty=format:\"%H\") -F local_username=root && \
    node server.js >> /logs/transformer.log
