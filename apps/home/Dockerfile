FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/home/package*.json /app/apps/home/
COPY ./packages/analytics/package*.json /app/packages/analytics/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/shared-errors/package*.json /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/home/ /app/apps/home/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/analytics/ /app/packages/analytics/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/

FROM deps AS builder
WORKDIR /app

ARG NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_BUILDING_BLOCKS_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_PROTOCOL
ARG NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE
ARG NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_FORMS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_DESIGN_SYSTEM_SERVICE_ENTRY_POINT

ENV NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL
ENV NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_BUILDING_BLOCKS_MATOMO_SITE_ID
ENV NEXT_PUBLIC_MATOMO_PROTOCOL=$NEXT_PUBLIC_MATOMO_PROTOCOL
ENV NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE=$NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE
ENV NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_FORMS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_FORMS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_DESIGN_SYSTEM_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_DESIGN_SYSTEM_SERVICE_ENTRY_POINT
ENV NODE_ENV=production
ENV LOG_LEVEL=trace

RUN npm run build --workspace=packages/shared-errors
RUN npm run build --workspace=packages/nextjs-logging-wrapper
RUN npm run build --workspace=apps/home

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/home/.next/standalone ./
COPY --from=builder /app/apps/home/.next/static ./apps/home/.next/static
COPY --from=deps /app/node_modules/ /app/node_modules/

EXPOSE 3004

ENV PORT=3004

CMD [ "node", "apps/home/server.js" ]
