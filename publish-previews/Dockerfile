FROM ceresacr.azurecr.io/nodejs14:14.19.1

RUN apk add --no-cache git bash git-subtree jq python make g++

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "/entrypoint.sh"]
