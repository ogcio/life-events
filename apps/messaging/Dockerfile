FROM base-deps as deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/messaging/package*.json /app/apps/messaging/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/package*.json /app/packages/shared-components/

RUN npm ci

COPY ./apps/messaging/ /app/apps/messaging/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/ /app/packages/shared-components/

FROM deps AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
RUN npm run build --workspace=apps/messaging

FROM base-deps as runner

WORKDIR /app

ARG NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE

ARG LOGTO_ENDPOINT
ARG LOGTO_COOKIE_SECRET
ARG LOGTO_MESSAGING_APP_ID
ARG LOGTO_MESSAGING_APP_SECRET

ENV LOGTO_ENDPOINT=$LOGTO_ENDPOINT
ENV LOGTO_COOKIE_SECRET=$LOGTO_COOKIE_SECRET
ENV LOGTO_MESSAGING_APP_ID=$LOGTO_MESSAGING_APP_ID
ENV LOGTO_MESSAGING_APP_SECRET=$LOGTO_MESSAGING_APP_SECRET

ENV NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE=$NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/messaging/.next/standalone ./
COPY --from=builder /app/apps/messaging/.next/static ./apps/messaging/.next/static

COPY --from=deps /app/node_modules/ /app/node_modules/
COPY --from=deps /app/packages/messages/database.json /app/packages/messages/
COPY --from=deps /app/packages/messages/migrations /app/packages/messages/migrations

EXPOSE 3002
ENV PORT 3002

CMD [ "node", "apps/messaging/server.js" ]