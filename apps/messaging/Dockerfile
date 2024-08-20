FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/messaging/package*.json /app/apps/messaging/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/package*.json /app/packages/shared-components/
COPY ./packages/shared-errors/package*.json /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/messaging/ /app/apps/messaging/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/ /app/packages/shared-components/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/

FROM deps AS builder
WORKDIR /app

ARG NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE

ENV NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE=$NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=packages/shared-errors && \
    npm run build --workspace=packages/nextjs-logging-wrapper && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/messaging

FROM base-deps AS assembler

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/messaging/.next/standalone ./
COPY --from=builder /app/apps/messaging/.next/static ./apps/messaging/.next/static
COPY --from=deps /app/node_modules/ /app/node_modules/
COPY --from=deps /app/packages/messages/database.json /app/packages/messages/
COPY --from=deps /app/packages/messages/migrations /app/packages/messages/migrations

RUN npm prune --omit=dev

FROM base-deps AS runner
WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=assembler /app /app

EXPOSE 3002
ENV PORT=3002

CMD [ "node", "apps/messaging/server.js" ]