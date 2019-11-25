###
# Build stage
###

FROM node:12.6.0-alpine
RUN apk add --no-cache bash
RUN apk add ca-certificates

WORKDIR /app

COPY . .

ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV PORT ''

RUN npm run clean && \
    npm install && \
    npm run build

COPY . ./
COPY --from=gcr.io/berglas/berglas:latest /bin/berglas /bin/berglas

# CMD npm run serve

ENTRYPOINT exec /bin/berglas exec -- npm run serve