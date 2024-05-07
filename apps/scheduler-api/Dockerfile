FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/scheduler-api/package*.json /app/apps/scheduler-api/

RUN npm ci

COPY ./apps/scheduler-api/ /app/apps/scheduler-api/

FROM deps AS builder
WORKDIR /app

RUN apk add curl

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8004

CMD [ "npm", "--prefix", "apps/scheduler-api",  "run", "dev" ]