FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messaging-api/ /app/apps/messaging-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci 

FROM deps as builder

WORKDIR /app/packages/shared-errors/
RUN npm run build

WORKDIR /app/packages/logging-wrapper/
RUN npm run build

WORKDIR /app/packages/error-handler/
RUN npm run build

WORKDIR /app/packages/api-auth/
RUN npm run build

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=deps /app /app

EXPOSE 8002

CMD [ "node", "--import", "tsx", "apps/messaging-api/index.ts" ]