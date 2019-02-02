ode:10-alpine

MAINTAINER Matej Sychra <suculent@me.com>

# seems like the .env file is ignored?
ENV Revision
ENV RollbarToken 2858ad77bbcc4b669e1f0dbd8c0b5809

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python curl git jq \
    && npm --silent install --global --depth 0 pnpm

# allow building native extensions with alpine: https://github.com/nodejs/docker-node/issues/384
RUN npm --silent install --quiet node-gyp -g

# Sqreen.io token is inside a JSON file /app/sqreen.json
COPY / /home/node

WORKDIR /home/node/app

# Running npm install for production purpose will not run dev dependencies.
RUN npm install -only=production

# Create a user group 'thinx'
RUN addgroup -S thinx

# Create a user 'transformer' under 'thinx'
RUN adduser -S -D -h /home/node/app transformer thinx

# Chown all the files to the app user.
RUN chown -R node:node /home/node/app

# Switch to 'transformer' or 'node' user
USER transformer

# Open the mapped port
EXPOSE 7474

CMD echo "Running Rollbar Deploy..." \
    && curl -s https://api.rollbar.com/api/1/deploy/ -F access_token=$RollbarToken -F environment=production -F revision=$(git log -n 1 --pretty=format:\"%H\") -F local_username=$(whoami) \
    && echo "Running App..." \
    && node server.js


