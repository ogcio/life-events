FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/scheduler-api/package*.json /app/apps/scheduler-api/
COPY ./packages/scheduler/ /app/packages/scheduler/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
RUN npm ci

COPY ./apps/scheduler-api/ /app/apps/scheduler-api/

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

EXPOSE 8005

CMD [ "npm", "--prefix", "apps/scheduler-api",  "run", "dev" ]