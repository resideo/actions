FROM node:14.19.3-alpine

RUN apk add --no-cache git bash git-subtree jq python3 make g++

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]
