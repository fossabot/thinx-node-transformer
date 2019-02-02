FROM node:10-alpine

MAINTAINER Matej Sychra <suculent@me.com>

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python add curl git \
    && npm --silent install --global --depth 0 pnpm

# Sqreen.io token is inside a JSON file /app/sqreen.json
COPY /app /home/node/app

WORKDIR /home/node/app

# allow building native extensions with alpine: https://github.com/nodejs/docker-node/issues/384
RUN npm install --quiet node-gyp -g

# Running npm install for production purpose will not run dev dependencies.
RUN npm install -only=production

# Create a user group 'thinx'
RUN addgroup -S thinx

# Create a user 'transformer' under 'thinx'
RUN adduser -S -D -h /home/node/app transformer thinx

# Chown all the files to the app user.
RUN chown -R node:node /home/node/app

# Switch to 'transformer' or 'node' user
USER node

# Open the mapped port
EXPOSE 7474

CMD pwd && npm audit fix \
    && curl -s https://api.rollbar.com/api/1/deploy/ -F access_token=$RollbarToken -F environment=production -F revision=$(git log -n 1 --pretty=format:\"%H\") -F local_username=$(whoami) \
    && node server.js >> /logs/transformer.log
