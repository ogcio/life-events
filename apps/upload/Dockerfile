FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/upload/package*.json /app/apps/upload/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/analytics/package*.json /app/packages/analytics/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/upload/ /app/apps/upload/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/analytics/ /app/packages/analytics/
COPY ./packages/shared-errors/ /app/packages/shared-errors/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/


FROM deps AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_LIFE_EVENTS_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_PROTOCOL
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL
ENV NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_LIFE_EVENTS_MATOMO_SITE_ID
ENV NEXT_PUBLIC_MATOMO_PROTOCOL=$NEXT_PUBLIC_MATOMO_PROTOCOL
RUN npm run build --workspace=packages/shared-errors
RUN npm run build --workspace=packages/nextjs-logging-wrapper
RUN npm run build --workspace=apps/upload

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/upload/.next/standalone ./
COPY --from=builder /app/apps/upload/.next/static ./apps/upload/.next/static
# TODO: Filter and remove whatever is not necessary for db-migrate and db-migrate-pg
COPY --from=deps /app/node_modules/ /app/node_modules/
EXPOSE 3008

ENV PORT=3008

CMD [ "node", "apps/upload/server.js" ]