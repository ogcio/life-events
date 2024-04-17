FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messages-api/package*.json /app/apps/messages-api/

RUN npm ci

COPY ./apps/messages-api/ /app/apps/messages-api/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8001

CMD [ "npm", "--prefix", "apps/messages-api",  "run", "dev" ]