FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messaging-api/package*.json /app/apps/messaging-api/

RUN npm ci

COPY ./apps/messaging-api/ /app/apps/messaging-api/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8002

CMD [ "npm", "--prefix", "apps/messaging-api",  "run", "dev" ]