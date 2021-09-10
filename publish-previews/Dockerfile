FROM node:12.18.4-alpine

RUN apk add --no-cache git bash git-subtree jq python make g++

RUN apk del yarn

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]
