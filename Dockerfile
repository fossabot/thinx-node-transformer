FROM alpine:3.8

MAINTAINER Matej Sychra <suculent@me.com>

# seems like the .env file is ignored?
ENV RollbarToken 2858ad77bbcc4b669e1f0dbd8c0b5809

# ENV VERSION=v4.9.1 NPM_VERSION=2
# ENV VERSION=v6.16.0 NPM_VERSION=3
# ENV VERSION=v8.15.0 NPM_VERSION=6 YARN_VERSION=latest
ENV VERSION=v10.15.1 NPM_VERSION=6 YARN_VERSION=latest
# ENV VERSION=v11.9.0 NPM_VERSION=6 YARN_VERSION=latest

# Sqreen.io token is inside a JSON file /app/sqreen.json
COPY / /home/node

WORKDIR /home/node/app

# For base builds
ENV CONFIG_FLAGS="--fully-static --without-npm" DEL_PKGS="libstdc++" RM_DIRS=/usr/include

RUN apk add --no-cache curl make gcc g++ python linux-headers binutils-gold gnupg libstdc++ git jq && \
  curl -sfSLO https://nodejs.org/dist/${VERSION}/node-${VERSION}.tar.xz && \
  tar -xf node-${VERSION}.tar.xz && \
  cd node-${VERSION} && \
  ./configure --prefix=/usr ${CONFIG_FLAGS} && \
  make -j$(getconf _NPROCESSORS_ONLN) && \
  make install && \
  cd / && \
  if [ -z "$CONFIG_FLAGS" ]; then \
    if [ -n "$NPM_VERSION" ]; then \
      npm install -g node-gyp npm@${NPM_VERSION}; \
    fi; \
    find /usr/lib/node_modules/npm -name test -o -name .bin -type d | xargs rm -rf; \
    if [ -n "$YARN_VERSION" ]; then \
      curl -sfSL -O https://yarnpkg.com/${YARN_VERSION}.tar.gz -O https://yarnpkg.com/${YARN_VERSION}.tar.gz.asc && \
      mkdir /usr/local/share/yarn && \
      tar -xf ${YARN_VERSION}.tar.gz -C /usr/local/share/yarn --strip 1 && \
      ln -s /usr/local/share/yarn/bin/yarn /usr/local/bin/ && \
      ln -s /usr/local/share/yarn/bin/yarnpkg /usr/local/bin/ && \
      rm ${YARN_VERSION}.tar.gz*; \
    fi; \
  fi && \
  apk del curl make gcc g++ python linux-headers binutils-gold gnupg ${DEL_PKGS} && \
  rm -rf ${RM_DIRS} /node-${VERSION}* /usr/share/man /tmp/* /var/cache/apk/* \
    /root/.npm /root/.node-gyp /root/.gnupg /usr/lib/node_modules/npm/man \
    /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html /usr/lib/node_modules/npm/scripts


# Create a user group 'thinx'
RUN addgroup -S thinx

# Create a user 'transformer' under 'thinx'
RUN adduser -S -D -h /home/node/app transformer thinx

# Chown all the files to the app user.
RUN chown -R transformer:thinx /home/node/app

# Switch to 'transformer' or 'node' user
USER transformer

RUN node --version

# Open the mapped port
EXPOSE 7474

CMD echo "Running Rollbar Deploy..." \
    && curl -s https://api.rollbar.com/api/1/deploy/ -F access_token=$RollbarToken -F environment=production -F revision=$(git log -n 1 --pretty=format:\"%H\") -F local_username=$(whoami) \
    && echo "Running App..." \
    && node --version \
    && node server.js
