FROM node:14.19.3-alpine

RUN apk add --no-cache git bash git-subtree tree jq

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]
