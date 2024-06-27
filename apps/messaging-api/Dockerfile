FROM base-deps as deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messaging-api/ /app/apps/messaging-api/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/logging-wrapper/ /app/packages/logging-wrapper/
COPY ./packages/error-handler/ /app/packages/error-handler/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
RUN npm ci && \
    cd /app/packages/shared-errors/ && \
    npm run build && \
    cd /app/packages/logging-wrapper/ && \
    npm run build && \
    cd /app/packages/error-handler/ && \
    npm run build



FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=deps /app /app

EXPOSE 8002

CMD [ "node", "--import", "tsx", "apps/messaging-api/index.ts" ]