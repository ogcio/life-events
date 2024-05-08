FROM base-deps as deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/messaging/package*.json /app/apps/messaging/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/

RUN npm ci

COPY ./apps/messaging/ /app/apps/messaging/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/

FROM deps AS builder
WORKDIR /app

RUN npm run build --workspace=auth

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=apps/messaging

from base-deps as runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/messaging/.next/standalone ./
COPY --from=builder /app/apps/messaging/.next/static ./apps/messaging/.next/static

EXPOSE 3002

CMD [ "node", "apps/messaging/server.js" ]